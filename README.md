# Neighbourhood Pulse

A community wellbeing companion for the Anthropic Impact Lab. Built for older residents (65+) discovering nearby support, and for councils wanting privacy-safe visibility into connection gaps.

Build plan: [`docs/exec-plans/active/2026-05-23-neighbourhood-pulse-e2e-build.md`](./docs/exec-plans/active/2026-05-23-neighbourhood-pulse-e2e-build.md). Product context: [`docs/`](./docs/).

## Stack

One Express process at `:3000` serves the frontend at `/` and the API at `/api/*`.

- `frontend/` React 18 via CDN + in-browser Babel (no build step)
- `backend/` Express + better-sqlite3, schema in `backend/schema.sql`
- `mcp-server/` Cloudflare Worker MCP server for the voice companion (scaffolded, not deployed)

## Run

```bash
cd backend
npm install
node --env-file=.env server.js          # or: npm start (after copying .env.example)
```

Open <http://localhost:3000/>. First start auto-creates `backend/data.sqlite` and seeds 10 Melbourne suburbs, 8 categories, ~17 services, and ~23 mock check-ins so both views read non-empty.

## End-to-end flow

```
                          ┌────────────────────────────────────────────────────┐
                          │   Margaret — 78, Carlton, opens localhost:3000     │
                          └─────────────┬──────────────────────────┬───────────┘
                                        │                          │
                       ┌────────────────┴────────┐    ┌────────────┴────────┐
                       │  RESIDENT input         │    │  COUNCIL view       │
                       │                         │    │                     │
                       │ ┌─────────┐ ┌─────────┐ │    │  on mount:          │
                       │ │ 4 mood  │ │ 🎤 mic  │ │    │  fetch('/api/       │
                       │ │ buttons │ │ button  │ │    │   dashboard/areas') │
                       │ └────┬────┘ └────┬────┘ │    └──────────┬──────────┘
                       └──────┼───────────┼──────┘               │
                              │           │                      │
                              │   POST /api/transcribe           │
                              │   (multipart audio)              │
                              │   ┌───────▼────────┐             │
                              │   │ ElevenLabs STT │             │
                              │   │ scribe_v1      │ ← needs     │
                              │   │ via SDK        │   key       │
                              │   └───────┬────────┘             │
                              │           │                      │
                              │      transcript                  │
                              └───────────┼──────────────────────┘
                                          │                      │
                              POST /api/checkins        GET /api/dashboard/areas
                              { suburb, mood,                    │
                                free_text, ... }                 │
                                          │                      │
                                          ▼                      ▼
              ┌───────────────────────────────────────────────────────────────────┐
              │                  Express server (backend/server.js)               │
              │                       Node 22 · port 3000                         │
              └────────────┬─────────────────────────────────┬────────────────────┘
                           │                                 │
                           ▼                                 ▼
   ┌───────────────────────────────────────┐     ┌────────────────────────────────┐
   │   routes/checkins.js                  │     │   routes/dashboard.js          │
   │                                       │     │                                │
   │   if (agent.isEnabled()):             │     │  • SELECT COUNT(*) per area    │
   │     ┌──────────────────────────────┐  │     │  • GROUP BY need_type_id       │
   │     │ AGENTIC LAYER                │  │     │  • compute gap_score live      │
   │     │ backend/agent.js             │  │     │  • specialists + phrases tbls  │
   │     │                              │  │     │  • mood_pulse aggregate        │
   │     │ Anthropic SDK ─────► Claude  │  │     │                                │
   │     │   model=claude-opus-4-7      │  │     │  Returns: { areas[], mood_pulse│
   │     │   thinking: adaptive         │  │     │            specialists, phrases│
   │     │   effort: low (≈4s, ~1.3k    │  │     │            meta }              │
   │     │            tokens in)        │  │     └────────────────┬───────────────┘
   │     │                              │  │                      │
   │     │ Returns:                     │  │                      │
   │     │   need_type                  │  │                      │
   │     │   distress.urgency           │  │                      │
   │     │   key_phrases[1-3]           │  │                      │
   │     │   warm_reply                 │  │                      │
   │     └───────────┬──────────────────┘  │                      │
   │                 │                     │                      │
   │   catch (AgentUnavailable):           │                      │
   │     fall back to classifier.js        │                      │
   │     (regex keyword match) +           │                      │
   │     templated warm_reply              │                      │
   │                 │                     │                      │
   │                 ▼                     │                      │
   │   DETERMINISTIC LAYER                 │                      │
   │   • INSERT INTO checkins              │                      │
   │     (+ agent_reply, key_phrases,      │                      │
   │      distress_detected, urgency)      │                      │
   │   • recommender.js → top-3 services   │                      │
   │     (40/25/20/15 weights from ERD)    │                      │
   │   • INSERT INTO recommendations       │                      │
   │                 │                     │                      │
   └─────────────────┼─────────────────────┘                      │
                     │                                            │
                     ▼                                            ▼
   ┌────────────────────────────────────────────────────────────────────────────┐
   │                  SQLite — backend/data.sqlite (WAL, FK on)                 │
   │                                                                            │
   │  areas (10) ── checkins (~50) ── need_types (8) ── support_services (16)   │
   │  service_categories (8) ── recommendations (~150) ── specialists ── phrases│
   └────────────────────────────────────────────────────────────────────────────┘
                     │                                            │
                     │     response JSON                          │     response JSON
                     ▼                                            ▼
   ┌───────────────────────────────────────┐     ┌────────────────────────────────┐
   │  Resident frontend                    │     │  Council frontend              │
   │  (frontend/components/                │     │  (frontend/components/         │
   │   resident-app.jsx)                   │     │   council-dashboard.jsx)       │
   │                                       │     │                                │
   │  • renders recs cards w/ scores       │     │  • mutates window.SUBURBS      │
   │  • renders "· live · social_         │     │    with gap_score/checkins     │
   │    connection" tag                    │     │  • re-renders heatmap polygons │
   │  • window.speechSynthesis.speak(      │     │  • side panel shows live       │
   │    warm_reply)  ← VOICE LOOP CLOSED   │     │    top needs + recommended     │
   │  • if distress.is_distressed:         │     │    action                      │
   │      setScreen('support')             │     │                                │
   │      → Lifeline 13 11 14              │     └────────────────────────────────┘
   └───────────────────────────────────────┘
```

