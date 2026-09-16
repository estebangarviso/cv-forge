# Module contract

A module is an independent unit that can be extracted to a microfrontend with minimal effort. Each `src/modules/<name>/` owns `domain`, `infrastructure`, and `presentation` layers exposed through a single `index.ts`.

## Quick path

```bash
mkdir -p src/modules/<name>/{domain/{entities,interfaces,use-cases},infrastructure/{repositories,mappers},presentation/{components,hooks,state}}
```

Then: define Zod entities → declare port interfaces → implement adapters → build UI + Zustand store for client state → wire the public API in `index.ts`.

## Rules

| #   | Rule                                                                                          |
| --- | --------------------------------------------------------------------------------------------- |
| 1   | **Single entry point** — `index.ts` is the ONLY file other modules import                     |
| 2   | **Port/adapter separation** — `domain/` defines interfaces; `infrastructure/` implements them |
| 3   | **Layer isolation** — `domain/` has zero framework imports (pure TS + Zod)                    |
| 4   | **No cross-module internals** — modules talk via shared types, never internal paths           |

## Import pattern

```typescript
// ✅ Public API — import from the barrel
import { useAuthStore, LoginForm } from '@modules/auth';

// ❌ Never import internal paths
import { useAuthStore } from '@modules/auth/presentation/state/auth.store';
```

## Scaffold checklist

- [ ] Zod entities in `domain/entities/`
- [ ] Port interfaces in `domain/interfaces/`
- [ ] Repository adapters in `infrastructure/repositories/`
- [ ] TanStack Query hooks in `presentation/hooks/`
- [ ] Zustand store (if needed) in `presentation/state/`
- [ ] Public exports in `index.ts`
- [ ] Factory wiring in `<name>.factory.ts` if repository injection is needed

## Naming conventions

| Thing          | Convention                                       |
| -------------- | ------------------------------------------------ |
| Files          | `kebab-case.ts` / `kebab-case.tsx`               |
| Hooks          | `use-<name>.ts` exporting `useName()`            |
| Zustand stores | `<name>.store.ts` exporting `useNameStore`       |
| Entities       | `<name>.ts` with `NameSchema` + inferred `Name`  |
| Ports          | `<name>-repository.interface.ts`                 |
| Module wiring  | `<name>.factory.ts` exporting `getX()` accessors |

## Next step

[005 Theming](./005_theming.md) — runtime CSS-variable palettes.
