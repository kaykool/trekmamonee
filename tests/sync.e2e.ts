import { test, expect } from '@playwright/test';

test.describe('Cloud Sync', () => {
	test.beforeEach(async ({ page }) => {
		// Mock cloud password in localStorage to show the sync UI
		await page.addInitScript(() => {
			window.localStorage.setItem('cloud_sync_password', 'test-password');
		});
		await page.goto('/settings');
	});

	test('Happy Path: Backup to Cloud', async ({ page }) => {
		// Mock the sync API to succeed
		await page.route('/api/sync', async (route) => {
			expect(route.request().method()).toBe('POST');
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true, message: 'Backup successful' })
			});
		});

		// Verify initial state
		await expect(page.locator('div').filter({ hasText: 'Last backup' }).locator('span').last()).toContainText('Never');

		// Click Backup
		const backupButton = page.getByRole('button', { name: 'Backup' });
		await backupButton.click();

		// Should show syncing text temporarily (may be too fast to catch without delay in mock, but we'll check it returns to Backup)
		await expect(backupButton).toHaveText('Backup');

		// Last backup time should update
		await expect(page.locator('div').filter({ hasText: 'Last backup' }).locator('span').last()).not.toContainText('Never');
	});

	test('Happy Path: Restore from Cloud', async ({ page }) => {
		// Mock the sync API to succeed
		await page.route('/api/sync', async (route) => {
			expect(route.request().method()).toBe('GET');
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					data: { categories: [], transactions: [] }
				})
			});
		});

		// Click Restore
		await page.getByRole('button', { name: 'Restore' }).click();

		// Should show confirm dialog
		const dialog = page.locator('text=Restore from Cloud');
		await expect(dialog).toBeVisible();

		// Click Confirm
		await page.locator('.pointer-events-auto').getByRole('button', { name: 'Restore', exact: true }).click();

		// Dialog should close
		await expect(dialog).not.toBeVisible();
	});

	test('Sad Path: Backup fails', async ({ page }) => {
		// Mock the sync API to fail
		await page.route('/api/sync', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ success: false, error: 'Failed to backup' })
			});
		});

		const backupButton = page.getByRole('button', { name: 'Backup' });
		await backupButton.click();

		// The button should recover from the Syncing... state
		await expect(backupButton).toHaveText('Backup');
		await expect(backupButton).toBeEnabled();

		// Last backup time should still be Never (since it failed)
		await expect(page.locator('div').filter({ hasText: 'Last backup' }).locator('span').last()).toContainText('Never');
	});

	test('Edge Case: Restore with invalid data from cloud', async ({ page }) => {
		// Mock the sync API to return garbage
		await page.route('/api/sync', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					success: true,
					data: null // Missing categories and transactions
				})
			});
		});

		// Click Restore
		await page.getByRole('button', { name: 'Restore' }).click();

		// Confirm dialog
		await page.locator('.pointer-events-auto').getByRole('button', { name: 'Restore', exact: true }).click();

		// Wait for dialog to close (meaning the process finished, even if it failed gracefully)
		await expect(page.locator('text=Restore from Cloud')).not.toBeVisible();
	});
});
