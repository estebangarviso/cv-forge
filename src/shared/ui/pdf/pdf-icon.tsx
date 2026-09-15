import { Circle, Path, Rect, Svg } from '@react-pdf/renderer';

// path data copied from Heroicons v2 (24/solid), MIT licensed:
// https://github.com/tailwindlabs/heroicons — no runtime dependency needed,
// react-pdf can't render DOM <svg>/<path> elements from a React component,
// only its own Svg/Path primitives, so the raw path data is inlined here.
// 'linkedin' shapes copied from lucide-react v0.417 (ISC licensed) — the
// brand icon was dropped from lucide's current release, same as it was
// dropped from simple-icons after LinkedIn's trademark takedown request.
export type PdfIconName =
	'idCard' | 'link' | 'linkedin' | 'mail' | 'phone' | 'pin';

type PdfIconShape =
	| { cx: number; cy: number; r: number; type: 'circle' }
	| { d: string; fillRule?: 'evenodd' | 'nonzero'; type: 'path' }
	| { height: number; type: 'rect'; width: number; x: number; y: number };

// most shapes are on Heroicons' 0-24 grid; a name listed here uses its own
// path data's native grid instead (e.g. lucide's linkedin mark is 0-504).
const PDF_ICON_VIEWBOX: Partial<Record<PdfIconName, string>> = {
	linkedin: '0 0 504 504',
};

const PDF_ICON_SHAPES: Record<PdfIconName, PdfIconShape[]> = {
	idCard: [
		{
			d: 'M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92ZM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15ZM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15Z',
			fillRule: 'evenodd',
			type: 'path',
		},
	],
	link: [
		{
			d: 'M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z',
			fillRule: 'evenodd',
			type: 'path',
		},
	],
	linkedin: [
		{
			d: 'M377.6,0.2H126.4C56.8,0.2,0,57,0,126.6v251.6c0,69.2,56.8,126,126.4,126H378c69.6,0,126.4-56.8,126.4-126.4V126.6    C504,57,447.2,0.2,377.6,0.2z M168,408.2H96v-208h72V408.2z M131.6,168.2c-20.4,0-36.8-16.4-36.8-36.8c0-20.4,16.4-36.8,36.8-36.8    c20.4,0,36.8,16.4,36.8,36.8C168,151.8,151.6,168.2,131.6,168.2z M408.4,408.2H408h-60V307.4c0-24.4-3.2-55.6-36.4-55.6    c-34,0-39.6,26.4-39.6,54v102.4h-60v-208h56v28h1.6c8.8-16,29.2-28.4,61.2-28.4c66,0,77.6,38,77.6,94.4V408.2z',
			fillRule: 'evenodd',
			type: 'path',
		},
	],
	mail: [
		{
			d: 'M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z',
			type: 'path',
		},
		{
			d: 'M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z',
			type: 'path',
		},
	],
	phone: [
		{
			d: 'M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z',
			fillRule: 'evenodd',
			type: 'path',
		},
	],
	pin: [
		{
			d: 'm11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
			fillRule: 'evenodd',
			type: 'path',
		},
	],
};

interface PdfIconProps {
	color?: string;
	name: PdfIconName;
	size?: number;
}

/** Small solid-style vector icon rendered with react-pdf's own Svg/Path/Rect/Circle primitives (no raster image, no DOM SVG). */
export function PdfIcon({ color = '#000000', name, size = 10 }: PdfIconProps) {
	return (
		<Svg
			style={{ height: size, width: size }}
			viewBox={PDF_ICON_VIEWBOX[name] ?? '0 0 24 24'}
		>
			{PDF_ICON_SHAPES[name].map((shape, i) => {
				if (shape.type === 'rect') {
					return (
						<Rect
							fill={color}
							height={shape.height}
							key={i}
							width={shape.width}
							x={shape.x}
							y={shape.y}
						/>
					);
				}
				if (shape.type === 'circle') {
					return (
						<Circle
							cx={shape.cx}
							cy={shape.cy}
							fill={color}
							key={i}
							r={shape.r}
						/>
					);
				}
				return (
					<Path
						d={shape.d}
						fill={color}
						fillRule={shape.fillRule}
						key={i}
					/>
				);
			})}
		</Svg>
	);
}
