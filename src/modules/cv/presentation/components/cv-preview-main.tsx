import type { CvData } from '../../domain/entities/cv-data';
import type { TemplateConfig } from '../../domain/entities/template-config';

import { SkillBar } from './skill-bar';

interface Props {
	config: TemplateConfig;
	data: CvData;
}

function MainSection({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) {
	return (
		<div className='mb-3'>
			<h2
				className='mb-1 border-b pb-0.5 text-[12pt] font-bold uppercase'
				style={{ borderColor: '#1A1A2E', color: '#1A1A2E' }}
			>
				{title}
			</h2>
			{children}
		</div>
	);
}

export function CvPreviewMain({ config, data }: Props) {
	return (
		<div>
			{/* Header band */}
			<div
				className='-mt-[1cm] -mr-[1.5cm] mb-3 px-4 py-[14pt]'
				style={{ backgroundColor: config.colors.sidebarBg }}
			>
				<h1
					className='text-[38pt] leading-tight font-bold'
					style={{ color: config.colors.accent }}
				>
					{data.name}
				</h1>
				<p
					className='mt-1 text-[10.5pt] uppercase'
					style={{ color: config.colors.muted }}
				>
					{data.title}
				</p>
			</div>

			{/* Experience */}
			{data.experience.length > 0 && (
				<MainSection title='Experiencia Laboral'>
					<div className='space-y-2'>
						{data.experience.map((job, i) => (
							<div key={i}>
								<p className='text-[10.5pt]'>{job.role}</p>
								<p
									className='text-[9pt]'
									style={{ color: '#555555' }}
								>
									{job.details}
								</p>
								{job.bullets.length > 0 && (
									<ul className='mt-0.5 ml-3 list-disc text-[9pt]'>
										{job.bullets.map((b, j) => (
											<li key={j}>{b}</li>
										))}
									</ul>
								)}
							</div>
						))}
					</div>
				</MainSection>
			)}

			{/* Skills */}
			{data.skills.length > 0 && (
				<MainSection title='Habilidades'>
					<div className='grid grid-cols-3 gap-2'>
						{data.skills.map((s, i) => (
							<SkillBar
								key={i}
								label={s.label}
								level={s.level}
								subtitle={s.subtitle}
							/>
						))}
					</div>
				</MainSection>
			)}

			{/* Languages */}
			{data.languages.length > 0 && (
				<MainSection title='Idiomas'>
					<div className='flex gap-4'>
						{data.languages.map((l, i) => (
							<SkillBar key={i} label={l.label} level={l.level} />
						))}
					</div>
				</MainSection>
			)}

			{/* References */}
			{data.references.length > 0 && (
				<MainSection title='Referencias'>
					<div className='grid grid-cols-2 gap-2 text-[9pt]'>
						{data.references.map((r, i) => (
							<div key={i}>
								<p>{r.name}</p>
								<p className='text-[#555555]'>{r.email}</p>
								<p className='text-[#555555]'>{r.phone}</p>
							</div>
						))}
					</div>
				</MainSection>
			)}

			{/* LinkedIn */}
			{data.linkedinUrl && (
				<MainSection title='Enlace'>
					<p className='text-[9pt]'>{data.linkedinUrl}</p>
				</MainSection>
			)}

			{/* Driving License */}
			{data.drivingLicense && (
				<MainSection title='Permiso de Conducir'>
					<p className='text-[9pt]'>{data.drivingLicense}</p>
				</MainSection>
			)}
		</div>
	);
}
