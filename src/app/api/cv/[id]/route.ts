import { NextResponse } from 'next/server';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	// TODO: fetch from Google Drive
	return NextResponse.json({ id });
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const body = await request.json();
	// TODO: update in Google Drive
	return NextResponse.json({ ...body, id });
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	// TODO: delete from Google Drive
	return new NextResponse(null, { status: 204 });
}
