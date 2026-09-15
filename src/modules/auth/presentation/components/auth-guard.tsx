import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function AuthGuard({ children }: { children: React.ReactNode }) {
	const session = await auth();
	if (!session) {
		redirect('/login');
	}
	// eslint-disable-next-line react/jsx-no-useless-fragment -- ReactNode must be wrapped to be a valid return type
	return <>{children}</>;
}
