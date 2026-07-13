import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import InputLabel from "./input-label";

// Omit placeholder from props so it cannot be accidentally overridden
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
	label: string;
	error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = "", id, ...props }, ref) => {
	const generatedId = useId();
	const inputId = id || generatedId;

	return (
		<div className="flex w-full flex-col gap-1.5">
			<div className="relative">
				<input
					id={inputId}
					ref={ref}
					placeholder=" " /* The space triggers peer-placeholder-shown */
					className={`
						peer flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors
						disabled:cursor-not-allowed disabled:opacity-50
						focus:border-primary-400 focus:ring-1 focus:ring-primary-400
						${error ? "border-red-500 focus:border-red-500" : "border-border"}
						${className}
					`}
					{...props}
				/>
				<InputLabel inputId={inputId} label={label} error={error} />
			</div>

			{error && <span className="text-xs text-red-500">{error}</span>}
		</div>
	);
});
