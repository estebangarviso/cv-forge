import type { CvData } from '../../domain/entities/cv-data';
import type { TemplateConfig } from '../../domain/entities/template-config';

import { DEFAULT_TEMPLATE } from '../../domain/entities/template-config';
import { CvPreviewMain } from './cv-preview-main';
import { CvPreviewSidebar } from './cv-preview-sidebar';

interface CvPreviewProps {
	config?: TemplateConfig;
	data: CvData;
}

export function CvPreview({ config = DEFAULT_TEMPLATE, data }: CvPreviewProps) {
	return (
		<div
			className='cv-preview mx-auto bg-white text-black shadow-lg print:shadow-none'
			style={{
				fontFamily: 'Inter, Tahoma, sans-serif',
				fontSize: '10pt',
				lineHeight: '1.1',
				minHeight: '297mm',
				padding: '1cm 1.5cm 1cm 0.85cm',
				width: '210mm',
			}}
		>
			<div className='flex gap-[1.5cm]'>
				<div
					className='shrink-0'
					style={{
						backgroundColor: config.colors.sidebarBg,
						marginBottom: '-1cm',
						marginLeft: '-0.85cm',
						marginTop: '-1cm',
						minHeight: '297mm',
						paddingLeft: '0.85cm',
						paddingRight: '0.4cm',
						paddingTop: '1.4cm',
						width: `${config.sidebarWidth}%`,
					}}
				>
					<CvPreviewSidebar config={config} data={data} />
				</div>
				<div className='flex-1 pt-0'>
					<CvPreviewMain config={config} data={data} />
				</div>
			</div>
		</div>
	);
}
