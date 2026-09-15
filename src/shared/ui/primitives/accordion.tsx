'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@shared/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item
		className={cn('border-b', className)}
		ref={ref}
		{...props}
	/>
));
AccordionItem.displayName = 'AccordionItem';

interface AccordionHeaderProps extends React.ComponentPropsWithoutRef<
	typeof AccordionPrimitive.Trigger
> {
	triggerClassName?: string;
}

const AccordionHeader = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Trigger>,
	AccordionHeaderProps
>(
	(
		{
			children,
			className,
			triggerClassName,
			...props
		}: AccordionHeaderProps,
		ref,
	) => (
		<AccordionPrimitive.Header className={cn('flex', className)}>
			<AccordionPrimitive.Trigger
				className={cn(
					'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
					triggerClassName,
				)}
				ref={ref}
				{...props}
			>
				{children}
				<ChevronDown className='size-4 shrink-0 transition-transform duration-200' />
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	),
);
AccordionHeader.displayName = AccordionPrimitive.Header.displayName;

const AccordionContent = React.forwardRef<
	React.ComponentRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ children, className, ...props }, ref) => (
	<AccordionPrimitive.Content
		className='overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
		ref={ref}
		{...props}
	>
		<div className={cn('pt-0 pb-4', className)}>{children}</div>
	</AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionHeader, AccordionItem };
