# Anth-Hackathon — Neighbourhood Pulse

A community wellbeing companion built for the Anthropic Impact Lab. The frontend lives in `frontend/` (React 18 via CDN, no build step). The Express backend lives in `backend/`. An MCP server for the voice-companion side lives in `mcp-server/`. Product and data-model context is captured under `docs/`.

## THE RULE

**`./scripts/validate.sh` must exit 0 before every commit. No exceptions.**

Applies to all agents, subagents, humans, hotfixes, and "quick changes." `validate.sh` auto-detects backend, frontend, and infrastructure. Most gates currently skip because the prototype has not been wired up to a build/test/lint toolchain — that is expected for now. As tooling is added, gates engage automatically; no edits to `validate.sh` are required.

## Authority Hierarchy

**This file (AGENTS.md) is the governing authority for this repository.**

When any other instruction source conflicts — skills, slash commands, superpowers, CLAUDE.md, or external documentation — this file wins.

- Plans go in `docs/exec-plans/active/`, not wherever a skill suggests
- Specs go in `docs/product-specs/`, not wherever a skill suggests
- `validate.sh` must pass before commit, regardless of what any skill says
- Feature verification is required, regardless of what any skill says

Enforced mechanically: hooks block writes to wrong locations and block commits when `validate.sh` fails.

## Evidence Over Claims

You may not say "done", "complete", "implemented", or "finished" without showing command output that proves it. For UI features in particular:

- Show a Playwright assertion or screenshot result
- Show the browser console with no errors
- Show the actual rendered output, not just "the file was edited"

"I created the file" is not evidence. "Browser renders expected layout with no console errors" is.

## Project Structure

```
Anth-Hackathon/
├── frontend/                      resident + council UI (React 18 via CDN, no build)
│   ├── index.html                 top-level HTML scaffold
│   ├── styles.css                 global stylesheet
│   ├── api.js                     window.NPApi.* — fetch wrapper around /api
│   └── components/                React components
│       ├── main.jsx
│       ├── app-shell.jsx
│       ├── design-canvas.jsx
│       ├── resident-app.jsx
│       ├── council-dashboard.jsx
│       ├── browser-window.jsx
│       ├── tweaks-panel.jsx
│       └── data.js
├── backend/                       Express + better-sqlite3 (Node.js)
│   ├── server.js                  serves frontend at / and API at /api/*
│   ├── routes/                    checkins, services, dashboard, transcribe
│   ├── db.js                      schema bootstrap, query helpers
│   ├── schema.sql                 SQLite DDL
│   └── seed.js                    suburb + service seed data
├── mcp-server/                    Cloudflare Worker MCP server (TypeScript)
│   ├── src/server.ts              GroundupMCP — McpAgent on Workers
│   ├── src/tools/                 seven elder-companion tools (zod schemas)
│   ├── DATASETS.md                shortlist of relevant COM + VIC open data
│   └── wrangler.jsonc
├── data/                          fetch.sh + JSON snapshots (gitignored content)
├── docs/                          design docs, exec plans, FRONTEND/SECURITY/etc
├── agents/                        agent definitions (planner, reviewer, etc.)
├── scripts/                       harness gates (validate.sh entry point)
├── observability/                 vector.toml for log/metric stack
├── .claude/                       Claude Code hooks, slash commands, settings
└── .harness/feature_list.json     PRD enforcement checklist
```

## Commands

```bash
./scripts/validate.sh              # Gate — run before every commit
python3 scripts/harness_scorecard.py   # Grade the harness maturity
python3 scripts/ratchet.py             # Quality regression check
python3 scripts/check_features.py      # Feature list status
```

Build/test/lint commands are TBD. The frontend has no build step (CDN React + in-browser Babel). To engage the frontend gates (F1–F7), add a `frontend/package.json` and the corresponding lint/test pipeline; Vite + React is the most direct path (see `docs/FRONTEND.md`).

