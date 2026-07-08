<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CategorySelector from './CategorySelector.svelte';
	import QuickDateSelector from './QuickDateSelector.svelte';

	import { db, generateId, type TransactionType } from '$lib/db';
	import { closeTransactionSheet, addToast } from '$lib/state/ui.svelte';
	import { APP_CONFIG } from '$lib/constants';
	import { getLocalDateString } from '$lib/utils';

	let {
		transactionId = null
	}: {
		transactionId?: string | null;
	} = $props();

	let type = $state<TransactionType>('expense');
	let amount = $state<number | undefined>();
	let amountText = $state<string>('');
	let itemName = $state('');
	let date = $state(getLocalDateString());
	let selectedCategoryId = $state<string>('');

	let isSaving = $state(false);
	let isLoading = $state(false);

	let originalCreatedAt = $state<number>(Date.now());

	// Load existing transaction if ID is provided
	$effect(() => {
		if (transactionId) {
			isLoading = true;
			async function loadTx() {
				try {
					const tx = await db.transactions.get(transactionId as string);
					if (tx) {
						type = tx.type;
						amount = tx.amount;
						amountText = tx.amount ? tx.amount.toLocaleString('id-ID') : '';
						itemName = tx.itemName || '';
						date = tx.date;
						selectedCategoryId = tx.categoryId;
						originalCreatedAt = tx.createdAt;
					} else {
						addToast('Transaction not found', 'error');
						closeTransactionSheet();
					}
				} catch (err) {
					console.error(err);
				} finally {
					isLoading = false;
				}
			}
			loadTx();
		}
	});

	function handleAmountInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const raw = target.value.replace(/\D/g, '');
		amount = raw ? parseInt(raw, 10) : undefined;
		amountText = raw ? parseInt(raw, 10).toLocaleString('id-ID') : '';
	}

	async function handleSave() {
		if (!amount || amount <= 0) {
			addToast(
				'Please enter a valid amount greater than 0.',
				'error',
				APP_CONFIG.toast.errorDurationMs
			);
			return;
		}

		if (!itemName.trim()) {
			addToast('Please enter an item name.', 'error', APP_CONFIG.toast.errorDurationMs);
			return;
		}

		if (!selectedCategoryId) {
			addToast('Please select a category.', 'error', APP_CONFIG.toast.errorDurationMs);
			return;
		}

		isSaving = true;
		try {
			if (transactionId) {
				await db.transactions.put({
					id: transactionId,
					amount,
					categoryId: selectedCategoryId,
					type,
					itemName,
					date,
					createdAt: originalCreatedAt,
					updatedAt: Date.now()
				});
				addToast('Transaction updated successfully', 'success');
			} else {
				await db.transactions.add({
					id: generateId(),
					amount,
					categoryId: selectedCategoryId,
					type,
					itemName,
					date,
					createdAt: Date.now(),
					updatedAt: Date.now()
				});
				addToast('Transaction added successfully', 'success');
			}
			closeTransactionSheet();
		} catch (error) {
			console.error('Failed to save transaction:', error);
			addToast('Failed to save transaction', 'error');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex flex-col gap-6 pt-2 min-h-[500px]">
	<div class="flex gap-2 p-1 bg-surface-dark/5 dark:bg-surface-light/5 rounded-xl">
		<button
			class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'expense'
				? 'bg-surface-light dark:bg-surface-dark shadow-sm text-text-light dark:text-text-dark'
				: 'text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark'}"
			onclick={() => (type = 'expense')}
		>
			Expense
		</button>
		<button
			class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'income'
				? 'bg-surface-light dark:bg-surface-dark shadow-sm text-text-light dark:text-text-dark'
				: 'text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark'}"
			onclick={() => (type = 'income')}
		>
			Income
		</button>
	</div>

	{#if isLoading}
		<div class="flex justify-center p-8">
			<div
				class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
			></div>
		</div>
	{:else}
		<!-- Amount -->
		<Input
			type="text"
			inputmode="numeric"
			label="Amount (IDR)"
			placeholder="0"
			bind:value={amountText}
			oninput={handleAmountInput}
			class="text-lg font-semibold"
		/>

		<!-- Item Name -->
		<Input type="text" label="Item Name" placeholder="e.g. Nasi Goreng" bind:value={itemName} />

		<!-- Category Selector -->
		<CategorySelector bind:selectedCategoryId {type} />

		<!-- Details -->
		<Card class="flex flex-col gap-4 border-none shadow-none">
			<QuickDateSelector bind:date />
		</Card>

		<div
			class="sticky -bottom-6 z-10 flex gap-3 bg-surface-light dark:bg-surface-dark pb-6 pt-4 mt-auto -mx-6 px-6"
		>
			<Button variant="secondary" class="flex-1" onclick={closeTransactionSheet} disabled={isSaving}
				>Cancel</Button
			>
			<Button variant="primary" class="flex-1" onclick={handleSave} disabled={isSaving}>
				{isSaving ? 'Saving...' : transactionId ? `Update ${type}` : `Save ${type}`}
			</Button>
		</div>
	{/if}
</div>
