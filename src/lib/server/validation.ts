import { z } from 'zod';
import { dev } from '$app/environment';

export const TransactionTypeSchema = z.enum(['income', 'expense']);

export const CategorySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(100),
	icon: z.string().min(1).max(20),
	color: z.string().min(1).max(50),
	type: TransactionTypeSchema,
	isDefault: z.boolean(),
	sortOrder: z.number().int().min(0),
	createdAt: z.number().positive()
});

export const TransactionSchema = z.object({
	id: z.string().uuid(),
	amount: z.number().positive(),
	categoryId: z.string().uuid(),
	type: TransactionTypeSchema,
	itemName: z.string().min(1).max(200),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	createdAt: z.number().positive(),
	updatedAt: z.number().positive()
});

export const SyncPayloadSchema = z.object({
	data: z.object({
		categories: z.array(CategorySchema).default([]),
		transactions: z.array(TransactionSchema).default([])
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
