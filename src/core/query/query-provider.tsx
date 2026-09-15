'use client';

import {
	QueryClient,
	type QueryClientConfig,
	QueryClientProvider,
} from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

/**
 * Sensible defaults for server-state caching. Tune per app as needed.
 * `staleTime` keeps data fresh for a minute to avoid refetch storms; retries
 * are conservative so failed mutations surface quickly to the user.
 */
const DEFAULT_CONFIG: QueryClientConfig = {
	defaultOptions: {
		mutations: {
			retry: 0,
		},
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 60_000,
		},
	},
};

interface QueryProviderProps {
	children: ReactNode;
}

/**
 * Provides a single, render-stable TanStack Query client to the tree.
 *
 * The client is created lazily inside `useState` so each browser tab / SSR
 * request gets its own cache instance instead of sharing a module-level
 * singleton (which would leak state across users during SSR).
 */
export function QueryProvider({ children }: QueryProviderProps) {
	const [queryClient] = useState(() => new QueryClient(DEFAULT_CONFIG));

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}
