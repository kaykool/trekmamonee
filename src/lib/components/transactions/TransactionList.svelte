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
	<Card class="flex items-center justify-center py-12">
		<span class="text-text-light/50 dark:text-text-dark/50">No transactions found</span>
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
