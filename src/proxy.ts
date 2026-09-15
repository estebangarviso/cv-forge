import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from './auth';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const BACK_OFFICE_PATTERN = /^\/[a-z]{2}\/(?:editor|resumes)(?:\/|$)/u;
const LOGIN_PATTERN = /^\/[a-z]{2}\/login$/u;

function redirectToLogin(request: NextRequest, locale: string) {
	const response = NextResponse.redirect(
		new URL(`/${locale}/login`, request.url),
	);
	const expiredCookie = { expires: new Date(0), maxAge: 0, path: '/' };

	response.cookies.set('authjs.session-token', '', expiredCookie);
	response.cookies.set('__Secure-authjs.session-token', '', expiredCookie);

	return response;
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const locale = pathname.split('/')[1] || 'es';

	if (BACK_OFFICE_PATTERN.test(pathname)) {
		const session = await auth();
		if (session?.error === 'RefreshTokenError') {
			return redirectToLogin(request, locale);
		}
		if (!session) {
			return redirectToLogin(request, locale);
		}
	}

	if (LOGIN_PATTERN.test(pathname)) {
		const session = await auth();
		if (session?.error === 'RefreshTokenError') {
			return redirectToLogin(request, locale);
		}
		if (session) {
			return NextResponse.redirect(
				new URL(`/${locale}/resumes`, request.url),
			);
		}
	}

	return handleI18nRouting(request);
}

export const config = {
	// eslint-disable-next-line unicorn/prefer-string-raw
	matcher: ['/((?!_next|api|.*\\..*).*)'],
};
