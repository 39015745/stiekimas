import { z } from "zod";

export const employeeFormSchema = z.object({
	firstName: z.string().trim().min(1, "Vardas yra privalomas"),
	lastName: z.string().trim().min(1, "Pavardė yra privaloma"),
	email: z.email("Neteisingas el. pašto adresas"),
	address: z.string().trim().min(1, "Adresas yra privalomas"),
	position: z.string().trim().min(1, "Pareigos yra privalomos"),
	personalCode: z.string().regex(/^\d{11}$/, "Asmens kodas turi būti iš 11 skaitmenų"),
	dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data turi būti formatu yyyy-mm-dd"),
	bankAccountNumber: z.string().trim().min(5, "Neteisingas sąskaitos numeris"),
	basicSalary: z.number().positive("Alga turi būti teigiamas skaičius"),
	username: z
		.string()
		.trim()
		.min(1, "Vartotojo vardas privalomas")
		.transform((v) => v.toLowerCase()),
	password: z.string().min(8, "Slaptažodis turi būti bent 8 simbolių"),
	role: z.enum(["admin", "employee"]).default("employee"),
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
