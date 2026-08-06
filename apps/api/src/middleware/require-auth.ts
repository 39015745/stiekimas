import type { NextFunction, Request, Response } from "express";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "../lib/auth.js";
import { User } from "../models/user.model.js";

function getBearerToken(request: Request): string | undefined {
	const authorization = request.get("authorization");

	if (!authorization) {
		return undefined;
	}

	const [scheme, token] = authorization.split(" ");

	if (scheme !== "Bearer" || !token) {
		return undefined;
	}

	return token;
}

function sendUnauthorized(response: Response): void {
	response.status(401).json({
		message: "Authentication required",
	});
}

export async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
	const cookieToken = request.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

	const bearerToken = getBearerToken(request);

	// Reject ambiguous requests.
	if ((!cookieToken && !bearerToken) || (cookieToken && bearerToken)) {
		sendUnauthorized(response);
		return;
	}

	const authMethod = bearerToken ? "bearer" : "cookie";
	const token = bearerToken ?? cookieToken;

	if (!token) {
		sendUnauthorized(response);
		return;
	}

	try {
		const payload = verifyAuthToken(token);

		if ((authMethod === "cookie" && payload.client !== "web") || (authMethod === "bearer" && payload.client !== "mobile")) {
			sendUnauthorized(response);
			return;
		}

		const user = await User.findById(payload.sub).select("username role employeeId authVersion").lean();

		if (!user || (user.authVersion ?? 0) !== payload.authVersion) {
			sendUnauthorized(response);
			return;
		}

		request.authMethod = authMethod;

		request.user = {
			id: user._id.toString(),
			employeeId: user.employeeId?.toString(),
			username: user.username,
			role: user.role,
		};

		next();
	} catch (error) {
		if (error instanceof Error && (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" || error.name === "NotBeforeError")) {
			sendUnauthorized(response);
			return;
		}

		next(error);
	}
}
