<script lang="ts">
	import type { Category } from '$lib/db';

	let {
		category,
		selected,
		isEditing,
		isEditingThis,
		editingName = $bindable(''),
		dragged,
		hovered,
		onclick,
		ondelete,
		onrename,
		ondragstart,
		ondragover,
		ondragleave,
		ondrop,
		ondragend
	}: {
		category: Category;
		selected: boolean;
		isEditing: boolean;
		isEditingThis: boolean;
		editingName: string;
		dragged: boolean;
		hovered: boolean;
		onclick: (e: MouseEvent | KeyboardEvent) => void;
		ondelete: (e: MouseEvent) => void;
		onrename: (name: string) => void;
		ondragstart: (e: DragEvent) => void;
		ondragover: (e: DragEvent) => void;
		ondragleave: () => void;
		ondrop: (e: DragEvent) => void;
		ondragend: () => void;
	} = $props();

	function focusOnMount(node: HTMLInputElement) {
		node.focus();
		node.select();
	}
</script>

<div
	role="button"
	tabindex="0"
	draggable={isEditing}
	{ondragstart}
	{ondragover}
	{ondragleave}
	{ondrop}
	{ondragend}
	class="group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-3 text-left transition-all {selected && !isEditing
		? 'bg-background shadow-sm ring-2 ring-primary/50 dark:bg-background-dark'
		: 'bg-surface-dark/5 hover:bg-surface-dark/10 dark:bg-surface-light/5 dark:hover:bg-surface-light/10'} {dragged
		? 'opacity-45 scale-95 border border-dashed border-primary/50'
		: ''} {hovered && !dragged
		? 'ring-2 ring-dashed ring-primary bg-primary/5'
		: ''}"
	onclick={onclick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick(e);
		}
	}}
>
	{#if isEditing}
		<button
			type="button"
			class="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-background text-text-light/50 shadow-sm ring-1 ring-surface-dark/10 transition-colors hover:bg-danger hover:text-white hover:ring-danger dark:bg-background-dark dark:text-text-dark/50 dark:ring-surface-light/10"
			onclick={ondelete}
			aria-label="Delete category"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-3 w-3"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
				></line></svg
			>
		</button>
	{/if}

	<div
		class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full {category.color} text-2xl text-white shadow-sm transition-transform {selected && !isEditing
			? 'scale-110'
			: ''}"
	>
		{category.icon}
		{#if isEditing}
			<div
				class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 text-white"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M12 20h9"></path><path
						d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
					></path></svg
				>
			</div>
		{/if}
	</div>

	{#if isEditingThis}
		<input
			use:focusOnMount
			type="text"
			bind:value={editingName}
			onblur={() => onrename(editingName)}
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					e.currentTarget.blur();
				}
				e.stopPropagation();
			}}
			class="w-full bg-background dark:bg-background-dark rounded px-1 text-center text-xs font-medium text-text-light dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-primary"
			onclick={(e) => e.stopPropagation()}
		/>
	{:else}
		<span
			class="w-full truncate text-center text-xs font-medium {selected && !isEditing
				? 'text-primary'
				: 'text-text-light/80 dark:text-text-dark/80'}"
		>
			{category.name}
		</span>
	{/if}
</div>
