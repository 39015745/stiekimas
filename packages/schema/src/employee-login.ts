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

const employeeLoginBaseSchema = z.object({
	username: usernameSchema,
	role: userRoleSchema,
});

export const employeeLoginSchema = z
	.object({
		username: z.string(),
		role: userRoleSchema,
	})
	.strict();

export const createEmployeeLoginSchema = employeeLoginBaseSchema
	.extend({
		password: passwordSchema,
	})
	.strict();

export const updateEmployeeLoginSchema = employeeLoginBaseSchema
	.extend({
		password: z.union([passwordSchema, z.literal("")]),
	})
	.strict();

export type EmployeeLoginFormInput = z.input<typeof updateEmployeeLoginSchema>;

export type EmployeeLoginFormOutput = z.output<typeof updateEmployeeLoginSchema>;

export type EmployeeLoginDetails = z.output<typeof employeeLoginSchema>;
