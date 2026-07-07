<script lang="ts">
  type Option = { value: string; label: string };

  let {
    value = $bindable(''),
    options = [],
    label,
    error,
    disabled = false,
    class: className = '',
    id = Math.random().toString(36).slice(2),
    ...rest
  }: {
    value?: string;
    options: Option[];
    label?: string;
    error?: string;
    disabled?: boolean;
    class?: string;
    id?: string;
    [key: string]: any;
  } = $props();
</script>

<div class="flex w-full flex-col gap-1.5 {className}">
  {#if label}
    <label for={id} class="text-sm font-medium text-text-light dark:text-text-dark">
      {label}
    </label>
  {/if}
  
  <select
    {id}
    {disabled}
    bind:value
    class="flex h-10 w-full rounded-md border border-surface-dark/20 dark:border-surface-light/20 bg-surface-light dark:bg-surface-dark px-3 py-2 text-sm text-text-light dark:text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 {error ? 'border-danger focus-visible:ring-danger' : ''}"
    {...rest}
  >
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  
  {#if error}
    <p class="text-xs text-danger">{error}</p>
  {/if}
</div>
