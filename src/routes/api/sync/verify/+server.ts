import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { validateOrigin } from '$lib/server/validation';
import { checkRateLimit, checkGlobalRateLimit, recordFailedAttempt, clearFailedAttempts } from '$lib/server/rateLimit';
import type { RequestEvent } from './$types';

export async function POST({ request, getClientAddress }: RequestEvent) {
	try {
		const originCheck = validateOrigin(request);
		if (!originCheck.valid) {
			return json({ success: false, error: originCheck.reason }, { status: 403 });
		}

		const ip = getClientAddress();
		if (!checkGlobalRateLimit(ip)) {
			return json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
		}
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
