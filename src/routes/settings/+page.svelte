<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { theme } from '$lib/stores/theme';
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
    <Button variant="secondary" class="w-full">Manage Categories</Button>
  </Card>

  <Card class="flex flex-col gap-4">
    <h2 class="font-semibold text-text-light dark:text-text-dark">Security</h2>
    <Button variant="secondary" class="w-full">Set PIN Lock</Button>
  </Card>
</div>
