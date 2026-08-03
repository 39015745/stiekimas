export type MongoDuplicateKeyError = {
	code: 11000;
	keyPattern?: Record<string, number>;
	keyValue?: Record<string, unknown>;
};

export function isMongoDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
	return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === 11000;
}
