import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true }));

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
