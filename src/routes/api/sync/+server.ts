import { json } from '@sveltejs/kit';
import { withRetry } from '$lib/server/db';
import { transactions, categories } from '$lib/server/db/schema';
import { SyncPayloadSchema, validateOrigin } from '$lib/server/validation';
import { env } from '$env/dynamic/private';
import { checkRateLimit, checkGlobalRateLimit, recordFailedAttempt, clearFailedAttempts } from '$lib/server/rateLimit';
import type { RequestEvent } from './$types';

export async function GET({ request, getClientAddress, locals }: RequestEvent) {
	try {
		const originCheck = validateOrigin(request);
		if (!originCheck.valid) {
			return json({ success: false, error: originCheck.reason }, { status: 403 });
		}

		const ip = getClientAddress();
		if (!checkGlobalRateLimit(ip)) {
			return json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
		}
		if (!checkRateLimit(ip)) {
			return json({ success: false, error: 'Too many failed attempts. Try again in 15 minutes.' }, { status: 429 });
		}

		const clientKey = request.headers.get('x-api-key');
		if (!clientKey || clientKey !== env.CLOUD_SYNC_PASSWORD) {
			recordFailedAttempt(ip);
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}
		clearFailedAttempts(ip);

		const db = locals.db;
		if (!db) return json({ success: false, error: 'Database not initialized' }, { status: 500 });

		const { allCategories, allTransactions } = await withRetry(async () => {
			const cats = await db.select().from(categories);
			const txs = await db.select().from(transactions);
			return { allCategories: cats, allTransactions: txs };
		});

		return json({
			success: true,
			data: {
				categories: allCategories,
				transactions: allTransactions
			}
		});
	} catch (error) {
		console.error('Error fetching sync data:', error);
		return json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
	}
}

export async function POST({ request, getClientAddress, locals }: RequestEvent) {
	try {
		const originCheck = validateOrigin(request);
		if (!originCheck.valid) {
			return json({ success: false, error: originCheck.reason }, { status: 403 });
		}

		const ip = getClientAddress();
		if (!checkGlobalRateLimit(ip)) {
			return json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
		}
		if (!checkRateLimit(ip)) {
			return json({ success: false, error: 'Too many failed attempts. Try again in 15 minutes.' }, { status: 429 });
		}

		const clientKey = request.headers.get('x-api-key');
		if (!clientKey || clientKey !== env.CLOUD_SYNC_PASSWORD) {
			recordFailedAttempt(ip);
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}
		clearFailedAttempts(ip);

		const db = locals.db;
		if (!db) return json({ success: false, error: 'Database not initialized' }, { status: 500 });

		const rawPayload = await request.json();
		const parsed = SyncPayloadSchema.safeParse(rawPayload);
		if (!parsed.success) {
			return json({
				success: false,
				error: 'Invalid payload',
				details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
			}, { status: 400 });
		}

		const { categories: incomingCategories, transactions: incomingTransactions } = parsed.data.data;

		await withRetry(async () => {
			await db.transaction(async (tx) => {
				for (const cat of incomingCategories) {
					await tx.insert(categories)
						.values(cat)
						.onConflictDoUpdate({
							target: categories.id,
							set: {
								name: cat.name,
								icon: cat.icon,
								color: cat.color,
								type: cat.type,
								isDefault: cat.isDefault,
								sortOrder: cat.sortOrder,
								createdAt: cat.createdAt
							}
						});
				}

				for (const txn of incomingTransactions) {
					await tx.insert(transactions)
						.values(txn)
						.onConflictDoUpdate({
							target: transactions.id,
							set: {
								amount: txn.amount,
								categoryId: txn.categoryId,
								type: txn.type,
								itemName: txn.itemName,
								date: txn.date,
								createdAt: txn.createdAt,
								updatedAt: txn.updatedAt
							}
						});
				}
			});
		});

		return json({ success: true, message: 'Backup successful' });
	} catch (error) {
		console.error('Error saving sync data:', error);
		return json({ success: false, error: 'Failed to save data' }, { status: 500 });
	}
}
