import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function InfoTip({ children }: { children: ReactNode }) {
	const ref = useRef<HTMLSpanElement | null>(null);
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState<{ cx: number; top: number; arrow: number } | null>(null);

	const place = useCallback(() => {
		if (!ref.current) return;
		const r = ref.current.getBoundingClientRect();
		const W = 280;
		const M = 12;
		const minCx = W / 2 + M;
		const maxCx = window.innerWidth - W / 2 - M;
		const rawCx = r.left + r.width / 2;
		const cx = Math.max(minCx, Math.min(maxCx, rawCx));
		setPos({ cx, top: r.top, arrow: rawCx - cx });
	}, []);

	useEffect(() => {
		if (!open) return;
		place();
		const on = () => place();
		window.addEventListener("scroll", on, true);
		window.addEventListener("resize", on);
		return () => {
			window.removeEventListener("scroll", on, true);
			window.removeEventListener("resize", on);
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
			>
				i
			</span>
			{open && pos && createPortal(
				<div
					className="infotip-pop"
					style={{ left: pos.cx, top: pos.top, ["--arrow" as string]: `${pos.arrow}px` }}
				>
					<div className="infotip-pop-inner">{children}</div>
				</div>,
				document.body,
			)}
		</>
	);
}

export function SupportGapTip() {
	return (
		<InfoTip>
			<strong>Support Gap</strong> — how much help older residents are asking for in an area, minus how much free help they can actually reach. 0 = covered, 100 = pronounced gap.
			<span className="formula">
				<span className="term">Need raised</span> − <span className="term">Support reachable</span> = <span className="out">Support Gap</span>
			</span>
		</InfoTip>
	);
}
