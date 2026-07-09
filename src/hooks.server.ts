import type { Handle } from '@sveltejs/kit';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	// Accessing event.platform in prerenderable routes throws during build,
	// so only initialize DB bindings at runtime for API requests.
	if (!building && event.url.pathname.startsWith('/api') && event.platform?.env?.DB) {
		event.locals.db = drizzle(event.platform.env.DB, { schema });
	}

	return resolve(event);
};
