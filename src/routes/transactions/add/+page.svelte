<script lang="ts">
  import Input from '$lib/components/ui/Input.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { goto } from '$app/navigation';

  let type = $state<'expense' | 'income'>('expense');
</script>

<svelte:head>
  <title>Add Transaction | Expense Tracker</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <!-- Type toggle -->
  <div class="flex w-full rounded-lg bg-surface-dark/5 p-1 dark:bg-surface-light/10">
    <button 
      class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {type === 'expense' ? 'bg-surface-light text-danger shadow-sm dark:bg-surface-dark' : 'text-text-light/60 dark:text-text-dark/60'}"
      onclick={() => type = 'expense'}
    >
      Expense
    </button>
    <button 
      class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {type === 'income' ? 'bg-surface-light text-primary shadow-sm dark:bg-surface-dark' : 'text-text-light/60 dark:text-text-dark/60'}"
      onclick={() => type = 'income'}
    >
      Income
    </button>
  </div>

  <Card class="flex flex-col gap-4">
    <Input 
      type="number" 
      label="Amount (IDR)" 
      placeholder="0"
      class="text-lg"
    />
    
    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium text-text-light dark:text-text-dark">Category</span>
      <div class="grid grid-cols-4 gap-2">
        <!-- Placeholder categories -->
        {#each Array(8) as _}
          <button class="flex aspect-square flex-col items-center justify-center gap-1 rounded-md bg-surface-dark/5 p-2 transition-colors hover:bg-surface-dark/10 dark:bg-surface-light/5 dark:hover:bg-surface-light/10">
            <div class="h-6 w-6 rounded-full bg-text-light/20 dark:bg-text-dark/20"></div>
            <span class="text-[10px] text-text-light/70 dark:text-text-dark/70">Cat</span>
          </button>
        {/each}
      </div>
    </div>

    <Input type="date" label="Date" />
    <Input type="text" label="Note (Optional)" placeholder="e.g. Lunch with friends" />
  </Card>

  <div class="flex gap-3">
    <Button variant="secondary" class="flex-1" onclick={() => goto('/')}>Cancel</Button>
    <Button variant={type === 'expense' ? 'danger' : 'primary'} class="flex-[2]">Save {type}</Button>
  </div>
</div>
