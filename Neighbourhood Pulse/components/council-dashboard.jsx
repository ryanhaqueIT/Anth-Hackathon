// Council / provider insight dashboard. Two artboards live here:
//   <CouncilHero>   — map-led heatmap with side panel (1280×800)
//   <CouncilDetail> — suburb drill-in / service & demographic breakdown

// ─── Tiny icon set scoped to dashboard ──────────────────────────────────
const CIcon = {
  caret: () => (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2.5 4.5L6 8l3.5-3.5"/>
    </svg>
  ),
  export: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M7 8l5-5 5 5M5 21h14"/>
    </svg>
  ),
  filter: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18l-7 9v6l-4-2v-4z"/>
    </svg>
  ),
  arrow: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  ),
  trend: (up) => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={up ? 'M5 17L12 10l4 4 5-5M16 9h5v5' : 'M5 7L12 14l4-4 5 5M16 15h5v-5'}/>
    </svg>
  ),
};

// ─── InfoTip — small (i) glyph with hover-revealed definition ──────────
// Portals the popover to <body> so scroll-clipped containers (the panel) and
// the artboard's overflow:hidden don't cut it off. Clamps to viewport edges.
function InfoTip({ children }) {
  const ref = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);

  const place = React.useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const W = 280, M = 12;
    const minCx = W / 2 + M;
    const maxCx = window.innerWidth - W / 2 - M;
    const rawCx = r.left + r.width / 2;
    const cx = Math.max(minCx, Math.min(maxCx, rawCx));
    setPos({ cx, top: r.top, arrow: rawCx - cx });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    place();
    const on = () => place();
    window.addEventListener('scroll', on, true);
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on, true);
      window.removeEventListener('resize', on);
    };
  }, [open, place]);

  return (
    <>
      <span
        ref={ref}
        className="infotip"
        tabIndex={0}
        aria-label="What is this?"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >i</span>
      {open && pos && ReactDOM.createPortal(
        <div className="infotip-pop" style={{ left: pos.cx, top: pos.top, '--arrow': `${pos.arrow}px` }}>
          <div className="infotip-pop-inner">{children}</div>
        </div>,
        document.body,
      )}
    </>
  );
}

// Canonical Support Gap definition — used in every (i) instance.
function SupportGapTip() {
  return (
    <InfoTip>
      <strong>Support Gap</strong> — how much help older residents are asking for in an area, minus how much free help they can actually reach. 0 = covered, 100 = pronounced gap.
      <span className="formula">
        <span className="term">Need raised</span> − <span className="term">Support reachable</span> = <span className="out">Support Gap</span>
      </span>
    </InfoTip>
  );
}

