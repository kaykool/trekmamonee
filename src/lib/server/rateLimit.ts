const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

const attempts = new Map<string, { count: number; timestamp: number }>();

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
