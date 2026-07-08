import { test, expect } from '@playwright/test';

test.describe('Transaction CRUD & IndexedDB', () => {
	test.beforeEach(async ({ page }) => {
		page.on('console', (msg) => console.log('BROWSER_LOG:', msg.text()));
	});

	test('Happy Path: Add an expense and verify it appears in history', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/transactions');
		await page.getByRole('button', { name: 'Add Transaction' }).click();

		// Make sure we are on the expense tab
		await page.getByRole('button', { name: 'Expense', exact: true }).click();

		// Fill in amount and item name
		await page.fill('input[inputmode="numeric"]', '50000');
		await page.fill('input[type="text"]:not([inputmode="numeric"])', 'Nasi Goreng');

		// Click on the first category (Food & Dining should be seeded)
		// The button contains the icon and name, we can select the first button in the grid
		const firstCategory = page.locator('.grid [role="button"]').first();
		await firstCategory.waitFor({ state: 'visible' });
		await firstCategory.click();

		// Click Save
		await page.locator('button:has-text("Save expense")').click();

		// Should close the modal and we are still on History
		// Wait for the item to appear
		const txItem = page.locator('button:has-text("Nasi Goreng")');
		await expect(txItem).toBeVisible();

		// Check amount formatting (Indonesian Rupiah)
		const amountText = await txItem.textContent();
		expect(amountText).toContain('50.000');
		expect(amountText).toContain('-'); // Expense should be negative
	});

	test('Happy Path: Add an income and verify it appears in history', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/transactions');
		await page.getByRole('button', { name: 'Add Transaction' }).click();

		// Switch to Income tab
		await page.getByRole('button', { name: 'Income', exact: true }).click();

		// Wait for categories to swap (Income categories)
		await page.waitForTimeout(300);

		// Fill in amount and item name
		await page.fill('input[inputmode="numeric"]', '1000000');
		await page.fill('input[type="text"]:not([inputmode="numeric"])', 'Gaji');

		// Click on the first category (Salary)
		const firstCategory = page.locator('.grid [role="button"]').first();
		await firstCategory.waitFor({ state: 'visible' });
		await firstCategory.click();

		// Click Save
		await page.locator('button:has-text("Save income")').click();

		// Wait for the item to appear
		const txItem = page.locator('button:has-text("Gaji")');
		await expect(txItem).toBeVisible();

		// Check amount formatting
		const amountText = await txItem.textContent();
		expect(amountText).toContain('1.000.000');
		expect(amountText).toContain('+'); // Income should be positive
	});

	test('Sad Path: Cannot save transaction with zero or empty amount', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/transactions');
		await page.getByRole('button', { name: 'Add Transaction' }).click();

		// Attempt to save without filling anything
		await page.locator('button:has-text("Save expense")').click();

		// Check if the error appeared (use first() in case multiple toasts stack up)
		const errorMessage = page.locator('text="Please enter a valid amount greater than 0."').first();
		await expect(errorMessage).toBeVisible();

		// We should still be on the form modal
		await expect(page.locator('h2:has-text("New Transaction")')).toBeVisible();

		// Try typing non-digits and negative signs to verify sanitization
		await page.fill('input[inputmode="numeric"]', '-500abc');
		await expect(page.locator('input[inputmode="numeric"]')).toHaveValue('500');
	});

	test('Edge Case: Filtering transactions by type', async ({ page }) => {
		// We need to add one expense and one income first
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/transactions');

		await page.getByRole('button', { name: 'Add Transaction' }).click();
		await page.getByRole('button', { name: 'Expense', exact: true }).click();
		await page.fill('input[inputmode="numeric"]', '10000');
		await page.fill('input[type="text"]:not([inputmode="numeric"])', 'Kopi');
		const expCategory = page.locator('.grid [role="button"]').first();
		await expCategory.waitFor({ state: 'visible' });
		await expCategory.click();
		await page.locator('button:has-text("Save expense")').click();

		await page.getByRole('button', { name: 'Add Transaction' }).click();
		await page.getByRole('button', { name: 'Income', exact: true }).click();
		await page.waitForTimeout(300);
		await page.fill('input[inputmode="numeric"]', '50000');
		await page.fill('input[type="text"]:not([inputmode="numeric"])', 'Bonus');
		const incCategory = page.locator('.grid [role="button"]').first();
		await incCategory.waitFor({ state: 'visible' });
		await incCategory.click();
		await page.locator('button:has-text("Save income")').click();

		// Both should be visible initially (All Types)
		await expect(page.locator('button:has-text("Kopi")')).toBeVisible();
		await expect(page.locator('button:has-text("Bonus")')).toBeVisible();

		// Change filter to Expenses
		await page.locator('select').first().selectOption('expense');
		await expect(page.locator('button:has-text("Kopi")')).toBeVisible();
		await expect(page.locator('button:has-text("Bonus")')).not.toBeVisible();

		// Change filter to Income
		await page.locator('select').first().selectOption('income');
		await expect(page.locator('button:has-text("Kopi")')).not.toBeVisible();
		await expect(page.locator('button:has-text("Bonus")')).toBeVisible();
	});

	test('Update (Edit): Can edit an existing transaction', async ({ page }) => {
		// Add a transaction to edit
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/transactions');
		await page.getByRole('button', { name: 'Add Transaction' }).click();
		await page.getByRole('button', { name: 'Expense', exact: true }).click();
		await page.fill('input[inputmode="numeric"]', '20000');
		await page.fill('input[type="text"]:not([inputmode="numeric"])', 'Old Item');
		const firstCategory = page.locator('.grid [role="button"]').first();
		await firstCategory.waitFor({ state: 'visible' });
		await firstCategory.click();
		await page.locator('button:has-text("Save expense")').click();

		// Click the transaction to open the Action BottomSheet
		await page.locator('button:has-text("Old Item")').click();

		// Click Edit in the BottomSheet (opens the form BottomSheet)
		await page.locator('button:has-text("Edit Transaction")').click();

		// Ensure we are now viewing the form
		await expect(page.locator('h2:has-text("Edit Transaction")')).toBeVisible();

		// Verify existing data is populated
		await expect(page.locator('input[inputmode="numeric"]')).toHaveValue('20.000');
		await expect(page.locator('input[type="text"]:not([inputmode="numeric"])')).toHaveValue('Old Item');

		// Edit the data
		await page.fill('input[inputmode="numeric"]', '35000');
		await page.fill('input[type="text"]:not([inputmode="numeric"])', 'Updated Item');

		// Save
		await page.locator('button:has-text("Update expense")').click();

		// Verify it updated in history (sheet should close)
		await expect(page.locator('h2:has-text("Edit Transaction")')).not.toBeVisible();

		const txItem = page.locator('button:has-text("Updated Item")');
		await expect(txItem).toBeVisible();
		const amountText = await txItem.textContent();
		expect(amountText).toContain('35.000');
	});

	test('Delete: Can delete an existing transaction', async ({ page }) => {
		// Add a transaction to delete
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/transactions');
		await page.getByRole('button', { name: 'Add Transaction' }).click();
		await page.getByRole('button', { name: 'Expense', exact: true }).click();
		await page.fill('input[inputmode="numeric"]', '99999');
		await page.fill('input[type="text"]:not([inputmode="numeric"])', 'To Be Deleted');
		const firstCategory = page.locator('.grid [role="button"]').first();
		await firstCategory.waitFor({ state: 'visible' });
		await firstCategory.click();
		await page.locator('button:has-text("Save expense")').click();

		// Verify it's there
		const item = page.locator('button:has-text("To Be Deleted")');
		await expect(item).toBeVisible();

		// Click to open BottomSheet
		await item.click();

		// Click Delete in Action sheet
		await page.getByRole('button', { name: 'Delete', exact: true }).click();

		// Wait for the Confirm Dialog to appear and click Delete there
		const confirmModalDeleteBtn = page.locator(
			'.fixed.inset-0.z-60 button:has-text("Delete")'
		);
		await confirmModalDeleteBtn.click();

		// Verify it is removed
		await expect(item).not.toBeVisible();
	});

	test('Categories: Can create a new custom category and use it', async ({ page }) => {
		await page.addInitScript(() => window.localStorage.setItem('initial_setup_completed', 'true'));
		await page.goto('/transactions');
		await page.getByRole('button', { name: 'Add Transaction' }).click();
		await page.getByRole('button', { name: 'Expense', exact: true }).click();

		// Click 'Add New' category button directly (it's permanently visible now)
		await page.getByRole('button', { name: 'Add New' }).click();

		// The category input is inside the grid
		await page.locator('.grid input[type="text"]').fill('Gaming');
		await page.keyboard.press('Enter');

		// Wait a moment for indexedDB to update and input to disappear
		await page.waitForTimeout(100);

		// Click on the newly created 'Gaming' category
		const gamingCategory = page.locator('.grid [role="button"]:has-text("Gaming")');
		await gamingCategory.waitFor({ state: 'visible' });
		await gamingCategory.click();

		// Fill in amount to save transaction
		await page.fill('input[inputmode="numeric"]', '600000');
		await page.fill('input[type="text"]:not([inputmode="numeric"])', 'Steam Game');

		await page.locator('button:has-text("Save expense")').click();

		// Verify it appears in the list
		const item = page.locator('button:has-text("Steam Game")');
		await expect(item).toBeVisible();
	});
});
