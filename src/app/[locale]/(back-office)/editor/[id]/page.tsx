import { EditorClient } from './editor-client';

interface EditorPageProps {
	params: Promise<{ id: string; locale: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
	const { id } = await params;

	// TODO: fetch CV data from Drive by id
	return <EditorClient id={id} />;
}
