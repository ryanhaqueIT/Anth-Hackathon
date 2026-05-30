import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject, generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { type ServiceMatch, searchServices } from "./helping-out.js";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";

function provider() {
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) return null;
	return createAnthropic({ apiKey });
}

const recommendationSchema = z.object({
	headline: z.string().describe("One short, warm sentence acknowledging what the resident said."),
	recommendations: z
		.array(
			z.object({
				name: z.string().describe("Exact service name from the search results."),
				why: z.string().describe("One specific sentence on why this fits, in warm everyday language."),
			}),
		)
		.min(1)
		.max(3),
});

export type CheckinInput = {
	suburb: string;
	mood: string;
	free_text: string;
	age_band: string;
};

export type CheckinResult = {
	headline: string;
	source: "anthropic" | "fallback";
	recommendations: Array<ServiceMatch & { why: string }>;
	fallback_reason?: string;
};

async function fallbackSearch(input: CheckinInput, reason: string): Promise<CheckinResult> {
	const matches = await searchServices({ keywords: input.free_text, suburb: input.suburb, limit: 3 });
	return {
		source: "fallback",
		headline: "Here are a few nearby options that might suit today.",
		fallback_reason: reason,
		recommendations: matches.map((s) => ({ ...s, why: "Nearby free or low-cost support service." })),
	};
}

const SYSTEM = `You are a calm, kind companion for older residents of inner Melbourne.
Your job: hear the resident's check-in, then pick 1-3 nearby free or low-cost services
from the City of Melbourne Helping Out dataset that best match what they need today.

You MUST call the find_local_services tool one or two times to look things up.
Search by mood-relevant keywords (e.g. "social companionship", "meal food", "walk exercise",
"counselling", "transport", "health"), not the resident's exact words.

Tone: warm, plain, gentle. No clinical jargon. Speak in en-AU.`;

export async function runCheckin(input: CheckinInput): Promise<CheckinResult> {
	const p = provider();
	if (!p) return fallbackSearch(input, "ANTHROPIC_API_KEY not set");

	const seen = new Map<string, ServiceMatch>();
	const findTool = tool({
		description: "Search the City of Melbourne Helping Out dataset for nearby free or low-cost support services.",
		inputSchema: z.object({
			keywords: z.string().describe("Two or three search keywords matching the resident's need."),
			max_results: z.number().int().min(1).max(8).default(5),
		}),
		execute: async ({ keywords, max_results }) => {
			const matches = await searchServices({ keywords, suburb: input.suburb, limit: max_results });
			for (const m of matches) seen.set(m.name, m);
			return matches.map((m) => ({
				name: m.name,
				suburb: m.suburb,
				what: m.what.slice(0, 240),
				categories: m.categories,
				distance_km: m.distance_km,
				cost: m.cost,
			}));
		},
	});

	const userMessage = `Resident in ${input.suburb} (${input.age_band}) said: "${input.free_text}". Mood signal: ${input.mood}. Find what would suit them today.`;

	try {
		await generateText({
			model: p(MODEL),
			system: SYSTEM,
			prompt: userMessage,
			tools: { find_local_services: findTool },
			stopWhen: stepCountIs(4),
		});

		const candidates = Array.from(seen.values()).slice(0, 12);
		if (candidates.length === 0) {
			return {
				source: "anthropic",
				headline: "I couldn't find a perfect match nearby today, but I'll keep listening.",
				recommendations: [],
			};
		}

		const { object } = await generateObject({
			model: p(MODEL),
			schema: recommendationSchema,
			system: "Choose the 1-3 services that best fit. Use the exact `name` strings from the candidates. Warm en-AU tone.",
			prompt: `Resident said: "${input.free_text}" (mood: ${input.mood}).\n\nCandidates:\n${candidates
				.map((c) => `- ${c.name} (${c.suburb}, ${c.distance_km ?? "?"}km) — ${c.categories.join(", ")} — ${c.what.slice(0, 160)}`)
				.join("\n")}`,
		});

		const byName = new Map(candidates.map((c) => [c.name, c]));
		const picks = object.recommendations
			.map((r) => {
				const match = byName.get(r.name);
				if (!match) return null;
				return { ...match, why: r.why };
			})
			.filter((x): x is ServiceMatch & { why: string } => !!x);

		return { source: "anthropic", headline: object.headline, recommendations: picks };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Anthropic call failed";
		return fallbackSearch(input, message);
	}
}

export function chatProvider() {
	const p = provider();
	return p ? p(MODEL) : null;
}

export const COMPANION_SYSTEM = `You are a calm, warm companion talking with an older Melbourne resident named Margaret.
Reply in short, gentle paragraphs (2-4 sentences). Never give medical advice.
If she sounds in real distress, tell her you're glad she said it, and gently suggest she call Lifeline on 13 11 14 or Beyond Blue on 1300 22 4636. Use en-AU.`;
