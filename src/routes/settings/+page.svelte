<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import CategorySelector from '$lib/components/transactions/CategorySelector.svelte';
	import PinLock from '$lib/components/auth/PinLock.svelte';
	import { theme } from '$lib/stores/theme';
	import { pinStore } from '$lib/stores/pin.svelte';
	import { openConfirmDialog, addToast } from '$lib/state/ui.svelte';
	import { backupToCloud, restoreFromCloud, getLastSyncTime, verifyCloudPassword } from '$lib/sync';
	import { syncStore } from '$lib/stores/sync.svelte';
	import { onMount } from 'svelte';
	import { db } from '$lib/db';
	import { seedDefaultCategories } from '$lib/db/seed';

	let isCategorySheetOpen = $state(false);
	let pinMode = $state<'none' | 'setup' | 'remove'>('none');

	let dummyExpenseId = $state('');
	let dummyIncomeId = $state('');

	let lastSync = $state<string | null>(null);
	let syncAction = $state<'backup' | 'restore' | null>(null);

	let tempPassword = $state('');
	let isEditingPassword = $state(false);
	let isVerifying = $state(false);

	onMount(() => {
		lastSync = getLastSyncTime();
		tempPassword = syncStore.cloudPassword;
	});

	function getRelativeTime(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

		if (Math.abs(diffInSeconds) < 60) return 'Just now';

		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
		const diffInMinutes = Math.round(diffInSeconds / 60);
		if (Math.abs(diffInMinutes) < 60) return rtf.format(diffInMinutes, 'minute');

		const diffInHours = Math.round(diffInMinutes / 60);
		if (Math.abs(diffInHours) < 24) return rtf.format(diffInHours, 'hour');

		const diffInDays = Math.round(diffInHours / 24);
		if (Math.abs(diffInDays) < 30) return rtf.format(diffInDays, 'day');

		const diffInMonths = Math.round(diffInDays / 30);
		if (Math.abs(diffInMonths) < 12) return rtf.format(diffInMonths, 'month');

		const diffInYears = Math.round(diffInMonths / 12);
		return rtf.format(diffInYears, 'year');
	}

	async function handleBackup() {
		if (!syncStore.hasUnsyncedChanges) {
			addToast('Everything is up to date!', 'info');
			return;
		}

		try {
			syncAction = 'backup';
			await backupToCloud();
			lastSync = getLastSyncTime();
			addToast('Backup successful!', 'success');
		} catch (error) {
			console.error(error);
			addToast('Backup failed', 'error');
		} finally {
			syncAction = null;
		}
	}

	async function handleRestore() {
		openConfirmDialog({
			title: 'Restore from Cloud',
			description:
				'This will overwrite all local transactions and categories with the cloud backup. Are you sure?',
			confirmText: 'Restore',
			isDestructive: true,
			onconfirm: async () => {
				try {
					syncAction = 'restore';
					await restoreFromCloud();
					lastSync = getLastSyncTime();
					addToast('Restore successful! Reloading...', 'success');
					setTimeout(() => window.location.reload(), 1500);
				} catch (error) {
					console.error(error);
					addToast('Restore failed', 'error');
					syncAction = null;
				}
			}
		});
	}

	function handleResetData() {
		openConfirmDialog({
			title: 'Reset App Data',
			description:
				'This will permanently delete all your transactions and restore categories to defaults. Your PIN and Cloud Sync settings will be kept. Are you absolutely sure?',
			confirmText: 'Reset Data',
			isDestructive: true,
			onconfirm: async () => {
				try {
					await db.transaction('rw', db.categories, db.transactions, async () => {
						await db.categories.clear();
						await db.transactions.clear();
					});
					await seedDefaultCategories();
					syncStore.setUnsynced(true); // Trigger a sync to update cloud state

					addToast('Data reset successful. Reloading...', 'success');
					setTimeout(() => window.location.reload(), 1000);
				} catch (e) {
					console.error(e);
					addToast('Failed to reset data', 'error');
				}
			}
		});
	}
