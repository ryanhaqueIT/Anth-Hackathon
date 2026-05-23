import { useState } from "react";
import { CIcon } from "./icons";
import { Modal } from "./modal";

const BRIEF_ACTIONS = [
	{ t: "Extend Library Lunch into a twilight session", w: "Need peaks after 5pm; the existing programme already attracts ~40 regulars.", e: "Low", i: "High" },
	{ t: "Partner with Drummond St Bowls Club", w: "Walkable for 72% of 65+ residents. Existing space; needs a programme partner.", e: "Medium", i: "High" },
	{ t: "Pilot weekly Phone Visitor matches", w: "Wellbeing-chat requests grew 41%. Phone match removes mobility friction entirely.", e: "Low", i: "Medium" },
];

export function BriefModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	return (
		<Modal
			open={open}
			title="Carlton · Action brief"
			sub="Drafted from the last fortnight of signals. You can edit before sharing."
			onClose={onClose}
			footer={
				<>
					<button type="button" className="btn" onClick={onClose}>Cancel</button>
					<button type="button" className="btn btn-ink"><CIcon.export /> Send to outreach team</button>
				</>
			}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
				<div style={{ background: "var(--bg-deep)", padding: "12px 14px", borderRadius: 10, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
					<strong style={{ color: "var(--ink)" }}>Headline:</strong> Carlton shows a high Support Gap (78/100) driven by social connection needs after 5pm, with limited free activities in that window.
				</div>
				<ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
					{BRIEF_ACTIONS.map((a, i) => (
						<li key={a.t} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 12, alignItems: "start" }}>
							<span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>0{i + 1}</span>
							<div>
								<div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{a.t}</div>
								<div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{a.w}</div>
							</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
								<span className="score-tag low" style={{ fontSize: 10 }}>{a.e} effort</span>
								<span className="score-tag med" style={{ fontSize: 10 }}>{a.i} impact</span>
							</div>
						</li>
					))}
				</ol>
				<div style={{ paddingTop: 8, borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>
					aggregated from 142 consented check-ins · individual residents not identified
				</div>
			</div>
		</Modal>
	);
}

export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	const [fmt, setFmt] = useState<"pdf" | "csv" | "link">("pdf");
	const [includeMap, setIncludeMap] = useState(true);
	const [includeMood, setIncludeMood] = useState(true);
	const [includePhrases, setIncludePhrases] = useState(false);
	const items: [string, string, boolean, (v: boolean) => void][] = [
		["map", "Heatmap of all areas", includeMap, setIncludeMap],
		["mood", "Mood Pulse breakdown", includeMood, setIncludeMood],
		["phrases", "Anonymised recurring phrases", includePhrases, setIncludePhrases],
	];
	return (
		<Modal
			open={open}
			title="Export insights"
			sub="Bundle this view as a brief you can email or share inside council systems."
			onClose={onClose}
			footer={
				<>
					<button type="button" className="btn" onClick={onClose}>Cancel</button>
					<button type="button" className="btn btn-ink" onClick={onClose}><CIcon.export /> Generate {fmt.toUpperCase()}</button>
				</>
			}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
				<div>
					<div className="section-label" style={{ marginBottom: 8 }}>Format</div>
					<div className="seg" style={{ display: "inline-flex" }}>
						{(["pdf", "csv", "link"] as const).map((k) => (
							<button type="button" key={k} className={fmt === k ? "active" : ""} onClick={() => setFmt(k)}>
								{k === "pdf" ? "PDF brief" : k === "csv" ? "CSV (raw)" : "Share link"}
							</button>
						))}
					</div>
				</div>
				<div>
					<div className="section-label" style={{ marginBottom: 8 }}>Include</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
						{items.map(([k, l, v, fn]) => (
							<label key={k} className="opt" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }} onClick={() => fn(!v)}>
								<span className={`check ${v ? "on" : ""}`}>
									{v && (
										<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
											<path d="M2 6.5L5 9.5L10 3.5" />
										</svg>
									)}
								</span>
								{l}
							</label>
						))}
					</div>
				</div>
				<div style={{ fontSize: 12, color: "var(--ink-4)", lineHeight: 1.5 }}>
					All exports inherit Pulse's privacy rules: areas with fewer than 5 consented check-ins are suppressed, and no individual residents appear in any cohort.
				</div>
			</div>
		</Modal>
	);
}

export function FiltersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	return (
		<Modal
			open={open}
			title="Advanced filters"
			sub="Filters apply across the whole view until cleared."
			onClose={onClose}
			footer={
				<>
					<button type="button" className="btn" onClick={onClose}>Reset</button>
					<button type="button" className="btn btn-ink" onClick={onClose}>Apply</button>
				</>
			}
		>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
				<div>
					<div className="section-label" style={{ marginBottom: 8 }}>Living arrangement</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: "var(--ink-2)" }}>
						<label><input type="checkbox" defaultChecked /> Lives alone</label>
						<label><input type="checkbox" defaultChecked /> Lives with partner</label>
						<label><input type="checkbox" /> Lives with family</label>
						<label><input type="checkbox" /> Aged-care or assisted living</label>
					</div>
				</div>
				<div>
					<div className="section-label" style={{ marginBottom: 8 }}>Language at home</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: "var(--ink-2)" }}>
						<label><input type="checkbox" defaultChecked /> English</label>
						<label><input type="checkbox" defaultChecked /> Italian</label>
						<label><input type="checkbox" defaultChecked /> Mandarin</label>
						<label><input type="checkbox" /> Greek</label>
						<label><input type="checkbox" /> Vietnamese</label>
					</div>
				</div>
			</div>
		</Modal>
	);
}
