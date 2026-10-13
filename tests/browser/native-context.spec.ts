import { test, expect } from '@playwright/test';

test('native South America is educational in Ecologist and its mobile return action works', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Ecologist', exact: true }).click();
  await page.getByRole('button', { name: 'Start match', exact: true }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByLabel('Map view').selectOption('southamerica');
  await expect(page.locator('.map-node')).toHaveCount(0);
  expect(await page.evaluate(() => window.__supercolony.getState().nodes.length)).toBe(42);
  await page.getByRole('button', { name: 'Return to the habitat survey' }).click();
  await expect(page.locator('.map-node')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
