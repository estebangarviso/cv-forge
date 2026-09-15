# Customize your fork

Turn this **business-logic-agnostic** starter into a real product (e.g. `acme-frontend`) in two passes: a mechanical one (`pnpm init:project`) and a judgment one (domain, brand, rules).

## Quick path

1. Run `pnpm init:project` — replaces every `(((placeholder)))` across the repo.
2. Complete the [judgment checklist](#judgment--adapt-with-your-team-or-an-ai-assistant) with your team or an AI assistant.
3. Keep source-of-truth files in sync: `README.md`, `AGENTS.md`, `docs/README.md`, `docs/architecture/00_index.md`, `package.json`.
4. See the [worked example](../guides/001_fork-customization-example.md) for a full walkthrough.

## Mechanical — handled by `pnpm init:project`

The initializer prompts once and rewrites placeholders. **Do not hand-edit these** — re-run the script instead.

| Placeholder                                                | Fills                                                           |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| `project-name`, `app-name`, `app-title`, `app-description` | Package name, PWA manifest, `<title>`, metadata                 |
| `app-backend-title`                                        | Human name of the backend this app calls (docs + code comments) |
| `base-path`, `base-url`                                    | Route base and public URL (metadata, manifest)                  |
| `font-family`, `font-weights`                              | Google Font import in the root layout                           |
| `default-locale`, `supported-locales`                      | i18n config in `src/modules/i18n/`                              |
| `default-branch`                                           | CI workflow branch triggers (`.github/workflows/ci.yml`)        |

## Judgment — adapt with your team or an AI assistant

These carry the template's _agnostic defaults_. A real project must rewrite them to encode its own domain, brand, and rules.

| Area                | File(s)                                                                                           | Make it yours                                                                                                                                                          | Example prompt                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent contract**  | [`AGENTS.md`](../../AGENTS.md)                                                                    | Add your product name + domain glossary, list your real modules, and replace the agnostic guardrails (e.g. _"no proprietary product names"_ under **What NOT to do**). | _"Update AGENTS.md for Acme: we're a logistics SaaS; allow the Acme name, add a domain glossary (Shipment, Carrier, Manifest), and list our modules under **Architecture rules**."_ |
| **Docs**            | [`docs/README.md`](../README.md), [`docs/architecture/`](../architecture/00_index.md), `llms.txt` | Swap the generic architecture narrative for your bounded contexts and modules; drop the "agnostic" caveats.                                                            | _"Rewrite docs/architecture/004_module-contract.md to describe Acme's shipments and billing modules."_                                                                              |
| **Example modules** | `src/modules/auth/`, `src/app/[lang]/(back-office)/{customers,employees}/`                        | The `auth` module and sample tables are reference scaffolding. Replace sample data with real TanStack Query calls and add your own modules.                            | _"Replace the customers sample table with a TanStack Query hook that fetches from GET /customers using the typed API client."_                                                      |
| **Brand & theme**   | `src/app/globals.css`, `src/app/manifest.ts`, `public/icons/`                                     | Set the CSS-variable palette (`--primary`, `--background`, …), manifest `theme_color` / `background_color`, and drop in your `icon-192.png` / `icon-512.png`.          | _"Set the light/dark CSS variables in globals.css to Acme's brand palette (primary #0055ff) and update manifest theme colors to match."_                                            |
| **Code ownership**  | [`.github/CODEOWNERS`](../../.github/CODEOWNERS)                                                  | Replace every `@OWNER` with your GitHub user or team.                                                                                                                  | —                                                                                                                                                                                   |
| **Security policy** | [`SECURITY.md`](../../SECURITY.md)                                                                | Add a real disclosure contact and supported-versions policy.                                                                                                           | —                                                                                                                                                                                   |
| **Environment**     | `.env` (copy from `.env.example`)                                                                 | Point `NEXT_PUBLIC_API_URL` at your backend and set the public base URL.                                                                                               | —                                                                                                                                                                                   |

## Checklist

- [ ] `pnpm init:project` completed (or re-run after changing placeholders)
- [ ] `AGENTS.md` reflects your product name, modules, and domain rules
- [ ] Architecture docs describe your real bounded contexts
- [ ] Theme, manifest, and icons match your brand
- [ ] `.env` points at your backend
- [ ] `llms.txt` aligned with `AGENTS.md`

## Next step

[Fork customization example](../guides/001_fork-customization-example.md) — end-to-end Acme Logistics walkthrough.
