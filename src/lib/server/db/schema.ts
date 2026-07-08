import { mysqlTable, varchar, boolean, bigint, mysqlEnum } from 'drizzle-orm/mysql-core';

export const categories = mysqlTable('categories', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	icon: varchar('icon', { length: 255 }).notNull(),
	color: varchar('color', { length: 255 }).notNull(),
	type: mysqlEnum('type', ['income', 'expense']).notNull(),
	isDefault: boolean('isDefault').notNull().default(false),
	sortOrder: bigint('sortOrder', { mode: 'number' }).notNull().default(0),
	createdAt: bigint('createdAt', { mode: 'number' }).notNull()
});

export const transactions = mysqlTable('transactions', {
	id: varchar('id', { length: 36 }).primaryKey(),
	amount: bigint('amount', { mode: 'number' }).notNull(),
	categoryId: varchar('categoryId', { length: 36 }).notNull(),
	type: mysqlEnum('type', ['income', 'expense']).notNull(),
	itemName: varchar('itemName', { length: 255 }).notNull(),
	date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
	createdAt: bigint('createdAt', { mode: 'number' }).notNull(),
	updatedAt: bigint('updatedAt', { mode: 'number' }).notNull()
});
