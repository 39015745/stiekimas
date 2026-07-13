import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import InputLabel from "./input-label";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label: string;
	options: { value: string; label: string }[];
	error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, options, error, className = "", id, ...props }, ref) => {
	const generatedId = useId();
	const selectId = id || generatedId;

	return (
		<div className="flex w-full flex-col gap-1.5">
			<div className="relative">
				<select
					id={selectId}
					ref={ref}
					// Required for floating label peer logic to know when it's "empty" vs filled
					required
					defaultValue=""
					className={`
                            peer flex h-10 w-full appearance-none rounded-md border bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors
                            disabled:cursor-not-allowed disabled:opacity-50
                            focus:border-primary-400 focus:ring-1 focus:ring-primary-400
                            ${error ? "border-red-500 focus:border-red-500" : "border-border"}
                            ${className}
                        `}
					{...props}
				>
					{/* Hidden default option allows the floating label to behave correctly */}
					<option value="" disabled hidden></option>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<InputLabel inputId={selectId} label={label} error={error} />

				{/* Custom Dropdown Arrow */}
				<div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-foreground/50">
					<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
					</svg>
				</div>
			</div>

			{error && <span className="text-xs text-red-500">{error}</span>}
		</div>
	);
});
