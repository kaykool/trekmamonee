<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { DailyBreakdown } from '$lib/db/queries';
	import type { Transaction } from '$lib/db';
	import { formatIDR } from '$lib/utils';

	let {
		dailyBreakdown,
		ontransactionclick
	}: {
		dailyBreakdown: DailyBreakdown[];
		ontransactionclick: (tx: Transaction) => void;
	} = $props();
</script>

<div class="flex flex-col gap-3">
	<h2 class="text-xs font-bold tracking-wider text-text-light/50 dark:text-text-dark/50">
		DAILY BREAKDOWN
	</h2>

	{#if dailyBreakdown.length === 0}
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
					stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg
			>
			</div>
			<span class="text-text-light/50 dark:text-text-dark/50 font-medium">No transactions this month</span>
			<span class="text-xs text-text-light/40 dark:text-text-dark/40"
				>Tap + to add your first transaction</span
			>
		</Card>
	{:else}
		{#each dailyBreakdown as day (day.date)}
			<Card class="flex flex-col gap-2 p-4 bg-surface-light dark:bg-surface-dark">
				<div class="flex items-center justify-between">
					<span class="text-sm font-bold text-text-light dark:text-text-dark">{day.dayLabel}</span>
					<div class="flex gap-3 text-xs font-semibold">
						{#if day.totalIncome > 0}
							<span class="text-primary">+{formatIDR(day.totalIncome)}</span>
						{/if}
						{#if day.totalExpense > 0}
							<span class="text-danger">-{formatIDR(day.totalExpense)}</span>
						{/if}
					</div>
				</div>
				<div class="flex flex-col gap-1">
					{#each day.transactions as { transaction, category } (transaction.id)}
						<button
							onclick={() => ontransactionclick(transaction)}
							class="w-full text-left bg-transparent border-none p-0 cursor-pointer"
							type="button"
						>
							<div
								class="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-surface-dark/5 dark:hover:bg-surface-light/5 transition-colors"
							>
								<div class="flex items-center gap-3 min-w-0">
									<div
										class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full {category?.color || 'bg-gray-500'} text-sm text-white"
									>
										{category?.icon || '🏷️'}
									</div>
									<div class="flex flex-col min-w-0">
										<span class="text-sm font-semibold text-text-light dark:text-text-dark truncate"
											>{transaction.itemName}</span
										>
										<span class="text-xs text-text-light/50 dark:text-text-dark/50 truncate"
											>{category?.name || 'Unknown'}</span
										>
									</div>
								</div>
								<span
									class="text-sm font-bold shrink-0 {transaction.type === 'expense'
										? 'text-danger'
										: 'text-primary'}"
								>
									{transaction.type === 'expense' ? '-' : '+'}{formatIDR(transaction.amount)}
								</span>
							</div>
						</button>
					{/each}
				</div>
			</Card>
		{/each}
	{/if}
</div>
