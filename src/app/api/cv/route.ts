import { NextResponse } from 'next/server';

export function GET() {
	// TODO: connect to Google Drive via session accessToken
	return NextResponse.json([]);
}

export async function POST(request: Request) {
	const body = await request.json();
	// TODO: save to Google Drive
	return NextResponse.json(body, { status: 201 });
}
