import { PdfIcon, StyleSheet, Text, View } from '@shared/ui/pdf';

import type { CvData } from '../../domain/entities/cv-data';
import type { TemplateConfig } from '../../domain/entities/template-config';

import { resolvePdfTypography } from '../lib/resolve-pdf-typography';

// react-pdf/textkit's line-breaker only splits "words" on literal spaces
// (`/[ ]+/`) — zero-width spaces are NOT recognized as break points. A long
// unbroken token (an email, a URL-less address) needs the `hyphenationCallback`
// prop instead: it's textkit's actual supported hook for splitting an
// otherwise-unbreakable word across lines.
function hyphenateContactValue(word: string): string[] {
	return word.split(/(?<=[-./@_])/u);
}

const styles = StyleSheet.create({
	contactItem: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		gap: 5,
		marginBottom: 6,
	},
	contactRow: { marginBottom: 12 },
	// flexShrink alone isn't enough — a flex item's default min-width is its
	// unwrapped content size, which blocks shrinking/wrapping and lets long
	// values (like an email) overflow the sidebar instead of breaking.
	contactValue: { flex: 1, flexShrink: 1, minWidth: 0 },
	entry: { marginBottom: 6 },
	hr: { borderBottomWidth: 0.75, marginBottom: 6, width: '40%' },
	sectionTitle: {
		marginBottom: 4,
		textTransform: 'uppercase',
	},
	sectionWrap: { marginBottom: 10 },
	subtitle: { color: '#555555' },
	title: { marginBottom: 1 },
});

interface Props {
	config: TemplateConfig;
	data: CvData;
}

function SideSection({
	accentColor,
	children,
	headingStyle,
	title,
}: {
	accentColor: string;
	children: React.ReactNode;
	headingStyle: React.ComponentProps<typeof View>['style'];
	title: string;
}) {
	return (
		<View style={styles.sectionWrap}>
			<View style={[styles.hr, { borderBottomColor: accentColor }]} />
			<Text
				style={[
					styles.sectionTitle,
					headingStyle,
					{ color: accentColor },
				]}
			>
				{title}
			</Text>
			{children}
		</View>
	);
}

function SideEntry({
	bodyStyle,
	metaStyle,
	subtitle,
	title,
}: {
	bodyStyle: React.ComponentProps<typeof View>['style'];
	metaStyle: React.ComponentProps<typeof View>['style'];
	subtitle: string;
	title: string;
}) {
	return (
		<View style={styles.entry} wrap={false}>
			<Text style={[styles.title, bodyStyle]}>{title}</Text>
			<Text style={[styles.subtitle, metaStyle]}>{subtitle}</Text>
		</View>
	);
}

export function CvPdfSidebar({ config, data }: Props) {
	const { accent } = config.colors;
	const typo = resolvePdfTypography(config.typography);

	return (
		<View>
			<View style={styles.contactRow}>
				{data.phone && (
					<View style={styles.contactItem} wrap={false}>
						<PdfIcon color={accent} name='phone' size={9} />
						<Text
							hyphenationCallback={hyphenateContactValue}
							style={[styles.contactValue, typo.contactPhone]}
						>
							{data.phone}
						</Text>
					</View>
				)}
				{data.email && (
					<View style={styles.contactItem} wrap={false}>
						<PdfIcon color={accent} name='mail' size={9} />
						<Text
							hyphenationCallback={hyphenateContactValue}
							style={[styles.contactValue, typo.contactEmail]}
						>
							{data.email}
						</Text>
					</View>
				)}
				{data.address && (
					<View style={styles.contactItem} wrap={false}>
						<PdfIcon color={accent} name='pin' size={9} />
						<Text
							hyphenationCallback={hyphenateContactValue}
							style={[styles.contactValue, typo.contactAddress]}
						>
							{data.address}
						</Text>
					</View>
				)}
			</View>

			{data.aboutMe && (
				<SideSection
					accentColor={config.colors.accent}
					headingStyle={typo.sidebarHeading}
					title='Sobre Mí'
				>
					<Text style={typo.body}>{data.aboutMe}</Text>
				</SideSection>
			)}

			{data.education.length > 0 && (
				<SideSection
					accentColor={config.colors.accent}
					headingStyle={typo.sidebarHeading}
					title='Educación'
				>
					{data.education.map((e, i) => (
						<SideEntry
							bodyStyle={typo.body}
							key={i}
							metaStyle={typo.meta}
							subtitle={e.subtitle}
							title={e.title}
						/>
					))}
				</SideSection>
			)}

			{data.courses.length > 0 && (
				<SideSection
					accentColor={config.colors.accent}
					headingStyle={typo.sidebarHeading}
					title='Cursos'
				>
					{data.courses.map((c, i) => (
						<SideEntry
							bodyStyle={typo.body}
							key={i}
							metaStyle={typo.meta}
							subtitle={c.subtitle}
							title={c.title}
						/>
					))}
				</SideSection>
			)}

			{data.extracurricular.length > 0 && (
				<SideSection
					accentColor={config.colors.accent}
					headingStyle={typo.sidebarHeading}
					title='Actividades Extracurriculares'
				>
					{data.extracurricular.map((a, i) => (
						<SideEntry
							bodyStyle={typo.body}
							key={i}
							metaStyle={typo.meta}
							subtitle={a.subtitle}
							title={a.title}
						/>
					))}
				</SideSection>
			)}
		</View>
	);
}
