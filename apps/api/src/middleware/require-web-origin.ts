import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function requireWebOrigin(request: Request, response: Response, next: NextFunction): void {
	if (!STATE_CHANGING_METHODS.has(request.method)) {
		next();
		return;
	}

	// Bearer tokens are explicitly attached by the mobile client.
	// They are not automatically attached like browser cookies.
	if (request.authMethod === "bearer") {
		next();
		return;
	}

	const origin = request.get("origin");

	if (origin !== env.WEB_ORIGIN) {
		response.status(403).json({
			message: "Invalid request origin",
		});
		return;
	}

	next();
}
