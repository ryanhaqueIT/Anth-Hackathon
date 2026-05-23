import { Icon } from "./icons";
import { ResidentTop } from "./screens";

type Choice = "low" | "heavy";

export function ScreenDeeper({ onChoice, onBack }: { onChoice: (k: Choice) => void; onBack: () => void }) {
	return (
		<div className="resident">
			<ResidentTop onBack={onBack} />
			<div className="scroll">
				<div className="bubble assistant" style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", lineHeight: 1.35 }}>
					Oh, Margaret. Would you tell me a little more about today? No wrong words.
				</div>
				<div className="feel-list" style={{ padding: "14px 0 0" }}>
					<button type="button" className="feel-btn" onClick={() => onChoice("low")}>
						<span className="swatch quiet" />
						Just a bit low and tired
						<span className="arr"><Icon.arrow /></span>
					</button>
					<button type="button" className="feel-btn" onClick={() => onChoice("heavy")}>
						<span className="swatch lonely" />
						Heavier — I haven't really wanted to get up
						<span className="arr"><Icon.arrow /></span>
					</button>
					<button type="button" className="feel-btn" onClick={() => onChoice("heavy")}>
						<span className="swatch hard" />
						I don't really see the point most mornings
						<span className="arr"><Icon.arrow /></span>
					</button>
				</div>
				<div className="voice-hint-row">— or just say it your own way —</div>
			</div>
			<div className="voicebar">
				<button type="button" className="mic-btn" aria-label="Speak">
					<Icon.mic size={36} />
				</button>
			</div>
		</div>
	);
}
