import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { EmployeeDetails } from "@stiekimas/schema";

import { POSITION_LABELS } from "../employee.constants";
import Drawer from "../../../components/layouts/drawer";
import { EmployeeForm } from "../employee-form";
import { authQueryOptions } from "../../auth/auth-api";
import { EmployeeLoginForm } from "../employee-login-form";
import { deleteEmployee, deleteEmployeeLogin, employeeKeys } from "../employee-api";
import { ActionOverlay, type ActionOverlayState } from "../../../components/layouts/action-overlay";
import { getErrorMessage } from "../../../lib/api";
import { useNavigate } from "react-router-dom";

type PendingAction = "deleteEmployee" | "deleteLogin" | null;
type CompletedAction = "deleteEmployee" | "deleteLogin" | null;

export function EmployeeDataTab({ employee }: { employee: EmployeeDetails }) {
	const [isDrawerOpen, setIsDrawerOpen] = useState("");
	const [overlayState, setOverlayState] = useState<ActionOverlayState>({ type: "closed" });
	const [pendingAction, setPendingAction] = useState<PendingAction>(null);
	const [completedAction, setCompletedAction] = useState<CompletedAction>(null);

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: user } = useQuery(authQueryOptions);
	const isAdmin = user?.role === "admin";

	const deleteLoginMutation = useMutation({
		mutationFn: () => deleteEmployeeLogin(employee.id),

		onSuccess: async (response) => {
			await queryClient.invalidateQueries({
				queryKey: employeeKeys.detail(employee.id),
			});

			setPendingAction(null);

			setOverlayState({
				type: "response",
				status: "success",
				title: "Prisijungimas ištrintas",
				message: response.message,
			});
		},

		onError: (error) => {
			setPendingAction(null);

			setOverlayState({
				type: "response",
				status: "error",
				title: "Nepavyko ištrinti prisijungimo",
				message: getErrorMessage(error),
			});
		},
	});

	const deleteEmployeeMutation = useMutation({
		mutationFn: () => deleteEmployee(employee.id),

		onSuccess: async (response) => {
			await queryClient.invalidateQueries({
				queryKey: employeeKeys.lists(),
			});

			setPendingAction(null);
			setCompletedAction("deleteEmployee");

			setOverlayState({
				type: "response",
				status: "success",
				title: "Atlikta",
				message: response.message,
			});
		},

		onError: (error) => {
			setPendingAction(null);

			setOverlayState({
				type: "response",
				status: "error",
				title: "Nepavyko ištrinti darbuotojo",
				message: getErrorMessage(error),
			});
		},
	});

	const handleDeleteEmployee = () => {
		setPendingAction("deleteEmployee");

		setOverlayState({
			type: "confirmation",
			title: "Ištrinti darbuotoją?",
			message: `Ar tikrai norite ištrinti darbuotoją ${employee.firstName} ${employee.lastName}?`,
			proceedLabel: "Ištrinti",
			cancelLabel: "Atšaukti",
		});
	};

	const handleDeleteLogin = () => {
		setPendingAction("deleteLogin");

		setOverlayState({
			type: "confirmation",
			title: "Ištrinti prisijungimą?",
			message: `Ar tikrai norite ištrinti ${employee.firstName} ${employee.lastName} prisijungimą?`,
			proceedLabel: "Ištrinti",
			cancelLabel: "Atšaukti",
		});
	};

	const handleProceed = () => {
		if (pendingAction === "deleteEmployee") {
			setOverlayState({ type: "loading", title: "Trinamas darbuotojas", message: "Prašome neuždaryti lango." });

			deleteEmployeeMutation.mutate();
			return;
		}

		if (pendingAction === "deleteLogin") {
			setOverlayState({ type: "loading", title: "Trinamas prisijungimas", message: "Prašome neuždaryti lango." });

			deleteLoginMutation.mutate();
		}
	};

	const handleCancel = () => {
		setPendingAction(null);
		setOverlayState({ type: "closed" });
	};

	const handleResponseClose = () => {
		const shouldNavigate = overlayState.type === "response" && overlayState.status === "success" && completedAction === "deleteEmployee";

		setOverlayState({ type: "closed" });
		setCompletedAction(null);

		if (shouldNavigate) {
			navigate("/employees");
		}
	};

	return (
		<>
			<h1 className="text-2xl font-bold text-foreground">
				{employee.firstName} {employee.lastName}
			</h1>

			<div className="flex flex-wrap my-6 gap-4">
				<button
					onClick={() => setIsDrawerOpen("editEmployee")}
					className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-600 cursor-pointer"
				>
					<Plus className="h-4 w-4" />
					Redaguoti duomenis
				</button>

				{isAdmin && (
					<>
						<button
							onClick={() => setIsDrawerOpen("login")}
							className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-600 cursor-pointer"
						>
							<Plus className="h-4 w-4" />
							{employee.login ? "Redaguoti prisijungimą" : "Sukurti prisijungimą"}
						</button>

						{employee.login && (
							<button
								type="button"
								onClick={() => handleDeleteLogin()}
								disabled={deleteLoginMutation.isPending}
								className="flex items-center gap-2 rounded-lg bg-white border border-red-600 px-4 py-2 font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
							>
								<Trash className="h-4 w-4" />
								Ištrinti prisijungimą
							</button>
						)}

						<button
							type="button"
							onClick={() => handleDeleteEmployee()}
							disabled={deleteEmployeeMutation.isPending}
							className="flex items-center gap-2 rounded-lg bg-white border border-red-600 px-4 py-2 font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
						>
							<Trash className="h-4 w-4" />
							Ištrinti darbuotoją
						</button>
					</>
				)}
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

			<Drawer isOpen={isDrawerOpen === "editEmployee"} onClose={() => setIsDrawerOpen("")} title="Redaguoti darbuotojo duomenis">
				<EmployeeForm onClose={() => setIsDrawerOpen("")} initialData={employee} />
			</Drawer>

			<Drawer isOpen={isDrawerOpen === "login"} onClose={() => setIsDrawerOpen("")} title={employee.login ? "Redaguoti darbuotojo prisijungimą" : "Sukurti darbuotojo prisijungimą"}>
				<EmployeeLoginForm onClose={() => setIsDrawerOpen("")} initialData={employee.login} employeeId={employee.id} />
			</Drawer>

			<ActionOverlay state={overlayState} onProceed={handleProceed} onCancel={handleCancel} onClose={handleResponseClose} />
		</>
	);
}
