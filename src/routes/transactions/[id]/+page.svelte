<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { db, type TransactionType, type Category } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { getLocalDateString } from '$lib/utils';

	let txId = $page.params.id as string;

	let type = $state<TransactionType>('expense');
	let amount = $state<number | undefined>();
	let itemName = $state('');
	let date = $state(getLocalDateString());
	let selectedCategoryId = $state<string>('');

	let categories = $state<Category[]>([]);
	let isSaving = $state(false);
	let isLoading = $state(true);

	let originalCreatedAt = $state<number>(Date.now());

	// Load existing transaction
	$effect(() => {
		async function loadTx() {
			try {
				const tx = await db.transactions.get(txId);
				if (tx) {
					type = tx.type;
					amount = tx.amount;
					itemName = tx.itemName || '';
					date = tx.date;
					selectedCategoryId = tx.categoryId;
					originalCreatedAt = tx.createdAt;
				} else {
					alert('Transaction not found');
					goto('/transactions');
				}
			} catch (err) {
				console.error(err);
			} finally {
				isLoading = false;
			}
		}
		loadTx();
	});

	// Subscribe to categories
	$effect(() => {
		// Read state synchronously
		const currentType = type;

		const observable = liveQuery(() => db.categories.where('type').equals(currentType).toArray());

		const subscription = observable.subscribe((result) => {
			categories = result;
			// Auto-select first category if none selected or if selected isn't in current list
			// Only do this if we are not loading the initial transaction state
			if (!isLoading && result.length > 0 && !result.find((c) => c.id === selectedCategoryId)) {
				selectedCategoryId = result[0].id;
			}
		});

		return () => subscription.unsubscribe();
	});

	async function handleSave() {
		if (!amount || amount <= 0) {
			alert('Please enter a valid amount');
			return;
		}

		if (!itemName.trim()) {
			alert('Please enter an item name');
			return;
		}

		if (!selectedCategoryId) {
			alert('Please select a category');
			return;
		}

		isSaving = true;
		try {
			await db.transactions.put({
				id: txId,
				amount,
				categoryId: selectedCategoryId,
				type,
				itemName,
				date,
				createdAt: originalCreatedAt,
				updatedAt: Date.now()
			});
			goto('/transactions');
		} catch (error) {
			console.error('Failed to update transaction:', error);
			alert('Failed to update transaction');
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Edit Transaction | Trekmamonee</title>
</svelte:head>

<div class="flex flex-col gap-6">
	{#if isLoading}
		<div class="flex h-40 items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-surface-dark/20 border-t-primary dark:border-surface-light/20"
			></div>
		</div>
	{:else}
		<!-- Type toggle -->
		<div class="flex w-full rounded-lg bg-surface-dark/5 p-1 dark:bg-surface-light/10">
			<button
				class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {type === 'expense'
					? 'bg-surface-light text-danger shadow-sm dark:bg-surface-dark'
					: 'text-text-light/60 dark:text-text-dark/60'}"
				onclick={() => (type = 'expense')}
			>
				Expense
			</button>
			<button
				class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {type === 'income'
					? 'bg-surface-light text-primary shadow-sm dark:bg-surface-dark'
					: 'text-text-light/60 dark:text-text-dark/60'}"
				onclick={() => (type = 'income')}
			>
				Income
			</button>
		</div>

		<Card class="flex flex-col gap-4">
			<Input
				type="number"
				label="Amount (IDR)"
				placeholder="0"
				bind:value={amount}
				class="text-lg"
			/>

			<Input type="text" label="Item Name" placeholder="e.g. Nasi Goreng" bind:value={itemName} />

			<div class="flex flex-col gap-1.5">
				<span class="text-sm font-medium text-text-light dark:text-text-dark">Category</span>
				<div class="grid grid-cols-4 gap-2">
					{#each categories as category (category.id)}
						<button
							class="flex aspect-square flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors {selectedCategoryId ===
							category.id
								? 'bg-bg-dark/10 ring-2 ring-primary dark:bg-surface-light/20'
								: 'bg-surface-dark/5 hover:bg-surface-dark/10 dark:bg-surface-light/5 dark:hover:bg-surface-light/10'}"
							onclick={() => (selectedCategoryId = category.id)}
						>
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full {category.color} text-white shadow-sm"
							>
								{category.icon}
							</div>
							<span
								class="truncate text-[10px] text-text-light/80 dark:text-text-dark/80 max-w-full"
								>{category.name}</span
							>
						</button>
					{/each}
				</div>
			</div>

			<Input type="date" label="Date" bind:value={date} />
		</Card>

		<div class="flex gap-3">
			<Button
				variant="secondary"
				class="flex-1"
				onclick={() => goto('/transactions')}
				disabled={isSaving}>Cancel</Button
			>
			<Button
				variant={type === 'expense' ? 'danger' : 'primary'}
				class="flex-2"
				onclick={handleSave}
				disabled={isSaving}
			>
				{isSaving ? 'Saving...' : `Update ${type}`}
			</Button>
		</div>
	{/if}
</div>
