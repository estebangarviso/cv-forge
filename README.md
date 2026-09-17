<p align="center">
  <img src="public/logo.svg" alt="CVForge" width="96" height="96" />
</p>

<h1 align="center">CVForge</h1>

<p align="center">Build, edit, and export a professional CV — stored in your own Google Drive, no separate database.</p>

## Quick start

1. Install dependencies and copy the env template:

    ```bash
    pnpm install
    cp .env.local.example .env.local   # add your Google OAuth credentials (see below)
    ```

2. Start the dev server:

    ```bash
    pnpm dev
    ```

3. Open [http://localhost:3000](http://localhost:3000) — you should land on the login page and sign in with Google.

## Environment variables

| Variable                                                                                                                                                                        | Required | Description                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `AUTH_SECRET`                                                                                                                                                                   | Yes      | Random secret for Auth.js (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID`                                                                                                                                                              | Yes      | Google OAuth client ID                                |
| `GOOGLE_CLIENT_SECRET`                                                                                                                                                          | Yes      | Google OAuth client secret                            |  | `ALLOWED_EMAILS` | No | Comma-separated emails/`@domain.com` wildcards allowed to sign in. Unset = anyone with a Google account. |
| Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). Set the redirect URI to `http://localhost:3000/api/auth/callback/google`. |

## Stack

| Concern   | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19  |
| Auth      | Auth.js v5 (Google OAuth)                     |
| Storage   | Google Drive API v3 — no database             |
| Forms     | react-hook-form + Zod                         |
| State     | TanStack Query (server) + Zustand (client)    |
| Styling   | Tailwind CSS v4                               |
| PDF       | `@react-pdf/renderer` (live preview + export) |
| i18n      | next-intl (es, en)                            |
| Deploy    | Vercel                                        |

## Architecture

Feature modules live in `src/modules/` with hexagonal layering (`domain` / `infrastructure` / `presentation`), each exposing only a public `index.ts` barrel. Google Drive is the sole persistence layer — every CV is a JSON file in the user's own Drive.

- [AGENTS.md](./AGENTS.md) — conventions every contributor (human or AI) follows.
- [docs/](./docs/) — architecture deep dives, getting-started guides, and delivery workflow.

## You're set up when

- [ ] `pnpm dev` runs without errors and the login page loads.
- [ ] Signing in with Google redirects back to the app.
- [ ] `pnpm lint`, `pnpm type-check`, and `pnpm test` all pass.

## Next step

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request, and [docs/guides/001_trunk-based-stacked-prs.md](./docs/guides/001_trunk-based-stacked-prs.md) if your change ships as a stack.
