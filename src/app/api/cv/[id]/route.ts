import { auth } from '@/auth';
import { getCvRepository } from '@modules/cv/infrastructure/cv.factory';
import { CvNameConflictError } from '@modules/cv/infrastructure/drive-cv.repository';
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
		const repo = getCvRepository(session.accessToken);
		const cv = await repo.getById(id);

		if (!cv) {
			return NextResponse.json({ error: 'Not found' }, { status: 404 });
		}

		return NextResponse.json(cv);
	} catch (error) {
		console.error('GET /api/cv/[id] failed:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: Request,
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
		const body = await request.json();
		const repo = getCvRepository(session.accessToken);
		const updated = await repo.save({ ...body, id });
		return NextResponse.json(updated);
	} catch (error) {
		if (error instanceof CvNameConflictError) {
			return NextResponse.json({ error: error.message }, { status: 409 });
		}
		console.error('PUT /api/cv/[id] failed:', error);
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
		const repo = getCvRepository(session.accessToken);
		await repo.delete(id);
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error('DELETE /api/cv/[id] failed:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
