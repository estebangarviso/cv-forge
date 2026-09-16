# Architecture hub

A lean, functional Next.js 16 app built around **feature modules**, a **type-safe API client**, and a clear split between **server state** and **client state**. No Redux, no decorators, no DI container — dependencies are wired with plain module imports and factory functions.

> **Forking this template?** See [Customize your fork](../getting-started/001_customize-your-fork.md) and the [worked example](../guides/001_fork-customization-example.md).

## Quick path

1. **Pick a state lane** — server data in TanStack Query (`presentation/hooks/`); synchronous session/UI facts in Zustand (`presentation/state/`).
2. **Add a module** — scaffold `src/modules/<name>/` with domain / infrastructure / presentation; expose only via `index.ts`.
3. **Wire the API** — OpenAPI-typed paths via `useApiClient()` in hooks; other endpoints via `getHttpClient()` + Zod in `infrastructure/repositories/`.

## Reference layout

Full stack snapshot: [AGENTS.md § Project snapshot](../../AGENTS.md#project-snapshot).

| Topic                         | Where                                                             |
| ----------------------------- | ----------------------------------------------------------------- |
| App Router + bounded contexts | `src/app/` — `(back-office)` and `(front-office)` under `[lang]/` |
| Feature modules               | `src/modules/<name>/`                                             |
| Shared kernel                 | `src/core/` (API client, Query provider, HTTP helper)             |
| Global UI primitives          | `src/shared/`                                                     |

## Deep dives

| Doc                                               | Read it when you want to…                           |
| ------------------------------------------------- | --------------------------------------------------- |
| [001 Folder structure](./001_folder-structure.md) | See the full `src/` tree and layer responsibilities |
| [002 State management](./002_state-management.md) | Choose TanStack Query vs Zustand                    |
| [003 API access](./003_api-access.md)             | Wire openapi-fetch and repository HTTP              |
| [004 Module contract](./004_module-contract.md)   | Scaffold a new hexagonal module                     |
| [005 Theming](./005_theming.md)                   | Set CSS-variable palettes per tenant                |
| [006 Data flow](./006_data-flow.md)               | Trace a request from UI to backend                  |

## Related docs

| Doc                                            | Read it when you want to…                       |
| ---------------------------------------------- | ----------------------------------------------- |
| [README.md](../../README.md)                   | Quick start and doc entry points                |
| [AGENTS.md](../../AGENTS.md)                   | Enforceable rules, conventions, agent playbooks |
| [docs/README.md](../README.md)                 | Full documentation map                          |
| [Commands](../getting-started/002_commands.md) | pnpm scripts reference                          |
