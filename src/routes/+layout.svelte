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
  import { uiState, closeTransactionSheet, closeConfirmDialog } from '$lib/state/ui.svelte';
  import '$lib/db/seed';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="relative min-h-screen w-full bg-bg-light dark:bg-bg-dark selection:bg-primary/30">
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
    title={uiState.editingTransactionId ? "Edit Transaction" : "New Transaction"}
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

  <Toast />
</div>
