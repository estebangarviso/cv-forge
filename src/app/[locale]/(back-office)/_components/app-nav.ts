import { FileText, type LucideIcon } from 'lucide-react';

export const RESUMES_HREF = '/resumes';

export interface NavItem {
	href: string;
	icon: LucideIcon;
	labelKey: string;
}

export const APP_NAV_ITEMS: NavItem[] = [
	{ href: RESUMES_HREF, icon: FileText, labelKey: 'nav.resumes' },
];
