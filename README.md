# Neighbourhood Pulse

Hyper-localised resident companion + council insights dashboard for 2026 Claude Impact Lab in Melbourne.

Built in 8 hours to support older Melburnian at risk of loneliness and isolation.

Resident Companion app: Low-friction prompts and one-tap check-ins keep it accessible. Further interaction is optional. Voice mode and a small set of tools let the companion go deeper when someone wants to talk.

Council Insights app: An aggregate view - 'mood pulse', heat map, and suburb panels - showing where residents are doing it tough. Tap into any suburb for a closer read of what's driving the signal.

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
