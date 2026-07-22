import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export type UserRole = "admin" | "employee";

export interface UserFields {
	username: string;
	passwordHash: string;
	role: UserRole;
	employeeId?: Types.ObjectId;
	createdBy: Types.ObjectId;
	updatedBy: Types.ObjectId;
}

export type UserDocument = HydratedDocument<UserFields>;

const userSchema = new mongoose.Schema<UserFields>(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
		},
		passwordHash: {
			type: String,
			required: true,
			select: false,
		},
		role: {
			type: String,
			enum: ["admin", "employee"],
			required: true,
			default: "employee",
		},
		employeeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Employee",
			default: undefined,
		},
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
	},
);

userSchema.index(
	{ employeeId: 1 },
	{
		unique: true,
		partialFilterExpression: {
			employeeId: { $type: "objectId" },
		},
	},
);

export const User = mongoose.model<UserFields>("User", userSchema);
