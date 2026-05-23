import { MOOD_PULSE, SPECIALISTS } from "@/lib/mock-data";

export function MoodPulseCard({ compact = false }: { compact?: boolean }) {
	return (
		<div className="map-card" style={{ padding: compact ? 16 : 20, gap: 12, flex: "0 0 auto" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
				<div>
					<div className="section-label" style={{ marginBottom: 4 }}>Mood Pulse · fortnight</div>
					<div style={{ fontSize: 13, color: "var(--ink-3)" }}>
						What residents' language sounds like, in aggregate. <strong style={{ color: "var(--rose)", fontWeight: 500 }}>52 distressed check-ins</strong> this fortnight — all routed to a specialist in-conversation.
					</div>
				</div>
				<div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", flexShrink: 0, marginLeft: 16 }}>
					n = 657 · k-anonymous
				</div>
			</div>

			<div className="mood-bar" role="img" aria-label="Mood breakdown">
				{MOOD_PULSE.map((m) => (
					<div key={m.key} className="seg" style={{ width: `${m.pct}%`, background: m.color }} title={`${m.label} · ${m.pct}%`}>
						{m.pct >= 8 ? `${m.pct}%` : ""}
					</div>
				))}
			</div>

			{!compact && (
				<div className="mood-legend">
					{MOOD_PULSE.map((m) => (
						<div key={m.key} className={`item ${m.key === "distressed" ? "distressed" : ""}`}>
							<div className="lbl"><span className="dot" style={{ background: m.color }} />{m.label}</div>
							<div className="val">{m.pct}%</div>
							<div className="sub">n = {m.n}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export function SpecialistReferrals({ compact = false }: { compact?: boolean }) {
	return (
		<div className="map-card" style={{ padding: 20, gap: 10, flex: "0 0 auto" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
				<div>
					<div className="section-label" style={{ marginBottom: 4 }}>Specialist referrals · fortnight</div>
					{!compact && (
						<div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.45 }}>
							When alarming or hopeless language is detected, the companion offers a specialist line in-conversation. The resident chooses whether to act.
						</div>
					)}
				</div>
				<div style={{ display: "flex", alignItems: "baseline", gap: 6, flexShrink: 0 }}>
					<span className="display" style={{ fontSize: 28, lineHeight: 1 }}>59</span>
					<span style={{ fontSize: 11, color: "var(--ink-3)" }}>handoffs</span>
				</div>
			</div>

			<div style={{ marginTop: 4 }}>
				{SPECIALISTS.map((sp) => (
					<div key={sp.id} className="ref-row">
						<div>
							<div className="nm">{sp.name}</div>
							<span className="ph">{sp.phone}</span>
						</div>
						<div className="cnt">{sp.handoffs}</div>
						<div className={`dlt ${sp.delta.startsWith("+") ? "up" : ""}`}>{sp.delta}</div>
					</div>
				))}
			</div>
		</div>
	);
}
