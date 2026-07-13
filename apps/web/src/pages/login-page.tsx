import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import stiekimasLogo from "../assets/stiekimas-logo.webp";

import { authQueryOptions, login } from "../features/auth/auth-api";
import { ApiError } from "../lib/api";

const loginSchema = z.object({
	name: z.string().trim().min(1, "Enter your name"),
	password: z.string().min(1, "Enter your password"),
});

type LocationState = {
	from?: string;
};

export function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);

	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess: (user) => {
			queryClient.setQueryData(authQueryOptions.queryKey, user);
			const state = location.state as LocationState | null;
			navigate(state?.from ?? "/dashboard", { replace: true });
		},
	});

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setValidationError(null);

		const parsed = loginSchema.safeParse({ name, password });

		if (!parsed.success) {
			setValidationError(parsed.error.issues[0]?.message ?? "Check your details");
			return;
		}

		loginMutation.mutate(parsed.data);
	}

	const serverError = loginMutation.error instanceof ApiError ? loginMutation.error.message : loginMutation.isError ? "Unable to sign in" : null;

	return (
		<main className="flex items-center justify-center min-h-screen w-full bg-slate-100">
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
				<img src={stiekimasLogo} alt="Stiekimas Logo" className="mx-auto mb-10 h-8 w-auto object-contain" />

				<form className="space-y-5" onSubmit={handleSubmit}>
					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-700">Vartotojas</span>
						<input
							autoComplete="username"
							autoFocus
							className="h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
							disabled={loginMutation.isPending}
							onChange={(event) => setName(event.target.value)}
							value={name}
						/>
					</label>

					<label className="block">
						<span className="mb-2 block text-sm font-medium text-slate-700">Slaptažodis</span>
						<input
							autoComplete="current-password"
							className="h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
							disabled={loginMutation.isPending}
							onChange={(event) => setPassword(event.target.value)}
							type="password"
							value={password}
						/>
					</label>

					{(validationError || serverError) && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{validationError ?? serverError}</p>}

					<button
						className="h-11 w-full rounded-lg bg-primary-400 px-4 font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
						disabled={loginMutation.isPending}
						type="submit"
					>
						{loginMutation.isPending ? "Jungiamasi..." : "Prisijungti"}
					</button>
				</form>
			</div>
		</main>
	);
}
