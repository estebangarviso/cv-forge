---
name: google-oauth-token-refresh
description: 'Trigger: token refresh, RefreshTokenError, expired session, re-login, force sign out. Recover from failed Google OAuth token refresh.'
license: Proprietary
metadata:
    author: estebangarviso
    version: '1.0'
---

## Activation Contract

Use when touching `src/auth.ts` JWT/session callbacks, `src/proxy.ts` session gating, or debugging stale/expired Google access tokens.

## Hard Rules

- The `jwt` callback refreshes the Google access token when `token.expiresAt` has passed, using the stored `refreshToken` against `https://oauth2.googleapis.com/token`.
- On refresh failure, the `jwt` callback MUST return `{ ...token, error: 'RefreshTokenError' }` — never silently keep the stale `accessToken`.
- The `session` callback MUST propagate `token.error` onto the session object (`session.error`); route handlers and `proxy.ts` cannot see JWT-only fields.
- `proxy.ts` MUST treat `session?.error === 'RefreshTokenError'` the same as "no session": redirect to `/${locale}/login` and expire both `authjs.session-token` and `__Secure-authjs.session-token` cookies (`path: '/'`, `maxAge: 0`).
- Type augmentation for `session.error` / `jwt.error` lives in `src/types/next-auth.d.ts` — extend it there, not with local `as` casts.

## Decision Gates

| Symptom                                                     | Root cause                                                                        | Fix location                                                 |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Drive calls return 401 after being idle                     | Refresh failed but session still has old token                                    | `session` callback must expose `error`                       |
| User stuck on protected page after refresh failure          | `proxy.ts` isn't checking `session.error`                                         | Add a `RefreshTokenError` branch before the `!session` check |
| Login page redirects back into itself after refresh failure | Login-route check also needs the `RefreshTokenError` branch (treat as logged-out) |
| Type error `Property 'error' does not exist on Session`     | Missing `next-auth` / `next-auth/jwt` module augmentation                         | Update `src/types/next-auth.d.ts`                            |

## Execution Steps

1. Change refresh logic only inside the `jwt` callback's catch block.
2. Mirror any new JWT field into the `session` callback and `next-auth.d.ts`.
3. Add matching `session?.error === 'RefreshTokenError'` guards to every `proxy.ts` branch that checks `session`.
4. Run `pnpm type-check` — Auth.js types are strict and will catch missing augmentations immediately.

## Output Contract

A failed refresh always results in: session marked with `error: 'RefreshTokenError'`, both session cookies expired, and a redirect to the locale-aware login page — never a silently stale session.

## References

- `src/auth.ts`, `src/proxy.ts`, `src/types/next-auth.d.ts`
