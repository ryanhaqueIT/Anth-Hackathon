# 2026-05-23 — Neighbourhood Pulse e2e build

## Goal

Turn the existing JSX prototype into a runnable e2e MVP: resident submits a check-in via the existing UI, backend persists it and returns scored recommendations, council dashboard reads aggregated data from the same backend. Single command starts both backend (Express) and serves the frontend (static).

## Why this scope (from PRD + ERD)

The PRD says the MVP must prove "an older resident can ask for local help, receive relevant nearby support recommendations, and contribute anonymised wellbeing signals that help councils and providers understand community connection gaps." Everything else is explicitly out of scope (full voice AI, real-time escalation, medical diagnosis, full auth, payments).

The ERD's section 12 build plan lists five phases: Data setup → Resident interface → Matching engine → Dashboard → Pitch demo. Phases 1, 3, and 4 (data, matching, dashboard) are what's missing — phase 2 (resident interface) already exists as the JSX prototype.

## Architecture decision: preserve CDN-Babel frontend

`frontend/index.html` loads React 18.3, ReactDOM, and `@babel/standalone` from unpkg, then loads JSX components via `<script type="text/babel">`. Components communicate via `window.*` globals (no ES modules). This works without any bundler — open the HTML and it runs.

Migrating to Vite would require refactoring eight JSX files to remove `window.*` globals and add ES imports. At hackathon pace, the return on that work is poor. We **keep the frontend exactly as-is** and add only one new file (`api.js`) that registers `window.NPApi` for the components to call.

## Architecture decision: one Express process serves everything

The Express backend mounts the API at `/api/*` AND serves the existing `frontend/` folder as static files at `/`. One process, one port, no CORS, one `npm start` command.

## Phases

1. **Skeleton** — `backend/package.json`, `server.js`, `db.js`, `schema.sql`, `frontend/api.js`, and this plan doc.
2. **Schema + seed** — 8 SQLite tables (`areas`, `service_categories`, `support_services`, `need_types`, `residents`, `checkins`, `recommendations`, `area_insights`). Seed from `data.js`'s `SUBURBS` and `SERVICES`, plus need-type taxonomy from ERD §FR3.
3. **Routes + logic** — `POST /api/checkins`, `GET /api/services`, `GET /api/dashboard/areas`. Rule-based need classifier (keyword match, per ERD §FR3) and scored recommender (weights from ERD §FR5: category 40%, distance 25%, cost 20%, accessibility 15%).
4. **Frontend wiring** — `resident-app.jsx` calls `window.NPApi.submitCheckin()` on submit; `council-dashboard.jsx` calls `window.NPApi.getDashboard()` on mount with a try/catch fallback to the existing hardcoded `SUBURBS`/`SERVICES`.
5. **Run instructions** — Update `README.md` with the single-command start, demo URL, and demo script.
6. **Smoke test** — Start backend, hit `/api/health`, POST a check-in, GET the dashboard, verify shape and contents.

## Demo statements (what "done" means)

- Run `cd backend && npm install && npm start` succeeds.
- Open `http://localhost:3000/` and the resident view (Margaret, Carlton, 78) loads.
- Submit "I feel lonely and want something nearby" from the resident view.
- Backend classifies need_type = `social_connection`, finds Carlton services, scores them, returns top 3.
- Frontend renders the 3 recommendations with reasons.
- Switch to council view; dashboard shows suburb gap scores aggregated from real check-ins (plus seed data).

## Out of scope for this plan

- Migration to Vite/npm React (intentionally avoided per architecture decision above)
- Authentication / consent UI flow (ERD says "full authentication system: out of scope")
- Actual voice input (ERD says "voice complexity: MVP can simulate voice with text first")
- Map / geocoding (not in MVP must-haves; suburb-string lookups are sufficient)
