import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = mysql.createPool({
	uri: env.DATABASE_URL,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0,
	waitForConnections: true,
	connectionLimit: 3,
	queueLimit: 0
});

export const db = drizzle(client, { schema, mode: 'default' });

export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
	let retries = maxRetries;
	while (retries > 0) {
		try {
			return await operation();
		} catch (err: unknown) {
			retries--;
			if (retries === 0) throw err;
			
			const error = err as { code?: string };
			const isConnectionError = error?.code === 'ECONNRESET' || error?.code === 'PROTOCOL_CONNECTION_LOST';
			
			if (!isConnectionError) {
				throw err;
			}

			console.log(`Database operation failed (${error?.code}). Retrying... (${retries} left)`);
			await new Promise((res) => setTimeout(res, 500));
		}
	}
	throw new Error('Unreachable');
}
