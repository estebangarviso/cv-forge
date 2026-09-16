# API access

`src/core/api/` wraps `openapi-fetch` so every request is checked against an OpenAPI 3.1 schema. Repository adapters use `getHttpClient()` + Zod for paths not in the spec.

## Quick path (monolithic — built-in API routes)

By default the template uses Next.js API routes as its backend. Modules call these via `getHttpClient()` or `fetch()` — no generated types needed.

## Quick path (external backend)

1. Generate types: `OPENAPI_SPEC_URL=… pnpm openapi:gen` → `src/core/api/v1.ts` (git-ignored).
2. Import the generated paths: `import type { paths } from '@core/api/v1'`
3. Wire the client: `createApiCoreClient<paths>(baseUrl)`.
4. Use `useApiClient()` in presentation hooks for typed paths.

See [Connect an external backend](../guides/002_connect-external-backend.md) for a step-by-step migration.

## Transport split

| Use case                                | Transport                              | Where                          |
| --------------------------------------- | -------------------------------------- | ------------------------------ |
| Built-in API routes                     | `getHttpClient()` or `fetch('/api/…')` | `infrastructure/repositories/` |
| Typed OpenAPI paths (external)          | `useApiClient()` / openapi-fetch       | `presentation/hooks/`          |
| Repository adapters, non-spec endpoints | `getHttpClient()` + Zod                | `infrastructure/repositories/` |

## Typed client setup

1. `createApiCoreClient<Paths>(baseUrl)` builds a client typed against your OpenAPI paths.
2. `ApiProvider` injects the client; components read it via `useApiClient()`.
3. Extend the provider with custom headers (auth, tenant, etc.) by adding middleware in `context.tsx`.

Do **not** hardcode API URLs — use env vars and the provider.

## Repository HTTP example

For endpoints not covered by the generated OpenAPI spec:

```typescript
export class HttpAuthRepository implements AuthRepository {
	constructor(private readonly http: HttpClient) {}

	async login(credentials: LoginCredentials): Promise<Session> {
		return this.http.post('/auth/login', credentials, SessionSchema);
	}
}
```

Wire the singleton in the module factory (`*.factory.ts`): `new HttpAuthRepository(getHttpClient())`.

## Checklist

- [ ] Hooks use `useApiClient()` for spec-covered paths (external backend)
- [ ] Repositories validate responses with Zod schemas
- [ ] API URLs come from env vars, never hardcoded

## Next step

[004 Module contract](./004_module-contract.md) — scaffold and expose a feature module.
