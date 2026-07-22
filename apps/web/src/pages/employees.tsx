import { useState } from "react";
import { Plus } from "lucide-react";

import Drawer from "../components/layouts/drawer";
import { EmployeeForm } from "../features/employees/employee-form";
import { EmployeeTable } from "../features/employees/employee-table";

export default function Employees() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<>
			{/* Page Header */}
			<h1 className="text-2xl font-bold text-foreground">Darbuotojai</h1>
			<div className="flex items-center justify-between my-6">
				<button
					onClick={() => setIsDrawerOpen(true)}
					className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors cursor-pointer"
				>
					<Plus className="h-4 w-4" />
					Pridėti darbuotoją
				</button>
			</div>

			{/* Slide-in Drawer */}
			<Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={"Sukurti naują darbuotoją"}>
				<EmployeeForm onClose={() => setIsDrawerOpen(false)} />
			</Drawer>

			{/* Main Content Area */}
			<EmployeeTable />
		</>
	);
}
