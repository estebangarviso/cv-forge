import { create } from 'fontkit';

export const MAX_FONT_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export class InvalidFontError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InvalidFontError';
	}
}

const MAGIC_ASCII: Record<string, string> = {
	OTTO: 'font/otf',
	true: 'font/ttf', // older TrueType (Mac)
	wOF2: 'font/woff2',
	wOFF: 'font/woff',
};

/** Sniffs the real container format from file bytes — never trust the client-sent MIME type. Explicitly rejects `ttcf` (font collections): `Font.register` throws on those. */
function sniffFontMimeType(buffer: Buffer): string | undefined {
	if (buffer.byteLength < 4) return undefined;
	const ascii = buffer.subarray(0, 4).toString('binary');
	if (ascii in MAGIC_ASCII) return MAGIC_ASCII[ascii];
	// sfnt v1 (modern TrueType) header is the 4-byte value 0x00010000
	if (buffer.readUInt32BE(0) === 0x00_01_00_00) return 'font/ttf';
	return undefined;
}

export interface ValidatedFont {
	features: string[];
	mimeType: string;
}

/** Verifies size, real magic bytes, and parseability with the same lib react-pdf uses internally; returns the font's actual OpenType feature list (never guessed). Throws `InvalidFontError` for anything unusable. */
export function validateFontBuffer(buffer: Buffer): ValidatedFont {
	if (buffer.byteLength === 0 || buffer.byteLength > MAX_FONT_SIZE_BYTES) {
		throw new InvalidFontError('FONT_TOO_LARGE');
	}

	const mimeType = sniffFontMimeType(buffer);
	if (!mimeType) {
		throw new InvalidFontError('UNSUPPORTED_FONT_FORMAT');
	}

	let font;
	try {
		font = create(buffer);
	} catch {
		throw new InvalidFontError('CORRUPT_FONT_FILE');
	}
	// a collection (.ttc/.otc) can still pass the single-font magic-byte
	// check above if malformed; fontkit exposes it as a `FontCollection`
	// with a `fonts` array instead of a single font's own properties.
	if ('fonts' in font) {
		throw new InvalidFontError('FONT_COLLECTIONS_NOT_SUPPORTED');
	}

	return { features: font.availableFeatures ?? [], mimeType };
}
