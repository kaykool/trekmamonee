import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	icon: text('icon').notNull(),
	color: text('color').notNull(),
	type: text('type', { enum: ['income', 'expense'] }).notNull(),
	isDefault: integer('isDefault', { mode: 'boolean' }).notNull().default(false),
	sortOrder: integer('sortOrder').notNull().default(0),
	createdAt: integer('createdAt').notNull()
});

export const transactions = sqliteTable('transactions', {
	id: text('id').primaryKey(),
	amount: integer('amount').notNull(),
	categoryId: text('categoryId').notNull(),
	type: text('type', { enum: ['income', 'expense'] }).notNull(),
	itemName: text('itemName').notNull(),
	date: text('date').notNull(), // YYYY-MM-DD
	createdAt: integer('createdAt').notNull(),
	updatedAt: integer('updatedAt').notNull()
});
