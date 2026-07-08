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
