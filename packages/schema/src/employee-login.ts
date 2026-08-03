import { z } from "zod";

export const USER_ROLES = ["employee", "admin"] as const;

export const userRoleSchema = z.enum(USER_ROLES);

export type UserRole = z.infer<typeof userRoleSchema>;

export const usernameSchema = z.string().trim().toLowerCase().min(3, "Vartotojo vardas turi turėti bent 3 simbolius").max(50);

export const employeeLoginSummarySchema = z
	.object({
		username: z.string(),
		role: userRoleSchema,
	})
	.strict();

export const createEmployeeLoginSchema = z
	.object({
		username: usernameSchema,
		password: z.string().min(8, "Slaptažodis turi turėti bent 8 simbolius").max(128),
		role: userRoleSchema.default("employee"),
	})
	.strict();

const optionalNewPasswordSchema = z.union([z.literal(""), z.string().min(8, "Naujas slaptažodis turi turėti bent 8 simbolius").max(128)]).transform((value) => (value === "" ? undefined : value));

export const updateEmployeeLoginSchema = z
	.object({
		username: usernameSchema,
		password: optionalNewPasswordSchema,
		role: userRoleSchema,
	})
	.strict();

export const employeeLoginSchema = employeeLoginSummarySchema.extend({
	id: z.string().min(1),
	employeeId: z.string().min(1),
});

export type CreateEmployeeLoginInput = z.input<typeof createEmployeeLoginSchema>;

export type CreateEmployeeLoginOutput = z.output<typeof createEmployeeLoginSchema>;

export type UpdateEmployeeLoginInput = z.input<typeof updateEmployeeLoginSchema>;

export type UpdateEmployeeLoginOutput = z.output<typeof updateEmployeeLoginSchema>;

export type EmployeeLogin = z.output<typeof employeeLoginSchema>;
