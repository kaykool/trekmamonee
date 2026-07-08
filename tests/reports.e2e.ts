import { test, expect } from '@playwright/test';

/**
 * Helper: Adds a transaction via the FAB → BottomSheet flow.
 */
async function addTransaction(
	page: import('@playwright/test').Page,
	options: {
		type: 'expense' | 'income';
		amount: string;
		name: string;
	}
) {
	await page.getByRole('button', { name: 'Add Transaction' }).click();
	await page
		.getByRole('button', { name: options.type === 'expense' ? 'Expense' : 'Income', exact: true })
		.click();
	if (options.type === 'income') await page.waitForTimeout(300);
	await page.fill('input[inputmode="numeric"]', options.amount);
	await page.fill('input[type="text"]:not([inputmode="numeric"])', options.name);
	// Wait for categories to load from Dexie, then click the first one.
	const firstCategory = page.locator('.grid-cols-4 [role="button"]').first();
	await firstCategory.waitFor({ state: 'visible', timeout: 5000 });
	await firstCategory.click();
	await page.locator(`button:has-text("Save ${options.type}")`).click();
	// Wait for bottom sheet to close
	await page.waitForTimeout(400);
}

test.describe('Reports Page', () => {
	test.beforeEach(async ({ page }) => {
		page.on('console', (msg) => console.log('BROWSER_LOG:', msg.text()));
	});

	test('Reports page loads and shows default empty state', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/reports');

		// View toggles should exist
		await expect(page.getByRole('button', { name: 'Weekly' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Monthly' })).toBeVisible();

		// Summary cards should exist
		await expect(page.getByText('INCOME', { exact: true })).toBeVisible();
		await expect(page.getByText('EXPENSE', { exact: true })).toBeVisible();
		await expect(page.getByText('SAVINGS', { exact: true })).toBeVisible();

		// Should show empty state
		await expect(page.getByText('No expenses in this period')).toBeVisible();
	});

	test('Reports page updates after adding a transaction', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		// Add an expense
		await addTransaction(page, { type: 'expense', amount: '50000', name: 'Lunch' });

		// Navigate to reports
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/reports');
		await page.waitForTimeout(500);

		// Expense card should show Rp 50.000
		const expenseCard = page.locator('text=Rp 50.000');
		await expect(expenseCard.first()).toBeVisible();

		// Balance should show -Rp 50.000
		await expect(page.locator('text=-Rp 50.000').first()).toBeVisible();

		// Chart should appear (No expenses text should be gone)
		await expect(page.locator('text=No expenses in this period')).not.toBeVisible();
		
		// The canvas element should exist (Chart.js renders to canvas)
		const canvas = page.locator('canvas');
		await expect(canvas).toBeVisible();
	});

	test('Changing views and weeks updates the data', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		// Add an expense for the current week/month
		await addTransaction(page, { type: 'expense', amount: '25000', name: 'Snack' });

		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/reports');
		await page.waitForTimeout(500);

		// Should see the expense
		await expect(page.locator('text=Rp 25.000').first()).toBeVisible();

		// Click Previous button to go to last week
		const dateLabel = page.locator('.font-semibold.text-text-light');
		const initialDateText = await dateLabel.innerText();
		console.log('Initial date label:', initialDateText);

		const prevButton = page.getByLabel('Previous Period');
		await prevButton.click();
		await page.waitForTimeout(500);

		const newDateText = await dateLabel.innerText();
		console.log('New date label:', newDateText);
		expect(newDateText).not.toEqual(initialDateText);

		// Previous week should show empty state
		await expect(page.locator('text=No expenses in this period')).toBeVisible();

		// Click Next button to go back to this week
		const nextButton = page.getByLabel('Next Period');
		await nextButton.click();
		await page.waitForTimeout(500);

		// Expense should be visible again
		await expect(page.locator('text=Rp 25.000').first()).toBeVisible();

		// Switch to Monthly view
		await page.getByRole('button', { name: 'Monthly' }).click();
		await page.waitForTimeout(500);

		// Monthly view should also show the expense (since it was added this month)
		await expect(page.locator('text=Rp 25.000').first()).toBeVisible();
	});
});
