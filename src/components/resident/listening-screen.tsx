import { useEffect } from "react";
import { Icon } from "./icons";
import { ResidentTop } from "./screens";
import { useSpeechRecognition } from "./use-speech-recognition";

export function ScreenListening({ onDone }: { onDone: (transcript: string) => void }) {
	const { supported, listening, transcript, interim, error, start, stop } = useSpeechRecognition();

	useEffect(() => {
		if (supported) start();
		return () => stop();
	}, [supported, start, stop]);

	const finish = () => {
		stop();
		const text = (transcript + " " + interim).trim();
		onDone(text || "I just wanted to check in.");
	};

	const placeholder = supported
		? listening
			? "I'm listening, take your time…"
			: "Press start, then speak."
		: "Your browser doesn't support voice — type into the check-in instead.";

	return (
		<div className="resident listening">
			<ResidentTop right={<div style={{ fontSize: "0.85rem", color: "var(--ink-3)" }}>Listening · Carlton</div>} />
			<div className="listen-stage">
				<div className="waveform" aria-hidden="true">
					{Array.from({ length: 13 }).map((_, i) => (
						<div key={`bar-${i}`} className="bar" />
					))}
				</div>
				<div className="listen-label">{placeholder}</div>
				<div className="live-transcript">
					{transcript}
					{interim && <span className="pending"> {interim}</span>}
					<span className="caret">|</span>
				</div>
				{error && (
					<div style={{ fontSize: 12, color: "var(--rose)" }}>Mic error: {error}</div>
				)}
				<button type="button" className="stop-btn" onClick={finish}>
					<span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--clay)" }} />
					Tap when you're done
				</button>
			</div>
		</div>
	);
}
