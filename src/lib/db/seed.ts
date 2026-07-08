import { db, generateId, type Category } from './index';

const defaultCategories: Omit<Category, 'id' | 'createdAt'>[] = [
	// Expenses
	{ name: 'Food & Dining', icon: '🍽️', color: 'bg-orange-500', type: 'expense', isDefault: true },
	{ name: 'Transportation', icon: '🚗', color: 'bg-blue-500', type: 'expense', isDefault: true },
	{ name: 'Entertainment', icon: '🎮', color: 'bg-purple-500', type: 'expense', isDefault: true },
	{ name: 'Shopping', icon: '🛍️', color: 'bg-pink-500', type: 'expense', isDefault: true },
	{ name: 'Education', icon: '📚', color: 'bg-yellow-500', type: 'expense', isDefault: true },
	{ name: 'Housing', icon: '🏠', color: 'bg-cyan-500', type: 'expense', isDefault: true },
	{ name: 'Other', icon: '📦', color: 'bg-gray-500', type: 'expense', isDefault: true },

	// Income
	{ name: 'Salary', icon: '💼', color: 'bg-emerald-500', type: 'income', isDefault: true },
	{ name: 'Gift', icon: '🎁', color: 'bg-rose-500', type: 'income', isDefault: true },
	{ name: 'Investment', icon: '📈', color: 'bg-indigo-500', type: 'income', isDefault: true },
	{ name: 'Other', icon: '💵', color: 'bg-teal-500', type: 'income', isDefault: true }
];

export async function seedDefaultCategories() {
	const count = await db.categories.count();

	if (count === 0) {
		const categoriesToInsert = defaultCategories.map((cat) => ({
			...cat,
			id: generateId(),
			createdAt: Date.now()
		}));

		await db.categories.bulkAdd(categoriesToInsert);
		console.log('Seeded default categories');
	}
}

import { browser } from '$app/environment';

// Hook to seed on DB open
if (browser) {
	db.on('ready', async () => {
		await seedDefaultCategories();
	});
}
