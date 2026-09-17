const DOMAIN_PREFIX = '@';

/** Parses a comma-separated allowlist string (exact emails or `@domain.com` wildcards) into a normalized list. */
export function parseAllowedEmails(raw: string | undefined): string[] {
	if (!raw) return [];

	return raw
		.split(',')
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
}

/**
 * Checks whether an email is authorized to sign in. An empty allowlist means
 * no restriction is configured (allow-all) — this keeps the feature opt-in
 * for forks that don't need access control.
 */
export function isEmailAllowed(
	email: string | null | undefined,
	allowlist: readonly string[],
): boolean {
	if (allowlist.length === 0) return true;
	if (!email) return false;

	const normalizedEmail = email.trim().toLowerCase();

	return allowlist.some((entry) =>
		entry.startsWith(DOMAIN_PREFIX)
			? normalizedEmail.endsWith(entry)
			: normalizedEmail === entry,
	);
}
