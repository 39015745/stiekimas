import { Router } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import type { Request, Response } from "express";
import { Employee } from "../models/employee.model.js";

import { requireAdmin } from "../middleware/require-admin.js";
import { createEmployeeSchema } from "@stiekimas/schema";
import { User } from "../models/user.model.js";

export const employeeRouter = Router();

type DuplicateKeyError = {
	code: number;
	keyPattern?: Record<string, number>;
};

function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
	return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === 11000;
}

// GET /api/employees
employeeRouter.get("/", requireAdmin, async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string, 10) || 1;
		const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
		const sortBy = (req.query.sortBy as string) || "lastName";
		const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

		let filters: { column: string; value: string }[] = [];
		if (req.query.filters) {
			try {
				filters = JSON.parse(req.query.filters as string);
			} catch (e) {
				res.status(400).json({ message: "Invalid filters format" });
				return;
			}
		}

		const query: Record<string, any> = {};
		for (const { column, value } of filters) {
			if (value && column !== "username") {
				query[column] = { $regex: value, $options: "i" };
			}
		}

		const [items, totalCount] = await Promise.all([
			Employee.find(query)
				.sort({ [sortBy]: sortOrder })
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.lean(),
			Employee.countDocuments(query),
		]);

		const formattedItems = items.map((doc) => ({
			id: doc._id.toString(),
			firstName: doc.firstName,
			lastName: doc.lastName,
			email: doc.email,
			position: doc.position,
		}));

		res.json({
			items: formattedItems,
			totalCount,
			page,
			pageSize,
			pageCount: Math.ceil(totalCount / pageSize),
		});
	} catch (error) {
		console.error("Failed to fetch employees:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

// GET /api/employees/:id | Get employee details |
employeeRouter.get("/:id", async (req: Request, res: Response) => {
	try {
		const requestedId = req.params.id;
		const currentUser = req.user;

		if (typeof requestedId !== "string" || !mongoose.Types.ObjectId.isValid(requestedId)) {
			res.status(400).json({ message: "Neteisingas ID formatas" });
			return;
		}

		// Authorization: Allow if admin, or if the employee is requesting their own data
		if (currentUser.role !== "admin" && currentUser.employeeId !== requestedId) {
			res.status(403).json({ message: "Prieiga draudžiama" });
			return;
		}

		const result = await Employee.aggregate<EmployeeResponse>([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(requestedId),
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "employeeId",
					as: "user",
				},
			},
			{
				$unwind: {
					path: "$user",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: 0,

					id: { $toString: "$_id" },

					firstName: 1,
					lastName: 1,
					email: 1,
					address: 1,
					position: 1,
					personalCode: 1,
					dateOfBirth: 1,
					bankAccountNumber: 1,
					basicSalary: 1,
					hasLogin: 1,

					username: { $ifNull: ["$user.username", ""] },
					role: { $ifNull: ["$user.role", "employee"] },
				},
			},
		]);

		const employeeData = result[0];

		if (!employeeData) {
			return res.status(404).json({
				message: "Darbuotojas nerastas",
			});
		}
	} catch (error) {
		console.error("Failed to fetch employee:", error);
		res.status(500).json({ message: "Vidinė serverio klaida" });
	}
});

// POST /api/employees | create employee |
employeeRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
	const validationResult = await createEmployeeSchema.safeParseAsync(req.body);

	if (!validationResult.success) {
		res.status(400).json({
			message: "Validacijos klaida",
			errors: validationResult.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		});

		return;
	}

	const { firstName, lastName, email, address, position, personalCode, dateOfBirth, bankAccountNumber, basicSalary, manageLogin, password, username, role } = validationResult.data;

	const currentUserId = req.user.id;

	try {
		await mongoose.connection.transaction(async (session) => {
			const employee = new Employee({
				firstName,
				lastName,
				email,
				address,
				position,
				personalCode,
				dateOfBirth,
				bankAccountNumber,
				basicSalary,
				hasLogin: manageLogin,
				createdBy: currentUserId,
				updatedBy: currentUserId,
			});

			await employee.save({ session });

			let user = null;

			// Only create the login if the frontend requested it
			if (manageLogin) {
				const passwordHash = await bcrypt.hash(password, 12);

				user = new User({
					username,
					passwordHash,
					role,
					employeeId: employee._id,
					createdBy: currentUserId,
					updatedBy: currentUserId,
				});

				await user.save({ session });
			}

			return { employee, user };
		});

		return res.sendStatus(201);
	} catch (error) {
		if (isDuplicateKeyError(error)) {
			const fields = Object.keys(error.keyPattern ?? {});
			console.log(error);
			res.status(409).json({
				message: fields.includes("username") ? "Toks vartotojo vardas jau naudojamas" : "Darbuotojas su tokiu el. paštu jau egzistuoja",
				fields,
			});

			return;
		}

		console.error("Failed to create employee:", error);

		res.status(500).json({
			message: "Internal server error",
		});
	}
});

