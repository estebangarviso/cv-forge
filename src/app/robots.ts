import type { MetadataRoute } from 'next';

// private deployment — access is gated by ALLOWED_EMAILS, so nothing here should be crawled.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { disallow: '/', userAgent: '*' },
	};
}
