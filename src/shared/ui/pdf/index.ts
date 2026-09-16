// centralized @react-pdf/renderer import surface — module code imports PDF
// primitives from here, never directly from '@react-pdf/renderer', so
// swapping the PDF library only touches this folder.
export {
	Circle,
	Document,
	Font,
	Image,
	Link,
	Page,
	Path,
	Rect,
	StyleSheet,
	Svg,
	Text,
	View,
} from '@react-pdf/renderer';
export type {
	DocumentProps,
	ImageProps,
	PageProps,
	TextProps,
	ViewProps,
} from '@react-pdf/renderer';

export { registerCustomFont } from './custom-fonts';
export { PDF_FONT_FAMILY } from './fonts';
export { PDFDownloadButton } from './pdf-download-button';
export { PDF_FONTS } from './pdf-fonts.config.mjs';
export { PdfIcon, type PdfIconName } from './pdf-icon';
export { PdfViewer } from './pdf-viewer';
