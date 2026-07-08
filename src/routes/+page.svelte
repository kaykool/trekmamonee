<script lang="ts">
  import IncomeExpenseSummary from '$lib/components/dashboard/IncomeExpenseSummary.svelte';
  import SpendingChart from '$lib/components/dashboard/SpendingChart.svelte';
  import CategoryBreakdown from '$lib/components/dashboard/CategoryBreakdown.svelte';
  import RecentTransactions from '$lib/components/dashboard/RecentTransactions.svelte';
  import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { db, type Transaction } from '$lib/db';
  import { getMonthSummary, getCategoryBreakdown, getRecentTransactions, type MonthSummary, type CategoryTotal, type RecentTransaction } from '$lib/db/queries';
  import { openEditTransaction, openConfirmDialog } from '$lib/state/ui.svelte';
  import { APP_CONFIG } from '$lib/constants';
  import { liveQuery } from 'dexie';
  import { theme } from '$lib/stores/theme';
  import { browser } from '$app/environment';

  // Month navigation state
  let currentDate = $state(new Date());
  let displayMonth = $derived(
    currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
  );

  function prevMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  }
  function nextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  }

  // Reactive data
  let summary = $state<MonthSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  let breakdown = $state<CategoryTotal[]>([]);
  let recentItems = $state<RecentTransaction[]>([]);

  // Dark mode detection for chart theming
  let isDark = $state(false);
  $effect(() => {
    if (browser) {
      // Subscribe to the theme store
      const unsub = theme.subscribe(() => {
        isDark = document.documentElement.classList.contains('dark');
      });
      // Also check immediately
      isDark = document.documentElement.classList.contains('dark');
      return unsub;
    }
  });

  // Fetch monthly summary + breakdown (reactive to month changes)
  $effect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const sub = liveQuery(() =>
      Promise.all([
        getMonthSummary(year, month),
        getCategoryBreakdown(year, month, 'expense'),
      ])
    ).subscribe(([s, b]) => {
      summary = s;
      breakdown = b;
    });

    return () => sub.unsubscribe();
  });

  // Fetch recent transactions (global, not month-scoped)
  $effect(() => {
    const sub = liveQuery(() =>
      getRecentTransactions(APP_CONFIG.dashboard.recentTransactionsLimit)
    ).subscribe(res => recentItems = res);

    return () => sub.unsubscribe();
  });

  // Transaction options bottom sheet
  let isSheetOpen = $state(false);
  let selectedTransaction = $state<Transaction | null>(null);

  function handleTransactionClick(tx: Transaction) {
    selectedTransaction = tx;
    isSheetOpen = true;
  }

  function handleEdit() {
    if (selectedTransaction) {
      isSheetOpen = false;
      openEditTransaction(selectedTransaction.id);
    }
  }

  function promptDelete() {
    openConfirmDialog({
      title: 'Delete Transaction',
      description: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      confirmText: 'Delete',
      onconfirm: executeDelete,
    });
  }

  async function executeDelete() {
    if (selectedTransaction) {
      await db.transactions.delete(selectedTransaction.id);
      isSheetOpen = false;
      selectedTransaction = null;
    }
  }

  let formattedAmount = $derived(
    selectedTransaction
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(selectedTransaction.amount)
      : ''
  );
</script>

<svelte:head>
  <title>Dashboard | Expense Tracker</title>
</svelte:head>

<div class="flex flex-col gap-6 pb-6">
  <!-- Month Selector -->
  <div class="flex items-center justify-between rounded-2xl bg-surface-light p-2 shadow-sm dark:bg-surface-dark">
    <button
      class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-surface-dark/5 text-text-light/60 hover:text-text-light dark:hover:bg-surface-light/10 dark:text-text-dark/60 dark:hover:text-text-dark"
      onclick={prevMonth}
      aria-label="Previous month"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <span class="text-base font-semibold capitalize text-text-light dark:text-text-dark">{displayMonth}</span>
    <button
      class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-surface-dark/5 text-text-light/60 hover:text-text-light dark:hover:bg-surface-light/10 dark:text-text-dark/60 dark:hover:text-text-dark"
      onclick={nextMonth}
      aria-label="Next month"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
  </div>

  <!-- Income / Expense / Balance -->
  <IncomeExpenseSummary {summary} />

  <!-- Spending Doughnut Chart -->
  <SpendingChart {breakdown} {isDark} />

  <!-- Category Breakdown List -->
  <CategoryBreakdown {breakdown} />

  <!-- Recent Transactions -->
  <RecentTransactions items={recentItems} ontransactionclick={handleTransactionClick} />
</div>

<!-- Transaction Options Bottom Sheet (same pattern as /transactions page) -->
<BottomSheet bind:isOpen={isSheetOpen} title="Transaction Options">
  {#if selectedTransaction}
    <div class="mb-6 flex flex-col items-center gap-2 text-center">
      <span class="text-3xl font-bold {selectedTransaction.type === 'expense' ? 'text-danger' : 'text-primary'}">
        {selectedTransaction.type === 'expense' ? '-' : '+'}{formattedAmount}
      </span>
      <span class="text-xl font-semibold text-text-light dark:text-text-dark mt-2">{selectedTransaction.itemName}</span>
    </div>

    <div class="flex flex-col gap-3">
      <Button variant="primary" class="w-full" onclick={handleEdit}>
        Edit Transaction
      </Button>
      <Button variant="danger" class="w-full" onclick={promptDelete}>
        Delete
      </Button>
    </div>
  {/if}
</BottomSheet>
