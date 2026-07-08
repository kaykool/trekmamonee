<script lang="ts">
	// @ts-expect-error virtual module
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { needRefresh, updateServiceWorker } = useRegisterSW({
		onRegistered(r: unknown) {
			console.log('SW Registered: ' + r);
		},
		onRegisterError(error: unknown) {
			console.log('SW registration error', error);
		}
	});

	function close() {
		needRefresh.set(false);
	}
</script>

{#if $needRefresh}
	<div
		class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 rounded-2xl bg-surface-light p-4 shadow-xl dark:bg-surface-dark border border-surface-dark/10 dark:border-surface-light/10"
	>
		<p class="text-sm font-medium text-text-light dark:text-text-dark">
			New app update available!
		</p>
		<div class="flex gap-2">
			<button
				class="rounded-full bg-surface-dark/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-dark/20 dark:bg-surface-light/10 dark:hover:bg-surface-light/20 text-text-light dark:text-text-dark"
				onclick={close}
			>
				Later
			</button>
			<button
				class="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
				onclick={() => updateServiceWorker(true)}
			>
				Reload
			</button>
		</div>
	</div>
{/if}
