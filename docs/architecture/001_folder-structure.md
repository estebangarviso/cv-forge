# Folder structure

The `src/` tree separates routing (`app/`), shared kernel (`core/`), feature modules (`modules/`), and global primitives (`shared/`). Business logic lives in modules — never in route handlers or server actions.

## Quick path

1. Add routes under `src/app/[lang]/(back-office)` or `(front-office)` — composition only.
2. Put domain logic in `src/modules/<name>/` following the [module contract](./004_module-contract.md).
3. Share cross-cutting wiring through `src/core/` and UI primitives through `src/shared/`.

## Tree

```
src/
├── app/                         # Next.js App Router (routing + composition only)
│   ├── layout.tsx               # Root pass-through layout
│   ├── [lang]/                  # Locale-scoped routes
│   │   ├── layout.tsx           # <html>, font, translations, providers
│   │   ├── (back-office)/       # Bounded Context: admin/operator
│   │   └── (front-office)/      # Bounded Context: customer-facing
│   └── api/health/route.ts      # Health check route handler
│
├── core/                        # Shared kernel (framework-level wiring)
│   ├── api/                     # Type-safe API client
│   │   ├── client.ts            # createApiCoreClient() — openapi-fetch transport
│   │   ├── context.tsx          # ApiProvider + useApiClient() (tenant scoping)
│   │   └── v1.ts                # Generated OpenAPI types (git-ignored)
│   ├── query/                   # TanStack Query provider
│   │   └── query-provider.tsx
│   ├── http/                    # Zod-validated fetch helper + getHttpClient() singleton
│   └── providers.tsx            # Client provider composition
│
├── modules/                     # Feature modules (the core of the app)
│   ├── auth/                    # Canonical example module
│   │   ├── domain/              # entities (Zod), interfaces (ports), use-cases
│   │   ├── infrastructure/      # repositories (adapters), mappers
│   │   └── presentation/        # components, hooks, state (Zustand store)
│   ├── i18n/                    # Server-driven translations
│   └── shared/                  # Cross-module shared logic
│
└── shared/                      # Global types, UI primitives, utils
```

## Layer responsibilities

| Layer      | Path                  | Rule                                                      |
| ---------- | --------------------- | --------------------------------------------------------- |
| App Router | `src/app/`            | Routing and composition only — no business logic          |
| Core       | `src/core/`           | Framework wiring: API client, Query provider, HTTP helper |
| Modules    | `src/modules/<name>/` | Domain, infrastructure, presentation per feature          |
| Shared     | `src/shared/`         | Global UI primitives and utilities                        |

## Bounded contexts

Route groups under `[lang]/` mirror domain boundaries:

| Group            | Audience         | Example routes       |
| ---------------- | ---------------- | -------------------- |
| `(back-office)`  | Admin / operator | customers, employees |
| `(front-office)` | Customer-facing  | storefront, account  |

## Next step

[002 State management](./002_state-management.md) — pick TanStack Query or Zustand by data owner.
