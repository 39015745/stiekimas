import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const AUTH_COOKIE_NAME = "stiekimas_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type AuthTokenPayload = {
  sub: string;
};

export function createAuthToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Invalid authentication token");
  }

  return { sub: payload.sub };
}

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  };
}

export function getClearAuthCookieOptions(): CookieOptions {
  const { maxAge: _maxAge, ...options } = getAuthCookieOptions();
  return options;
}
