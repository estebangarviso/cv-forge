# Contributing to CV Studio

Thank you for contributing to CV Studio. Read [AGENTS.md](AGENTS.md) first; it is the canonical source for repository rules and architecture decisions.

## Before Opening a Pull Request

Install dependencies with `pnpm install`, then run:

```bash
pnpm lint
pnpm type-check
pnpm test
```

Keep changes focused, explain the user-facing behavior, and include validation results in the pull request description. Do not commit secrets, personal CV data, local seeds, generated fonts, or environment files.

## Architecture

CV Studio uses DDD and hexagonal architecture. A module under `src/modules/<name>/` owns its `domain`, `infrastructure`, and `presentation` layers. Domain code is framework-free and models data with Zod. Import another module through its public `index.ts` barrel, not through internal paths.

Google Drive is the only product persistence layer. CV Studio does not use SQL, NoSQL, or a central personal-data store. Do not call Google Drive directly from UI components; use the module port and repository adapter.

Visible text must use `next-intl` keys in both `src/modules/i18n/messages/es.json` and `en.json`.

PDF components use `@react-pdf/renderer` only through `src/shared/ui/pdf/`. Follow the PDF rendering rules in [AGENTS.md](AGENTS.md) and the applicable skill in `.github/skills/`.

## Future Templates

Template contributions should preserve existing CV data, use fictional preview data, respect the current Zod domain model, and keep layout and rendering responsibilities in the appropriate module layers. Do not add a new template by duplicating the entire PDF renderer. The layout engine and template catalog are being developed incrementally; check the active OpenSpec change under `openspec/changes/` before starting template work.

## Pull Requests

`main` is protected by a ruleset requiring passing checks and linear history. For work that naturally splits into dependent chunks, follow the [trunk-based stacked PR guide](docs/guides/001_trunk-based-stacked-prs.md) instead of one large PR.

Use a clear title and describe:

- What changed and why.
- Which files or module boundaries are affected.
- How the change was tested.
- Any migration or compatibility concerns for JSON files stored in Google Drive.

Do not include real personal information in fixtures, screenshots, tests, or examples.
