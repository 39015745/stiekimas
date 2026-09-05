import type { EmployeeLoginFormOutput } from "@stiekimas/schema";
import { apiRequest } from "../../lib/api";

export function createEmployeeLogin(employeeId: string, data: EmployeeLoginFormOutput) {
	return apiRequest<{ message: string }>(`/api/employees/${employeeId}/login`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function updateEmployeeLogin(employeeId: string, data: EmployeeLoginFormOutput) {
	return apiRequest<{ message: string }>(`/api/employees/${employeeId}/login`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export function deleteEmployeeLogin(employeeId: string) {
	return apiRequest<{ message: string }>(`/api/employees/${employeeId}/login`, {
		method: "DELETE",
	});
}
