import { TAILWIND_TO_HEX } from './constants';

/**
 * Robust currency formatter matching Playwright E2E expectations.
 */
export function formatIDR(amount: number): string {
	const formattedVal = Math.abs(amount).toLocaleString('id-ID');
	const sign = amount < 0 ? '-' : '';
	return `${sign}Rp ${formattedVal}`;
}

/**
 * Resolves a Tailwind background class to a hex color for Chart.js.
 */
export function resolveTailwindColor(className: string): string {
	return TAILWIND_TO_HEX[className] || className.replace('bg-', '#');
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the local timezone.
 */
export function getLocalDateString(dateObj: Date = new Date()): string {
	const tzOffset = dateObj.getTimezoneOffset() * 60000;
	return new Date(dateObj.getTime() - tzOffset).toISOString().split('T')[0];
}
