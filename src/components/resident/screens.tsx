import { type ReactNode, useEffect, useState } from "react";
import { type CheckinResponse, type ServiceRec, recDistance, recNextSession, recTag } from "./api";
import { HOST_SIZES, HOST_TIMES, HOST_TOPICS, HOST_VENUES, SPECIALISTS, type Specialist } from "./host-data";
import { Icon } from "./icons";

export function ResidentTop({ onBack, right }: { onBack?: () => void; right?: ReactNode }) {
	return (
		<div className="topbar">
			{onBack ? (
				<button type="button" className="icon-btn" aria-label="Back" onClick={onBack}><Icon.back /></button>
			) : (
				<span />
			)}
			<div style={{ display: "flex", gap: 8 }}>
				{right ?? (
					<button type="button" className="icon-btn" aria-label="Settings"><Icon.settings /></button>
				)}
			</div>
		</div>
	);
}

export function ScreenCheckin({ onMood, onVoice }: { onMood: (k: string) => void; onVoice: () => void }) {
	const feels: { k: string; label: string; cls: string }[] = [
		{ k: "ok", label: "All good, thanks", cls: "ok" },
		{ k: "quiet", label: "Just quiet, really", cls: "quiet" },
		{ k: "lonely", label: "A bit lonely today", cls: "lonely" },
		{ k: "hard", label: "Having a hard day", cls: "hard" },
	];
	return (
		<div className="resident checkin">
			<div>
				<ResidentTop />
				<div className="greet-block">
					<h1 className="ask">How are you <em>doing</em> today, Margaret?</h1>
				</div>
				<div className="feel-list">
					{feels.map((f) => (
						<button type="button" key={f.k} className="feel-btn" onClick={() => onMood(f.k)}>
							<span className={`swatch ${f.cls}`} />
							{f.label}
							<span className="arr"><Icon.arrow /></span>
						</button>
					))}
				</div>
				<div className="voice-hint-row">— or just say a few words —</div>
			</div>
			<div>
				<div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
					<button type="button" className="mic-btn" aria-label="Speak" onClick={onVoice}>
						<Icon.mic size={36} />
					</button>
				</div>
				<div className="streak"><Icon.heart /> &nbsp; checked in <em>24 days</em> running</div>
			</div>
		</div>
	);
}

const ACK_COPY: Record<string, { lead: string; tail: string }> = {
	ok: { lead: "Lovely to hear, Margaret.", tail: "Here are a few small things going on nearby today." },
	quiet: { lead: "A quiet day is a perfectly fair kind of day.", tail: "Let me find a few gentle things you might like." },
	lonely: { lead: "Thank you for telling me.", tail: "Let me see who's about today." },
	low: { lead: "Glad you told me — that's a brave thing to say.", tail: "Let me find a few things, including someone you can just speak to." },
};

export function ScreenAcknowledge({ mood }: { mood: string | null }) {
	const c = (mood && ACK_COPY[mood]) || ACK_COPY.lonely;
	return (
		<div className="resident">
			<ResidentTop />
			<div className="ack-stage">
				<div className="ack-thinking" aria-hidden="true">
					<span /><span /><span />
				</div>
				<div className="ack-lead">{c.lead}</div>
				<div className="ack-tail">{c.tail}</div>
			</div>
		</div>
	);
}

