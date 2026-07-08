<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Button from './Button.svelte';
	import { portal } from '$lib/actions/portal';

	let {
		isOpen = $bindable(false),
		title = 'Confirm',
		description = 'Are you sure you want to perform this action?',
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		isDestructive = true,
		onconfirm,
		oncancel
	}: {
		isOpen: boolean;
		title?: string;
		description?: string;
		confirmText?: string;
		cancelText?: string;
		isDestructive?: boolean;
		onconfirm: () => void | Promise<void>;
		oncancel?: () => void;
	} = $props();

	let isProcessing = $state(false);

	async function handleConfirm() {
		isProcessing = true;
		try {
			await onconfirm();
		} finally {
			isProcessing = false;
			isOpen = false;
		}
	}

	function handleCancel() {
		isOpen = false;
		if (oncancel) oncancel();
	}
</script>

{#if isOpen}
	<div use:portal>
		<!-- Backdrop -->
		<div
			role="presentation"
			class="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm cursor-default border-none outline-none w-full h-full"
			onclick={handleCancel}
			onkeydown={(e) => e.key === 'Escape' && handleCancel()}
			transition:fade={{ duration: 200, easing: cubicOut }}
		></div>

		<!-- Dialog -->
		<div class="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
			<div
				class="w-full max-w-96 rounded-2xl bg-surface-light p-6 shadow-2xl dark:bg-surface-dark pointer-events-auto"
				transition:scale={{ start: 0.95, duration: 200, easing: cubicOut }}
			>
				<h2 class="mb-2 text-lg font-bold text-text-light dark:text-text-dark">{title}</h2>
				<p class="mb-6 text-sm text-text-light/80 dark:text-text-dark/80">{description}</p>

				<div class="flex justify-end gap-3">
					<Button variant="secondary" onclick={handleCancel} disabled={isProcessing}>{cancelText}</Button>
					<Button variant={isDestructive ? 'danger' : 'primary'} onclick={handleConfirm} disabled={isProcessing}>
						{#if isProcessing}
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
							Processing...
						{:else}
							{confirmText}
						{/if}
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
