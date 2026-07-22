import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export type BreadcrumbItem = {
	label: string;
	to?: string;
};

type BreadcrumbsProps = {
	items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
	return (
		<nav aria-label="Breadcrumb" className="mb-4">
			<ol className="flex items-center text-sm text-muted-foreground">
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<li key={item.label} className="flex items-center">
							{isLast || !item.to ? (
								<span className="font-medium text-foreground">{item.label}</span>
							) : (
								<Link to={item.to} className="hover:text-primary-500 transition-colors">
									{item.label}
								</Link>
							)}

							{!isLast && <ChevronRight className="mx-2 h-4 w-4 opacity-50" />}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
