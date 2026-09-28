# Documentation index

How this folder is organized: each subfolder maps 1:1 to a sidebar section in the root [README.md](../README.md). Filenames keep a numeric `0NN_` prefix that encodes reading order **within that section** (not a global order across the repo). Multi-page topics use `00_index.md` as the hub. Adding a new doc means appending the next free number inside the relevant subfolder and updating both this index and the root README.

> **Writers:** publish only under `docs/` and root `README.md`. Keep pages scannable (~80–120 lines): lead with the answer, prefer tables and checklists, split past ~400 lines.

## Getting started

- [002 Commands](getting-started/002_commands.md) — pnpm scripts reference.

## Architecture

- [00 Architecture hub](architecture/00_index.md) — Overview, quick path, reference layout.
- [001 Folder structure](architecture/001_folder-structure.md) — `src/` tree and layer responsibilities.
- [002 State management](architecture/002_state-management.md) — TanStack Query vs Zustand lanes.
- [004 Module contract](architecture/004_module-contract.md) — Hexagonal rules and scaffold command.
- [005 Theming](architecture/005_theming.md) — CSS variables and Tailwind v4 `@theme inline`.
- [006 Data flow](architecture/006_data-flow.md) — Request path from UI to backend.

## Guides

- [001 Branching and releases](guides/001_branching-and-releases.md) — `develop` (preview) / `main` (production) flow, releases, hotfixes and stacked PRs.

## Source-of-truth files

| File                            | Owns                                              |
| ------------------------------- | ------------------------------------------------- |
| `README.md`                     | Quick start, stack snapshot, doc entry points     |
| `docs/README.md`                | Documentation map (this file)                     |
| `docs/architecture/00_index.md` | Architecture hub and deep-dive links              |
| `AGENTS.md`                     | AI assistant rules and conventions (IDE-agnostic) |
| `package.json`                  | Dependencies, scripts, engines                    |

`llms.txt` is a companion summary for LLM tooling — keep it aligned with `AGENTS.md` when you fork, but it is not an enforceable contract.

## Agent reference

Deep-dive documentation for AI assistants: [docs/agents/00_index.md](agents/00_index.md).
