# Neighbourhood Pulse

A community wellbeing companion for the Anthropic Impact Lab. Built for older residents (65+) discovering nearby support, and for councils wanting privacy-safe visibility into connection gaps.

Build plan: [`docs/exec-plans/active/2026-05-23-neighbourhood-pulse-e2e-build.md`](./docs/exec-plans/active/2026-05-23-neighbourhood-pulse-e2e-build.md). Product context: [`docs/`](./docs/).

## Stack

One Express process at `:3000` serves the frontend at `/` and the API at `/api/*`.

- `frontend/` React 18 via CDN + in-browser Babel (no build step)
- `backend/` Express + better-sqlite3, schema in `backend/schema.sql`
- `mcp-server/` Cloudflare Worker MCP server for the voice companion

## Run

```bash
cd backend
npm install
npm start
```

Open <http://localhost:3000/>. First start auto-creates `backend/data.sqlite` and seeds 10 Melbourne suburbs, 8 categories, ~17 services, and ~23 mock check-ins so both views read non-empty.

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/health` | Health check |
| POST   | `/api/checkins` | Create check-in, classify need, return 1 to 3 scored recs |
| GET    | `/api/services` | List services. Optional `?suburb=&need_type=` |
| GET    | `/api/dashboard/areas` | Suburb-level aggregates for the council view |
| POST   | `/api/transcribe` | Multipart audio in, transcript out (ElevenLabs `scribe_v1`) |
| POST   | `/api/voice-agent/token` | Mints a short-lived WebRTC token for the jarvis agent |

Recommender weights (ERD §FR5): category match 40%, distance 25%, cost 20%, accessibility 15%.

## Voice

Two ElevenLabs paths share `ELEVENLABS_API_KEY`:

- **Check-in mic** records via `MediaRecorder`, posts to `/api/transcribe`, feeds the transcript into the classifier. Falls back to a canned transcript if the key is missing.
- **Floating bubble (jarvis)** is the embedded `@elevenlabs/convai-widget`, opening a live WebRTC session with agent `agent_0301ks9es4wzf9btvr4y7x7f7tf0`. Hidden on the council view.

Set the key in `backend/.env` (`cp backend/.env.example backend/.env`). Boot log confirms both paths.

## Smoke test

```bash
cd backend && npm start            # terminal 1
cd backend && npm run smoke        # terminal 2
```

## Demo

1. `cd backend && npm install && npm start`, open <http://localhost:3000/>.
2. Resident view loads as Margaret, 78, Carlton. Submit *"I feel lonely and want something nearby."*
3. Backend classifies the need as `social_connection` and returns the top 3 Carlton services with plain-language reasons.
4. Switch to *City of Melbourne · planner* for live suburb gap scores.

## Known limitations

- In-browser Babel transpile (slow first load, fine for demo).
- Rule-based keyword classifier (ERD §FR3 allows this for MVP).
- No auth (deferred per ERD §3) and no real map (suburb-string lookups only).
