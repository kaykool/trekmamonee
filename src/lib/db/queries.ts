import { db, type Transaction, type Category } from './index';

export interface MonthSummary {
	totalIncome: number;
	totalExpense: number;
	balance: number;
}

export interface CategoryTotal {
	categoryId: string;
	categoryName: string;
	icon: string;
	color: string;
	total: number;
	percentage: number;
}

export interface RecentTransaction {
	transaction: Transaction;
	category: Category | undefined;
}

/**
 * Get income/expense totals for a given month.
 */
export async function getMonthSummary(year: number, month: number): Promise<MonthSummary> {
	const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

	const transactions = await db.transactions.where('date').startsWith(monthPrefix).toArray();

	let totalIncome = 0;
	let totalExpense = 0;

	for (const tx of transactions) {
		if (tx.type === 'income') {
			totalIncome += tx.amount;
		} else {
			totalExpense += tx.amount;
		}
	}

	return {
		totalIncome,
		totalExpense,
		balance: totalIncome - totalExpense
	};
}

/**
 * Get spending breakdown by category for a given month.
 * Returns categories sorted by total (highest first), with percentage of grand total.
 */
export async function getCategoryBreakdown(
	year: number,
	month: number,
	type: 'income' | 'expense' = 'expense'
): Promise<CategoryTotal[]> {
	const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

	const [transactions, categories] = await Promise.all([
		db.transactions.where('date').startsWith(monthPrefix).toArray(),
		db.categories.toArray()
	]);

	const categoryMap = new Map(categories.map((c) => [c.id, c]));

	// Aggregate totals by category
	const totals = new Map<string, number>();
	for (const tx of transactions) {
		if (tx.type !== type) continue;
		totals.set(tx.categoryId, (totals.get(tx.categoryId) || 0) + tx.amount);
	}

	const grandTotal = Array.from(totals.values()).reduce((sum, v) => sum + v, 0);

	// Build result array sorted by total descending
	const result: CategoryTotal[] = [];
	for (const [categoryId, total] of totals) {
		const cat = categoryMap.get(categoryId);
		result.push({
			categoryId,
			categoryName: cat?.name || 'Unknown',
			icon: cat?.icon || '🏷️',
			color: cat?.color || 'bg-gray-500',
			total,
			percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0
		});
	}

	result.sort((a, b) => b.total - a.total);
	return result;
}

/**
 * Get the N most recent transactions with their category data.
 */
export async function getRecentTransactions(limit: number = 5): Promise<RecentTransaction[]> {
	const transactions = await db.transactions.orderBy('createdAt').reverse().limit(limit).toArray();

	const categories = await db.categories.toArray();
	const categoryMap = new Map(categories.map((c) => [c.id, c]));

	return transactions.map((tx) => ({
		transaction: tx,
		category: categoryMap.get(tx.categoryId)
	}));
}
