import { expect, it } from 'vitest';
import { advance, createGame, developRegion, growthInfo, rallyInfo, rallyRegion, setAutoRally } from '../src/game/engine';
import type { GameState, SpeciesId } from '../src/game/types';
const stock = (s: GameState) => s.nodes.reduce((sum,n) => sum+n.units,0)+s.fleets.reduce((sum,f) => sum+f.units,0)+s.stats.developmentWorkers;
function cold() { const s=createGame('war');s.aiEnabled=false;s.nodes.forEach(n => { n.growth=0; });return s; }
const site=(s:GameState,id:string)=>s.nodes.find(n=>n.id===id)!;
it('rallies a partial region without commanding allies or duplicating workers',()=>{
 const s=cold(),r=rallyRegion(s,'california',.5);
 expect(r.sentFromIds).toEqual(['california-3']); expect(r.state.fleets[0].units).toBe(15);
 expect(stock(r.state)).toBeCloseTo(stock(s)); expect(site(s,'california-3').units).toBe(30);
 const arrived=advance(r.state,30); expect(site(arrived,'california-0').units).toBe(81);
 expect(site(arrived,'california-1').units).toBe(32); expect(stock(arrived)).toBeCloseTo(stock(s));
});
it('full-region arrivals keep stock above capacity and unavailable sources are reported',()=>{
 const s=cold();s.nodes.filter(n=>n.regionId==='california').forEach(n=>{n.owner='player';n.colonyId='US1';n.units=40;});
 const r=rallyRegion(s,'california',1),a=advance(r.state,40);
 expect(r.sentFromIds).toHaveLength(5);expect(site(a,'california-0').units).toBe(240);expect(stock(a)).toBeCloseTo(stock(s));
 const partial=cold();site(partial,'california-2').owner='player';site(partial,'california-2').colonyId='US1';site(partial,'california-1').owner='rival';site(partial,'california-1').colonyId='US2';
 const p=rallyRegion(partial,'california',.5);expect(p.sentFromIds).toContain('california-3');expect(p.skipped.map(n=>n.sourceId)).toContain('california-2');
});
it('rejects foreign gateways, invalid fractions/regions, paused orders and Ecologist',()=>{
 const s=cold();site(s,'california-0').owner='ally';expect(rallyRegion(s,'california',1).error).toBeTruthy();expect(developRegion(s,'california').error).toBeTruthy();expect(setAutoRally(s,'california',true).error).toBeTruthy();
 expect(rallyRegion(cold(),'missing',.5).error).toBeTruthy();expect(rallyRegion(cold(),'california',0).error).toBeTruthy();
 const p=cold();p.status='paused';expect(rallyRegion(p,'california',.5).error).toBeTruthy();expect(developRegion(p,'california').error).toBeTruthy();
 const eco=createGame('ecologist');expect(setAutoRally(eco,'california',true).error).toBeTruthy();expect(developRegion(eco,'california').error).toBeTruthy();
});
it('automatic rally waits for20, sends exact10 once per second, and excludes allies',()=>{
 let s=cold();site(s,'california-3').units=19.99;site(s,'california-1').units=50;
 s=setAutoRally(s,'california',true).state;s=advance(s,1);expect(s.fleets).toHaveLength(0);
 site(s,'california-3').units=32.52;s=advance(s,1);
 expect(s.fleets[0].units).toBe(10);expect(site(s,'california-3').units).toBeCloseTo(22.52);
 expect(s.stats.orders).toBe(0);expect(s.stats.automaticRallyOrders).toBe(1);expect(s.stats.automaticRallyWorkers).toBe(10);
 s=advance(s,1);expect(site(s,'california-3').units).toBeCloseTo(12.52);expect(s.fleets).toHaveLength(2);
 s=advance(s,1);expect(site(s,'california-3').units).toBeCloseTo(12.52);expect(site(s,'california-1').units).toBe(50);
});
it('automatic blocked sources wait without consuming reserves and paused time freezes',()=>{
 let s=cold();site(s,'california-2').owner='player';site(s,'california-2').colonyId='US1';site(s,'california-2').units=25;site(s,'california-1').owner='rival';site(s,'california-1').colonyId='US2';site(s,'california-3').units=10;
 s=setAutoRally(s,'california',true).state;const info=rallyInfo(s,'california');expect(info.blockedSourceIds).toContain('california-2');
 s=advance(s,2);expect(s.fleets).toHaveLength(0);expect(site(s,'california-2').units).toBe(25);
 s.status='paused';expect(advance(s,100)).toEqual(s);expect(setAutoRally(s,'california',false).state.autoRally.california).toBeFalsy();
});
it('development costs30, prepares20s, and boosts both species only at owned regional nests',()=>{
 for(const species of ['argentine','meat'] as SpeciesId[]){
  const s=createGame('species',species);s.aiEnabled=false;site(s,'australia-0').units=40;
  const before=stock(s),r=developRegion(s,'australia');expect(r.error).toBeUndefined();expect(stock(r.state)).toBeCloseTo(before);expect(site(r.state,'australia-0').units).toBe(10);
  expect(r.state.stats.developmentWorkers).toBe(30);expect(growthInfo(r.state,site(r.state,'australia-0')).development).toBe('preparing');
  expect(developRegion(r.state,'australia').error).toBeTruthy();r.state.status='paused';expect(advance(r.state,30).time).toBe(0);r.state.status='running';
  const a=advance(r.state,20),mine=site(a,'australia-0');expect(growthInfo(a,mine).current).toBeCloseTo(mine.growth*1.2);
  expect(growthInfo(a,site(a,'australia-8')).multiplier).toBe(1);site(a,'australia-2').owner='player';expect(growthInfo(a,site(a,'australia-2')).multiplier).toBe(1.2);
 }
});
it('growth explains unclaimed, capacity, paused, active and unchanged base rates',()=>{
 const s=createGame('war');const n=site(s,'california-0');expect(growthInfo(s,n).base).toBe(.95);expect(growthInfo(s,site(s,'mediterranean-0')).reason).toBe('unclaimed');
 n.units=n.capacity;expect(growthInfo(s,n).current).toBe(0);expect(growthInfo(s,n).reason).toBe('capacity');s.status='paused';expect(growthInfo(s,n).current).toBe(0);
 const low=createGame('species','meat');expect(developRegion(low,'australia').error).toBeTruthy();expect(growthInfo(low,site(low,'australia-0')).base).toBe(.32);
});
it('gateway captures invalidate preparing and active upgrades and auto rally without refund',()=>{
 for(const seconds of [0,21]){
  let s=cold();s=developRegion(s,'california').state;s=setAutoRally(s,'california',true).state;s=advance(s,seconds);
  s.fleets=[];s.fleets.push({id:900,owner:'rival',colonyId:'US2',species:'argentine',units:200,path:['california-3','california-0'],legIndex:0,elapsed:7.9});
  const a=advance(s,.1);expect(site(a,'california-0').owner).toBe('rival');expect(a.autoRally.california).toBeFalsy();expect(a.developments.california).toBeUndefined();expect(a.stats.developmentWorkers).toBe(30);
  site(a,'california-0').owner='player';site(a,'california-0').colonyId='US1';site(a,'california-0').units=40;expect(a.autoRally.california).toBeFalsy();expect(developRegion(a,'california').error).toBeUndefined();
 }
});
it('same-tick gateway loss and recapture still removes development and automation',()=>{
 let s=cold();s=developRegion(s,'california').state;s=setAutoRally(s,'california',true).state;
 s.fleets=[{id:901,owner:'rival',colonyId:'US2',species:'argentine',units:100,path:['california-3','california-0'],legIndex:0,elapsed:7.9},{id:902,owner:'player',colonyId:'US1',species:'argentine',units:200,path:['california-3','california-0'],legIndex:0,elapsed:7.9}];
 const a=advance(s,.1);expect(site(a,'california-0').owner).toBe('player');expect(a.autoRally.california).toBeFalsy();expect(a.developments.california).toBeUndefined();
});
it('automation/development replay identically across view-independent clock chunks and restart',()=>{
 const replay=()=>{let s=createGame('war','argentine',77);s=developRegion(s,'california').state;s=setAutoRally(s,'california',true).state;return advance(s,60);};expect(replay()).toEqual(replay());
 let s=createGame('war','argentine',77);s=developRegion(s,'california').state;s=setAutoRally(s,'california',true).state;for(let i=0;i<600;i++)s=advance(s,.1);expect(s).toEqual(replay());
 expect(createGame('war').developments).toEqual({});expect(createGame('species').autoRally).toEqual({});
});
