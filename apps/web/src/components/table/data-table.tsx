import { keepPreviousData, useQuery, type QueryKey } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type SortOrder = "asc" | "desc";

export type TableFilter = {
	column: string;
	label: string;
	value: string;
};

export type TableState = {
	page: number;
	pageSize: number;
	sortBy: string;
	sortOrder: SortOrder;
	filters: TableFilter[];
};

export type PaginatedResponse<T> = {
	items: T[];
	totalCount: number;
	page: number;
	pageSize: number;
	pageCount: number;
};

export type TableColumn<T> = {
	key: string;
	header: string;
	sortKey?: string;
	className?: string;
	render: (row: T) => ReactNode;
};

export type TableFilterOption = {
	value: string;
	label: string;
};

type DataTableProps<T> = {
	columns: readonly TableColumn<T>[];
	filterOptions?: readonly TableFilterOption[];
	getRowId: (row: T) => string;
	queryKey: (state: TableState) => QueryKey;
	loadData: (state: TableState, signal: AbortSignal) => Promise<PaginatedResponse<T>>;
	initialSortBy: string;
	initialSortOrder?: SortOrder;
	emptyMessage?: string;
};

type PaginationItem = number | "left-ellipsis" | "right-ellipsis";

function getPaginationItems(currentPage: number, pageCount: number): PaginationItem[] {
	if (pageCount <= 7) {
		return Array.from({ length: pageCount }, (_, index) => index + 1);
	}

	const items: PaginationItem[] = [1];

	if (currentPage > 4) {
		items.push("left-ellipsis");
	}

	const start = Math.max(2, currentPage - 1);
	const end = Math.min(pageCount - 1, currentPage + 1);

	for (let page = start; page <= end; page += 1) {
		items.push(page);
	}

	if (currentPage < pageCount - 3) {
		items.push("right-ellipsis");
	}

	items.push(pageCount);

	return items;
}

