<script lang="ts">
	import { db, generateId, type TransactionType, type Category } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { addToast, openConfirmDialog } from '$lib/state/ui.svelte';

	let {
		selectedCategoryId = $bindable(''),
		type
	}: {
		selectedCategoryId: string;
		type: TransactionType;
	} = $props();

	let categories = $state<Category[]>([]);

	// Category Edit State
	let isEditingCategories = $state(false);
	let editingCategoryId = $state<string | null>(null);
	let editingCategoryName = $state('');

	function focusOnMount(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	async function handleCategoryRename(category: Category) {
		if (!editingCategoryName.trim()) {
			editingCategoryId = null;
			return;
		}
		try {
			await db.categories.update(category.id, { name: editingCategoryName.trim() });
		} catch (e) {
			console.error(e);
			addToast('Failed to rename category', 'error');
		}
		editingCategoryId = null;
	}

	function promptDeleteCategory(category: Category) {
		openConfirmDialog({
			title: 'Delete Category',
			description: 'Are you sure you want to delete this category? This action cannot be undone.',
			confirmText: 'Delete',
			onconfirm: () => executeDeleteCategory(category)
		});
	}

	async function executeDeleteCategory(category: Category) {
		const txCount = await db.transactions.where('categoryId').equals(category.id).count();
		if (txCount > 0) {
			addToast('Cannot delete category in use', 'error');
			return;
		}
		try {
			await db.categories.delete(category.id);
			if (selectedCategoryId === category.id) selectedCategoryId = '';
			addToast('Category deleted', 'success');
		} catch (e) {
			console.error(e);
			addToast('Failed to delete category', 'error');
		}
	}

	async function addNewCategory() {
		const colors = [
			'bg-red-500',
			'bg-blue-500',
			'bg-green-500',
			'bg-yellow-500',
			'bg-purple-500',
			'bg-pink-500',
			'bg-indigo-500',
			'bg-teal-500'
		];
		const randomColor = colors[Math.floor(Math.random() * colors.length)];

		const newCat: Category = {
			id: generateId(),
			name: 'New',
			icon: '✨',
			color: randomColor,
			type,
			isDefault: false,
			createdAt: Date.now()
		};
		try {
			await db.categories.add(newCat);
			editingCategoryId = newCat.id;
			editingCategoryName = newCat.name;
		} catch (e) {
			console.error(e);
			addToast('Failed to add category', 'error');
		}
	}

	// Subscribe to categories
	$effect(() => {
		const currentType = type;
		const observable = liveQuery(() => db.categories.where('type').equals(currentType).toArray());

		const subscription = observable.subscribe((result) => {
			categories = result;
			if (result.length > 0 && !result.find((c) => c.id === selectedCategoryId)) {
				selectedCategoryId = result[0].id;
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium text-text-light/60 dark:text-text-dark/60">Category</span>
		<button
			class="rounded-full p-1 transition-colors text-text-light/40 hover:text-text-light hover:bg-surface-dark/5 dark:text-text-dark/40 dark:hover:text-text-dark dark:hover:bg-surface-light/10"
			onclick={(e) => {
				e.preventDefault();
				isEditingCategories = !isEditingCategories;
				editingCategoryId = null;
			}}
			aria-label={isEditingCategories ? 'Done editing categories' : 'Edit categories'}
		>
			{#if isEditingCategories}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
					></line></svg
				>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
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
			{/if}
		</button>
	</div>
	<div class="grid grid-cols-4 gap-3 content-start">
		{#each categories as category (category.id)}
			<div
				role="button"
				tabindex="0"
				class="group relative flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-all {selectedCategoryId ===
					category.id && !isEditingCategories
					? 'bg-background dark:bg-background-dark shadow-sm ring-2 ring-primary/50'
					: 'bg-surface-dark/5 hover:bg-surface-dark/10 dark:bg-surface-light/5 dark:hover:bg-surface-light/10'} cursor-pointer"
				onclick={(e) => {
					e.preventDefault();
					if (isEditingCategories) {
						editingCategoryId = category.id;
						editingCategoryName = category.name;
					} else {
						selectedCategoryId = category.id;
					}
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						if (isEditingCategories) {
							editingCategoryId = category.id;
							editingCategoryName = category.name;
						} else {
							selectedCategoryId = category.id;
						}
					}
				}}
			>
				{#if isEditingCategories}
					<button
						class="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-background dark:bg-background-dark text-text-light/50 dark:text-text-dark/50 shadow-sm ring-1 ring-surface-dark/10 dark:ring-surface-light/10 hover:bg-danger hover:text-white hover:ring-danger transition-colors"
						onclick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							promptDeleteCategory(category);
						}}
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
					class="relative flex h-12 w-12 items-center justify-center rounded-full {category.color} text-2xl text-white shadow-sm transition-transform {selectedCategoryId ===
						category.id && !isEditingCategories
						? 'scale-110'
						: ''}"
				>
					{category.icon}
					{#if isEditingCategories}
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

				{#if editingCategoryId === category.id}
					<input
						use:focusOnMount
						type="text"
						bind:value={editingCategoryName}
						onblur={() => handleCategoryRename(category)}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								e.currentTarget.blur();
							}
						}}
						class="w-full bg-background dark:bg-background-dark rounded px-1 text-center text-xs font-medium text-text-light dark:text-text-dark focus:outline-none focus:ring-1 focus:ring-primary"
						onclick={(e) => e.stopPropagation()}
					/>
				{:else}
					<span
						class="w-full truncate text-center text-xs font-medium {selectedCategoryId ===
							category.id && !isEditingCategories
							? 'text-primary'
							: 'text-text-light/80 dark:text-text-dark/80'}">{category.name}</span
					>
				{/if}
			</div>
		{/each}

		{#if isEditingCategories}
			<button
				class="flex flex-col items-center justify-center gap-2 rounded-xl p-3 transition-all border-2 border-dashed border-surface-dark/20 hover:border-surface-dark/40 hover:bg-surface-dark/5 dark:border-surface-light/20 dark:hover:border-surface-light/40 dark:hover:bg-surface-light/5"
				onclick={(e) => {
					e.preventDefault();
					addNewCategory();
				}}
			>
				<div
					class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-dark/5 dark:bg-surface-light/5 text-2xl text-text-light/50 dark:text-text-dark/50"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"
						></line></svg
					>
				</div>
				<span
					class="w-full truncate text-center text-xs font-medium text-text-light/60 dark:text-text-dark/60"
					>New</span
				>
			</button>
		{/if}
	</div>
</div>
