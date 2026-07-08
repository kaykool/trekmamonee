<script lang="ts">
	import MonthSelector from '$lib/components/dashboard/MonthSelector.svelte';
	import IncomeExpenseSummary from '$lib/components/dashboard/IncomeExpenseSummary.svelte';
	import SpendingChart from '$lib/components/dashboard/SpendingChart.svelte';
	import RecentTransactions from '$lib/components/dashboard/RecentTransactions.svelte';
	import TransactionOptionsSheet from '$lib/components/transactions/TransactionOptionsSheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { db, type Transaction } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { openEditTransaction, openConfirmDialog } from '$lib/state/ui.svelte';
	import {
		getMonthSummary,
		getCategoryBreakdown,
		getRecentTransactions,
		type MonthSummary,
		type CategoryTotal,
		type RecentTransaction
	} from '$lib/db/queries';
	import { formatIDR } from '$lib/utils';

	let currentDate = $state(new Date());
	let displayMonth = $derived(
		currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
	);

	function prevMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
	}

	let monthSummary = $state<MonthSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
	let categoryBreakdown = $state<CategoryTotal[]>([]);
	let recentTransactions = $state<RecentTransaction[]>([]);

	// Bottom Sheet State for options
	let isSheetOpen = $state(false);
	let selectedTransaction = $state<Transaction | null>(null);

	// Reactive subscription to Dexie data
	$effect(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth() + 1;

		const sub = liveQuery(async () => {
			const [summary, breakdown, recent] = await Promise.all([
				getMonthSummary(year, month),
				getCategoryBreakdown(year, month, 'expense'),
				getRecentTransactions(5)
			]);
			return { summary, breakdown, recent };
		}).subscribe((data) => {
			if (data) {
				monthSummary = data.summary;
				categoryBreakdown = data.breakdown;
				recentTransactions = data.recent;
			}
		});

		return () => sub.unsubscribe();
	});

	function handleTransactionClick(tx: Transaction) {
		selectedTransaction = tx;
		isSheetOpen = true;
	}

	function promptDelete() {
		openConfirmDialog({
			title: 'Delete Transaction',
			description:
				'Are you sure you want to delete this transaction? This action cannot be undone.',
			confirmText: 'Delete',
			onconfirm: executeDelete
		});
	}

	async function executeDelete() {
		if (selectedTransaction) {
			await db.transactions.delete(selectedTransaction.id);
			isSheetOpen = false;
			selectedTransaction = null;
		}
	}

	function handleEdit() {
		if (selectedTransaction) {
			isSheetOpen = false;
			openEditTransaction(selectedTransaction.id);
		}
	}
</script>

<svelte:head>
	<title>Dashboard | Trekmamonee</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Month Selector -->
	<MonthSelector {displayMonth} onprev={prevMonth} onnext={nextMonth} />

	<!-- Summary Cards -->
	<IncomeExpenseSummary {monthSummary} />

	<!-- Spending Chart Card -->
	<SpendingChart {categoryBreakdown} totalExpense={monthSummary.totalExpense} />

	<!-- Recent Transactions -->
	<RecentTransactions {recentTransactions} ontransactionclick={handleTransactionClick} />
</div>

<!-- Transaction Options Sheet -->
<TransactionOptionsSheet
	bind:isOpen={isSheetOpen}
	transaction={selectedTransaction}
	onedit={handleEdit}
	ondelete={promptDelete}
/>
