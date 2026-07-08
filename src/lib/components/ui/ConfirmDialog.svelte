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
		onconfirm: () => void;
		oncancel?: () => void;
	} = $props();

	function handleConfirm() {
		isOpen = false;
		onconfirm();
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
					<Button variant="secondary" onclick={handleCancel}>{cancelText}</Button>
					<Button variant={isDestructive ? 'danger' : 'primary'} onclick={handleConfirm}
						>{confirmText}</Button
					>
				</div>
			</div>
		</div>
	</div>
{/if}
