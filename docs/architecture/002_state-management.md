# State management

Pick the lane by asking _"who owns this data?"_ Server data stays in TanStack Query; synchronous client facts live in Zustand. **Never mirror server data into a store.**

## Quick path

| Lane         | Owner               | Tool           | Location                             |
| ------------ | ------------------- | -------------- | ------------------------------------ |
| Server state | The backend         | TanStack Query | `presentation/hooks/use-*.ts`        |
| Client state | The browser session | Zustand        | `presentation/state/<name>.store.ts` |

## Rules

| Rule                   | Detail                                                                     |
| ---------------------- | -------------------------------------------------------------------------- |
| Server data → Query    | Fetch with `useQuery`, mutate with `useMutation`; cache is source of truth |
| Client facts → Zustand | Resolved session identity, UI toggles, wizards — synchronous only          |
| No duplication         | Do not copy API responses into Zustand                                     |
| No Redux               | No MobX or other centralized state managers                                |

## Example

```typescript
// Client state — Zustand store (module: presentation/state/<name>.store.ts)
export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,
	setSession: (s) => set({ user: s.user, isAuthenticated: true }),
	clearSession: () => set({ user: null, isAuthenticated: false }),
}));

// Server state — TanStack Query mutation (module: presentation/hooks/use-*.ts)
const loginMutation = useMutation({
	mutationFn: (creds: LoginCredentials) => loginUseCase.execute(creds),
	onSuccess: (session) => setSession(session),
});
```

The auth module stores the resolved `Session` in Zustand so any component can read `isAuthenticated` without a hook waterfall. The login _request_ lifecycle lives in the Query mutation.

## Checklist

- [ ] Async backend data uses `useQuery` / `useMutation`
- [ ] Zustand holds only synchronous client facts
- [ ] No server response copied into a store
- [ ] `queryKey` includes tenant scope when data is tenant-specific

## Next step

[003 API access](./003_api-access.md) — wire the typed client and repository HTTP.
