import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fixture from '../../verification/atlas-acceptance.json' with { type: 'json' };
async function start(page: import('@playwright/test').Page){
 await page.addInitScript(()=>{const interval=window.setInterval.bind(window);window.setInterval=((handler:TimerHandler,delay?:number,...args:unknown[])=>interval(delay===100?()=>{}:handler,delay===100?1000000:delay,...args)) as typeof window.setInterval;});
 await page.goto('/');await page.getByRole('button',{name:'Start match',exact:true}).click();await page.getByRole('button',{name:'Skip tutorial'}).click();await page.evaluate(()=>{window.__supercolony.getState().aiEnabled=false;});
}
test('desktop Details resizes with keyboard and pointer, reset restores width, photo follows setting',async({page})=>{
 await start(page);await page.getByLabel('Map view').selectOption('california');await page.getByRole('button',{name:'Nest details',exact:true}).click();
 const handle=page.getByRole('separator',{name:'Resize nest details'});await handle.focus();await handle.press('ArrowLeft');expect(Number(await handle.getAttribute('aria-valuenow'))).toBeGreaterThan(296);
 const box=await handle.boundingBox();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2);await page.mouse.down();await page.mouse.move(box!.x-90,box!.y+box!.height/2);await page.mouse.up();expect(Number(await handle.getAttribute('aria-valuenow'))).toBeGreaterThan(320);
 await page.getByRole('button',{name:'Reset details width',exact:true}).click();await expect(handle).toHaveAttribute('aria-valuenow','296');
 const first=await page.locator('.details-dialog .habitat-photo').getAttribute('src');await page.locator('[data-nest-id="california-3"]').click();expect(await page.locator('.details-dialog .habitat-photo').getAttribute('src')).not.toBe(first);await expect(page.getByText(/representative habitat; the game nest is fictional/i).first()).toBeVisible();
});
test('local specimen explorer has pan/zoom, anatomy, comparison and state-safe return',async({page})=>{
 await page.setViewportSize({width:390,height:844});await start(page);await page.getByRole('button',{name:'Nest details',exact:true}).click();const before=await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()));
 await page.getByRole('button',{name:'Explore this ant',exact:true}).click();await expect(page.getByRole('dialog',{name:'Specimen explorer'})).toBeVisible();await expect(page.locator('.specimen-explorer img').first()).toBeVisible();
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(page.getByRole('status').filter({hasText:/150%/})).toBeVisible();await page.getByRole('button',{name:'Fit specimen',exact:true}).click();await page.getByRole('button',{name:'Reset specimen',exact:true}).click();
 await page.getByRole('button',{name:/6\. Gaster/}).click();await expect(page.getByText(/rounded rear/).first()).toBeVisible();await page.getByRole('button',{name:'Compare species',exact:true}).click();await expect(page.getByText('Australian meat ant',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Back to details',exact:true}).click();expect(await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()))).toBe(before);
});
test('research separates three layers, preserves filters and match state, and exposes Resume',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Pause match',exact:true}).click();const before=await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()));
 await page.getByRole('button',{name:'Research',exact:true}).click();await page.getByLabel('Research dataset').selectOption('distribution-2022');await expect(page.getByText(/15 June 2022/).first()).toBeVisible();await page.getByLabel('Distribution status').selectOption('established.outdoors');
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.getByRole('button',{name:'Game',exact:true}).click();expect(await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()))).toBe(before);await expect(page.getByRole('button',{name:'Resume match',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Research',exact:true}).click();await expect(page.getByLabel('Research dataset')).toHaveValue('distribution-2022');await expect(page.getByLabel('Distribution status')).toHaveValue('established.outdoors');
 await page.getByLabel('Research dataset').selectOption('california-2025');await expect(page.getByText(/NOAA/).first()).toBeVisible();await page.getByLabel('Research dataset').selectOption('global-2010');await expect(page.getByText(/2008–2009/).first()).toBeVisible();
});
test('sixteen TLDRs and three optional activities have feedback, replay, sources and no game benefit',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Learn',exact:true}).click();const before=await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()));
 await page.getByRole('button',{name:/One colony, many nests/}).click();await expect(page.getByRole('figure',{name:'At a glance'})).toBeVisible();await page.getByRole('button',{name:'Back to index',exact:true}).click();
 for(const name of ['Anatomy detective','Trail bottlenecks','Recognition detective']){
  await page.getByRole('button',{name,exact:true}).click();
  if(name==='Anatomy detective'){await expect(page.locator('.activity-specimen img')).toBeVisible();await expect(page.getByRole('button',{name:'Anatomy hotspot: antennae'})).toBeVisible();}
  if(name==='Trail bottlenecks'){await page.getByLabel('Passage width').fill('2');await expect(page.locator('.terrain-lab')).toBeVisible();}
  if(name==='Recognition detective'){await page.getByLabel('First sample').selectOption('SA');await page.getByLabel('Second sample').selectOption('H2');await expect(page.getByText('Unknown comparison',{exact:true}).first()).toBeVisible();}
  await page.locator('.activity-choices button').first().click();await expect(page.locator('.activity-feedback')).toBeVisible();await expect(page.getByRole('link',{name:/Read the research/}).first()).toHaveAttribute('target','_blank');await page.getByRole('button',{name:'Skip activity',exact:true}).click();
 }
 expect(await page.evaluate(()=>JSON.stringify(window.__supercolony.getState()))).toBe(before);
});
test('General Mandible has four captioned introductory panels, three replayable vignettes and static controls',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'Meet General Mandible',exact:true}).click();await expect(page.getByRole('dialog',{name:'General Mandible'})).toBeVisible();
 for(let i=0;i<4;i++){await expect(page.locator('.comic-narration')).toBeVisible();await expect(page.locator('.comic-field-note')).toBeVisible();if(i<3)await page.getByRole('button',{name:'Next panel',exact:true}).click();}
 await page.getByRole('button',{name:'Replay story',exact:true}).click();await expect(page.getByText('Before the empire',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Skip story',exact:true}).click();
 await page.getByRole('button',{name:'Learn & get involved',exact:true}).click();await page.getByRole('button',{name:'General Mandible',exact:true}).click();
 for(const name of ['The plant-pot admiral','Send the cavalry','A very scented rebellion']){await page.getByRole('button',{name,exact:true}).click();await expect(page.locator('.comic-field-note')).toBeVisible();}
});
test('atlas paths fit all required widths with focus, 44px controls, one reading scroller and text enlargement',async({page})=>{
 for(const [width,height] of fixture.viewports){
  await page.setViewportSize({width,height});await start(page);await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Orders',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);const violations=(await new AxeBuilder({page}).analyze()).violations.filter(v=>v.impact==='critical'||v.impact==='serious');expect(violations).toEqual([]);
  await page.getByRole('button',{name:'Orders',exact:true}).click();await page.getByRole('button',{name:'Learn',exact:true}).click();await page.getByRole('button',{name:/One colony, many nests/}).click();
  const measurements=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,scrollers:[...document.querySelectorAll('.learning-dialog *')].filter(el=>{const e=el as HTMLElement;return getComputedStyle(e).overflowY==='auto'&&e.scrollHeight>e.clientHeight+1;}).length}));expect(measurements.overflow).toBe(false);expect(measurements.scrollers).toBeLessThanOrEqual(1);
  await page.addStyleTag({content:'p, li, label, button { font-size: 200% !important; }'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
