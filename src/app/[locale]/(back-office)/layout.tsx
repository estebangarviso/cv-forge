export default function BackOfficeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex min-h-screen'>
			{/* Back Office sidebar placeholder */}
			<aside className='w-64 border-r bg-gray-50 p-4'>
				<h2 className='text-lg font-semibold'>Back Office</h2>
			</aside>
			<main className='flex-1 p-6'>{children}</main>
		</div>
	);
}
