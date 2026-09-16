## Description

<!-- Clearly describe what this PR does and why. Link to the relevant issue if applicable. -->

Closes #

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that changes existing behavior)
- [ ] ♻️ Refactor (no functional change, improves code structure)
- [ ] 🧪 Tests (adding or improving test coverage)
- [ ] 📦 Dependencies (dependency updates)
- [ ] 🔧 Chore / Config (tooling, CI, deployment, docs)

## Changes Made

<!-- Brief bullet list of what changed and where. -->

-

## Pre-Merge Checklist

### Code Quality

- [ ] `pnpm lint` passes (ESLint + Prettier)
- [ ] `pnpm type-check` passes with no errors
- [ ] No unused variables, parameters, or imports
- [ ] No `any` — use Zod schemas and inferred types

### Architecture

- [ ] Modules imported only via their `@modules/<name>` barrel (no internal paths)
- [ ] Domain layer has zero framework imports (pure TS + Zod)
- [ ] Server data uses TanStack Query; client state uses Zustand (not conflated)
- [ ] Forms use `react-hook-form` + `zodResolver`
- [ ] No external DI containers/decorators — React Context + hooks only

### Security

- [ ] No secrets committed; only public config exposed via `NEXT_PUBLIC_*`
- [ ] External input validated with Zod (client validation treated as UX only)
- [ ] No `dangerouslySetInnerHTML` with unsanitized input

### Tests

- [ ] Unit tests added / updated for new or changed logic
- [ ] `pnpm test` passes locally

### Documentation

- [ ] Public functions and types have doc comments
- [ ] `docs/` / `README.md` / `AGENTS.md` updated if conventions changed

## Testing Notes

<!-- Describe how you tested this change. -->

```bash
pnpm test
```

## Screenshots (if applicable)

<!-- Paste before/after screenshots or a short recording for UI changes. -->
