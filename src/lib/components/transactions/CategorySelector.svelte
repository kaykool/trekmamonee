<script lang="ts">
	import { db, generateId, type TransactionType, type Category } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { addToast, openConfirmDialog } from '$lib/state/ui.svelte';
	import CategoryItem from './CategoryItem.svelte';

	const CATEGORY_COLORS = [
		'bg-red-500',
		'bg-blue-500',
		'bg-green-500',
		'bg-yellow-500',
		'bg-purple-500',
		'bg-pink-500',
		'bg-indigo-500',
		'bg-teal-500'
	];

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
	let isProcessing = $state(false);


	function handleCategorySelect(category: Category) {
		if (isEditingCategories) {
			editingCategoryId = category.id;
			editingCategoryName = category.name;
		} else {
			selectedCategoryId = category.id;
		}
	}

	async function handleCategoryRename(category: Category) {
		if (!editingCategoryName.trim() || isProcessing) {
			editingCategoryId = null;
			return;
		}
		isProcessing = true;
		try {
			await db.categories.update(category.id, { name: editingCategoryName.trim() });
		} catch (e) {
			console.error(e);
			addToast('Failed to rename category', 'error');
		} finally {
			isProcessing = false;
			editingCategoryId = null;
		}
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
		if (isProcessing) return;
		isProcessing = true;
		try {
			const txCount = await db.transactions.where('categoryId').equals(category.id).count();
			if (txCount > 0) {
				addToast('Cannot delete category in use', 'error');
				return;
			}
			await db.categories.delete(category.id);
			if (selectedCategoryId === category.id) selectedCategoryId = '';
			addToast('Category deleted', 'success');
		} catch (e) {
			console.error(e);
			addToast('Failed to delete category', 'error');
		} finally {
			isProcessing = false;
		}
	}

	let draggedIndex = $state<number | null>(null);
	let hoverIndex = $state<number | null>(null);

	function handleDragStart(e: DragEvent, index: number) {
		if (!isEditingCategories) return;
		draggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', index.toString());
		}
	}

	function handleDragOver(e: DragEvent, index: number) {
		if (!isEditingCategories) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		if (hoverIndex !== index) {
			hoverIndex = index;
		}
	}

	function handleDragLeave() {
		hoverIndex = null;
	}

	async function handleDrop(e: DragEvent, targetIndex: number) {
		if (!isEditingCategories || draggedIndex === null || isProcessing) return;
		e.preventDefault();
		
		if (draggedIndex === targetIndex) {
			draggedIndex = null;
			hoverIndex = null;
			return;
		}

		isProcessing = true;
		const newCategories = [...categories];
		const [draggedItem] = newCategories.splice(draggedIndex, 1);
		newCategories.splice(targetIndex, 0, draggedItem);

		try {
			await db.transaction('rw', db.categories, async () => {
				for (let i = 0; i < newCategories.length; i++) {
					await db.categories.update(newCategories[i].id, { sortOrder: i });
				}
			});
		} catch (error) {
			console.error(error);
			addToast('Failed to reorder categories', 'error');
		} finally {
			isProcessing = false;
			draggedIndex = null;
			hoverIndex = null;
		}
	}

	function handleDragEnd() {
		draggedIndex = null;
		hoverIndex = null;
	}

	async function addNewCategory() {
		if (isProcessing) return;
		isProcessing = true;
		
		const randomColor = CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];

		const newCat: Category = {
			id: generateId(),
			name: 'New',
			icon: '✨',
			color: randomColor,
			type,
			isDefault: false,
			sortOrder: categories.length,
			createdAt: Date.now()
		};
		try {
			await db.categories.add(newCat);
			editingCategoryId = newCat.id;
			editingCategoryName = ''; // Start empty for typing
			selectedCategoryId = newCat.id;
		} catch (e) {
			console.error(e);
			addToast('Failed to add category', 'error');
		} finally {
			isProcessing = false;
		}
	}

	// Subscribe to categories
	$effect(() => {
		const currentType = type;
		const observable = liveQuery(async () => {
			const cats = await db.categories.where('type').equals(currentType).toArray();
			return cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
		});

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
			<CategoryItem
				{category}
				selected={selectedCategoryId === category.id}
				isEditing={isEditingCategories}
				isEditingThis={editingCategoryId === category.id}
				bind:editingName={editingCategoryName}
				dragged={draggedIndex === categories.indexOf(category)}
				hovered={hoverIndex === categories.indexOf(category)}
				onclick={(e) => {
					e.preventDefault();
					handleCategorySelect(category);
				}}
				ondelete={(e) => {
					e.stopPropagation();
					e.preventDefault();
					promptDeleteCategory(category);
				}}
				onrename={() => handleCategoryRename(category)}
				ondragstart={(e) => handleDragStart(e, categories.indexOf(category))}
				ondragover={(e) => handleDragOver(e, categories.indexOf(category))}
				ondragleave={handleDragLeave}
				ondrop={(e) => handleDrop(e, categories.indexOf(category))}
				ondragend={handleDragEnd}
			/>
		{/each}

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
				>Add New</span
			>
		</button>
	</div>
</div>
