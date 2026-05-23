// Resident-facing companion — stateful interactive prototype.
// Owns a small state machine that connects every screen:
//   checkin → (mood) → acknowledge → recs → detail → saved → checkin
//                                ↘
//                            deeper → support → calling → support
//                                              ↘ breathing → checkin
//             listening (voice) → recs
//
// Each screen is a sub-component that takes callbacks. ResidentApp wires them.
//
// Backend wiring: on every mood selection (and on voice-transcript completion)
// ResidentApp POSTs to /api/checkins via window.NPApi.submitCheckin, persists
// the returned recommendations to local state, and ScreenRecs renders those
// in place of the hardcoded SERVICES from data.js. Falls back to data.js
// SERVICES if the API is unreachable (so the prototype still works offline).

// ─── icon set ───────────────────────────────────────────────────────────
const Icon = {
  mic: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 28} height={p.size || 28} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>
    </svg>
  ),
  clock: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  ),
  walk: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4.5" r="1.8"/><path d="M9 21l2-7-3-2 2-5 4 2 3 4M7 14l-1 7"/>
    </svg>
  ),
  coin: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><path d="M9 9c1-1 3-1 4 0s-1 2 0 3 3 1 4 0"/>
    </svg>
  ),
  pin: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/>
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
      <circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.3-1 1-1 1.7M12 17h.01"/>
    </svg>
  ),
  arrow: () => (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  ),
  back: () => (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7"/>
    </svg>
  ),
  phone: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>
    </svg>
  ),
  phoneOff: () => (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.7 13.3a16 16 0 0 0 6 0M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3M2 2l20 20"/>
    </svg>
  ),
  heart: () => (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
      <path d="M12 21s-7-4.6-9.3-9.1C1 8.5 3.4 4 7.5 4c2.1 0 3.5 1.2 4.5 2.6C12.9 5.2 14.4 4 16.5 4 20.6 4 23 8.5 21.3 11.9 19 16.4 12 21 12 21Z"/>
    </svg>
  ),
  check: () => (
    <svg viewBox="0 0 24 24" width={36} height={36} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5l5 5L20 7"/>
    </svg>
  ),
  bell: () => (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0"/>
    </svg>
  ),
};

