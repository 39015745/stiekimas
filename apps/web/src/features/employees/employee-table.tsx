import { apiRequest } from "../../lib/api";
import { DataTable, type PaginatedResponse, type TableColumn, type TableState } from "../../components/table/data-table";
import { POSITION_LABELS } from "./constants";

export type EmployeeListItem = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	position: string;
};

const columns: readonly TableColumn<EmployeeListItem>[] = [
	{
		key: "firstName",
		header: "Vardas",
		sortKey: "firstName",
		render: (employee) => employee.firstName,
	},
	{
		key: "lastName",
		header: "Pavardė",
		sortKey: "lastName",
		render: (employee) => employee.lastName,
	},
	{
		key: "email",
		header: "El. paštas",
		sortKey: "email",
		render: (employee) => employee.email,
	},
	{
		key: "position",
		header: "Pareigos",
		sortKey: "position",
		render: (employee) => POSITION_LABELS[employee.position] ?? employee.position,
	},
];

async function loadEmployees(state: TableState, signal: AbortSignal): Promise<PaginatedResponse<EmployeeListItem>> {
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

export function EmployeeTable() {
	return (
		<DataTable<EmployeeListItem>
			columns={columns}
			filterOptions={[
				{ value: "firstName", label: "Vardas" },
				{ value: "lastName", label: "Pavardė" },
				{ value: "email", label: "El. paštas" },
				{ value: "position", label: "Pareigos" },
			]}
			getRowId={(employee) => employee.id}
			queryKey={(state) => ["employees", state]}
			loadData={loadEmployees}
			initialSortBy="lastName"
			emptyMessage="Darbuotojų nerasta."
		/>
	);
}
