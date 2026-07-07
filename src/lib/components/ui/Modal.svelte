<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  let {
    show = $bindable(false),
    title,
    children,
    class: className = '',
    onclose,
  }: {
    show: boolean;
    title?: string;
    children: Snippet;
    class?: string;
    onclose?: () => void;
  } = $props();

  function close() {
    show = false;
    if (onclose) onclose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && show) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/50 p-4 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    onclick={close}
  >
    <div 
      class="w-full max-w-md rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-lg {className}"
      transition:scale={{ duration: 200, start: 0.95 }}
      onclick={(e) => e.stopPropagation()}
    >
      {#if title}
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-text-light dark:text-text-dark">{title}</h2>
          <button 
            class="rounded-full p-1 text-text-light/50 dark:text-text-dark/50 hover:bg-bg-dark/10 dark:hover:bg-surface-light/10"
            onclick={close}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      {/if}
      
      {@render children()}
    </div>
  </div>
{/if}
