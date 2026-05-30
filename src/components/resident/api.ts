export type ServiceRec = {
	name: string;
	what: string;
	suburb: string;
	address: string;
	phone: string;
	categories: string[];
	hours: Record<string, string>;
	cost: string;
	transport: string;
	website: string | null;
	distance_km: number | null;
	why: string;
};

export type CheckinResponse = {
	headline: string;
	source: "anthropic" | "fallback";
	recommendations: ServiceRec[];
};

export type CheckinInput = {
	suburb: string;
	age_band: string;
	mood: string;
	free_text: string;
};

export async function submitCheckin(input: CheckinInput): Promise<CheckinResponse> {
	const res = await fetch("/api/checkin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});
	if (!res.ok) throw new Error(`Check-in failed: ${res.status}`);
	return (await res.json()) as CheckinResponse;
}

export const MOOD_TO_TEXT: Record<string, string> = {
	ok: "Curious what activities are happening nearby today.",
	quiet: "I'd like a quiet activity nearby this afternoon.",
	lonely: "I'm feeling a bit lonely and want something nearby.",
	low: "Things have been feeling low; I'd like something gentle nearby.",
};

const TAG_LABEL: Record<string, string> = {
	"Aged Services": "Wellbeing",
	"Community Services": "Social",
	"Family Services": "Social",
	"Food Services": "Food",
	"Health Services / Pharmacy": "Health",
	"Legal / Financial Advice": "Financial",
	"Counselling and Psychiatric Services": "Wellbeing",
	"Drug and Alcohol": "Health",
	Accommodation: "Support",
};

const TAG_CLASS: Record<string, string> = {
	Social: "sage",
	Food: "clay",
	Wellbeing: "gold",
	Health: "sage",
	Financial: "gold",
	Support: "gold",
};

export function recTag(rec: ServiceRec): { label: string; cls: string } {
	const firstCat = rec.categories[0];
	const label = (firstCat && TAG_LABEL[firstCat]) || "Support";
	const cls = TAG_CLASS[label] || "gold";
	return { label, cls };
}

export function recDistance(rec: ServiceRec): string {
	if (rec.distance_km == null) return "Nearby";
	if (rec.distance_km < 1) return `${Math.round(rec.distance_km * 1000)}m`;
	return `${rec.distance_km.toFixed(1)}km`;
}

export function recNextSession(rec: ServiceRec): string {
	const today = new Date().toLocaleDateString("en-AU", { weekday: "long" }).toLowerCase();
	const todayHours = rec.hours[today];
	if (todayHours && todayHours.toLowerCase() !== "closed") return `Today, ${todayHours.split(",")[0]}`;
	const order = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
	const startIdx = order.indexOf(today as (typeof order)[number]);
	for (let i = 1; i <= 7; i++) {
		const day = order[(startIdx + i) % 7];
		const h = rec.hours[day];
		if (h && h.toLowerCase() !== "closed") return `${day[0].toUpperCase()}${day.slice(1)}, ${h.split(",")[0]}`;
	}
	return "Phone for hours";
}
