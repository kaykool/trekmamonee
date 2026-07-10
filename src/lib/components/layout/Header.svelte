<script lang="ts">
	import { page } from '$app/state';
	import { theme } from '$lib/stores/theme';

	const titles: Record<string, string> = {
		'/': 'Dashboard',
		'/transactions': 'Transactions',
		'/reports': 'Reports',
		'/settings': 'Settings'
	};

	let title = $derived(titles[page.url.pathname] || 'Trekmamonee');
</script>

<header
	class="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-surface-dark/10 dark:border-surface-light/10 bg-surface-light/80 dark:bg-surface-dark/80 px-4 py-3 backdrop-blur-md"
>
	<h1 class="text-xl font-bold text-text-light dark:text-text-dark">{title}</h1>

	<div class="flex items-center gap-2">
		<!-- Quick theme toggle for convenience -->
		<button
			class="rounded-full p-2 text-text-light/70 dark:text-text-dark/70 hover:bg-bg-dark/10 dark:hover:bg-surface-light/10"
			onclick={() => theme.set($theme === 'dark' ? 'light' : 'dark')}
			aria-label="Toggle theme"
		>
			{#if $theme === 'dark'}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path
						d="m4.93 4.93 1.41 1.41"
					/><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path
						d="m6.34 17.66-1.41 1.41"
					/><path d="m19.07 4.93-1.41 1.41" /></svg
				>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
				>
			{/if}
		</button>
	</div>
</header>
