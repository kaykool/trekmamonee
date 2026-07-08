<script lang="ts">
	import { openAddTransaction } from '$lib/state/ui.svelte';
</script>

<button
	class="fixed bottom-20 right-6 z-50 flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-5 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
	onclick={() => openAddTransaction()}
	aria-label="Add Transaction"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg
	>
	<span class="font-semibold">Add</span>
</button>
