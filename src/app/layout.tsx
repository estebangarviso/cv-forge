/**
 * Root layout — required by Next.js App Router.
 *
 * The actual <html> and <body> elements are rendered by `app/[lang]/layout.tsx`,
 * which also loads the font, sets the lang attribute, and provides translations.
 *
 * This file must exist but acts as a transparent pass-through.
 */
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
