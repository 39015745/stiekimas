import type { NextFunction, Request, Response } from "express";

export function requireEmployeeAccess(request: Request, response: Response, next: NextFunction): void {
	const requestedId = request.params.id;
	const currentUser = request.user;

	if (currentUser.role !== "admin" && currentUser.employeeId !== requestedId) {
		response.status(403).json({
			message: "Prieiga draudžiama",
		});

		return;
	}

	next();
}
