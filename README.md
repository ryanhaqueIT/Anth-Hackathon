# Neighbourhood Pulse

A community wellbeing companion + insight platform for the Anthropic hackathon. Built for older residents (65+) who want to discover nearby support, and for councils/providers who want privacy-safe aggregated visibility into community connection gaps.

The build plan for this end-to-end implementation lives in [`docs/exec-plans/active/2026-05-23-neighbourhood-pulse-e2e-build.md`](./docs/exec-plans/active/2026-05-23-neighbourhood-pulse-e2e-build.md). Product context and design notes live under [`docs/`](./docs/).

## Architecture

| Layer        | Lives in                              | Stack                                                  |
|--------------|---------------------------------------|--------------------------------------------------------|
| Frontend     | `frontend/`                           | React 18 via CDN + in-browser Babel (no build step)    |
| Backend API  | `backend/`                            | Express + better-sqlite3 (Node.js)                     |
| Database     | `backend/data.sqlite` (auto-created)  | SQLite — schema in `backend/schema.sql`                |
| Static serve | One Express process at `:3000`        | Serves the frontend at `/` and the API at `/api/*`     |

One process, one port, no CORS to wrangle.

## Run it

```bash
cd backend
npm install
npm start
```

Then open <http://localhost:3000/>.

The first start auto-creates `backend/data.sqlite` and seeds it with:
- 10 Melbourne suburbs (Carlton, North Melbourne, Fitzroy, Collingwood, Brunswick, Richmond, East Melbourne, Parkville, South Yarra, Docklands)
- 8 service categories (social, food, transport, health, wellbeing, financial, safety, general)
- 8 rule-based need types (with keyword maps used by the classifier)
- ~17 sample support services (the three the resident UI already references + ~14 more so other suburbs aren't empty)
- ~23 mock check-ins distributed by area weight, so the council dashboard reads non-empty on first load

## API

| Method | Path                       | Purpose                                                                 |
|--------|----------------------------|-------------------------------------------------------------------------|
| GET    | `/api/health`              | Health check.                                                           |
| POST   | `/api/checkins`            | Create a check-in. Classifies need, returns 1–3 scored recs.            |
| GET    | `/api/services`            | List support services. Optional `?suburb=&need_type=`.                  |
| GET    | `/api/dashboard/areas`     | Aggregated suburb-level insights for the council view.                  |
| POST   | `/api/transcribe`          | Multipart audio in (`audio` field), JSON `{ text, language, … }` out. ElevenLabs scribe_v1. |

### POST /api/checkins

Request body:
```json
{
  "suburb": "Carlton",
  "age_band": "65+",
  "mood": "concerned",
  "free_text": "I feel lonely and want something nearby this afternoon",
  "consent": true,
  "input_channel": "text",
  "accessibility": ["wheelchair"]
}
```

Response:
```json
{
  "checkin_id": "…",
  "area": { "id": "carlton", "name": "Carlton", "postcode": "3053" },
  "need_type": "social_connection",
  "recommendations": [
    {
      "position": 1,
      "service": { "name": "Wednesday Community Lunch", "distance_km": 0.9, "cost": "Free", "...": "…" },
      "score": 0.842,
      "reason": "This is matches what you said you need, 900 m away, free."
    }
  ]
}
```

## Voice input (ElevenLabs STT)

The mic button in the resident view records via `MediaRecorder`, posts the audio to `POST /api/transcribe`, and feeds the returned text into the existing check-in classifier.

1. Get an API key from <https://elevenlabs.io/app/settings/api-keys>.
2. `cp backend/.env.example backend/.env` and paste the key into `ELEVENLABS_API_KEY=`.
3. Restart `npm start`. The boot log should read `Voice STT: enabled (ElevenLabs scribe_v1)`.
4. Open the resident view, tap the mic, speak, then tap *"Tap when you're done"*. The recorded blob is sent to ElevenLabs (`scribe_v1` model) and the transcript drives recommendations.

If the key is missing, the server returns 503 from `/api/transcribe` and the screen falls back to the canned demo transcript so the flow still works offline.

Browser requirements: `getUserMedia` + `MediaRecorder` (every current Chrome/Edge/Firefox/Safari). Localhost is treated as a secure origin, so the mic prompt fires without HTTPS.

## Smoke test

```bash
# in one terminal
cd backend && npm start

# in another terminal
cd backend && npm run smoke
```

The smoke script exercises `/api/health`, `POST /api/checkins`, `GET /api/services`, and `GET /api/dashboard/areas`, and prints a summary.

## Demo flow

1. Run `cd backend && npm install && npm start`.
2. Open <http://localhost:3000/> — the resident view loads (Margaret · 78, Carlton).
3. Submit a check-in like *"I feel lonely and want something nearby."*
4. The backend classifies the need as `social_connection`, finds nearby Carlton services, scores them by category match (40%), distance (25%), cost (20%), and accessibility (15%), and returns the top 3 with plain-language reasons.
5. Click *"City of Melbourne · planner"* to switch perspectives. The dashboard shows suburb gap scores computed live from check-ins + service supply.

## Repository layout

```
Anth-Hackathon/
├── README.md                              this file
├── AGENTS.md / CLAUDE.md                  agent governance ("validate.sh must exit 0 before commit")
├── .github/copilot-instructions.md        same rules, framed for Copilot
├── PRD.docx                               product spec
├── ERD.docx                               engineering requirements (final version)
├── backend/                               Express + SQLite API
│   ├── server.js                          one process, serves frontend + API
│   ├── db.js                              SQLite init + seed-on-empty
│   ├── schema.sql                         8 tables per ERD §10
│   ├── seed.js                            categories, need types, suburbs, services, mock check-ins
│   ├── classifier.js                      rule-based need classifier (ERD §FR3)
│   ├── recommender.js                     scored recommender (ERD §FR5 weights)
│   ├── routes/                            checkins.js, services.js, dashboard.js
│   ├── smoke.js                           end-to-end smoke test
│   └── package.json
├── frontend/                              resident + council UI (CDN React + Babel)
│   ├── index.html
│   ├── styles.css
│   ├── api.js                             window.NPApi.* — fetch wrapper to /api
│   └── components/                        8 JSX files (app-shell, resident-app, council-dashboard, …)
├── mcp-server/                            Cloudflare Worker MCP server (voice companion)
│   ├── src/server.ts                      GroundupMCP — McpAgent on Workers
│   ├── src/tools/                         seven elder-companion tools
│   └── wrangler.jsonc
├── scripts/                               harness validation gates (validate.sh entry)
├── .claude/                               hooks, slash commands, permissions
├── .harness/                              feature_list.json, ratchet baseline
├── docs/
│   ├── exec-plans/active/                 live ExecPlans (this build is the only one)
│   ├── exec-plans/tech-debt-tracker.md
│   ├── design-docs/core-beliefs.md
│   ├── QUALITY_SCORE.md / SECURITY.md / RELIABILITY.md / DESIGN.md / FRONTEND.md / PRODUCT_SENSE.md
│   └── product-specs/                     (empty — add specs here)
└── agents/                                planner, reviewer, entropy-cleaner, …
```

## Known limitations

- **Frontend uses in-browser Babel** transpilation. Slow on first page load; perfectly fine for hackathon demo. A future commit could migrate to Vite, but that requires refactoring eight JSX files to remove `window.*` globals.
- **Voice input** now uses the browser's `MediaRecorder` + ElevenLabs `scribe_v1` STT via `POST /api/transcribe`. The canned transcript remains as a graceful fallback when `ELEVENLABS_API_KEY` is unset, the user denies the mic, or the recording is empty.
- **No authentication.** The ERD §3 explicitly defers a full auth system to a future phase.
- **The need classifier is rule-based keyword matching.** ERD §FR3 says this is acceptable for MVP; "AI classification can be simulated or added later."
- **No real map** — suburb-string lookups suffice for the MVP. Lat/lon are seeded for areas in case a future commit wires Leaflet.