export function ScreenRecs({
	mood,
	data,
	onPick,
	onBack,
}: {
	mood: string | null;
	data: CheckinResponse | null;
	onPick: (r: ServiceRec) => void;
	onBack: () => void;
}) {
	const headline = data?.headline ?? "Here are a few options that might suit today.";
	const items = data?.recommendations ?? [];
	const live = data?.source === "openai";
	return (
		<div className="resident">
			<ResidentTop onBack={onBack} />
			<div className="scroll">
				<div className="bubble assistant" style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", lineHeight: 1.4 }}>
					{headline}
					{live && (
						<span style={{ display: "block", fontSize: "0.7rem", color: "var(--ink-3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
							· live · matched from City of Melbourne Helping Out
						</span>
					)}
				</div>

				{items.length === 0 ? (
					<div style={{ padding: "24px 0", color: "var(--ink-3)" }}>I'll keep listening, Margaret.</div>
				) : (
					<div className="recs">
						{items.map((s) => {
							const tag = recTag(s);
							return (
								<button
									type="button"
									key={s.name}
									className="rec"
									onClick={() => onPick(s)}
									style={{ textAlign: "left", font: "inherit", color: "inherit" }}
								>
									<span className={`rec-tag ${tag.cls}`}>
										<span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
										{tag.label}
									</span>
									<h3 className="rec-title">{s.name}</h3>
									<div className="rec-meta">
										<span className="item"><Icon.clock /><span>{recNextSession(s)}</span></span>
										<span className="item"><Icon.walk /><span>{recDistance(s)}</span></span>
										<span className="item"><Icon.coin /><span>{s.cost}</span></span>
									</div>
									<p className="rec-why">
										<span className="why-label">Why this —</span>{s.why}
									</p>
								</button>
							);
						})}
					</div>
				)}

				<div className="quicks">
					<button type="button" className="chip">Something quieter</button>
					<button type="button" className="chip" onClick={onBack}>Maybe tomorrow</button>
				</div>
			</div>

			<div className="voicebar">
				<button type="button" className="mic-btn" aria-label="Speak">
					<Icon.mic size={36} />
				</button>
				<div className="mic-hint">Tap a card to hear more — or <em>say "read it to me"</em></div>
			</div>
		</div>
	);
}

export function ScreenDetail({ rec, onSave, onBack }: { rec: ServiceRec | null; onSave: () => void; onBack: () => void }) {
	if (!rec) return null;
	const tag = recTag(rec);
	return (
		<div className="resident">
			<ResidentTop onBack={onBack} />
			<div className="detail">
				<div className="hero">[ COMMUNITY · LIBRARY · PHOTO PLACEHOLDER ]</div>
				<div className="pad">
					<span className={`rec-tag ${tag.cls}`} style={{ marginBottom: 10 }}>
						<span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
						{tag.label}
					</span>
					<h1>{rec.name}</h1>
					<p className="where">
						<span style={{ display: "inline-flex", verticalAlign: "-2px", marginRight: 4 }}><Icon.pin /></span>
						{rec.address || rec.suburb}
					</p>
					<div className="facts">
						<div><div className="label">When</div><div className="val">{recNextSession(rec)}</div></div>
						<div><div className="label">Getting there</div><div className="val">{recDistance(rec)} · {rec.transport || "transport TBC"}</div></div>
						<div><div className="label">Cost</div><div className="val">{rec.cost}</div></div>
						<div><div className="label">Phone</div><div className="val">{rec.phone || "—"}</div></div>
					</div>
					<div className="why-box">
						<span className="why-label">Why we suggested this</span>
						{rec.why}
					</div>
					<div className="actions">
						<button type="button" className="btn-primary" onClick={onSave}>
							<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 7" /></svg>
							Yes, save and remind me at noon
						</button>
						{rec.phone && (
							<button type="button" className="btn-secondary"><Icon.phone size={16} /> Call {rec.phone}</button>
						)}
						<button type="button" className="btn-secondary" onClick={onBack}><Icon.bell /> Show me the others first</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ScreenSaved({ rec, onDone }: { rec: ServiceRec | null; onDone: () => void }) {
	useEffect(() => {
		const t = setTimeout(onDone, 3500);
		return () => clearTimeout(t);
	}, [onDone]);
	return (
		<div className="resident">
			<ResidentTop />
			<div className="saved-stage">
				<div className="saved-tick"><Icon.check /></div>
				<div className="saved-title">Saved.</div>
				<div className="saved-sub">
					I'll give you a gentle nudge at <strong>12:00</strong> for <em>{rec?.name ?? "your plan"}</em>.
				</div>
				<button type="button" className="btn-secondary" onClick={onDone} style={{ marginTop: 18 }}>Back to the start</button>
				<div className="saved-foot">Returning home in a moment…</div>
			</div>
		</div>
	);
}

export function ScreenSupport({
	onPick,
	onStay,
	onBack,
}: {
	onPick: (s: Specialist) => void;
	onStay: () => void;
	onBack: () => void;
}) {
	return (
		<div className="resident supportive">
			<ResidentTop onBack={onBack} />
			<div className="scroll">
				<div className="care-bubble user">
					I don't really see the point of getting up some mornings, love.
				</div>
				<div className="bubble-meta right">You · a moment ago</div>

				<div className="care-bubble kind">
					<div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", lineHeight: 1.4, marginBottom: 8 }}>
						<em>Margaret</em> — what you just shared sounds really heavy. I'm glad you told me.
					</div>
					<div style={{ color: "var(--ink-2)" }}>
						Would it help to speak with someone trained to listen? They're free, kind, and they won't rush you.
					</div>
				</div>

				<div style={{ marginTop: 6 }}>
					{SPECIALISTS.map((sp) => (
						<button
							type="button"
							key={sp.id}
							className="specialist"
							onClick={() => onPick(sp)}
							style={{ font: "inherit", textAlign: "left", color: "inherit", width: "100%" }}
						>
							<div className="row">
								<div className="name">{sp.name}</div>
								<div className="phone">{sp.phone}</div>
							</div>
							<div className="desc">{sp.desc}</div>
							<div className="cta"><Icon.phone size={16} /> Call now — I'll stay on the line</div>
						</button>
					))}
				</div>

				<div className="gentle-row">
					<button type="button" className="opt" onClick={onStay}>
						<span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--sage)" }} />
						Just stay with me a little while
					</button>
				</div>

				<div className="emergency-note">
					<strong>I'm not an emergency service.</strong> If you, or someone with you, is in immediate danger, please dial <strong>000</strong>.
				</div>
			</div>
		</div>
	);
}

function CallTimer() {
	const [s, setS] = useState(0);
	useEffect(() => {
		const t = setInterval(() => setS((x) => x + 1), 1000);
		return () => clearInterval(t);
	}, []);
	const mm = String(Math.floor(s / 60)).padStart(2, "0");
	const ss = String(s % 60).padStart(2, "0");
	return <span>{mm}:{ss}</span>;
}

export function ScreenCalling({ spec, onEnd, onStay }: { spec: Specialist | null; onEnd: () => void; onStay: () => void }) {
	const [phase, setPhase] = useState<"ringing" | "connected">("ringing");
	useEffect(() => {
		const t = setTimeout(() => setPhase("connected"), 2600);
		return () => clearTimeout(t);
	}, []);
	return (
		<div className="resident calling">
			<div className="call-stage">
				<div className={`call-pulse ${phase}`}>
					<Icon.phone size={42} />
				</div>
				<div className="call-name">{spec?.name ?? "Lifeline"}</div>
				<div className="call-phone">{spec?.phone ?? "13 11 14"}</div>
				<div className="call-status">
					{phase === "ringing" ? "Connecting you now…" : "Connected. They have you, Margaret."}
				</div>
				{phase === "connected" && (
					<div className="call-timer" aria-live="polite"><CallTimer /></div>
				)}

				<div className="call-actions">
					<button type="button" className="call-end" onClick={onEnd}>
						<Icon.phoneOff />
						{phase === "ringing" ? "Cancel call" : "End call"}
					</button>
					{phase === "connected" && (
						<button type="button" className="call-stay" onClick={onStay}>I'd rather just sit quietly</button>
					)}
				</div>

				<div className="call-foot">I'm here with you. You don't have to do this alone.</div>
			</div>
		</div>
	);
}

export function ScreenBreathing({ onDone }: { onDone: () => void }) {
	return (
		<div className="resident breathing">
			<ResidentTop onBack={onDone} />
			<div className="breath-stage">
				<div className="breath-circle"><span>breathe</span></div>
				<div className="breath-label">In through your nose…<br />… and out through your mouth.</div>
				<div className="breath-sub">I'm sitting with you. No rush — take as long as you need.</div>
				<button type="button" className="btn-secondary" style={{ marginTop: 24 }} onClick={onDone}>I'm a bit steadier now</button>
			</div>
		</div>
	);
}

export function ScreenHostOffer({ onYes, onLater, onBack }: { onYes: () => void; onLater: () => void; onBack: () => void }) {
	return (
		<div className="resident host-stage">
			<ResidentTop onBack={onBack} />
			<div className="scroll" style={{ paddingBottom: 24 }}>
				<div className="host-intro">
					<h1>A quiet day's a fair kind of <em>day</em>, Margaret.</h1>
					<p>
						Lately three of your neighbours have offered to share what they know — Joan's sourdough, Vinh's gentle walks, an Italian afternoon. Is there something you'd quietly love to share?
					</p>
				</div>
				<div className="host-actions">
					<button type="button" className="primary" onClick={onYes}>
						Yes, I have an idea <Icon.arrow />
					</button>
					<button type="button" className="secondary" onClick={onLater}>
						Maybe just show me what's about
					</button>
				</div>
				<div style={{ padding: "6px 24px 0", fontSize: "0.78rem", color: "var(--ink-4)", textAlign: "center", lineHeight: 1.5 }}>
					Hosting is just an offer — neighbours can ask to come along, and you say yes or no. No fuss, no charge.
				</div>
			</div>
		</div>
	);
}

export function ScreenHostCraft({
	topic,
	onPick,
	onContinue,
	onBack,
}: {
	topic: string | null;
	onPick: (id: string) => void;
	onContinue: () => void;
	onBack: () => void;
}) {
	return (
		<div className="resident host-stage">
			<ResidentTop onBack={onBack} />
			<div className="scroll" style={{ paddingBottom: 24 }}>
				<div className="host-intro">
					<h1>What might you <em>share</em>?</h1>
					<p>No big production — just something small and warm.</p>
				</div>
				<div className="host-grid">
					{HOST_TOPICS.map((tp) => (
						<button
							type="button"
							key={tp.id}
							className={`host-card ${topic === tp.id ? "selected" : ""}`}
							onClick={() => onPick(tp.id)}
						>
							<span className="swatch" style={{ background: tp.swatch }} />
							<span className="label">{tp.label}</span>
							<span className="eg">e.g. {tp.eg}</span>
						</button>
					))}
				</div>
			</div>
			<div className="host-cta">
				<button type="button" className="post-btn" disabled={!topic} onClick={onContinue}>
					Continue <Icon.arrow />
				</button>
			</div>
		</div>
	);
}

export function ScreenHostWhen({
	when,
	venue,
	size,
	onWhen,
	onVenue,
	onSize,
	onContinue,
	onBack,
}: {
	when: string | null;
	venue: string | null;
	size: string | null;
	onWhen: (id: string) => void;
	onVenue: (id: string) => void;
	onSize: (id: string) => void;
	onContinue: () => void;
	onBack: () => void;
}) {
	return (
		<div className="resident host-stage">
			<ResidentTop onBack={onBack} />
			<div className="scroll" style={{ paddingBottom: 24 }}>
				<div className="host-intro">
					<h1>When and <em>where</em>?</h1>
					<p>Pick something easy. You can always change later.</p>
				</div>

				<div className="host-section">
					<h4>When</h4>
					<div className="host-options">
						{HOST_TIMES.map((t) => (
							<button type="button" key={t.id} className={`opt ${when === t.id ? "selected" : ""}`} onClick={() => onWhen(t.id)}>
								<span>{t.label}</span>
								<span className="detail">{t.detail}</span>
							</button>
						))}
					</div>
				</div>

				<div className="host-section">
					<h4>Where</h4>
					<div className="host-options">
						{HOST_VENUES.map((v) => (
							<button type="button" key={v.id} className={`opt ${venue === v.id ? "selected" : ""}`} onClick={() => onVenue(v.id)}>
								<span>{v.label}</span>
								<span className="detail">{v.desc}</span>
							</button>
						))}
					</div>
				</div>

				<div className="host-section">
					<h4>How many</h4>
					<div className="host-options">
						{HOST_SIZES.map((s) => (
							<button type="button" key={s.id} className={`opt ${size === s.id ? "selected" : ""}`} onClick={() => onSize(s.id)}>
								<span>{s.label}</span>
								<span className="detail">{s.detail}</span>
							</button>
						))}
					</div>
				</div>
			</div>
			<div className="host-cta">
				<button type="button" className="post-btn" disabled={!(when && venue && size)} onClick={onContinue}>
					Post to neighbourhood <Icon.arrow />
				</button>
			</div>
		</div>
	);
}

export function ScreenHosted({
	topic,
	when,
	venue,
	size,
	onDone,
}: {
	topic: string | null;
	when: string | null;
	venue: string | null;
	size: string | null;
	onDone: () => void;
}) {
	useEffect(() => {
		const t = setTimeout(onDone, 6000);
		return () => clearTimeout(t);
	}, [onDone]);
	const tp = HOST_TOPICS.find((x) => x.id === topic) ?? HOST_TOPICS[0];
	const w = HOST_TIMES.find((x) => x.id === when) ?? HOST_TIMES[0];
	const v = HOST_VENUES.find((x) => x.id === venue) ?? HOST_VENUES[0];
	const sz = HOST_SIZES.find((x) => x.id === size) ?? HOST_SIZES[0];
	const title = topic === "bake" ? "Margaret's Sourdough — a quiet morning" : `Margaret's ${tp.label.toLowerCase()}`;
	return (
		<div className="resident">
			<ResidentTop />
			<div className="hosted-stage">
				<div className="hosted-tick">
					<svg viewBox="0 0 24 24" width={36} height={36} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 7" /></svg>
				</div>
				<div className="hosted-title">Your offer is live.</div>
				<div className="hosted-sub">
					I'll let you know quietly when a neighbour signs up — no pressure, no buzzing.
				</div>

				<div className="host-preview">
					<span className="pv-tag">
						<span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
						Hosted by a neighbour · {tp.label.toLowerCase()}
					</span>
					<h3 className="pv-title">{title}</h3>
					<div className="pv-meta">
						<span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.clock />{w.label} · {w.detail.split("·")[1]?.trim()}</span>
						<span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.pin />{v.label}</span>
						<span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
							<svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
								<circle cx="9" cy="8" r="3" /><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6" /><circle cx="17" cy="6" r="2.4" /><path d="M22 18c0-2.5-2-4-4.5-4" />
							</svg>
							{sz.label}
						</span>
					</div>
					<p className="pv-why">
						<span className="label">Margaret says —</span>
						A quiet morning. We'll knead, drink tea, and share what we know. Beginners very welcome.
					</p>
				</div>

				<div className="hosted-foot">
					You've added something warm to Carlton today, Margaret.
				</div>
			</div>
		</div>
	);
}
