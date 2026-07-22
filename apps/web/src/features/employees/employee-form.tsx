import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { employeeFormSchema, type Employee, type EmployeeFormInput, type EmployeeFormOutput } from "@stiekimas/schema";

import { Input } from "../../components/inputs/input";
import { Select } from "../../components/inputs/select";
import { DatePicker } from "../../components/inputs/date-picker";
import { CollapsibleFieldset } from "../../components/layouts/collapsible-fieldset";
import { ActionOverlay, type ActionOverlayState } from "../../components/layouts/action-overlay";
import { apiRequest, getErrorMessage } from "../../lib/api";
import { POSITION_OPTIONS, ROLE_OPTIONS } from "./constants";

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
	hasLogin: false,
	manageLogin: false,
	username: "",
	password: "",
	role: "employee",
} satisfies EmployeeFormInput;

function getEmployeeFormValues(employee?: Employee | null): EmployeeFormInput {
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
		hasLogin: employee.hasLogin,
		manageLogin: false,
		username: employee.username ?? "",
		password: "",
		role: employee.role,
	};
}

export function EmployeeForm({ onClose, initialData }: EmployeeFormProps) {
	const {
		register,
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<EmployeeFormInput, unknown, EmployeeFormOutput>({
		resolver: zodResolver(employeeFormSchema),
		defaultValues: getEmployeeFormValues(initialData),
		mode: "onTouched",
	});

	const queryClient = useQueryClient();
	const manageLogin = watch("manageLogin");
	const hasExistingLogin = Boolean(initialData?.hasLogin);

	const [overlayState, setOverlayState] = useState<ActionOverlayState>({ type: "closed" });

	const saveEmployeeMutation = useMutation({
		mutationFn: async (data: EmployeeFormOutput) => {
			if (initialData) {
				return apiRequest(`/api/employees/${initialData.id}`, {
					method: "PUT",
					body: JSON.stringify(data),
				});
			}
			return apiRequest("/api/employees", {
				method: "POST",
				body: JSON.stringify(data),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });

			setOverlayState({
				type: "response",
				status: "success",
				title: initialData ? "Darbuotojas atnaujintas" : "Darbuotojas sukurtas",
				message: initialData ? "Darbuotojo informacija sėkmingai atnaujinta." : "Naujas darbuotojas sėkmingai sukurtas.",
			});
		},
		onError: (error) => {
			console.error("Failed to save employee", error);
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

		if (wasSuccessful) {
			onClose();
		}
	};

	const isPending = saveEmployeeMutation.isPending;

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
						<Select label="Pareigos" options={POSITION_OPTIONS} {...register("position")} error={errors.position?.message} />
						<Input label="Bazinė alga" type="number" step="0.01" {...register("basicSalary", { valueAsNumber: true })} error={errors.basicSalary?.message} />
						<Input label="Banko sąskaitos numeris" {...register("bankAccountNumber")} error={errors.bankAccountNumber?.message} />
					</div>
				</CollapsibleFieldset>

				{/* Login information Section */}
				<CollapsibleFieldset title="Prisijungimo informacija">
					<div className="space-y-4 p-4">
						<div className="flex items-center gap-2">
							<input id="manageLogin" type="checkbox" {...register("manageLogin")} className="h-4 w-4" />
							<label htmlFor="manageLogin">{hasExistingLogin ? "Redaguoti prisijungimo duomenis" : "Sukurti prisijungimą sistemai"}</label>
						</div>

						{manageLogin && (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Input label="Vartotojo vardas" {...register("username")} error={errors.username?.message} />
								<Input
									label={hasExistingLogin ? "Naujas slaptažodis" : "Slaptažodis"}
									type="password"
									autoComplete="new-password"
									{...register("password")}
									error={errors.password?.message}
								/>
								<Select label="Vartotojo rolė" options={ROLE_OPTIONS} {...register("role")} error={errors.role?.message} />

								{hasExistingLogin && <p className="text-sm text-muted-foreground md:col-span-2">Palikite slaptažodį tuščią, jeigu jo keisti nereikia.</p>}
							</div>
						)}
					</div>
				</CollapsibleFieldset>

				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={handleCancel}
						disabled={isPending}
						className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
					>
						Atšaukti
					</button>

					<button
						type="submit"
						disabled={isPending}
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
