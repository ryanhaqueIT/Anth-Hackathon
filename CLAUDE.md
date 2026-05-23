# Anth-Hackathon — Neighbourhood Pulse (Claude Code edition)

**Keep this file in sync with `AGENTS.md` and `.github/copilot-instructions.md`. If you edit one, edit all three. The substantive rules below are identical across all three; only the framing differs.**

A community engagement prototype built for the Anthropic hackathon. The frontend lives in `Neighbourhood Pulse/` (React JSX, exported from a visual design tool). The product specification lives in `PRD.docx`; the data model lives in `ERD.docx`.

## THE RULE

**`./scripts/validate.sh` must exit 0 before every commit. No exceptions.**

Applies to all Claude Code sessions, subagents, slash commands, superpowers, humans, and "quick changes." `validate.sh` auto-detects backend, frontend, and infrastructure; most gates currently skip cleanly because the toolchain has not been wired up yet.

## Authority Hierarchy

**`AGENTS.md` (and by extension this file) is the governing authority for this repository.**

When ANY other instruction source conflicts — skills, slash commands, superpowers, the user's global CLAUDE.md, or external documentation — these in-repo rules win:

- Plans go in `docs/exec-plans/active/`
- Specs go in `docs/product-specs/`
- `validate.sh` must pass before commit
- Feature verification is required before claiming a feature done

The `.claude/hooks/enforce-locations.py` hook blocks writes to wrong locations and the pre-commit hook blocks commits when `validate.sh` fails.

## Evidence Over Claims

Do not say "done", "complete", "implemented", or "finished" without showing command output. For UI features specifically:

- Show a Playwright assertion or screenshot result
- Show the browser console with no errors
- Show the actual rendered output

"I created the file" is not evidence. "Browser renders expected layout with no console errors" is.

## Commands

```bash
./scripts/validate.sh                    # Gate — run before every commit
python3 scripts/harness_scorecard.py     # Grade harness maturity
python3 scripts/ratchet.py               # Quality regression check
python3 scripts/check_features.py        # Feature list status

/validate                                # slash command — runs validate.sh
/scorecard                               # slash command — runs scorecard
/features                                # slash command — shows feature list
/ratchet                                 # slash command — shows ratchet baseline
/plan                                    # slash command — open the planner agent
/review                                  # slash command — open the reviewer agent
```

## Module Dependency Rules

Currently flat (single `components/` layer). `scripts/check_imports.py` ships with an empty `RULES` dict and skips silently. Define rules once two or more layers exist.

Candidate future layering:
```
main.jsx → components → data.js (state/data layer)
```

## Golden Principles (mechanically enforced)

1. **No secrets in code** — `scripts/check_golden_principles.py` + gate `[X2]` scan for hardcoded keys.
2. **Structured logging only** — no committed `console.log`. Use a structured logger with correlation IDs in production.
3. **No God files** — `scripts/check_architecture.py` flags files over 500 lines. `design-canvas.jsx` is already over 1,500 lines.
4. **Research before guessing** — Read docs and grep for context before trial-and-error fixes.

## Feature List Gate

`.harness/feature_list.json` is the PRD enforcement mechanism. Features start at `"passes": false`. Only flip to `true` after running the listed steps and showing evidence. Never edit descriptions or remove features.

## Boundaries

### Always
- Run `scripts/validate.sh` before committing
- Fix lint, format, type errors before commit
- Update `AGENTS.md` when adding modules / commands / directories
- Write tests alongside new code once a test framework is wired up

### Ask First
- Adding new dependencies
- Adding a build pipeline (Vite, Webpack, Next.js)
- Adding a backend
- Modifying CI workflows

### Never
- Delete existing tests
- Skip `validate.sh` or bypass pre-commit hooks
- Commit secrets, API keys, or credentials
- Push directly to `main` without local validation
- Edit feature descriptions or flip `passes: true` without evidence

## Progressive Disclosure

| File | When to read |
|------|-------------|
| `docs/exec-plans/active/*.md` | Before implementing any task |
| `docs/product-specs/*.md` | Before building a feature (or read `PRD.docx`) |
| `docs/design-docs/*.md` | Before reopening a decision |
| `docs/QUALITY_SCORE.md` | When reviewing code |
| `docs/SECURITY.md` | When handling auth or secrets |
| `docs/RELIABILITY.md` | When handling errors, logging, retries |
| `docs/FRONTEND.md` | When wiring up build and UI gates |

## ExecPlans

Complex tasks (>30 min, multi-file, design decisions) require an ExecPlan. See `PLANS.md` for the format. Active plans live in `docs/exec-plans/active/`.

## Git

Branch: `feature/<desc>`, `fix/<desc>`, `chore/<desc>`
Commit: `feat(scope):`, `fix(scope):`, `docs(scope):`, `chore(scope):`
PR: one concern per PR. `validate.sh` must pass first.
