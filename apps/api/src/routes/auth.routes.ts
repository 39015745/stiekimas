import bcrypt from "bcryptjs";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { loginSchema } from "@stiekimas/schema";

import { AUTH_COOKIE_NAME, createAuthToken, getAuthCookieOptions, getClearAuthCookieOptions } from "../lib/auth.js";
import { requireAuth } from "../middleware/require-auth.js";
import { requireWebOrigin } from "../middleware/require-web-origin.js";
import { User } from "../models/user.model.js";

async function authenticateUser(username: string, password: string) {
	const user = await User.findOne({ username }).select("+passwordHash");

	const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

	if (!user || !passwordMatches) {
		return null;
	}

	return user;
}

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	skipSuccessfulRequests: true,
	message: {
		message: "Per daug bandymų. Pabandykite vėliau.",
	},
});

export const authRouter = Router();

authRouter.post("/web/login", requireWebOrigin, loginLimiter, async (request, response) => {
	const parsed = loginSchema.safeParse(request.body);

	if (!parsed.success) {
		response.status(400).json({
			message: "Įveskite tinkamą vardą ir slaptažodį",
		});
		return;
	}

	const user = await authenticateUser(parsed.data.username, parsed.data.password);

	if (!user) {
		response.status(401).json({
			message: "Neteisingas vardas arba slaptažodis",
		});
		return;
	}

	const token = createAuthToken(user._id.toString(), user.authVersion ?? 0, "web");

	response.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

	response.json({
		user: {
			employeeId: user.employeeId,
			username: user.username,
			role: user.role,
		},
	});
});

authRouter.post("/mobile/login", loginLimiter, async (request, response) => {
	const parsed = loginSchema.safeParse(request.body);

	if (!parsed.success) {
		response.status(400).json({
			message: "Įveskite tinkamą vardą ir slaptažodį",
		});
		return;
	}

	const user = await authenticateUser(parsed.data.username, parsed.data.password);

	if (!user) {
		response.status(401).json({
			message: "Neteisingas vardas arba slaptažodis",
		});
		return;
	}

	const accessToken = createAuthToken(user._id.toString(), user.authVersion ?? 0, "mobile");

	response.json({
		accessToken,
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

authRouter.post("/web/logout", requireWebOrigin, (_request, response) => {
	response.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());

	response.status(204).send();
});

authRouter.post("/logout", (_request, response) => {
	response.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());
	response.status(204).send();
});