## How it works

The architecture splits responsibilities the same way HappyRobot describes in their platform guide: an **agentic layer** (LLM reasoning, nuanced classification, distress detection, warm-reply composition) and a **deterministic layer** (SQL persistence, scored recommender, dashboard aggregates). The two layers talk through a single `POST /api/checkins` round-trip, and the council view talks to the deterministic layer alone through `GET /api/dashboard/areas`.

**The agentic layer (`backend/agent.js`).** A single Anthropic SDK call per check-in. Model is `claude-opus-4-7`, thinking mode is adaptive, `effort: low` keeps latency near the ERD §NFR3 sub-2-second target (in practice ≈4 s end-to-end). The system prompt (~1.3 K tokens) lays out the eight need-type buckets, the three distress urgency levels, the four specialist routing options (Lifeline / Beyond Blue / Griefline / 1800RESPECT), and voice constraints for the warm reply. The response is parsed as structured JSON, defensively normalised (invalid `need_type` → `general_support`, missing urgency → `low`), and persisted alongside the check-in. When `ANTHROPIC_API_KEY` is missing, `agent.isEnabled()` returns false, the route catches `AgentUnavailable`, and the regex classifier in `backend/classifier.js` runs with a templated warm reply instead — the system stays functional, just less nuanced.

**The deterministic layer (`backend/routes/{checkins,dashboard,services}.js`, `db.js`, `recommender.js`).** SQLite with foreign keys on and WAL journal mode. Schema migrations are idempotent (`PRAGMA table_info` then `ALTER TABLE ADD COLUMN` only if missing) so the four new agent columns (`agent_reply`, `key_phrases`, `distress_detected`, `distress_urgency`) retrofit cleanly. The recommender scores every service in the resident's area on category match (40 %), distance (25 %), cost (20 %), and accessibility (15 %) — exactly the weights ERD §FR5 specifies — and persists the top 3 with their reasons. The dashboard endpoint aggregates by area and across areas live; no caching, every page load is fresh.

**The voice loop.** Two STT entry points compete for the same `transcript` slot in the frontend's `submitToBackend`: ElevenLabs `scribe_v1` via `POST /api/transcribe` (production-grade, needs key), and the browser's `webkitSpeechRecognition` as a free fallback (used inside `ScreenListening` when the mic button is tapped). Once a transcript reaches the backend, Claude's `warm_reply` comes back and `window.speechSynthesis.speak()` reads it aloud through the browser. That's the closed loop: voice in → Claude → voice out, with no managed-platform account required.

## What's functional today

