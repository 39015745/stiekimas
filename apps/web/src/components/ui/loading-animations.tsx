export const Spinner = ({ size = 200, color = "#f45b1e" }: { size?: number | string; color?: string }) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", shapeRendering: "auto" }}>
			{Array.from({ length: 8 }).map((_, i) => {
				const angle = i * 45;
				const x = 50 + 30 * Math.cos((angle * Math.PI) / 180);
				const y = 50 + 30 * Math.sin((angle * Math.PI) / 180);
				const delay = -0.875 + i * 0.125;

				return (
					<g key={i} transform={`translate(${x}, ${y}) rotate(${angle})`}>
						<circle cx="0" cy="0" r="6" fill={color}>
							<animateTransform attributeName="transform" type="scale" begin={`${delay}s`} values="1.5 1.5;1 1" keyTimes="0;1" dur="1s" repeatCount="indefinite" />
							<animate attributeName="fill-opacity" keyTimes="0;1" dur="1s" repeatCount="indefinite" values="1;0" begin={`${delay}s`} />
						</circle>
					</g>
				);
			})}
		</svg>
	);
};
