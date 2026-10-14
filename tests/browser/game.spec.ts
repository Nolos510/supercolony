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
  await page.getByText('Keyboard orders', { exact: true }).click();
  await page.getByLabel('Source nest').selectOption('california-0');
  await page.getByLabel('Destination nest').selectOption('california-4');
  await page.getByRole('button', { name: 'Send swarm', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Swarm dispatched' })).toBeVisible();
  expect(await page.evaluate(() => window.__supercolony.getState().stats.orders)).toBeGreaterThan(0);
  await page.evaluate(() => window.__supercolony.advance(25));
  expect(await page.evaluate(() => window.__supercolony.getState().stats.captures)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Learn', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Field guide' })).toBeVisible();
  expect(await page.evaluate(() => window.__supercolony.getState().status)).toBe('paused');
  await page.getByRole('button', { name: /One colony, many nests/ }).click();
  await expect(page.getByRole('link', { name: /Read the research/ }).first()).toHaveAttribute('target', '_blank');
});

test('untimed combat, review explanations, ecological results and restart', async ({ page }) => {
  for (const mode of ['Supercolony War', 'Species Clash', 'Ecologist']) {
    await page.goto('/');
    await page.getByRole('button', { name: mode, exact: true }).click();
    if (mode === 'Species Clash') await page.getByRole('button', { name: 'Australian meat ant', exact: true }).click();
    await page.getByRole('button', { name: 'Start match', exact: true }).click();
    await page.getByRole('button', { name: 'Skip tutorial' }).click();
    if (mode === 'Ecologist') {
      await page.getByRole('button', { name: 'Nest details', exact: true }).click();
      await page.getByRole('button', { name: 'Free fieldwork', exact: true }).click();
      await page.getByRole('button', { name: 'Restore habitat', exact: true }).click();
      expect(await page.evaluate(() => window.__supercolony.getState().charges)).toBe(2);
    }
    if (mode !== 'Ecologist') {
      await page.evaluate(() => { const s = window.__supercolony.getState(); s.aiEnabled = false; s.nodes.forEach((n, i) => { n.owner = i < Math.ceil(s.nodes.length * .7) ? 'rival' : 'player'; }); window.__supercolony.advance(900); });
      expect(await page.evaluate(() => window.__supercolony.getState().status)).toBe('running');
      await expect(page.getByText('No time limit', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'SUPERColony game menu', exact: true }).click();
      await page.getByRole('button', { name: 'Review current match', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Match review' })).toBeVisible();
      await expect(page.getByText('Capture events', { exact: true })).toBeVisible();
      await expect(page.getByText('Topics encountered', { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: /Compare Argentine-ant specimens/ })).toHaveAttribute('href', /antweb/);
      await page.getByRole('button', { name: 'Continue match', exact: true }).click();
      expect(await page.evaluate(() => window.__supercolony.getState().status)).toBe('running');
      await page.evaluate(() => { window.__supercolony.getState().nodes.forEach(n => { n.owner = 'player'; }); window.__supercolony.getState().fleets = []; window.__supercolony.advance(1); });
    } else await page.evaluate(() => window.__supercolony.advance(300));
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
  await page.getByRole('button', { name: 'Filter resources', exact: true }).click();
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


test('South America shows native-range context and shares world nest state', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Start match', exact: true }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.getByRole('button', { name: 'Pause match' }).click();
  const before = await page.evaluate(() => JSON.stringify(window.__supercolony.getState()));
  await page.getByRole('button', { name: 'Zoom into South America', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Paraná basin · native range' })).toBeVisible();
  await expect(page.locator('.map-node')).toHaveCount(6);
  await page.getByRole('button', { name: 'World view', exact: true }).click();
  expect(await page.evaluate(() => JSON.stringify(window.__supercolony.getState()))).toBe(before);
});
