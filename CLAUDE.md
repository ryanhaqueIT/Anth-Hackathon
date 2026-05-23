# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Neighbourhood Pulse** — hackathon build for the Melbourne Claude Impact Lab 2026. Two surfaces sharing one Fastify API:

- `src/components/resident/` — companion app for an older inner-Melbourne resident (persona: Margaret). Voice check-in → AI recommends 1–3 nearby support services.
- `src/components/dashboard/` — council-facing dashboard (mood pulse, heat map, suburb panels) over the same data.
- `server/` — Fastify API. `helping-out.ts` fetches and ranks services; `ai.ts` orchestrates the tool-using check-in flow.

Parent directory's `CLAUDE.md` carries the broader hackathon brief (vulnerable cohorts, ground-up resilience, judging cues). Don't duplicate it here.

## Stack

- pnpm (10.x) — package manager. Never run `npm` or `yarn` here; `package-lock.json` and `yarn.lock` are gitignored.
- React 19 + Vite 8 + Tailwind 4 (`@tailwindcss/vite` plugin, not PostCSS) + shadcn (style: `base-nova`, icons: lucide).
- Fastify 5 + Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`) + Zod 4. TypeScript via `tsx` (no separate build step for the server in dev).
- Biome 2.x for lint + format (replaces ESLint/Prettier).

## Commands

- `pnpm dev` — runs web (`:5173`) and API (`:3001`) concurrently via `concurrently`. Vite proxies `/api` → `:3001`.
- `pnpm check` — Biome lint + format + import-organise, write mode. Run this before declaring work done.
- `pnpm build` — `tsc -b && vite build`. Type errors fail the build.
- `pnpm start` — production server: Fastify serves `dist/` and the API on a single port (`PORT` env, default `3001`).

There is no test suite.

## Code style (enforced by Biome — see `biome.json`)

- **Tabs** for indentation, **double quotes** in JS/TS.
- Imports are auto-organised on `pnpm check`.
- Biome ignores `mockup/`, `dist/`, `pnpm-lock.yaml`.
- Path alias: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.app.json`). Use it for cross-folder imports inside `src/`.
- Server imports use `.js` extensions on relative paths (ESM + `tsx`), e.g. `import { ... } from "./ai.js"`.

## Copy and tone

All user-facing copy is **en-AU** ("neighbourhood", "organise", "recognise"). The companion voice is warm, plain, gentle, and never gives medical advice — distress cues route to Lifeline (13 11 14) / Beyond Blue (1300 22 4636). See `COMPANION_SYSTEM` in `server/ai.ts` for the canonical persona.

## Data

- Source: **City of Melbourne Open Data API** (`data.melbourne.vic.gov.au/api/explore/v2.1`).
- Primary dataset: **Helping Out** — free and low-cost support services with opening hours, transport, parking. Dataset id and endpoint live in `server/helping-out.ts`.
- Results are cached in-memory for 1 hour. Distances scored against a hard-coded Carlton centroid (`CARLTON_LAT/LON`); update both if you change the anchor.
- For additional datasets, prefer the parent dir's `datasets-melbourne.md` / `datasets-vic.md` indexes over fresh portal scraping.

## AI integration

- Provider: **OpenAI** via Vercel AI SDK (model from `OPENAI_MODEL`, default `gpt-4o-mini`). The hackathon is Claude-themed but this entry uses OpenAI — don't "fix" that without asking.
- Required env: `OPENAI_API_KEY` (see `.env.example`). `.env` is loaded via `dotenv.config({ override: true })` in `server/index.ts`.
- **Preserve the fallback path**: every AI entry point (`runCheckin`, `/api/chat`) must degrade gracefully when the key is missing — return a service search result, not a 500. See `fallbackSearch` in `server/ai.ts`.
- Tool-using flow: `runCheckin` calls `generateText` with a `find_local_services` tool (capped at 4 steps), then `generateObject` against `recommendationSchema` to pick the final 1–3 picks. Keep this two-stage shape — it's what gives the demo its grounded outputs.

## Adding UI components

Only `button.tsx` is currently vendored in `src/components/ui/`. For new shadcn components: `pnpm dlx shadcn@latest add <component>` — `components.json` is already configured (`base-nova`, neutral, CSS variables, lucide). Don't hand-roll equivalents.

## Repo conventions

- `mockup/` (if present) is scratch material — excluded from Biome and not shipped.
- `assets/` holds pitch artefacts (`.pptx`), not runtime assets — runtime assets go in `public/`.
- Only `pnpm-lock.yaml` is committed; other lockfiles are gitignored.
- `.claude/settings.local.json` is gitignored — safe for personal Claude Code settings.
