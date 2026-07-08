<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
  import CategorySelector from '$lib/components/transactions/CategorySelector.svelte';
  import PinLock from '$lib/components/auth/PinLock.svelte';
  import { theme } from '$lib/stores/theme';
  import { pinStore } from '$lib/stores/pin.svelte';

  let isCategorySheetOpen = $state(false);
  let pinMode = $state<'none' | 'setup' | 'remove'>('none');
  
  let dummyExpenseId = $state('');
  let dummyIncomeId = $state('');
</script>

<svelte:head>
  <title>Settings | Expense Tracker</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <Card class="flex flex-col gap-4">
    <h2 class="font-semibold text-text-light dark:text-text-dark">Data & Sync</h2>
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-text-light dark:text-text-dark">Last synced</span>
        <span class="text-xs text-text-light/60 dark:text-text-dark/60">Never</span>
      </div>
      <Button variant="secondary" size="sm">Sync Now</Button>
    </div>
  </Card>

  <Card class="flex flex-col gap-4">
    <h2 class="font-semibold text-text-light dark:text-text-dark">Appearance</h2>
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-text-light dark:text-text-dark">Theme</span>
      <select 
        class="rounded-md border border-surface-dark/20 bg-surface-light px-2 py-1 text-sm dark:border-surface-light/20 dark:bg-surface-dark"
        bind:value={$theme}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  </Card>

  <Card class="flex flex-col gap-4">
    <h2 class="font-semibold text-text-light dark:text-text-dark">Categories</h2>
    <Button variant="secondary" class="w-full" onclick={() => isCategorySheetOpen = true}>
      Manage Categories
    </Button>
  </Card>

  <Card class="flex flex-col gap-4">
    <h2 class="font-semibold text-text-light dark:text-text-dark">Security</h2>
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <span class="text-sm font-medium text-text-light dark:text-text-dark">App Lock</span>
        <span class="text-xs {pinStore.hasPin ? 'text-primary-light dark:text-primary-dark' : 'text-text-light/60 dark:text-text-dark/60'}">
          {pinStore.hasPin ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      {#if pinStore.hasPin}
        <Button variant="secondary" size="sm" onclick={() => pinMode = 'remove'}>Remove PIN</Button>
      {:else}
        <Button variant="secondary" size="sm" onclick={() => pinMode = 'setup'}>Set PIN</Button>
      {/if}
    </div>
  </Card>
</div>

<!-- Category Management Sheet -->
<BottomSheet isOpen={isCategorySheetOpen} onclose={() => isCategorySheetOpen = false} title="Manage Categories">
  <div class="flex flex-col gap-8 pb-8 pt-2">
    <div class="flex flex-col gap-2">
      <h3 class="font-medium text-text-light dark:text-text-dark px-2">Expenses</h3>
      <CategorySelector type="expense" bind:selectedCategoryId={dummyExpenseId} />
    </div>
    <div class="flex flex-col gap-2">
      <h3 class="font-medium text-text-light dark:text-text-dark px-2">Income</h3>
      <CategorySelector type="income" bind:selectedCategoryId={dummyIncomeId} />
    </div>
  </div>
</BottomSheet>

<!-- PIN Setup/Remove Sheet -->
<BottomSheet isOpen={pinMode !== 'none'} onclose={() => pinMode = 'none'} title={pinMode === 'setup' ? 'Set PIN Lock' : 'Remove PIN Lock'}>
  {#if pinMode !== 'none'}
    <div class="pb-8 pt-4">
      <PinLock 
        mode={pinMode} 
        onsuccess={() => pinMode = 'none'} 
        oncancel={() => pinMode = 'none'} 
      />
    </div>
  {/if}
</BottomSheet>
