<script lang="ts">
	import { fade } from 'svelte/transition';
	import Button from '$lib/components/ui/Button.svelte';
	import { verifyCloudPassword, restoreFromCloud } from '$lib/sync';
	import { syncStore } from '$lib/stores/sync.svelte';
	import { addToast } from '$lib/state/ui.svelte';

	let { oncomplete } = $props<{ oncomplete: () => void }>();

	let password = $state('');
	let isRestoring = $state(false);

	async function handleRestore() {
		if (!password.trim()) {
			addToast('Please enter your Cloud Sync Password', 'warning');
			return;
		}
		
		isRestoring = true;
		try {
			const isValid = await verifyCloudPassword(password);
			if (!isValid) {
				addToast('Invalid password', 'error');
				isRestoring = false;
				return;
			}

			syncStore.setCloudPassword(password);
			await restoreFromCloud();
			addToast('Data restored successfully!', 'success');
			oncomplete();
		} catch (e) {
			console.error(e);
			addToast('Failed to restore data', 'error');
			isRestoring = false;
		}
	}

	function handleStartFresh() {
		oncomplete();
	}
</script>

<div
	class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-light dark:bg-bg-dark"
	in:fade
>
	<div class="flex w-full flex-col items-center gap-8 px-8" style="max-width: 24rem;">
		<!-- Logo / Icon -->
		<div class="flex flex-col items-center gap-4">
			<div class="relative flex h-24 w-24 items-center justify-center">
				<div class="absolute inset-0 rounded-full bg-linear-to-tr from-primary/20 to-primary/5 blur-xl"></div>
				<div class="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-light dark:bg-surface-dark text-primary shadow-sm ring-1 ring-surface-dark/5 dark:ring-surface-light/5">
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
				</div>
			</div>
			<div class="flex flex-col items-center gap-2 mt-2 text-center">
				<h1 class="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark">
					Welcome back
				</h1>
				<p class="text-sm font-medium text-text-light/60 dark:text-text-dark/60">
					Authenticate to sync your data to this device.
				</p>
			</div>
		</div>

		<div class="flex w-full flex-col gap-4">
			<!-- Restore Option (Primary) -->
			<div class="flex flex-col gap-3">
				<input 
					type="password" 
					bind:value={password}
					placeholder="Enter Cloud Password"
					class="w-full rounded-xl bg-surface-dark/5 dark:bg-surface-light/5 px-4 py-3 text-sm text-text-light dark:text-text-dark outline-none focus:ring-2 focus:ring-primary shadow-sm"
					onkeydown={(e) => e.key === 'Enter' && handleRestore()}
					disabled={isRestoring}
				/>
				
				<Button variant="primary" class="w-full" onclick={handleRestore} disabled={isRestoring}>
					{#if isRestoring}
						<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
						Authenticating...
					{:else}
						Restore from Cloud
					{/if}
				</Button>
			</div>

			<div class="flex items-center gap-4 px-2 my-2">
				<div class="h-px flex-1 bg-surface-dark/10 dark:bg-surface-light/10"></div>
				<span class="text-xs font-semibold uppercase tracking-widest text-text-light/40 dark:text-text-dark/40">OR</span>
				<div class="h-px flex-1 bg-surface-dark/10 dark:bg-surface-light/10"></div>
			</div>

			<!-- Start Fresh Option (Secondary) -->
			<Button variant="ghost" class="w-full text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark" onclick={handleStartFresh} disabled={isRestoring}>
				Start Fresh without Cloud Sync
			</Button>
		</div>
	</div>
</div>
