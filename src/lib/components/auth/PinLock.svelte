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
	let shake = $state(false);

	const MAX_LENGTH = 6;

	async function handleInput(num: string) {
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

	function triggerShake() {
		shake = true;
		setTimeout(() => (shake = false), 500);
	}

	async function processPin() {
		loading = true;
		try {
			if (mode === 'setup') {
				if (!isConfirming) {
					setupConfirm = input;
					input = '';
					isConfirming = true;
				} else {
					if (input === setupConfirm) {
						await pinStore.setup(input);
						input = '';
						setupConfirm = '';
						isConfirming = false;
						onsuccess?.();
					} else {
						error = 'PINs do not match';
						input = '';
						triggerShake();
					}
				}
			} else {
				if (mode === 'remove') {
					const isValid = await pinStore.verify(input);
					if (isValid) {
						await pinStore.remove();
						input = '';
						onsuccess?.();
					} else {
						error = 'Incorrect PIN';
						input = '';
						triggerShake();
					}
				} else if (mode === 'verify') {
					const isValid = await pinStore.verify(input);
					if (isValid) {
						input = '';
						onsuccess?.();
					} else {
						error = 'Incorrect PIN';
						input = '';
						triggerShake();
					}
				}
			}
		} catch (e: unknown) {
			console.error('processPin error:', e);
			error = e instanceof Error ? e.message : String(e);
			input = '';
			triggerShake();
		} finally {
			loading = false;
		}
	}
</script>

{#if mode === 'verify' && pinStore.hasPin && pinStore.isLocked}
	<div
		class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-light dark:bg-bg-dark"
		in:fade
	>
		<div class="flex w-full flex-col items-center gap-6 px-8" style="max-width: 20rem;">
			<!-- Lock icon -->
			<div class="mb-2 flex flex-col items-center gap-3">
				<div class="relative flex h-20 w-20 items-center justify-center">
					<div class="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 blur-lg"></div>
					<div
						class="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-light dark:bg-surface-dark text-primary shadow-sm ring-1 ring-surface-dark/5 dark:ring-surface-light/5"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="28"
							height="28"
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
				</div>
				<div class="flex flex-col items-center gap-1 mt-1">
					<h1 class="text-2xl font-bold tracking-tight text-text-light dark:text-text-dark">
						Trekmamonee
					</h1>
					<p class="text-sm font-medium text-text-light/50 dark:text-text-dark/50">Enter PIN to unlock</p>
				</div>
			</div>

			<!-- PIN dots -->
			<div class="flex gap-3" class:pin-shake={shake}>
				{#each [...Array(MAX_LENGTH).keys()] as i (i)}
					<div
						class="pin-dot h-3 w-3 rounded-full transition-all duration-200 {input.length > i
							? 'scale-125 bg-primary'
							: 'bg-text-light/15 dark:bg-text-dark/15'}"
						class:animate-pulse={loading && input.length === MAX_LENGTH}
					></div>
				{/each}
			</div>

			<!-- Error -->
			<div class="h-5">
				{#if error}
					<p class="text-sm font-medium text-danger" transition:fade>{error}</p>
				{/if}
			</div>

			<!-- Keypad -->
			<div class="grid w-full grid-cols-3 place-items-center gap-y-3 select-none">
				{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num (num)}
					<button
						aria-label="Digit {num}"
						class="pin-key flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-2xl font-medium text-text-light transition-all active:scale-90 dark:text-text-dark"
						onclick={() => handleInput(num.toString())}
					>
						{num}
					</button>
				{/each}
				<div></div>
				<button
					aria-label="Digit 0"
					class="pin-key flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-2xl font-medium text-text-light transition-all active:scale-90 dark:text-text-dark"
					onclick={() => handleInput('0')}
				>
					0
				</button>
				<button
					aria-label="Backspace"
					class="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-text-light/60 transition-all active:scale-90 dark:text-text-dark/60"
					onclick={handleBackspace}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
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
	<div class="flex w-full flex-col items-center gap-5">
		<!-- Header -->
		<h2 class="text-base font-semibold text-text-light dark:text-text-dark">
			{mode === 'remove'
				? 'Enter current PIN'
				: isConfirming
					? 'Confirm new PIN'
					: 'Create 6-digit PIN'}
		</h2>

		<!-- PIN dots -->
		<div class="flex gap-3" class:pin-shake={shake}>
			{#each [...Array(MAX_LENGTH).keys()] as i (i)}
				<div
					class="pin-dot h-3 w-3 rounded-full transition-all duration-200 {input.length > i
						? 'scale-125 bg-primary'
						: 'bg-text-light/15 dark:bg-text-dark/15'}"
					class:animate-pulse={loading && input.length === MAX_LENGTH}
				></div>
			{/each}
		</div>

		<!-- Error -->
		<div class="h-5">
			{#if error}
				<p class="text-sm font-medium text-danger" transition:fade>{error}</p>
			{/if}
		</div>

		<!-- Keypad -->
		<div class="grid w-full grid-cols-3 place-items-center gap-y-2 select-none">
			{#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num (num)}
				<button
					aria-label="Digit {num}"
					class="pin-key flex h-16 w-16 items-center justify-center rounded-full text-xl font-medium text-text-light transition-all active:scale-90 dark:text-text-dark"
					onclick={() => handleInput(num.toString())}
				>
					{num}
				</button>
			{/each}
			<button
				class="flex h-16 w-16 items-center justify-center rounded-full text-xs font-medium text-text-light/50 transition-all active:scale-90 dark:text-text-dark/50"
				onclick={oncancel}
			>
				Cancel
			</button>
			<button
				aria-label="Digit 0"
				class="pin-key flex h-16 w-16 items-center justify-center rounded-full text-xl font-medium text-text-light transition-all active:scale-90 dark:text-text-dark"
				onclick={() => handleInput('0')}
			>
				0
			</button>
			<button
				aria-label="Backspace"
				class="flex h-16 w-16 items-center justify-center rounded-full text-text-light/50 transition-all active:scale-90 dark:text-text-dark/50"
				onclick={handleBackspace}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
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

<style>
	.pin-key {
		background: color-mix(in oklch, currentColor 5%, transparent);
	}
	.pin-key:hover {
		background: color-mix(in oklch, currentColor 10%, transparent);
	}
	.pin-key:active {
		background: color-mix(in oklch, currentColor 15%, transparent);
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		10%,
		50%,
		90% {
			transform: translateX(-4px);
		}
		30%,
		70% {
			transform: translateX(4px);
		}
	}
	.pin-shake {
		animation: shake 0.4s ease-in-out;
	}
</style>
