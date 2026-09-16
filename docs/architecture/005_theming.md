# Multi-tenant theming

Theming is dynamic and runtime-driven via native CSS variables in `src/app/globals.css` — no SCSS, no rebuilds per tenant.

## Quick path

1. Edit HSL channel tokens in `globals.css` (values without the `hsl()` wrapper).
2. Tailwind v4 `@theme inline` maps utilities to those channels automatically.
3. Override per tenant at the layout boundary with inline `style`.

## Default tokens

```css
/* globals.css — tenant-neutral defaults */
:root {
	--background: 0 0% 100%;
	--foreground: 0 0% 3.9%;
	--primary: 0 0% 9%;
	--primary-foreground: 0 0% 98%;
	/* … */
}
```

## Tailwind mapping

`@theme inline` maps utility tokens to CSS channels:

```css
--color-primary: hsl(var(--primary));
```

So `bg-primary` and `text-primary` follow whatever you set on `--primary`.

## Runtime override

```tsx
// Inject a tenant palette at the layout boundary
<div style={{ '--primary': '221 83% 53%' } as React.CSSProperties}>
```

## Rules

| Rule                 | Detail                                                          |
| -------------------- | --------------------------------------------------------------- |
| Tailwind v4 only     | No SCSS for new work                                            |
| HSL channels         | Store channels without `hsl()` wrapper in `:root`               |
| No per-tenant builds | Palette changes are runtime CSS variables                       |
| Match manifest       | Set `theme_color` / `background_color` in `src/app/manifest.ts` |

## Checklist

- [ ] Brand palette set in `globals.css` light and dark modes
- [ ] Manifest colors match primary brand
- [ ] `icon-192.png` and `icon-512.png` in `public/icons/`

## Next step

[006 Data flow](./006_data-flow.md) — trace a request from UI to backend.
