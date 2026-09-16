'use client';

import type { DocumentProps } from '@react-pdf/renderer';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { cn } from '@shared/utils';
import { Download, Loader2 } from 'lucide-react';

import { buttonVariants } from '../primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';

interface PDFDownloadButtonProps {
	fileName: string;
	label: string;
	pdfDocument: React.ReactElement<DocumentProps>;
}

/** Icon button + tooltip that downloads a react-pdf `Document` — parameterized so any document/fileName/label can reuse it. */
export function PDFDownloadButton({
	fileName,
	label,
	pdfDocument,
}: PDFDownloadButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<PDFDownloadLink
					aria-label={label}
					className={cn(
						buttonVariants({ size: 'icon', variant: 'outline' }),
					)}
					document={pdfDocument}
					fileName={fileName}
				>
					{({ loading }) =>
						loading ? (
							<Loader2 className='size-4 animate-spin' />
						) : (
							<Download className='size-4' />
						)
					}
				</PDFDownloadLink>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
