import { test, expect } from '@playwright/test';

test.describe('Initial Setup & First-Time Auth', () => {
	test.beforeEach(async ({ page }) => {
		// Clear local storage to simulate a fresh device
		await page.goto('/');
		await page.evaluate(() => window.localStorage.clear());
		// Reload to trigger the check
		await page.reload();
	});

	test('Happy Path: Start Fresh without Cloud Sync', async ({ page }) => {
		const welcomeDialog = page.locator('text=Welcome back');
		await expect(welcomeDialog).toBeVisible();

		// Click Start Fresh
		await page.getByRole('button', { name: 'Start Fresh without Cloud Sync' }).click();

		// Should close the dialog and land on dashboard (or wherever)
		await expect(welcomeDialog).not.toBeVisible();
		
		// Verify local storage flag was set
		const flag = await page.evaluate(() => window.localStorage.getItem('initial_setup_completed'));
		expect(flag).toBe('true');
	});

	test('Happy Path: Restore from Cloud with valid password', async ({ page }) => {
		const welcomeDialog = page.locator('text=Welcome back');
		await expect(welcomeDialog).toBeVisible();

		// Mock the verify API to succeed
		await page.route('/api/sync/verify', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true })
			});
		});

		// Mock the sync API (GET for restore) to succeed
		await page.route('/api/sync', async (route) => {
			if (route.request().method() === 'GET') {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						success: true,
						data: { categories: [], transactions: [] }
					})
				});
			} else {
				await route.continue();
			}
		});

		// Type password
		const pwdInput = page.getByPlaceholder('Enter Cloud Password');
		await pwdInput.fill('valid-password');
		
		// Click Restore
		await page.getByRole('button', { name: 'Restore from Cloud' }).click();

		// Should show toast and close
		await expect(page.locator('text=Data restored successfully!')).toBeVisible();
		await expect(welcomeDialog).not.toBeVisible();

		// Verify local storage flags
		const flag = await page.evaluate(() => window.localStorage.getItem('initial_setup_completed'));
		expect(flag).toBe('true');
		const savedPwd = await page.evaluate(() => window.localStorage.getItem('cloud_sync_password'));
		expect(savedPwd).toBe('valid-password');
	});

	test('Sad Path: Restore from Cloud with invalid password', async ({ page }) => {
		const welcomeDialog = page.locator('text=Welcome back');
		await expect(welcomeDialog).toBeVisible();

		// Mock the verify API to fail
		await page.route('/api/sync/verify', async (route) => {
			await route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({ success: false, error: 'Unauthorized' })
			});
		});

		// Type password
		const pwdInput = page.getByPlaceholder('Enter Cloud Password');
		await pwdInput.fill('wrong-password');
		
		// Click Restore
		await page.getByRole('button', { name: 'Restore from Cloud' }).click();

		// Should show error toast
		await expect(page.locator('text=Invalid password')).toBeVisible();
		
		// Dialog should stay open
		await expect(welcomeDialog).toBeVisible();
	});

	test('Edge Case: Empty password submission', async ({ page }) => {
		const welcomeDialog = page.locator('text=Welcome back');
		await expect(welcomeDialog).toBeVisible();

		// Leave password empty and click Restore
		await page.getByRole('button', { name: 'Restore from Cloud' }).click();

		// Should show warning toast
		await expect(page.locator('text=Please enter your Cloud Sync Password')).toBeVisible();
		
		// Dialog should stay open
		await expect(welcomeDialog).toBeVisible();
	});
});
