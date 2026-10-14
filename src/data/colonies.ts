import type { ColonyProfile, ColonyRelation } from '../game/types';
import { globalSamples, recognitionLinks } from './research';

const mainNetwork = new Set(['US1', 'F', 'AU', 'NZ', 'J', 'H1']);

/** Historical reference identities, not present-day territories or surveyed game nests. */
export const colonies: ColonyProfile[] = globalSamples.map<ColonyProfile>(sample => ({
  id: sample.id,
  label: sample.label,
  regionId: sample.regionId,
  networkId: mainNetwork.has(sample.id) ? 'main' : null,
  observationPeriod: '2008–2009',
  sourceIds: ['global-study'],
  sourceSampleId: sample.id,
}));

const profileIds = new Set(colonies.map(profile => profile.id));
const hostilePairs = new Set(recognitionLinks.filter(link => link.classification === 'high')
  .flatMap(link => [`${link.from}/${link.to}`, `${link.to}/${link.from}`]));

/**
 * Gameplay policy: the paper's main-network classification permits cooperation.
 * This disclosed adaptation includes low-aggression Australian pairings and
 * does not add pairwise evidence to the separate 17-result research layer.
 */
export function colonyRelation(first: string, second: string): ColonyRelation {
  if (!profileIds.has(first) || !profileIds.has(second)) return 'unknown';
  if (first === second || mainNetwork.has(first) && mainNetwork.has(second)) return 'friendly';
  if (hostilePairs.has(`${first}/${second}`)) return 'hostile';
  return 'unknown';
}

/** Each fictional setting retains this reference even after simulated capture. */
export function referencePopulation(regionId: string, index: number): string | undefined {
  if (regionId === 'california') return [0, 1, 3].includes(index) ? 'US1' : 'US2';
  if (regionId === 'hawaii') return [0, 1, 3].includes(index) ? 'H1' : 'H2';
  const regionalPopulations: Record<string, string> = { mediterranean: 'F', japan: 'J', africa: 'SA', australia: 'AU', newzealand: 'NZ' };
  return regionalPopulations[regionId];
}
