export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        role: "admin" | "employee";
      };
    }
  }
}
