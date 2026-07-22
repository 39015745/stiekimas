import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, trim: true, lowercase: true },
		address: { type: String, required: true, trim: true },
		position: { type: String, required: true, trim: true },
		personalCode: { type: String, required: true, unique: true, select: false },
		dateOfBirth: { type: String, required: true },
		bankAccountNumber: { type: String, required: true, select: false },
		basicSalary: { type: Number, required: true, min: 0, select: false },
		hasLogin: { type: Boolean, required: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
	},
);

export const Employee = mongoose.model("Employee", employeeSchema);
