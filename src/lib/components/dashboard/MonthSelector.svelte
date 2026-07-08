<script lang="ts">
	let {
		displayMonth,
		onprev,
		onnext
	}: {
		displayMonth: string;
		onprev: () => void;
		onnext: () => void;
	} = $props();
</script>

<div
	class="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-2 rounded-2xl shadow-sm"
>
	<button
		class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-surface-dark/5 dark:hover:bg-surface-light/10 text-text-light/60 hover:text-text-light dark:text-text-dark/60 dark:hover:text-text-dark"
		onclick={onprev}
		aria-label="Previous month"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg
		>
	</button>

	<span class="text-base font-semibold text-text-light dark:text-text-dark">{displayMonth}</span>

	<button
		class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-surface-dark/5 dark:hover:bg-surface-light/10 text-text-light/60 hover:text-text-light dark:text-text-dark/60 dark:hover:text-text-dark"
		onclick={onnext}
		aria-label="Next month"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg
		>
	</button>
</div>
