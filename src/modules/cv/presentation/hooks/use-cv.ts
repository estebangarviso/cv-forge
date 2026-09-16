'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type CvData, EMPTY_CV } from '../../domain/entities/cv-data';

export function useCvList() {
	return useQuery<Pick<CvData, 'cvTitle' | 'id' | 'updatedAt'>[]>({
		queryFn: async () => {
			const res = await fetch('/api/cv');
			if (!res.ok) throw new Error('Failed to fetch CVs');
			return res.json();
		},
		queryKey: ['cvs'],
	});
}

export function useCv(id: string | undefined) {
	return useQuery<CvData>({
		enabled: !!id,
		queryFn: async () => {
			const res = await fetch(`/api/cv/${id}`);
			if (!res.ok) throw new Error('Failed to fetch CV');
			return res.json();
		},
		queryKey: ['cv', id],
	});
}

export function useSaveCv() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (cv: CvData) => {
			const method = cv.id ? 'PUT' : 'POST';
			const url = cv.id ? `/api/cv/${cv.id}` : '/api/cv';
			const res = await fetch(url, {
				body: JSON.stringify(cv),
				headers: { 'Content-Type': 'application/json' },
				method,
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as {
					error?: string;
				};
				throw new Error(body.error ?? 'SAVE_FAILED');
			}
			return res.json() as Promise<CvData>;
		},
		onSuccess: (data) => {
			void queryClient.invalidateQueries({ queryKey: ['cvs'] });
			void queryClient.setQueryData(['cv', data.id], data);
		},
	});
}

export function useCreateCv() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (name?: string) => {
			const res = await fetch('/api/cv', {
				body: JSON.stringify({ ...EMPTY_CV, cvTitle: name ?? '' }),
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
			});
			if (!res.ok) throw new Error('Failed to create CV');
			return res.json() as Promise<CvData>;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['cvs'] });
		},
	});
}

export function useDeleteCv() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/cv/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete CV');
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['cvs'] });
		},
	});
}
