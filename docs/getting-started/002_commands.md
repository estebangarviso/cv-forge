# Commands reference

pnpm scripts for local development, quality gates, and API type generation.

## Quick path

```bash
pnpm install          # after clone or init:project
pnpm dev              # start dev server
pnpm lint && pnpm type-check   # before committing
```

## Scripts

| Command              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `pnpm dev`           | Development server (Turbopack)                        |
| `pnpm build`         | Production build                                      |
| `pnpm start`         | Serve the production build                            |
| `pnpm test`          | Unit tests (Vitest)                                   |
| `pnpm test:coverage` | Tests with coverage                                   |
| `pnpm test:mutation` | Mutation testing (Stryker)                            |
| `pnpm type-check`    | TypeScript check                                      |
| `pnpm lint`          | ESLint + Prettier                                     |
| `pnpm openapi:gen`   | Regenerate `src/core/api/v1.ts` from the OpenAPI spec |
| `pnpm init:project`  | Replace template placeholders across the repo         |

## OpenAPI generation

```bash
OPENAPI_SPEC_URL=https://your-backend.example.com/openapi.json pnpm openapi:gen
```

Writes `src/core/api/v1.ts` (git-ignored). Re-run whenever the backend spec changes.

## Verify before done

| Change type           | Run                                       |
| --------------------- | ----------------------------------------- |
| Any code change       | `pnpm lint` + `pnpm type-check`           |
| Logic, hooks, modules | Also `pnpm test`                          |
| API contract change   | `pnpm openapi:gen` then `pnpm type-check` |

## Next step

[Architecture hub](../architecture/00_index.md) — how features and API wiring fit together.