| Capability | Status | Requires |
|---|---|---|
| Frontend renders at `/` | ✅ live | nothing |
| Mood-button → check-in → recs → dashboard | ✅ live | nothing (regex fallback) |
| Claude classifies need + detects distress + composes warm reply | ✅ live | `ANTHROPIC_API_KEY` in `backend/.env` |
| `speechSynthesis` reads warm reply aloud | ✅ live | Chrome / Edge (Firefox skips silently) |
| Distress flow auto-routes to ScreenSupport (Lifeline) | ✅ live | `ANTHROPIC_API_KEY` (only Claude detects high-urgency distress) |
| Council heatmap with live gap scores | ✅ live | nothing |
| Council side panel (Carlton's top needs, mood pulse, recommended action) | ✅ live | nothing |
| SQLite persistence across restarts | ✅ live | nothing |
| Regex fallback when `ANTHROPIC_API_KEY` missing | ✅ live | nothing |
| ElevenLabs STT via `POST /api/transcribe` | ⚠️ degrades to 503 `no_api_key` | `ELEVENLABS_API_KEY` in `backend/.env` |
| ElevenLabs ConvAI floating bubble (jarvis agent) | ⚠️ widget loads but session can't open | `ELEVENLABS_API_KEY` for `/api/voice-agent/token` |
| KPI strip (657 / 4 / 8 % / 59 at the top of the dashboard) | ⚠️ hardcoded placeholder values | live-wiring lives on `feature/claude-agent-layer` branch |
| MCP server (`mcp-server/`) | ⚠️ scaffolded, not deployed | `wrangler deploy` |

So: **the mood-button path is fully functional end-to-end with just `ANTHROPIC_API_KEY`**. The voice path requires `ELEVENLABS_API_KEY` for accurate STT; without it the `MediaRecorder` upload still works but returns 503 and the frontend falls back to its canned transcript. Both keys live in `backend/.env` (gitignored) and the boot log prints which paths are enabled.

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/health` | Health check |
| POST   | `/api/checkins` | Create check-in, classify need, return 1–3 scored recs (now includes `warm_reply`, `distress`, `key_phrases`, `agent.source`) |
| GET    | `/api/services` | List services. Optional `?suburb=&need_type=` |
| GET    | `/api/dashboard/areas` | Suburb-level aggregates for the council view |
| POST   | `/api/transcribe` | Multipart audio in, transcript out (ElevenLabs `scribe_v1`). 503 when key missing. |
| POST   | `/api/voice-agent/token` | Mints a short-lived WebRTC token for the convai bubble |

Recommender weights (ERD §FR5): category match 40 %, distance 25 %, cost 20 %, accessibility 15 %.

## Configuration

Copy `backend/.env.example` to `backend/.env` and fill in the keys you have. The file is gitignored.

```bash
cp backend/.env.example backend/.env
# Edit and add the keys you want. Either or both can be omitted; the app
# degrades gracefully when a key is missing.
ANTHROPIC_API_KEY=sk-ant-...            # for Claude classification + warm replies
ELEVENLABS_API_KEY=...                  # for /api/transcribe and the convai bubble
```

Then start the server with the env file loaded:

```bash
node --env-file=.env server.js          # Node 22+
```

The boot banner prints which voice paths are enabled (`Voice STT: enabled` or `Voice STT: disabled — set ELEVENLABS_API_KEY in backend/.env`).

## Smoke test

```bash
cd backend && npm start            # terminal 1
cd backend && npm run smoke        # terminal 2
```

Exercises `/api/health`, `POST /api/checkins`, `GET /api/services`, and `GET /api/dashboard/areas`. Pass criterion: every endpoint 200, top-3 recommendations include a category match for `social_connection`, dashboard returns 10 areas with non-zero check-ins.

## Demo

1. `cd backend && npm install && node --env-file=.env server.js`, open <http://localhost:3000/>.
2. Resident view loads as Margaret, 78, Carlton. Tap *"A bit lonely today"*.
3. With `ANTHROPIC_API_KEY` set, the recs screen renders three cards plus a tiny *"· live · social_connection"* annotation under the headline — that's the proof the agentic path ran. The browser also reads Claude's warm reply aloud via `speechSynthesis`.
4. Without the key, the same recs render (regex fallback) with a templated warm reply; the *"live"* annotation does not appear.
5. Switch to *City of Melbourne · planner* and Carlton's heatmap polygon, side-panel check-in count, top-needs breakdown, and recommended action all reflect the check-ins you just submitted.

## Known limitations

- In-browser Babel transpile (slow first load, fine for demo).
- Voice paths require ElevenLabs key as documented above.
- Council dashboard's four KPI cards (657 / 4 / 8 % / 59) are still hardcoded placeholder values; live-wiring is on the `feature/claude-agent-layer` branch.
- MCP server scaffold in `mcp-server/` is not deployed (`wrangler deploy` to ship).
- No auth (deferred per ERD §3) and no real map (suburb-string lookups only).
- Rule-based keyword classifier remains as a fallback when Claude is unavailable; nuanced phrases ("haven't seen my daughter in three weeks") classify accurately only with `ANTHROPIC_API_KEY` set.
