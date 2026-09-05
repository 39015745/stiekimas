import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeeFormSchema, type EmployeeDetails, type EmployeeFormInput, type EmployeeFormOutput } from "@stiekimas/schema";

import { Input } from "../../components/inputs/input";
import { Select } from "../../components/inputs/select";
import { DatePicker } from "../../components/inputs/date-picker";
import { authQueryOptions } from "../../features/auth/auth-api";
import { CollapsibleFieldset } from "../../components/layouts/collapsible-fieldset";
import { ActionOverlay, type ActionOverlayState } from "../../components/layouts/action-overlay";
import { getErrorMessage } from "../../lib/api";
import { POSITION_OPTIONS } from "./employee.constants";
import { createEmployee, updateEmployee } from "./employee-api";

type EmployeeFormProps = {
	onClose: () => void;
	initialData?: EmployeeDetails | null;
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
} satisfies EmployeeFormInput;

function getEmployeeFormValues(employee?: EmployeeDetails | null): EmployeeFormInput {
	if (!employee) {
		return defaultValues;
	}

	return {
		firstName: employee.firstName,
		lastName: employee.lastName,
		email: employee.email,
		address: employee.address,
		position: employee.position,
		personalCode: employee.personalCode,
		dateOfBirth: employee.dateOfBirth,
		bankAccountNumber: employee.bankAccountNumber,
		basicSalary: employee.basicSalary,
	};
}

export function EmployeeForm({ onClose, initialData }: EmployeeFormProps) {
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<EmployeeFormInput, unknown, EmployeeFormOutput>({
		resolver: zodResolver(employeeFormSchema),
		defaultValues: getEmployeeFormValues(initialData),
		mode: "onTouched",
	});

	const [overlayState, setOverlayState] = useState<ActionOverlayState>({ type: "closed" });

	const authQuery = useQuery(authQueryOptions);
	const queryClient = useQueryClient();

	const isAdmin = authQuery.data?.role === "admin";

	const saveEmployeeMutation = useMutation({
		mutationFn: (data: EmployeeFormOutput) => (initialData ? updateEmployee(initialData.id, data) : createEmployee(data)),

		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });

			setOverlayState({
				type: "response",
				status: "success",
				title: "Atlikta",
				message: response.message,
			});
		},
		onError: (error) => {
			setOverlayState({
				type: "response",
				status: "error",
				title: "Nepavyko išsaugoti",
				message: getErrorMessage(error),
			});
		},
	});

	const onSubmit: SubmitHandler<EmployeeFormOutput> = (data) => {
		setOverlayState({
			type: "loading",
			title: initialData ? "Atnaujinamas darbuotojas" : "Kuriamas darbuotojas",
			message: "Prašome neuždaryti lango.",
		});

		saveEmployeeMutation.mutate(data);
	};

	const handleCancel = () => {
		reset(getEmployeeFormValues(initialData));
		onClose();
	};

	const handleResponseClose = () => {
		const wasSuccessful = overlayState.type === "response" && overlayState.status === "success";
		setOverlayState({ type: "closed" });

		if (wasSuccessful) onClose();
	};

	return (
		<>
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
						{isAdmin && <Select label="Pareigos" options={POSITION_OPTIONS} {...register("position")} error={errors.position?.message} />}
						{isAdmin && <Input label="Bazinė alga" type="number" step="0.01" {...register("basicSalary", { valueAsNumber: true })} error={errors.basicSalary?.message} />}
						<Input label="Banko sąskaitos numeris" {...register("bankAccountNumber")} error={errors.bankAccountNumber?.message} />
					</div>
				</CollapsibleFieldset>

				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={handleCancel}
						disabled={saveEmployeeMutation.isPending}
						className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
					>
						Atšaukti
					</button>

					<button
						type="submit"
						disabled={saveEmployeeMutation.isPending}
						className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Išsaugoti
					</button>
				</div>
			</form>

			<ActionOverlay state={overlayState} onClose={handleResponseClose} />
		</>
	);
}
