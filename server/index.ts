import path from "node:path";
import { fileURLToPath } from "node:url";
import { anthropic } from "@ai-sdk/anthropic";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { streamText } from "ai";
import Fastify from "fastify";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

const chatSchema = z.object({
	messages: z.array(
		z.object({
			role: z.enum(["user", "assistant", "system"]),
			content: z.string(),
		}),
	),
});

app.get("/api/health", async () => ({ ok: true }));

app.post("/api/chat", async (request, reply) => {
	const { messages } = chatSchema.parse(request.body);

	const result = streamText({
		model: anthropic("claude-sonnet-4-6"),
		messages,
	});

	reply.raw.setHeader("Content-Type", "text/plain; charset=utf-8");
	reply.raw.setHeader("Cache-Control", "no-cache");
	for await (const chunk of result.textStream) {
		reply.raw.write(chunk);
	}
	reply.raw.end();
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
