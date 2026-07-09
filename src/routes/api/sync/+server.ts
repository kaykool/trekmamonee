import { json } from '@sveltejs/kit';
import { withRetry } from '$lib/server/db';
import { transactions, categories } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import { checkRateLimit, checkGlobalRateLimit, recordFailedAttempt, clearFailedAttempts } from '$lib/server/rateLimit';
import type { RequestEvent } from './$types';

export async function GET({ request, getClientAddress, locals }: RequestEvent) {
	try {
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

		const payload = await request.json();
		const incomingCategories = payload.data?.categories || [];
		const incomingTransactions = payload.data?.transactions || [];

		await withRetry(async () => {
			await db.transaction(async (tx) => {
				// Wipe cloud state
				await tx.delete(transactions);
				await tx.delete(categories);
				
				// Insert new state
				if (incomingCategories.length > 0) {
					const sanitizedCategories = incomingCategories.map((c: Record<string, unknown>) => ({
						...c,
						name: (c.name as string) || 'Unknown',
						icon: (c.icon as string) || '📌',
						color: (c.color as string) || 'bg-gray-500',
						type: (c.type as string) || 'expense',
						isDefault: typeof c.isDefault === 'boolean' ? c.isDefault : false,
						sortOrder: (c.sortOrder as number) || 0,
						createdAt: (c.createdAt as number) || Date.now()
					}));
					await tx.insert(categories).values(sanitizedCategories);
				}
				
				if (incomingTransactions.length > 0) {
					const sanitizedTransactions = incomingTransactions.map((t: Record<string, unknown>) => ({
						...t,
						amount: (t.amount as number) || 0,
						type: (t.type as string) || 'expense',
						itemName: (t.itemName as string) || 'Untitled',
						date: (t.date as string) || new Date().toISOString().split('T')[0],
						createdAt: (t.createdAt as number) || Date.now(),
						updatedAt: (t.updatedAt as number) || Date.now()
					}));
					await tx.insert(transactions).values(sanitizedTransactions);
				}
			});
		});

		return json({ success: true, message: 'Backup successful' });
	} catch (error) {
		console.error('Error saving sync data:', error);
		return json({ success: false, error: 'Failed to save data' }, { status: 500 });
	}
}
