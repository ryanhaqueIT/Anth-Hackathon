import { MOOD_PULSE, NEEDS_BY_SUBURB, RECENT_PHRASES, SUBURBS } from "@/lib/mock-data";
import { CIcon } from "./icons";
import { SupportGapTip } from "./info-tip";
import { SpecialistReferrals } from "./mood-pulse";

type Props = {
	onBack: () => void;
	onExport: () => void;
};

const SERVICE_ROWS = [
	{ cat: "Social activities", carlton: 1.2, avg: 2.6 },
	{ cat: "Food support", carlton: 0.8, avg: 1.9 },
	{ cat: "Transport", carlton: 1.5, avg: 1.8 },
	{ cat: "Wellbeing / chat", carlton: 0.4, avg: 1.1 },
	{ cat: "Health navigation", carlton: 2.1, avg: 2.0 },
];

const ACTIONS = [
	{
		title: "Extend Library Lunch into a twilight session",
		why: "Need peaks after 5pm; the lunch already attracts ~40 regulars. Estimated reach: 60–80.",
		effort: "Low effort",
		impact: "High",
	},
	{
		title: "Partner with Drummond St Bowls Club",
		why: "Walkable for 72% of 65+ residents. Existing space, just needs a programme partner.",
		effort: "Medium",
		impact: "High",
	},
	{
		title: "Pilot weekly Phone Visitor matches",
		why: "Wellbeing-chat requests grew 41% — a phone match removes mobility friction entirely.",
		effort: "Low effort",
		impact: "Medium",
	},
];

