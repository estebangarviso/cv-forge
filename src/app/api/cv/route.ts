import { auth } from '@/auth';
import { getCvRepository } from '@modules/cv/infrastructure/cv.factory';
import { CvNameConflictError } from '@modules/cv/infrastructure/drive-cv.repository';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const session = await auth();
		if (!session?.accessToken) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const repo = getCvRepository(session.accessToken);
		const cvs = await repo.list();
		return NextResponse.json(cvs);
	} catch (error) {
		console.error('GET /api/cv failed:', error);
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

		const body = await request.json();
		const repo = getCvRepository(session.accessToken);
		const created = await repo.save(body);
		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		if (error instanceof CvNameConflictError) {
			return NextResponse.json({ error: error.message }, { status: 409 });
		}
		console.error('POST /api/cv failed:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
