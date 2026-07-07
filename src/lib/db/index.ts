import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
  createdAt: number;
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  note: string;
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
  }
}

export const db = new ExpenseTrackerDB();

// Helper to generate IDs
export const generateId = () => crypto.randomUUID();
