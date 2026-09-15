import { AuthGuard } from '@/modules/auth';

import { AppShell } from './_components/app-shell';

export default function BackOfficeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthGuard>
			<AppShell>{children}</AppShell>
		</AuthGuard>
	);
}
