# AGENTS.md — CV Studio

Canonical rules for any AI coding assistant working in this repository. This file is the single source of truth for enforceable conventions. `README.md` owns onboarding; `docs/` owns deep dives.

**Verify before done:** `pnpm lint`, `pnpm type-check`, and `pnpm test` for logic changes.

## Product

CV Studio — a web app where users create, edit, and export professional CVs. Google OAuth for authentication, Google Drive as storage (SoT), PDF export via `@react-pdf/renderer`.

## Domain glossary

| Term         | Meaning                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Resume / CV  | A user's curriculum vitae document                                                              |
| Template     | Visual layout for rendering a CV (React component + config)                                     |
| CvData       | The JSON structure holding all CV content (personal, education, experience, skills, references) |
| Drive folder | `CV Studio` folder in the user's Google Drive; each CV is a JSON file                           |
| Preview      | The live CV preview rendered by `@react-pdf/renderer` inside the editor                         |
| Editor       | Split view: form (left) + live PDF preview (right)                                              |

## Project snapshot

| Topic           | Value                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack), React 19                                                                              |
| Language        | TypeScript, strict mode                                                                                                   |
| Auth            | Auth.js v5 (`next-auth@beta`) with Google OAuth provider                                                                  |
| Storage         | Google Drive API v3 (`googleapis`) — no database                                                                          |
| Server state    | TanStack Query (`@tanstack/react-query`)                                                                                  |
| Client state    | Zustand (`zustand`)                                                                                                       |
| Forms           | `react-hook-form` + `@hookform/resolvers` + Zod                                                                           |
| Styling         | Tailwind CSS v4 + `@tailwindcss/postcss`, CSS variable theming                                                            |
| PDF export      | `@react-pdf/renderer` — `PdfViewer` (live preview) + `PDFDownloadButton` (export), fonts self-hosted from `public/fonts/` |
| i18n            | `next-intl` — default locale `es`, supported `es`, `en`                                                                   |
| Testing         | Vitest + React Testing Library                                                                                            |
| Deployment      | Vercel (serverless)                                                                                                       |
| Package manager | pnpm                                                                                                                      |

## Architecture rules

Modular app using DDD + Hexagonal layering.

- **Modules are independent units** — each `src/modules/<name>/` owns `domain`, `infrastructure`, `presentation`.
- **Public API pattern** — import from `@modules/<name>` (barrel `index.ts`) only, never internal paths.
- **Domain is pure** — `domain/` has ZERO framework imports; entities are Zod schemas.
- **Ports & adapters** — `domain/interfaces/` declares contracts; `infrastructure/` implements them.
- **SSR for optimization only** — business logic lives in modules, not in server actions or route handlers.

### Directory map

```
src/
├── app/                # App Router: routing + composition ONLY
│   ├── [locale]/       # i18n routing
│   │   ├── (back-office)/  # Authenticated: /resumes, /editor/[id]
│   │   └── (front-office)/ # Public: /login
│   └── api/            # Route handlers: auth, cv CRUD
├── auth.ts             # Auth.js v5 config (providers, callbacks)
├── core/               # Shared kernel
│   ├── query/          # TanStack Query provider
│   └── providers.tsx   # App-level providers
├── modules/
│   ├── auth/           # User entity, session types
│   ├── cv/             # Core domain: CvData, templates, form, preview
│   ├── drive/          # Google Drive integration port + entity
│   └── i18n/           # Locale config, translation messages
└── shared/             # UI primitives (shadcn), utils, types
```

### Modules

| Module  | Owns                                                            |
| ------- | --------------------------------------------------------------- |
| `auth`  | User entity, session types (auth config lives in `src/auth.ts`) |
| `cv`    | CvData schema, templates, editor components, preview, hooks     |
| `drive` | DriveFile entity, DriveRepository port                          |
| `i18n`  | Locale config, translation JSON files                           |

## State management

| Data owner            | Tool           | Location                             |
| --------------------- | -------------- | ------------------------------------ |
| Google Drive (async)  | TanStack Query | `presentation/hooks/use-*.ts`        |
| Editor session (sync) | Zustand        | `presentation/state/<name>.store.ts` |

No Redux, MobX, or centralized state managers.

## i18n (critical)

- **All visible text** must use `next-intl` translation keys — never hardcode strings in components.
- Messages live in `src/modules/i18n/messages/{locale}.json`.
- Supported locales: `es` (default), `en`.
- Client: `useTranslations()` hook. Server: `getTranslations()`.
- When adding new UI text, add the key to **both** `es.json` and `en.json`.

## Forms

Use `react-hook-form` with `zodResolver` exclusively. Schemas from `@modules/cv` (e.g., `CvDataSchema`).

## Auth

