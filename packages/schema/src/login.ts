import { z } from "zod";

import { usernameSchema } from "./employee-login.js";

export const loginSchema = z
	.object({
		username: usernameSchema,
		password: z.string().min(1).max(128),
	})
	.strict();

export type LoginInput = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;
