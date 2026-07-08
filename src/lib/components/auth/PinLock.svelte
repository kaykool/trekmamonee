<script lang="ts">
	import { pinStore } from '$lib/stores/pin.svelte';
	import { fade } from 'svelte/transition';

	let {
		children,
		mode = 'verify',
		onsuccess,
		oncancel
	} = $props<{
		children?: import('svelte').Snippet;
		mode?: 'verify' | 'setup' | 'remove';
		onsuccess?: () => void;
		oncancel?: () => void;
	}>();

	let input = $state('');
	let setupConfirm = $state('');
	let isConfirming = $state(false);
	let error = $state('');
	let loading = $state(false);

	const MAX_LENGTH = 6;

	async function handleInput(num: string) {
		console.log('handleInput', { num, loading, inputLength: input.length });
		if (loading || input.length >= MAX_LENGTH) return;

		error = '';
		input += num;

		if (input.length === MAX_LENGTH) {
			await processPin();
		}
	}

	function handleBackspace() {
		if (loading) return;
		error = '';
		input = input.slice(0, -1);
	}

	async function processPin() {
		console.log('processPin started', { mode, isConfirming, input });
		loading = true;
		try {
			if (mode === 'setup') {
				if (!isConfirming) {
					console.log('setup: entering confirm mode');
					setupConfirm = input;
					input = '';
					isConfirming = true;
				} else {
					if (input === setupConfirm) {
						console.log('setup: confirm match, setting up');
						await pinStore.setup(input);
						console.log('setup: complete');
						input = '';
						setupConfirm = '';
						isConfirming = false;
						onsuccess?.();
					} else {
						console.log('setup: PINs do not match');
						error = 'PINs do not match';
						input = '';
					}
				}
			} else {
				if (mode === 'remove') {
					console.log('remove: verifying input', input);
					const isValid = await pinStore.verify(input);
					console.log('remove: isValid', isValid);
					if (isValid) {
						console.log('remove: valid, removing');
						await pinStore.remove();
						console.log('remove: complete');
						input = '';
						onsuccess?.();
					} else {
						console.log('remove: invalid');
						error = 'Incorrect PIN';
						input = '';
					}
				} else if (mode === 'verify') {
					console.log('verify: verifying input', input);
					const isValid = await pinStore.verify(input);
					console.log('verify: isValid', isValid);
					if (isValid) {
						console.log('verify: valid, unlocking');

						console.log('verify: complete');
						input = '';
						onsuccess?.();
					} else {
						console.log('verify: invalid');
						error = 'Incorrect PIN';
						input = '';
					}
				}
			}
		} catch (e: unknown) {
			console.error('processPin error:', e);
			error = e instanceof Error ? e.message : String(e);
			input = '';
		} finally {
			console.log('processPin finally');
			loading = false;
		}
	}
</script>

{#if mode === 'verify' && pinStore.hasPin && pinStore.isLocked}
	<div
		class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-light dark:bg-background-dark"
		in:fade
	>
		<div class="flex flex-col items-center gap-8 w-full max-w-sm mx-auto px-6">
			<div class="flex flex-col items-center gap-1">
				<div
					class="p-3 bg-surface-dark/5 dark:bg-surface-light/10 rounded-2xl mb-2 text-primary-light dark:text-primary-dark"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path
							d="M7 11V7a5 5 0 0 1 10 0v4"
						/></svg
					>
				</div>
				<h1 class="text-2xl font-bold text-text-light dark:text-text-dark text-center">
					Unlock Expense Tracker
				</h1>
				<p class="text-text-light/60 dark:text-text-dark/60 text-center text-sm">
					Enter your 6-digit PIN to continue
				</p>
			</div>

			<!-- Dots -->
			<div class="flex gap-4 mb-4">
				{#each [...Array(MAX_LENGTH).keys()] as i (i)}
					<div
						class="h-4 w-4 rounded-full border-2 transition-colors {input.length > i
							? 'bg-primary-light border-primary-light dark:bg-primary-dark dark:border-primary-dark'
							: 'border-surface-dark/20 dark:border-surface-light/20'}"
						class:animate-pulse={loading && input.length === MAX_LENGTH}
					></div>
				{/each}
			</div>

			<!-- Error message -->
			{#if error}
				<p class="text-error font-medium text-sm h-5 -mt-6 mb-1" transition:fade>{error}</p>
			{:else}
				<div class="h-5 -mt-6 mb-1"></div>
			{/if}

			<!-- Keypad -->
			<div class="grid grid-cols-3 gap-3 w-full select-none">
				{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num (num)}
					<button
						class="w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm text-xl font-medium active:scale-95 transition-transform"
						onclick={() => handleInput(num.toString())}
					>
						{num}
					</button>
				{/each}
				<div></div>
				<button
					class="w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm text-xl font-medium active:scale-95 transition-transform"
					onclick={() => handleInput('0')}
				>
					0
				</button>
				<button
					aria-label="Backspace"
					class="w-full h-14 rounded-xl flex items-center justify-center text-text-light dark:text-text-dark active:scale-95 transition-transform"
					onclick={handleBackspace}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line
							x1="18"
							y1="9"
							x2="12"
							y2="15"
						/><line x1="12" y1="9" x2="18" y2="15" /></svg
					>
				</button>
			</div>
		</div>
	</div>
{:else if mode === 'setup' || mode === 'remove'}
	<div class="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
		<div class="flex flex-col items-center gap-1">
			<h2 class="text-lg font-semibold text-text-light dark:text-text-dark text-center">
				{mode === 'remove'
					? 'Enter current PIN'
					: isConfirming
						? 'Confirm new PIN'
						: 'Create 6-digit PIN'}
			</h2>
		</div>

		<!-- Error message -->
		{#if error}
			<p class="text-error font-medium text-sm h-5 -mt-2 mb-0" transition:fade>{error}</p>
		{:else}
			<div class="h-5 -mt-2 mb-0"></div>
		{/if}

		<!-- Dots -->
		<div class="flex gap-4 mb-2">
			{#each [...Array(MAX_LENGTH).keys()] as i (i)}
				<div
					class="h-4 w-4 rounded-full border-2 transition-colors {input.length > i
						? 'bg-primary-light border-primary-light dark:bg-primary-dark dark:border-primary-dark'
						: 'border-surface-dark/20 dark:border-surface-light/20'}"
					class:animate-pulse={loading && input.length === MAX_LENGTH}
				></div>
			{/each}
		</div>

		<!-- Keypad -->
		<div class="grid grid-cols-3 gap-3 w-full select-none">
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num (num)}
				<button
					class="w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm text-xl font-medium active:scale-95 transition-transform"
					onclick={() => handleInput(num.toString())}
				>
					{num}
				</button>
			{/each}
			<button
				class="w-full h-14 rounded-xl text-sm font-medium text-text-light/60 dark:text-text-dark/60 active:scale-95 transition-transform"
				onclick={oncancel}
			>
				Cancel
			</button>
			<button
				class="w-full h-14 rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm text-xl font-medium active:scale-95 transition-transform"
				onclick={() => handleInput('0')}
			>
				0
			</button>
			<button
				aria-label="Backspace"
				class="w-full h-14 rounded-xl flex items-center justify-center text-text-light dark:text-text-dark active:scale-95 transition-transform"
				onclick={handleBackspace}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line
						x1="18"
						y1="9"
						x2="12"
						y2="15"
					/><line x1="12" y1="9" x2="18" y2="15" /></svg
				>
			</button>
		</div>
	</div>
{:else}
	{@render children?.()}
{/if}