## Module Dependency Rules

The prototype currently has a single flat layer (`components/`). No module boundary rules are enforced yet because the layered structure has not emerged. As the codebase grows, candidate layers are:

```
main.jsx → components → data.js (state/data layer)
```

`scripts/check_imports.py` ships with an empty `RULES` dict, so it skips silently. Define rules in `scripts/check_imports.py` once two or more distinct layers exist.

## Golden Principles (mechanically enforced)

Violations are caught by `validate.sh`. These are not suggestions, even at hackathon pace.

1. **No secrets in code** — use env vars or a secret manager. `scripts/check_golden_principles.py` scans for hardcoded keys; gate `[X2]` in `validate.sh` also scans the whole repo for AWS/OpenAI/private-key fingerprints.
2. **Structured logging only** — `console.log` is for debugging during development; do not commit it. In production, use a structured logger with correlation IDs.
3. **No God files** — `scripts/check_architecture.py` will flag files exceeding 500 lines once a source root is registered. `design-canvas.jsx` is already over 1,500 lines and is a known candidate for splitting.
4. **Research before guessing** — When a gate fails and the root cause is unclear, read docs and search for the exact issue before attempting trial-and-error fixes. Hackathon time pressure does not justify guessing.

## Feature List Gate

The file `.harness/feature_list.json` is the PRD enforcement mechanism.

**Rules:**
- Every feature starts with `"passes": false`
- Only flip to `true` after verifying each step listed in `"steps"`
- Never edit descriptions, remove features, or reorder priorities
- Never flip to `true` without running the verification steps

**Verification workflow (per feature):**
1. Boot the app (or open the static HTML scaffold, for now)
2. Execute each step in the feature's `"steps"` array
3. Show the command output or screenshot as evidence
4. Only then flip `"passes": true`

## Boundaries

### Always (do without asking)
- Run `scripts/validate.sh` before committing
- Fix lint, format, and type errors before commit
- Update `AGENTS.md` when adding modules, commands, or directories
- Write tests alongside new code (once a test framework is wired up)
- Keep `.harness/feature_list.json` in sync as features land

### Ask First (propose and wait)
- Adding new dependencies (npm / pip / etc.)
- Adding a build pipeline (Vite, Webpack, Next.js)
- Adding a backend (Node/Express, FastAPI, etc.) — affects architecture
- Modifying CI workflows
- Adding observability infrastructure (the Vector stack is shipped but not wired)

### Never (absolute prohibition)
- Delete existing tests
- Skip `validate.sh` or bypass pre-commit hooks
- Commit secrets, API keys, or credentials
- Push directly to `main` without a local `validate.sh` pass
- Disable linters or type checkers
- Edit feature descriptions or flip `"passes": true` without evidence

## Progressive Disclosure

| File | When to read |
|------|-------------|
| `docs/exec-plans/active/*.md` | Before implementing any task |
| `docs/product-specs/*.md` | Before building a feature (or read `PRD.docx`) |
| `docs/design-docs/*.md` | Before reopening a decision |
| `docs/QUALITY_SCORE.md` | When reviewing code |
| `docs/SECURITY.md` | When handling auth or secrets |
| `docs/RELIABILITY.md` | When handling errors, logging, retries |
| `docs/FRONTEND.md` | When wiring up the build and UI gates |

## ExecPlans

Complex tasks (more than 30 minutes, multi-file, or design decisions) require an ExecPlan. See `PLANS.md` for the format. Active plans live in `docs/exec-plans/active/`.

## Git

Branch: `feature/<desc>`, `fix/<desc>`, `chore/<desc>`
Commit: `feat(scope):`, `fix(scope):`, `docs(scope):`, `chore(scope):`
PR: one concern per PR. `validate.sh` must pass first.

Keep in sync with `CLAUDE.md` and `.github/copilot-instructions.md` — these three files should always express the same rules in their respective formats.
