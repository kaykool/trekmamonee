import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  await page.goto('http://localhost:5173/settings');
  await page.waitForLoadState('networkidle');
  
  // Click Set PIN
  await page.getByRole('button', { name: 'Set PIN' }).click();
  
  // Wait for 2 seconds
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'C:\\Users\\se\\.gemini\\antigravity-ide\\brain\\ef1c46d5-93a7-40cd-892f-9a1bd4a5cb93\\scratch\\debug_playwright_viewport.png', fullPage: true });
  
  await browser.close();
})();
