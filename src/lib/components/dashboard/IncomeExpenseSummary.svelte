<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { MonthSummary } from '$lib/db/queries';
	import { formatIDR } from '$lib/utils';

	let {
		monthSummary
	}: {
		monthSummary: MonthSummary;
	} = $props();
</script>

<div class="flex flex-col gap-3">
	<Card class="flex flex-col gap-1 p-4 bg-surface-light dark:bg-surface-dark">
		<span
			class="text-xs font-semibold tracking-wider uppercase text-text-light/50 dark:text-text-dark/50"
			>Income</span
		>
		<span class="text-lg font-bold text-primary"
			>{formatIDR(monthSummary.totalIncome)}</span
		>
	</Card>
	<Card class="flex flex-col gap-1 p-4 bg-surface-light dark:bg-surface-dark">
		<span
			class="text-xs font-semibold tracking-wider uppercase text-text-light/50 dark:text-text-dark/50"
			>Expenses</span
		>
		<span class="text-lg font-bold text-danger"
			>{formatIDR(monthSummary.totalExpense)}</span
		>
	</Card>
	<Card class="flex flex-col gap-1 p-4 bg-surface-light dark:bg-surface-dark">
		<span
			class="text-xs font-semibold tracking-wider uppercase text-text-light/50 dark:text-text-dark/50"
			>Balance</span
		>
		<span
			class="text-lg font-bold {monthSummary.balance >= 0
				? 'text-primary'
				: 'text-danger'}"
		>
			{formatIDR(monthSummary.balance)}
		</span>
	</Card>
</div>