// Shared top bar
function ResidentTop({ onBack, right }) {
  return (
    <div className="topbar">
      {onBack
        ? <button className="icon-btn" aria-label="Back" onClick={onBack}><Icon.back/></button>
        : <div className="brand"><span className="pulse-dot"></span><span>Pulse</span></div>}
      {onBack && <div className="brand"><span className="pulse-dot"></span><span>Pulse</span></div>}
      <div style={{ display: 'flex', gap: 8 }}>
        {right || (
          <>
            <button className="icon-btn" aria-label="Help"><Icon.help/></button>
            <button className="icon-btn" aria-label="Settings"><Icon.settings/></button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN: proactive check-in ─────────────────────────────────────────
function ScreenCheckin({ onMood, onVoice }) {
  return (
    <div className="resident checkin">
      <div>
        <ResidentTop/>
        <div className="greet-block">
          <p className="greet-small">It’s Tuesday afternoon in Carlton.</p>
          <h1 className="ask">How are you <em>doing</em> today, Margaret?</h1>
          <p className="ask-sub">I’m just checking in like I do most days — no need to say much.</p>
        </div>

        <div className="feel-list">
          {[
            { k: 'ok',     label: 'All good, thanks',   cls: 'ok' },
            { k: 'quiet',  label: 'Just quiet, really', cls: 'quiet' },
            { k: 'lonely', label: 'A bit lonely today', cls: 'lonely' },
            { k: 'hard',   label: 'Having a hard day',  cls: 'hard' },
          ].map((f) => (
            <button key={f.k} className="feel-btn" onClick={() => onMood(f.k)}>
              <span className={`swatch ${f.cls}`}></span>
              {f.label}
              <span className="arr"><Icon.arrow/></span>
            </button>
          ))}
        </div>

        <div className="voice-hint-row">— or just say a few words —</div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <button className="mic-btn" aria-label="Speak" onClick={onVoice}>
            <Icon.mic size={36}/>
          </button>
        </div>
        <div className="streak"><Icon.heart/> &nbsp; checked in <em>24 days</em> running</div>
      </div>
    </div>
  );
}

// ─── SCREEN: acknowledgement (companion replies briefly) ────────────────
const ACK_COPY = {
  ok:        { lead: 'Lovely to hear, Margaret.',                          tail: 'Here are a few small things going on nearby today.' },
  quiet:     { lead: 'A quiet day is a perfectly fair kind of day.',       tail: 'Let me find a few gentle things you might like.' },
  lonely:    { lead: 'Thank you for telling me.',                          tail: 'Let me see who’s about today.' },
  'low':     { lead: 'Glad you told me — that’s a brave thing to say.',    tail: 'Let me find a few things, including someone you can just speak to.' },
};
function ScreenAcknowledge({ mood }) {
  const c = ACK_COPY[mood] || ACK_COPY.lonely;
  return (
    <div className="resident">
      <ResidentTop/>
      <div className="ack-stage">
        <div className="ack-thinking" aria-hidden="true">
          <span/><span/><span/>
        </div>
        <div className="ack-lead">{c.lead}</div>
        <div className="ack-tail">{c.tail}</div>
      </div>
    </div>
  );
}

// ─── SCREEN: deeper follow-up (after "hard day") ────────────────────────
function ScreenDeeper({ onChoice, onBack }) {
  return (
    <div className="resident">
      <ResidentTop onBack={onBack}/>

      <div className="scroll">
        <div className="bubble assistant" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', lineHeight: 1.35 }}>
          Oh, Margaret. Would you tell me a little more about today? No wrong words.
        </div>

        <div className="feel-list" style={{ padding: '14px 0 0' }}>
          <button className="feel-btn" onClick={() => onChoice('low')}>
            <span className="swatch quiet"></span>
            Just a bit low and tired
            <span className="arr"><Icon.arrow/></span>
          </button>
          <button className="feel-btn" onClick={() => onChoice('heavy')}>
            <span className="swatch lonely"></span>
            Heavier — I haven’t really wanted to get up
            <span className="arr"><Icon.arrow/></span>
          </button>
          <button className="feel-btn" onClick={() => onChoice('heavy')}>
            <span className="swatch hard"></span>
            I don’t really see the point most mornings
            <span className="arr"><Icon.arrow/></span>
          </button>
        </div>

        <div className="voice-hint-row">— or just say it your own way —</div>
      </div>

      <div className="voicebar">
        <button className="mic-btn" aria-label="Speak">
          <Icon.mic size={36}/>
        </button>
      </div>
    </div>
  );
}

// Transforms a backend recommendation payload into the shape the existing
// ScreenRecs/ScreenDetail components expect (which originally came from
// data.js SERVICES). Keeps the visual rendering identical regardless of
// whether the data is live or fallback.
function transformBackendRec(r) {
  const s = r.service || {};
  const d = Number(s.distance_km) || 0;
  const distance = d === 0
    ? 'At home'
    : d < 1 ? `${Math.round(d * 1000)}m`
            : `${d.toFixed(1)}km`;
  const tagClassMap = { social: 'sage', food: 'clay', wellbeing: 'gold', transport: 'gold', health: 'sage', financial: 'gold', safety: 'rose', general: 'gold' };
  const tagLabelMap = { social: 'Social', food: 'Food', wellbeing: 'Wellbeing', transport: 'Transport', health: 'Health', financial: 'Financial', safety: 'Safety', general: 'General' };
  return {
    id: s.id,
    title: s.name,
    tag: tagLabelMap[s.category] || 'Support',
    tagClass: tagClassMap[s.category] || 'gold',
    where: s.address || '',
    distance,
    cost: s.cost || '—',
    next: s.next_session || '',
    accessible: s.accessibility ? s.accessibility.replace(/_/g, ' ').replace(/,/g, ' · ') : '—',
    why: r.reason || s.description || '',
  };
}

// ─── SCREEN: recommendations ────────────────────────────────────────────
const REC_LEAD = {
  ok:     'Here are a few small things going on nearby today.',
  quiet:  'A few gentle options — none of them noisy.',
  lonely: 'Three nearby things that match. The first is starting soon.',
  low:    'Here are a few things. The third one is just a phone visit if you’d like.',
};
function ScreenRecs({ mood, onPick, onBack, recsData }) {
  const items = (recsData && Array.isArray(recsData.recommendations) && recsData.recommendations.length > 0)
    ? recsData.recommendations.map(transformBackendRec)
    : SERVICES;
  const live = !!(recsData && recsData.recommendations && recsData.recommendations.length > 0);

  return (
    <div className="resident">
      <ResidentTop onBack={onBack}/>
      <div className="scroll">
        <div className="bubble assistant" style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', lineHeight: 1.4 }}>
          {REC_LEAD[mood] || REC_LEAD.lonely}
          {live && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--ink-3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>· live · {recsData.need_type}</span>}
        </div>

        <div className="recs">
          {items.map((s) => (
            <button key={s.id} className="rec" onClick={() => onPick(s)} style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }}>
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
                <span className="why-label">Why this —</span>{s.why}
              </p>
            </button>
          ))}
        </div>

        <div className="quicks">
          <button className="chip">Something quieter</button>
          <button className="chip" onClick={onBack}>Maybe tomorrow</button>
        </div>
      </div>

      <div className="voicebar">
        <button className="mic-btn" aria-label="Speak">
          <Icon.mic size={36}/>
        </button>
        <div className="mic-hint">Tap a card to hear more — or <em>say “read it to me”</em></div>
      </div>
    </div>
  );
}

// ─── SCREEN: recommendation detail ──────────────────────────────────────
function ScreenDetail({ rec, onSave, onBack }) {
  const s = rec || SERVICES[0];
  return (
    <div className="resident">
      <ResidentTop onBack={onBack}/>
      <div className="detail">
        <div className="hero">[ COMMUNITY · LIBRARY · PHOTO PLACEHOLDER ]</div>
        <div className="pad">
          <span className={`rec-tag ${s.tagClass}`} style={{ marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
            {s.tag}
          </span>
          <h1>{s.title}</h1>
          <p className="where">
            <span style={{ display: 'inline-flex', verticalAlign: '-2px', marginRight: 4 }}><Icon.pin/></span>
            {s.where}
          </p>
          <div className="facts">
            <div><div className="label">When</div>          <div className="val">{s.next}</div></div>
            <div><div className="label">Getting there</div> <div className="val">{s.distance} walk · tram nearby</div></div>
            <div><div className="label">Cost</div>          <div className="val">{s.cost}</div></div>
            <div><div className="label">Access</div>        <div className="val">{s.accessible}</div></div>
          </div>
          <div className="why-box">
            <span className="why-label">Why we suggested this</span>
            {s.why}
          </div>
          <div className="actions">
            <button className="btn-primary" onClick={onSave}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 7"/></svg>
              Yes, save and remind me at noon
            </button>
            <button className="btn-secondary"><Icon.phone size={16}/> Call to book a seat</button>
            <button className="btn-secondary" onClick={onBack}><Icon.bell/> Show me the others first</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: saved confirmation ─────────────────────────────────────────
function ScreenSaved({ rec, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const s = rec || SERVICES[0];
  return (
    <div className="resident">
      <ResidentTop/>
      <div className="saved-stage">
        <div className="saved-tick"><Icon.check/></div>
        <div className="saved-title">Saved.</div>
        <div className="saved-sub">
          I’ll give you a gentle nudge at <strong>12:00</strong> for <em>{s.title}</em>.
        </div>
        <button className="btn-secondary" onClick={onDone} style={{ marginTop: 18 }}>Back to the start</button>
        <div className="saved-foot">Returning home in a moment…</div>
      </div>
    </div>
  );
}

// ─── SCREEN: distress-aware support routing ─────────────────────────────
function ScreenSupport({ onPick, onStay, onBack }) {
  return (
    <div className="resident supportive">
      <ResidentTop onBack={onBack}/>
      <div className="scroll">
        <div className="care-bubble user">
          I don’t really see the point of getting up some mornings, love.
        </div>
        <div className="bubble-meta right">You · a moment ago</div>

        <div className="care-bubble kind">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', lineHeight: 1.4, marginBottom: 8 }}>
            <em>Margaret</em> — what you just shared sounds really heavy. I’m glad you told me.
          </div>
          <div style={{ color: 'var(--ink-2)' }}>
            Would it help to speak with someone trained to listen? They’re free, kind, and they won’t rush you.
          </div>
        </div>

        <div style={{ marginTop: 6 }}>
          {SPECIALISTS.slice(0, 3).map((sp) => (
            <button key={sp.id} className="specialist" onClick={() => onPick(sp)} style={{ font: 'inherit', textAlign: 'left', color: 'inherit', width: '100%' }}>
              <div className="row">
                <div className="name">{sp.name}</div>
                <div className="phone">{sp.phone}</div>
              </div>
              <div className="desc">{sp.desc}</div>
              <div className="cta"><Icon.phone size={16}/> Call now — I’ll stay on the line</div>
            </button>
          ))}
        </div>

        <div className="gentle-row">
          <button className="opt" onClick={onStay}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--sage)' }}></span>
            Just stay with me a little while
          </button>
          <button className="opt" onClick={() => onPick({ id: 'sarah', name: 'Sarah (your daughter)', phone: 'Saved contact', desc: 'She said yes to receiving these calls last month.' })}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--gold)' }}></span>
            Could you ring Sarah (your daughter)?
          </button>
        </div>

        <div className="emergency-note">
          <strong>I’m not an emergency service.</strong> If you, or someone with you, is in immediate danger, please dial <strong>000</strong>.
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: simulated call ─────────────────────────────────────────────
function ScreenCalling({ spec, onEnd, onStay }) {
  const [phase, setPhase] = React.useState('ringing'); // ringing → connected
  React.useEffect(() => {
    const t = setTimeout(() => setPhase('connected'), 2600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="resident calling">
      <div className="call-stage">
        <div className={`call-pulse ${phase}`}>
          <Icon.phone size={42}/>
        </div>
        <div className="call-name">{spec?.name || 'Lifeline'}</div>
        <div className="call-phone">{spec?.phone || '13 11 14'}</div>
        <div className="call-status">
          {phase === 'ringing' ? 'Connecting you now…' : 'Connected. They have you, Margaret.'}
        </div>
        {phase === 'connected' && (
          <div className="call-timer" aria-live="polite"><CallTimer/></div>
        )}

        <div className="call-actions">
          <button className="call-end" onClick={onEnd}>
            <Icon.phoneOff/>
            {phase === 'ringing' ? 'Cancel call' : 'End call'}
          </button>
          {phase === 'connected' && (
            <button className="call-stay" onClick={onStay}>I’d rather just sit quietly</button>
          )}
        </div>

        <div className="call-foot">I’m here with you. You don’t have to do this alone.</div>
      </div>
    </div>
  );
}

function CallTimer() {
  const [s, setS] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return <span>{mm}:{ss}</span>;
}

// ─── SCREEN: voice listening ────────────────────────────────────────────
const TRANSCRIPT_FULL = "I think I’d like a quiet cup of tea with someone this afternoon";
function ScreenListening({ onDone }) {
  const [chars, setChars] = React.useState(0);
  React.useEffect(() => {
    if (chars >= TRANSCRIPT_FULL.length) {
      const end = setTimeout(onDone, 900);
      return () => clearTimeout(end);
    }
    const step = setTimeout(() => setChars((n) => Math.min(n + 2, TRANSCRIPT_FULL.length)), 60);
    return () => clearTimeout(step);
  }, [chars, onDone]);

  const text = TRANSCRIPT_FULL.slice(0, chars);
  return (
    <div className="resident listening">
      <ResidentTop right={<div style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>Listening · Carlton</div>}/>
      <div className="listen-stage">
        <div className="waveform" aria-hidden="true">
          {Array.from({ length: 13 }).map((_, i) => <div key={i} className="bar"/>)}
        </div>
        <div className="listen-label">I’m listening, take your time…</div>
        <div className="live-transcript">
          {text}<span className="caret">|</span>
        </div>
        <button className="stop-btn" onClick={onDone}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--clay)' }}></span>
          Tap when you’re done
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: breathing / stay with me ───────────────────────────────────
function ScreenBreathing({ onDone }) {
  return (
    <div className="resident breathing">
      <ResidentTop onBack={onDone}/>
      <div className="breath-stage">
        <div className="breath-circle"><span>breathe</span></div>
        <div className="breath-label">In through your nose…<br/>… and out through your mouth.</div>
        <div className="breath-sub">I’m sitting with you. No rush — take as long as you need.</div>
        <button className="btn-secondary" style={{ marginTop: 24 }} onClick={onDone}>I’m a bit steadier now</button>
      </div>
    </div>
  );
}

// Mood-button label → conversational free-text the backend classifier
// can keyword-match against. The buttons themselves don't carry text the
// resident typed; this mapping reconstructs a sensible utterance so the
// API receives meaningful input.
const MOOD_TO_TEXT = {
  ok:     'Curious what activities are happening nearby today.',
  quiet:  "I'd like a quiet activity nearby this afternoon.",
  lonely: "I'm feeling a bit lonely and want something nearby.",
  low:    "Things have been feeling low; I'd like something gentle nearby.",
};

// ─── MAIN — state machine wiring it all together ────────────────────────
function ResidentApp() {
  const [screen, setScreen] = React.useState('checkin');
  const [mood, setMood] = React.useState(null);
  const [selectedRec, setSelectedRec] = React.useState(null);
  const [selectedSpec, setSelectedSpec] = React.useState(null);
  // recsData holds the most recent /api/checkins response, or null if the
  // backend is unreachable / no check-in has been submitted yet.
  const [recsData, setRecsData] = React.useState(null);
  // Track an ack-screen timeout so we can clear it if the user navigates away
  const ackTimer = React.useRef(null);
  React.useEffect(() => () => clearTimeout(ackTimer.current), []);

  function submitToBackend(moodKey, freeTextOverride, inputChannel) {
    if (!window.NPApi) return;
    const free_text = freeTextOverride || MOOD_TO_TEXT[moodKey] || "I'd like to see what's around.";
    setRecsData(null);
    window.NPApi
      .submitCheckin({
        suburb: 'Carlton',
        age_band: '65+',
        mood: moodKey,
        free_text,
        input_channel: inputChannel || 'text',
      })
      .then(setRecsData)
      .catch((err) => {
        console.warn('[NP] check-in API unavailable, using fallback:', err.message);
        setRecsData(null);
      });
  }

  const routeViaAck = (nextMood, after = 'recs') => {
    setMood(nextMood);
    setScreen('acknowledge');
    submitToBackend(nextMood);
    clearTimeout(ackTimer.current);
    ackTimer.current = setTimeout(() => setScreen(after), 1600);
  };

  const onMood = (m) => {
    if (m === 'hard') { setMood(m); setScreen('deeper'); }
    else routeViaAck(m, 'recs');
  };
  const onDeeper = (kind) => {
    if (kind === 'low') routeViaAck('low', 'recs');
    else setScreen('support');
  };

  return (
    <div className="resident-stage">
      <div className="resident-frame">
        <div className="screen-fade" key={screen}>
          {screen === 'checkin'     && <ScreenCheckin     onMood={onMood} onVoice={() => setScreen('listening')}/>}
          {screen === 'acknowledge' && <ScreenAcknowledge mood={mood}/>}
          {screen === 'deeper'      && <ScreenDeeper      onChoice={onDeeper} onBack={() => setScreen('checkin')}/>}
          {screen === 'recs'        && <ScreenRecs        mood={mood} recsData={recsData} onPick={(r) => { setSelectedRec(r); setScreen('detail'); }} onBack={() => setScreen('checkin')}/>}
          {screen === 'detail'      && <ScreenDetail      rec={selectedRec} onSave={() => setScreen('saved')} onBack={() => setScreen('recs')}/>}
          {screen === 'saved'       && <ScreenSaved       rec={selectedRec} onDone={() => setScreen('checkin')}/>}
          {screen === 'support'     && <ScreenSupport     onPick={(s) => { setSelectedSpec(s); setScreen('calling'); }} onStay={() => setScreen('breathing')} onBack={() => setScreen('checkin')}/>}
          {screen === 'calling'     && <ScreenCalling     spec={selectedSpec} onEnd={() => setScreen('support')} onStay={() => setScreen('breathing')}/>}
          {screen === 'listening'   && <ScreenListening   onDone={() => {
            setMood('lonely');
            submitToBackend('lonely', TRANSCRIPT_FULL, 'voice');
            setScreen('recs');
          }}/>}
          {screen === 'breathing'   && <ScreenBreathing   onDone={() => setScreen('checkin')}/>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ResidentApp });
