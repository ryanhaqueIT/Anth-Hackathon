import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
	open: boolean;
	title: string;
	sub?: string;
	children: ReactNode;
	onClose: () => void;
	footer?: ReactNode;
};

export function Modal({ open, title, sub, children, onClose, footer }: Props) {
	useEffect(() => {
		if (!open) return;
		const k = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", k);
		return () => document.removeEventListener("keydown", k);
	}, [open, onClose]);
	if (!open) return null;
	return createPortal(
		<div className="modal-backdrop" onClick={onClose}>
			<div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
				<div className="modal-head">
					<div>
						<h2>{title}</h2>
						{sub && <p>{sub}</p>}
					</div>
					<button type="button" className="modal-x" onClick={onClose} aria-label="Close">×</button>
				</div>
				<div className="modal-body">{children}</div>
				{footer && <div className="modal-foot">{footer}</div>}
			</div>
		</div>,
		document.body,
	);
}
