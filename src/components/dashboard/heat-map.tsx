import { SUBURBS, gapColor } from "@/lib/mock-data";

type Props = {
	selected: string;
	onSelect: (id: string) => void;
};

export function HeatMap({ selected, onSelect }: Props) {
	const visible = SUBURBS.filter((s) => !s.hidden);

	const grid: { x1: number; y1: number; x2: number; y2: number; minor: boolean }[] = [];
	for (let x = 20; x < 400; x += 22) grid.push({ x1: x, y1: 0, x2: x - 22, y2: 400, minor: x % 88 !== 0 });
	for (let y = 20; y < 400; y += 22) grid.push({ x1: 0, y1: y, x2: 400, y2: y + 8, minor: y % 88 !== 0 });

	return (
		<svg className="map-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
			<defs>
				<pattern id="land" patternUnits="userSpaceOnUse" width="8" height="8">
					<rect width="8" height="8" fill="oklch(0.96 0.012 75)" />
					<circle cx="4" cy="4" r="0.4" fill="oklch(0.90 0.014 75)" />
				</pattern>
				<filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="0.3" />
				</filter>
				<clipPath id="frame">
					<rect x="0" y="0" width="400" height="400" />
				</clipPath>
			</defs>

			<g clipPath="url(#frame)">
				<rect width="400" height="400" fill="url(#land)" />

				<g fill="oklch(0.90 0.04 150)" stroke="oklch(0.82 0.045 150)" strokeWidth="0.6">
					<rect x="34" y="40" width="62" height="70" rx="3" />
					<rect x="148" y="160" width="32" height="40" rx="2" />
					<rect x="206" y="220" width="44" height="36" rx="2" />
					<polygon points="300,260 360,250 366,300 314,308" />
					<ellipse cx="290" cy="358" rx="34" ry="20" />
					<rect x="10" y="92" width="28" height="58" rx="2" />
				</g>

				<g stroke="oklch(0.86 0.014 75)" strokeWidth="0.55" opacity="0.85">
					{grid.filter((l) => l.minor).map((l, i) => (
						<line key={`mn${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
					))}
				</g>
				<g stroke="oklch(0.78 0.014 75)" strokeWidth="1.2">
					{grid.filter((l) => !l.minor).map((l, i) => (
						<line key={`mj${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
					))}
					<line x1="70" y1="0" x2="40" y2="400" strokeWidth="1.8" />
					<line x1="135" y1="0" x2="105" y2="400" strokeWidth="1.5" />
					<line x1="240" y1="0" x2="210" y2="400" strokeWidth="1.5" />
				</g>

				<path
					d="M 400 220 C 350 240 320 260 280 290 C 240 320 210 360 180 400"
					fill="none"
					stroke="oklch(0.82 0.045 235)"
					strokeWidth="9"
					strokeLinecap="round"
					opacity="0.85"
				/>
				<path
					d="M 400 220 C 350 240 320 260 280 290 C 240 320 210 360 180 400"
					fill="none"
					stroke="oklch(0.88 0.035 235)"
					strokeWidth="6"
					strokeLinecap="round"
				/>

				<g stroke="oklch(0.70 0.10 35)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.55" fill="none">
					<line x1="70" y1="0" x2="40" y2="400" />
					<line x1="135" y1="0" x2="105" y2="400" />
					<path d="M 0 175 L 400 175" />
				</g>

				<g fontFamily="var(--font-mono)" fontSize="7" fill="oklch(0.55 0.012 55)" letterSpacing="0.05em">
					<text x="56" y="78" transform="rotate(-86 56 78)">ROYAL&nbsp;PDE</text>
					<text x="121" y="78" transform="rotate(-86 121 78)">LYGON&nbsp;ST</text>
					<text x="226" y="78" transform="rotate(-86 226 78)">BRUNSWICK&nbsp;ST</text>
					<text x="200" y="172" textAnchor="middle">VICTORIA&nbsp;ST</text>
					<text x="385" y="270" fontSize="8" fill="oklch(0.50 0.06 235)" textAnchor="end" fontStyle="italic" fontFamily="var(--font-display)">Yarra</text>
				</g>
				<g fontFamily="var(--font-mono)" fontSize="7" fill="oklch(0.42 0.06 155)" letterSpacing="0.05em">
					<text x="65" y="78" textAnchor="middle">PRINCES PK</text>
					<text x="164" y="183" textAnchor="middle">CARLTON GDNS</text>
					<text x="228" y="240" textAnchor="middle">FITZROY GDNS</text>
					<text x="335" y="282" textAnchor="middle">YARRA PARK</text>
				</g>
			</g>

			<g clipPath="url(#frame)">
				{visible.map((s) => {
					const isSel = s.id === selected;
					return (
						<g key={s.id} style={{ cursor: "pointer" }} onClick={() => onSelect(s.id)}>
							<polygon
								points={s.poly}
								fill={gapColor(s.gap)}
								fillOpacity={isSel ? 0.78 : 0.58}
								stroke={isSel ? "var(--ink)" : "white"}
								strokeWidth={isSel ? 2.2 : 1.2}
								strokeLinejoin="round"
								filter="url(#soft)"
							/>
						</g>
					);
				})}
			</g>

			{visible.map((s) => (
				<g key={`${s.id}-lbl`} pointerEvents="none">
					<rect
						x={s.x - 38} y={s.y - 14}
						width="76" height="30"
						rx="4"
						fill="oklch(0.99 0.008 75)"
						fillOpacity="0.85"
						stroke="oklch(0.90 0.014 75)"
						strokeWidth="0.6"
					/>
					<text
						x={s.x} y={s.y - 1}
						fontFamily="var(--font-ui)"
						fontSize="10.5"
						fontWeight="500"
						fill="oklch(0.22 0.018 55)"
						textAnchor="middle"
					>{s.name}</text>
					<text
						x={s.x} y={s.y + 12}
						fontFamily="var(--font-mono)"
						fontSize="9"
						fill="oklch(0.40 0.015 55)"
						textAnchor="middle"
					>{s.gap} / 100</text>
				</g>
			))}

			<g transform="translate(364, 30)" fontFamily="var(--font-mono)" fontSize="9" fill="oklch(0.45 0.012 55)">
				<circle cx="0" cy="10" r="13" fill="oklch(0.99 0.008 75)" fillOpacity="0.9" stroke="oklch(0.86 0.014 75)" strokeWidth="0.6" />
				<text x="0" y="3" textAnchor="middle">N</text>
				<path d="M-3 9L0 5L3 9Z" fill="currentColor" />
				<line x1="0" y1="9" x2="0" y2="18" stroke="currentColor" strokeWidth="1" />
			</g>
			<g transform="translate(20, 380)" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(0.45 0.012 55)">
				<rect x="-4" y="-12" width="62" height="22" rx="3" fill="oklch(0.99 0.008 75)" fillOpacity="0.9" stroke="oklch(0.86 0.014 75)" strokeWidth="0.6" />
				<line x1="0" y1="-4" x2="40" y2="-4" stroke="currentColor" strokeWidth="1.2" />
				<line x1="0" y1="-7" x2="0" y2="-1" stroke="currentColor" strokeWidth="1.2" />
				<line x1="40" y1="-7" x2="40" y2="-1" stroke="currentColor" strokeWidth="1.2" />
				<text x="20" y="6" textAnchor="middle">1 km</text>
			</g>
		</svg>
	);
}
