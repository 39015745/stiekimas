import { Router } from "express";
import mongoose, { type QueryFilter } from "mongoose";

import type { Request, Response } from "express";
import { Employee, type EmployeeDb } from "../models/employee.model.js";
import type { EmployeeDetails, EmployeeListItem, EmployeeListResponse } from "@stiekimas/schema";

import { requireAdmin } from "../middleware/require-admin.js";
import { createEmployeeSchema, employeeListQuerySchema, updateEmployeeSchema } from "@stiekimas/schema";
import { User } from "../models/user.model.js";
import { isMongoDuplicateKeyError } from "../lib/mongoose-errors.js";

export const employeeRouter = Router();

type EmployeeUpdateData = Pick<EmployeeDb, "firstName" | "lastName" | "email" | "address" | "personalCode" | "dateOfBirth" | "bankAccountNumber" | "updatedBy"> &
	Partial<Pick<EmployeeDb, "position" | "basicSalary">>;

type ErrorResponse = {
	message: string;
	errors?: {
		field: string;
		message: string;
	}[];
};

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/employees
employeeRouter.get("/", requireAdmin, async (req: Request, res: Response<EmployeeListResponse | ErrorResponse>) => {
	const validationResult = employeeListQuerySchema.safeParse(req.query);

	if (!validationResult.success) {
		return res.status(400).json({
			message: "Neteisingi lentelės parametrai",
			errors: validationResult.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		});
	}

	const { page, pageSize, sortBy, sortOrder, filters } = validationResult.data;

	const sortDirection: 1 | -1 = sortOrder === "desc" ? -1 : 1;

	const query: QueryFilter<EmployeeDb> = {};

	for (const { column, value } of filters) {
		const regex = new RegExp(escapeRegExp(value), "i");

		switch (column) {
			case "firstName":
				query.firstName = regex;
				break;
			case "lastName":
				query.lastName = regex;
				break;
			case "email":
				query.email = regex;
				break;
			case "position":
				query.position = regex;
				break;
		}
	}

	try {
		const [items, totalCount] = await Promise.all([
			Employee.find(query)
				.sort({ [sortBy]: sortDirection })
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.lean(),

			Employee.countDocuments(query),
		]);

		const employeeList: EmployeeListItem[] = items.map((employee) => ({
			id: employee._id.toString(),
			firstName: employee.firstName,
			lastName: employee.lastName,
			email: employee.email,
			position: employee.position,
		}));

		return res.json({
			items: employeeList,
			totalCount,
			page,
			pageSize,
			pageCount: Math.ceil(totalCount / pageSize),
		});
	} catch (error) {
		console.error("Failed to fetch employees:", error);

		return res.status(500).json({
			message: "Vidinė serverio klaida",
		});
	}
});

// GET /api/employees/:id | Get employee details |
employeeRouter.get("/:id", async (req: Request, res: Response) => {
	try {
		const requestedId = req.params.id;
		const currentUser = req.user;

		if (typeof requestedId !== "string" || !mongoose.Types.ObjectId.isValid(requestedId)) {
			return res.status(400).json({
				message: "Neteisingas ID formatas",
			});
		}

		if (currentUser.role !== "admin" && currentUser.employeeId !== requestedId) {
			return res.status(403).json({
				message: "Prieiga draudžiama",
			});
		}

		const [employee, user] = await Promise.all([
			Employee.findById(requestedId).select("+personalCode +bankAccountNumber +basicSalary").lean(),
			User.findOne({ employeeId: requestedId }).select("username role").lean(),
		]);

		if (!employee) {
			return res.status(404).json({
				message: "Darbuotojas nerastas",
			});
		}

		const response = {
			id: employee._id.toString(),
			firstName: employee.firstName,
			lastName: employee.lastName,
			email: employee.email,
			address: employee.address,
			position: employee.position,
			personalCode: employee.personalCode,
			dateOfBirth: employee.dateOfBirth,
			bankAccountNumber: employee.bankAccountNumber,
			basicSalary: employee.basicSalary,
			login: user ? { username: user.username, role: user.role } : null,
			createdAt: employee.createdAt.toISOString(),
			updatedAt: employee.updatedAt.toISOString(),
		} satisfies EmployeeDetails;

		return res.json(response);
	} catch (error) {
		console.error("Failed to fetch employee:", error);

		return res.status(500).json({
			message: "Vidinė serverio klaida",
		});
	}
});

// POST /api/employees | create employee |
employeeRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
	const validationResult = await createEmployeeSchema.safeParseAsync(req.body);

	if (!validationResult.success) {
		return res.status(400).json({
			message: "Validacijos klaida",
			errors: validationResult.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		});
	}

	const currentUserId = req.user.id;

	try {
		const employee = await Employee.create({
			...validationResult.data,
			createdBy: currentUserId,
			updatedBy: currentUserId,
		});

		return res.status(201).json({
			id: employee._id.toString(),
		});
	} catch (error) {
		if (isMongoDuplicateKeyError(error)) {
			return res.status(409).json({
				message: "Darbuotojas su tokiu el. paštu jau egzistuoja",
			});
		}

		console.error("Failed to create employee:", error);

		return res.status(500).json({
			message: "Vidinė serverio klaida",
		});
	}
});

// PUT /api/employees/:id | Update employee details |
employeeRouter.put("/:id", async (req: Request, res: Response) => {
	const requestedId = req.params.id;
	const currentUser = req.user;

	if (typeof requestedId !== "string" || !mongoose.Types.ObjectId.isValid(requestedId)) {
		return res.status(400).json({
			message: "Neteisingas ID formatas",
		});
	}

	if (currentUser.role !== "admin" && currentUser.employeeId !== requestedId) {
		return res.status(403).json({
			message: "Prieiga draudžiama",
		});
	}

	const validationResult = await updateEmployeeSchema.safeParseAsync(req.body);

	if (!validationResult.success) {
		return res.status(400).json({
			message: "Validacijos klaida",
			errors: validationResult.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		});
	}

	const data = validationResult.data;

	const employeeDataToUpdate: EmployeeUpdateData = {
		firstName: data.firstName,
		lastName: data.lastName,
		email: data.email,
		address: data.address,
		personalCode: data.personalCode,
		dateOfBirth: data.dateOfBirth,
		bankAccountNumber: data.bankAccountNumber,
		updatedBy: new mongoose.Types.ObjectId(currentUser.id),
	};

	if (currentUser.role === "admin") {
		employeeDataToUpdate.position = data.position;
		employeeDataToUpdate.basicSalary = data.basicSalary;
	}

	try {
		const result = await Employee.updateOne({ _id: requestedId }, { $set: employeeDataToUpdate }, { runValidators: true });

		if (result.matchedCount === 0) {
			return res.status(404).json({
				message: "Darbuotojas nerastas",
			});
		}

		return res.sendStatus(200);
	} catch (error) {
		if (isMongoDuplicateKeyError(error)) {
			return res.status(409).json({
				message: "Darbuotojas su tokiu el. paštu jau egzistuoja",
			});
		}

		console.error("Failed to update employee:", error);

		return res.status(500).json({
			message: "Vidinė serverio klaida",
		});
	}
});

// DELETE /api/employees/:id
employeeRouter.delete("/:id", (req, res) => {
	res.json({ message: `Delete employee ${req.params.id}` });
});
