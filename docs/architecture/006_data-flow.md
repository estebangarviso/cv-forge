# Data flow

A typical user action flows from the UI through hooks and use cases to the backend, then back into Query cache and (when needed) Zustand for client identity.

## Quick path

```
User action → Component (react-hook-form)
            → Hook (TanStack Query)
            → Use Case (domain)
            → Repository (port) → Route handler (/api/cv) → Google Drive API
                                        ↓
            Zod-validated response → Query cache (server state)
                                   → Zustand store (client identity)
```

## Layer trace

| Step | Layer      | Responsibility                                               |
| ---- | ---------- | ------------------------------------------------------------ |
| 1    | Component  | Collect input via `react-hook-form` + Zod                    |
| 2    | Hook       | Orchestrate `useQuery` / `useMutation`                       |
| 3    | Use case   | Pure domain logic; no framework imports                      |
| 4    | Repository | Call API via `useApiClient()` transport or `getHttpClient()` |
| 5    | Response   | Zod validation → Query cache; session facts → Zustand        |

## Example: login

1. `LoginForm` submits credentials via `react-hook-form`.
2. `useLogin` mutation calls `loginUseCase.execute(creds)`.
3. `HttpAuthRepository` posts to `/auth/login` with `SessionSchema` validation.
4. On success: session stored in `useAuthStore` (client identity); server profile refetched via Query if needed.

## Rules

| Rule            | Detail                                                    |
| --------------- | --------------------------------------------------------- |
| Forms           | `react-hook-form` + `zodResolver` exclusively             |
| Server data     | Lands in TanStack Query cache — not Zustand               |
| Client identity | Session/auth facts may update Zustand on mutation success |
| Validation      | Zod at form boundary and repository response boundary     |

## Checklist

- [ ] Business logic in use cases, not route handlers
- [ ] Repositories are the only layer that talks HTTP
- [ ] Responses validated before entering Query cache

## Next step

[Architecture hub](./00_index.md) — return to the overview and related docs.