// ─── Heatmap SVG (stylised polygon suburbs over a basemap) ─────────────
function HeatMap({ selected, onSelect }) {
  const visible = SUBURBS.filter((s) => !s.hidden);

  // City street grid — slightly rotated to evoke the Hoddle Grid, with a
  // handful of named arterials labelled. Generated rather than hand-listed
  // so the lines stay even.
  const grid = [];
  for (let x = 20; x < 400; x += 22) grid.push({ x1: x, y1: 0, x2: x - 22, y2: 400, minor: x % 88 !== 0 });
  for (let y = 20; y < 400; y += 22) grid.push({ x1: 0, y1: y, x2: 400, y2: y + 8, minor: y % 88 !== 0 });

  return (
    <svg className="map-svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="land" patternUnits="userSpaceOnUse" width="8" height="8">
          <rect width="8" height="8" fill="oklch(0.96 0.012 75)"/>
          <circle cx="4" cy="4" r="0.4" fill="oklch(0.90 0.014 75)"/>
        </pattern>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.3"/>
        </filter>
        <clipPath id="frame">
          <rect x="0" y="0" width="400" height="400"/>
        </clipPath>
      </defs>

      {/* ─── Basemap ────────────────────────────────────────── */}
      <g clipPath="url(#frame)">
        {/* land texture */}
        <rect width="400" height="400" fill="url(#land)"/>

        {/* parks — sage rounded rectangles, approximating real inner-Melbourne open space */}
        <g fill="oklch(0.90 0.04 150)" stroke="oklch(0.82 0.045 150)" strokeWidth="0.6">
          {/* Princes Park (north Carlton / Parkville) */}
          <rect x="34" y="40" width="62" height="70" rx="3"/>
          {/* Carlton Gardens (between Carlton & Fitzroy) */}
          <rect x="148" y="160" width="32" height="40" rx="2"/>
          {/* Fitzroy / Treasury Gardens cluster */}
          <rect x="206" y="220" width="44" height="36" rx="2"/>
          {/* Yarra Park (Richmond) */}
          <polygon points="300,260 360,250 366,300 314,308" />
          {/* Royal Botanic Gardens (south-east) */}
          <ellipse cx="290" cy="358" rx="34" ry="20"/>
          {/* Royal Park (north-west) */}
          <rect x="10" y="92" width="28" height="58" rx="2"/>
        </g>

        {/* street grid */}
        <g stroke="oklch(0.86 0.014 75)" strokeWidth="0.55" opacity="0.85">
          {grid.filter((l) => l.minor).map((l, i) => (
            <line key={'mn'+i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}/>
          ))}
        </g>
        {/* arterials — slightly bolder */}
        <g stroke="oklch(0.78 0.014 75)" strokeWidth="1.2">
          {grid.filter((l) => !l.minor).map((l, i) => (
            <line key={'mj'+i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}/>
          ))}
          {/* Royal Parade / Sydney Road — strong diagonal */}
          <line x1="70" y1="0" x2="40" y2="400" strokeWidth="1.8"/>
          {/* Lygon Street */}
          <line x1="135" y1="0" x2="105" y2="400" strokeWidth="1.5"/>
          {/* Brunswick / Smith */}
          <line x1="240" y1="0" x2="210" y2="400" strokeWidth="1.5"/>
        </g>

        {/* Yarra River — blue ribbon along the south-east */}
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

        {/* tram routes — dashed warm line */}
        <g stroke="oklch(0.70 0.10 35)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.55" fill="none">
          <line x1="70" y1="0" x2="40" y2="400"/>
          <line x1="135" y1="0" x2="105" y2="400"/>
          <path d="M 0 175 L 400 175"/>
        </g>

        {/* street + landmark labels */}
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

      {/* ─── Suburb polygons (heatmap) ─────────────────────── */}
      <g clipPath="url(#frame)">
        {visible.map((s) => {
          const isSel = s.id === selected;
          return (
            <g key={s.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(s.id)}>
              <polygon
                points={s.poly}
                fill={gapColor(s.gap)}
                fillOpacity={isSel ? 0.78 : 0.58}
                stroke={isSel ? 'var(--ink)' : 'white'}
                strokeWidth={isSel ? 2.2 : 1.2}
                strokeLinejoin="round"
                filter="url(#soft)"
              />
            </g>
          );
        })}
      </g>

      {/* ─── Suburb labels (above polygons) ─────────────────── */}
      {visible.map((s) => (
        <g key={s.id + '-lbl'} pointerEvents="none">
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

      {/* Compass + scale */}
      <g transform="translate(364, 30)" fontFamily="var(--font-mono)" fontSize="9" fill="oklch(0.45 0.012 55)">
        <circle cx="0" cy="10" r="13" fill="oklch(0.99 0.008 75)" fillOpacity="0.9" stroke="oklch(0.86 0.014 75)" strokeWidth="0.6"/>
        <text x="0" y="3" textAnchor="middle">N</text>
        <path d="M-3 9L0 5L3 9Z" fill="currentColor"/>
        <line x1="0" y1="9" x2="0" y2="18" stroke="currentColor" strokeWidth="1"/>
      </g>
      <g transform="translate(20, 380)" fontFamily="var(--font-mono)" fontSize="8" fill="oklch(0.45 0.012 55)">
        <rect x="-4" y="-12" width="62" height="22" rx="3" fill="oklch(0.99 0.008 75)" fillOpacity="0.9" stroke="oklch(0.86 0.014 75)" strokeWidth="0.6"/>
        <line x1="0" y1="-4" x2="40" y2="-4" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="0" y1="-7" x2="0" y2="-1" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="40" y1="-7" x2="40" y2="-1" stroke="currentColor" strokeWidth="1.2"/>
        <text x="20" y="6" textAnchor="middle">1 km</text>
      </g>
    </svg>
  );
}

// ─── Mood Pulse card — aggregated sentiment, fortnight ──────────────────
function MoodPulseCard({ compact }) {
  return (
    <div className="map-card" style={{ padding: compact ? 16 : 20, gap: 12, flex: '0 0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>Mood Pulse · fortnight</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            What residents’ language sounds like, in aggregate. <strong style={{ color: 'var(--rose)', fontWeight: 500 }}>52 distressed check-ins</strong> this fortnight — all routed to a specialist in-conversation.
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: 16 }}>
          n = 657 · k-anonymous
        </div>
      </div>

      <div className="mood-bar" role="img" aria-label="Mood breakdown">
        {MOOD_PULSE.map((m) => (
          <div key={m.key} className="seg" style={{ width: `${m.pct}%`, background: m.color }} title={`${m.label} · ${m.pct}%`}>
            {m.pct >= 8 ? `${m.pct}%` : ''}
          </div>
        ))}
      </div>

      {!compact && (
        <div className="mood-legend">
          {MOOD_PULSE.map((m) => (
            <div key={m.key} className={`item ${m.key === 'distressed' ? 'distressed' : ''}`}>
              <div className="lbl"><span className="dot" style={{ background: m.color }}/>{m.label}</div>
              <div className="val">{m.pct}%</div>
              <div className="sub">n = {m.n}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Specialist Referrals — routing from distress signals ───────────────
function SpecialistReferrals({ compact }) {
  return (
    <div className="map-card" style={{ padding: 20, gap: 10, flex: '0 0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>Specialist referrals · fortnight</div>
          {!compact && (
            <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.45 }}>
              When alarming or hopeless language is detected, the companion offers a specialist line in-conversation. The resident chooses whether to act.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
          <span className="display" style={{ fontSize: 28, lineHeight: 1 }}>59</span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>handoffs</span>
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
            <div className={`dlt ${sp.delta.startsWith('+') ? 'up' : ''}`}>{sp.delta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Side panel — focused suburb ────────────────────────────────────────
function SuburbPanel({ id }) {
  const s = SUBURBS.find((x) => x.id === id) || SUBURBS[0];
  const band = gapBand(s.gap);
  const needs = NEEDS_BY_SUBURB[s.id] || NEEDS_BY_SUBURB.carlton;
  return (
    <aside className="panel">
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 8 }}>
          Selected area
        </div>
        <h2>
          {s.name}
          <span className={`score-tag ${band.cls}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
            {band.label} gap
          </span>
        </h2>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
          {s.pop65} of residents are 65+ · {s.checkins} check-ins this fortnight
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="label" style={{ display: 'flex', alignItems: 'center' }}>Support Gap<SupportGapTip/></div>
          <div className="val">{s.gap}<span style={{ fontSize: 13, color: 'var(--ink-3)', marginLeft: 4 }}>/100</span></div>
          <div className="sub" style={{ color: 'var(--rose)' }}>↑ 6 vs last fortnight</div>
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
          {/* Suburb-skewed distribution for Carlton — leans toward concerned/distressed */}
          {[
            { key: 's', pct: 34, color: 'var(--sage)' },
            { key: 'r', pct: 24, color: 'var(--gold)' },
            { key: 'c', pct: 28, color: 'var(--clay)' },
            { key: 'd', pct: 14, color: 'var(--rose)' },
          ].map((m) => <div key={m.key} className="seg" style={{ width: `${m.pct}%`, background: m.color }}/>) }
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
          <span>Steady 34%</span>
          <span>Refl. 24%</span>
          <span>Concerned 28%</span>
          <span style={{ color: 'var(--rose)' }}>Distressed 14%</span>
        </div>
      </div>

      <div>
        <div className="section-label">Top needs raised this fortnight</div>
        <div className="needs-list">
          {needs.map((n, i) => (
            <div className="need-row" key={n.need}>
              <span className="rank">0{i+1}</span>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{n.need}</span>
                  <span style={{ color: 'var(--ink-4)', fontSize: 12 }}>{n.n}</span>
                </div>
                <div className="bar"><i style={{ width: `${n.pct * 2.4}%` }}/></div>
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
            Consider extending the Library’s Wednesday lunch into a fortnightly twilight session, or partnering with the bowls club on Drummond Street. Estimated reach: ~80 residents within 1.2km.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-ink">Open brief <CIcon.arrow/></button>
            <button className="btn">Share with team</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Hero artboard ──────────────────────────────────────────────────────
function CouncilHero() {
  // Selected suburb stays in component state so clicks on the map update
  // the side panel — gives the artboard a small but real interaction.
  const [sel, setSel] = React.useState('carlton');
  return (
    <div className="council">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div className="brand">
            <span className="pulse-dot"></span>
            <span>Neighbourhood Pulse <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· Insights</span></span>
          </div>
          <div className="crumbs">
            <span>City of Melbourne</span>
            <span className="sep">/</span>
            <span>Older residents</span>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink) ' }}>Support Gap, by area</span>
          </div>
        </div>
        <div className="right">
          <div className="seg" role="tablist" aria-label="Time range">
            <button>7 days</button>
            <button className="active">Fortnight</button>
            <button>90 days</button>
            <button>This year</button>
          </div>
          <button className="btn"><CIcon.filter/> Filters</button>
          <button className="btn btn-ink"><CIcon.export/> Export brief</button>
        </div>
      </div>

      <div className="main">
        {/* Rail */}
        <div className="rail">
          <div className="filter">
            <h4>Age band</h4>
            <label className="opt"><span className="check on"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5L5 9.5L10 3.5"/></svg></span>65 – 74</label>
            <label className="opt"><span className="check on"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5L5 9.5L10 3.5"/></svg></span>75 – 84</label>
            <label className="opt"><span className="check on"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5L5 9.5L10 3.5"/></svg></span>85+</label>
            <label className="opt"><span className="check"></span>Under 65</label>
          </div>

          <div className="filter">
            <h4>Need type</h4>
            <div className="pill-list">
              <button className="pill on">Social</button>
              <button className="pill on">Food</button>
              <button className="pill on">Transport</button>
              <button className="pill on">Wellbeing</button>
              <button className="pill">Health</button>
              <button className="pill">Financial</button>
              <button className="pill">Safety</button>
            </div>
          </div>

          <div className="filter">
            <h4>Service signal</h4>
            <label className="opt"><span className="check on"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5L5 9.5L10 3.5"/></svg></span>Free or low-cost</label>
            <label className="opt"><span className="check on"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6.5L5 9.5L10 3.5"/></svg></span>Wheelchair access</label>
            <label className="opt"><span className="check"></span>Open after 5pm</label>
            <label className="opt"><span className="check"></span>Phone bookings</label>
          </div>

          <div className="filter">
            <h4>Consent state</h4>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              Only check-ins where the resident has consented to aggregated use are included. Areas with fewer than 5 check-ins are suppressed.
            </div>
          </div>
        </div>

        {/* Map column */}
        <div className="map-wrap">
          <div className="map-head">
            <div>
              <h1>Where might older neighbours feel <em>most disconnected</em>?</h1>
              <p className="lede">
                Each shape is a small area. Colour shows its <strong style={{ color: 'var(--ink-2)', fontWeight: 500 }}>Support Gap<SupportGapTip/></strong> — areas with rising needs and few nearby ways to meet them.
              </p>
            </div>
            <div className="legend">
              <div>
                <div className="grad"></div>
                <div className="ticks">
                  <span>Low gap</span>
                  <span>Watch</span>
                  <span>Elevated</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="label">Check-ins · fortnight</div>
              <div className="val">657</div>
              <div className="delta up"><CIcon.trend up={true}/> +12% vs prior</div>
            </div>
            <div className="kpi">
              <div className="label">Areas above watch</div>
              <div className="val">4 <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>of 9</span></div>
              <div className="delta up"><CIcon.trend up={true}/> +1 area</div>
            </div>
            <div className="kpi" style={{ background: 'color-mix(in oklch, var(--rose) 6%, var(--surface))', borderColor: 'color-mix(in oklch, var(--rose) 25%, var(--line))' }}>
              <div className="label">Distress signals</div>
              <div className="val">8% <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>· 52</span></div>
              <div className="delta up"><CIcon.trend up={true}/> +1.4 pts</div>
            </div>
            <div className="kpi">
              <div className="label">Specialist handoffs</div>
              <div className="val">59</div>
              <div className="delta up"><CIcon.trend up={true}/> +13 vs prior</div>
            </div>
          </div>

          <div className="map-card">
            <HeatMap selected={sel} onSelect={setSel}/>
          </div>
        </div>

        {/* Side panel */}
        <SuburbPanel id={sel}/>
      </div>
    </div>
  );
}

// ─── Detail / drill-in artboard ─────────────────────────────────────────
function CouncilDetail() {
  const s = SUBURBS.find((x) => x.id === 'carlton');
  const needs = NEEDS_BY_SUBURB.carlton;
  // Sparkline for fortnight trend — small SVG made from a fixed array
  const trend = [12, 14, 11, 16, 18, 22, 19, 25, 28, 26, 31, 34, 30, 38];
  const trendMax = Math.max(...trend);
  const trendPath = trend.map((v, i) => {
    const x = (i / (trend.length - 1)) * 100;
    const y = 100 - (v / trendMax) * 80 - 10;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="council detail">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div className="brand">
            <span className="pulse-dot"></span>
            <span>Neighbourhood Pulse <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· Insights</span></span>
          </div>
          <div className="crumbs">
            <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }}>← Back to map</button>
            <span style={{ color: 'var(--ink)' }}>Carlton, 3053</span>
          </div>
        </div>
        <div className="right">
          <button className="btn">Compare with…</button>
          <button className="btn btn-ink"><CIcon.export/> Generate area brief</button>
        </div>
      </div>

      <div className="main">
        <div className="content">

          {/* LEFT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 className="display" style={{ fontSize: 38, margin: 0, letterSpacing: '-0.02em' }}>Carlton</h1>
                <span className="score-tag high">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                  High Support Gap
                </span>
              </div>
              <p style={{ color: 'var(--ink-3)', marginTop: 6, maxWidth: 560 }}>
                14.2% of Carlton residents are 65+ (above City of Melbourne average of 9.1%). Loneliness signals have climbed steadily across the fortnight, particularly after 5pm.
              </p>
            </div>

            {/* Support-gap card with sparkline */}
            <div className="map-card" style={{ padding: 22, gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="section-label" style={{ display: 'flex', alignItems: 'center' }}>Support Gap score · last 14 days<SupportGapTip/></div>
                  <div className="display" style={{ fontSize: 56, lineHeight: 1, marginTop: 4 }}>
                    78<span style={{ fontSize: 18, color: 'var(--ink-3)', marginLeft: 4 }}>/100</span>
                  </div>
                  <div style={{ color: 'var(--rose)', fontSize: 13, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CIcon.trend up={true}/> Up 6 points this fortnight
                  </div>
                </div>
                <div style={{ width: 320, height: 110 }}>
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
                    <defs>
                      <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="var(--clay)" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d={`${trendPath} L 100 90 L 0 90 Z`} fill="url(#sparkfill)" />
                    <path d={trendPath} fill="none" stroke="var(--clay)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="100" cy={100 - (trend[trend.length-1] / trendMax) * 80 - 10} r="2" fill="var(--clay)"/>
                  </svg>
                </div>
              </div>

              {/* explainable breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <div>
                  <div className="section-label">Need signal</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="display" style={{ fontSize: 26 }}>0.84</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>weighted</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: '84%', height: '100%', background: 'var(--rose)' }}/>
                  </div>
                </div>
                <div>
                  <div className="section-label">Service availability</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="display" style={{ fontSize: 26 }}>0.38</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>per resident 65+</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: '38%', height: '100%', background: 'var(--gold)' }}/>
                  </div>
                </div>
                <div>
                  <div className="section-label">Access · walkability</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span className="display" style={{ fontSize: 26 }}>0.72</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>good</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', background: 'var(--sage)' }}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Service density */}
            <div className="map-card" style={{ padding: 22 }}>
              <div className="section-label" style={{ marginBottom: 14 }}>Services per 1,000 residents 65+, by category</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { cat: 'Social activities',  carlton: 1.2, avg: 2.6 },
                  { cat: 'Food support',       carlton: 0.8, avg: 1.9 },
                  { cat: 'Transport',          carlton: 1.5, avg: 1.8 },
                  { cat: 'Wellbeing / chat',   carlton: 0.4, avg: 1.1 },
                  { cat: 'Health navigation',  carlton: 2.1, avg: 2.0 },
                ].map((row) => (
                  <div key={row.cat} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px', gap: 12, alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--ink-2)' }}>{row.cat}</span>
                    <div style={{ position: 'relative', height: 22 }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'var(--line-soft)', borderRadius: 4 }}/>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(row.carlton/3)*100}%`, background: row.carlton < row.avg ? 'var(--clay)' : 'var(--sage)', borderRadius: 4 }}/>
                      <div style={{ position: 'absolute', left: `${(row.avg/3)*100}%`, top: -3, bottom: -3, borderLeft: '2px dashed var(--ink-2)' }} title="City average"/>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                      {row.carlton.toFixed(1)} <span style={{ color: 'var(--ink-4)' }}>/ {row.avg.toFixed(1)}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 18, fontSize: 11, color: 'var(--ink-3)', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--clay)' }}/>Below city average</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--sage)' }}/>At or above</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 0, height: 14, borderLeft: '2px dashed var(--ink-2)' }}/>City average</span>
              </div>
            </div>

            {/* Mood Pulse over time + anonymised phrases */}
            <div className="map-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div className="section-label">Mood pulse · last 14 days</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                    Share of check-ins flagged as <strong style={{ color: 'var(--rose)', fontWeight: 500 }}>distressed</strong> or <strong style={{ color: 'var(--clay-deep)', fontWeight: 500 }}>concerned</strong> language, by day.
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>n = 142</div>
              </div>

              {/* Stacked area: concerned + distressed shares, simple svg */}
              <svg viewBox="0 0 280 90" width="100%" height="90" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--rose)" stopOpacity="0.5"/>
                    <stop offset="100%" stopColor="var(--rose)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Y gridlines */}
                {[0, 0.25, 0.5, 0.75].map((y) => (
                  <line key={y} x1="0" x2="280" y1={y * 90} y2={y * 90} stroke="var(--line-soft)" strokeWidth="0.5"/>
                ))}
                {/* Concerned area */}
                {(() => {
                  const concerned = [22, 24, 21, 26, 23, 28, 27, 32, 30, 29, 34, 36, 33, 38];
                  const distressed = [4, 5, 4, 6, 6, 8, 7, 9, 11, 10, 13, 14, 12, 14];
                  const w = 280, h = 90;
                  const max = 50;
                  const xy = (arr) => arr.map((v, i) => `${(i / (arr.length - 1)) * w},${h - (v / max) * h}`).join(' L ');
                  return (
                    <>
                      <path d={`M 0 ${h} L ${xy(concerned)} L ${w} ${h} Z`} fill="var(--clay)" fillOpacity="0.25"/>
                      <path d={`M ${xy(concerned)}`} fill="none" stroke="var(--clay)" strokeWidth="1.6" vectorEffect="non-scaling-stroke"/>
                      <path d={`M 0 ${h} L ${xy(distressed)} L ${w} ${h} Z`} fill="url(#moodGrad)"/>
                      <path d={`M ${xy(distressed)}`} fill="none" stroke="var(--rose)" strokeWidth="1.8" vectorEffect="non-scaling-stroke"/>
                    </>
                  );
                })()}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                <span>14 days ago</span>
                <span>today</span>
              </div>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <div className="section-label" style={{ marginBottom: 10 }}>Recurring phrases · paraphrased &amp; k-anonymous</div>
                {RECENT_PHRASES.slice(0, 4).map((p, i) => (
                  <div key={i} className="phrase">
                    <span className="dot" style={{ background: MOOD_PULSE.find((m) => m.key === p.sent)?.color || 'var(--ink-3)' }}/>
                    <span className="text">{p.text}</span>
                    <span className="meta">×{p.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="map-card" style={{ padding: 22 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>Top needs raised · fortnight</div>
              <div className="needs-list">
                {needs.map((n, i) => (
                  <div className="need-row" key={n.need}>
                    <span className="rank">0{i+1}</span>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>{n.need}</span>
                        <span style={{ color: 'var(--ink-4)', fontSize: 12 }}>{n.n} signals</span>
                      </div>
                      <div className="bar" style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                        <i style={{ display: 'block', width: `${n.pct * 2.4}%`, height: '100%', background: 'var(--clay)' }}/>
                      </div>
                    </div>
                    <span className="pct">{n.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <SpecialistReferrals/>

            <div className="map-card" style={{ padding: 22 }}>
              <div className="section-label" style={{ marginBottom: 10 }}>Suggested actions</div>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  {
                    title: 'Extend Library Lunch into a twilight session',
                    why: 'Need peaks after 5pm; the lunch already attracts ~40 regulars. Estimated reach: 60–80.',
                    effort: 'Low effort',
                    impact: 'High',
                  },
                  {
                    title: 'Partner with Drummond St Bowls Club',
                    why: 'Walkable for 72% of 65+ residents. Existing space, just needs a programme partner.',
                    effort: 'Medium',
                    impact: 'High',
                  },
                  {
                    title: 'Pilot weekly Phone Visitor matches',
                    why: 'Wellbeing-chat requests grew 41% — a phone match removes mobility friction entirely.',
                    effort: 'Low effort',
                    impact: 'Medium',
                  },
                ].map((a, i) => (
                  <li key={a.title} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 12, alignItems: 'start' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>0{i+1}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, lineHeight: 1.3 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.45 }}>{a.why}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <span className="score-tag low" style={{ fontSize: 10 }}>{a.effort}</span>
                        <span className="score-tag med" style={{ fontSize: 10 }}>{a.impact} impact</span>
                      </div>
                    </div>
                    <button className="btn" style={{ padding: '6px 10px' }}><CIcon.arrow/></button>
                  </li>
                ))}
              </ol>
            </div>

            <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em', lineHeight: 1.6 }}>
              Privacy: aggregated from 142 consented check-ins · suppressed below n=5 · individual residents are never identified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CouncilHero, CouncilDetail });
