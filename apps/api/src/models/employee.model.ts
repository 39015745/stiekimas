import mongoose, { type InferSchemaType } from "mongoose";

const employeeSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		address: {
			type: String,
			required: true,
			trim: true,
		},
		position: {
			type: String,
			enum: ["welder", "assembler"],
			required: true,
		},
		personalCode: {
			type: String,
			required: true,
			unique: true,
			select: false,
		},
		dateOfBirth: {
			type: String,
			required: true,
		},
		bankAccountNumber: {
			type: String,
			required: true,
			select: false,
		},
		basicSalary: {
			type: Number,
			required: true,
			min: 0,
			select: false,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export type EmployeeDb = InferSchemaType<typeof employeeSchema>;

export const Employee = mongoose.model("Employee", employeeSchema);
