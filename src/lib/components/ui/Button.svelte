<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		class: className = '',
		onclick,
		...rest
	}: {
		children: Snippet;
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg' | 'icon';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		[key: string]: unknown;
	} = $props();

	const baseStyles =
		'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50';

	const variants = {
		primary: 'bg-primary text-white hover:bg-primary/90',
		secondary:
			'bg-bg-dark/10 dark:bg-surface-light/10 text-text-light dark:text-text-dark hover:bg-bg-dark/20 dark:hover:bg-surface-light/20',
		danger: 'bg-danger text-white hover:bg-danger/90',
		ghost: 'hover:bg-bg-dark/10 dark:hover:bg-surface-light/10 text-text-light dark:text-text-dark'
	};

	const sizes = {
		sm: 'h-8 px-3 text-xs',
		md: 'h-10 px-4 py-2 text-sm',
		lg: 'h-12 px-8 text-base',
		icon: 'h-10 w-10'
	};
</script>

<button
	{type}
	{disabled}
	class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
	{onclick}
	{...rest}
>
	{@render children()}
</button>
