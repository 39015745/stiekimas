import type { NextFunction, Request, Response } from "express";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "../lib/auth.js";
import { User } from "../models/user.model.js";

export async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const token = request.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

		if (!token) {
			response.status(401).json({ message: "Authentication required" });
			return;
		}

		const { sub } = verifyAuthToken(token);
		const user = await User.findById(sub).select("username role employeeId").lean();

		if (!user) {
			response.status(401).json({ message: "Authentication required" });
			return;
		}

		request.user = {
			id: user._id.toString(),
			employeeId: user.employeeId ? user.employeeId.toString() : undefined,
			username: user.username,
			role: user.role,
		};

		next();
	} catch {
		response.status(401).json({ message: "Authentication required" });
	}
}
