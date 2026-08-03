import { USER_ROLES, type UserRole } from "@stiekimas/schema";

export const ROLE_LABELS = {
	employee: "Darbuotojas",
	admin: "Administratorius",
} satisfies Record<UserRole, string>;

export const ROLE_OPTIONS = USER_ROLES.map((value) => ({
	value,
	label: ROLE_LABELS[value],
}));
