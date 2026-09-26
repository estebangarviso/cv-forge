'use client';

import {
	AccordionContent,
	AccordionHeader,
	AccordionItem,
} from '@shared/ui/primitives/accordion';

interface CvFormSectionProps {
	children: React.ReactNode;
	title: string;
	value: string;
}

/**
 * Radix unmounts closed accordion content, which left react-hook-form unable to
 * hydrate fields when the Drive payload arrived after mount. `forceMount` keeps
 * every section registered and CSS hides the closed ones instead.
 */
export function CvFormSection({ children, title, value }: CvFormSectionProps) {
	return (
		<AccordionItem value={value}>
			<AccordionHeader className='sticky top-0 z-20 bg-background'>
				{title}
			</AccordionHeader>
			<AccordionContent
				className='space-y-3 in-data-[state=closed]:hidden'
				forceMount
			>
				{children}
			</AccordionContent>
		</AccordionItem>
	);
}
