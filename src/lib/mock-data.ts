export type Suburb = {
	id: string;
	name: string;
	gap: number;
	checkins: number;
	services: number;
	pop65: string;
	poly: string;
	x: number;
	y: number;
	hidden?: boolean;
};

export const SUBURBS: Suburb[] = [
	{ id: "carlton", name: "Carlton", gap: 78, checkins: 142, services: 8, pop65: "14.2%", poly: "40,160 145,140 175,250 90,290 30,250", x: 92, y: 220 },
	{ id: "nthmelb", name: "North Melbourne", gap: 71, checkins: 118, services: 6, pop65: "11.8%", poly: "40,160 30,90 130,55 145,140", x: 86, y: 110 },
	{ id: "fitzroy", name: "Fitzroy", gap: 64, checkins: 96, services: 9, pop65: "8.4%", poly: "145,140 245,110 270,210 175,250", x: 207, y: 175 },
	{ id: "collingwood", name: "Collingwood", gap: 52, checkins: 72, services: 7, pop65: "7.9%", poly: "245,110 340,90 360,200 270,210", x: 304, y: 150 },
	{ id: "brunswick", name: "Brunswick", gap: 46, checkins: 84, services: 12, pop65: "10.1%", poly: "130,55 245,55 245,110 145,140", x: 192, y: 90 },
	{ id: "richmond", name: "Richmond", gap: 58, checkins: 88, services: 10, pop65: "9.5%", poly: "270,210 360,200 380,290 290,310", x: 322, y: 252 },
	{ id: "eastmelb", name: "East Melbourne", gap: 22, checkins: 41, services: 11, pop65: "13.4%", poly: "175,250 270,210 290,310 200,330", x: 230, y: 280 },
	{ id: "parkville", name: "Parkville", gap: 18, checkins: 28, services: 9, pop65: "6.2%", poly: "30,90 130,55 145,140 40,160", x: 86, y: 110, hidden: true },
	{ id: "sthyarra", name: "South Yarra", gap: 34, checkins: 52, services: 14, pop65: "5.1%", poly: "290,310 380,290 370,370 270,370", x: 322, y: 335 },
	{ id: "docklands", name: "Docklands", gap: 28, checkins: 36, services: 7, pop65: "4.8%", poly: "30,250 90,290 100,360 20,340", x: 60, y: 310 },
];

export function gapColor(gap: number): string {
	if (gap >= 70) return "var(--rose)";
	if (gap >= 50) return "var(--clay)";
	if (gap >= 30) return "var(--gold)";
	return "var(--sage)";
}

export function gapBand(gap: number): { label: string; cls: "high" | "med" | "low" } {
	if (gap >= 70) return { label: "High", cls: "high" };
	if (gap >= 50) return { label: "Elevated", cls: "med" };
	if (gap >= 30) return { label: "Watch", cls: "med" };
	return { label: "Low", cls: "low" };
}

export type Need = { need: string; pct: number; n: number };

export const NEEDS_BY_SUBURB: Record<string, Need[]> = {
	carlton: [
		{ need: "Social connection", pct: 38, n: 54 },
		{ need: "Food support", pct: 24, n: 34 },
		{ need: "Transport", pct: 16, n: 23 },
		{ need: "Wellbeing chat", pct: 14, n: 20 },
		{ need: "Health navigation", pct: 8, n: 11 },
	],
	fitzroy: [
		{ need: "Social connection", pct: 31, n: 30 },
		{ need: "Wellbeing chat", pct: 22, n: 21 },
		{ need: "Transport", pct: 18, n: 17 },
		{ need: "Food support", pct: 16, n: 16 },
		{ need: "Health navigation", pct: 13, n: 12 },
	],
};

export type MoodKey = "steady" | "reflective" | "concerned" | "distressed";
export type Mood = { key: MoodKey; label: string; pct: number; n: number; color: string; desc: string };

export const MOOD_PULSE: Mood[] = [
	{ key: "steady", label: "Steady", pct: 42, n: 276, color: "var(--sage)", desc: "Calm or content language; checking in for connection or activity." },
	{ key: "reflective", label: "Reflective", pct: 28, n: 184, color: "var(--gold)", desc: "Thoughtful or quiet language; some loneliness, no acute concern." },
	{ key: "concerned", label: "Concerned", pct: 22, n: 145, color: "var(--clay)", desc: "Worry, tiredness, isolation expressed — companion follows up gently." },
	{ key: "distressed", label: "Distressed", pct: 8, n: 52, color: "var(--rose)", desc: "Alarming or hopeless language — specialist handoff offered in-conversation." },
];

export type Specialist = { id: string; name: string; phone: string; desc: string; handoffs: number; delta: string };

export const SPECIALISTS: Specialist[] = [
	{ id: "lifeline", name: "Lifeline", phone: "13 11 14", desc: "Free, anytime, confidential. They'll listen — no pressure.", handoffs: 31, delta: "+8 vs prior" },
	{ id: "beyondblue", name: "Beyond Blue", phone: "1300 22 4636", desc: "Mental-health support, 24/7. Phone or web chat.", handoffs: 18, delta: "+3 vs prior" },
	{ id: "griefline", name: "Griefline", phone: "1300 845 745", desc: "Companion line for grief and loss. Daytime hours, free.", handoffs: 7, delta: "+2 vs prior" },
	{ id: "respect", name: "1800RESPECT", phone: "1800 737 732", desc: "Confidential support for family, domestic or sexual violence.", handoffs: 3, delta: "0" },
];

export type Phrase = { text: string; sent: MoodKey; n: number };

export const RECENT_PHRASES: Phrase[] = [
	{ text: "“The house has been so quiet since Bill passed.”", sent: "concerned", n: 12 },
	{ text: "“I'd love to walk with someone again.”", sent: "reflective", n: 18 },
	{ text: "“There's no one to share a meal with most evenings.”", sent: "concerned", n: 14 },
	{ text: "“I don't see the point of getting up some mornings.”", sent: "distressed", n: 6 },
	{ text: "“The bus is too far for me to manage now.”", sent: "concerned", n: 9 },
	{ text: "“I quite like a cup of tea with the volunteers.”", sent: "steady", n: 21 },
];
