<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/layout/Header.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';
	import FAB from '$lib/components/layout/FAB.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import TransactionForm from '$lib/components/transactions/TransactionForm.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import PinLock from '$lib/components/auth/PinLock.svelte';
	import InitialSetup from '$lib/components/auth/InitialSetup.svelte';
	import ReloadPrompt from '$lib/components/pwa/ReloadPrompt.svelte';
	import { uiState, closeTransactionSheet, closeConfirmDialog } from '$lib/state/ui.svelte';
	import { pinStore } from '$lib/stores/pin.svelte';
	import { syncStore } from '$lib/stores/sync.svelte';
	import { backupToCloud } from '$lib/sync';
	import { browser } from '$app/environment';
	import '$lib/db/seed';

	let { children } = $props();

	let autosaveTimeout: ReturnType<typeof setTimeout>;
	let showInitialSetup = $state(false);

	$effect(() => {
		if (browser && localStorage.getItem('initial_setup_completed') !== 'true') {
			showInitialSetup = true;
		}
	});

	$effect(() => {
		if (syncStore.hasUnsyncedChanges && syncStore.cloudPassword) {
			clearTimeout(autosaveTimeout);
			autosaveTimeout = setTimeout(() => {
				backupToCloud().catch(console.error);
			}, 5000); // Autosave 5 seconds after the last change
		}
	});

	function handleVisibilityChange() {
		if (document.visibilityState === 'hidden') {
			pinStore.lock();
			if (syncStore.hasUnsyncedChanges && syncStore.cloudPassword) {
				backupToCloud().catch(console.error);
			}
		}
	}

	function handleBeforeUnload() {
		if (syncStore.hasUnsyncedChanges && syncStore.cloudPassword) {
			backupToCloud().catch(console.error);
		}
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<svelte:window onbeforeunload={handleBeforeUnload} />
<svelte:document onvisibilitychange={handleVisibilityChange} />

{#if showInitialSetup}
	<InitialSetup oncomplete={() => {
		localStorage.setItem('initial_setup_completed', 'true');
		showInitialSetup = false;
	}} />
{:else}
	<PinLock mode="verify">
		<div
			class="relative min-h-screen w-full bg-bg-light dark:bg-bg-dark selection:bg-primary/30 pb-16"
		>
		<Header />

		<main class="mx-auto w-full max-w-2xl px-4 py-6">
			{@render children()}
		</main>

		<FAB />
		<BottomNav />

		<!-- Global Forms -->
		<BottomSheet
			isOpen={uiState.isTransactionSheetOpen}
			onclose={closeTransactionSheet}
			title={uiState.editingTransactionId ? 'Edit Transaction' : 'New Transaction'}
		>
			<TransactionForm transactionId={uiState.editingTransactionId} />
		</BottomSheet>

		<ConfirmDialog
			isOpen={uiState.confirmDialog.isOpen}
			title={uiState.confirmDialog.title}
			description={uiState.confirmDialog.description}
			confirmText={uiState.confirmDialog.confirmText}
			isDestructive={uiState.confirmDialog.isDestructive}
			onconfirm={() => {
				uiState.confirmDialog.onconfirm();
				closeConfirmDialog();
			}}
			oncancel={closeConfirmDialog}
		/>

		<ReloadPrompt />
	</div>
	</PinLock>
{/if}

<Toast />
