import{test,expect}from'@playwright/test';
test('active gameplay reflows 200 percent text without horizontally clipping commands',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Start match',exact:true}).click();await page.getByRole('button',{name:'Skip tutorial',exact:true}).click();await page.getByRole('button',{name:'Pause match',exact:true}).click();await page.getByLabel('Map view').selectOption('california');await page.addStyleTag({content:'p,li,label,button {font-size:200% !important;}'});
 for(const[width,height]of[[320,568],[390,844],[844,390]]){
  await page.setViewportSize({width,height});
  const clipping=await page.evaluate(()=>[...document.querySelectorAll('.topbar button,.compact-orders button,.map-toolbar button')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&(r.left<-.5||r.right>innerWidth+.5);}).map(el=>el.getAttribute('aria-label')||el.textContent));
  expect(clipping).toEqual([]);
  await page.getByRole('button',{name:'SUPERColony game menu'}).click();await expect(page.getByRole('button',{name:'Restart match',exact:true})).toBeVisible();await page.getByRole('button',{name:'Resume match',exact:true}).click();await page.getByRole('button',{name:'Pause match',exact:true}).click();
 }
});
