import { DataTable, type TableColumn } from "../../components/table/data-table";
import { POSITION_LABELS } from "./employee.constants";
import type { EmployeeListItem } from "@stiekimas/schema";
import { getEmployees, employeeKeys } from "./employee-api";

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
			queryKey={(state) => employeeKeys.list(state)}
			loadData={getEmployees}
			initialSortBy="lastName"
			emptyMessage="Darbuotojų nerasta."
		/>
	);
}
