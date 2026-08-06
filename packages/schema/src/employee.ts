import { z } from "zod";

import { employeeLoginSummarySchema } from "./employee-login.js";

export const EMPLOYEE_POSITIONS = ["Montuotojas", "Suvirintojas"] as const;

export const employeePositionSchema = z.enum(EMPLOYEE_POSITIONS);

export type EmployeePosition = z.infer<typeof employeePositionSchema>;

export const employeeFormSchema = z
	.object({
		firstName: z.string().trim().min(1, "Vardas yra privalomas").max(50),
		lastName: z.string().trim().min(1, "Pavardė yra privaloma").max(50),
		email: z.string().trim().toLowerCase().pipe(z.email("Neteisingas el. pašto adresas")),
		address: z.string().trim().max(300),
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
		position: employeePositionSchema.or(z.literal("")).refine((value) => value !== "", { message: "Pasirinkite poziciją" }),
	})
	.strict();

export const employeeSchema = employeeFormSchema.extend({
	position: employeePositionSchema,
	id: z.string().min(1),
	login: employeeLoginSummarySchema.nullable(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

export type EmployeeFormInput = z.input<typeof employeeFormSchema>;
export type EmployeeFormOutput = z.output<typeof employeeFormSchema>;

export type CreateEmployeeInput = z.input<typeof employeeFormSchema>;
export type UpdateEmployeeInput = z.input<typeof employeeFormSchema>;

export type EmployeeDetails = z.output<typeof employeeSchema>;

export type EmployeeListItem = Pick<EmployeeDetails, "id" | "firstName" | "lastName" | "email" | "position">;

export type EmployeeListResponse = {
	items: EmployeeListItem[];
	totalCount: number;
	page: number;
	pageSize: number;
	pageCount: number;
};

export const EMPLOYEE_LIST_COLUMNS = ["firstName", "lastName", "email", "position"] as const;

export const employeeListColumnSchema = z.enum(EMPLOYEE_LIST_COLUMNS);

export type EmployeeListColumn = z.infer<typeof employeeListColumnSchema>;

export const employeeListFilterSchema = z
	.object({
		column: employeeListColumnSchema,
		value: z.string().trim().min(1).max(100),
	})
	.strict();

const employeeFiltersQuerySchema = z.preprocess((value) => {
	if (value === undefined || value === "") {
		return [];
	}

	if (typeof value !== "string") {
		return value;
	}

	try {
		return JSON.parse(value) as unknown;
	} catch {
		// Let the array schema produce a validation error.
		return value;
	}
}, z.array(employeeListFilterSchema).max(EMPLOYEE_LIST_COLUMNS.length));

export const employeeListQuerySchema = z
	.object({
		page: z.coerce.number().int().min(1).default(1),

		pageSize: z.coerce
			.number()
			.int()
			.refine((value) => [10, 25, 50].includes(value), {
				message: "Puslapio dydis turi būti 10, 25 arba 50",
			})
			.default(10),

		sortBy: employeeListColumnSchema.default("lastName"),

		sortOrder: z.enum(["asc", "desc"]).default("asc"),

		filters: employeeFiltersQuerySchema,
	})
	.strict();

export type EmployeeListQueryInput = z.input<typeof employeeListQuerySchema>;

export type EmployeeListQuery = z.output<typeof employeeListQuerySchema>;
