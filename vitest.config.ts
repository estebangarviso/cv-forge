import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			'@core': resolve(__dirname, 'src/core'),
			'@modules': resolve(__dirname, 'src/modules'),
			'@shared': resolve(__dirname, 'src/shared'),
			'@ui': resolve(__dirname, 'src/shared/ui'),
		},
	},
	test: {
		coverage: {
			exclude: [
				'**/*.d.ts',
				'**/index.ts',
				'src/app/**/layout.tsx',
				'src/app/**/page.tsx',
				'**/__tests__/**',
				'**/*.{test,spec}.*',
			],
			include: ['src/**/*.{ts,tsx}'],
			reporter: ['text', 'text-summary', 'lcov', 'cobertura', 'json'],
			reportsDirectory: '.reports/coverage',
			thresholds: {
				branches: 80,
				functions: 80,
				lines: 80,
				statements: 80,
			},
		},
		environment: 'happy-dom',
		include: ['src/**/*.{spec,test}.{ts,tsx}'],
		reporters: ['verbose'],
		setupFiles: ['./vitest.setup.ts'],
	},
});
