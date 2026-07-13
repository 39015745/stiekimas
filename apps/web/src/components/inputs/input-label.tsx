export default function InputLabel({ inputId, label, error }: { inputId: string; label: string; error?: string }) {
	return (
		<label
			htmlFor={inputId}
			className={`
                pointer-events-none absolute left-2 px-1 transition-all duration-200 ease-in-out
                
                /* 1. Base state (Floating above border) */
                top-0 -translate-y-1/2 text-xs text-foreground/70
                bg-linear-to-b from-background from-50% to-white to-50%
                
                /* 2. Placeholder shown state (Inside input) */
                peer-placeholder-shown:top-1/2 
                peer-placeholder-shown:-translate-y-1/2 
                peer-placeholder-shown:text-sm 
                peer-placeholder-shown:bg-none /* Removes the gradient */
                peer-placeholder-shown:bg-white
                
                /* 3. Empty Select state (Inside select) */
                peer-invalid:top-1/2 
                peer-invalid:-translate-y-1/2 
                peer-invalid:text-sm 
                peer-invalid:bg-none /* Removes the gradient */
                peer-invalid:bg-white
                
                /* 4. Focus state (Floating above border) */
                peer-focus:top-0 
                peer-focus:-translate-y-1/2 
                peer-focus:text-xs 
                peer-focus:text-primary-400
                peer-focus:bg-linear-to-b /* Restores the gradient */
                
                ${error ? "text-red-500 peer-focus:text-red-500" : ""}
            `}
		>
			{label}
		</label>
	);
}
