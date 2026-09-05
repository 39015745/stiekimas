import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEmployeeLoginSchema, updateEmployeeLoginSchema, type EmployeeLoginDetails, type EmployeeLoginFormInput, type EmployeeLoginFormOutput } from "@stiekimas/schema";

import { Input } from "../../components/inputs/input";
import { Select } from "../../components/inputs/select";
import { CollapsibleFieldset } from "../../components/layouts/collapsible-fieldset";
import { ActionOverlay, type ActionOverlayState } from "../../components/layouts/action-overlay";
import { getErrorMessage } from "../../lib/api";
import { ROLE_OPTIONS } from "./employee-login.constants";
import { createEmployeeLogin, updateEmployeeLogin } from "./employee-login-api";
import { employeeKeys } from "./employee-api";

type EmployeeLoginFormProps = {
	onClose: () => void;
	initialData?: EmployeeLoginDetails | null;
	employeeId: string;
};

const defaultValues = {
	username: "",
	password: "",
	role: "employee",
} satisfies EmployeeLoginFormInput;

function getEmployeeLoginFormValues(loginDetails?: EmployeeLoginDetails | null): EmployeeLoginFormInput {
	if (!loginDetails) {
		return defaultValues;
	}

	return {
		username: loginDetails.username,
		password: "",
		role: loginDetails.role,
	};
}

export function EmployeeLoginForm({ onClose, initialData, employeeId }: EmployeeLoginFormProps) {
	const loginFormSchema = initialData ? updateEmployeeLoginSchema : createEmployeeLoginSchema;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<EmployeeLoginFormInput, unknown, EmployeeLoginFormOutput>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: getEmployeeLoginFormValues(initialData),
		mode: "onTouched",
	});

	const queryClient = useQueryClient();

	const [overlayState, setOverlayState] = useState<ActionOverlayState>({ type: "closed" });

	const saveLoginMutation = useMutation({
		mutationFn: (data: EmployeeLoginFormOutput) => {
			if (initialData) {
				return updateEmployeeLogin(employeeId, data);
			}

			return createEmployeeLogin(employeeId, data);
		},

		onSuccess: async (response) => {
			await queryClient.invalidateQueries({
				queryKey: employeeKeys.detail(employeeId),
			});

			setOverlayState({
				type: "response",
				status: "success",
				title: "Atlikta",
				message: response.message,
			});
		},

		onError: (error) => {
			console.error("Failed to save employee login", error);

			setOverlayState({
				type: "response",
				status: "error",
				title: "Nepavyko išsaugoti prisijungimo",
				message: getErrorMessage(error),
			});
		},
	});

	const onSubmit: SubmitHandler<EmployeeLoginFormOutput> = (data) => {
		setOverlayState({
			type: "loading",
			title: initialData ? "Atnaujinamas prisijungimas" : "Kuriamas prisijungimas",
			message: "Prašome neuždaryti lango.",
		});

		saveLoginMutation.mutate(data);
	};

	const handleCancel = () => {
		reset(getEmployeeLoginFormValues(initialData));
		onClose();
	};

	const handleResponseClose = () => {
		const wasSuccessful = overlayState.type === "response" && overlayState.status === "success";
		setOverlayState({ type: "closed" });

		if (wasSuccessful) {
			onClose();
		}
	};

	const isPending = saveLoginMutation.isPending;

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
				{/* Login information Section */}
				<CollapsibleFieldset title="Prisijungimo informacija">
					<div className="space-y-4 p-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<Input label="Vartotojo vardas" {...register("username")} error={errors.username?.message} />
							<Input label={initialData ? "Naujas slaptažodis" : "Slaptažodis"} type="password" autoComplete="new-password" {...register("password")} error={errors.password?.message} />
							<Select label="Vartotojo rolė" options={ROLE_OPTIONS} {...register("role")} error={errors.role?.message} />

							{initialData && <p className="text-sm text-muted-foreground md:col-span-2">Palikite slaptažodį tuščią, jeigu jo keisti nereikia.</p>}
						</div>
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
