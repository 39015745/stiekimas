import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Breadcrumbs } from "../components/ui/breadcrumbs";

import type { Employee } from "@stiekimas/schema";

import { apiRequest } from "../lib/api";
import { Spinner } from "../components/ui/loading-animations";
import { EmployeeDataTab } from "../features/employees/tabs/employee-data-tab";
import { EmployeeDocumentsTab } from "../features/employees/tabs/employee-documents-tab";

type TabType = "data" | "documents";

export default function EmployeeDetails() {
	const { id } = useParams<{ id: string }>();

	const [activeTab, setActiveTab] = useState<TabType>("data");

	const {
		data: employee,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["employees", id],
		queryFn: ({ signal }) => apiRequest<Employee>(`/api/employees/${id}`, { signal }),
		enabled: Boolean(id),
	});

	if (isPending)
		return (
			<div className="flex justify-center mt-32">
				<Spinner />
			</div>
		);
	if (isError || !employee) return <div>Nepavyko užkrauti darbuotojo duomenų.</div>;

	return (
		<>
			<Breadcrumbs items={[{ label: "Darbuotojai", to: "/employees" }, { label: `${employee.firstName} ${employee.lastName}` }]} />

			{/* 2. Tab Navigation Buttons */}
			<div className="border-b border-border mb-6">
				<nav className="-mb-px flex space-x-8" aria-label="Tabs">
					<button
						onClick={() => setActiveTab("data")}
						className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
							activeTab === "data" ? "border-primary-500 text-primary-600" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
						}`}
					>
						Darbuotojo duomenys
					</button>
					<button
						onClick={() => setActiveTab("documents")}
						className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
							activeTab === "documents" ? "border-primary-500 text-primary-600" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
						}`}
					>
						Dokumentai
					</button>
				</nav>
			</div>

			{activeTab === "data" && <EmployeeDataTab employee={employee} />}
			{activeTab === "documents" && <EmployeeDocumentsTab employeeId={id!} />}
		</>
	);
}
