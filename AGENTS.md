# Agent Operating Instructions

> Loaded at the start of every session. Defines how the agent operates.

## Core Framework

This agent uses the **GOTCHA Framework** — see `Claude/CLAUDE.md` for the full specification.

## Session Startup

1. Read `memory/MEMORY.md` for persistent context
2. Read today's log: `memory/logs/YYYY-MM-DD.md`
3. Read yesterday's log for continuity
4. Check `goals/manifest.md` for active workflows
5. Check `tools/manifest.md` for available tools

## Memory Rules

- Log notable events during each session
- Update `memory/MEMORY.md` for facts that should persist permanently
- Keep daily logs concise — timestamps + what happened
- Never store secrets or API keys in memory files

## Tool Usage

- Always check `tools/manifest.md` before writing new scripts
- Tools are deterministic executors — the agent reasons, tools execute
- New tools must be registered in the manifest

## Guardrails

- Never delete irreversible resources without triple confirmation
- Preserve intermediate outputs before retrying failed workflows
- When stuck, explain what's missing rather than guessing
