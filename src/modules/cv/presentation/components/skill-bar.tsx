interface SkillBarProps {
	label: string;
	level: number;
	subtitle?: string;
}

export function SkillBar({ label, level, subtitle }: SkillBarProps) {
	return (
		<div className='mb-1'>
			<p className='text-[9pt]'>{label}</p>
			{subtitle && (
				<p className='text-[7.5pt]' style={{ color: '#555555' }}>
					{subtitle}
				</p>
			)}
			<div className='mt-0.5 h-[3px] w-full rounded-none bg-black/15'>
				<div
					className='h-full rounded-none'
					style={{ backgroundColor: '#1A1A2E', width: `${level}%` }}
				/>
			</div>
		</div>
	);
}
