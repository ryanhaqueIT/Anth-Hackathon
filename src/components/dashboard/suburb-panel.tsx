import { NEEDS_BY_SUBURB, SUBURBS, gapBand } from "@/lib/mock-data";
import { CIcon } from "./icons";
import { SupportGapTip } from "./info-tip";

type Props = {
	id: string;
	onDrillIn: () => void;
	onBrief: () => void;
};

export function SuburbPanel({ id, onDrillIn, onBrief }: Props) {
	const s = SUBURBS.find((x) => x.id === id) || SUBURBS[0];
	const band = gapBand(s.gap);
	const needs = NEEDS_BY_SUBURB[s.id] || NEEDS_BY_SUBURB.carlton;
	return (
		<aside className="panel">
			<div>
				<div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", marginBottom: 8 }}>
					Selected area
				</div>
				<h2>
					{s.name}
					<span className={`score-tag ${band.cls}`}>
						<span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
						{band.label} gap
					</span>
				</h2>
				<div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
					{s.pop65} of residents are 65+ · {s.checkins} check-ins this fortnight
				</div>
			</div>

			<div className="stat-row">
				<div className="stat">
					<div className="label" style={{ display: "flex", alignItems: "center" }}>Support Gap<SupportGapTip /></div>
					<div className="val">{s.gap}<span style={{ fontSize: 13, color: "var(--ink-3)", marginLeft: 4 }}>/100</span></div>
					<div className="sub" style={{ color: "var(--rose)" }}>↑ 6 vs last fortnight</div>
				</div>
				<div className="stat">
					<div className="label">Nearby services</div>
					<div className="val">{s.services}</div>
					<div className="sub">3 open after 5pm</div>
				</div>
			</div>

			<div>
				<div className="section-label">Mood pulse · this suburb</div>
				<div className="mood-bar" style={{ height: 12 }}>
					{[
						{ key: "s", pct: 34, color: "var(--sage)" },
						{ key: "r", pct: 24, color: "var(--gold)" },
						{ key: "c", pct: 28, color: "var(--clay)" },
						{ key: "d", pct: 14, color: "var(--rose)" },
					].map((m) => (
						<div key={m.key} className="seg" style={{ width: `${m.pct}%`, background: m.color }} />
					))}
				</div>
				<div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
					<span>Steady 34%</span>
					<span>Refl. 24%</span>
					<span>Concerned 28%</span>
					<span style={{ color: "var(--rose)" }}>Distressed 14%</span>
				</div>
			</div>

			<div>
				<div className="section-label">Top needs raised this fortnight</div>
				<div className="needs-list">
					{needs.map((n, i) => (
						<div className="need-row" key={n.need}>
							<span className="rank">0{i + 1}</span>
							<div>
								<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
									<span>{n.need}</span>
									<span style={{ color: "var(--ink-4)", fontSize: 12 }}>{n.n}</span>
								</div>
								<div className="bar"><i style={{ width: `${n.pct * 2.4}%` }} /></div>
							</div>
							<span className="pct">{n.pct}%</span>
						</div>
					))}
				</div>
			</div>

			<div>
				<div className="section-label">Recommended action</div>
				<div className="insight">
					<h4 className="what">Carlton has rising social-connection requests after 5pm, but limited free activities in that window.</h4>
					<p className="why">
						Consider extending the Library's Wednesday lunch into a fortnightly twilight session, or partnering with the bowls club on Drummond Street. Estimated reach: ~80 residents within 1.2km.
					</p>
					<div style={{ display: "flex", gap: 8, marginTop: 12 }}>
						<button type="button" className="btn btn-ink" onClick={onBrief}>Open brief <CIcon.arrow /></button>
						<button type="button" className="btn" onClick={onDrillIn}>View suburb detail</button>
					</div>
				</div>
			</div>
		</aside>
	);
}