</script>

<svelte:head>
	<title>Settings | Trekmamonee</title>
</svelte:head>

<div class="flex flex-col gap-4">
	<Card class="flex flex-col gap-4">
		<h2 class="font-semibold text-text-light dark:text-text-dark">Cloud Sync</h2>
		{#if syncStore.cloudPassword}
			<div class="flex items-center justify-between">
				<div class="flex flex-col">
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium text-text-light dark:text-text-dark">Last backup</span>
						{#if syncStore.hasUnsyncedChanges}
							<span
								class="flex h-2 w-2 rounded-full bg-warning animate-pulse"
								title="Unsynced local changes"
							></span>
						{/if}
					</div>
					<span class="text-xs text-text-light/60 dark:text-text-dark/60" data-testid="last-backup-time">
						{lastSync ? getRelativeTime(lastSync) : 'Never'}
						{#if syncStore.hasUnsyncedChanges}
							<span class="text-warning font-medium ml-1">(Unsynced changes)</span>
						{/if}
					</span>
				</div>
				<div class="flex gap-2">
					<Button
						variant="secondary"
						size="sm"
						onclick={handleRestore}
						disabled={syncAction !== null}
					>
						{#if syncAction === 'restore'}
							<svg
								class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								><circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle><path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path></svg
							>
							Restoring...
						{:else}
							Restore
						{/if}
					</Button>
					<Button size="sm" onclick={handleBackup} disabled={syncAction !== null}>
						{#if syncAction === 'backup'}
							<svg
								class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								><circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle><path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path></svg
							>
							Backing up...
						{:else}
							Backup
						{/if}
					</Button>
				</div>
			</div>
			<div class="h-px w-full bg-surface-dark/10 dark:bg-surface-light/10 my-2"></div>
		{/if}

		<div class="flex flex-col gap-3">
			<span class="text-sm font-medium text-text-light dark:text-text-dark"
				>Cloud Sync Password</span
			>

			{#if syncStore.cloudPassword && !isEditingPassword}
				<div
					class="flex items-center justify-between rounded-lg bg-surface-dark/5 dark:bg-surface-light/5 p-3"
				>
					<div class="flex items-center gap-2">
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
							class="text-primary"
							><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path
								d="M7 11V7a5 5 0 0 1 10 0v4"
							></path></svg
						>
						<span class="text-sm font-medium text-primary">Configured</span>
					</div>
					<div class="flex gap-2">
						<Button variant="secondary" size="sm" onclick={() => (isEditingPassword = true)}
							>Edit</Button
						>
						<Button
							variant="secondary"
							size="sm"
							onclick={() => {
								syncStore.setCloudPassword('');
								addToast('API Key removed', 'info');
							}}>Remove</Button
						>
					</div>
				</div>
			{:else}
				<div class="flex gap-2">
					<input
						type="password"
						bind:value={tempPassword}
						placeholder="Enter password"
						class="flex-1 rounded-lg bg-surface-dark/5 dark:bg-surface-light/5 px-3 py-2 text-sm text-text-light dark:text-text-dark placeholder-text-light/40 dark:placeholder-text-dark/40 outline-none focus:ring-1 focus:ring-primary"
					/>
					<Button
						size="sm"
						disabled={isVerifying}
						onclick={async () => {
							if (!tempPassword) {
								addToast('Please enter a password', 'warning');
								return;
							}
							isVerifying = true;
							const isValid = await verifyCloudPassword(tempPassword);
							isVerifying = false;

							if (isValid) {
								syncStore.setCloudPassword(tempPassword);
								isEditingPassword = false;
								addToast('Authentication verified and saved!', 'success');
							} else {
								addToast('Invalid password', 'error');
							}
						}}
					>
						{#if isVerifying}
							<svg
								class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								><circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle><path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path></svg
							>
							Verifying...
						{:else}
							Save
						{/if}
					</Button>
				</div>
				{#if isEditingPassword && syncStore.cloudPassword}
					<Button
						variant="ghost"
						size="sm"
						class="self-start text-xs -mt-1"
						onclick={() => {
							isEditingPassword = false;
							tempPassword = syncStore.cloudPassword;
						}}>Cancel</Button
					>
				{/if}
			{/if}
		</div>
	</Card>

	<Card class="flex flex-col gap-4">
		<h2 class="font-semibold text-text-light dark:text-text-dark">Appearance</h2>
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium text-text-light dark:text-text-dark">Theme</span>
			<select
				class="rounded-md border border-surface-dark/20 bg-surface-light px-2 py-1 text-sm dark:border-surface-light/20 dark:bg-surface-dark"
				bind:value={$theme}
			>
				<option value="system">System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</div>
	</Card>

	<Card class="flex flex-col gap-4">
		<h2 class="font-semibold text-text-light dark:text-text-dark">Categories</h2>
		<Button variant="secondary" class="w-full" onclick={() => (isCategorySheetOpen = true)}>
			Manage Categories
		</Button>
	</Card>

	<Card class="flex flex-col gap-4">
		<h2 class="font-semibold text-text-light dark:text-text-dark">Security</h2>
		<div class="flex items-center justify-between">
			<div class="flex flex-col">
				<span class="text-sm font-medium text-text-light dark:text-text-dark">App Lock</span>
				<span
					class="text-xs {pinStore.hasPin
						? 'text-primary-light dark:text-primary-dark'
						: 'text-text-light/60 dark:text-text-dark/60'}"
				>
					{pinStore.hasPin ? 'Enabled' : 'Disabled'}
				</span>
			</div>
			{#if pinStore.hasPin}
				<Button variant="secondary" size="sm" onclick={() => (pinMode = 'remove')}
					>Remove PIN</Button
				>
			{:else}
				<Button variant="secondary" size="sm" onclick={() => (pinMode = 'setup')}>Set PIN</Button>
			{/if}
		</div>
	</Card>

	<Card class="flex flex-col gap-4 border-danger/20 dark:border-danger/20">
		<h2 class="font-semibold text-danger">Danger Zone</h2>
		<div class="flex items-center justify-between">
			<div class="flex flex-col">
				<span class="text-sm font-medium text-text-light dark:text-text-dark">Reset App Data</span>
				<span class="text-xs text-text-light/60 dark:text-text-dark/60"
					>Permanently delete all local data</span
				>
			</div>
			<Button variant="danger" size="sm" onclick={handleResetData}>Reset Data</Button>
		</div>
	</Card>
</div>

<!-- Category Management Sheet -->
<BottomSheet
	isOpen={isCategorySheetOpen}
	onclose={() => (isCategorySheetOpen = false)}
	title="Manage Categories"
>
	<div class="flex flex-col gap-8 pb-8 pt-2">
		<div class="flex flex-col gap-2">
			<h3 class="font-medium text-text-light dark:text-text-dark px-2">Expenses</h3>
			<CategorySelector type="expense" bind:selectedCategoryId={dummyExpenseId} />
		</div>
		<div class="flex flex-col gap-2">
			<h3 class="font-medium text-text-light dark:text-text-dark px-2">Income</h3>
			<CategorySelector type="income" bind:selectedCategoryId={dummyIncomeId} />
		</div>
	</div>
</BottomSheet>

<!-- PIN Setup/Remove Sheet -->
<BottomSheet
	isOpen={pinMode !== 'none'}
	onclose={() => (pinMode = 'none')}
	title={pinMode === 'setup' ? 'Set PIN Lock' : 'Remove PIN Lock'}
>
	{#if pinMode !== 'none'}
		<div class="pb-8 pt-4">
			<PinLock
				mode={pinMode}
				onsuccess={() => (pinMode = 'none')}
				oncancel={() => (pinMode = 'none')}
			/>
		</div>
	{/if}
</BottomSheet>
