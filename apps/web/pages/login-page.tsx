import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

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

  const serverError =
    loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : loginMutation.isError
        ? "Unable to sign in"
        : null;

  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="text-xl font-semibold tracking-tight">Stiekimas</div>
        <div className="max-w-lg">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Work management
          </p>
          <h1 className="text-5xl font-semibold leading-tight">
            Manage employees, projects and working time.
          </h1>
        </div>
        <p className="text-sm text-slate-400">Secure administration dashboard</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-slate-500 lg:hidden">Stiekimas</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your account name and password.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
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
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-950 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                disabled={loginMutation.isPending}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            {(validationError || serverError) && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {validationError ?? serverError}
              </p>
            )}

            <button
              className="h-11 w-full rounded-lg bg-slate-950 px-4 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loginMutation.isPending}
              type="submit"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
