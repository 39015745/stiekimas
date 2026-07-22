import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";

export type ActionOverlayState =
	| {
			type: "closed";
	  }
	| {
			type: "confirmation";
			title: string;
			message: string;
			proceedLabel?: string;
			cancelLabel?: string;
	  }
	| {
			type: "loading";
			title?: string;
			message?: string;
	  }
	| {
			type: "response";
			status: "success" | "error";
			title: string;
			message: string;
			closeLabel?: string;
	  };

type ActionOverlayProps = {
	state: ActionOverlayState;
	onProceed?: () => void;
	onCancel?: () => void;
	onClose?: () => void;
};

export function ActionOverlay({ state, onProceed, onCancel, onClose }: ActionOverlayProps) {
	useEffect(() => {
		if (state.type === "closed" || state.type === "loading") {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") {
				return;
			}

			if (state.type === "confirmation") {
				onCancel?.();
			}

			if (state.type === "response") {
				onClose?.();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [state.type, onCancel, onClose]);

	if (state.type === "closed") {
		return null;
	}

	const content = (
		<div className="fixed inset-0 z-100 grid place-items-center bg-black/50 p-4" aria-busy={state.type === "loading"}>
			<div
				role={state.type === "loading" ? "status" : "dialog"}
				aria-modal={state.type !== "loading"}
				aria-live={state.type === "loading" ? "polite" : undefined}
				className="relative w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl"
			>
				{state.type === "confirmation" && (
					<>
						<h2 className="text-lg font-semibold text-foreground">{state.title}</h2>

						<p className="mt-2 text-sm text-muted-foreground">{state.message}</p>

						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onClick={onCancel}
								className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
							>
								{state.cancelLabel ?? "Atšaukti"}
							</button>

							<button type="button" onClick={onProceed} autoFocus className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600">
								{state.proceedLabel ?? "Tęsti"}
							</button>
						</div>
					</>
				)}

				{state.type === "loading" && (
					<div className="flex flex-col items-center text-center">
						<div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary-500" aria-hidden="true" />

						<h2 className="mt-4 text-lg font-semibold text-foreground">{state.title ?? "Vykdoma..."}</h2>

						{state.message && <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>}
					</div>
				)}

				{state.type === "response" && (
					<>
						<div
							className={[
								"absolute -top-8 left-1/2 -translate-x-1/2 flex h-16 w-16 items-center justify-center rounded-full shadow-lg", // Increased size to 16, added shadow for prominence
								state.status === "success" ? "bg-green-500" : "bg-red-500", // Solid, status-appropriate background colors
							].join(" ")}
							aria-hidden="true"
						>
							{state.status === "success" ? (
								<Check className="text-white" size={36} /> // Large white checkmark
							) : (
								<X className="text-white" size={36} /> // Large white X mark, like in the image
							)}
						</div>

						<h2 className="mt-4 text-lg font-semibold text-foreground">{state.title}</h2>

						<p className="mt-2 text-sm text-muted-foreground">{state.message}</p>

						<div className="mt-6 flex justify-end">
							<button type="button" onClick={onClose} autoFocus className="rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600">
								{state.closeLabel ?? "Uždaryti"}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);

	return createPortal(content, document.body);
}
