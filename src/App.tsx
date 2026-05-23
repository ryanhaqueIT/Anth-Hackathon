import { useState } from "react";
import { CouncilApp } from "@/components/dashboard/council-app";

type View = "resident" | "council";

function ResidentPlaceholder() {
	return (
		<div className="resident">
			<div className="topbar">
				<div className="brand">
					<span className="pulse-dot" />
					<span>Neighbourhood Pulse</span>
				</div>
			</div>
			<div className="scroll" style={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
				<div>
					<h1 className="greet">The resident app <em>lives here soon</em>.</h1>
					<p className="greet-sub">Real voice check-ins, AI companion, and recommendations come next.</p>
				</div>
			</div>
		</div>
	);
}

function App() {
	const [view, setView] = useState<View>("council");
	return (
		<>
			<div className="view-stage" data-view={view}>
				{view === "resident" ? <ResidentPlaceholder /> : <CouncilApp />}
			</div>

			<div className="view-switcher" role="tablist" aria-label="Demo perspective">
				<span className="vs-pre">You're viewing as</span>
				<button
					type="button"
					role="tab"
					aria-selected={view === "resident"}
					className={`vs-btn ${view === "resident" ? "on" : ""}`}
					onClick={() => setView("resident")}
				>
					<span className="vs-dot" style={{ background: "var(--clay)" }} />
					Margaret · 78, Carlton
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={view === "council"}
					className={`vs-btn ${view === "council" ? "on" : ""}`}
					onClick={() => setView("council")}
				>
					<span className="vs-dot" style={{ background: "var(--ink)" }} />
					City of Melbourne · planner
				</button>
			</div>
		</>
	);
}

export default App;
