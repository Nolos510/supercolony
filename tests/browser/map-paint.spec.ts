import { test, expect } from '@playwright/test';
test('rapid regional/world changes paint the current geographic map, including WebKit',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Start match',exact:true}).click();await page.getByRole('button',{name:'Skip tutorial',exact:true}).click();await page.getByRole('button',{name:'Pause match',exact:true}).click();
 for(const view of ['california','world','hawaii','world']){
  await page.getByLabel('Map view').selectOption(view);
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered-view',view);
  if(view==='world'){
   await expect(page.locator('.map-canvas')).toHaveAttribute('data-terrain-ready','true');
   const pixels=await page.locator('.map-canvas').evaluate((canvas:HTMLCanvasElement)=>{
    const w=canvas.clientWidth,h=canvas.clientHeight,cosine=Math.cos(11.5*Math.PI/180),spanX=360*cosine,spanY=145;
    const scale=Math.min(w*.85/spanX,h*.85/spanY),left=(w-spanX*scale)/2,top=(h-spanY*scale)/2;
    const dpr=canvas.width/w,context=canvas.getContext('2d')!;
    const land=context.getImageData(Math.round((left+80*cosine*scale)*dpr),Math.round((top+24*scale)*dpr),1,1).data;
    const sea=context.getImageData(Math.round(w*.05*dpr),Math.round(h*.5*dpr),1,1).data;
    return {landBlue:land[2],seaBlue:sea[2]};
   });
   expect(pixels.landBlue).toBeLessThan(pixels.seaBlue-15);
  }
 }
});
