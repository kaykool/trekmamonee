---
trigger: always_on
description: Apply when handling authentication, secrets, user input, API endpoints, data storage, or external requests.
---

Security must be considered in every change.

Requirements:

- Never store secrets (passwords, API keys, tokens) in localStorage. Use sessionStorage for transient secrets that must survive page refresh, or keep in memory-only and require re-auth on reload.
- Validate all external input at API boundaries with Zod schemas. Never trust raw `request.json()` or cast with `as Record<string, unknown>`.
- Compare secrets using constant-time comparison or simple strict equality (`!==`). Never log secrets or include them in error messages.
- Add Origin/Referer header validation on authenticated API endpoints as CSRF defense-in-depth.
- Use upsert patterns (`INSERT ... ON CONFLICT DO UPDATE`) instead of delete-all + re-insert for sync operations to prevent data loss during concurrent requests.
- Rate-limit authentication endpoints per IP to prevent brute force.
- Sanitize and validate data at system boundaries before it enters business logic or storage.
- Treat all external data (API payloads, URL params, headers) as untrusted.
- Use parameterized queries (Drizzle ORM handles this automatically — never raw SQL string concatenation).

Review for:

- Secrets exposed in code, logs, or version control
- Missing input validation on API endpoints
- Missing origin validation on authenticated endpoints
- Data that enters the system without type checking
- Sync operations that can cause data loss under concurrency
