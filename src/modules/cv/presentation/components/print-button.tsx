'use client';

export function PrintButton() {
	return (
		<button
			className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 print:hidden'
			onClick={() => window.print()}
			type='button'
		>
			Exportar PDF
		</button>
	);
}
