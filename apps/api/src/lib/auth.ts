import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const AUTH_COOKIE_NAME = "stiekimas_session";

const JWT_ISSUER = "stiekimas-auth";
const JWT_AUDIENCE = "stiekimas-api";
const JWT_ALGORITHM = "HS256" as const;
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthClient = "web" | "mobile";

export type AuthTokenPayload = {
	sub: string;
	authVersion: number;
	client: AuthClient;
};

export function createAuthToken(userId: string, authVersion: number, client: AuthClient): string {
	return jwt.sign(
		{
			authVersion,
			client,
		},
		env.JWT_SECRET,
		{
			algorithm: JWT_ALGORITHM,
			subject: userId,
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE,
			expiresIn: "7d",
		},
	);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
	const payload = jwt.verify(token, env.JWT_SECRET, {
		algorithms: [JWT_ALGORITHM],
		issuer: JWT_ISSUER,
		audience: JWT_AUDIENCE,
	});

	if (typeof payload === "string" || typeof payload.sub !== "string" || typeof payload.authVersion !== "number" || (payload.client !== "web" && payload.client !== "mobile")) {
		throw new Error("Invalid authentication token");
	}

	return {
		sub: payload.sub,
		authVersion: payload.authVersion,
		client: payload.client,
	};
}

export function getAuthCookieOptions(): CookieOptions {
	return {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_MAX_AGE_MS,
	};
}

export function getClearAuthCookieOptions(): CookieOptions {
	const { maxAge: _maxAge, ...options } = getAuthCookieOptions();
	return options;
}
