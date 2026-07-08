import Dexie, { type Table } from 'dexie';
import { syncStore } from '$lib/stores/sync.svelte';

export type TransactionType = 'income' | 'expense';

export interface Category {
	id: string;
	name: string;
	icon: string;
	color: string;
	type: TransactionType;
	isDefault: boolean;
	sortOrder: number;
	createdAt: number;
}

export interface Transaction {
	id: string;
	amount: number;
	categoryId: string;
	type: TransactionType;
	itemName: string;

	date: string; // YYYY-MM-DD
	createdAt: number;
	updatedAt: number;
}

export class ExpenseTrackerDB extends Dexie {
	transactions!: Table<Transaction, string>;
	categories!: Table<Category, string>;

	constructor() {
		super('ExpenseTrackerDB');

		// Define database schema
		this.version(1).stores({
			transactions: 'id, categoryId, type, date, createdAt',
			categories: 'id, type, isDefault, createdAt'
		});

		this.version(2).stores({
			categories: 'id, type, isDefault, sortOrder, createdAt'
		}).upgrade(tx => {
			return tx.table('categories').toCollection().modify(cat => {
				if (cat.sortOrder === undefined) cat.sortOrder = 0;
			});
		});
	}
}

export const db = new ExpenseTrackerDB();

// Global hooks to detect local mutations
const setUnsynced = () => syncStore.setUnsynced(true);
db.categories.hook('creating', setUnsynced);
db.categories.hook('updating', setUnsynced);
db.categories.hook('deleting', setUnsynced);
db.transactions.hook('creating', setUnsynced);
db.transactions.hook('updating', setUnsynced);
db.transactions.hook('deleting', setUnsynced);

// Helper to generate IDs
export const generateId = () => crypto.randomUUID();
