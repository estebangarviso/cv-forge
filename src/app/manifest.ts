import type { MetadataRoute } from 'next';

/**
 * PWA Web App Manifest — served at /manifest.webmanifest by Next.js.
 * Icons must be placed in public/icons/ (192x192 and 512x512 PNG).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
	return {
		background_color: '#ffffff',
		description:
			'CV builder with Google OAuth, Drive storage, and browser-native PDF export',
		display: 'standalone',
		icons: [
			{
				sizes: '192x192',
				src: '/icons/icon-192.png',
				type: 'image/png',
			},
			{
				sizes: '512x512',
				src: '/icons/icon-512.png',
				type: 'image/png',
			},
			{
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore — "maskable" is valid per spec but Next.js types lag behind
				purpose: 'maskable',
				sizes: '512x512',
				src: '/icons/icon-512.png',
				type: 'image/png',
			},
		],
		name: 'CV Studio',
		orientation: 'portrait',
		short_name: 'cv-studio',
		start_url: '/app',
		theme_color: '#000000',
	};
}
