'use client';

import type { CustomFont } from '@modules/font';

import { registerCustomFont } from '@shared/ui/pdf';
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface CustomFontContent extends CustomFont {
	content: string;
}

interface FontsPage {
	fonts: CustomFont[];
	nextPageToken?: string;
}

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('error', () =>
			reject(reader.error ?? new Error('READ_FAILED')),
		);
		reader.addEventListener('load', () => {
			const result = reader.result as string;
			resolve(result.slice(result.indexOf(',') + 1));
		});
		reader.readAsDataURL(file);
	});
}

/** Thrown when a font with the same original file name already exists in Drive — carries it so the caller can offer to overwrite instead of guessing blind. */
export class DuplicateFontError extends Error {
	constructor(public readonly existing: CustomFont) {
		super('DUPLICATE_FONT');
		this.name = 'DuplicateFontError';
	}
}

/**
 * Uploads a font file to Drive via `/api/fonts`; the response includes the
 * server-verified `features` list (fontkit, never guessed). The server
 * checks for a same-named font first and responds 409 (surfaced here as
 * `DuplicateFontError`) unless `overwriteId` is passed, in which case it
 * overwrites that exact file's content/metadata in place.
 */
export function useUploadFont() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			family: string;
			file: File;
			overwriteId?: string;
		}) => {
			const base64 = await fileToBase64(input.file);
			const res = await fetch('/api/fonts', {
				body: JSON.stringify({
					base64,
					family: input.family,
					originalFileName: input.file.name,
					overwriteId: input.overwriteId,
				}),
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
			});
			if (res.status === 409) {
				const body = (await res.json()) as { existing: CustomFont };
				throw new DuplicateFontError(body.existing);
			}
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as {
					error?: string;
				};
				throw new Error(body.error ?? 'UPLOAD_FAILED');
			}
			return res.json() as Promise<CustomFont>;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['fonts-list'] });
		},
	});
}

/** Fonts uploaded to the shared Drive fonts folder (across all CVs), 10 at a time — lets the typography dialog's table offer any of them for the regular/bold roles and lazy-load more on scroll instead of fetching every font up front. */
export function useFontsList() {
	return useInfiniteQuery({
		getNextPageParam: (lastPage: FontsPage) => lastPage.nextPageToken,
		initialPageParam: undefined as string | undefined,
		queryFn: async ({ pageParam }) => {
			const url = pageParam
				? `/api/fonts?pageToken=${encodeURIComponent(pageParam)}`
				: '/api/fonts';
			const res = await fetch(url);
			if (!res.ok) throw new Error('FONTS_LIST_FETCH_FAILED');
			return res.json() as Promise<FontsPage>;
		},
		queryKey: ['fonts-list'],
	});
}

/** Permanently deletes a font from Drive — the caller must un-assign it from any CV's regular/bold slot first, since this never touches form state. */
export function useDeleteFont() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/fonts/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('DELETE_FAILED');
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['fonts-list'] });
		},
	});
}

/**
 * Fetches and registers a user-uploaded font (Fase 4). `id` is the regular
 * (400) weight and drives the shared `` `custom-${id}` `` family name;
 * `boldId`, if given, is an optional companion 700-weight face registered
 * under that SAME family. `isReady` only flips true AFTER every requested
 * face has actually been registered — react-pdf needs each face registered
 * BEFORE the first render that uses it, so callers must gate
 * `CvPdfDocument` on `isReady`, not on the fetches alone.
 */
export function useCustomFont(id: string | undefined, boldId?: string) {
	const [registeredRegularId, setRegisteredRegularId] = useState<string>();
	const [registeredBoldId, setRegisteredBoldId] = useState<string>();

	const regularQuery = useQuery<CustomFontContent>({
		enabled: !!id,
		queryFn: async () => {
			const res = await fetch(`/api/fonts/${id}`);
			if (!res.ok) throw new Error('CUSTOM_FONT_FETCH_FAILED');
			return res.json();
		},
		queryKey: ['custom-font', id],
		staleTime: Infinity, // uploaded font bytes never change for a given id
	});

	const boldQuery = useQuery<CustomFontContent>({
		enabled: !!boldId,
		queryFn: async () => {
			const res = await fetch(`/api/fonts/${boldId}`);
			if (!res.ok) throw new Error('CUSTOM_FONT_FETCH_FAILED');
			return res.json();
		},
		queryKey: ['custom-font', boldId],
		staleTime: Infinity,
	});

	useEffect(() => {
		if (!id || !regularQuery.data) return;
		registerCustomFont(
			regularQuery.data.id,
			`custom-${id}`,
			regularQuery.data.mimeType,
			regularQuery.data.content,
			400,
		);
		setRegisteredRegularId(id);
	}, [id, regularQuery.data]);

	useEffect(() => {
		if (!id || !boldQuery.data) return;
		registerCustomFont(
			boldQuery.data.id,
			`custom-${id}`,
			boldQuery.data.mimeType,
			boldQuery.data.content,
			700,
		);
		setRegisteredBoldId(boldId);
	}, [id, boldId, boldQuery.data]);

	return {
		boldOriginalFileName: boldQuery.data?.originalFileName,
		features: regularQuery.data?.features,
		isError: regularQuery.isError || boldQuery.isError,
		// a fetch error (deleted/stale font id) also unblocks `isReady` — otherwise
		// a face that will NEVER arrive (registered) leaves the preview stuck
		// "loading" forever instead of falling back to the bundled font.
		isReady:
			(!id || registeredRegularId === id || regularQuery.isError) &&
			(!boldId || registeredBoldId === boldId || boldQuery.isError),
		originalFileName: regularQuery.data?.originalFileName,
	};
}
