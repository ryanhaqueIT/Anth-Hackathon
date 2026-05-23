import { useState } from "react";
import { HeatMap } from "./heat-map";
import { CIcon } from "./icons";
import { SupportGapTip } from "./info-tip";
import { SuburbPanel } from "./suburb-panel";

type Props = {
	onDrillIn: () => void;
	onBrief: () => void;
	onExport: () => void;
	onFilters: () => void;
};

const RANGES = ["7 days", "Fortnight", "90 days", "This year"] as const;
type Range = (typeof RANGES)[number];

const AGE_BANDS: [string, string][] = [
	["65-74", "65 – 74"],
	["75-84", "75 – 84"],
	["85+", "85+"],
	["under", "Under 65"],
];

const SERVICE_SIGNALS: [string, string][] = [
	["free", "Free or low-cost"],
	["accessible", "Wheelchair access"],
	["after5", "Open after 5pm"],
	["phone", "Phone bookings"],
];

function Check({ on }: { on: boolean }) {
	if (!on) return null;
	return (
		<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
			<path d="M2 6.5L5 9.5L10 3.5" />
		</svg>
	);
}

export function CouncilHero({ onDrillIn, onBrief, onExport, onFilters }: Props) {
	const [sel, setSel] = useState("carlton");
	const [range, setRange] = useState<Range>("Fortnight");
	const [activeAge, setActiveAge] = useState<Record<string, boolean>>({ "65-74": true, "75-84": true, "85+": true, under: false });
	const [activeNeeds, setActiveNeeds] = useState<Record<string, boolean>>({
		Social: true, Food: true, Transport: true, Wellbeing: true, Health: false, Financial: false, Safety: false,
	});
	const [serviceSignals, setServiceSignals] = useState<Record<string, boolean>>({ free: true, accessible: true, after5: false, phone: false });

	return (
		<div className="council">
			<div className="topbar">
				<div style={{ display: "flex", alignItems: "center", gap: 22 }}>
					<div className="brand">
						<span className="pulse-dot" />
						<span>Neighbourhood Pulse <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>· Insights</span></span>
					</div>
					<div className="crumbs">
						<span>City of Melbourne</span>
						<span className="sep">/</span>
						<span>Older residents</span>
						<span className="sep">/</span>
						<span style={{ color: "var(--ink)" }}>Support Gap, by area</span>
					</div>
				</div>
				<div className="right">
					<div className="seg" role="tablist" aria-label="Time range">
						{RANGES.map((r) => (
							<button type="button" key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>{r}</button>
						))}
					</div>
					<button type="button" className="btn" onClick={onFilters}><CIcon.filter /> Filters</button>
					<button type="button" className="btn btn-ink" onClick={onExport}><CIcon.export /> Export brief</button>
				</div>
			</div>

			<div className="main">
				<div className="rail">
					<div className="filter">
						<h4>Age band</h4>
						{AGE_BANDS.map(([k, label]) => (
							<label key={k} className="opt" onClick={() => setActiveAge((p) => ({ ...p, [k]: !p[k] }))}>
								<span className={`check ${activeAge[k] ? "on" : ""}`}><Check on={!!activeAge[k]} /></span>
								{label}
							</label>
						))}
					</div>

					<div className="filter">
						<h4>Need type</h4>
						<div className="pill-list">
							{Object.keys(activeNeeds).map((n) => (
								<button type="button" key={n} className={`pill ${activeNeeds[n] ? "on" : ""}`} onClick={() => setActiveNeeds((p) => ({ ...p, [n]: !p[n] }))}>{n}</button>
							))}
						</div>
					</div>

					<div className="filter">
						<h4>Service signal</h4>
						{SERVICE_SIGNALS.map(([k, label]) => (
							<label key={k} className="opt" onClick={() => setServiceSignals((p) => ({ ...p, [k]: !p[k] }))}>
								<span className={`check ${serviceSignals[k] ? "on" : ""}`}><Check on={!!serviceSignals[k]} /></span>
								{label}
							</label>
						))}
					</div>

					<div className="filter">
						<h4>Consent state</h4>
						<div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
							Only check-ins where the resident has consented to aggregated use are included. Areas with fewer than 5 check-ins are suppressed.
						</div>
					</div>
				</div>

				<div className="map-wrap">
					<div className="map-head">
						<div>
							<h1>Where might older neighbours feel <em>most disconnected</em>?</h1>
							<p className="lede">
								Each shape is a small area. Colour shows its <strong style={{ color: "var(--ink-2)", fontWeight: 500 }}>Support Gap<SupportGapTip /></strong> — areas with rising needs and few nearby ways to meet them.
							</p>
						</div>
						<div className="legend">
							<div>
								<div className="grad" />
								<div className="ticks">
									<span>Low gap</span><span>Watch</span><span>Elevated</span><span>High</span>
								</div>
							</div>
						</div>
					</div>

					<div className="kpis">
						<div className="kpi">
							<div className="label">Check-ins · {range.toLowerCase()}</div>
							<div className="val">657</div>
							<div className="delta up"><CIcon.trend up={true} /> +12% vs prior</div>
						</div>
						<div className="kpi">
							<div className="label">Areas above watch</div>
							<div className="val">4 <span style={{ fontSize: 13, color: "var(--ink-3)" }}>of 9</span></div>
							<div className="delta up"><CIcon.trend up={true} /> +1 area</div>
						</div>
						<div className="kpi" style={{ background: "color-mix(in oklch, var(--rose) 6%, var(--surface))", borderColor: "color-mix(in oklch, var(--rose) 25%, var(--line))" }}>
							<div className="label">Distress signals</div>
							<div className="val">8% <span style={{ fontSize: 13, color: "var(--ink-3)" }}>· 52</span></div>
							<div className="delta up"><CIcon.trend up={true} /> +1.4 pts</div>
						</div>
						<div className="kpi">
							<div className="label">Specialist handoffs</div>
							<div className="val">59</div>
							<div className="delta up"><CIcon.trend up={true} /> +13 vs prior</div>
						</div>
					</div>

					<div className="map-card">
						<HeatMap selected={sel} onSelect={setSel} />
					</div>
				</div>

				<SuburbPanel id={sel} onDrillIn={onDrillIn} onBrief={onBrief} />
			</div>
		</div>
	);
}
