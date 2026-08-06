import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { requireAuth } from "./middleware/require-auth.js";
import { employeeRouter } from "./routes/employee.routes.js";
import { employeeLoginRouter } from "./routes/employee-login.routes.js";
import { requireWebOrigin } from "./middleware/require-web-origin.js";

export const app = express();

app.use(helmet());
app.use(
	cors({
		origin: env.WEB_ORIGIN,
		credentials: true,
	}),
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (_request, response) => {
	response.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

app.use("/api/employees", requireAuth, requireWebOrigin, employeeRouter, employeeLoginRouter);

app.use((_request, response) => {
	response.status(404).json({ message: "Route not found" });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
	if (response.headersSent) {
		next(error);
		return;
	}

	const status = typeof error === "object" && error !== null && "status" in error && typeof error.status === "number" && error.status >= 400 && error.status < 500 ? error.status : 500;

	if (status === 500) {
		console.error(error);
	}

	response.status(status).json({
		message: status === 413 ? "Užklausa per didelė" : status === 400 ? "Neteisinga užklausa" : "Internal server error",
	});
};

app.use(errorHandler);
