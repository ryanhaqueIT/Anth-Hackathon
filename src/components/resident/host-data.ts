export const HOST_TOPICS = [
	{ id: "bake", swatch: "var(--clay)", label: "Cook or bake", eg: "sourdough, scones, polenta cake" },
	{ id: "garden", swatch: "var(--sage)", label: "Garden or grow", eg: "herbs, seedlings, balcony pots" },
	{ id: "tea", swatch: "var(--gold)", label: "Tea & a chat", eg: "an hour at the library, just talking" },
	{ id: "walk", swatch: "oklch(0.60 0.08 200)", label: "Walk together", eg: "a gentle loop around Princes Park" },
	{ id: "language", swatch: "oklch(0.60 0.12 290)", label: "Share a language", eg: "Italian conversation, beginners welcome" },
	{ id: "music", swatch: "oklch(0.62 0.10 340)", label: "Music or singing", eg: "piano, a small choir, listening together" },
	{ id: "stories", swatch: "oklch(0.55 0.05 50)", label: "Tell stories", eg: "memories, family, the old neighbourhood" },
	{ id: "other", swatch: "var(--ink-3)", label: "Something else", eg: "tell me in your own words" },
] as const;

export const HOST_VENUES = [
	{ id: "home", label: "Your kitchen", desc: "Small, 2–3 people" },
	{ id: "library", label: "Carlton Library · kitchen", desc: "Up to 6 · book ahead" },
	{ id: "community", label: "Drummond St community room", desc: "Up to 12 · accessible" },
	{ id: "park", label: "Princes Park · picnic spot", desc: "Outdoor · fine-weather" },
] as const;

export const HOST_TIMES = [
	{ id: "sat", label: "This Saturday", detail: "15 Jun · 10:00–12:00" },
	{ id: "tue", label: "Next Tuesday", detail: "18 Jun · 14:00–16:00" },
	{ id: "pick", label: "Help me pick a date", detail: "I'll talk you through it" },
] as const;

export const HOST_SIZES = [
	{ id: "small", label: "2–3 people", detail: "Cosy · easy to host" },
	{ id: "med", label: "4–6 people", detail: "A nice small group" },
	{ id: "open", label: "Up to 10", detail: "Open to neighbours" },
] as const;

export const SPECIALISTS = [
	{ id: "lifeline", name: "Lifeline", phone: "13 11 14", desc: "Free, anytime, confidential. They'll listen — no pressure." },
	{ id: "beyondblue", name: "Beyond Blue", phone: "1300 22 4636", desc: "Mental-health support, 24/7. Phone or web chat." },
	{ id: "griefline", name: "Griefline", phone: "1300 845 745", desc: "Companion line for grief and loss. Daytime hours, free." },
] as const;

export type Specialist = (typeof SPECIALISTS)[number];
