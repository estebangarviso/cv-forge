'use client';

import { create } from 'zustand';

interface CvEditorState {
	activeSection: string | null;
	isDirty: boolean;
	setActiveSection: (section: string | null) => void;
	setDirty: (dirty: boolean) => void;
}

export const useCvEditorStore = create<CvEditorState>((set) => ({
	activeSection: null,
	isDirty: false,
	setActiveSection: (section) => set({ activeSection: section }),
	setDirty: (dirty) => set({ isDirty: dirty }),
}));
