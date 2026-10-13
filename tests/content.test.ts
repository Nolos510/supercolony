import { expect, it } from 'vitest';
import { facts, resources, species } from '../src/data/content';
import acceptance from '../verification/acceptance.json';

it('all learning entries resolve to reviewed official resources', () => {
  expect(facts).toHaveLength(acceptance.facts); expect(resources).toHaveLength(acceptance.resources);
  expect(new Set(resources.map(r => r.id)).size).toBe(resources.length);
  for (const fact of facts) {
    expect(fact.resourceIds.length).toBeGreaterThan(0);
    for (const id of fact.resourceIds) expect(resources.some(r => r.id === id)).toBe(true);
  }
  for (const r of resources) {
    expect(new URL(r.url).protocol).toBe('https:');
    expect(r.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.organization.length).toBeGreaterThan(2); expect(r.regionLabel.length).toBeGreaterThan(2);
    expect(r.topics.length).toBeGreaterThan(0);
    if (r.type === 'paper') expect(r.year).toBeGreaterThan(2000);
  }
  expect(species.argentine.workerForms).toBe(1);
});


it('provides native-range context and ant-specific documentation', () => {
  const native = facts.find(f => f.id === 'native-range');
  expect(native?.regionIds).toContain('southamerica');
  expect(native?.resourceIds).toContain('antweb');
  const antweb = resources.find(r => r.id === 'antweb');
  expect(new URL(antweb!.url).hostname).toBe('www.antweb.org');
  expect(species.argentine.regionIds).toContain('southamerica');
  expect(resources.find(r => r.id === 'inaturalist')!.summary).toMatch(/photo/i);
});
