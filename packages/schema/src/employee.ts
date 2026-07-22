import { z } from "zod";

export const employeeFormSchema = z
	.object({
		firstName: z.string().trim().min(1, "Vardas yra privalomas").max(50),
		lastName: z.string().trim().min(1, "Pavardė yra privaloma").max(50),
		email: z.string().trim().toLowerCase().pipe(z.email("Neteisingas el. pašto adresas")),
		address: z.string().trim().max(300),
		position: z
			.enum(["welder", "assembler"])
			.or(z.literal(""))
			.refine((value) => value !== "", {
				message: "Pasirinkite poziciją",
			}),
		personalCode: z
			.string()
			.trim()
			.pipe(z.literal("").or(z.string().regex(/^\d{11}$/, "Asmens kodas turi būti iš 11 skaitmenų"))),
		dateOfBirth: z
			.string()
			.trim()
			.pipe(z.literal("").or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data turi būti formatu yyyy-mm-dd"))),
		bankAccountNumber: z
			.string()
			.trim()
			.toUpperCase()
			.pipe(z.literal("").or(z.string().min(15, "Neteisingas sąskaitos numeris").max(34, "Neteisingas sąskaitos numeris"))),
		basicSalary: z.coerce.number().positive("Alga turi būti teigiamas skaičius").max(1_000_000),
		manageLogin: z.boolean().default(false),
		hasLogin: z.boolean().default(false),
		username: z.string().trim().max(50).default(""),
		password: z.string().max(128).default(""),
		role: z.enum(["admin", "employee"]).default("employee"),
	})
	.strict()
	.superRefine((data, ctx) => {
		if (!data.manageLogin) {
			return;
		}

		if (data.username.length < 3) {
			ctx.addIssue({
				code: "custom",
				path: ["username"],
				message: "Vartotojo vardas privalomas (min. 3 simboliai)",
			});
		}

		// Employee has no login, so login is being created.
		if (!data.hasLogin && data.password.length < 8) {
			ctx.addIssue({
				code: "custom",
				path: ["password"],
				message: "Slaptažodis privalomas (min. 8 simboliai)",
			});
		}

		// Employee already has login. Empty password keeps the current password.
		if (data.hasLogin && data.password.length > 0 && data.password.length < 8) {
			ctx.addIssue({
				code: "custom",
				path: ["password"],
				message: "Naujas slaptažodis turi turėti bent 8 simbolius",
			});
		}
	});

// POST /employees body
export const createEmployeeSchema = employeeFormSchema;

// PUT /employees/:id body
export const updateEmployeeSchema = employeeFormSchema;

// GET /employees response
export const employeeSchema = employeeFormSchema.extend({
	id: z.string().min(1),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

export type EmployeeFormInput = z.input<typeof employeeFormSchema>;
export type EmployeeFormOutput = z.output<typeof employeeFormSchema>;

export type CreateEmployeeInput = z.input<typeof createEmployeeSchema>;

export type UpdateEmployeeInput = z.input<typeof updateEmployeeSchema>;

export type Employee = z.output<typeof employeeSchema>;
