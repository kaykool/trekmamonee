// The global db instance has been removed. 
// Cloudflare D1 injects the database binding per-request.
// Use `event.locals.db` to access the database in your server routes.

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
