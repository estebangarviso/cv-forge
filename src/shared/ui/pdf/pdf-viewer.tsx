'use client';

import type { DocumentProps } from '@react-pdf/renderer';

import { PDFViewer as ReactPdfViewer } from '@react-pdf/renderer';

interface PdfViewerProps {
	children: React.ReactElement<DocumentProps>;
	className?: string;
}

/** Live PDF preview via the browser's native viewer — always matches the exported file, no custom pagination logic. */
export function PdfViewer({ children, className }: PdfViewerProps) {
	return (
		<ReactPdfViewer
			className={className}
			style={{ border: 'none', height: '100%', width: '100%' }}
		>
			{children}
		</ReactPdfViewer>
	);
}
