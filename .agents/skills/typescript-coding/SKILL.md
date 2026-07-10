---
name: typescript-coding
description: Use this skill whenever you are writing, refactoring, or reviewing TypeScript and Svelte code. It contains the workspace's specific coding tenets, best practices, and anti-patterns to avoid. Always consult this before making significant code changes.
---

# TypeScript Coding Tenets

This skill contains guiding principles for writing TypeScript and Svelte code in this workspace. Follow these tenets strictly to maintain code quality, avoid lint errors, and ensure type safety.

## General Guidelines

- Prioritize type safety over convenience.
- Avoid `any`. Use `unknown` and type narrowing instead.
- Use Svelte 5 paradigms where applicable.

## Tenets

### Tenet: Use type-safe unknown instead of any for rest props

DON'T:

```ts
// Using `any` disables TypeScript's safety checks for component rest props
export interface Props {
	[key: string]: any;
}
```

DO:

```ts
// Use `unknown` to ensure type safety while allowing rest props
export interface Props {
	[key: string]: unknown;
}
```

> This prevents `Unexpected any. Specify a different type` lint errors from `@typescript-eslint/no-explicit-any`.

### Tenet: Always provide keys for Svelte each blocks

DON'T:

```svelte
<!-- Missing key causes svelte/require-each-key lint error -->
{#each items as item}
	<div>{item.name}</div>
{/each}
```

DO:

```svelte
<!-- Always provide a unique key for the loop -->
{#each items as item (item.id)}
	<div>{item.name}</div>
{/each}
```

> Providing a key is required by the linter and improves DOM reconciliation performance and state consistency.

### Tenet: Use SvelteDate for reactive dates in Svelte 5

DON'T:

```ts
// Mutable instance of built-in Date class
const myDate = new Date();
myDate.setDate(myDate.getDate() - 1);
```

DO:

```ts
// Use SvelteDate for reactivity
import { SvelteDate } from 'svelte/reactivity';

const myDate = new SvelteDate();
myDate.setDate(myDate.getDate() - 1);
```

> This avoids the `svelte/prefer-svelte-reactivity` lint error and ensures state updates trigger properly in Svelte 5.

### Tenet: Validate API input at boundaries with Zod

DON'T:

```ts
// Manual casts disable type checking and miss invalid payloads
const incoming = payload.data?.categories || [];
const sanitized = incoming.map((c: Record<string, unknown>) => ({
	name: (c.name as string) || 'Unknown',
	amount: (c.amount as number) || 0
}));
```

DO:

```ts
// Zod validates shape + types at the boundary
const parsed = SyncPayloadSchema.safeParse(rawPayload);
if (!parsed.success) {
	return json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
}
const { categories, transactions } = parsed.data.data;
```

> This guarantees type correctness and provides structured error messages. Always validate before any business logic.

### Tenet: Use sessionStorage for transient secrets, not localStorage

DON'T:

```ts
// localStorage persists to disk indefinitely — secrets leak from closed browser sessions
localStorage.setItem('cloud_sync_password', password);
```

DO:

```ts
// sessionStorage clears when browser closes — secrets don't persist across sessions
sessionStorage.setItem('cloud_sync_password', password);
```

> `localStorage` survives browser close/restart. `sessionStorage` is scoped to the tab session, reducing the exposure window for stored secrets.

### Tenet: Prefer upsert over wipe+reinsert for sync operations

DON'T:

```ts
// Delete-all + re-insert causes data loss if two clients sync concurrently
await tx.delete(transactions);
await tx.delete(categories);
await tx.insert(categories).values(allCategories);
await tx.insert(transactions).values(allTransactions);
```

DO:

```ts
// Upsert preserves data that wasn't part of this sync batch
for (const cat of incomingCategories) {
	await tx.insert(categories)
		.values(cat)
		.onConflictDoUpdate({
			target: categories.id,
			set: { /* all fields */ }
		});
}
```

> Wipe+reinsert is not safe under concurrency. Upsert ensures no data is lost when multiple clients sync simultaneously.

### Tenet: Validate Origin/Referer on authenticated endpoints

DON'T:

```ts
// No origin check — any website can trigger requests from a logged-in browser
export async function POST({ request }) { ... }
```

DO:

```ts
// Reject requests from unexpected origins
const originCheck = validateOrigin(request);
if (!originCheck.valid) {
	return json({ error: originCheck.reason }, { status: 403 });
}
```

> Custom headers like `x-api-key` are not auto-sent by browsers in CSRF attacks, but Origin/Referer validation provides defense-in-depth. Always check in production.

### Tenet: Clean up Dexie liveQuery subscriptions in Svelte 5

DON'T:

```svelte
<script lang="ts">
	$effect(() => {
		liveQuery(() => db.transactions.toArray()).subscribe((res) => {
			transactions = res;
		});
		// No cleanup — subscription lives forever, causes memory leaks on re-render
	});
</script>
```

DO:

```svelte
<script lang="ts">
	$effect(() => {
		const sub = liveQuery(() => db.transactions.toArray()).subscribe((res) => {
			transactions = res;
		});
		return () => sub.unsubscribe();
	});
</script>
```

> `$effect` re-runs when its dependencies change. Without returning a cleanup function, each re-run creates a new subscription without disposing the old one, causing memory leaks and stale data.
