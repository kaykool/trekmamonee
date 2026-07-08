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
		<Card
			class="flex flex-col items-center justify-center py-10 gap-2 bg-surface-light dark:bg-surface-dark text-center"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-dark/5 dark:bg-surface-light/5 text-text-light/40 dark:text-text-dark/40 mb-1"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg
				>
			</div>
			<span class="text-text-light/50 dark:text-text-dark/50 font-medium">No transactions yet</span>
			<span class="text-xs text-text-light/40 dark:text-text-dark/40"
				>Tap + to add your first expense</span
			>
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
