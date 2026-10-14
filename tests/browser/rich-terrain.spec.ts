import { test, expect } from '@playwright/test';
import acceptance from '../../verification/visual-direction-acceptance.json' with { type: 'json' };

test('rich terrain is decoded in the actual game across all required layouts', async ({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Start match',exact:true}).click();
  await page.getByRole('button',{name:'Skip tutorial'}).click();
  await page.getByRole('button',{name:'Pause match',exact:true}).click();
  await page.getByLabel('Map view').selectOption('california');
  const before = await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()));
  for(const [width,height] of acceptance.viewports){
    await page.setViewportSize({width,height});
    await expect(page.locator('.terrain-plate')).toBeVisible();
    expect(await page.locator('.terrain-plate').evaluate((image: HTMLImageElement)=>image.complete && image.naturalWidth>=1024)).toBe(true);
    await expect(page.locator('.map-node-medallion').first()).toBeVisible();
    await expect(page.getByRole('button',{name:'Send swarm',exact:true})).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()))).toBe(before);
  }
  const source=await page.locator('.terrain-plate').getAttribute('src');
  await page.getByLabel('Map view').selectOption('hawaii');
  await expect(page.locator('.terrain-plate')).not.toHaveAttribute('src',source!);
  await page.getByLabel('Map view').selectOption('world');
  await expect(page.locator('.world-atlas-art')).toBeVisible();
  expect(await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()))).toBe(before);
});
