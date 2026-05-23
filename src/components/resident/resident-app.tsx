import { useEffect, useRef, useState } from "react";
import { type CheckinResponse, MOOD_TO_TEXT, type ServiceRec, submitCheckin } from "./api";
import { ScreenDeeper } from "./deeper-screen";
import type { Specialist } from "./host-data";
import { ScreenListening } from "./listening-screen";
import {
	ScreenAcknowledge,
	ScreenCalling,
	ScreenCheckin,
	ScreenDetail,
	ScreenHostCraft,
	ScreenHostOffer,
	ScreenHostWhen,
	ScreenHosted,
	ScreenRecs,
	ScreenSaved,
	ScreenSupport,
} from "./screens";
import { ScreenStay } from "./stay-screen";

type Screen =
	| "checkin"
	| "acknowledge"
	| "deeper"
	| "recs"
	| "detail"
	| "saved"
	| "support"
	| "calling"
	| "stay"
	| "listening"
	| "hostOffer"
	| "hostCraft"
	| "hostWhen"
	| "hosted";

export function ResidentApp() {
	const [screen, setScreen] = useState<Screen>("checkin");
	const [mood, setMood] = useState<string | null>(null);
	const [selectedRec, setSelectedRec] = useState<ServiceRec | null>(null);
	const [selectedSpec, setSelectedSpec] = useState<Specialist | null>(null);
	const [recsData, setRecsData] = useState<CheckinResponse | null>(null);

	const [hostTopic, setHostTopic] = useState<string | null>(null);
	const [hostWhen, setHostWhen] = useState<string | null>(null);
	const [hostVenue, setHostVenue] = useState<string | null>(null);
	const [hostSize, setHostSize] = useState<string | null>(null);
	const resetHost = () => {
		setHostTopic(null);
		setHostWhen(null);
		setHostVenue(null);
		setHostSize(null);
	};

	const ackTimer = useRef<number | null>(null);
	useEffect(() => {
		return () => {
			if (ackTimer.current) window.clearTimeout(ackTimer.current);
		};
	}, []);

	function submit(moodKey: string, freeTextOverride?: string) {
		const free_text = freeTextOverride || MOOD_TO_TEXT[moodKey] || "I'd like to see what's around.";
		setRecsData(null);
		submitCheckin({ suburb: "Carlton", age_band: "65+", mood: moodKey, free_text })
			.then(setRecsData)
			.catch((err: Error) => {
				console.warn("[NP] check-in failed", err.message);
				setRecsData({ headline: "I'm having trouble reaching the service catalogue.", source: "fallback", recommendations: [] });
			});
	}

	function routeViaAck(nextMood: string, after: Screen = "recs", freeText?: string) {
		setMood(nextMood);
		setScreen("acknowledge");
		submit(nextMood, freeText);
		if (ackTimer.current) window.clearTimeout(ackTimer.current);
		ackTimer.current = window.setTimeout(() => setScreen(after), 1600);
	}

	const onMood = (m: string) => {
		if (m === "hard") {
			setMood(m);
			setScreen("deeper");
		} else if (m === "quiet") {
			routeViaAck(m, "hostOffer");
		} else {
			routeViaAck(m, "recs");
		}
	};

	const onDeeper = (kind: "low" | "heavy") => {
		if (kind === "low") routeViaAck("low", "recs");
		else setScreen("support");
	};

	return (
		<div className="resident-stage">
			<div className="resident-frame">
				<div className="screen-fade" key={screen}>
					{screen === "checkin" && (
						<ScreenCheckin onMood={onMood} onVoice={() => setScreen("listening")} />
					)}
					{screen === "acknowledge" && <ScreenAcknowledge mood={mood} />}
					{screen === "deeper" && <ScreenDeeper onChoice={onDeeper} onBack={() => setScreen("checkin")} />}
					{screen === "recs" && (
						<ScreenRecs
							mood={mood}
							data={recsData}
							onPick={(r) => {
								setSelectedRec(r);
								setScreen("detail");
							}}
							onBack={() => setScreen("checkin")}
						/>
					)}
					{screen === "detail" && (
						<ScreenDetail rec={selectedRec} onSave={() => setScreen("saved")} onBack={() => setScreen("recs")} />
					)}
					{screen === "saved" && <ScreenSaved rec={selectedRec} onDone={() => setScreen("checkin")} />}
					{screen === "support" && (
						<ScreenSupport
							onPick={(s) => {
								setSelectedSpec(s);
								setScreen("calling");
							}}
							onStay={() => setScreen("stay")}
							onBack={() => setScreen("checkin")}
						/>
					)}
					{screen === "calling" && (
						<ScreenCalling spec={selectedSpec} onEnd={() => setScreen("support")} onStay={() => setScreen("stay")} />
					)}
					{screen === "stay" && <ScreenStay onDone={() => setScreen("checkin")} />}
					{screen === "listening" && (
						<ScreenListening
							onDone={(transcript) => {
								setMood("lonely");
								submit("lonely", transcript);
								setScreen("recs");
							}}
						/>
					)}

					{screen === "hostOffer" && (
						<ScreenHostOffer
							onYes={() => {
								setHostTopic("bake");
								setScreen("hostCraft");
							}}
							onLater={() => setScreen("recs")}
							onBack={() => setScreen("checkin")}
						/>
					)}
					{screen === "hostCraft" && (
						<ScreenHostCraft
							topic={hostTopic}
							onPick={setHostTopic}
							onContinue={() => setScreen("hostWhen")}
							onBack={() => setScreen("hostOffer")}
						/>
					)}
					{screen === "hostWhen" && (
						<ScreenHostWhen
							when={hostWhen}
							venue={hostVenue}
							size={hostSize}
							onWhen={setHostWhen}
							onVenue={setHostVenue}
							onSize={setHostSize}
							onContinue={() => setScreen("hosted")}
							onBack={() => setScreen("hostCraft")}
						/>
					)}
					{screen === "hosted" && (
						<ScreenHosted
							topic={hostTopic}
							when={hostWhen}
							venue={hostVenue}
							size={hostSize}
							onDone={() => {
								resetHost();
								setScreen("checkin");
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