export function DataTable<T>({ columns, filterOptions = [], getRowId, queryKey, loadData, initialSortBy, initialSortOrder = "asc", emptyMessage = "Įrašų nerasta." }: DataTableProps<T>) {
	const navigate = useNavigate();

	const [tableState, setTableState] = useState<TableState>({
		page: 1,
		pageSize: 10,
		sortBy: initialSortBy,
		sortOrder: initialSortOrder,
		filters: [],
	});

	const [filterColumn, setFilterColumn] = useState("");
	const [filterValue, setFilterValue] = useState("");

	const query = useQuery({
		queryKey: queryKey(tableState),
		queryFn: ({ signal }) => loadData(tableState, signal),
		placeholderData: keepPreviousData,
	});

	console.log("zzzzz", query.data);

	const pageCount = query.data?.pageCount ?? 0;
	const paginationItems = getPaginationItems(tableState.page, pageCount);

	if (pageCount > 0 && tableState.page > pageCount) {
		setTableState((current) => ({
			...current,
			page: pageCount,
		}));
	}

	function handleSort(sortBy: string) {
		setTableState((current) => ({
			...current,
			page: 1,
			sortBy,
			sortOrder: current.sortBy === sortBy ? (current.sortOrder === "asc" ? "desc" : "asc") : "asc",
		}));
	}

	function handleAddFilter(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const value = filterValue.trim();
		const option = filterOptions.find((item) => item.value === filterColumn);

		if (!option || !value) {
			return;
		}

		setTableState((current) => ({
			...current,
			page: 1,
			filters: [
				...current.filters.filter((filter) => filter.column !== option.value),
				{
					column: option.value,
					label: option.label,
					value,
				},
			],
		}));

		setFilterValue("");
	}

	function removeFilter(column: string) {
		setTableState((current) => ({
			...current,
			page: 1,
			filters: current.filters.filter((filter) => filter.column !== column),
		}));
	}

	function clearFilters() {
		setFilterColumn("");
		setFilterValue("");

		setTableState((current) => ({
			...current,
			page: 1,
			filters: [],
		}));
	}

	return (
		<div className="space-y-4 w-fit">
			{filterOptions.length > 0 && (
				<form onSubmit={handleAddFilter} className="flex flex-wrap items-end gap-3">
					<label className="space-y-1">
						<span className="block text-sm font-medium text-foreground">Stulpelis</span>

						<select value={filterColumn} onChange={(event) => setFilterColumn(event.target.value)} className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground">
							<option value="">Pasirinkite</option>

							{filterOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					<label className="min-w-60 flex-1 space-y-1">
						<span className="block text-sm font-medium text-foreground">Reikšmė</span>

						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

							<input
								value={filterValue}
								onChange={(event) => setFilterValue(event.target.value)}
								placeholder="Įveskite reikšmę"
								className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground"
							/>
						</div>
					</label>

					<button
						type="submit"
						disabled={!filterColumn || !filterValue.trim()}
						className="h-10 rounded-md bg-primary-500 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
					>
						Filtruoti
					</button>

					<button
						type="button"
						onClick={clearFilters}
						disabled={tableState.filters.length === 0}
						className="h-10 rounded-md border border-border px-4 text-sm font-medium text-foreground disabled:opacity-50"
					>
						Išvalyti
					</button>
				</form>
			)}

			{tableState.filters.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{tableState.filters.map((filter) => (
						<div key={filter.column} className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm">
							<span>
								{filter.label}: {filter.value}
							</span>

							<button type="button" onClick={() => removeFilter(filter.column)} aria-label={`Pašalinti filtrą ${filter.label}`} className="rounded p-0.5 hover:bg-muted">
								<X className="h-3.5 w-3.5" />
							</button>
						</div>
					))}
				</div>
			)}

			<div className="w-min overflow-x-auto rounded-lg border border-border bg-surface">
				<table className="min-w-full whitespace-nowrap text-left text-sm">
					<thead className="border-b border-border bg-muted/40">
						<tr>
							{columns.map((column) => {
								const isSorted = column.sortKey === tableState.sortBy;

								return (
									<th
										key={column.key}
										scope="col"
										aria-sort={!column.sortKey ? undefined : isSorted ? (tableState.sortOrder === "asc" ? "ascending" : "descending") : "none"}
										className="px-4 py-3 font-semibold text-foreground"
									>
										{column.sortKey ? (
											<button type="button" onClick={() => handleSort(column.sortKey!)} className="flex items-center gap-2">
												{column.header}

												<span aria-hidden="true" className="w-3 text-xs">
													{isSorted ? (tableState.sortOrder === "asc" ? "▲" : "▼") : ""}
												</span>
											</button>
										) : (
											column.header
										)}
									</th>
								);
							})}
						</tr>
					</thead>

					<tbody className={query.isFetching ? "opacity-70" : ""}>
						{query.isPending &&
							Array.from({
								length: Math.min(tableState.pageSize, 10),
							}).map((_, index) => (
								<tr key={index} className="border-b border-border last:border-b-0">
									<td colSpan={columns.length} className="h-11 overflow-hidden">
										<div
											className="h-full w-[500%] shimmer bg-linear-to-r from-transparent from-10% via-primary-100 dark:via-primary-200 to-transparent to-90%"
											style={{ animationDelay: `${index * 0.1}s` }}
										/>
									</td>
								</tr>
							))}

						{query.isError && (
							<tr>
								<td colSpan={columns.length} className="px-4 py-8 text-center text-red-600">
									Duomenų gauti nepavyko.
								</td>
							</tr>
						)}

						{query.data?.items.map((row) => (
							<tr key={getRowId(row)} className="border-b cursor-pointer border-border last:border-b-0 hover:bg-primary-100/50" onClick={() => navigate(`/employees/${getRowId(row)}`)}>
								{columns.map((column) => (
									<td key={column.key} className={`px-4 py-3 text-foreground ${column.className ?? ""}`}>
										{column.render(row)}
									</td>
								))}
							</tr>
						))}

						{query.data && query.data.items.length === 0 && (
							<tr>
								<td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
									{emptyMessage}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<label className="flex items-center gap-2 text-sm text-foreground">
				Rodyti
				<select
					value={tableState.pageSize}
					onChange={(event) =>
						setTableState((current) => ({
							...current,
							page: 1,
							pageSize: Number(event.target.value),
						}))
					}
					className="h-9 w-12 rounded-md border border-border bg-surface"
				>
					<option value={10}>10</option>
					<option value={25}>25</option>
					<option value={50}>50</option>
				</select>
			</label>

			<div className="flex flex-wrap items-center justify-between gap-4">
				<nav aria-label="Lentelės puslapiai" className="flex items-center gap-1">
					<button
						type="button"
						onClick={() =>
							setTableState((current) => ({
								...current,
								page: current.page - 1,
							}))
						}
						disabled={tableState.page <= 1}
						aria-label="Ankstesnis puslapis"
						className="rounded-md border border-border p-2 disabled:opacity-40"
					>
						<ChevronLeft className="h-4 w-4" />
					</button>

					{paginationItems.map((item) =>
						typeof item === "number" ? (
							<button
								key={item}
								type="button"
								onClick={() =>
									setTableState((current) => ({
										...current,
										page: item,
									}))
								}
								aria-current={item === tableState.page ? "page" : undefined}
								className={`h-9 min-w-9 rounded-md px-2 text-sm ${item === tableState.page ? "bg-primary-500 text-white" : "border border-border text-foreground"}`}
							>
								{item}
							</button>
						) : (
							<span key={item} className="w-8 text-center text-muted-foreground">
								…
							</span>
						),
					)}

					<button
						type="button"
						onClick={() =>
							setTableState((current) => ({
								...current,
								page: current.page + 1,
							}))
						}
						disabled={pageCount === 0 || tableState.page >= pageCount}
						aria-label="Kitas puslapis"
						className="rounded-md border border-border p-2 disabled:opacity-40"
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</nav>
				<p className="text-sm text-muted-foreground">
					Puslapis <strong>{pageCount === 0 ? 0 : tableState.page}</strong> iš <strong>{pageCount}</strong>. Iš viso <strong>{query.data?.totalCount ?? 0}</strong>.
				</p>
			</div>
		</div>
	);
}
