const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const MAX_GLOBAL_REQUESTS = 60;
const GLOBAL_WINDOW_MS = 60 * 1000; // 1 minute

const attempts = new Map<string, { count: number; timestamp: number }>();
const globalRequests = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const record = attempts.get(ip);

	if (record) {
		if (now - record.timestamp > LOCKOUT_MS) {
			// Lockout expired, reset
			attempts.delete(ip);
			return true;
		}

		if (record.count >= MAX_ATTEMPTS) {
			return false; // Still locked out
		}
	}

	return true;
}

export function recordFailedAttempt(ip: string) {
	const now = Date.now();
	const record = attempts.get(ip);

	if (record) {
		record.count += 1;
		record.timestamp = now; // Reset timer on each failure
	} else {
		attempts.set(ip, { count: 1, timestamp: now });
	}
}

export function clearFailedAttempts(ip: string) {
	attempts.delete(ip);
}

export function checkGlobalRateLimit(ip: string): boolean {
	const now = Date.now();
	const record = globalRequests.get(ip);

	if (record) {
		if (now - record.timestamp > GLOBAL_WINDOW_MS) {
			// Window expired, reset
			globalRequests.set(ip, { count: 1, timestamp: now });
			return true;
		}

		if (record.count >= MAX_GLOBAL_REQUESTS) {
			return false; // Limit exceeded
		}

		record.count += 1;
	} else {
		globalRequests.set(ip, { count: 1, timestamp: now });
	}

	return true;
}