// PUT /api/employees/:id | Update employee details |
employeeRouter.put("/:id", async (req: Request, res: Response) => {
	const requestedId = req.params.id;
	const currentUser = req.user;

	if (typeof requestedId !== "string" || !mongoose.Types.ObjectId.isValid(requestedId)) {
		res.status(400).json({ message: "Neteisingas ID formatas" });
		return;
	}

	// Authorization: Allow if admin, or if the employee is updating their own data
	if (currentUser.role !== "admin" && currentUser.employeeId !== requestedId) {
		res.status(403).json({ message: "Prieiga draudžiama" });
		return;
	}

	// Note: Assuming you have an `updateEmployeeSchema` that makes fields optional.
	// If you are using the same schema, ensure it handles partial updates appropriately.
	const validationResult = await createEmployeeSchema.safeParseAsync(req.body);

	if (!validationResult.success) {
		res.status(400).json({
			message: "Validacijos klaida",
			errors: validationResult.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		});
		return;
	}

	const data = validationResult.data;

	try {
		await mongoose.connection.transaction(async (session) => {
			const employeeDataToUpdate: any = {
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				address: data.address,
				personalCode: data.personalCode,
				dateOfBirth: data.dateOfBirth,
				bankAccountNumber: data.bankAccountNumber,
				updatedBy: currentUser.id,
			};

			// Only allow admins to update position, salary, and login permissions
			if (currentUser.role === "admin") {
				employeeDataToUpdate.position = data.position;
				employeeDataToUpdate.basicSalary = data.basicSalary;
				if (data.manageLogin) {
					employeeDataToUpdate.hasLogin = true;
				}
			}

			const updatedEmployee = await Employee.findByIdAndUpdate(requestedId, { $set: employeeDataToUpdate }, { new: true, session });

			if (!updatedEmployee) {
				throw new Error("EMPLOYEE_NOT_FOUND");
			}

			let updatedUser = null;

			// Only admins can manage login details
			if (currentUser.role === "admin") {
				if (data.manageLogin) {
					const userDataToUpdate: any = {
						username: data.username,
						role: data.role,
						updatedBy: currentUser.id,
					};

					if (data.password) {
						userDataToUpdate.passwordHash = await bcrypt.hash(data.password, 12);
					}

					updatedUser = await User.findOneAndUpdate(
						{ employeeId: requestedId },
						{
							$set: userDataToUpdate,
							$setOnInsert: { createdBy: currentUser.id },
						},
						{ new: true, upsert: true, session },
					);
				}
			}

			return { employee: updatedEmployee, user: updatedUser };
		});

		return res.sendStatus(200);
	} catch (error) {
		if (error instanceof Error && error.message === "EMPLOYEE_NOT_FOUND") {
			res.status(404).json({ message: "Darbuotojas nerastas" });
			return;
		}

		if (isDuplicateKeyError(error)) {
			const fields = Object.keys(error.keyPattern ?? {});
			res.status(409).json({
				message: fields.includes("username") ? "Toks vartotojo vardas jau naudojamas" : "Darbuotojas su tokiu el. paštu jau egzistuoja",
				fields,
			});
			return;
		}

		console.error("Failed to update employee:", error);
		res.status(500).json({ message: "Vidinė serverio klaida" });
	}
});

// DELETE /api/employees/:id
employeeRouter.delete("/:id", (req, res) => {
	res.json({ message: `Delete employee ${req.params.id}` });
});
