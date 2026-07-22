const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
		this.name = "ApiError";
	}
}

type ErrorResponse = {
	message?: string;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
	const headers = new Headers(options.headers);

	if (options.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers,
		credentials: "include",
	});

	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as ErrorResponse;
		throw new ApiError(body.message ?? "Request failed", response.status);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "Įvyko nenumatyta klaida. Bandykite dar kartą.";
}
