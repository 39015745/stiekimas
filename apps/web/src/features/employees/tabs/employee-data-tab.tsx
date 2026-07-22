import { useState } from "react";
import { Plus } from "lucide-react";

import type { Employee } from "@stiekimas/schema";

import { POSITION_LABELS } from "../constants";
import Drawer from "../../../components/layouts/drawer";
import { EmployeeForm } from "../employee-form";

type EmployeeDataTabProps = {
	employee: Employee;
};

export function EmployeeDataTab({ employee }: EmployeeDataTabProps) {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<>
			<h1 className="text-2xl font-bold text-foreground">
				{employee.firstName} {employee.lastName}
			</h1>

			<div className="flex flex-wrap my-6 gap-4">
				<button
					onClick={() => setIsDrawerOpen(true)}
					className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors cursor-pointer"
				>
					<Plus className="h-4 w-4" />
					Redaguoti duomenis
				</button>
			</div>

			<div className="flex flex-wrap gap-8">
				<div className="w-fit h-min text-sm rounded-lg border border-border bg-surface p-6">
					<p className="mb-4 text-base font-bold">Asmeninė informacija</p>
					<p className="border-b border-border pb-1">
						<span className="font-semibold">Asmens kodas:</span> {employee.personalCode}
					</p>
					<p className="pt-1">
						<span className="font-semibold">Gimimo data:</span> {employee.dateOfBirth}
					</p>
				</div>

				<div className="w-fit h-min text-sm rounded-lg border border-border bg-surface p-6">
					<p className="mb-4 text-base font-bold">Kontaktinė informacija</p>
					<p className="border-b border-border pb-1">
						<span className="font-semibold">El. paštas:</span> {employee.email}
					</p>
					<p className="pt-1">
						<span className="font-semibold">Adresas:</span> {employee.address}
					</p>
				</div>

				<div className="w-fit h-min text-sm rounded-lg border border-border bg-surface p-6">
					<p className="mb-4 text-base font-bold">Darbo ir finansų informacija</p>
					<p className="border-b border-border pb-1">
						<span className="font-semibold">Pareigos:</span> {POSITION_LABELS[employee.position] ?? employee.position}
					</p>
					<p className="border-b border-border py-1">
						<span className="font-semibold">Banko sąskatos nr.:</span> {employee.bankAccountNumber}
					</p>
					<p className="pt-1">
						<span className="font-semibold">Bazinė alga:</span> {employee.basicSalary}
					</p>
				</div>
			</div>

			<Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Redaguoti darbuotojo duomenis">
				<EmployeeForm onClose={() => setIsDrawerOpen(false)} initialData={employee} />
			</Drawer>
		</>
	);
}
