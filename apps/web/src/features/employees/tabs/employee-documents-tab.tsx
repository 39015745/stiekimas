import { useQuery } from "@tanstack/react-query";
// import { apiRequest } from "../../../lib/api";

type EmployeeDocumentsTabProps = {
	employeeId: string;
};

export function EmployeeDocumentsTab({ employeeId }: EmployeeDocumentsTabProps) {
	// This fetch is deferred until the user opens the tab
	const {
		data: documents,
		isPending,
		isError,
	} = useQuery({
		queryKey: ["employee-documents", employeeId],
		queryFn: () => Promise.resolve([]), // apiRequest(`/api/employees/${employeeId}/documents`)
	});

	if (isPending) return <div className="p-6 text-muted-foreground">Kraunami dokumentai...</div>;
	if (isError) return <div className="p-6 text-red-500">Nepavyko gauti dokumentų.</div>;

	return (
		<div className="rounded-lg border border-border bg-surface p-6 animate-in fade-in duration-200">
			<h2 className="mb-4 text-lg font-semibold text-foreground">Dokumentai</h2>

			{documents?.length === 0 ? <p className="text-muted-foreground">Šiam darbuotojui dokumentų neįkelta.</p> : <ul>{/* Render documents list */}</ul>}
		</div>
	);
}
