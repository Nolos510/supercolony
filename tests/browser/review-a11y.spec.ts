import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('match review is accessible, scrollable and preserves the simulation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start match', exact: true }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByRole('button', { name: 'SUPERColony game menu' }).click();
  await page.getByRole('button', { name: 'Review current match' }).click();
  const before = await page.evaluate(() => JSON.stringify(window.__supercolony.getState()));
  for (const width of [1440, 768, 390, 320, 375, 414]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    const audit = await new AxeBuilder({ page }).analyze();
    expect(audit.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `output/feedback/review-${width}.png` });
    await page.getByRole('button', { name: 'Continue match' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Continue match' })).toBeInViewport();
    await page.screenshot({ path: `output/feedback/review-actions-${width}.png` });
    expect(await page.evaluate(() => JSON.stringify(window.__supercolony.getState()))).toBe(before);
  }
  await page.getByRole('button', { name: 'Continue match' }).click();
  expect(await page.evaluate(() => window.__supercolony.getState().status)).toBe('running');
});
