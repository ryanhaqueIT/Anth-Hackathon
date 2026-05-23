// Resident-facing companion — proactive, warm, distress-aware.
// Four artboards live here:
//   <ResidentCheckin>  — NEW HERO. Proactive daily check-in ("How are you doing?")
//   <ResidentRecs>     — After-checkin: empathy + 3 light recommendations
//   <ResidentSupport>  — NEW. Distress-aware path: gentle reply + specialist routing
//   <ResidentListening>— Voice listening state (full-screen waveform)

// ─── icon set (tiny, line-style, currentColor) ──────────────────────────────
const Icon = {
  mic: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 28} height={p.size || 28} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3"/>
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>
    </svg>
  ),
  clock: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  ),
  walk: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4.5" r="1.8"/>
      <path d="M9 21l2-7-3-2 2-5 4 2 3 4M7 14l-1 7"/>
    </svg>
  ),
  coin: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><path d="M9 9c1-1 3-1 4 0s-1 2 0 3 3 1 4 0"/>
    </svg>
  ),
  settings: () => (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>
    </svg>
  ),
  help: () => (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.3-1 1-1 1.7M12 17h.01"/>
    </svg>
  ),
  arrow: () => (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>
    </svg>
  ),
  heart: () => (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
      <path d="M12 21s-7-4.6-9.3-9.1C1 8.5 3.4 4 7.5 4c2.1 0 3.5 1.2 4.5 2.6C12.9 5.2 14.4 4 16.5 4 20.6 4 23 8.5 21.3 11.9 19 16.4 12 21 12 21Z"/>
    </svg>
  ),
};

// ─── A1 — Proactive daily check-in (NEW HERO) ─────────────────────────
function ResidentCheckin() {
  return (
    <div className="resident checkin">
      <div>
        <div className="topbar">
          <div className="brand">
            <span className="pulse-dot"></span>
            <span>Pulse</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="icon-btn" aria-label="Help"><Icon.help/></button>
            <button className="icon-btn" aria-label="Settings"><Icon.settings/></button>
          </div>
        </div>

        <div className="greet-block">
          <p className="greet-small">It’s Tuesday afternoon in Carlton.</p>
          <h1 className="ask">How are you <em>doing</em> today, Margaret?</h1>
          <p className="ask-sub">I’m just checking in like I do most days — no need to say much.</p>
        </div>

        <div className="feel-list">
          <button className="feel-btn">
            <span className="swatch ok"></span>
            All good, thanks
            <span className="arr"><Icon.arrow/></span>
          </button>
          <button className="feel-btn">
            <span className="swatch quiet"></span>
            Just quiet, really
            <span className="arr"><Icon.arrow/></span>
          </button>
          <button className="feel-btn">
            <span className="swatch lonely"></span>
            A bit lonely today
            <span className="arr"><Icon.arrow/></span>
          </button>
          <button className="feel-btn">
            <span className="swatch hard"></span>
            Having a hard day
            <span className="arr"><Icon.arrow/></span>
          </button>
        </div>

        <div className="voice-hint-row">— or just say a few words —</div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <button className="mic-btn" aria-label="Speak">
            <Icon.mic size={36}/>
          </button>
        </div>
        <div className="streak">
          <Icon.heart/> &nbsp; checked in <em>24 days</em> running
        </div>
      </div>
    </div>
  );
}

