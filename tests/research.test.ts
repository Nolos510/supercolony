import { expect, it } from 'vitest';
import { globalSamples, recognitionLinks, californiaObservations, researchDatasets } from '../src/data/research';
import { regionalContexts } from '../src/data/regional';
import { specimens } from '../src/data/specimens';
it('keeps sampled relationships explicit and research geography separate from game nests', () => {
  expect(globalSamples).toHaveLength(9); expect(recognitionLinks).toHaveLength(17);
  const ids = new Set(globalSamples.map(p => p.id));
  for (const link of recognitionLinks) { expect(ids.has(link.from) && ids.has(link.to)).toBe(true); expect(link.aggressive).toBeLessThanOrEqual(link.total); }
  expect(recognitionLinks.find(l => l.from === 'US1' && l.to === 'AU')?.aggressive).toBe(4);
  expect(recognitionLinks.find(l => l.from === 'US1' && l.to === 'SA')?.aggressive).toBe(20);
  expect(recognitionLinks.filter(l => l.classification === 'none')).toHaveLength(7);
  for (const p of globalSamples) { expect(p.lon).toBeGreaterThanOrEqual(-180); expect(p.lon).toBeLessThanOrEqual(180); expect(p.lat).toBeGreaterThanOrEqual(-90); expect(p.lat).toBeLessThanOrEqual(90); expect(p.precision.length).toBeGreaterThan(2); }
});
it('bundles literal California observations with dates and methods', () => {
  expect(californiaObservations).toHaveLength(406);
  expect(new Set(californiaObservations.map(p => p.pointId)).size).toBe(295);
  expect(californiaObservations.filter(p => p.original)).toHaveLength(111);
  for (const p of californiaObservations) { expect(p.lon).toBeLessThan(-116); expect(p.lon).toBeGreaterThan(-118); expect(p.lat).toBeGreaterThan(32); expect(p.lat).toBeLessThan(34); expect(p.method.length).toBeGreaterThan(2); expect(p.status).toMatch(/^(present|not-detected)$/); }
  expect(researchDatasets.map(d => d.publicationYear)).toEqual([2010, 2025, 2023]);
});
it('provides eight regional contexts and attributed exact-species worker photographs', () => {
  expect(regionalContexts).toHaveLength(8);
  expect(regionalContexts.find(r => r.regionId === 'hawaii')?.ecologicalStakes).toMatch(/no native ants|without native ants/i);
  for (const r of regionalContexts) { expect(r.environment.length).toBeGreaterThan(30); expect(r.sourceUrls.length).toBeGreaterThan(0); }
  for (const id of ['argentine', 'meat']) {
    const photos = specimens.filter(s => s.speciesId === id && s.path);
    expect(photos.length).toBeGreaterThan(0);
    for (const photo of photos) { expect(photo.photographer.length).toBeGreaterThan(2); expect(photo.license.length).toBeGreaterThan(2); expect(new URL(photo.sourceUrl).protocol).toBe('https:'); }
  }
});
