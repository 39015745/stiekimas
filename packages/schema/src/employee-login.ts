import { z } from "zod";

export const USER_ROLES = ["employee", "admin"] as const;

export const userRoleSchema = z.enum(USER_ROLES);

export type UserRole = z.infer<typeof userRoleSchema>;

function getUtf8ByteLength(value: string): number {
	return new TextEncoder().encode(value).length;
}

export const usernameSchema = z.string().trim().toLowerCase().min(3, "Vartotojo vardas turi turėti bent 3 simbolius").max(50);
export const passwordSchema = z
	.string()
	.min(8, "Slaptažodį turi sudaryti bent 8 simboliai")
	.max(50, "Slaptažodis per ilgas")
	.refine((password) => getUtf8ByteLength(password) <= 72, {
		message: "Slaptažodis negali viršyti 72 baitų",
	});

export const employeeLoginSummarySchema = z
	.object({
		username: z.string(),
		role: userRoleSchema,
	})
	.strict();

export const createEmployeeLoginSchema = z
	.object({
		username: usernameSchema,
		password: passwordSchema,
		role: userRoleSchema.default("employee"),
	})
	.strict();

export const updateEmployeeLoginSchema = z
	.object({
		username: usernameSchema,
		password: z.union([passwordSchema, z.literal("")]).optional(),
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
