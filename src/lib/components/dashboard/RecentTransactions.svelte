<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { RecentTransaction } from '$lib/db/queries';
	import type { Transaction } from '$lib/db';
	import { formatIDR } from '$lib/utils';

	let {
		recentTransactions,
		ontransactionclick
	}: {
		recentTransactions: RecentTransaction[];
		ontransactionclick: (tx: Transaction) => void;
	} = $props();
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center justify-between">
		<h2 class="text-xs font-bold tracking-wider text-text-light/50 dark:text-text-dark/50">
			RECENT TRANSACTIONS
		</h2>
		<a href="/transactions" class="text-xs font-semibold text-primary hover:underline">View All</a>
	</div>

	{#if recentTransactions.length === 0}
		<Card class="flex items-center justify-center py-10 bg-surface-light dark:bg-surface-dark">
			<span class="text-text-light/50 dark:text-text-dark/50">No transactions yet</span>
		</Card>
	{:else}
		<div class="flex flex-col gap-2">
			{#each recentTransactions as { transaction, category } (transaction.id)}
				<button
					onclick={() => ontransactionclick(transaction)}
					class="w-full text-left bg-transparent border-none p-0 cursor-pointer"
					type="button"
				>
					<Card
						class="flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark hover:bg-surface-dark/5 dark:hover:bg-surface-light/5 transition-colors cursor-pointer border-none"
					>
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full {category?.color ||
									'bg-gray-500'} text-lg text-white"
							>
								{category?.icon || '🏷️'}
							</div>
							<div class="flex flex-col">
								<span class="text-sm font-semibold text-text-light dark:text-text-dark"
									>{transaction.itemName}</span
								>
								<span class="text-xs text-text-light/50 dark:text-text-dark/50"
									>{transaction.date}</span
								>
							</div>
						</div>
						<span
							class="text-sm font-bold {transaction.type === 'expense'
								? 'text-danger'
								: 'text-primary'}"
						>
							{transaction.type === 'expense' ? '-' : '+'}{formatIDR(transaction.amount)}
						</span>
					</Card>
				</button>
			{/each}
		</div>
	{/if}
</div>
