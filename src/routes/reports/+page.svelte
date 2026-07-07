<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  let view = $state<'weekly' | 'monthly'>('weekly');
</script>

<svelte:head>
  <title>Reports | Expense Tracker</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <!-- View toggle -->
  <div class="flex w-full rounded-lg bg-surface-dark/5 p-1 dark:bg-surface-light/10">
    <button 
      class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {view === 'weekly' ? 'bg-surface-light text-text-light shadow-sm dark:bg-surface-dark dark:text-text-dark' : 'text-text-light/60 dark:text-text-dark/60'}"
      onclick={() => view = 'weekly'}
    >
      Weekly
    </button>
    <button 
      class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {view === 'monthly' ? 'bg-surface-light text-text-light shadow-sm dark:bg-surface-dark dark:text-text-dark' : 'text-text-light/60 dark:text-text-dark/60'}"
      onclick={() => view = 'monthly'}
    >
      Monthly
    </button>
  </div>

  <div class="flex items-center justify-between">
    <Button variant="ghost" size="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </Button>
    <span class="font-medium text-text-light dark:text-text-dark">Current {view === 'weekly' ? 'Week' : 'Month'}</span>
    <Button variant="ghost" size="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </Button>
  </div>

  <Card class="flex aspect-video items-center justify-center">
    <span class="text-text-light/50 dark:text-text-dark/50">Chart Placeholder</span>
  </Card>
</div>
