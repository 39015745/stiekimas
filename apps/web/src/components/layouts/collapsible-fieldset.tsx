import { useState } from "react";

type CollapsibleFieldsetProps = {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
};

export function CollapsibleFieldset({ title, children, defaultOpen = true }: CollapsibleFieldsetProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<>
			<legend
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex cursor-pointer select-none items-center my-2 gap-2 px-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
			>
				{title}
				<svg className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</legend>
			<fieldset className={`rounded-lg border-border transition-all ${isOpen ? "border" : ""}`}>
				{/* Animation Wrapper */}
				<div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
					{/* overflow-hidden is required so the content gets clipped when grid-rows is 0fr */}
					<div className={`${isOpen ? "" : "overflow-hidden"}`}>{children}</div>
				</div>
			</fieldset>
		</>
	);
}
