// features/work-sessions/components/WorkSessionsTable.tsx

import { useMemo, useState } from "react";

import type { EmployeeListItem, ProjectListItem, WorkSessionMonthItem } from "../mock/workSessions.mock";

type SelectedDay = {
	employeeId: string;
	date: string;
};

type Props = {
	year: number;
	month: number;

	employees: EmployeeListItem[];
	projects: ProjectListItem[];
	sessions: WorkSessionMonthItem[];

	onDayClick: (selection: SelectedDay) => void;
	onBulkEdit: (selection: SelectedDay[]) => void;
};

export function WorkSessionsTable({ year, month, employees, projects, sessions, onDayClick, onBulkEdit }: Props) {
	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedDays, setSelectedDays] = useState<SelectedDay[]>([]);

	const days = useMemo(() => getMonthDays(year, month), [year, month]);

	const sessionsByEmployeeAndDate = useMemo(() => {
		const map = new Map<string, WorkSessionMonthItem[]>();

		for (const session of sessions) {
			const key = getCellKey(session.employeeId, session.date);
			const existing = map.get(key);

			if (existing) {
				existing.push(session);
			} else {
				map.set(key, [session]);
			}
		}

		return map;
	}, [sessions]);

	const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

	const selectedKeys = useMemo(() => new Set(selectedDays.map(({ employeeId, date }) => getCellKey(employeeId, date))), [selectedDays]);

	function handleCellClick(employeeId: string, date: string) {
		if (!selectionMode) {
			onDayClick({
				employeeId,
				date,
			});

			return;
		}

		const key = getCellKey(employeeId, date);

		setSelectedDays((current) => {
			const isSelected = current.some((day) => getCellKey(day.employeeId, day.date) === key);

			if (isSelected) {
				return current.filter((day) => getCellKey(day.employeeId, day.date) !== key);
			}

			return [
				...current,
				{
					employeeId,
					date,
				},
			];
		});
	}

	function handleToggleSelectionMode() {
		setSelectionMode((current) => {
			if (current) {
				setSelectedDays([]);
			}

			return !current;
		});
	}

	function handleBulkEdit() {
		if (!selectedDays.length) {
			return;
		}

		onBulkEdit(selectedDays);
	}

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="text-sm text-muted-foreground">{selectionMode ? `Pasirinkta dienų: ${selectedDays.length}` : "Paspauskite dieną norėdami peržiūrėti arba redaguoti."}</div>

				<div className="flex items-center gap-2">
					{selectionMode && selectedDays.length > 0 && (
						<button type="button" onClick={handleBulkEdit} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
							Redaguoti pasirinktus ({selectedDays.length})
						</button>
					)}

					<button type="button" onClick={handleToggleSelectionMode} className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
						{selectionMode ? "Atšaukti pasirinkimą" : "Pasirinkti kelias dienas"}
					</button>
				</div>
			</div>

			<div className="overflow-hidden rounded-lg border border-border bg-background">
				<div className="max-h-[calc(100vh-220px)] overflow-auto">
					<table className="w-max min-w-full border-collapse text-sm">
						<thead className="sticky top-0 z-20 bg-muted">
							<tr>
								<th className="sticky left-0 z-30 min-w-52 border-b border-r border-border bg-muted px-4 py-3 text-left font-semibold">Darbuotojas</th>

								{days.map((day) => {
									const isWeekend = day.weekDay === 0 || day.weekDay === 6;

									return (
										<th
											key={day.date}
											className={["min-w-16 border-b border-r border-border px-2 py-2 text-center font-medium", isWeekend ? "bg-muted/80 text-muted-foreground" : ""].join(" ")}
										>
											<div>{day.day}</div>

											<div className="text-xs font-normal text-muted-foreground">{day.weekDayLabel}</div>
										</th>
									);
								})}

								<th className="sticky right-0 z-30 min-w-24 border-b border-l border-border bg-muted px-3 py-3 text-center font-semibold">Viso</th>
							</tr>
						</thead>

						<tbody>
							{employees.map((employee) => {
								const employeeSessions = sessions.filter((session) => session.employeeId === employee.id);

								const employeeTotalMinutes = employeeSessions.reduce((total, session) => total + (session.totalMinutes ?? 0), 0);

								return (
									<tr key={employee.id} className="group hover:bg-muted/20">
										<th className="sticky left-0 z-10 border-b border-r border-border bg-background px-4 py-3 text-left font-medium group-hover:bg-muted">{employee.name}</th>

										{days.map((day) => {
											const cellKey = getCellKey(employee.id, day.date);

											const daySessions = sessionsByEmployeeAndDate.get(cellKey) ?? [];

											const totalMinutes = daySessions.reduce((total, session) => total + (session.totalMinutes ?? 0), 0);

											const isSelected = selectedKeys.has(cellKey);

											const isWeekend = day.weekDay === 0 || day.weekDay === 6;

											const title = getCellTitle(daySessions, projectMap);

											return (
												<td key={day.date} className={["border-b border-r border-border p-0", isWeekend ? "bg-muted/25" : ""].join(" ")}>
													<button
														type="button"
														title={title}
														onClick={() => handleCellClick(employee.id, day.date)}
														className={[
															"relative flex h-14 w-full min-w-16 items-center justify-center px-2 text-center transition-colors",
															"hover:bg-accent hover:text-accent-foreground",
															isSelected ? "bg-primary/15 ring-2 ring-inset ring-primary" : "",
														].join(" ")}
													>
														{totalMinutes > 0 ? (
															<div>
																<div className="font-semibold">{formatMinutes(totalMinutes)}</div>

																{daySessions.length > 1 && <div className="text-[10px] text-muted-foreground">{daySessions.length} įrašai</div>}
															</div>
														) : (
															<span className="text-muted-foreground/50">–</span>
														)}

														{isSelected && (
															<span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
																✓
															</span>
														)}
													</button>
												</td>
											);
										})}

										<td className="sticky right-0 z-10 border-b border-l border-border bg-background px-3 py-3 text-center font-semibold group-hover:bg-muted">
											{formatMinutes(employeeTotalMinutes)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function getCellKey(employeeId: string, date: string) {
	return `${employeeId}:${date}`;
}

function getMonthDays(year: number, month: number) {
	const daysInMonth = new Date(year, month, 0).getDate();

	return Array.from({ length: daysInMonth }, (_, index) => {
		const day = index + 1;
		const date = new Date(year, month - 1, day);
		const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

		return {
			day,
			date: dateString,
			weekDay: date.getDay(),
			weekDayLabel: new Intl.DateTimeFormat("lt-LT", {
				weekday: "short",
			})
				.format(date)
				.replace(".", ""),
		};
	});
}

function formatMinutes(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (!remainingMinutes) {
		return `${hours}:00`;
	}

	return `${hours}:${String(remainingMinutes).padStart(2, "0")}`;
}

function getCellTitle(sessions: WorkSessionMonthItem[], projects: Map<string, ProjectListItem>) {
	if (!sessions.length) {
		return "Nėra darbo įrašų";
	}

	return sessions
		.map((session) => {
			const project = session.projectId ? projects.get(session.projectId)?.name : undefined;

			return `${project ?? "Projektas nenurodytas"} – ${formatMinutes(session.totalMinutes ?? 0)}`;
		})
		.join("\n");
}
