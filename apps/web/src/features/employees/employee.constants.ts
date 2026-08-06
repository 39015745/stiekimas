import { EMPLOYEE_POSITIONS, type EmployeePosition } from "@stiekimas/schema";

export const POSITION_LABELS = {
	Suvirintojas: "Suvirintojas",
	Montuotojas: "Montuotojas",
} satisfies Record<EmployeePosition, string>;

export const POSITION_OPTIONS = EMPLOYEE_POSITIONS.map((value) => ({
	value,
	label: POSITION_LABELS[value],
}));
