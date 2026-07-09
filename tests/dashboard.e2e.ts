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
	// Categories are div[role="button"] inside a grid-cols-4 container.
	const firstCategory = page.locator('.grid-cols-4 [role="button"]').first();
	await firstCategory.waitFor({ state: 'visible', timeout: 5000 });
	await firstCategory.click();
	await page.locator(`button:has-text("Save ${options.type}")`).click();
	// Wait for bottom sheet to close
	await page.waitForTimeout(400);
}

test.describe('Dashboard & Charts', () => {
	test.beforeEach(async ({ page }) => {
		page.on('console', (msg) => console.log('BROWSER_LOG:', msg.text()));
	});

	test('Dashboard loads with summary cards and empty states', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		// Month selector should be visible
		await expect(page.getByLabel('Previous month')).toBeVisible();
		await expect(page.getByLabel('Next month')).toBeVisible();

		// Summary labels should exist
		await expect(page.getByText('Income', { exact: true })).toBeVisible();
		await expect(page.getByText('Expenses', { exact: true })).toBeVisible();
		await expect(page.getByText('Balance', { exact: true })).toBeVisible();

		// Recent transactions empty state
		await expect(page.getByText('No transactions yet')).toBeVisible();
	});

	test('Summary cards update after adding an expense', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		// Add an expense
		await addTransaction(page, { type: 'expense', amount: '75000', name: 'Lunch' });

		// Navigate back to dashboard
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');
		await page.waitForTimeout(500);

		// Expense card should show Rp 75.000
		const expenseCard = page.locator('text=Rp 75.000');
		await expect(expenseCard.first()).toBeVisible();

		// Balance should show -Rp 75.000 (first match is the balance card)
		await expect(page.locator('text=-Rp 75.000').first()).toBeVisible();
	});

	test('Summary cards update after adding an income', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		// Add income
		await addTransaction(page, { type: 'income', amount: '2000000', name: 'Salary' });

		// Navigate back to dashboard
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');
		await page.waitForTimeout(500);

		// Income card should show the amount
		await expect(page.locator('text=Rp 2.000.000').first()).toBeVisible();
	});

	test('Dashboard focuses on snapshot and quick access to deeper pages', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		await expect(page.getByText('TODAY AT A GLANCE')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Manage history' })).toHaveAttribute(
			'href',
			'/transactions'
		);
		await expect(page.getByRole('link', { name: 'View trends' })).toHaveAttribute(
			'href',
			'/reports'
		);
	});

	test('Recent transactions show latest items with View All link', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		await addTransaction(page, { type: 'expense', amount: '25000', name: 'Bus Ticket' });

		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');
		await page.waitForTimeout(500);

		// Recent transactions header should exist
		await expect(page.locator('text=RECENT TRANSACTIONS')).toBeVisible();

		// The transaction should be listed
		await expect(page.locator('button:has-text("Bus Ticket")')).toBeVisible();

		// "View All" link should exist
		const viewAll = page.locator('a:has-text("View All")');
		await expect(viewAll).toBeVisible();
		await expect(viewAll).toHaveAttribute('href', '/transactions');
	});

	test('Month navigation changes displayed data', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		// Add an expense for the current month
		await addTransaction(page, { type: 'expense', amount: '30000', name: 'Snack' });

		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');
		await page.waitForTimeout(500);

		// Should see the expense
		await expect(page.locator('text=Rp 30.000').first()).toBeVisible();

		// Navigate to previous month
		await page.getByLabel('Previous month').click();
		await page.waitForTimeout(300);

		// Previous month should show no matching summary amount
		await expect(page.locator('text=Rp 30.000').first()).not.toBeVisible();

		// Navigate back to current month
		await page.getByLabel('Next month').click();
		await page.waitForTimeout(300);

		// Expense should be visible again
		await expect(page.locator('text=Rp 30.000').first()).toBeVisible();
	});

	test('Clicking a recent transaction opens options bottom sheet', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');

		await addTransaction(page, { type: 'expense', amount: '15000', name: 'Taxi' });

		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/');
		await page.waitForTimeout(500);

		// Click the transaction
		await page.locator('button:has-text("Taxi")').click();

		// Transaction options sheet should open
		await expect(page.locator('h2:has-text("Transaction Options")')).toBeVisible();
		await expect(page.locator('button:has-text("Edit Transaction")')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();
	});
});
