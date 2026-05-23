# GitHub Copilot Instructions — Anth-Hackathon

**Keep this file in sync with `AGENTS.md` and `CLAUDE.md`. The substantive rules below are identical across all three.**

A community engagement prototype (Neighbourhood Pulse) for the Anthropic hackathon. Frontend in `Neighbourhood Pulse/` (React JSX, no build setup yet). Spec in `PRD.docx`; data model in `ERD.docx`.

## THE RULE

`./scripts/validate.sh` must exit 0 before every commit. No exceptions.

This applies to Copilot suggestions, completions, and chat responses just as it applies to humans. If Copilot generates code that would break `validate.sh`, the suggestion is wrong.

## Authority

`AGENTS.md` is the governing authority for this repository. When suggesting code, Copilot should follow the rules in that file over any general best-practice it would otherwise propose.

## Commands Copilot may suggest

```bash
./scripts/validate.sh                  # Always before commit
python3 scripts/harness_scorecard.py   # Grade harness maturity
python3 scripts/ratchet.py             # Quality regression check
python3 scripts/check_features.py      # Feature list status
```

Build/test/lint commands are not yet defined — Copilot should not suggest `npm install`, `pytest`, or similar until a `package.json` / `requirements.txt` exists in the repo.

## Module Structure

Single flat layer at `Neighbourhood Pulse/components/` (React JSX). No layered architecture is enforced yet. Copilot may freely cross-import between component files.

## Golden Principles

1. No secrets in code — use environment variables or a secret manager
2. Structured logging only (no `console.log` in committed code)
3. No God files (over 500 lines flagged by `check_architecture.py`)
4. Research before guessing — when fixing a failure, read the relevant docs first

## Feature List

`.harness/feature_list.json` is the source of truth for what counts as "done." Copilot should not auto-flip `"passes": true` for any feature. That action requires human verification.

## What Copilot should not suggest

- Commits that skip `validate.sh`
- `git push --no-verify`
- Hardcoded API keys, even as placeholders
- `console.log` in non-debug code paths
- Deleting tests
- Editing entries in `.harness/feature_list.json` (other than flipping `passes` after verification)

## Git conventions

Branch prefixes: `feature/`, `fix/`, `chore/`
Commit prefixes: `feat(scope):`, `fix(scope):`, `docs(scope):`, `chore(scope):`
PR: one concern per PR. `validate.sh` must pass first.
