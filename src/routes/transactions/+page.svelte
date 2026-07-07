<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Select from '$lib/components/ui/Select.svelte';
</script>

<svelte:head>
  <title>History | Expense Tracker</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <div class="flex gap-2">
    <Select 
      class="flex-1"
      options={[
        { value: 'all', label: 'All Types' },
        { value: 'expense', label: 'Expenses' },
        { value: 'income', label: 'Income' }
      ]}
    />
    <Select 
      class="flex-1"
      options={[
        { value: 'all', label: 'All Categories' }
      ]}
    />
  </div>

  <Card class="flex items-center justify-center py-12">
    <span class="text-text-light/50 dark:text-text-dark/50">No transactions found</span>
  </Card>
</div>
