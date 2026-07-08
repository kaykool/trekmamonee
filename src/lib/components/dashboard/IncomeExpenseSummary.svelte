<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { MonthSummary } from '$lib/db/queries';

	let {
		summary
	}: {
		summary: MonthSummary;
	} = $props();

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);

	let balanceColor = $derived(summary.balance >= 0 ? 'text-primary' : 'text-danger');
</script>

<div class="flex flex-col gap-3">
	<div class="grid grid-cols-2 gap-3">
		<!-- Income Card -->
		<Card class="flex flex-col gap-1">
			<span
				class="text-xs font-medium uppercase tracking-wide text-text-light/60 dark:text-text-dark/60"
			>
				Income
			</span>
			<span class="text-lg font-bold text-primary">
				{formatCurrency(summary.totalIncome)}
			</span>
		</Card>

		<!-- Expense Card -->
		<Card class="flex flex-col gap-1">
			<span
				class="text-xs font-medium uppercase tracking-wide text-text-light/60 dark:text-text-dark/60"
			>
				Expenses
			</span>
			<span class="text-lg font-bold text-danger">
				{formatCurrency(summary.totalExpense)}
			</span>
		</Card>
	</div>

	<!-- Balance Card -->
	<Card class="flex items-center justify-between">
		<span class="text-sm font-medium text-text-light/70 dark:text-text-dark/70"> Balance </span>
		<span class="text-lg font-bold {balanceColor}">
			{summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)}
		</span>
	</Card>
</div>
