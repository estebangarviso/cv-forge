---
name: cv-editor-split-view
description: "Trigger: CV editor scroll broken, split view, ScrollArea, live preview, autosave debounce. Fix the editor's form+preview split view."
license: Proprietary
metadata:
    author: estebangarviso
    version: '1.2'
---

## Activation Contract

Use when changing `editor-client.tsx` or `cv-form.tsx`, or when a split-view panel's scroll "breaks the page" instead of scrolling internally. For the PDF preview/document itself, use `react-pdf-cv-rendering` instead.

## Hard Rules

- Every flex ancestor between a bounded-height container (`h-full`/`h-svh`) and a `ScrollArea` MUST include `min-h-0` (or `overflow-hidden`) — a flex item's default `min-height: auto` lets it grow past its parent, so `ScrollArea`'s `flex-1` never gets a real height and the _page_ scrolls instead of the panel.
- Always use `@shared/ui`'s `ScrollArea` for the form panel — never a raw `overflow-y-auto` div.
- Never call a top-level, no-argument `form.watch()` in the editor — it resubscribes to every field and re-renders `EditorClient` (and everything under it, including `CvForm` and the react-pdf layout/shaping/serialization pipeline) on every keystroke. Drive live preview from a `useState` fed by the SAME `form.watch(cb)` subscription used for autosave, debounced separately (~400ms) with `useDebouncedCallback` from `@tanstack/react-pacer` — never `useDebouncedValue`, which needs a reactive `value` upstream and reintroduces the per-keystroke re-render. Share one `useMemo`'d `<CvPdfDocument>` element between `PdfViewer` and `PDFDownloadButton`.
- Autosave is a single async debouncer (`useAsyncDebouncer` from `@tanstack/react-pacer`) keyed off that same `form.watch()` subscription; skip while `isResettingRef.current` is true (a form reset from a fresh Drive load must never trigger a save).
- A field-level slider/percentage label (or any per-row derived value) must read its value from the `Controller`'s own `render` prop, never from a separate `form.watch('path.to.field')` call — the latter adds one more subscription per row and re-renders the whole form on every drag tick.

## Decision Gates

| Symptom                                                  | Cause                                                                             | Fix                                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Whole page scrolls; form panel doesn't scroll on its own | Missing `min-h-0` on the flex column wrapping `ScrollArea`                        | Add `min-h-0` to that column's className                                                 |
| Autosave fires right after loading an existing CV        | Reset didn't set `isResettingRef`                                                 | Guard the debounce effect with `isResettingRef.current`                                  |
| Typing in the form feels laggy / preview stutters        | A top-level `form.watch()` (no args) re-renders `EditorClient` on every keystroke | Replace it with a debounced `useState` fed by the existing `form.watch(cb)` subscription |
| PDF preview looks stale a beat after editing             | Expected — the preview state is intentionally debounced (~400ms)                  | Not a bug; only lower `wait` if product explicitly wants snappier-but-staler             |

## Execution Steps

1. Identify the flex ancestry from the bounded container down to the form panel's `ScrollArea`; add `min-h-0` at every level that lacks it.
2. Re-run `pnpm type-check` and manually resize the panel (or add enough form entries) to confirm internal scroll, not page scroll.
3. If touching preview/autosave wiring: one `form.watch(cb)` subscription feeds both a `useDebouncedCallback`-driven preview `useState` (~400ms) and the `useAsyncDebouncer`-driven save (2s) — never add a second top-level `form.watch()`.

## Output Contract

The form panel scrolls independently within its own bounds; the outer app shell/header never scrolls; typing causes zero `EditorClient` re-renders; the PDF preview reflects form values within ~400ms of the last keystroke.

## References

- `src/app/[locale]/(back-office)/editor/[id]/editor-client.tsx`
- `src/modules/cv/presentation/components/cv-form.tsx`
- `src/shared/ui/primitives/scroll-area.tsx`
