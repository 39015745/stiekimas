import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";

import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
} from "../lib/auth.js";
import { requireAuth } from "../middleware/require-auth.js";
import { User } from "../models/user.model.js";

const loginSchema = z.object({
  name: z.string().trim().min(1).max(50).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export const authRouter = Router();

authRouter.post("/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ message: "Enter a valid name and password" });
    return;
  }

  const user = await User.findOne({ name: parsed.data.name }).select("+passwordHash");
  const passwordMatches = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    response.status(401).json({ message: "Invalid name or password" });
    return;
  }

  const token = createAuthToken(user._id.toString());
  response.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  response.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
    },
  });
});

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});

authRouter.post("/logout", (_request, response) => {
  response.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());
  response.status(204).send();
});
