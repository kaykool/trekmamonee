export const APP_CONFIG = {
	toast: {
		defaultDurationMs: 2000,
		errorDurationMs: 1000
	},
	animations: {
		bottomSheetCloseDelayMs: 300
	},
	dashboard: {
		recentTransactionsLimit: 5
	}
} as const;

/**
 * Maps Tailwind background classes (used in category seed data) to hex colors
 * for Chart.js, which can't consume CSS classes.
 */
export const TAILWIND_TO_HEX: Record<string, string> = {
	'bg-orange-500': '#f97316',
	'bg-blue-500': '#3b82f6',
	'bg-purple-500': '#a855f7',
	'bg-pink-500': '#ec4899',
	'bg-yellow-500': '#eab308',
	'bg-cyan-500': '#06b6d4',
	'bg-gray-500': '#6b7280',
	'bg-emerald-500': '#10b981',
	'bg-rose-500': '#f43f5e',
	'bg-indigo-500': '#6366f1',
	'bg-teal-500': '#14b8a6'
};
