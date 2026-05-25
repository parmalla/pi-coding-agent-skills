# AGENTS.md — Pi Coding Agent Skills & Extensions

## Project Overview

This repository is a **collection of skills and extensions** for the [pi coding agent](https://github.com/badlogic/pi-coding-agent). It is NOT an application — it's a shared asset library that pi loads at runtime.

- **Skills** are self-contained capability packages (markdown + scripts + references) that pi loads on-demand via the [Agent Skills specification](https://agentskills.io/specification).
- **Extensions** are single-file TypeScript modules that hook into pi's lifecycle, register commands, and add custom TUI components.

## Repository Structure

```
pi-coding-agent-skills/
├── AGENTS.md              ← You are here
├── README.md               ← Public-facing docs (mirrors this structure)
├── .gitmodules             ← marimo-pair is a git submodule
├── .gitignore
├── .pi/
│   ├── extensions/         ← Symlinked/loaded by pi at runtime
│   └── skills/             ← Symlinked/loaded by pi at runtime
├── intercepted-commands/   ← Shell shims that block pip/poetry and redirect python → uv
│   ├── pip                ← Blocks pip, suggests uv add
│   ├── pip3               ← Blocks pip3, suggests uv add
│   ├── poetry             ← Blocks poetry, suggests uv init/add/sync/run
│   ├── python             ← Blocks -m pip/venv/py_compile, redirects through uv run
│   └── python3            ← Same as python
├── skills/                 ← Skill directories
│   ├── opencode-go-models/ ← SKILL.md (model routing guide)
│   ├── uv-python/          ← SKILL.md + reference docs (scripts, build)
│   └── marimo-pair/        ← Git submodule — DO NOT edit in-tree directly
│       ├── SKILL.md
│       ├── scripts/        ← Bash scripts (discover-servers.sh, execute-code.sh)
│       └── reference/       ← On-demand deep docs
└── extensions/             ← TypeScript extension files
    ├── answer.ts           ← Q&A extraction hook for assistant messages
    └── uv.ts               ← Bash tool wrapper: blocks forbidden Python commands, prepends shims to PATH
```

## Key Conventions

### Skills

1. **Every skill lives in `skills/<skill-name>/`** with a required `SKILL.md` at its root.
2. **SKILL.md uses YAML frontmatter** with at minimum `name` and `description`. Optional fields include `allowed-tools`.
3. **Frontmatter format:**
   ```yaml
   ---
   name: my-skill
   description: When and how to activate this skill.
   allowed-tools: Bash(bash my-script.sh *)
   ---
   ```
4. **Helper scripts** go in `skills/<skill-name>/scripts/` and must be executable (`chmod +x`).
5. **Reference docs** go in `skills/<skill-name>/reference/` — loaded on-demand, never inline in SKILL.md. Reference paths are relative to the SKILL.md directory.
6. **Do not duplicate content** between SKILL.md and references — SKILL.md should link to references for deep dives.

### Extensions

1. **Every extension is a single `.ts` file** in `extensions/`.
2. Extensions import from `@earendil-works/pi-coding-agent` (types: `ExtensionAPI`, `ExtensionContext`, `ModelRegistry`; utilities: `createBashTool`, `BorderedLoader`, etc.) and `@earendil-works/pi-ai` (LLM helpers: `complete`, `Model`, `Api`, `UserMessage`).
3. Extension TUI components import from `@earendil-works/pi-tui` (`Component`, `Editor`, `Key`, `TUI`, etc.).
4. **Default export pattern:**
   ```typescript
   import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
   export default function (pi: ExtensionAPI) { ... }
   ```
5. Extensions register commands via `pi.registerCommand(name, { description, handler })` and shortcuts via `pi.registerShortcut(key, { description, handler })`.
6. Extensions can use `ctx.ui.custom()` for interactive TUI and `ctx.ui.notify()` for toast messages.

## Important Constraints

- **marimo-pair is a git submodule** (`https://github.com/marimo-team/marimo-pair.git`). Changes to it should be made upstream, not in this repo. After upstream changes, update with `git submodule update --remote skills/marimo-pair`.
- **Skills are read at runtime by pi.** YAML frontmatter in SKILL.md is parsed by pi's skill loader — always validate frontmatter syntax before committing.
- **Bash scripts in skill directories** must use `chmod +x` and should use POSIX-compatible shebangs for portability.
- **Extensions have no bundler in this repo** — pi handles TypeScript compilation and bundling at load time. Do not add `package.json`, `tsconfig.json`, or `node_modules` to the extensions directory.
- **No build step.** This repo is consumed directly by pi from the filesystem. No compilation, bundling, or transpilation is needed locally.
- **intercepted-commands shims must be executable.** Run `chmod +x intercepted-commands/*` after any changes.

## Adding a New Skill

1. `mkdir skills/<skill-name>`
2. Create `skills/<skill-name>/SKILL.md` with YAML frontmatter (`name`, `description`, optionally `allowed-tools`)
3. Add `scripts/` for helper scripts, `reference/` for deep docs
4. Update the Skills table in `README.md`

## Adding a New Extension

1. Create `extensions/<name>.ts`
2. Export a default function receiving `ExtensionAPI`
3. Register commands and/or shortcuts inside the function
4. Update the Extensions table in `README.md`

## Current Skills Summary

| Skill | Purpose | Key Details |
|-------|---------|-------------|
| `opencode-go-models` | Model routing for OpenCode Go subscription | 14 models, decision flowchart, benchmark data — pure markdown, no scripts |
| `uv-python` | Use `uv` instead of pip/python/venv | SKILL.md (quick ref + blocked commands table), reference docs (scripts.md, build.md) — pure markdown, no scripts |
| `marimo-pair` | Pair-program with live marimo notebooks | Bash scripts for server discovery + code execution, reference docs for marimo internals — git submodule |

## Current Extensions Summary

| Extension | Purpose | Key Details |
|-----------|---------|-------------|
| `answer.ts` | Extract questions from assistant messages into interactive Q&A | Uses `complete()` for LLM extraction, custom `QnAComponent` TUI, prefers OpenCode Go models |
| `tokens-per-second.ts` | Display real-time token generation speed during streaming | Tracks `message_start`/`message_update`/`message_end` events, shows TPS in status bar, `/tps` command to toggle |
| `uv.ts` | Redirect Python tooling to uv equivalents | `createBashTool` with `commandPrefix` (PATH shims) + `spawnHook` (regex block), intercepts pip/pip3/poetry and python -m pip/venv/py_compile |

## Testing

There is no test suite in this repo. Validate changes by:

1. **SKILL.md:** Check YAML frontmatter validity (no syntax errors, required fields present).
2. **Extensions:** Load in pi and exercise the registered commands manually.
3. **Bash scripts:** Run directly and verify output/exit codes.
4. **Links:** Ensure reference links in SKILL.md resolve correctly relative to the skill directory.

## Git Workflow

- `main` branch for stable releases
- Feature branches for new skills/extensions
- `marimo-pair` submodule: update via `git submodule update --remote`, commit the updated pointer
- Commit messages: conventional style (`feat:`, `fix:`, `docs:`) preferred