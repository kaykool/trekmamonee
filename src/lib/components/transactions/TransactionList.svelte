<script lang="ts">
	import TransactionItem from './TransactionItem.svelte';
	import type { Transaction, Category } from '$lib/db';
	import Card from '$lib/components/ui/Card.svelte';

	let {
		transactions = [],
		categories = [],
		ontransactionclick
	}: {
		transactions: Transaction[];
		categories: Category[];
		ontransactionclick?: (t: Transaction) => void;
	} = $props();

	// Create a map for O(1) category lookups
	let categoryMap = $derived(
		categories.reduce(
			(acc, cat) => {
				acc[cat.id] = cat;
				return acc;
			},
			{} as Record<string, Category>
		)
	);

	// Group transactions by date (optional, but nice for UX)
	// For now, just a flat list for simplicity, sorted by date desc
</script>

{#if transactions.length === 0}
	<Card class="flex flex-col items-center justify-center py-16 gap-2 text-center border-none shadow-none bg-transparent">
		<div class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-dark/5 dark:bg-surface-light/5 text-text-light/40 dark:text-text-dark/40 mb-1">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
		</div>
		<span class="text-text-light/50 dark:text-text-dark/50 font-medium">No transactions found</span>
		<span class="text-xs text-text-light/40 dark:text-text-dark/40">Try a different month or filter</span>
	</Card>
{:else}
	<div class="flex flex-col gap-3">
		{#each transactions as tx (tx.id)}
			<TransactionItem
				transaction={tx}
				category={categoryMap[tx.categoryId]}
				onclick={() => ontransactionclick?.(tx)}
			/>
		{/each}
	</div>
{/if}
