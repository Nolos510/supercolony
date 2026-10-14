import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function start(page: import('@playwright/test').Page) {
  await page.goto('/'); await page.getByRole('button', { name: 'Start match', exact: true }).click();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await page.evaluate(() => { window.__supercolony.getState().aiEnabled = false; });
}
test('visible match menu confirms restart and exit without silently replacing a match', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await start(page);
  await page.getByRole('button', { name: 'SUPERColony game menu' }).click();
  await page.getByRole('button', { name: 'Restart match', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Resume match', exact: true }).click();
  await page.getByRole('button', { name: 'SUPERColony game menu' }).click();
  await page.getByRole('button', { name: 'Restart match', exact: true }).click();
  await page.getByRole('button', { name: 'Restart now', exact: true }).click();
  expect(await page.evaluate(() => window.__supercolony.getState().time)).toBeLessThan(2);
  await page.getByRole('button', { name: 'SUPERColony game menu' }).click();
  await page.getByRole('button', { name: 'Exit to home', exact: true }).click();
  await page.getByRole('button', { name: 'Exit match', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start match', exact: true })).toBeVisible();
});
test('drag collects owned sources, previews a destination, and cancels outside drops', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await start(page);
  await page.getByLabel('Map view').selectOption('california');
  const a = page.locator('[data-nest-id="california-0"]'), b = page.locator('[data-nest-id="california-3"]'), target = page.locator('[data-nest-id="california-4"]');
  const center = async (n: typeof a) => { const r = (await n.boundingBox())!; return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; };
  const p = await center(a), q = await center(b), t = await center(target);
  await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(q.x, q.y, { steps: 8 });
  await expect(b).toHaveAttribute('aria-pressed', 'true');
  await page.mouse.move(t.x, t.y, { steps: 8 }); await expect(page.getByText(/Capture.*Leaf-litter|Attack.*Leaf-litter/).first()).toBeVisible();
  await page.mouse.up(); expect(await page.evaluate(() => window.__supercolony.getState().stats.orders)).toBe(2);
  const before = await page.evaluate(() => window.__supercolony.getState().stats.orders);
  await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(4, 4, { steps: 8 }); await page.mouse.up();
  expect(await page.evaluate(() => window.__supercolony.getState().stats.orders)).toBe(before);
  await a.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: p.x, clientY: p.y, buttons: 1 });
  await a.dispatchEvent('pointermove', { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: t.x, clientY: t.y, buttons: 1 });
  await a.dispatchEvent('pointercancel', { pointerId: 7, pointerType: 'touch' });
  expect(await page.evaluate(() => window.__supercolony.getState().stats.orders)).toBe(before);
});
test('research, cooperation walkthrough, and real specimens preserve a paused match', async ({ page }) => {
  await start(page); await page.getByRole('button', { name: 'Pause match', exact: true }).click();
  await page.getByLabel('Map view').selectOption('california');
  await page.locator('[data-nest-id="california-1"]').click();
  await expect(page.getByRole('dialog', { name: 'Cooperation walkthrough' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Read the research/ })).toHaveAttribute('target', '_blank');
  await page.getByRole('button', { name: 'Skip walkthrough', exact: true }).click();
  const before = await page.evaluate(() => JSON.stringify(window.__supercolony.getState()));
  await page.getByRole('button', { name: 'Research', exact: true }).click();
  await expect(page.getByText('2008–2009', { exact: false }).first()).toBeVisible();
  await page.getByLabel('Research dataset').selectOption('california-resurvey');
  await expect(page.getByText(/2022–2024/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Game', exact: true }).click();
  expect(await page.evaluate(() => JSON.stringify(window.__supercolony.getState()))).toBe(before);
  await page.getByRole('button', { name: 'Learn', exact: true }).click();
  await page.getByRole('button', { name: 'Species', exact: true }).click();
  await page.getByRole('button', { name: /Argentine ant/ }).first().click();
  await expect(page.getByRole('link', { name: /Explore a real specimen/ }).first()).toHaveAttribute('href', 'https://biomedisa.info/antscan/specimen/1040/');
  await expect(page.locator('img.specimen-photo').first()).toBeVisible();
  const audit = await new AxeBuilder({ page }).analyze(); expect(audit.violations).toEqual([]);
});
test('phone portrait and short landscape keep primary controls inside the viewport', async ({ page }) => {
  await start(page); await page.getByRole('button', { name: 'Pause match', exact: true }).click();
  for (const [width, height] of [[320, 568], [375, 667], [390, 844], [414, 896], [844, 390], [768, 1024], [1440, 1000]]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole('button', { name: 'SUPERColony game menu' })).toBeInViewport();
    await expect(page.getByRole('button', { name: '50%', exact: true })).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Send swarm', exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `output/mobile-atlas/game-${width}-${height}.png` });
  }
});
