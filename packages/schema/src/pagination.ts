export type PaginatedResponse<T> = {
	items: T[];
	totalCount: number;
	page: number;
	pageSize: number;
	pageCount: number;
};
