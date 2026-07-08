<script lang="ts">
	import TransactionItem from '$lib/components/transactions/TransactionItem.svelte';
	import type { RecentTransaction } from '$lib/db/queries';

	let {
		items,
		ontransactionclick
	}: {
		items: RecentTransaction[];
		ontransactionclick?: (tx: import('$lib/db').Transaction) => void;
	} = $props();
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center justify-between">
		<h2
			class="text-sm font-semibold uppercase tracking-wide text-text-light/60 dark:text-text-dark/60"
		>
			Recent Transactions
		</h2>
		{#if items.length > 0}
			<a
				href="/transactions"
				class="text-xs font-medium text-primary transition-colors hover:text-primary/80"
			>
				View All →
			</a>
		{/if}
	</div>

	{#if items.length > 0}
		<div class="flex flex-col gap-2">
			{#each items as { transaction, category } (transaction.id)}
				<TransactionItem
					{transaction}
					{category}
					onclick={() => ontransactionclick?.(transaction)}
				/>
			{/each}
		</div>
	{:else}
		<div
			class="flex items-center justify-center rounded-xl bg-surface-light py-8 dark:bg-surface-dark"
		>
			<span class="text-sm text-text-light/40 dark:text-text-dark/40"> No transactions yet </span>
		</div>
	{/if}
</div>
