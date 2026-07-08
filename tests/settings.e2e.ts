import { test, expect } from '@playwright/test';

test.describe('Settings & PIN Lock', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    await page.goto('/settings');
  });

  test('can set and remove a 6-digit PIN', async ({ page }) => {
    await page.goto('/settings');
    
    // Setup PIN
    await page.getByRole('button', { name: 'Set PIN' }).click();
    await expect(page.getByText('Create 6-digit PIN')).toBeVisible();
    await page.waitForTimeout(1000); // Wait for BottomSheet to finish sliding up
    
    // Type 123456
    for (let i = 1; i <= 6; i++) {
      await page.getByRole('button', { name: i.toString(), exact: true }).evaluate(b => {
        console.log('Test clicking button', b.innerText);
        b.click();
      });
    }
    await expect(page.getByText('Confirm new PIN')).toBeVisible();
    await page.waitForTimeout(500); // Wait for state change
    
    // Confirm 123456
    for (let i = 1; i <= 6; i++) {
      await page.getByRole('button', { name: i.toString(), exact: true }).evaluate(b => {
        console.log('Test clicking button', b.innerText);
        b.click();
      });
    }

    // Should be back to settings and show Enabled
    await expect(page.getByText('Enabled')).toBeVisible();

    // Remove PIN
    await page.getByRole('button', { name: 'Remove PIN' }).click();
    await expect(page.getByText('Enter current PIN')).toBeVisible();
    await page.waitForTimeout(1000); // Wait for BottomSheet to finish sliding up
    
    // Verify correct PIN during removal
    for (let i = 1; i <= 6; i++) {
      await page.getByRole('button', { name: i.toString(), exact: true }).evaluate(b => {
        console.log('Test clicking button', b.innerText);
        b.click();
      });
    }
    
    await page.waitForTimeout(1000); // Wait for processing
    await page.screenshot({ path: 'scratch/debug_remove_pin.png', fullPage: true });

    await expect(page.getByText('Disabled')).toBeVisible();
  });

  test('edge case: locking on visibility change', async ({ page }) => {
    await page.goto('/settings');
    
    // Setup a PIN first
    await page.getByRole('button', { name: 'Set PIN' }).click();
    await expect(page.getByText('Create 6-digit PIN')).toBeVisible();
    await page.waitForTimeout(1000); // Wait for BottomSheet
    
    for (let i = 1; i <= 6; i++) {
      await page.getByRole('button', { name: '1', exact: true }).evaluate(b => b.click());
    }
    await expect(page.getByText('Confirm new PIN')).toBeVisible();
    await page.waitForTimeout(500);
    
    for (let i = 1; i <= 6; i++) {
      await page.getByRole('button', { name: '1', exact: true }).evaluate(b => b.click());
    }
    await expect(page.getByText('Enabled')).toBeVisible();

    // Trigger visibility hidden (or whatever to lock it)
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true });
      Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Modal should appear
    await expect(page.getByText('Unlock Expense Tracker')).toBeVisible();
    await page.waitForTimeout(1000); // Wait for fade in
    
    // Unlock
    for (let i = 1; i <= 6; i++) {
      await page.getByRole('button', { name: '1', exact: true }).evaluate(b => b.click());
    }
    
    // Should be back to settings
    await expect(page.getByText('Unlock Expense Tracker')).not.toBeVisible();
  });

  test('can open category management', async ({ page }) => {
    await page.getByRole('button', { name: 'Manage Categories' }).click();
    await expect(page.getByRole('heading', { name: 'Manage Categories' })).toBeVisible();
    
    // Should render expense and income sections
    await expect(page.getByText('Expenses', { exact: true })).toBeVisible();
    await expect(page.getByText('Income', { exact: true })).toBeVisible();
  });
});
