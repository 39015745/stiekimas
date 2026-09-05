import mongoose from "mongoose";
import type { NextFunction, Request, Response } from "express";

export function validateObjectId(request: Request, response: Response, next: NextFunction): void {
	const id = request.params.id;

	if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
		response.status(400).json({
			message: "Neteisingas ID formatas",
		});

		return;
	}

	next();
}
