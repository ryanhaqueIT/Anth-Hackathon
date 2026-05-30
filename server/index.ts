import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { type UIMessage, convertToModelMessages, streamText } from "ai";
import dotenv from "dotenv";
import Fastify from "fastify";
import { z } from "zod";
import { COMPANION_SYSTEM, chatProvider, runCheckin } from "./ai.js";
import { searchServices } from "./helping-out.js";

dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/api/health", async () => ({
	ok: true,
	anthropic: !!process.env.ANTHROPIC_API_KEY,
}));

const servicesQuery = z.object({
	keywords: z.string().optional(),
	suburb: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(20).default(8),
});

app.get("/api/services", async (req) => {
	const q = servicesQuery.parse(req.query);
	const matches = await searchServices(q);
	return { results: matches };
});

const checkinBody = z.object({
	suburb: z.string().default("Carlton"),
	age_band: z.string().default("65+"),
	mood: z.string(),
	free_text: z.string().min(1),
});

app.post("/api/checkin", async (req, reply) => {
	const body = checkinBody.parse(req.body);
	try {
		return await runCheckin(body);
	} catch (err) {
		req.log.error({ err }, "checkin failed");
		reply.code(500);
		return { error: err instanceof Error ? err.message : "unknown error" };
	}
});

const chatBody = z.object({
	messages: z.array(z.any()),
});

app.post("/api/chat", async (req, reply) => {
	const model = chatProvider();
	if (!model) {
		reply.code(503);
		return { error: "ANTHROPIC_API_KEY not set" };
	}
	const { messages } = chatBody.parse(req.body);
	const result = streamText({
		model,
		system: COMPANION_SYSTEM,
		messages: convertToModelMessages(messages as UIMessage[]),
	});
	const response = result.toUIMessageStreamResponse();
	reply.hijack();
	const raw = reply.raw;
	raw.statusCode = response.status;
	response.headers.forEach((v, k) => raw.setHeader(k, v));
	if (!response.body) {
		raw.end();
		return;
	}
	const reader = response.body.getReader();
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		raw.write(value);
	}
	raw.end();
});

if (isProd) {
	await app.register(fastifyStatic, {
		root: path.resolve(__dirname, "../dist"),
	});
	app.setNotFoundHandler((_req, reply) => {
		reply.sendFile("index.html");
	});
}

const port = Number(process.env.PORT ?? 3001);
await app.listen({ port, host: "0.0.0.0" });
