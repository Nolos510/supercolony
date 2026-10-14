import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function start(page: import('@playwright/test').Page,mode='Supercolony War',species='Argentine ant'){
 await page.addInitScript(()=>{const interval=window.setInterval.bind(window);window.setInterval=((handler: TimerHandler,delay?: number,...args: unknown[])=>interval(delay===100?()=>{}:handler,delay===100?1000000:delay,...args)) as typeof window.setInterval;});
 await page.goto('/');await page.getByRole('button',{name:mode,exact:true}).click();if(mode==='Species Clash')await page.getByRole('button',{name:species,exact:true}).click();await page.getByRole('button',{name:'Start match',exact:true}).click();await page.getByRole('button',{name:'Skip tutorial'}).click();await page.evaluate(()=>{window.__supercolony.getState().aiEnabled=false;});
}
test('compact panels expose obvious toggles and desktop Details does not pause',async({page})=>{
 await start(page);const details=page.getByRole('button',{name:'Nest details',exact:true}),orders=page.getByRole('button',{name:'Orders',exact:true});
 await expect(details).toHaveAttribute('aria-expanded','false');await expect(orders).toHaveAttribute('aria-expanded','false');await expect(page.getByRole('button',{name:'Send swarm',exact:true})).toBeVisible();
 await details.click();expect(await page.evaluate(()=>window.__supercolony.getState().status)).toBe('running');await expect(page.getByText('Base game growth',{exact:true})).toBeVisible();await expect(page.getByText('0.95',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Hide details',exact:true}).click();await expect(details).toHaveAttribute('aria-expanded','false');await orders.click();await expect(orders).toHaveAttribute('aria-expanded','true');await expect(page.getByRole('button',{name:'Select region',exact:true})).toBeVisible();await orders.click();await expect(orders).toHaveAttribute('aria-expanded','false');
});
test('regional selection sends directly overseas and one-click rally conserves reserves',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Orders',exact:true}).click();await page.getByRole('button',{name:'Select region',exact:true}).click();await expect(page.getByRole('button',{name:'Choose sources (2)',exact:true})).toBeVisible();
 await page.getByText('Keyboard orders',{exact:true}).click();await page.getByLabel('Destination nest').selectOption('mediterranean-0');await page.getByRole('button',{name:'Send swarms',exact:true}).click();
 const direct=await page.evaluate(()=>window.__supercolony.getState().fleets.filter(f=>f.owner==='player'));expect(direct).toHaveLength(2);expect(direct.every(f=>f.path.at(-1)==='mediterranean-0')).toBe(true);expect(direct.some(f=>f.path[0]==='california-3'&&f.path.includes('california-0'))).toBe(true);
 await start(page);await page.getByRole('button',{name:'Orders',exact:true}).click();await page.getByRole('button',{name:/Rally to gateway/}).click();const s=await page.evaluate(()=>window.__supercolony.getState());expect(s.fleets).toHaveLength(1);expect(s.fleets[0].units).toBe(15);expect(s.fleets[0].path.at(-1)).toBe('california-0');expect(s.nodes.find(n=>n.id==='california-0')!.units).toBe(66);
});
test('automatic rally has its own exact batches and survives zoom but stops on gateway loss',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Orders',exact:true}).click();await page.getByRole('checkbox',{name:'Auto rally',exact:true}).check();await page.evaluate(()=>window.__supercolony.advance(1));
 let s=await page.evaluate(()=>window.__supercolony.getState());expect(s.stats.automaticRallyWorkers).toBe(10);expect(s.stats.orders).toBe(0);expect(s.fleets[0].units).toBe(10);
 await page.getByLabel('Map view').selectOption('california');await expect(page.getByRole('checkbox',{name:'Auto rally',exact:true})).toBeChecked();
 await page.evaluate(()=>{window.__supercolony.getState().nodes.find(n=>n.id==='california-0')!.owner='rival';window.__supercolony.advance(.1);});await expect(page.getByRole('checkbox',{name:'Auto rally',exact:true})).not.toBeChecked();s=await page.evaluate(()=>window.__supercolony.getState());expect(s.autoRally.california).toBeFalsy();
});
test('foraging development works for both species and exposes its game-growth explanation',async({page})=>{
 for(const species of ['Argentine ant','Australian meat ant']){
  await start(page,'Species Clash',species);await page.evaluate(()=>{window.__supercolony.pause(true);window.__supercolony.getState().nodes.find(n=>n.id==='australia-0')!.units=40;window.__supercolony.pause(false);});
  await page.getByRole('button',{name:'Nest details',exact:true}).click();await page.getByRole('button',{name:'Improve foraging network',exact:true}).click();expect(await page.evaluate(()=>window.__supercolony.getState().stats.developmentWorkers)).toBe(30);
  await expect(page.getByText(/20.*game seconds|20s remaining/).first()).toBeVisible();await page.evaluate(()=>window.__supercolony.advance(20));await expect(page.getByText('Foraging network active',{exact:true})).toBeVisible();await expect(page.getByText(/not a measured birth rate/).first()).toBeVisible();
  expect(await page.evaluate(()=>window.__supercolony.getState().developments.australia.readyAt)).toBe(20);
 }
});
test('every region offers credited open and complex photographs in one reading scroller',async({page})=>{
 await page.setViewportSize({width:390,height:844});await start(page);await page.getByRole('button',{name:'Learn',exact:true}).click();await page.getByRole('button',{name:'Regions',exact:true}).click();
 for(const name of ['Coastal California','Mediterranean coast','Southern Japan','Southern Africa','Southern Australia','Northern New Zealand','Hawaiian Islands','Paraná basin · native range']){
  await page.getByRole('button',{name,exact:true}).click();for(const terrain of ['Open habitat','Complex habitat']){await page.getByRole('button',{name:terrain,exact:true}).click();const photo=page.locator('img.habitat-photo');await photo.evaluate((img:HTMLImageElement)=>img.decode());expect(await photo.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(600);await expect(page.getByRole('link',{name:/Habitat photograph source/})).toHaveAttribute('target','_blank');}
  await expect(page.getByText(/Representative habitat;.*fictional/).first()).toBeVisible();await page.getByRole('button',{name:'Back to index',exact:true}).click();
 }
 const audit=await new AxeBuilder({page}).analyze();expect(audit.violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('progress distinguishes friendly ownership and Ecologist habitat without combat controls',async({page})=>{
 await start(page);await expect(page.getByText('Yours 2/6',{exact:true})).toBeVisible();await expect(page.locator('.region-progress .ownership-dot')).toHaveCount(6);
 await start(page,'Species Clash');await expect(page.getByText('Yours 2/12',{exact:true})).toBeVisible();await expect(page.locator('.region-progress .ownership-dot')).toHaveCount(12);
 await start(page,'Ecologist');await expect(page.locator('.region-progress')).toContainText('Habitat');await expect(page.getByRole('button',{name:/Rally to gateway/})).toHaveCount(0);await expect(page.getByRole('button',{name:'Open fieldwork',exact:true})).toBeVisible();
});
