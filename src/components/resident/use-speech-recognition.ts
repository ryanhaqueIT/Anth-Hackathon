import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionEventLike = {
	results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> & { length: number };
};

type SpeechRecognitionLike = {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	start(): void;
	stop(): void;
	abort(): void;
	onresult: ((event: SpeechRecognitionEventLike) => void) | null;
	onerror: ((event: { error: string }) => void) | null;
	onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
	const w = window as unknown as {
		SpeechRecognition?: SpeechRecognitionCtor;
		webkitSpeechRecognition?: SpeechRecognitionCtor;
	};
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition() {
	const [supported] = useState(() => !!getCtor());
	const [transcript, setTranscript] = useState("");
	const [interim, setInterim] = useState("");
	const [listening, setListening] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const recogRef = useRef<SpeechRecognitionLike | null>(null);

	const start = useCallback(() => {
		const Ctor = getCtor();
		if (!Ctor) {
			setError("Speech recognition not supported in this browser");
			return;
		}
		setTranscript("");
		setInterim("");
		setError(null);
		const r = new Ctor();
		r.lang = "en-AU";
		r.continuous = true;
		r.interimResults = true;
		r.onresult = (event) => {
			let finalText = "";
			let interimText = "";
			for (let i = 0; i < event.results.length; i++) {
				const result = event.results[i];
				if (result.isFinal) finalText += result[0].transcript;
				else interimText += result[0].transcript;
			}
			if (finalText) setTranscript((t) => (t + " " + finalText).trim());
			setInterim(interimText);
		};
		r.onerror = (event) => setError(event.error);
		r.onend = () => setListening(false);
		recogRef.current = r;
		r.start();
		setListening(true);
	}, []);

	const stop = useCallback(() => {
		recogRef.current?.stop();
		setListening(false);
	}, []);

	useEffect(() => () => recogRef.current?.abort(), []);

	return { supported, listening, transcript, interim, error, start, stop };
}
