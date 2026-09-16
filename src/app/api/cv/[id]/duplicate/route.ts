import { auth } from '@/auth';
import {
	getCvRepository,
	getDuplicateCvUseCase,
} from '@modules/cv/infrastructure/cv.factory';
import { CvNameConflictError } from '@modules/cv/infrastructure/drive-cv.repository';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// validate copyTitle input
const DuplicateRequestSchema = z.object({
	copyTitle: z
		.string()
		.min(1, 'Copy title cannot be empty')
		.max(255, 'Copy title too long'),
});

export async function POST(
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

		const { id: sourceId } = await params;

		// parse and validate request body
		const body = await request.json().catch(() => ({}));
		const validation = DuplicateRequestSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error:
						validation.error.issues[0]?.message ?? 'Invalid input',
				},
				{ status: 400 },
			);
		}

		const { copyTitle } = validation.data;

		// initialize repository and use case with authenticated access token
		const repo = getCvRepository(session.accessToken);
		// set up factory singleton for this request
		const { setCvRepository } =
			await import('@modules/cv/infrastructure/cv.factory');
		setCvRepository(repo);

		const useCase = getDuplicateCvUseCase();
		const duplicated = await useCase.execute(sourceId, copyTitle);

		return NextResponse.json(duplicated, { status: 201 });
	} catch (error) {
		if (error instanceof CvNameConflictError) {
			return NextResponse.json(
				{ error: 'NAME_CONFLICT' },
				{ status: 409 },
			);
		}

		console.error('POST /api/cv/[id]/duplicate failed:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
