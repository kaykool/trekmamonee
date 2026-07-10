<script lang="ts">
	import DailyBreakdown from '$lib/components/dashboard/DailyBreakdown.svelte';
	import IncomeExpenseSummary from '$lib/components/dashboard/IncomeExpenseSummary.svelte';
	import MonthSelector from '$lib/components/dashboard/MonthSelector.svelte';
	import TransactionOptionsSheet from '$lib/components/transactions/TransactionOptionsSheet.svelte';
	import { db, type Transaction } from '$lib/db';
	import {
		getDailyBreakdown,
		getMonthSummary,
		type DailyBreakdown as DailyBreakdownType,
		type MonthSummary
	} from '$lib/db/queries';
	import { globalDateState, resetToToday } from '$lib/state/date.svelte';
	import { openConfirmDialog, openEditTransaction } from '$lib/state/ui.svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { liveQuery } from 'dexie';

	let displayMonth = $derived(
		globalDateState.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
	);

	function prevMonth() {
		globalDateState.currentDate = new SvelteDate(
			globalDateState.currentDate.getFullYear(),
			globalDateState.currentDate.getMonth() - 1,
			1
		);
	}

	function nextMonth() {
		globalDateState.currentDate = new SvelteDate(
			globalDateState.currentDate.getFullYear(),
			globalDateState.currentDate.getMonth() + 1,
			1
		);
	}

	let monthSummary = $state<MonthSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
	let dailyBreakdown = $state<DailyBreakdownType[]>([]);

	// Bottom Sheet State for options
	let isSheetOpen = $state(false);
	let selectedTransaction = $state<Transaction | null>(null);

	// Reactive subscription to Dexie data
	$effect(() => {
		const year = globalDateState.currentDate.getFullYear();
		const month = globalDateState.currentDate.getMonth() + 1;

		const sub = liveQuery(async () => {
			const [summary, daily] = await Promise.all([
				getMonthSummary(year, month),
				getDailyBreakdown(year, month)
			]);
			return { summary, daily };
		}).subscribe((data) => {
			if (data) {
				monthSummary = data.summary;
				dailyBreakdown = data.daily;
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
	<div class="rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
		<p class="text-xs font-bold tracking-wider text-primary">TODAY AT A GLANCE</p>
		<p class="mt-1 text-sm text-text-light/70 dark:text-text-dark/70">
			Check this month quickly, then open History to manage records or Reports to analyze trends.
		</p>
		<div class="mt-3 flex gap-2">
			<a
				href="/transactions"
				class="rounded-full bg-surface-dark/5 px-3 py-1 text-xs font-semibold text-text-light transition-colors hover:bg-surface-dark/10 dark:bg-surface-light/10 dark:text-text-dark dark:hover:bg-surface-light/15"
			>
				Manage history
			</a>
			<a
				href="/reports"
				class="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/25"
			>
				View trends
			</a>
		</div>
	</div>

	<!-- Month Selector -->
	<MonthSelector {displayMonth} onprev={prevMonth} onnext={nextMonth} ontoday={resetToToday} />

	<!-- Summary Cards -->
	<IncomeExpenseSummary {monthSummary} />

	<!-- Daily Breakdown -->
	<DailyBreakdown {dailyBreakdown} ontransactionclick={handleTransactionClick} />
</div>

<!-- Transaction Options Sheet -->
<TransactionOptionsSheet
	bind:isOpen={isSheetOpen}
	transaction={selectedTransaction}
	onedit={handleEdit}
	ondelete={promptDelete}
/>
