import type { NextFunction, Request, Response } from "express";

export function requireAdmin(request: Request, response: Response, next: NextFunction): void {
	if (request.user?.role !== "admin") {
		response.status(403).json({ message: "Forbidden: Admin access required" });
		return;
	}

	next();
}
