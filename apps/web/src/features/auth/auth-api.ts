import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiRequest } from "../../lib/api";

export type AuthUser = {
	AuthUser: string;
	username: string;
	role: "admin" | "employee";
};

type AuthResponse = {
	user: AuthUser;
};

export type LoginInput = {
	username: string;
	password: string;
};

export async function login(input: LoginInput): Promise<AuthUser> {
	const response = await apiRequest<AuthResponse>("/api/auth/login", {
		method: "POST",
		body: JSON.stringify(input),
	});

	return response.user;
}

export async function logout(): Promise<void> {
	await apiRequest<void>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
	try {
		const response = await apiRequest<AuthResponse>("/api/auth/me");
		return response.user;
	} catch (error) {
		if (error instanceof ApiError && error.status === 401) {
			return null;
		}

		throw error;
	}
}

export const authQueryOptions = queryOptions({
	queryKey: ["auth", "me"],
	queryFn: getCurrentUser,
	staleTime: 60_000,
	retry: false,
});
