import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		address: { type: String, required: true },
		position: { type: String, required: true },
		personalCode: { type: String, required: true, unique: true },
		dateOfBirth: { type: String, required: true },
		bankAccountNumber: { type: String, required: true },
		basicSalary: { type: Number, required: true },
		username: { type: String, required: true },
	},
	{
		timestamps: true,
	},
);

export const Employee = mongoose.model("Employee", employeeSchema);
