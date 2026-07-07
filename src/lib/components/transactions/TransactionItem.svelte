<script lang="ts">
  import type { Transaction, Category } from '$lib/db';
  import { createEventDispatcher } from 'svelte';

  let {
    transaction,
    category,
    onclick
  }: {
    transaction: Transaction;
    category?: Category;
    onclick?: () => void;
  } = $props();

  let formattedAmount = $derived(new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(transaction.amount));

  let formattedDate = $derived(new Date(transaction.date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }));
</script>

<button
  class="flex w-full items-center justify-between rounded-xl bg-surface-light p-4 shadow-sm transition-all hover:bg-bg-dark/5 active:scale-[0.98] dark:bg-surface-dark dark:hover:bg-surface-light/5"
  {onclick}
>
  <div class="flex items-center gap-3">
    <!-- Category Icon -->
    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full {category?.color || 'bg-gray-500'} text-xl text-white shadow-sm">
      {category?.icon || '🏷️'}
    </div>
    
    <!-- Details -->
    <div class="flex flex-col items-start">
      <span class="font-semibold text-text-light dark:text-text-dark">{category?.name || 'Unknown'}</span>
      {#if transaction.note}
        <span class="truncate text-sm text-text-light/60 dark:text-text-dark/60 max-w-[150px] text-left">{transaction.note}</span>
      {/if}
    </div>
  </div>

  <!-- Amount & Date -->
  <div class="flex flex-col items-end">
    <span class="font-bold {transaction.type === 'expense' ? 'text-danger' : 'text-primary'}">
      {transaction.type === 'expense' ? '-' : '+'}{formattedAmount}
    </span>
    <span class="text-xs text-text-light/50 dark:text-text-dark/50">{formattedDate}</span>
  </div>
</button>
