<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    class: className = '',
    ...rest
  }: {
    children: Snippet;
    class?: string;
    [key: string]: any;
  } = $props();
</script>

<div 
  class="rounded-xl border border-surface-dark/10 dark:border-surface-light/10 bg-surface-light dark:bg-surface-dark p-4 shadow-sm {className}"
  {...rest}
>
  {@render children()}
</div>
