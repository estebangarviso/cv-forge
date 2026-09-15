import { StyleSheet, Text, View } from '@shared/ui/pdf';

import type { resolvePdfTypography } from '../lib/resolve-pdf-typography';

const styles = StyleSheet.create({
	fill: { height: '100%' },
	subtitle: { color: '#555555' },
	track: {
		backgroundColor: 'rgba(0, 0, 0, 0.15)',
		height: 3,
		marginTop: 2,
		width: '100%',
	},
	wrapper: { marginBottom: 4 },
});

interface CvPdfSkillBarProps {
	accentColor: string;
	label: string;
	level: number;
	subtitle?: string;
	typography: ReturnType<typeof resolvePdfTypography>;
}

export function CvPdfSkillBar({
	accentColor,
	label,
	level,
	subtitle,
	typography,
}: CvPdfSkillBarProps) {
	return (
		<View style={styles.wrapper} wrap={false}>
			<Text style={typography.body}>{label}</Text>
			{subtitle && (
				<Text style={[styles.subtitle, typography.meta]}>
					{subtitle}
				</Text>
			)}
			<View style={styles.track}>
				<View
					style={[
						styles.fill,
						{ backgroundColor: accentColor, width: `${level}%` },
					]}
				/>
			</View>
		</View>
	);
}
