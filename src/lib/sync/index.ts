import { db } from '$lib/db';
import { syncStore } from '$lib/stores/sync.svelte';

export async function backupToCloud() {
	try {
		const categories = await db.categories.toArray();
		const transactions = await db.transactions.toArray();

		const response = await fetch('/api/sync', {
			method: 'POST',
			headers: { 
				'Content-Type': 'application/json',
				'x-api-key': syncStore.cloudPassword
			},
			body: JSON.stringify({
				data: {
					categories,
					transactions
				}
			})
		});

		const result = await response.json();
		if (!response.ok || !result.success) {
			throw new Error(result.error || 'Failed to backup to cloud');
		}

		localStorage.setItem('last_sync', new Date().toISOString());
		syncStore.setUnsynced(false);
		return true;
	} catch (error) {
		console.error('Backup error:', error);
		throw error;
	}
}

export async function restoreFromCloud() {
	try {
		const response = await fetch('/api/sync', {
			headers: {
				'x-api-key': syncStore.cloudPassword
			}
		});
		const result = await response.json();
		
		if (!response.ok || !result.success) {
			throw new Error(result.error || 'Failed to fetch cloud backup');
		}

		const categories = result.data?.categories || [];
		const transactions = result.data?.transactions || [];

		// Option A: Cloud backup replaces local DB completely
		await db.transaction('rw', db.categories, db.transactions, async () => {
			await db.categories.clear();
			await db.transactions.clear();

			if (categories && categories.length > 0) {
				await db.categories.bulkAdd(categories);
			}
			if (transactions && transactions.length > 0) {
				await db.transactions.bulkAdd(transactions);
			}
		});

		localStorage.setItem('last_sync', new Date().toISOString());
		syncStore.setUnsynced(false);
		return true;
	} catch (error) {
		console.error('Restore error:', error);
		throw error;
	}
}

export function getLastSyncTime(): string | null {
	return localStorage.getItem('last_sync');
}
