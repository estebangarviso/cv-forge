import { describe, expect, it } from 'vitest';

import {
	isEmailAllowed,
	parseAllowedEmails,
} from './is-email-allowed.use-case';

describe('parseAllowedEmails', () => {
	const aliceDummyEmail = 'alice@example.com';
	it('returns an empty list when the input is undefined or empty', () => {
		expect(parseAllowedEmails(undefined)).toStrictEqual([]);
		expect(parseAllowedEmails('')).toStrictEqual([]);
	});

	it('splits, trims, and lowercases comma-separated entries', () => {
		expect(
			parseAllowedEmails(
				' Alice@Example.com, @Company.com ,bob@example.com',
			),
		).toStrictEqual([aliceDummyEmail, '@company.com', 'bob@example.com']);
	});

	it('drops empty entries produced by trailing commas', () => {
		expect(parseAllowedEmails(`${aliceDummyEmail},,`)).toStrictEqual([
			aliceDummyEmail,
		]);
	});
});

describe('isEmailAllowed', () => {
	it('allows any email when the allowlist is empty', () => {
		expect(isEmailAllowed('anyone@anywhere.com', [])).toBe(true);
		expect(isEmailAllowed(null, [])).toBe(true);
	});

	it('rejects null/undefined emails when the allowlist is non-empty', () => {
		expect(isEmailAllowed(null, [mockAliceEmail])).toBe(false);
		expect(isEmailAllowed(undefined, [mockAliceEmail])).toBe(false);
	});

	it('matches an exact email case-insensitively', () => {
		expect(isEmailAllowed(mockAliceEmail, [mockAliceEmail])).toBe(true);
		expect(isEmailAllowed('bob@example.com', [mockAliceEmail])).toBe(false);
	});

	it('matches a domain wildcard entry', () => {
		const allowlist = ['@company.com'];

		expect(isEmailAllowed('anyone@company.com', allowlist)).toBe(true);
		expect(isEmailAllowed('anyone@other.com', allowlist)).toBe(false);
	});

	it('matches against a mixed allowlist of exact emails and domains', () => {
		const allowlist = [mockAliceEmail, '@company.com'];

		expect(isEmailAllowed(mockAliceEmail, allowlist)).toBe(true);
		expect(isEmailAllowed('someone@company.com', allowlist)).toBe(true);
		expect(isEmailAllowed('bob@example.com', allowlist)).toBe(false);
	});
});
