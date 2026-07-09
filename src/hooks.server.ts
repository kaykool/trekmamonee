import type { Handle } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize Drizzle with the Cloudflare D1 binding
	if (event.platform?.env?.DB) {
		event.locals.db = drizzle(event.platform.env.DB, { schema });
	}

	return resolve(event);
};
