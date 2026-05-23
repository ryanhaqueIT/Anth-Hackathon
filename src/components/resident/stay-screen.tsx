import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { ResidentTop } from "./screens";
import { useSpeechRecognition } from "./use-speech-recognition";

const SEED: UIMessage[] = [
	{
		id: "seed-assistant",
		role: "assistant",
		parts: [
			{
				type: "text",
				text: "I'm right here with you, Margaret. Take your time — there's no rush. Tell me anything that's on your mind, or just sit with me a moment.",
			},
		],
	},
];

function messageText(m: UIMessage): string {
	return m.parts
		.map((p) => (p.type === "text" ? p.text : ""))
		.join("");
}

export function ScreenStay({ onDone }: { onDone: () => void }) {
	const { messages, sendMessage, status } = useChat({
		messages: SEED,
		transport: new DefaultChatTransport({ api: "/api/chat" }),
	});
	const [draft, setDraft] = useState("");
	const speech = useSpeechRecognition();
	const scrollRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
	}, []);

	useEffect(() => {
		if (!speech.listening) {
			const combined = (speech.transcript + " " + speech.interim).trim();
			if (combined) setDraft((d) => (d ? `${d} ${combined}` : combined));
		}
	}, [speech.listening, speech.transcript, speech.interim]);

	const submit = (e?: FormEvent) => {
		e?.preventDefault();
		const text = draft.trim();
		if (!text || status === "streaming" || status === "submitted") return;
		setDraft("");
		void sendMessage({ text });
	};

	const toggleMic = () => {
		if (speech.listening) speech.stop();
		else speech.start();
	};

	return (
		<div className="resident supportive">
			<ResidentTop onBack={onDone} />
			<div className="scroll" ref={scrollRef}>
				{messages.map((m) => (
					<div key={m.id} className={`care-bubble ${m.role === "user" ? "user" : "kind"}`}>
						{m.role === "assistant" ? (
							<div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", lineHeight: 1.45 }}>
								{messageText(m)}
							</div>
						) : (
							messageText(m)
						)}
					</div>
				))}
				{status === "submitted" && (
					<div className="ack-thinking" aria-hidden="true">
						<span /><span /><span />
					</div>
				)}
			</div>

			<form className="voicebar" onSubmit={submit} style={{ gap: 12 }}>
				<div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 460 }}>
					<input
						type="text"
						value={speech.listening ? speech.transcript + " " + speech.interim : draft}
						onChange={(e) => setDraft(e.target.value)}
						placeholder={speech.listening ? "Listening…" : "Say a little something…"}
						disabled={speech.listening}
						style={{
							flex: 1,
							padding: "12px 16px",
							border: "1px solid var(--line)",
							background: "var(--surface)",
							borderRadius: 999,
							font: "inherit",
							fontSize: "0.95rem",
							color: "var(--ink)",
							outline: "none",
						}}
					/>
					<button type="button" className="icon-btn" onClick={toggleMic} aria-label={speech.listening ? "Stop" : "Speak"}>
						<Icon.mic size={20} />
					</button>
					<button type="submit" className="icon-btn" disabled={!draft.trim() || status === "streaming"} aria-label="Send">
						<Icon.arrow />
					</button>
				</div>
				<button type="button" className="chip" onClick={onDone} style={{ marginTop: 4 }}>
					I'm a bit steadier now
				</button>
			</form>
		</div>
	);
}
