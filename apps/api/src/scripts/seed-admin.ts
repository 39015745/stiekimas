import "dotenv/config";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { z } from "zod";

import { env } from "../config/env.js";
import { User } from "../models/user.model.js";

const adminSchema = z.object({
  ADMIN_NAME: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .transform((value) => value.toLowerCase()),
  ADMIN_PASSWORD: z.string().min(8).max(50),
});

async function seedAdmin(): Promise<void> {
  const admin = adminSchema.parse(process.env);
  await mongoose.connect(env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(admin.ADMIN_PASSWORD, 12);

  await User.findOneAndUpdate(
    { name: admin.ADMIN_NAME },
    {
      $set: {
        passwordHash,
        role: "admin",
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );

  console.log(`Admin user '${admin.ADMIN_NAME}' is ready`);
  await mongoose.disconnect();
}

seedAdmin().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
