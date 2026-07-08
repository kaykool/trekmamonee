<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const navItems = [
		{
			path: '/',
			label: 'Home',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
		},
		{
			path: '/transactions',
			label: 'History',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="16" y1="10" y2="10"/><line x1="8" x2="16" y1="14" y2="14"/><line x1="8" x2="12" y1="18" y2="18"/></svg>'
		},
		{
			path: '/reports',
			label: 'Reports',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>'
		},
		{
			path: '/settings',
			label: 'Settings',
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>'
		}
	];
</script>

<nav
	class="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t border-surface-dark/10 dark:border-surface-light/10 bg-surface-light dark:bg-surface-dark px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
>
	{#each navItems as item (item.path)}
		{@const isActive =
			page.url.pathname === item.path ||
			(item.path !== '/' && page.url.pathname.startsWith(item.path))}
		<button
			class="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors {isActive
				? 'text-primary'
				: 'text-text-light/60 dark:text-text-dark/60 hover:text-text-light dark:hover:text-text-dark'}"
			onclick={() => goto(item.path)}
		>
			<div class="[&>svg]:h-5 [&>svg]:w-5">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html item.icon}
			</div>
			<span class="text-[10px] font-medium">{item.label}</span>
		</button>
	{/each}
</nav>

<!-- Safe area padding for the bottom nav so content isn't hidden -->
<div class="h-16 w-full pb-safe"></div>
