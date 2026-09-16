import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
	// optimized, self-contained build output for Docker/containerized deploys
	output: 'standalone',
	// auto-memoization for the functional React architecture (Next.js 16 top-level)
	reactCompiler: true,
	reactStrictMode: true,
	// statically typed Links/routes (Next.js 16 top-level, moved out of experimental)
	typedRoutes: true,
	// placeholder: configure external API rewrites here
	// async rewrites() {
	//   return [
	//     {
	//       source: '/api/v1/:path*',
	//       destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
	//     },
	//   ];
	// },
};

export default withNextIntl(nextConfig);
