// Resident-facing companion — stateful interactive prototype.
// Owns a small state machine that connects every screen:
//   checkin → (mood) → acknowledge → recs → detail → saved → checkin
//                                ↘
//                            deeper → support → calling → support
//                                              ↘ breathing → checkin
//             listening (voice) → recs
//             quiet mood → hostOffer → hostCraft → hostWhen → hosted → checkin
//
// Each screen is a sub-component that takes callbacks. ResidentApp wires them.
//
// Backend wiring: on every mood selection (and on voice-transcript completion)
// ResidentApp POSTs to /api/checkins via window.NPApi.submitCheckin, persists
// the returned recommendations to local state, and ScreenRecs renders those
// in place of the hardcoded SERVICES from data.js. Falls back to data.js
// SERVICES if the API is unreachable (so the prototype still works offline).
// The host flow is purely client-side — no backend persistence yet.

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
// Real STT path: getUserMedia → MediaRecorder → POST /api/transcribe →
// ElevenLabs scribe_v1 (server-side). The canned phrase is kept only as a
// last-resort fallback when the mic, the network, or the API key is missing
// so the prototype still tells a story offline.
const FALLBACK_TRANSCRIPT = "I think I’d like a quiet cup of tea with someone this afternoon";

// Pick a MIME type the current browser actually supports. webm/opus is the
// broadest; mp4/aac is the Safari fallback.
function pickRecorderMime() {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

function ScreenListening({ onDone }) {
  // phase: 'starting' | 'recording' | 'transcribing' | 'error'
  const [phase, setPhase] = React.useState('starting');
  const [transcript, setTranscript] = React.useState('');
  const [error, setError] = React.useState(null);
  const recorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const streamRef = React.useRef(null);
  const mimeRef = React.useRef('');
  const cancelledRef = React.useRef(false);

  React.useEffect(() => {
    cancelledRef.current = false;

    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
        setError('Your browser does not support microphone recording.');
        setPhase('error');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelledRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const mime = pickRecorderMime();
        mimeRef.current = mime || 'audio/webm';
        const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        recorderRef.current = rec;
        chunksRef.current = [];
        rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
        rec.onstop = handleStop;
        rec.start();
        setPhase('recording');
      } catch (e) {
        console.warn('[NP voice] mic permission/start failed:', e);
        setError(e && e.name === 'NotAllowedError'
          ? 'Microphone access was blocked. You can still type, or try again.'
          : 'Could not start the microphone.');
        setPhase('error');
      }
    }
    start();

    return () => {
      cancelledRef.current = true;
      try {
        if (recorderRef.current && recorderRef.current.state === 'recording') {
          recorderRef.current.onstop = null;
          recorderRef.current.stop();
        }
      } catch {}
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStop() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const blob = new Blob(chunksRef.current, { type: mimeRef.current || 'audio/webm' });
    chunksRef.current = [];

    if (blob.size < 1000) {
      // <~1KB of audio = silence or aborted tap. Don't bill the API; fall
      // back so the flow still demonstrates end-to-end.
      onDone(FALLBACK_TRANSCRIPT, { source: 'fallback', reason: 'too_short' });
      return;
    }

    setPhase('transcribing');
    try {
      if (!window.NPApi || !window.NPApi.transcribeAudio) throw new Error('NPApi.transcribeAudio missing');
      const ext = mimeRef.current.includes('mp4') ? 'm4a'
                : mimeRef.current.includes('ogg') ? 'ogg'
                :                                   'webm';
      const result = await window.NPApi.transcribeAudio(blob, `checkin.${ext}`);
      const text = (result && result.text) ? result.text : '';
      if (!text) {
        onDone(FALLBACK_TRANSCRIPT, { source: 'fallback', reason: 'empty_transcript' });
        return;
      }
      setTranscript(text);
      // Brief pause so the resident sees what was heard before transitioning.
      setTimeout(() => onDone(text, { source: 'elevenlabs', model: result.model, duration_sec: result.duration_sec }), 700);
    } catch (e) {
      console.warn('[NP voice] transcription failed:', e);
      if (e && e.code === 'no_api_key') {
        onDone(FALLBACK_TRANSCRIPT, { source: 'fallback', reason: 'no_api_key' });
      } else {
        setError('I could not catch that. Using a quick fallback for now.');
        setPhase('error');
        setTimeout(() => onDone(FALLBACK_TRANSCRIPT, { source: 'fallback', reason: 'api_error' }), 900);
      }
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop(); // triggers handleStop()
    }
  }

  const label = phase === 'starting'     ? 'Getting the microphone ready…'
              : phase === 'recording'    ? 'I’m listening, take your time…'
              : phase === 'transcribing' ? 'Just a moment — writing that down…'
              :                            (error || 'Something went wrong.');

  const ctaText = phase === 'transcribing' ? 'Transcribing…'
                : phase === 'error'        ? 'Skip and continue'
                :                            'Tap when you’re done';

  const ctaDisabled = phase === 'starting' || phase === 'transcribing';

  function onCta() {
    if (phase === 'recording') stopRecording();
    else if (phase === 'error') onDone(FALLBACK_TRANSCRIPT, { source: 'fallback', reason: 'user_skip' });
  }

  return (
    <div className="resident listening">
      <ResidentTop right={<div style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>
        {phase === 'recording' ? 'Listening · Carlton' : phase === 'transcribing' ? 'Transcribing…' : 'Voice · Carlton'}
      </div>}/>
      <div className="listen-stage">
        <div className={`waveform ${phase}`} aria-hidden="true">
          {Array.from({ length: 13 }).map((_, i) => <div key={i} className="bar"/>)}
        </div>
        <div className="listen-label">{label}</div>
        <div className="live-transcript">
          {transcript || (phase === 'recording' ? ' ' : '')}
          {phase === 'recording' && <span className="caret">|</span>}
        </div>
        <button className="stop-btn" onClick={onCta} disabled={ctaDisabled} style={ctaDisabled ? { opacity: 0.55, cursor: 'default' } : null}>
          <span style={{
            width: 10, height: 10, borderRadius: phase === 'recording' ? 2 : '50%',
            background: phase === 'error' ? 'var(--gold)' : 'var(--clay)',
          }}></span>
          {ctaText}
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

// ─── SCREEN: host-offer (resident as protagonist) ───────────────────────
function ScreenHostOffer({ onYes, onLater, onBack }) {
  return (
    <div className="resident host-stage">
      <ResidentTop onBack={onBack}/>
      <div className="scroll" style={{ paddingBottom: 24 }}>
        <div className="host-intro">
          <div className="host-recall">
            <span className="heart"><Icon.heart/></span>
            Last month, 4 neighbours came to your tea &amp; chat
          </div>
          <h1>A quiet day’s a fair kind of <em>day</em>, Margaret.</h1>
          <p>
            Lately three of your neighbours have offered to share what they know — Joan’s sourdough, Vinh’s gentle walks, an Italian afternoon. Is there something you’d quietly love to share?
          </p>
        </div>
        <div className="host-actions">
          <button className="primary" onClick={onYes}>
            Yes, I have an idea <Icon.arrow/>
          </button>
          <button className="secondary" onClick={onLater}>
            Maybe just show me what’s about
          </button>
        </div>

        <div style={{ padding: '6px 24px 0', fontSize: '0.78rem', color: 'var(--ink-4)', textAlign: 'center', lineHeight: 1.5 }}>
          Hosting is just an offer — neighbours can ask to come along, and you say yes or no. No fuss, no charge.
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: host-craft (pick what to share) ────────────────────────────
function ScreenHostCraft({ topic, onPick, onContinue, onBack }) {
  return (
    <div className="resident host-stage">
      <ResidentTop onBack={onBack}/>
      <div className="scroll" style={{ paddingBottom: 24 }}>
        <div className="host-intro">
          <h1>What might you <em>share</em>?</h1>
          <p>No big production — just something small and warm.</p>
        </div>
        <div className="host-grid">
          {HOST_TOPICS.map((tp) => (
            <button
              key={tp.id}
              className={`host-card ${topic === tp.id ? 'selected' : ''}`}
              onClick={() => onPick(tp.id)}
            >
              <span className="swatch" style={{ background: tp.swatch }}></span>
              <span className="label">{tp.label}</span>
              <span className="eg">e.g. {tp.eg}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="host-cta">
        <button className="post-btn" disabled={!topic} onClick={onContinue}>
          Continue <Icon.arrow/>
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: host-when (when / where / how many) ────────────────────────
function ScreenHostWhen({ topic, when, venue, size, onWhen, onVenue, onSize, onContinue, onBack }) {
  return (
    <div className="resident host-stage">
      <ResidentTop onBack={onBack}/>
      <div className="scroll" style={{ paddingBottom: 24 }}>
        <div className="host-intro">
          <h1>When and <em>where</em>?</h1>
          <p>Pick something easy. You can always change later.</p>
        </div>

        <div className="host-section">
          <h4>When</h4>
          <div className="host-options">
            {HOST_TIMES.map((t) => (
              <button key={t.id} className={`opt ${when === t.id ? 'selected' : ''}`} onClick={() => onWhen(t.id)}>
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
              <button key={v.id} className={`opt ${venue === v.id ? 'selected' : ''}`} onClick={() => onVenue(v.id)}>
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
              <button key={s.id} className={`opt ${size === s.id ? 'selected' : ''}`} onClick={() => onSize(s.id)}>
                <span>{s.label}</span>
                <span className="detail">{s.detail}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="host-cta">
        <button className="post-btn" disabled={!(when && venue && size)} onClick={onContinue}>
          Post to neighbourhood <Icon.arrow/>
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: hosted confirmation ────────────────────────────────────────
function ScreenHosted({ topic, when, venue, size, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 6000);
    return () => clearTimeout(t);
  }, [onDone]);
  const tp = HOST_TOPICS.find((x) => x.id === topic) || HOST_TOPICS[0];
  const w  = HOST_TIMES.find((x) => x.id === when)   || HOST_TIMES[0];
  const v  = HOST_VENUES.find((x) => x.id === venue) || HOST_VENUES[0];
  const sz = HOST_SIZES.find((x) => x.id === size)   || HOST_SIZES[0];
  // For sourdough running example, prettify the title; otherwise generic.
  const title = topic === 'bake'
    ? "Margaret’s Sourdough — a quiet morning"
    : `Margaret’s ${tp.label.toLowerCase()}`;
  return (
    <div className="resident">
      <ResidentTop/>
      <div className="hosted-stage">
        <div className="hosted-tick">
          <svg viewBox="0 0 24 24" width={36} height={36} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5 5L20 7"/></svg>
        </div>
        <div className="hosted-title">Your offer is live.</div>
        <div className="hosted-sub">
          I’ll let you know quietly when a neighbour signs up — no pressure, no buzzing.
        </div>

        <div className="host-preview">
          <span className="pv-tag">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
            Hosted by a neighbour · {tp.label.toLowerCase()}
          </span>
          <h3 className="pv-title">{title}</h3>
          <div className="pv-meta">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.clock/>{w.label} · {w.detail.split('·')[1]?.trim()}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.pin/>{v.label}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="8" r="3"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="6" r="2.4"/><path d="M22 18c0-2.5-2-4-4.5-4"/>
              </svg>
              {sz.label}
            </span>
          </div>
          <p className="pv-why">
            <span className="label">Margaret says —</span>
            A quiet morning. We’ll knead, drink tea, and share what we know. Beginners very welcome.
          </p>
        </div>

        <div className="hosted-foot">
          You’ve added something warm to Carlton today, Margaret.
        </div>
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
  // Host-flow state
  const [hostTopic, setHostTopic] = React.useState(null);
  const [hostWhen, setHostWhen]   = React.useState(null);
  const [hostVenue, setHostVenue] = React.useState(null);
  const [hostSize, setHostSize]   = React.useState(null);
  const resetHost = () => { setHostTopic(null); setHostWhen(null); setHostVenue(null); setHostSize(null); };

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
      .then((data) => {
        setRecsData(data);
        // Close the voice loop: speak the agent's warm reply aloud via
        // browser TTS. The reply is generated by backend/agent.js when
        // ANTHROPIC_API_KEY is set, or templated per need-type when the
        // regex classifier fallback path is used. Browsers without
        // speechSynthesis (rare) just skip silently.
        if (data && data.warm_reply && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(data.warm_reply);
            utterance.lang = 'en-AU';
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            window.speechSynthesis.speak(utterance);
          } catch (e) {
            console.warn('[NP] speechSynthesis failed:', e && e.message);
          }
        }
        // If the agent flagged high-urgency distress, jump straight to the
        // ScreenSupport flow (Lifeline / Beyond Blue specialist routing)
        // instead of showing regular recommendations.
        if (data && data.distress && data.distress.is_distressed) {
          setScreen('support');
        }
      })
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
    if (m === 'hard')      { setMood(m); setScreen('deeper'); }
    else if (m === 'quiet') routeViaAck(m, 'hostOffer');
    else                   routeViaAck(m, 'recs');
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
          {screen === 'listening'   && <ScreenListening   onDone={(transcript, meta) => {
            // transcript is the live ElevenLabs result (or the canned
            // fallback when mic/API is unavailable — meta.source tells us).
            console.log('[NP voice] transcript:', transcript, meta);
            setMood('lonely');
            submitToBackend('lonely', transcript || FALLBACK_TRANSCRIPT, 'voice');
            setScreen('recs');
          }}/>}
          {screen === 'breathing'   && <ScreenBreathing   onDone={() => setScreen('checkin')}/>}

          {/* Host flow */}
          {screen === 'hostOffer' && (
            <ScreenHostOffer
              onYes={() => { setHostTopic('bake'); setScreen('hostCraft'); }}
              onLater={() => setScreen('recs')}
              onBack={() => setScreen('checkin')}
            />
          )}
          {screen === 'hostCraft' && (
            <ScreenHostCraft
              topic={hostTopic}
              onPick={setHostTopic}
              onContinue={() => setScreen('hostWhen')}
              onBack={() => setScreen('hostOffer')}
            />
          )}
          {screen === 'hostWhen' && (
            <ScreenHostWhen
              topic={hostTopic} when={hostWhen} venue={hostVenue} size={hostSize}
              onWhen={setHostWhen} onVenue={setHostVenue} onSize={setHostSize}
              onContinue={() => setScreen('hosted')}
              onBack={() => setScreen('hostCraft')}
            />
          )}
          {screen === 'hosted' && (
            <ScreenHosted
              topic={hostTopic} when={hostWhen} venue={hostVenue} size={hostSize}
              onDone={() => { resetHost(); setScreen('checkin'); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ResidentApp });
