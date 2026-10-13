import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('tutorial, real orders, shared world/region state, and source access', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start match', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your first trail' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByRole('button', { name: 'Pause match' }).click();
  const before = await page.evaluate(() => JSON.stringify(window.__supercolony.getState()));
  await page.getByRole('button', { name: 'Zoom into California', exact: true }).click();
  await expect(page.getByRole('button', { name: 'World view', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'World view', exact: true }).click();
  expect(await page.evaluate(() => JSON.stringify(window.__supercolony.getState()))).toBe(before);
  await page.getByRole('button', { name: 'Resume match' }).click();
  await page.getByLabel('Source nest').selectOption('california-0');
  await page.getByLabel('Destination nest').selectOption('california-1');
  await page.getByRole('button', { name: 'Send swarm', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Swarm dispatched' })).toBeVisible();
  expect(await page.evaluate(() => window.__supercolony.getState().stats.orders)).toBeGreaterThan(0);
  await page.evaluate(() => window.__supercolony.advance(25));
  expect(await page.evaluate(() => window.__supercolony.getState().stats.captures)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Field guide', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Field guide' })).toBeVisible();
  expect(await page.evaluate(() => window.__supercolony.getState().status)).toBe('paused');
  await expect(page.getByRole('link', { name: /Read the research/ }).first()).toHaveAttribute('target', '_blank');
});

test('all modes, ecological actions, five-minute results and restart', async ({ page }) => {
  for (const mode of ['Supercolony War', 'Species Clash', 'Ecologist']) {
    await page.goto('/');
    await page.getByRole('button', { name: mode, exact: true }).click();
    if (mode === 'Species Clash') await page.getByRole('button', { name: 'Australian meat ant', exact: true }).click();
    await page.getByRole('button', { name: 'Start match', exact: true }).click();
    await page.getByRole('button', { name: 'Skip tutorial' }).click();
    if (mode === 'Ecologist') {
      await page.getByRole('button', { name: 'Restore habitat', exact: true }).click();
      expect(await page.evaluate(() => window.__supercolony.getState().charges)).toBe(2);
    }
    await page.evaluate(() => window.__supercolony.advance(300));
    await expect(page.getByRole('dialog', { name: 'Match results' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play again', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore further|Get involved/ }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Play again', exact: true }).click();
    expect(await page.evaluate(() => window.__supercolony.getState().time)).toBeLessThan(2);
  }
});

test('freely browsable resources, filtering, and external link semantics', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Learn & get involved', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Learn & get involved' })).toBeVisible();
  await page.getByLabel('Topic').selectOption('terrain');
  await expect(page.getByRole('link', { name: /Complex battlefields/ })).toBeVisible();
  const links = page.getByRole('dialog').locator('a');
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
  await page.getByLabel('Region').selectOption('newzealand');
  await expect(page.getByRole('link', { name: /Complex battlefields/ })).toBeVisible();
});

test('responsive layout, keyboard focus, reduced motion, and accessibility', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const menuA11y = await new AxeBuilder({ page }).analyze();
  expect(menuA11y.violations).toEqual([]);
  await page.getByRole('button', { name: 'Start match', exact: true }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByRole('button', { name: 'Pause match' }).click();
  for (const width of [1440, 768, 390, 320, 375, 414]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await expect(page.getByRole('button', { name: 'Send swarm', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `output/playwright/game-${width}.png`, fullPage: true });
  }
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
  const gameA11y = await new AxeBuilder({ page }).analyze();
  expect(gameA11y.violations).toEqual([]);
  expect(errors).toEqual([]);
});
