import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { auth, handlers, signIn, signOut } = NextAuth({
	callbacks: {
		async jwt({ account, token }) {
			if (account) {
				token.accessToken = account.access_token;
				token.refreshToken = account.refresh_token;
				token.expiresAt = account.expires_at;
				return token;
			}

			if (
				typeof token.expiresAt === 'number' &&
				Date.now() < token.expiresAt * 1000
			) {
				return token;
			}

			// access token expired — refresh it
			try {
				const res = await fetch('https://oauth2.googleapis.com/token', {
					body: new URLSearchParams({
						client_id: process.env.GOOGLE_CLIENT_ID!,
						client_secret: process.env.GOOGLE_CLIENT_SECRET!,
						grant_type: 'refresh_token',
						refresh_token: token.refreshToken as string,
					}),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					method: 'POST',
				});
				const data = await res.json();
				if (!res.ok)
					throw new Error(
						data.error_description ?? 'Token refresh failed',
					);
				// eslint-disable-next-line require-atomic-updates -- sequential mutations inside a single jwt callback, not concurrent
				token.accessToken = data.access_token;
				// eslint-disable-next-line require-atomic-updates
				token.expiresAt =
					Math.floor(Date.now() / 1000) + (data.expires_in as number);
				return token;
			} catch (error) {
				console.error('Token refresh failed:', error);
				return { ...token, error: 'RefreshTokenError' };
			}
		},
		session({ session, token }) {
			return {
				...session,
				accessToken: token.accessToken as string,
				error: token.error,
			};
		},
	},
	providers: [
		Google({
			authorization: {
				params: {
					access_type: 'offline',
					prompt: 'consent',
					scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
				},
			},
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
});
