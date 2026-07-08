<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { uiState, removeToast } from '$lib/state/ui.svelte';

	const typeColors = {
		success: 'bg-green-500 dark:bg-green-600 text-white',
		error: 'bg-red-500 dark:bg-red-600 text-white',
		warning: 'bg-yellow-500 dark:bg-yellow-600 text-white',
		info: 'bg-blue-500 dark:bg-blue-600 text-white'
	};

	const typeIcons = {
		success:
			'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
		error:
			'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
		warning:
			'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
		info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
	};
</script>

<div
	class="fixed top-4 left-0 right-0 z-100 flex flex-col items-center gap-2 px-4 pointer-events-none"
>
	{#each uiState.toasts as toast (toast.id)}
		<div
			animate:flip={{ duration: 300 }}
			in:fly={{ y: -20, duration: 300 }}
			out:fade={{ duration: 200 }}
			class="pointer-events-auto flex w-max max-w-full items-center gap-3 rounded-xl p-3 shadow-lg {typeColors[
				toast.type
			]}"
		>
			<div class="shrink-0">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html typeIcons[toast.type]}
			</div>
			<p class="text-sm font-medium">{toast.message}</p>

			<button
				class="ml-auto opacity-70 hover:opacity-100 transition-opacity"
				onclick={() => removeToast(toast.id)}
				aria-label="Close"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
					></line></svg
				>
			</button>
		</div>
	{/each}
</div>
