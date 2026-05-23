import { useState } from "react";
import { CouncilDetail } from "./council-detail";
import { CouncilHero } from "./council-hero";
import { BriefModal, ExportModal, FiltersModal } from "./modals";

type Modal = "brief" | "export" | "filters" | null;

export function CouncilApp() {
	const [page, setPage] = useState<"hero" | "drill">("hero");
	const [modal, setModal] = useState<Modal>(null);
	return (
		<>
			{page === "hero" ? (
				<CouncilHero
					onDrillIn={() => setPage("drill")}
					onBrief={() => setModal("brief")}
					onExport={() => setModal("export")}
					onFilters={() => setModal("filters")}
				/>
			) : (
				<CouncilDetail onBack={() => setPage("hero")} onExport={() => setModal("export")} />
			)}
			<BriefModal open={modal === "brief"} onClose={() => setModal(null)} />
			<ExportModal open={modal === "export"} onClose={() => setModal(null)} />
			<FiltersModal open={modal === "filters"} onClose={() => setModal(null)} />
		</>
	);
}
