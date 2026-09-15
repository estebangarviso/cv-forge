import { Document, Page, StyleSheet, View } from '@shared/ui/pdf';

import type { CvData } from '../../domain/entities/cv-data';
import type { TemplateConfig } from '../../domain/entities/template-config';

import { DEFAULT_TEMPLATE } from '../../domain/entities/template-config';
import { resolvePdfTypography } from '../lib/resolve-pdf-typography';
import { CvPdfMain } from './cv-pdf-main';
import { CvPdfSidebar } from './cv-pdf-sidebar';

// geometry ported from meli.tex: \geometry[top=1cm,bottom=1cm,left=0.85cm,
// right=1.5cm] + \columnratio{sidebarWidth} + \columnsep=1.5cm (paracol).
const PAGE_WIDTH_CM = 21; // a4
const MARGIN_TOP_CM = 1;
const MARGIN_BOTTOM_CM = 1;
const MARGIN_LEFT_CM = 0.85;
const MARGIN_RIGHT_CM = 1.5;
const COLUMN_GAP_CM = 1.5;

const styles = StyleSheet.create({
	main: {
		flex: 1,
		paddingRight: `${MARGIN_RIGHT_CM}cm`,
	},
	page: {
		color: '#000000',
		// vertical margins live on <Page>, not on a column View, because
		// react-pdf re-applies a Page's own padding on EVERY generated
		// physical page, while a child View's padding applies only once
		// across the whole (paginated) box — see react-pdf-cv-rendering skill.
		paddingBottom: `${MARGIN_BOTTOM_CM}cm`,
		paddingTop: `${MARGIN_TOP_CM}cm`,
	},
	row: { flexDirection: 'row', minHeight: '100%' },
});

interface CvPdfDocumentProps {
	/** Overrides the CV's own persisted `data.theme` — mainly for previewing a different template before committing to it. */
	config?: TemplateConfig;
	data: CvData;
}

/**
 * Root CV document. Two-tone column backgrounds use `fixed` absolute-positioned
 * views so they repeat, full-bleed, on every physical page — react-pdf's own
 * `<Page>` pagination handles the rest, no manual break math needed.
 */
export function CvPdfDocument({ config, data }: CvPdfDocumentProps) {
	const resolvedConfig = config ?? data.theme ?? DEFAULT_TEMPLATE;
	// mirrors paracol's box model: page content width minus both margins and
	// the column gap is split by the sidebar/main ratio, then the gap and left
	// margin are folded back in as the sidebar column's own padding.
	const usableForColumns =
		PAGE_WIDTH_CM - MARGIN_LEFT_CM - MARGIN_RIGHT_CM - COLUMN_GAP_CM;
	const sidebarTextWidthCm =
		(resolvedConfig.sidebarWidth / 100) * usableForColumns;
	const sidebarBoxWidthCm =
		MARGIN_LEFT_CM + sidebarTextWidthCm + COLUMN_GAP_CM;
	// the sidebar background bleeds past the text column into half the
	// gutter (meli.tex hardcodes this as a fixed 6.5cm rectangle).
	const sidebarBgWidthCm =
		MARGIN_LEFT_CM + sidebarTextWidthCm + COLUMN_GAP_CM / 2;
	const bodyTypography = resolvePdfTypography(resolvedConfig.typography).body;

	return (
		<Document title={data.cvTitle || data.name || 'CV'}>
			<Page size='A4' style={[styles.page, bodyTypography]}>
				{/* top/bottom offset by the page's own vertical padding — an
					absolute `fixed` View is positioned against the padding box, not
					the true page edge, so this bleeds the color back to the edge. */}
				<View
					fixed
					style={{
						backgroundColor: resolvedConfig.colors.sidebarBg,
						bottom: `-${MARGIN_BOTTOM_CM}cm`,
						left: 0,
						position: 'absolute',
						top: `-${MARGIN_TOP_CM}cm`,
						width: `${sidebarBgWidthCm}cm`,
					}}
				/>
				<View
					fixed
					style={{
						backgroundColor: '#ffffff',
						bottom: `-${MARGIN_BOTTOM_CM}cm`,
						left: `${sidebarBgWidthCm}cm`,
						position: 'absolute',
						right: 0,
						top: `-${MARGIN_TOP_CM}cm`,
					}}
				/>

				<View style={styles.row}>
					<View
						style={{
							paddingLeft: `${MARGIN_LEFT_CM}cm`,
							paddingRight: `${COLUMN_GAP_CM}cm`,
							width: `${sidebarBoxWidthCm}cm`,
						}}
					>
						<CvPdfSidebar config={resolvedConfig} data={data} />
					</View>
					<View style={styles.main}>
						<CvPdfMain
							columnGapCm={COLUMN_GAP_CM}
							config={resolvedConfig}
							data={data}
							marginRightCm={MARGIN_RIGHT_CM}
						/>
					</View>
				</View>
			</Page>
		</Document>
	);
}
