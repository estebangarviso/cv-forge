'use client';

import { QueryProvider } from '@core/query/query-provider';
import { Toaster } from '@shared/ui/primitives/sonner';
import { TooltipProvider } from '@shared/ui/primitives/tooltip';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';

interface ProvidersProps {
	children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	return (
		<SessionProvider>
			<QueryProvider>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					disableTransitionOnChange
					enableSystem
				>
					<TooltipProvider>{children}</TooltipProvider>
					<Toaster position='top-center' richColors />
				</ThemeProvider>
			</QueryProvider>
		</SessionProvider>
	);
}
