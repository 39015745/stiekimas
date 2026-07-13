import { Router } from "express";
import { ZodError } from "zod";

import { Employee } from "../models/employee.model.js";

import { requireAdmin } from "../middleware/require-admin.js";
import { createEmployeeSchema } from "@stiekimas/schema";

export const employeeRouter = Router();

// GET /api/employees
employeeRouter.get("/", (req, res) => {
	res.json({ message: "Get all employees" });
});

// GET /api/employees/:id
employeeRouter.get("/:id", (req, res) => {
	res.json({ message: `Get employee ${req.params.id}` });
});

// POST /api/employees
employeeRouter.post("/", requireAdmin, async (req, res) => {
	try {
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

		const validatedData = validationResult.data;

		const existingEmployee = await Employee.findOne({
			$or: [{ email: validatedData.email }, { personalCode: validatedData.personalCode }],
		}).lean();

		if (existingEmployee) {
			res.status(409).json({
				message: "Darbuotojas su tokiu el. paštu arba asmens kodu jau egzistuoja",
			});
			return;
		}

		const newEmployee = await Employee.create(validatedData);

		res.status(201).json(newEmployee);
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: "Internal server error",
		});
	}
});

// PUT /api/employees/:id
employeeRouter.put("/:id", (req, res) => {
	res.json({ message: `Update employee ${req.params.id}` });
});

// DELETE /api/employees/:id
employeeRouter.delete("/:id", (req, res) => {
	res.json({ message: `Delete employee ${req.params.id}` });
});
