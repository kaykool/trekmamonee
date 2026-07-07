import { test, expect } from '@playwright/test';

test.describe('App Layout Shell', () => {
  test('should display correct title and navigation works', async ({ page }) => {
    await page.goto('/');

    // Check initial title on Dashboard
    const headerTitle = page.locator('header h1');
    await expect(headerTitle).toHaveText('Dashboard');

    // Click Transactions tab in bottom nav
    await page.locator('nav button:has-text("History")').click();
    await page.waitForURL('**/transactions');
    await expect(headerTitle).toHaveText('Transactions');

    // Click Add Transaction FAB
    await page.locator('button[aria-label="Add Transaction"]').click();
    await page.waitForURL('**/transactions/add');
    await expect(headerTitle).toHaveText('Add Transaction');

    // Click Reports tab
    await page.locator('nav button:has-text("Reports")').click();
    await page.waitForURL('**/reports');
    await expect(headerTitle).toHaveText('Reports');

    // Click Settings tab
    await page.locator('nav button:has-text("Settings")').click();
    await page.waitForURL('**/settings');
    await expect(headerTitle).toHaveText('Settings');
  });

  test('theme toggle should change element background color', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const body = page.locator('body');
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    
    // Ensure we start in a known state (light mode)
    const isDarkInitially = await html.evaluate((el) => el.classList.contains('dark'));
    if (isDarkInitially) {
      await themeToggle.click();
      await expect(html).not.toHaveClass(/dark/);
    }
    
    // Give it a moment for CSS transitions if any
    await page.waitForTimeout(300);

    // Get the initial light mode background color of the body
    const lightBgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    
    // Toggle theme to dark
    await themeToggle.click();
    await expect(html).toHaveClass(/dark/);
    
    await page.waitForTimeout(300);
    
    // Get the new dark mode background color
    const darkBgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    
    // Assert that the color actually changed visually
    expect(darkBgColor).not.toBe(lightBgColor);
    
    // Toggle back to light
    await themeToggle.click();
    await expect(html).not.toHaveClass(/dark/);
    
    await page.waitForTimeout(300);
    
    // Get the restored light mode background color
    const restoredBgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    
    // Assert it returns to the original color
    expect(restoredBgColor).toBe(lightBgColor);
  });
});
