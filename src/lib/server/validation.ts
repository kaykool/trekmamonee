import { picklist, object, string, number, boolean, pipe, minLength, maxLength, regex, uuid, integer, minValue, gtValue, array, fallback } from 'valibot';
import { dev } from '$app/environment';

export const TransactionTypeSchema = picklist(['income', 'expense']);

export const CategorySchema = object({
	id: pipe(string(), uuid()),
	name: pipe(string(), minLength(1), maxLength(100)),
	icon: pipe(string(), minLength(1), maxLength(20)),
	color: pipe(string(), minLength(1), maxLength(50)),
	type: TransactionTypeSchema,
	isDefault: boolean(),
	sortOrder: pipe(number(), integer(), minValue(0)),
	createdAt: pipe(number(), gtValue(0))
});

export const TransactionSchema = object({
	id: pipe(string(), uuid()),
	amount: pipe(number(), gtValue(0)),
	categoryId: pipe(string(), uuid()),
	type: TransactionTypeSchema,
	itemName: pipe(string(), minLength(1), maxLength(200)),
	date: pipe(string(), regex(/^\d{4}-\d{2}-\d{2}$/)),
	createdAt: pipe(number(), gtValue(0)),
	updatedAt: pipe(number(), gtValue(0))
});

export const SyncPayloadSchema = object({
	data: object({
		categories: fallback(array(CategorySchema), []),
		transactions: fallback(array(TransactionSchema), [])
	})
});

/**
 * Validates Origin/Referer header to prevent CSRF attacks.
 * For API endpoints authenticated via custom header (x-api-key), the CSRF risk
 * is inherently low since browsers don't auto-send custom headers cross-origin.
 * This check provides defense-in-depth.
 *
 * - Same-origin requests (no Origin header): allowed
 * - Dev mode: localhost origins allowed
 * - Production: match against the request's own host as a reasonable check
 */
export function validateOrigin(request: Request): { valid: boolean; reason?: string } {
	const origin = request.headers.get('origin');
	const referer = request.headers.get('referer');

	if (!origin && !referer) {
		return { valid: true };
	}

	const source = (origin || referer) as string;

	if (dev) {
		const allowed = ['http://localhost:5173', 'http://localhost:4173'];
		const isAllowed = allowed.some((a) => source.startsWith(a));
		if (!isAllowed) {
			return { valid: false, reason: `Untrusted origin: ${source}` };
		}
		return { valid: true };
	}

	try {
		const requestUrl = new URL(request.url);
		const allowed = `${requestUrl.protocol}//${requestUrl.host}`;
		if (source.startsWith(allowed)) {
			return { valid: true };
		}
	} catch {
		return { valid: false, reason: 'Invalid request URL' };
	}

	return { valid: false, reason: `Untrusted origin: ${source}` };
}
