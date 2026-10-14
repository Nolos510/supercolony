import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import fixture from '../verification/atlas-acceptance.json';
import { advance, createGame, send, sendMany } from '../src/game/engine';
import { colonies, colonyRelation } from '../src/data/colonies';
import { habitatAssignments, habitatPhotos } from '../src/data/habitats';
import { facts, resources } from '../src/data/content';
import { visualSummaries, learningActivities } from '../src/data/atlasLearning';
import { introScenes, vignettes, storyArt } from '../src/data/atlasStory';
import { distributionRecords, recognitionLinks } from '../src/data/research';
const total = (s: ReturnType<typeof createGame>) => s.nodes.reduce((v,n)=>v+n.units,0)+s.fleets.reduce((v,f)=>v+f.units,0)+s.stats.developmentWorkers;
const inert = () => { const s=createGame('war');s.aiEnabled=false;s.nodes.forEach(n=>{n.growth=0;});return s; };
it('freezes 42 fictional settings, nine reference origins and unchanged per-setting reserves',()=>{
 const s=createGame('war');expect(s.nodes).toHaveLength(42);expect([...new Set(s.nodes.map(n=>n.regionId))]).toEqual(fixture.warRegions);
 expect(colonies.map(c=>c.id).sort()).toEqual([...fixture.populations].sort());
 for(const [region, units] of Object.entries(fixture.reserves)) expect(s.nodes.filter(n=>n.regionId===region).map(n=>n.units)).toEqual(units);
 expect(s.nodes.filter(n=>n.owner==='player').map(n=>n.id)).toEqual(['california-0','california-3']);
 expect(s.nodes.filter(n=>n.owner==='rival').map(n=>n.colonyId).filter((v,i,a)=>a.indexOf(v)===i).sort()).toEqual([...fixture.rivals].sort());
 expect(s.nodes.filter(n=>n.regionId==='california').map(n=>n.sourcePopulationId)).toEqual(['US1','US1','US2','US1','US2','US2']);
 expect(s.nodes.filter(n=>n.regionId==='hawaii').map(n=>n.sourcePopulationId)).toEqual(['H1','H1','H2','H1','H2','H2']);
 expect(s.nodes.every(n=>fixture.populations.includes(n.sourcePopulationId!))).toBe(true);
});
it('centralizes documented hostility and disclosed main-network cooperation without inventing rival alliances',()=>{
 for(const a of fixture.mainNetwork)for(const b of fixture.mainNetwork)expect(colonyRelation(a,b)).toBe('friendly');
 for(const link of recognitionLinks.filter(l=>l.classification==='high'))expect(colonyRelation(link.from,link.to)).toBe('hostile');
 for(const [a,b] of [['US2','SA'],['US2','H2'],['SA','H2'],['SA','J'],['H2','AU']]){expect(colonyRelation(a,b)).toBe('unknown');expect(colonyRelation(b,a)).toBe('unknown');}
 expect(colonyRelation('not-a-profile','US1')).toBe('unknown');
 expect(recognitionLinks.find(l=>l.from==='US1'&&l.to==='AU')?.aggressive).toBe(4);
});
it('rejects unknown destinations without spending workers and handles mixed multi-source rejection',()=>{
 const s=inert(), source=s.nodes.find(n=>n.id==='california-3')!;source.colonyId='SA';
 const before=structuredClone(s),result=send(s,source.id,'california-2',.5);expect(result.error).toMatch(/unknown|unreported/i);expect(result.state).toEqual(before);
 const batch=sendMany(s,['california-3','california-0'],'california-2',.5);expect(batch.sentFromIds).toEqual(['california-0']);expect(batch.skipped.some(x=>x.sourceId==='california-3')).toBe(true);expect(total(batch.state)).toBe(total(s));
});
it('unknown arrivals withdraw over the traversed route with no worker clipping or invented combat',()=>{
 const s=inert();s.nodes.find(n=>n.id==='california-0')!.colonyId='H1';
 const dispatched=send(s,'california-0','mediterranean-0',.5).state;expect(dispatched.fleets).toHaveLength(1);
 const dest=dispatched.nodes.find(n=>n.id==='mediterranean-0')!;dest.owner='rival';dest.colonyId='SA';const units=dest.units;
 const returning=advance(dispatched,30.1);expect(returning.fleets[0]?.withdrawing).toBe(true);expect(returning.nodes.find(n=>n.id===dest.id)!.units).toBe(units);expect(total(returning)).toBeCloseTo(total(s));
 const finished=advance(returning,30);expect(finished.fleets).toHaveLength(0);expect(total(finished)).toBeCloseTo(total(s));expect(finished.nodes.find(n=>n.id==='california-0')!.units).toBe(66);
});
it('capture changes occupant identity while preserving the immutable reference population',()=>{
 const s=inert();s.nodes.find(n=>n.id==='california-2')!.units=1;
 const result=advance(send(s,'california-0','california-2',1).state,16);const n=result.nodes.find(n=>n.id==='california-2')!;
 expect(n.owner).toBe('player');expect(n.colonyId).toBe('US1');expect(n.sourcePopulationId).toBe('US2');
 expect(advance(createGame('war','argentine',91),64)).toEqual(advance(createGame('war','argentine',91),64));
});
it('unrelated rivals neither pool reserves nor fight when an in-flight destination changes identity',()=>{
 const s=inert(),source=s.nodes.find(n=>n.id==='california-2')!,target=s.nodes.find(n=>n.id==='california-4')!;target.colonyId='SA';const targetUnits=target.units;
 s.fleets.push({id:1,owner:'rival',colonyId:'US2',species:'argentine',units:10,path:[source.id,target.id],legIndex:0,elapsed:0});source.units-=10;s.nextFleetId=2;const before=total(s);
 const next=advance(s,9);expect(next.nodes.find(n=>n.id===target.id)!.units).toBe(targetUnits);expect(next.fleets[0]?.withdrawing).toBe(true);expect(total(next)).toBeCloseTo(before);expect(total(advance(next,9))).toBeCloseTo(before);
});
it('independent rivals choose only neutral or explicitly hostile destinations',()=>{
 const s=createGame('war');s.nodes.forEach(n=>{n.growth=0;});s.edges.forEach(e=>{e.travelSeconds=1000;});const result=advance(s,16);
 for(const f of result.fleets.filter(f=>f.owner==='rival')){const target=result.nodes.find(n=>n.id===f.path.at(-1))!;expect(target.owner==='neutral'||colonyRelation(f.colonyId,target.colonyId)==='hostile').toBe(true);}
});
it('resolves sixty distinct same-region habitat primaries with individually verified bytes and licenses',()=>{
 expect(habitatAssignments).toHaveLength(fixture.habitatAssignments);expect(habitatAssignments.filter(a=>a.scenario==='regional')).toHaveLength(48);expect(habitatAssignments.filter(a=>a.scenario==='species')).toHaveLength(12);
 const keys=habitatAssignments.map(a=>`${a.scenario}/${a.regionId}/${a.roleId}`);expect(new Set(keys).size).toBe(60);
 for(const region of [...fixture.warRegions,'southamerica']){const assigned=habitatAssignments.filter(a=>a.scenario==='regional'&&a.regionId===region);expect(assigned.map(a=>a.roleId).sort()).toEqual([...fixture.regionalRoles].sort());expect(new Set(assigned.map(a=>a.photoId)).size).toBe(6);expect(new Set(assigned.map(a=>habitatPhotos.find(p=>p.id===a.photoId)?.originalSha256)).size).toBe(6);}
 expect(habitatAssignments.filter(a=>a.scenario==='species').map(a=>a.roleId).sort()).toEqual([...fixture.speciesRoles].sort());
 expect(new Set(habitatAssignments.filter(a=>a.scenario==='species').map(a=>a.photoId)).size).toBe(12);
 for(const a of habitatAssignments){const p=habitatPhotos.find(p=>p.id===a.photoId)!;expect(p).toBeTruthy();expect(p.regionId).toBe(a.regionId);expect(p.license).toMatch(/CC BY|CC0|Public domain/);expect(p.license).not.toMatch(/NC/);expect(p.locality.length).toBeGreaterThan(2);expect(p.creator.length).toBeGreaterThan(2);expect(p.rightsEvidenceURL).toMatch(/^https:/);expect(p.changes.length).toBeGreaterThan(5);expect(p.reviewedAt).toMatch(/^2026-10-1[34]$/);expect(createHash('sha256').update(readFileSync(`public${p.path}`)).digest('hex')).toBe(p.sha256);}
});
it('sources sixteen visual summaries, all activity feedback and every fictional comic field note',()=>{
 const factIds=new Set(facts.map(f=>f.id)),resourceIds=new Set(resources.map(r=>r.id));expect(visualSummaries).toHaveLength(16);expect(new Set(visualSummaries.map(v=>v.factId))).toEqual(factIds);
 expect(learningActivities.map(a=>a.id)).toEqual(fixture.activities);expect(introScenes).toHaveLength(4);expect(vignettes).toHaveLength(3);
 for(const v of [...visualSummaries,...learningActivities,...introScenes,...vignettes]){expect(factIds.has(v.factId)).toBe(true);expect(v.resourceIds.length).toBeGreaterThan(0);expect(v.resourceIds.every(id=>resourceIds.has(id))).toBe(true);}
 for(const a of learningActivities){expect(a.steps).toHaveLength(3);for(const step of a.steps){expect(step.correctIndex).toBeGreaterThanOrEqual(0);expect(step.correctIndex).toBeLessThan(step.choices.length);expect(step.explanation.length).toBeGreaterThan(20);}}
 expect(createHash('sha256').update(readFileSync(`public${storyArt.path}`)).digest('hex')).toBe(storyArt.sha256);
});
it('keeps distribution status, precision and fixed snapshot separate from colony identity',()=>{
 expect(distributionRecords).toHaveLength(162);expect(new Set(distributionRecords.map(d=>d.id)).size).toBe(162);
 for(const p of distributionRecords){expect(p.sourceId).toBe('distribution-2022');expect(p.precision).toMatch(/regional/i);expect(p.lon).toBeGreaterThanOrEqual(-180);expect(p.lon).toBeLessThanOrEqual(180);expect(p.lat).toBeGreaterThanOrEqual(-90);expect(p.lat).toBeLessThanOrEqual(90);expect(p.status).toMatch(/^(native|established.outdoors|established.indoors|border.interception)$/);}
});
