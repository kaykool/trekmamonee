<script lang="ts">
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CategorySelector from './CategorySelector.svelte';
  import QuickDateSelector from './QuickDateSelector.svelte';
  import { db, generateId, type TransactionType } from '$lib/db';
  import { closeTransactionSheet, addToast } from '$lib/state/ui.svelte';
  import { APP_CONFIG } from '$lib/constants';

  let {
    transactionId = null
  }: {
    transactionId?: string | null;
  } = $props();

  let type = $state<TransactionType>('expense');
  let amount = $state<number | undefined>();
  let note = $state('');  
  let date = $state(new Date().toISOString().split('T')[0]);
  let selectedCategoryId = $state<string>('');

  let isSaving = $state(false);
  let isLoading = $state(!!transactionId);
  
  let originalCreatedAt = $state<number>(Date.now());

  // Load existing transaction if ID is provided
  $effect(() => {
    if (transactionId) {
      async function loadTx() {
        try {
          const tx = await db.transactions.get(transactionId as string);
          if (tx) {
            type = tx.type;
            amount = tx.amount;
            note = tx.note || '';
            date = tx.date;
            selectedCategoryId = tx.categoryId;
            originalCreatedAt = tx.createdAt;
          } else {
            addToast('Transaction not found', 'error');
            closeTransactionSheet();
          }
        } catch (err) {
          console.error(err);
        } finally {
          isLoading = false;
        }
      }
      loadTx();
    }
  });



  async function handleSave() {
    if (!amount || amount <= 0) {
      addToast('Please enter a valid amount greater than 0.', 'error', APP_CONFIG.toast.errorDurationMs);
      return;
    }
    
    if (!selectedCategoryId) {
      addToast('Please select a category.', 'error', APP_CONFIG.toast.errorDurationMs);
      return;
    }

    isSaving = true;
    try {
      if (transactionId) {
        await db.transactions.put({
          id: transactionId,
          amount,
          categoryId: selectedCategoryId,
          type,
          note,
          date,
          createdAt: originalCreatedAt,
          updatedAt: Date.now()
        });
        addToast('Transaction updated successfully', 'success');
      } else {
        await db.transactions.add({
          id: generateId(),
          amount,
          categoryId: selectedCategoryId,
          type,
          note,
          date,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        addToast('Transaction added successfully', 'success');
      }
      closeTransactionSheet();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      addToast('Failed to save transaction', 'error');
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="flex flex-col gap-6 pt-2">
  <div class="flex gap-2 p-1 bg-surface-dark/5 dark:bg-surface-light/5 rounded-xl">
    <button 
      class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'expense' ? 'bg-surface-light dark:bg-surface-dark shadow-sm text-text-light dark:text-text-dark' : 'text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark'}"
      onclick={() => type = 'expense'}
    >
      Expense
    </button>
    <button 
      class="flex-1 py-2 text-sm font-medium rounded-lg transition-colors {type === 'income' ? 'bg-surface-light dark:bg-surface-dark shadow-sm text-text-light dark:text-text-dark' : 'text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark'}"
      onclick={() => type = 'income'}
    >
      Income
    </button>
  </div>

  {#if isLoading}
    <div class="flex justify-center p-8">
      <div class="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
    </div>
  {:else}
    <!-- Amount -->
    <Input 
      type="number" 
      label="Amount (IDR)" 
      placeholder="0"
      bind:value={amount}
      class="text-lg font-semibold"
    />

    <!-- Category Selector -->
    <CategorySelector bind:selectedCategoryId {type} />

    <!-- Details -->
    <Card class="flex flex-col gap-4 border-none shadow-none">
      <QuickDateSelector bind:date />
      <Input type="text" label="Note (Optional)" placeholder="e.g. Lunch with friends" bind:value={note} />
    </Card>

    <div class="sticky bottom-0 z-10 flex gap-3 bg-surface-light dark:bg-surface-dark pb-6 pt-4 mt-auto -mx-6 px-6 -mb-6">
      <Button variant="secondary" class="flex-1" onclick={closeTransactionSheet} disabled={isSaving}>Cancel</Button>
      <Button 
        variant={type === 'expense' ? 'danger' : 'primary'} 
        class="flex-1" 
        onclick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : (transactionId ? `Update ${type}` : `Save ${type}`)}
      </Button>
    </div>
  {/if}
</div>
