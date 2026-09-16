import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/**/*.{ts,tsx,mdx}',
		'./node_modules/react-pdf-flipbook-viewer/**/*.{js,ts,jsx,tsx}',
	],
	plugins: [],
	theme: {
		extend: {},
	},
};

export default config;
