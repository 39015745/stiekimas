import { useState } from "react";
import { Plus } from "lucide-react";

import Drawer from "../components/layouts/drawer";
import { EmployeeForm } from "../features/employees/employee-form";

export default function Employees() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<>
			{/* Page Header */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-foreground">Darbuotojai</h1>
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
				{/* Pass the initialData prop down to the form */}
				<EmployeeForm onClose={() => setIsDrawerOpen(false)} />
			</Drawer>

			{/* Main Content Area */}
			<div className="rounded-lg border border-border bg-surface p-8 text-center text-foreground">
				<p>Darbuotojų sąrašas tuščias.</p>
			</div>
		</>
	);
}
