import { auth } from '@/auth';
import { getFontRepository } from '@modules/font';
import { NextResponse } from 'next/server';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.accessToken) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const { id } = await params;
		const repo = getFontRepository(session.accessToken);
		const [meta, content] = await Promise.all([
			repo.getMetadata(id),
			repo.getContent(id),
		]);

		if (!meta) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}

		return NextResponse.json({ ...meta, content });
	} catch (error) {
		console.error('GET /api/fonts/[id] failed:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session?.accessToken) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const { id } = await params;
		await getFontRepository(session.accessToken).delete(id);
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error('DELETE /api/fonts/[id] failed:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
