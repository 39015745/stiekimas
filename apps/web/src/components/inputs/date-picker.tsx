import { useState, useRef, useEffect } from "react";
import { DayPicker, getDefaultClassNames } from "@daypicker/react";
import { lt } from "@daypicker/react/locale";
import "@daypicker/react/style.css";
import { Input } from "./input";
import parseDateInputValue from "../../lib/validate-date-input";
import { CustomDayPickerDropdown } from "./custom-daypicker-dropdown";

type LithuanianDatePickerProps = {
	label: string;
	value?: string;
	error?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
};

function formatDateInputValue(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export function DatePicker({ label, value = "", error, onChange, onBlur }: LithuanianDatePickerProps) {
	const defaultClassNames = getDefaultClassNames();

	const [open, setOpen] = useState(false);
	const [month, setMonth] = useState(() => parseDateInputValue(value) || new Date());

	const containerRef = useRef<HTMLDivElement>(null);

	const currentYear = new Date().getFullYear();
	const selected = parseDateInputValue(value);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}

		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);

	return (
		<div className="relative w-full" ref={containerRef}>
			<Input
				label={label}
				error={error}
				type="text"
				inputMode="numeric"
				value={value}
				maxLength={10}
				onFocus={() => setOpen(true)}
				onBlur={onBlur}
				onChange={(event) => {
					const nextValue = event.target.value;
					onChange(nextValue);

					const parsedDate = parseDateInputValue(nextValue);

					if (parsedDate) {
						setMonth(parsedDate);
					}
				}}
			/>

			{open && (
				<div className="absolute z-50 mt-2 rounded-md border border-border bg-background p-3 shadow-lg">
					<DayPicker
						mode="single"
						locale={lt}
						captionLayout="dropdown-years"
						startMonth={new Date(1960, 0)}
						endMonth={new Date(currentYear, 11)}
						month={month}
						onMonthChange={setMonth}
						selected={selected}
						components={{
							Dropdown: CustomDayPickerDropdown,
						}}
						classNames={{
							...defaultClassNames,
							selected: "bg-primary-400 text-white font-semibold rounded-full",
							today: "text-primary-600 font-semibold",
							chevron: "fill-primary-500",
							day_button: "hover:text-primary-400",
						}}
						onSelect={(date) => {
							if (!date) return;

							onChange(formatDateInputValue(date));
							setMonth(date);
							setOpen(false);
						}}
					/>
				</div>
			)}
		</div>
	);
}
