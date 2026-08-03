import { Router } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { createEmployeeLoginSchema, updateEmployeeLoginSchema } from "@stiekimas/schema";

import { Employee } from "../models/employee.model.js";
import { User } from "../models/user.model.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const employeeLoginRouter = Router();

type DuplicateKeyError = {
	code: number;
	keyPattern?: Record<string, number>;
};

function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
	return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === 11000;
}

function isValidEmployeeId(employeeId: unknown): employeeId is string {
	return typeof employeeId === "string" && mongoose.Types.ObjectId.isValid(employeeId);
}

// POST /api/employees/:employeeId/login | create employee login
employeeLoginRouter.post("/:employeeId/login", requireAdmin, async (req, res) => {
	const { employeeId } = req.params;

	if (!isValidEmployeeId(employeeId)) {
		return res.status(400).json({
			message: "Neteisingas ID formatas",
		});
	}

	const validationResult = await createEmployeeLoginSchema.safeParseAsync(req.body);

	if (!validationResult.success) {
		return res.status(400).json({
			message: "Validacijos klaida",
			errors: validationResult.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		});
	}

	try {
		const employeeExists = await Employee.exists({
			_id: employeeId,
		});

		if (!employeeExists) {
			return res.status(404).json({
				message: "Darbuotojas nerastas",
			});
		}

		const existingLogin = await User.exists({
			employeeId,
		});

		if (existingLogin) {
			return res.status(409).json({
				message: "Darbuotojas jau turi prisijungimą",
			});
		}

		const { username, password, role } = validationResult.data;

		const passwordHash = await bcrypt.hash(password, 12);

		const user = await User.create({
			username,
			passwordHash,
			role,
			employeeId,
			createdBy: req.user.id,
			updatedBy: req.user.id,
		});

		return res.status(201).json({
			id: user._id.toString(),
		});
	} catch (error) {
		if (isDuplicateKeyError(error)) {
			return res.status(409).json({
				message: "Toks vartotojo vardas jau naudojamas",
				fields: Object.keys(error.keyPattern ?? {}),
			});
		}

		console.error("Failed to create employee login:", error);

		return res.status(500).json({
			message: "Vidinė serverio klaida",
		});
	}
});

// PUT /api/employees/:employeeId/login | update employee login
employeeLoginRouter.put("/:employeeId/login", requireAdmin, async (req, res) => {
	const { employeeId } = req.params;

	if (!isValidEmployeeId(employeeId)) {
		return res.status(400).json({
			message: "Neteisingas ID formatas",
		});
	}

	const validationResult = await updateEmployeeLoginSchema.safeParseAsync(req.body);

	if (!validationResult.success) {
		return res.status(400).json({
			message: "Validacijos klaida",
			errors: validationResult.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		});
	}

	try {
		const { username, password, role } = validationResult.data;

		const update: {
			username: string;
			role: typeof role;
			updatedBy: string;
			passwordHash?: string;
		} = {
			username,
			role,
			updatedBy: req.user.id,
		};

		if (password) {
			update.passwordHash = await bcrypt.hash(password, 12);
		}

		const user = await User.findOneAndUpdate(
			{ employeeId },
			{
				$set: update,
			},
			{
				new: true,
				runValidators: true,
			},
		);

		if (!user) {
			return res.status(404).json({
				message: "Darbuotojas neturi prisijungimo",
			});
		}

		return res.sendStatus(200);
	} catch (error) {
		if (isDuplicateKeyError(error)) {
			return res.status(409).json({
				message: "Toks vartotojo vardas jau naudojamas",
				fields: Object.keys(error.keyPattern ?? {}),
			});
		}

		console.error("Failed to update employee login:", error);

		return res.status(500).json({
			message: "Vidinė serverio klaida",
		});
	}
});

// DELETE /api/employees/:employeeId/login | delete employee login
employeeLoginRouter.delete("/:employeeId/login", requireAdmin, async (req, res) => {
	const { employeeId } = req.params;

	if (!isValidEmployeeId(employeeId)) {
		return res.status(400).json({
			message: "Neteisingas ID formatas",
		});
	}

	try {
		const deletedUser = await User.findOneAndDelete({
			employeeId,
		});

		if (!deletedUser) {
			return res.status(404).json({
				message: "Darbuotojas neturi prisijungimo",
			});
		}

		return res.sendStatus(204);
	} catch (error) {
		console.error("Failed to delete employee login:", error);

		return res.status(500).json({
			message: "Vidinė serverio klaida",
		});
	}
});
