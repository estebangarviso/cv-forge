'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CvData } from '../../domain/entities/cv-data';

export function useCvList() {
	return useQuery<Pick<CvData, 'id' | 'name' | 'updatedAt'>[]>({
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
			if (!res.ok) throw new Error('Failed to save CV');
			return res.json() as Promise<CvData>;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['cvs'] });
			queryClient.setQueryData(['cv', data.id], data);
		},
	});
}
