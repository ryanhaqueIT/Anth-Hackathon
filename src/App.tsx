import { useState } from "react";
import { CouncilApp } from "@/components/dashboard/council-app";
import { ResidentApp } from "@/components/resident/resident-app";

type View = "resident" | "council";

function App() {
	const [view, setView] = useState<View>("resident");
	return (
		<>
			<div className="view-stage" data-view={view}>
				{view === "resident" ? <ResidentApp /> : <CouncilApp />}
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
