<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
</script>

<svelte:head>
  <title>Dashboard | Expense Tracker</title>
</svelte:head>

<div class="flex flex-col gap-6">
  <!-- Placeholder for IncomeExpenseSummary -->
  <div class="grid grid-cols-2 gap-4">
    <Card class="flex flex-col gap-1">
      <span class="text-sm font-medium text-text-light/70 dark:text-text-dark/70">Income</span>
      <span class="text-xl font-bold text-primary">Rp 0</span>
    </Card>
    <Card class="flex flex-col gap-1">
      <span class="text-sm font-medium text-text-light/70 dark:text-text-dark/70">Expenses</span>
      <span class="text-xl font-bold text-danger">Rp 0</span>
    </Card>
  </div>

  <!-- Placeholder for SpendingChart -->
  <Card class="flex aspect-square items-center justify-center">
    <span class="text-text-light/50 dark:text-text-dark/50">Chart Placeholder</span>
  </Card>

  <!-- Placeholder for RecentTransactions -->
  <div class="flex flex-col gap-3">
    <h2 class="text-lg font-semibold text-text-light dark:text-text-dark">Recent Transactions</h2>
    <Card class="flex items-center justify-center py-8">
      <span class="text-text-light/50 dark:text-text-dark/50">No recent transactions</span>
    </Card>
  </div>
</div>
