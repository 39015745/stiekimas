const cards = [
	{ label: "Employees", value: "0" },
	{ label: "Active projects", value: "0" },
	{ label: "Working today", value: "0" },
	{ label: "Pending approvals", value: "0" },
];

export function DashboardHomePage() {
	return (
		<div>
			<div className="mb-6">
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">Apžvalga</h1>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{cards.map((card) => (
					<article className="rounded-xl border border-border bg-surface p-5 shadow-sm" key={card.label}>
						<p className="text-sm font-medium text-primary-400">{card.label}</p>
						<p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
					</article>
				))}
			</div>

			<section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
				<h2 className="font-semibold">Recent activity</h2>
				<p className="mt-6 text-sm text-slate-500">No activity yet.</p>
			</section>
		</div>
	);
}
