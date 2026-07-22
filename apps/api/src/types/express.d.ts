export {};

declare global {
	namespace Express {
		interface Request {
			user: {
				id: string;
				employeeId?: string;
				username: string;
				role: "admin" | "employee";
			};
		}
	}
}
