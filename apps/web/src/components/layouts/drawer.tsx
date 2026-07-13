import { X } from "lucide-react";
import { useEffect } from "react";

type DrawerProps = {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
};

export default function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
	// Prevent background scrolling when the drawer is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	return (
		<>
			{/* Backdrop overlay */}
			<div className={`fixed inset-0 z-50 bg-foreground/40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={onClose} aria-hidden="true" />

			{/* Slide-over panel */}
			<div
				className={`fixed inset-y-0 right-0 z-50 flex w-full lg:w-1/2 flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border h-16 px-6">
					<h2 className="text-lg font-semibold text-foreground">{title}</h2>
					<button onClick={onClose} className="rounded-md p-2 text-foreground hover:bg-surface transition-colors cursor-pointer" aria-label="Uždaryti">
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content area */}
				<div className="flex-1 overflow-y-auto p-6">{children}</div>
			</div>
		</>
	);
}
