---
name: form-composition
description: 'Trigger: new form section, form file over ~300 lines, repeated field markup, accordion section, useFieldArray. Compose forms from small section components.'
license: Proprietary
metadata:
    author: estebangarviso
    version: '1.0'
---

## Activation Contract

Use when adding a section or field to `cv-form.tsx`, when a form file grows past ~300 lines, or when the same field markup appears three or more times. For the editor's scroll/preview/autosave wiring use `cv-editor-split-view` instead — this skill is only about how form markup is decomposed.

## Hard Rules

- **Never render a form section's `AccordionContent` directly.** Wrap it in `CvFormSection`, which owns `forceMount` plus `in-data-[state=closed]:hidden`. Radix unmounts closed content, and react-hook-form cannot hydrate fields that are not mounted when a late Drive load resolves — that was the production bug where every field stayed blank until you toggled the accordion. `forceMount` without the hide rule is equally broken: the section can never be closed.
- **A form component never calls `useForm`.** `EditorClient` owns the form instance (autosave, preview and the theme/typography dialogs all need it) and passes `form: UseFormReturn<CvData>` down. Sections receive `form` and call `useFieldArray` for their own array.
- **Scalar fields bound to asynchronously loaded data use `Controller`, not `register`.** `register` attaches an uncontrolled ref whose value can miss a later `form.reset()`; `Controller` re-renders from form state. Fields inside a `useFieldArray` row may keep using `register` — the array re-renders on reset anyway.
- **Never introduce a top-level no-argument `form.watch()`**, and never read a row's value with a separate `form.watch('path.to.field')` — take it from the `Controller`'s own `render` prop.
- **The Zod schema stays in `domain/entities/`.** Never create a form-local schema file; presentation imports `CvDataSchema` / `CvData` and never redefines the shape.
- **All visible text comes from `useTranslations('cvForm')`.** Generic, reusable list components (`CvFormEntryList`, `CvFormSkillList`) take their labels as props instead, so they stay copy-agnostic; named sections call `useTranslations` themselves.

## Decision Gates

| Situation                                          | Do this                                                                                                    |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Adding a section with a shape that already exists  | Reuse `CvFormEntryList` (title + subtitle) or `CvFormSkillList` (label + slider)                           |
| Adding a sortable section with a **new** row shape | New `cv-form-<name>-section.tsx` built on `SortableFieldArray` + `DragHandle` + `RemoveEntryButton`        |
| Adding a non-sortable section                      | New `cv-form-<name>-section.tsx`; put it inside `CvFormSection` in `cv-form.tsx`                           |
| Same field markup appears 3+ times inside one file | Extract a local component in that file (see `IconField`), not a shared one                                 |
| Same field markup appears in 2+ files              | Extract into `cv-form-sortable.tsx` or its own component file                                              |
| A section needs a new accordion key                | Add it to `SECTION_KEYS` in `cv-form.tsx` — order there is the render order and the "all expanded" default |
| Tempted to extract a wrapper used only once        | Don't. Inline it.                                                                                          |

## Execution Steps

1. Add the section's copy to **both** `src/modules/i18n/messages/es.json` and `en.json` under `cvForm`.
2. Create `cv-form-<name>-section.tsx` taking `{ form }`, calling `useTranslations('cvForm')` and — if it owns an array — `useFieldArray`.
3. Register it in `cv-form.tsx` inside a `CvFormSection`, and add its key to `SECTION_KEYS`.
4. Keep `cv-form.tsx` an orchestrator: accordion state, section order, submit. If it passes ~200 lines, a section is leaking back into it.
5. Verify with `pnpm lint && pnpm type-check && pnpm test --run`. `cv-form.test.tsx` is the hydration guard — it loads a CV after mount and asserts fields populate **without** touching the accordions. Never delete it; extend it when adding scalar fields.

## Output Contract

Every section lives in its own file under ~150 lines; `cv-form.tsx` only orchestrates; every `AccordionContent` goes through `CvFormSection`; no component under `presentation/` calls `useForm`; `pnpm lint`, `pnpm type-check` and `pnpm test` all pass.

## References

- `src/modules/cv/presentation/components/cv-form.tsx` — orchestrator
- `src/modules/cv/presentation/components/cv-form-section.tsx` — the mount invariant
- `src/modules/cv/presentation/components/cv-form-sortable.tsx` — dnd + insert-divider scaffold
- `src/modules/cv/presentation/components/cv-form-entry-list.tsx` / `cv-form-skill-list.tsx` — reusable row shapes
- `src/modules/cv/presentation/components/cv-form-personal-section.tsx` — local `IconField` extraction
- `src/modules/cv/presentation/components/cv-form.test.tsx` — hydration regression guard
