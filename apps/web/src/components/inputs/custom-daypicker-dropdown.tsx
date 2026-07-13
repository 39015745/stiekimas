import { useEffect, useRef, useState } from "react";
import type { DropdownProps } from "@daypicker/react";
import { ChevronDown } from "lucide-react";

export function CustomDayPickerDropdown(props: DropdownProps) {
	const { options, value, onChange, disabled, "aria-label": ariaLabel } = props;

	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	const selectedOption = options?.find((option) => String(option.value) === String(value));

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (!wrapperRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSelect = (nextValue: string | number) => {
		if (!onChange) return;

		const syntheticEvent = {
			target: {
				value: String(nextValue),
			},
		} as React.ChangeEvent<HTMLSelectElement>;

		onChange(syntheticEvent);
		setOpen(false);
	};

	return (
		<div ref={wrapperRef} className="relative">
			<button
				type="button"
				disabled={disabled}
				aria-label={ariaLabel}
				aria-haspopup="listbox"
				aria-expanded={open}
				onClick={() => setOpen((current) => !current)}
				className="
                    flex h-8 w-32 items-center justify-center text-md outline-none transition-colors
                    disabled:cursor-not-allowed disabled:opacity-50
                "
			>
				<span>{selectedOption?.label ?? value}</span>
				<ChevronDown className="text-primary-400 pt-0.5" />
			</button>

			{open && (
				<div
					role="listbox"
					className="
                        absolute left-0 top-full z-50 mt-1 max-h-64 w-32 overflow-y-auto rounded-md border border-border
                        bg-background p-1 shadow-lg
                    "
				>
					{options?.map((option) => {
						const isSelected = String(option.value) === String(value);

						return (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={isSelected}
								disabled={option.disabled}
								onClick={() => handleSelect(option.value)}
								className={`
                                    flex w-full rounded-sm py-0.5 justify-center transition-colors
                                    disabled:cursor-not-allowed disabled:opacity-50 font-medium
                                    ${isSelected ? "bg-primary-400 text-white" : "text-foreground hover:text-white hover:bg-primary-200 "}
                                `}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
