<script lang="ts">
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Transaction } from '$lib/db';
	import { formatIDR } from '$lib/utils';

	let {
		isOpen = $bindable(false),
		transaction,
		onedit,
		ondelete
	}: {
		isOpen: boolean;
		transaction: Transaction | null;
		onedit: () => void;
		ondelete: () => void;
	} = $props();

	let formattedAmount = $derived(
		transaction ? formatIDR(transaction.amount) : ''
	);
</script>

<BottomSheet bind:isOpen title="Transaction Options">
	{#if transaction}
		<div class="mb-6 flex flex-col items-center gap-2 text-center">
			<span
				class="text-3xl font-bold {transaction.type === 'expense'
					? 'text-danger'
					: 'text-primary'}"
			>
				{transaction.type === 'expense' ? '-' : '+'}{formattedAmount}
			</span>
			<span class="text-xl font-semibold text-text-light dark:text-text-dark mt-2"
				>{transaction.itemName}</span
			>
		</div>

		<div class="flex flex-col gap-3">
			<Button variant="primary" class="w-full" onclick={onedit}>Edit Transaction</Button>
			<Button variant="danger" class="w-full" onclick={ondelete}>Delete</Button>
		</div>
	{/if}
</BottomSheet>