// ─── A2 — After check-in: empathy + light recommendations ────────────
function ResidentRecs() {
  return (
    <div className="resident">
      <div className="topbar">
        <div className="brand">
          <span className="pulse-dot"></span>
          <span>Pulse</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" aria-label="Help"><Icon.help/></button>
          <button className="icon-btn" aria-label="Settings"><Icon.settings/></button>
        </div>
      </div>

      <div className="scroll">
        {/* User chose "A bit lonely today" */}
        <div className="bubble user">
          A bit lonely today, really.
        </div>
        <div className="bubble-meta right">You · just now</div>

        {/* Companion empathic reply, initiating */}
        <div className="bubble assistant" style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', lineHeight: 1.4 }}>
          Thank you for telling me, Margaret. That’s the kind of day that asks for something gentle. Would a familiar face, a walk in the sun, or just someone to ring you help most?
        </div>

        {/* Recommendations */}
        <div className="recs">
          {SERVICES.map((s) => (
            <div className="rec" key={s.id}>
              <span className={`rec-tag ${s.tagClass}`}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                {s.tag}
              </span>
              <h3 className="rec-title">{s.title}</h3>
              <div className="rec-meta">
                <span className="item"><Icon.clock/><span>{s.next}</span></span>
                <span className="item"><Icon.walk/><span>{s.distance}</span></span>
                <span className="item"><Icon.coin/><span>{s.cost}</span></span>
              </div>
              <p className="rec-why">
                <span className="why-label">Why this —</span>
                {s.why}
              </p>
            </div>
          ))}
        </div>

        <div className="quicks">
          <button className="chip">Tell me about the first one</button>
          <button className="chip">Something quieter</button>
          <button className="chip">Maybe tomorrow</button>
        </div>
      </div>

      <div className="voicebar">
        <button className="mic-btn" aria-label="Speak">
          <Icon.mic size={36}/>
        </button>
        <div className="mic-hint">Tap to speak — or <em>say “read it to me”</em></div>
      </div>
    </div>
  );
}

// ─── A3 — Distress-aware path (NEW) ──────────────────────────────────
function ResidentSupport() {
  return (
    <div className="resident supportive">
      <div className="topbar">
        <div className="brand">
          <span className="pulse-dot"></span>
          <span>Pulse</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" aria-label="Help"><Icon.help/></button>
          <button className="icon-btn" aria-label="Settings"><Icon.settings/></button>
        </div>
      </div>

      <div className="scroll">
        {/* What the resident said — paraphrased here, the system has flagged it */}
        <div className="care-bubble user">
          I just don’t see the point of getting up some mornings, love.
        </div>
        <div className="bubble-meta right">You · a moment ago</div>

        {/* Companion's gentle reply — acknowledges, offers, doesn't dictate */}
        <div className="care-bubble kind">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', lineHeight: 1.4, marginBottom: 8 }}>
            <em>Margaret</em> — what you just shared sounds really heavy. I’m glad you told me.
          </div>
          <div style={{ color: 'var(--ink-2)' }}>
            Would it help to speak with someone trained to listen? They’re free, kind, and they won’t rush you.
          </div>
        </div>

        {/* Three specialist routes — biggest CTA in the design, on purpose */}
        <div style={{ marginTop: 6 }}>
          {SPECIALISTS.slice(0, 3).map((sp) => (
            <a key={sp.id} className="specialist" href="#" onClick={(e) => e.preventDefault()}>
              <div className="row">
                <div className="name">{sp.name}</div>
                <div className="phone">{sp.phone}</div>
              </div>
              <div className="desc">{sp.desc}</div>
              <div className="cta"><Icon.phone size={16}/> Call now — I’ll stay on the line</div>
            </a>
          ))}
        </div>

        {/* Softer alternatives */}
        <div className="gentle-row">
          <button className="opt">
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--sage)' }}></span>
            Just stay with me a little while
          </button>
          <button className="opt">
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--gold)' }}></span>
            Could you ring Sarah (your daughter)? She said yes to this last month.
          </button>
        </div>

        <div className="emergency-note">
          <strong>I’m not an emergency service.</strong> If you, or someone with you, is in immediate danger, please dial <strong>000</strong>.
        </div>
      </div>
    </div>
  );
}

// ─── A4 — Voice listening state ──────────────────────────────────
function ResidentListening() {
  return (
    <div className="resident listening">
      <div className="topbar">
        <div className="brand">
          <span className="pulse-dot"></span>
          <span>Pulse</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>Listening · Carlton</div>
      </div>

      <div className="listen-stage">
        <div className="waveform" aria-hidden="true">
          {Array.from({ length: 13 }).map((_, i) => <div key={i} className="bar"/>)}
        </div>

        <div className="listen-label">I’m listening, take your time…</div>

        <div className="live-transcript">
          I think I’d like a quiet cup of tea with someone <span className="pending">this afternoon</span>
        </div>

        <button className="stop-btn">
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--clay)' }}></span>
          Tap when you’re done
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ResidentCheckin, ResidentRecs, ResidentSupport, ResidentListening });