export function CouncilDetail({ onBack, onExport }: Props) {
	const s = SUBURBS.find((x) => x.id === "carlton");
	const needs = NEEDS_BY_SUBURB.carlton;
	if (!s) return null;

	const trend = [12, 14, 11, 16, 18, 22, 19, 25, 28, 26, 31, 34, 30, 38];
	const trendMax = Math.max(...trend);
	const trendPath = trend
		.map((v, i) => {
			const x = (i / (trend.length - 1)) * 100;
			const y = 100 - (v / trendMax) * 80 - 10;
			return `${i === 0 ? "M" : "L"} ${x} ${y}`;
		})
		.join(" ");

	const concerned = [22, 24, 21, 26, 23, 28, 27, 32, 30, 29, 34, 36, 33, 38];
	const distressed = [4, 5, 4, 6, 6, 8, 7, 9, 11, 10, 13, 14, 12, 14];
	const W = 280;
	const H = 90;
	const max = 50;
	const xy = (arr: number[]) =>
		arr.map((v, i) => `${(i / (arr.length - 1)) * W},${H - (v / max) * H}`).join(" L ");

	return (
		<div className="council detail">
			<div className="topbar">
				<div style={{ display: "flex", alignItems: "center", gap: 22 }}>
					<div className="brand">
						<span className="pulse-dot" />
						<span>Neighbourhood Pulse <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>· Insights</span></span>
					</div>
					<div className="crumbs">
						<button type="button" className="btn" style={{ padding: "4px 10px", fontSize: 12 }} onClick={onBack}>← Back to map</button>
						<span style={{ color: "var(--ink)" }}>Carlton, 3053</span>
					</div>
				</div>
				<div className="right">
					<button type="button" className="btn">Compare with…</button>
					<button type="button" className="btn btn-ink" onClick={onExport}><CIcon.export /> Generate area brief</button>
				</div>
			</div>

			<div className="main">
				<div className="content">
					<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
						<div>
							<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
								<h1 className="display" style={{ fontSize: 38, margin: 0, letterSpacing: "-0.02em" }}>Carlton</h1>
								<span className="score-tag high">
									<span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
									High Support Gap
								</span>
							</div>
							<p style={{ color: "var(--ink-3)", marginTop: 6, maxWidth: 560 }}>
								14.2% of Carlton residents are 65+ (above City of Melbourne average of 9.1%). Loneliness signals have climbed steadily across the fortnight, particularly after 5pm.
							</p>
						</div>

						<div className="map-card" style={{ padding: 22, gap: 16 }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
								<div>
									<div className="section-label" style={{ display: "flex", alignItems: "center" }}>Support Gap score · last 14 days<SupportGapTip /></div>
									<div className="display" style={{ fontSize: 56, lineHeight: 1, marginTop: 4 }}>
										78<span style={{ fontSize: 18, color: "var(--ink-3)", marginLeft: 4 }}>/100</span>
									</div>
									<div style={{ color: "var(--rose)", fontSize: 13, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
										<CIcon.trend up={true} /> Up 6 points this fortnight
									</div>
								</div>
								<div style={{ width: 320, height: 110 }}>
									<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
										<defs>
											<linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="var(--clay)" stopOpacity="0.25" />
												<stop offset="100%" stopColor="var(--clay)" stopOpacity="0" />
											</linearGradient>
										</defs>
										<path d={`${trendPath} L 100 90 L 0 90 Z`} fill="url(#sparkfill)" />
										<path d={trendPath} fill="none" stroke="var(--clay)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
										<circle cx="100" cy={100 - (trend[trend.length - 1] / trendMax) * 80 - 10} r="2" fill="var(--clay)" />
									</svg>
								</div>
							</div>

							<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
								<div>
									<div className="section-label">Need signal</div>
									<div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
										<span className="display" style={{ fontSize: 26 }}>0.84</span>
										<span style={{ fontSize: 12, color: "var(--ink-3)" }}>weighted</span>
									</div>
									<div style={{ height: 4, background: "var(--line)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
										<div style={{ width: "84%", height: "100%", background: "var(--rose)" }} />
									</div>
								</div>
								<div>
									<div className="section-label">Service availability</div>
									<div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
										<span className="display" style={{ fontSize: 26 }}>0.38</span>
										<span style={{ fontSize: 12, color: "var(--ink-3)" }}>per resident 65+</span>
									</div>
									<div style={{ height: 4, background: "var(--line)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
										<div style={{ width: "38%", height: "100%", background: "var(--gold)" }} />
									</div>
								</div>
								<div>
									<div className="section-label">Access · walkability</div>
									<div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
										<span className="display" style={{ fontSize: 26 }}>0.72</span>
										<span style={{ fontSize: 12, color: "var(--ink-3)" }}>good</span>
									</div>
									<div style={{ height: 4, background: "var(--line)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
										<div style={{ width: "72%", height: "100%", background: "var(--sage)" }} />
									</div>
								</div>
							</div>
						</div>

						<div className="map-card" style={{ padding: 22 }}>
							<div className="section-label" style={{ marginBottom: 14 }}>Services per 1,000 residents 65+, by category</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
								{SERVICE_ROWS.map((row) => (
									<div key={row.cat} style={{ display: "grid", gridTemplateColumns: "160px 1fr 60px", gap: 12, alignItems: "center", fontSize: 13 }}>
										<span style={{ color: "var(--ink-2)" }}>{row.cat}</span>
										<div style={{ position: "relative", height: 22 }}>
											<div style={{ position: "absolute", inset: 0, background: "var(--line-soft)", borderRadius: 4 }} />
											<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(row.carlton / 3) * 100}%`, background: row.carlton < row.avg ? "var(--clay)" : "var(--sage)", borderRadius: 4 }} />
											<div style={{ position: "absolute", left: `${(row.avg / 3) * 100}%`, top: -3, bottom: -3, borderLeft: "2px dashed var(--ink-2)" }} title="City average" />
										</div>
										<span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
											{row.carlton.toFixed(1)} <span style={{ color: "var(--ink-4)" }}>/ {row.avg.toFixed(1)}</span>
										</span>
									</div>
								))}
							</div>
							<div style={{ display: "flex", gap: 18, fontSize: 11, color: "var(--ink-3)", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
								<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--clay)" }} />Below city average</span>
								<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--sage)" }} />At or above</span>
								<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 0, height: 14, borderLeft: "2px dashed var(--ink-2)" }} />City average</span>
							</div>
						</div>

						<div className="map-card" style={{ padding: 22 }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
								<div>
									<div className="section-label">Mood pulse · last 14 days</div>
									<div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
										Share of check-ins flagged as <strong style={{ color: "var(--rose)", fontWeight: 500 }}>distressed</strong> or <strong style={{ color: "var(--clay-deep)", fontWeight: 500 }}>concerned</strong> language, by day.
									</div>
								</div>
								<div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>n = 142</div>
							</div>

							<svg viewBox="0 0 280 90" width="100%" height="90" preserveAspectRatio="none">
								<defs>
									<linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="var(--rose)" stopOpacity="0.5" />
										<stop offset="100%" stopColor="var(--rose)" stopOpacity="0" />
									</linearGradient>
								</defs>
								{[0, 0.25, 0.5, 0.75].map((y) => (
									<line key={y} x1="0" x2="280" y1={y * 90} y2={y * 90} stroke="var(--line-soft)" strokeWidth="0.5" />
								))}
								<path d={`M 0 ${H} L ${xy(concerned)} L ${W} ${H} Z`} fill="var(--clay)" fillOpacity="0.25" />
								<path d={`M ${xy(concerned)}`} fill="none" stroke="var(--clay)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
								<path d={`M 0 ${H} L ${xy(distressed)} L ${W} ${H} Z`} fill="url(#moodGrad)" />
								<path d={`M ${xy(distressed)}`} fill="none" stroke="var(--rose)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
							</svg>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
								<span>14 days ago</span>
								<span>today</span>
							</div>

							<div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
								<div className="section-label" style={{ marginBottom: 10 }}>Recurring phrases · paraphrased &amp; k-anonymous</div>
								{RECENT_PHRASES.slice(0, 4).map((p) => (
									<div key={p.text} className="phrase">
										<span className="dot" style={{ background: MOOD_PULSE.find((m) => m.key === p.sent)?.color || "var(--ink-3)" }} />
										<span className="text">{p.text}</span>
										<span className="meta">×{p.n}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
						<div className="map-card" style={{ padding: 22 }}>
							<div className="section-label" style={{ marginBottom: 10 }}>Top needs raised · fortnight</div>
							<div className="needs-list">
								{needs.map((n, i) => (
									<div className="need-row" key={n.need}>
										<span className="rank">0{i + 1}</span>
										<div>
											<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
												<span>{n.need}</span>
												<span style={{ color: "var(--ink-4)", fontSize: 12 }}>{n.n} signals</span>
											</div>
											<div className="bar" style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
												<i style={{ display: "block", width: `${n.pct * 2.4}%`, height: "100%", background: "var(--clay)" }} />
											</div>
										</div>
										<span className="pct">{n.pct}%</span>
									</div>
								))}
							</div>
						</div>

						<SpecialistReferrals />

						<div className="map-card" style={{ padding: 22 }}>
							<div className="section-label" style={{ marginBottom: 10 }}>Suggested actions</div>
							<ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
								{ACTIONS.map((a, i) => (
									<li key={a.title} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 12, alignItems: "start" }}>
										<span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>0{i + 1}</span>
										<div>
											<div style={{ fontFamily: "var(--font-display)", fontSize: 16, lineHeight: 1.3 }}>{a.title}</div>
											<div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.45 }}>{a.why}</div>
											<div style={{ display: "flex", gap: 6, marginTop: 8 }}>
												<span className="score-tag low" style={{ fontSize: 10 }}>{a.effort}</span>
												<span className="score-tag med" style={{ fontSize: 10 }}>{a.impact} impact</span>
											</div>
										</div>
										<button type="button" className="btn" style={{ padding: "6px 10px" }}><CIcon.arrow /></button>
									</li>
								))}
							</ol>
						</div>

						<div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", letterSpacing: "0.02em", lineHeight: 1.6 }}>
							Privacy: aggregated from 142 consented check-ins · suppressed below n=5 · individual residents are never identified
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
