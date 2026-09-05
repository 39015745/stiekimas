// pages/WorkSessionsPage.tsx

import { useState } from "react";

import { WorkSessionsTable } from "@/features/work-sessions/components/WorkSessionsTable";
import { mockEmployees, mockProjects, mockWorkSessions } from "@/features/work-sessions/mock/workSessions.mock";

type SelectedDay = {
	employeeId: string;
	date: string;
};

type DrawerState =
	| {
			type: "closed";
	  }
	| {
			type: "day";
			employeeId: string;
			date: string;
	  }
	| {
			type: "bulk";
			days: SelectedDay[];
	  };

export default function WorkSessionsPage() {
	const [year] = useState(2026);
	const [month] = useState(9);

	const [drawerState, setDrawerState] = useState<DrawerState>({
		type: "closed",
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Darbo laiko apskaita</h1>

				<p className="text-sm text-muted-foreground">2026 m. rugsėjis</p>
			</div>

			<WorkSessionsTable
				year={year}
				month={month}
				employees={mockEmployees}
				projects={mockProjects}
				sessions={mockWorkSessions}
				onDayClick={({ employeeId, date }) => {
					setDrawerState({
						type: "day",
						employeeId,
						date,
					});
				}}
				onBulkEdit={(days) => {
					setDrawerState({
						type: "bulk",
						days,
					});
				}}
			/>

			{/* Temporary, just so you can see what the table sends */}
			{drawerState.type !== "closed" && <pre className="rounded-lg border bg-muted p-4 text-xs">{JSON.stringify(drawerState, null, 2)}</pre>}
		</div>
	);
}
