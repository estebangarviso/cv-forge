# Commands reference

pnpm scripts for local development and quality gates.

## Quick path

```bash
pnpm install          # after clone
pnpm dev              # start dev server
pnpm lint && pnpm type-check   # before committing
```

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm dev`           | Development server (Turbopack) |
| `pnpm build`         | Production build               |
| `pnpm start`         | Serve the production build     |
| `pnpm test`          | Unit tests (Vitest)            |
| `pnpm test:coverage` | Tests with coverage            |
| `pnpm test:mutation` | Mutation testing (Stryker)     |
| `pnpm type-check`    | TypeScript check               |
| `pnpm lint`          | ESLint + Prettier              |

## Verify before done

| Change type           | Run                             |
| --------------------- | ------------------------------- |
| Any code change       | `pnpm lint` + `pnpm type-check` |
| Logic, hooks, modules | Also `pnpm test`                |

## Next step

[Architecture hub](../architecture/00_index.md) — how features and modules fit together.
