import { Schema, model } from "mongoose";

export type UserRole = "admin" | "employee";

export interface UserDocument {
  name: string;
  passwordHash: string;
  role: UserRole;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const User = model<UserDocument>("User", userSchema);
