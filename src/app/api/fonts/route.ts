import { auth } from '@/auth';
import {
	getFontRepository,
	InvalidFontError,
	validateFontBuffer,
} from '@modules/font';
import { NextResponse } from 'next/server';

interface UploadFontBody {
	base64: string;
	family: string;
	originalFileName: string;
	/** Set to overwrite this existing font's content in place instead of creating a new file — only after the client has confirmed the duplicate prompt. */
	overwriteId?: string;
}

const FONTS_PAGE_SIZE = 10;

export async function GET(request: Request) {
	try {
		const session = await auth();
		if (!session?.accessToken) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const pageToken =
			new URL(request.url).searchParams.get('pageToken') ?? undefined;
		const page = await getFontRepository(session.accessToken).listPage({
			pageSize: FONTS_PAGE_SIZE,
			pageToken,
		});
		return NextResponse.json(page);
	} catch (error) {
		console.error('GET /api/fonts failed:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session?.accessToken) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const body = (await request.json()) as Partial<UploadFontBody>;
		if (!body.base64 || !body.family || !body.originalFileName) {
			return NextResponse.json(
				{ error: 'INVALID_REQUEST' },
				{ status: 400 },
			);
		}

		const buffer = Buffer.from(body.base64, 'base64');
		const { features, mimeType } = validateFontBuffer(buffer);

		const repo = getFontRepository(session.accessToken);

		// never silently create a second file for the same name — ask first,
		// unless the client already confirmed an overwrite for this exact id.
		if (!body.overwriteId) {
			const existing = await repo.findExisting(body.originalFileName);
			if (existing) {
				return NextResponse.json(
					{ error: 'DUPLICATE_FONT', existing },
					{ status: 409 },
				);
			}
		}

		const font = await repo.upload(body.base64, {
			family: body.family,
			features,
			mimeType,
			originalFileName: body.originalFileName,
			overwriteId: body.overwriteId,
		});

		return NextResponse.json(font, { status: 201 });
	} catch (error) {
		if (error instanceof InvalidFontError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		console.error('POST /api/fonts failed:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
