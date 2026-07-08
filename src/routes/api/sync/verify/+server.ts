import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '$lib/server/rateLimit';
import type { RequestEvent } from './$types';

export async function POST({ request, getClientAddress }: RequestEvent) {
	try {
		const ip = getClientAddress();
		if (!checkRateLimit(ip)) {
			return json({ success: false, error: 'Too many failed attempts. Try again in 15 minutes.' }, { status: 429 });
		}

		const clientKey = request.headers.get('x-api-key');
		if (!clientKey || clientKey !== env.CLOUD_SYNC_PASSWORD) {
			recordFailedAttempt(ip);
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}
		
		clearFailedAttempts(ip);
		return json({ success: true });
	} catch (error) {
		console.error('API Verify Error:', error);
		return json({ success: false, error: 'Failed to verify' }, { status: 500 });
	}
}
