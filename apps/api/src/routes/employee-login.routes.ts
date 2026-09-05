import { Router } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { createEmployeeLoginSchema, updateEmployeeLoginSchema } from "@stiekimas/schema";

import { Employee } from "../models/employee.model.js";
import { User } from "../models/user.model.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { validateObjectId } from "../middleware/require-employee-access.js";

export const employeeLoginRouter = Router();

type DuplicateKeyError = {
	code: number;
	keyPattern?: Record<string, number>;
};

function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
	return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === 11000;
}

type EmployeeIdParams = {
	id: string;
};

// POST /api/employees/:employeeId/login | create employee login
employeeLoginRouter.post<EmployeeIdParams>("/:id/login", requireAdmin, validateObjectId, async (req, res) => {
	const employeeId = req.params.id;

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

	const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

	try {
		const employeeExists = await Employee.exists({ _id: employeeObjectId });

		if (!employeeExists) {
			return res.status(404).json({ message: "Darbuotojas nerastas" });
		}

		const existingLogin = await User.exists({ employeeId: employeeObjectId });

		if (existingLogin) {
			return res.status(409).json({ message: "Darbuotojas jau turi prisijungimą" });
		}

		const { username, password, role } = validationResult.data;

		const passwordHash = await bcrypt.hash(password, 12);

		const user = await User.create({
			username,
			passwordHash,
			role,
			employeeId: employeeObjectId,
			createdBy: new mongoose.Types.ObjectId(req.user.id),
			updatedBy: new mongoose.Types.ObjectId(req.user.id),
		});

		return res.status(201).json({ message: "Darbuotojo prisijungimas sėkmingai sukurtas" });
	} catch (error) {
		if (isDuplicateKeyError(error)) {
			return res.status(409).json({
				message: "Toks vartotojo vardas jau naudojamas",
				fields: Object.keys(error.keyPattern ?? {}),
			});
		}

		console.error("Failed to create employee login:", error);

		return res.status(500).json({ message: "Vidinė serverio klaida" });
	}
});

// PUT /api/employees/:employeeId/login | update employee login
employeeLoginRouter.put<EmployeeIdParams>("/:employeeId/login", requireAdmin, validateObjectId, async (req, res) => {
	const employeeId = req.params.id;

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

	const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

	try {
		const { username, password, role } = validationResult.data;

		const update: {
			$set: {
				username: string;
				role: typeof role;
				updatedBy: mongoose.Types.ObjectId;
				passwordHash?: string;
			};
			$inc?: {
				authVersion: number;
			};
		} = {
			$set: {
				username,
				role,
				updatedBy: new mongoose.Types.ObjectId(req.user.id),
			},
		};

		if (password) {
			update.$set.passwordHash = await bcrypt.hash(password, 12);

			update.$inc = {
				authVersion: 1,
			};
		}

		const user = await User.findOneAndUpdate({ employeeId: employeeObjectId }, update, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			return res.status(404).json({ message: "Darbuotojas neturi prisijungimo" });
		}

		return res.status(200).json({ message: "Darbuotojo prisijungimas sėkmingai atnaujintas" });
	} catch (error) {
		if (isDuplicateKeyError(error)) {
			return res.status(409).json({
				message: "Toks vartotojo vardas jau naudojamas",
				fields: Object.keys(error.keyPattern ?? {}),
			});
		}

		console.error("Failed to update employee login:", error);

		return res.status(500).json({ message: "Vidinė serverio klaida" });
	}
});

// DELETE /api/employees/:employeeId/login
employeeLoginRouter.delete<EmployeeIdParams>("/:employeeId/login", requireAdmin, validateObjectId, async (req, res) => {
	const employeeId = req.params.id;

	const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

	try {
		const deletedUser = await User.findOneAndDelete({ employeeId: employeeObjectId });

		if (!deletedUser) {
			return res.status(404).json({ message: "Darbuotojas neturi prisijungimo" });
		}

		return res.status(200).json({ message: "Darbuotojas sėkmingai ištrintas" });
	} catch (error) {
		console.error("Failed to delete employee login:", error);

		return res.status(500).json({ message: "Vidinė serverio klaida" });
	}
});