- Config in `src/auth.ts` — exports `{ handlers, signIn, signOut, auth }`.
- Route handler at `src/app/api/auth/[...nextauth]/route.ts` re-exports handlers.
- Google OAuth with `drive.file` scope for Drive access.
- Session provides `accessToken` for Drive API calls.

## API routes

| Route                    | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `api/auth/[...nextauth]` | Auth.js handler (Google OAuth)                |
| `api/cv`                 | GET: list CVs from Drive. POST: create new CV |
| `api/cv/[id]`            | GET/PUT/DELETE a specific CV                  |

## Styling

- Tailwind CSS v4 only. PostCSS via `@tailwindcss/postcss`.
- Theming uses CSS variables (see `docs/architecture/005_theming.md`).
- CV rendering for preview and export both go through `@react-pdf/renderer` (`src/shared/ui/pdf/`) — no DOM/CSS print pipeline, no `window.print()`.

## Naming conventions

| Thing          | Convention                                       |
| -------------- | ------------------------------------------------ |
| Files          | `kebab-case.ts` / `kebab-case.tsx`               |
| Components     | `PascalCase`                                     |
| Hooks          | `use-<name>.ts` exporting `useName()`            |
| Zustand stores | `<name>.store.ts` exporting `useNameStore`       |
| Entities       | `<name>.ts` with `NameSchema` + inferred `Name`  |
| Ports          | `<name>-repository.interface.ts`                 |
| Module wiring  | `<name>.factory.ts` exporting `getX()` accessors |

## What NOT to do

- No hardcoded visible text — use i18n keys.
- No Redux / centralized state managers.
- No SCSS for new styles.
- No `reflect-metadata`, decorators, DI containers, or service locators.
- No business logic in server actions or route handlers.
- No imports from another module's internal paths.
- No `any` — use Zod schemas and inferred types.
- No direct Google Drive calls from components — go through the `drive` module port.

## Documentation index

| Doc                                                                                                    | Purpose                                                        |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| [docs/agents/00_index.md](docs/agents/00_index.md)                                                     | Agent reference hub                                            |
| [docs/agents/01_directory-structure.md](docs/agents/01_directory-structure.md)                         | Module layout details                                          |
| [docs/agents/02_mappers-and-boundary-validation.md](docs/agents/02_mappers-and-boundary-validation.md) | Wire → domain mapping rules                                    |
| [docs/agents/03_api-access-and-transport.md](docs/agents/03_api-access-and-transport.md)               | Transport gate and patterns                                    |
| [docs/agents/05_shared-ui-library.md](docs/agents/05_shared-ui-library.md)                             | Shared UI decision gate                                        |
| [docs/architecture/](docs/architecture/)                                                               | Architecture hub (folder structure, state, theming, data flow) |
| [docs/getting-started/](docs/getting-started/)                                                         | Setup and commands                                             |
| [docs/guides/001_trunk-based-stacked-prs.md](docs/guides/001_trunk-based-stacked-prs.md)               | Stacked PR / trunk-based delivery protocol                     |

## Skills

Project-specific, repeated patterns that go beyond generic best practices. See [.github/skills/README.md](.github/skills/README.md) for the full index.

| Skill                                                                            | Use when                                                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [google-drive-cv-storage](.github/skills/google-drive-cv-storage/SKILL.md)       | Reading, writing, listing, or deleting CVs via Google Drive                    |
| [google-oauth-token-refresh](.github/skills/google-oauth-token-refresh/SKILL.md) | Touching `src/auth.ts` / `src/proxy.ts`, debugging stale sessions              |
| [cv-editor-split-view](.github/skills/cv-editor-split-view/SKILL.md)             | Changing the editor's form+preview layout or scroll                            |
| [react-pdf-cv-rendering](.github/skills/react-pdf-cv-rendering/SKILL.md)         | Changing `CvPdfDocument`/`cv-pdf-*` components, PDF fonts, or `@shared/ui/pdf` |

## Agent playbooks

### Implementer

1. Locate the layer: `domain`, `infrastructure`, or `presentation`.
2. Model data with Zod; expose the module only through `index.ts`.
3. Drive data → TanStack Query; editor state → Zustand; forms → react-hook-form + Zod.
4. All text → i18n keys in `es.json` + `en.json`.
5. Add tests for new hooks, use cases, and components.

### Debugger

1. **Identify** the layer (domain / infrastructure / presentation / core).
2. **Trace**: Component → Hook (Query) → Use Case → Repository → Drive API.
3. **Fix** in the correct layer; **verify** with `pnpm type-check` and `pnpm test`.

### Reviewer

- Module boundaries respected?
- All visible text uses i18n keys?
- Drive data in Query, editor state in Zustand?
- Inputs validated with Zod?
- PDF components import react-pdf only through `@shared/ui/pdf`, never directly?

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
