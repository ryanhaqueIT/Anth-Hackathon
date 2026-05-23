# Neighbourhood Pulse

Resident companion + council insights dashboard.

## Setup

```sh
pnpm install
cp .env.example .env   # set OPENAI_API_KEY
pnpm dev
```

Web on `:5173`, API on `:3001`.

## Structure

- `src/components/resident/` — companion app
- `src/components/dashboard/` — council dashboard
- `server/` — Fastify API
