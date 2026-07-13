import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { employeeFormSchema, type Employee, type EmployeeFormInput, type EmployeeFormOutput } from "@stiekimas/schema";

import { Input } from "../../components/inputs/input";
import { Select } from "../../components/inputs/select";
import { DatePicker } from "../../components/inputs/date-picker";
import { CollapsibleFieldset } from "../../components/layouts/collapsible-fieldset";
import { apiRequest } from "../../lib/api";

type EmployeeFormProps = {
	onClose: () => void;
	initialData?: Employee | null;
};

const defaultValues = {
	firstName: "",
	lastName: "",
	email: "",
	address: "",
	position: "",
	personalCode: "",
	dateOfBirth: "",
	bankAccountNumber: "",
	basicSalary: 0,
	username: "",
	password: "",
	role: "employee",
} satisfies EmployeeFormInput;

const POSITION_OPTIONS = [
	{ value: "welder", label: "Suvirintojas" },
	{ value: "assembler", label: "Montuotojas" },
];

const ROLE_OPTIONS = [
	{ value: "employee", label: "Darbuotojas" },
	{ value: "admin", label: "Administratorius" },
];

export function EmployeeForm({ onClose, initialData }: EmployeeFormProps) {
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<EmployeeFormInput, unknown, EmployeeFormOutput>({
		resolver: zodResolver(employeeFormSchema),
		defaultValues,
		values: initialData || defaultValues,
		mode: "onTouched",
	});

	const onSubmit: SubmitHandler<EmployeeFormOutput> = async (data) => {
		try {
			if (initialData) {
				await apiRequest(`/api/employees/${initialData.id}`, {
					method: "PUT",
					body: JSON.stringify(data),
				});
			} else {
				const response = await apiRequest("/api/employees", {
					method: "POST",
					body: JSON.stringify(data),
				});

				console.log(response);
			}
			onClose();
		} catch (error) {
			console.error("Failed to save employee", error);
		}
	};

	const handleCancel = () => {
		reset(initialData || defaultValues);
		onClose();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
			{/* Personal Information Section */}
			<CollapsibleFieldset title="Asmeninė informacija">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
					<Input label="Vardas" {...register("firstName")} error={errors.firstName?.message} />
					<Input label="Pavardė" {...register("lastName")} error={errors.lastName?.message} />
					<Input label="Asmens kodas" {...register("personalCode")} error={errors.personalCode?.message} />

					<Controller
						name="dateOfBirth"
						control={control}
						render={({ field }) => <DatePicker label="Gimimo data" value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.dateOfBirth?.message} />}
					/>
				</div>
			</CollapsibleFieldset>

			{/* Contact Information Section */}
			<CollapsibleFieldset title="Kontaktinė informacija">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
					<Input label="El. paštas" type="email" {...register("email")} error={errors.email?.message} />
					<Input label="Adresas" {...register("address")} error={errors.address?.message} />
				</div>
			</CollapsibleFieldset>

			{/* Employment & Financial Section */}
			<CollapsibleFieldset title="Darbo ir finansų informacija">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
					<Select label="Pareigos" options={POSITION_OPTIONS} {...register("position")} error={errors.position?.message} />
					<Input label="Bazinė alga" type="number" step="0.01" {...register("basicSalary")} error={errors.basicSalary?.message} />
					<Input label="Banko sąskaitos numeris" {...register("bankAccountNumber")} error={errors.bankAccountNumber?.message} />
				</div>
			</CollapsibleFieldset>

			{/* Employment & Financial Section */}
			<CollapsibleFieldset title="Prisijungimo informacija">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
					<Input label="Vartotojo vardas" {...register("username")} error={errors.username?.message} />
					<Input label="Slaptažodis" {...register("password")} error={errors.password?.message} />
					<Select label="Vartotojo rolė" options={ROLE_OPTIONS} {...register("role")} error={errors.role?.message} />
				</div>
			</CollapsibleFieldset>

			<div className="mt-6 flex justify-end gap-3">
				<button type="button" onClick={handleCancel} className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
					Atšaukti
				</button>
				<button type="submit" disabled={isSubmitting} className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50">
					{isSubmitting ? "Išsaugoma..." : initialData ? "Atnaujinti" : "Sukurti"}
				</button>
			</div>
		</form>
	);
}
