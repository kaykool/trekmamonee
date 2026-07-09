<script lang="ts">
	import Select from '$lib/components/ui/Select.svelte';
	import TransactionOptionsSheet from '$lib/components/transactions/TransactionOptionsSheet.svelte';
	import TransactionList from '$lib/components/transactions/TransactionList.svelte';
	import MonthSelector from '$lib/components/dashboard/MonthSelector.svelte';
	import { db, type Transaction, type Category } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { openEditTransaction, openConfirmDialog } from '$lib/state/ui.svelte';
	import { globalDateState, resetToToday } from '$lib/state/date.svelte';

	let typeFilter = $state('all');

	// Date State for Pagination
	let displayMonth = $derived(
		globalDateState.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
	);

	function prevMonth() {
		globalDateState.currentDate = new Date(globalDateState.currentDate.getFullYear(), globalDateState.currentDate.getMonth() - 1, 1);
	}

	function nextMonth() {
		globalDateState.currentDate = new Date(globalDateState.currentDate.getFullYear(), globalDateState.currentDate.getMonth() + 1, 1);
	}

	let transactions = $state<Transaction[]>([]);
	let categories = $state<Category[]>([]);

	// Bottom Sheet State
	let isSheetOpen = $state(false);
	let selectedTransaction = $state<Transaction | null>(null);

	// Fetch Categories
	$effect(() => {
		const sub = liveQuery(() => db.categories.toArray()).subscribe((res) => (categories = res));
		return () => sub.unsubscribe();
	});

	// Fetch Transactions (with filter and month pagination)
	$effect(() => {
		// Read state synchronously so Svelte 5 tracks it as a dependency for this effect
		const currentFilter = typeFilter;
		const year = globalDateState.currentDate.getFullYear();
		const month = (globalDateState.currentDate.getMonth() + 1).toString().padStart(2, '0');
		const monthPrefix = `${year}-${month}`;

		const sub = liveQuery(async () => {
			// Use Dexie's index filtering to only load the current month's transactions into memory
			// This vastly improves performance and reduces memory usage as the history grows.
			const monthTx = await db.transactions
				.where('date')
				.startsWith(monthPrefix)
				.reverse() // Sort descending by date
				.toArray();

			if (currentFilter === 'all') return monthTx;
			return monthTx.filter((t) => t.type === currentFilter);
		}).subscribe((res) => (transactions = res));

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
	<title>History | Trekmamonee</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="rounded-2xl bg-surface-light p-4 shadow-sm dark:bg-surface-dark">
		<p class="text-xs font-bold tracking-wider text-primary">MANAGE TRANSACTIONS</p>
		<p class="mt-1 text-sm text-text-light/70 dark:text-text-dark/70">
			Review monthly records, filter by type, and edit entries when details need correction.
		</p>
	</div>

	<!-- Month Selector -->
	<MonthSelector {displayMonth} onprev={prevMonth} onnext={nextMonth} ontoday={resetToToday} />

	<div class="flex gap-2">
		<Select
			class="flex-1"
			bind:value={typeFilter}
			options={[
				{ value: 'all', label: 'All Types' },
				{ value: 'expense', label: 'Expenses' },
				{ value: 'income', label: 'Income' }
			]}
		/>
	</div>

	<TransactionList {transactions} {categories} ontransactionclick={handleTransactionClick} />
</div>

<TransactionOptionsSheet
	bind:isOpen={isSheetOpen}
	transaction={selectedTransaction}
	onedit={handleEdit}
	ondelete={promptDelete}
/>
