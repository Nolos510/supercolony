import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { habitats } from '../src/data/habitats';
import { nestRoles } from '../src/data/nestRoles';
import { regions } from '../src/game/scenarios';
import { createGame } from '../src/game/engine';
it('bundles two independently credited real habitat photographs for every region',()=>{
 expect(habitats).toHaveLength(16);expect(new Set(habitats.map(a=>a.id)).size).toBe(16);
 for(const r of regions){expect(habitats.filter(a=>a.regionId===r.id).map(a=>a.terrain).sort()).toEqual(['complex','open']);}
 for(const a of habitats){expect(a.locality.length).toBeGreaterThan(2);expect(a.creator.length).toBeGreaterThan(2);expect(a.caption.length).toBeGreaterThan(12);expect(a.reviewedAt).toBe('2026-10-13');expect(new URL(a.sourceUrl).protocol).toBe('https:');expect(a.license).toMatch(/CC BY|Public domain/);expect(a.licenseUrl.length).toBeGreaterThan(10);expect(a.changes.length).toBeGreaterThan(5);expect(a.rightsEvidenceURL.length).toBeGreaterThan(10);const bytes=readFileSync(`public${a.path}`);expect(bytes.length).toBeGreaterThan(4000);expect(createHash('sha256').update(bytes).digest('hex')).toBe(a.sha256);}
});
it('each simulated combat site resolves its setting role without biological-status names',()=>{
 expect(nestRoles).toHaveLength(18);
 for(const mode of ['war','species'] as const){for(const n of createGame(mode).nodes){expect(nestRoles.some(r=>r.id===n.roleId)).toBe(true);}}
 expect(createGame('species').nodes.find(n=>n.id==='australia-8')!.name).toBe('Established nest');expect(createGame('species').nodes.find(n=>n.id==='australia-11')!.name).toBe('Gravel mound');
});
