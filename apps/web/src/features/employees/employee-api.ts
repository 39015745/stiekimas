import type { EmployeeDetails, EmployeeFormOutput, EmployeeListItem, PaginatedResponse } from "@stiekimas/schema";

import { apiRequest } from "../../lib/api";
import type { TableState } from "../../components/table/data-table";

export const employeeKeys = {
	all: ["employees"] as const,

	lists: () => [...employeeKeys.all, "list"] as const,
	list: (state: TableState) => [...employeeKeys.lists(), state] as const,

	details: () => [...employeeKeys.all, "detail"] as const,
	detail: (id: string) => [...employeeKeys.details(), id] as const,
};

export function getEmployees(state: TableState, signal?: AbortSignal): Promise<PaginatedResponse<EmployeeListItem>> {
	const params = new URLSearchParams({
		page: String(state.page),
		pageSize: String(state.pageSize),
		sortBy: state.sortBy,
		sortOrder: state.sortOrder,
		filters: JSON.stringify(
			state.filters.map(({ column, value }) => ({
				column,
				value,
			})),
		),
	});

	return apiRequest<PaginatedResponse<EmployeeListItem>>(`/api/employees?${params.toString()}`, { signal });
}

export function getEmployee(id: string, signal?: AbortSignal) {
	return apiRequest<EmployeeDetails>(`/api/employees/${id}`, { signal });
}

export function createEmployee(data: EmployeeFormOutput) {
	return apiRequest<{ message: string }>("/api/employees", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function updateEmployee(id: string, data: EmployeeFormOutput) {
	return apiRequest<{ message: string }>(`/api/employees/${id}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export function deleteEmployee(id: string) {
	return apiRequest<{ message: string }>(`/api/employees/${id}`, {
		method: "DELETE",
	});
}

export function deleteEmployeeLogin(id: string) {
	return apiRequest<{ message: string }>(`/api/employees/${id}/login`, {
		method: "DELETE",
	});
}
