<script lang="ts">
	import Select from '$lib/components/ui/Select.svelte';
	import TransactionOptionsSheet from '$lib/components/transactions/TransactionOptionsSheet.svelte';
	import TransactionList from '$lib/components/transactions/TransactionList.svelte';
	import { db, type Transaction, type Category } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { openEditTransaction, openConfirmDialog } from '$lib/state/ui.svelte';

	let typeFilter = $state('all');

	// Date State for Pagination
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
		const year = currentDate.getFullYear();
		const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
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
	<!-- Month Selector -->
	<div
		class="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-2 rounded-2xl shadow-sm"
	>
		<button
			class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-surface-dark/5 dark:hover:bg-surface-light/10 text-text-light/60 hover:text-text-light dark:text-text-dark/60 dark:hover:text-text-dark"
			onclick={prevMonth}
			aria-label="Previous month"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg
			>
		</button>

		<span class="text-base font-semibold text-text-light dark:text-text-dark">{displayMonth}</span>

		<button
			class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-surface-dark/5 dark:hover:bg-surface-light/10 text-text-light/60 hover:text-text-light dark:text-text-dark/60 dark:hover:text-text-dark"
			onclick={nextMonth}
			aria-label="Next month"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg
			>
		</button>
	</div>

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
