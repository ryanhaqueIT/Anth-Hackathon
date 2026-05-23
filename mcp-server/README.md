# @groundup/mcp

MCP server for Groundup, the voice-first AI companion for older Melbourne residents. Runs on Cloudflare Workers using the `agents` SDK (`McpAgent`) with Streamable HTTP transport at `/mcp`.

## What this is

The web app (`apps/web`) talks to Claude via the Vercel AI SDK. When Claude needs to do something in the world (record a check-in, look up a service, page a human, surface a crisis number) it calls a tool on this server. The dashboard (`apps/dashboard`) reads the same Postgres via the `db` package for aggregated, anonymised reporting.

This server is the only place where actions are taken on behalf of a user. It is designed to be called by trusted backends or LLM clients with an opaque `user_id` and the smallest geographic grain (suburb or LGA). It must never receive names, addresses, dates of birth, Medicare numbers, or any other re-identifying data.

## Dev

```
pnpm dev       # wrangler dev on the local Worker
pnpm typecheck
pnpm deploy    # wrangler deploy
```

The server is mounted at `/mcp`. Point an MCP client (or the web app) at `http://127.0.0.1:8787/mcp` in dev.

## Bindings and env vars

Configured in `wrangler.jsonc`:

- `GroundupMCP` — Durable Object binding for the `McpAgent` session
- `HYPERDRIVE` — Hyperdrive connection to the shared Postgres. The `id` in `wrangler.jsonc` is a placeholder. Create the resource with `wrangler hyperdrive create` and paste the id in
- `ENVIRONMENT` — `development` or `production`

## Tools

| Name | Purpose |
| --- | --- |
| `check_in_record` | Log a wellbeing check-in and flag whether a follow-up is suggested |
| `find_aged_services` | Lookup aged-care and senior services by suburb or LGA, optional service type |
| `find_community_event` | Local events and social groups |
| `flag_distress` | Raise a triage signal. Critical severity also returns emergency contacts |
| `request_specialist_handoff` | Connect to a nurse, social worker, interpreter, GP, or community worker |
| `lookup_transport` | PTV and community transport options, mobility-aware |
| `get_emergency_contact` | Australian emergency and crisis numbers for a given category, plus TIS for translation |

All handlers currently return realistic stub payloads marked with `_stub: true`. Wire-up to Postgres happens through `src/db.ts` once `HYPERDRIVE` is set.

## Anonymity by design

See the comment block at the top of `src/server.ts`. Tool inputs accept `user_id` (opaque) and `suburb`/`lga` only. Free-text fields are passed through for triage but must never be joined back to identity in the database.
