<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let {
    isOpen = $bindable(false),
    title = '',
    onclose,
    children
  }: {
    isOpen: boolean;
    title?: string;
    onclose?: () => void;
    children?: import('svelte').Snippet;
  } = $props();

  function close() {
    isOpen = false;
    if (onclose) onclose();
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <button 
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm cursor-default border-none outline-none w-full h-full"
    aria-label="Close Bottom Sheet"
    onclick={close}
    transition:fade={{ duration: 200, easing: cubicOut }}
  ></button>

  <!-- Sheet -->
  <div 
    class="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full max-w-2xl mx-auto flex-col rounded-t-[2rem] bg-surface-light pt-6 shadow-xl dark:bg-surface-dark pb-safe"
    transition:fly={{ y: '100%', duration: 300, easing: cubicOut }}
  >
    <!-- Handle -->
    <div class="mx-auto mb-6 h-1.5 w-12 rounded-full bg-surface-dark/20 dark:bg-surface-light/20"></div>

    {#if title}
      <h2 class="mb-4 px-6 text-center text-lg font-semibold text-text-light dark:text-text-dark">{title}</h2>
    {/if}

    <div class="flex-1 overflow-y-auto px-6 pb-6">
      {@render children?.()}
    </div>
  </div>
{/if}
