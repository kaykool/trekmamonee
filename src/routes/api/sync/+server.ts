import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { transactions, categories } from '$lib/server/db/schema';
import type { RequestEvent } from './$types';

export async function GET() {
	try {
		const allCategories = await db.select().from(categories);
		const allTransactions = await db.select().from(transactions);

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

export async function POST({ request }: RequestEvent) {
	try {
		const payload = await request.json();
		const incomingCategories = payload.data?.categories || [];
		const incomingTransactions = payload.data?.transactions || [];

		// Option A (Cloud Backup Strategy): Local Dexie is the absolute source of truth.
		// We wipe the cloud state and replace it with the exact local state.
		await db.transaction(async (tx) => {
			// Wipe cloud state
			await tx.delete(transactions);
			await tx.delete(categories);
			
			// Insert new state
			if (incomingCategories.length > 0) {
				await tx.insert(categories).values(incomingCategories);
			}
			
			if (incomingTransactions.length > 0) {
				await tx.insert(transactions).values(incomingTransactions);
			}
		});

		return json({ success: true, message: 'Backup successful' });
	} catch (error) {
		console.error('Error saving sync data:', error);
		return json({ success: false, error: 'Failed to save data' }, { status: 500 });
	}
}
