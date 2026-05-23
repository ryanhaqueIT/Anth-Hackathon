import { GroundupMCP } from "./server";

export { GroundupMCP };

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      return Promise.resolve(
        new Response(
          JSON.stringify({ ok: true, service: "groundup-mcp" }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }

    if (url.pathname.startsWith("/mcp")) {
      return GroundupMCP.serve("/mcp", { binding: "GroundupMCP" }).fetch(
        request,
        env,
        ctx,
      );
    }

    return Promise.resolve(new Response("Not found", { status: 404 }));
  },
} satisfies ExportedHandler<Env>;
