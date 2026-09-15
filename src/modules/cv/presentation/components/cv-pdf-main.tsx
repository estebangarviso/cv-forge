import { Link, PdfIcon, StyleSheet, Text, View } from '@shared/ui/pdf';

import type { CvData } from '../../domain/entities/cv-data';
import type { TemplateConfig } from '../../domain/entities/template-config';

import { resolveOtherIcon } from '../../domain/entities/cv-data';
import { resolvePdfTypography } from '../lib/resolve-pdf-typography';
import { CvPdfSkillBar } from './cv-pdf-skill-bar';

const URL_PATTERN = /^https?:\/\//;

const styles = StyleSheet.create({
	bulletDot: { width: 10 },
	bulletRow: { flexDirection: 'row', marginTop: 1 },
	bulletText: { flex: 1 },
	details: { color: '#555555', marginBottom: 2 },
	entry: { marginBottom: 8 },
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	gridItem: { marginBottom: 6, width: '48%' },
	headerBand: { paddingBottom: '0.49cm', paddingTop: '0.49cm' },
	name: { marginBottom: 6 },
	otherRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
	sectionTitle: {
		borderBottomWidth: 0.5,
		marginBottom: 6,
		paddingBottom: 2,
		textTransform: 'uppercase',
	},
	sectionWrap: { marginBottom: 10 },
	title: { textTransform: 'uppercase' },
});

interface Props {
	/** Gutter width between sidebar and main columns — the header band bleeds left by this amount to visually merge with the sidebar. */
	columnGapCm: number;
	config: TemplateConfig;
	data: CvData;
	/** Page's right margin — the header band bleeds right by this amount to reach the page edge. */
	marginRightCm: number;
}

function MainSection({
	accentColor,
	breakBefore,
	children,
	headingStyle,
	title,
}: {
	accentColor: string;
	breakBefore?: boolean;
	children: React.ReactNode;
	headingStyle: React.ComponentProps<typeof View>['style'];
	title: string;
}) {
	return (
		<View break={breakBefore} style={styles.sectionWrap}>
			<Text
				style={[
					styles.sectionTitle,
					headingStyle,
					{ borderBottomColor: accentColor, color: accentColor },
				]}
			>
				{title}
			</Text>
			{children}
		</View>
	);
}

export function CvPdfMain({ columnGapCm, config, data, marginRightCm }: Props) {
	const { accent, muted, sidebarBg } = config.colors;
	const typo = resolvePdfTypography(config.typography);

	return (
		<View>
			{/* bleeds left into the sidebar/main gutter and right to the page
				edge so the header reads as one unified band with the sidebar's
				own background — text stays put via the matching horizontal
				padding (mirrors meli.tex's hspace trick). */}
			<View
				style={[
					styles.headerBand,
					{
						backgroundColor: sidebarBg,
						marginLeft: `-${columnGapCm}cm`,
						marginRight: `-${marginRightCm}cm`,
						paddingLeft: `${columnGapCm}cm`,
						paddingRight: `${marginRightCm}cm`,
					},
				]}
				wrap={false}
			>
				<Text style={[styles.name, typo.name, { color: accent }]}>
					{data.name}
				</Text>
				<Text style={[styles.title, typo.jobTitle, { color: muted }]}>
					{data.title}
				</Text>
			</View>

			<View style={{ paddingTop: `${config.mainTopPadding}cm` }}>
				{data.experience.length > 0 && (
					<MainSection
						accentColor={accent}
						headingStyle={typo.sectionHeading}
						title='Experiencia Laboral'
					>
						{data.experience.map((job, i) => (
							<View key={i} style={styles.entry} wrap={false}>
								<Text style={typo.jobTitle}>{job.role}</Text>
								<Text style={[styles.details, typo.meta]}>
									{job.details}
								</Text>
								{job.bullets.map((b, j) => (
									<View key={j} style={styles.bulletRow}>
										<Text
											style={[
												styles.bulletDot,
												typo.body,
											]}
										>
											•
										</Text>
										<Text
											style={[
												styles.bulletText,
												typo.body,
											]}
										>
											{b}
										</Text>
									</View>
								))}
							</View>
						))}
					</MainSection>
				)}

				{data.skills.length > 0 && (
					<MainSection
						accentColor={accent}
						breakBefore
						headingStyle={typo.sectionHeading}
						title='Habilidades'
					>
						<View style={styles.grid}>
							{data.skills.map((s, i) => (
								<View
									key={i}
									style={styles.gridItem}
									wrap={false}
								>
									<CvPdfSkillBar
										accentColor={accent}
										label={s.label}
										level={s.level}
										subtitle={s.subtitle}
										typography={typo}
									/>
								</View>
							))}
						</View>
					</MainSection>
				)}

				{data.languages.length > 0 && (
					<MainSection
						accentColor={accent}
						headingStyle={typo.sectionHeading}
						title='Idiomas'
					>
						<View style={styles.grid}>
							{data.languages.map((l, i) => (
								<View
									key={i}
									style={styles.gridItem}
									wrap={false}
								>
									<CvPdfSkillBar
										accentColor={accent}
										label={l.label}
										level={l.level}
										typography={typo}
									/>
								</View>
							))}
						</View>
					</MainSection>
				)}

				{data.references.length > 0 && (
					<MainSection
						accentColor={accent}
						headingStyle={typo.sectionHeading}
						title='Referencias'
					>
						<View style={styles.grid}>
							{data.references.map((r, i) => (
								<View
									key={i}
									style={styles.gridItem}
									wrap={false}
								>
									<Text style={typo.body}>{r.name}</Text>
									<Text style={[typo.meta, { color: muted }]}>
										{r.email}
									</Text>
									<Text style={[typo.meta, { color: muted }]}>
										{r.phone}
									</Text>
								</View>
							))}
						</View>
					</MainSection>
				)}

				{data.other?.map((item, i) => {
					const icon = resolveOtherIcon(item.value, item.icon);
					return (
						<MainSection
							accentColor={accent}
							headingStyle={typo.sectionHeading}
							key={i}
							title={item.label}
						>
							<View style={styles.otherRow} wrap={false}>
								{icon !== 'none' && (
									<PdfIcon
										color={accent}
										name={icon}
										size={9}
									/>
								)}
								{URL_PATTERN.test(item.value) ? (
									<Link
										src={item.value}
										// react-pdf's Link defaults to blue + underline — override both
										style={[
											typo.body,
											{
												color: '#000000',
												textDecoration: 'none',
											},
										]}
									>
										{item.value}
									</Link>
								) : (
									<Text style={typo.body}>{item.value}</Text>
								)}
							</View>
						</MainSection>
					);
				})}
			</View>
		</View>
	);
}
