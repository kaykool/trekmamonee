---
name: refactor
description: Surgical refactoring for this Svelte 5 + Dexie + Drizzle + Zod expense tracker. Covers runes cleanup, Dexie query dedup, Zod boundary enforcement, SvelteKit route hygiene. No generic e-commerce patterns.
---

# Refactor — Trekmamonee Edition

## Principles

1. **Preserve behavior** — same data in/out, same UI, same DB schema
2. **Small steps** — one smell per commit. Run `npm run lint` after each
3. **Prefer deletion** — removing dead code, unused imports, stale routes is the highest-value refactoring
4. **No new abstractions** — extract helpers, never patterns (no Strategy/Chain/Factory). This project's `architecture.md` prohibits them unless justified
5. **Don't touch D1 schema or Dexie version** — these are behaviors, not structure

## Project-Specific Smells

### 1. Duplicated Dexie query logic across pages

The dashboard (`+page.svelte`), transactions, and reports pages each repeat the same Dexie query patterns (date-prefix filtering, category lookup maps, income/expense aggregation).

```diff
# BAD: Reports page reimplements getMonthSummary + getCategoryBreakdown inline
- // ~60 lines of query + aggregation logic duplicated from queries.ts
- const transactions = await db.transactions.where('date').startsWith(monthPrefix).toArray();
- let totalIncome = 0;
- for (const tx of transactions) { ... }

# GOOD: Add a date-range variant to queries.ts, reuse it
+ import { getCategoryBreakdown } from '$lib/db/queries';
+ const breakdown = await getCategoryBreakdown(year, month, 'expense');
```

**Check:** Does `queries.ts` already have a function for this? Add a parameter (date range) before duplicating.

### 2. Inline Chart.js config that repeats the `chart` Svelte action

```diff
# BAD: Reports page creates Chart directly instead of using the action
- chartInstance = new Chart(canvas, { ... });
- // Must manually destroy, handle dark mode, etc.

# GOOD: Use the existing chart action
+ <canvas use:chart={chartConfig}></canvas>
```

### 3. Repeated prevMonth/nextMonth + displayMonth pattern

Dashboard, transactions, and reports each define identical date navigation functions:

```diff
# BAD: Same 5 lines in 3 files
- function prevMonth() {
-   globalDateState.currentDate = new Date(...);
- }

# GOOD: Extract to the MonthSelector component or date state module
```

### 4. localStorage → sessionStorage (secrets)

Already fixed. But watch for any new code that stores credentials, API keys, or tokens in `localStorage`. Use `sessionStorage` or memory-only.

### 5. `as Record<string, unknown>` casts instead of Zod

```diff
# BAD: Manual cast + sanitization (unsafe, verbose)
- const cat = payload.data?.categories || [];
- const sanitized = cat.map((c: Record<string, unknown>) => ({
-   name: (c.name as string) || 'Unknown',
-   ...
- }));

# GOOD: Zod at the boundary
+ const parsed = SyncPayloadSchema.safeParse(rawPayload);
+ if (!parsed.success) return json({ error: ... }, { status: 400 });
```

### 6. Unused dependencies

Check `package.json` before adding a new dep. Remove deps that are no longer imported:
- `uuid` → use `crypto.randomUUID()`
- `@tanstack/svelte-query` → use Dexie `liveQuery`

### 7. Side-effect imports in layout/pages

```diff
# BAD: Import triggers side effect on every route
- import '$lib/db/seed';

# GOOD: Use explicit init call
+ import { seedDefaultCategories } from '$lib/db/seed';
+ await seedDefaultCategories();
```

### 8. Stale route entries

The `Header.svelte` title map and `BottomNav` route list can accumulate stale paths from removed pages. Check after deleting a route.

## Refactoring Workflow

```
1. READ the file — understand it before changing it
2. IDENTIFY the smell — which category above?
3. CHECK queries.ts / constants.ts / utils.ts — does a helper already exist?
4. MAKE the change — one file, one smell
5. RUN `npm run lint` — zero errors before moving on
6. REPEAT
```

## Operations Reference

| Operation | When | Example in this codebase |
|---|---|---|
| Extract query to queries.ts | Same Dexie filter in 2+ pages | `getMonthSummary`, `getRecentTransactions` |
| Replace manual cast with Zod | API route handles request body | `sync/+server.ts` POST handler |
| Pull state into store | Same reactive state in 2+ components | `globalDateState`, `uiState` |
| Remove unused import | Linter warns about unused symbol | `openEditTransaction` in transactions page |
| Inline trivial Svelte action | Action wraps 3-line chart init | `chart.ts` action used in SpendingChart |
| Delete stale route/config | Route removed but nav still lists it | `/transactions/add` in Header |
| Collapse guard clauses | Nested if/else in server handlers | Rate limit checks in sync endpoints |
| Remove dead dep | Package no longer imported | `uuid`, `@tanstack/svelte-query` |
