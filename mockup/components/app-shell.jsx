// App shell — view switcher between Resident and Council perspectives.
// Renders the active view full-bleed; a floating switcher sits at the
// bottom so the prototype clearly offers both sides without dominating
// either screen.

function AppShell() {
  const [view, setView] = React.useState('resident');

  return (
    <>
      <div className="view-stage" data-view={view}>
        {view === 'resident' && <ResidentApp/>}
        {view === 'council'  && <CouncilApp/>}
      </div>

      <div className="view-switcher" role="tablist" aria-label="Demo perspective">
        <span className="vs-pre">You’re viewing as</span>
        <button
          role="tab"
          aria-selected={view === 'resident'}
          className={`vs-btn ${view === 'resident' ? 'on' : ''}`}
          onClick={() => setView('resident')}
        >
          <span className="vs-dot" style={{ background: 'var(--clay)' }}/>
          Margaret · 78, Carlton
        </button>
        <button
          role="tab"
          aria-selected={view === 'council'}
          className={`vs-btn ${view === 'council' ? 'on' : ''}`}
          onClick={() => setView('council')}
        >
          <span className="vs-dot" style={{ background: 'var(--ink)' }}/>
          City of Melbourne · planner
        </button>
      </div>
    </>
  );
}

Object.assign(window, { AppShell });
