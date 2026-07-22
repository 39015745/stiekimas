import bcrypt from "bcryptjs";
import { Router } from "express";
import { loginSchema } from "@stiekimas/schema";

import { AUTH_COOKIE_NAME, createAuthToken, getAuthCookieOptions, getClearAuthCookieOptions } from "../lib/auth.js";
import { requireAuth } from "../middleware/require-auth.js";
import { User } from "../models/user.model.js";

export const authRouter = Router();

authRouter.post("/login", async (request, response) => {
	const parsed = loginSchema.safeParse(request.body);

	if (!parsed.success) {
		response.status(400).json({ message: "Įveskite tinkamą vardą ir slaptažodį" });
		return;
	}

	const user = await User.findOne({ username: parsed.data.username }).select("+passwordHash");
	const passwordMatches = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;

	if (!user || !passwordMatches) {
		response.status(401).json({ message: "Neteisingas vardas arba slaptažodis" });
		return;
	}

	const token = createAuthToken(user._id.toString());
	response.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

	response.json({
		user: {
			employeeId: user.employeeId,
			username: user.username,
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
