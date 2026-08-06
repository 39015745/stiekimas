import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

export type UserRole = "admin" | "employee";

export interface UserFields {
	username: string;
	passwordHash: string;
	role: UserRole;
	authVersion: number;
	employeeId?: Types.ObjectId;
	createdBy: Types.ObjectId;
	updatedBy: Types.ObjectId;
}

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
		authVersion: {
			type: Number,
			default: 0,
			required: true,
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

export type UserDb = mongoose.InferSchemaType<typeof userSchema>;
export type UserDocument = mongoose.HydratedDocument<UserDb>;

export const User = mongoose.model<UserFields>("User", userSchema);
