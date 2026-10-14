import type { ModeId, RegionDefinition, ScenarioDefinition } from './types';
import { globalSamples } from '../data/research';

function referenceAnchor(sampleId: string): [number, number] {
  const sample = globalSamples.find(item => item.id === sampleId)!;
  return [sample.lon, sample.lat];
}

/** Historical reference markers locate regions; playable settings remain schematic. */
export const regions: RegionDefinition[] = [
  {
    id: 'california', name: 'Coastal California', shortName: 'California', country: 'United States',
    anchor: referenceAnchor('US1'),
    overview: 'The regional marker follows the historical Berkeley US1 reference. California has documented Argentine-ant supercolonies; local game settings and ownership are not surveyed nests or boundaries.',
    sourceIds: ['global-study', 'uc-ipm'],
  },
  {
    id: 'mediterranean', name: 'Mediterranean coast', shortName: 'Mediterranean', country: 'Southern Europe',
    anchor: referenceAnchor('F'),
    overview: 'Mediterranean populations feature in research on expansive supercolonies and recognition across distant populations. This network is simulated.',
    sourceIds: ['global-study'],
  },
  {
    id: 'japan', name: 'Southern Japan', shortName: 'Japan', country: 'Japan',
    anchor: referenceAnchor('J'),
    overview: 'The regional marker follows the historical Iwakuni J reference. Other Japanese populations have newer local studies; game frontlines do not show current field boundaries.',
    sourceIds: ['global-study'],
  },
  {
    id: 'africa', name: 'Southern Africa', shortName: 'Southern Africa', country: 'South Africa',
    anchor: referenceAnchor('SA'),
    overview: 'The regional marker uses the disclosed approximate Stellenbosch SA reference. Its historical recognition tests differ from the main network; settings and ownership remain simulated.',
    sourceIds: ['global-study'],
  },
  {
    id: 'australia', name: 'Southern Australia', shortName: 'Australia', country: 'Australia',
    anchor: referenceAnchor('AU'),
    overview: 'The regional marker follows the historical Melbourne AU reference. The separate Australian Species Clash battlefield illustrates terrain experiments without claiming that this is their collection site.',
    sourceIds: ['terrain-study', 'global-study'],
  },
  {
    id: 'newzealand', name: 'New Zealand', shortName: 'New Zealand', country: 'New Zealand',
    anchor: referenceAnchor('NZ'),
    overview: 'The regional marker follows the historical Wellington NZ reference. New Zealand conservation guidance documents Argentine ants and ecological impacts; game nest positions remain simulated.',
    sourceIds: ['doc-nz', 'global-study'],
  },
  {
    id: 'hawaii', name: 'Hawaiian Islands', shortName: 'Hawaii', country: 'United States',
    anchor: referenceAnchor('H1'),
    overview: 'The regional marker follows the historical Kipuka Nene H1 reference. H2 has a different reported recognition response. Transport links are game abstractions, not documented active shipping routes.',
    sourceIds: ['global-study'],
  },
  {
    id: 'southamerica', name: 'Paraná basin · native range', shortName: 'South America', country: 'Northern Argentina · Paraná drainage',
    anchor: [-58.81, -27.49], nativeRange: true,
    overview: 'Argentine ants are native to lowland river corridors in the Paraná drainage, including parts of northern Argentina, Paraguay, Uruguay and southern Brazil. Native-range presence is not an invasion. This region provides story and research context rather than a playable War network.',
    sourceIds: ['antweb'],
  },
];

export const scenarios: Record<ModeId, ScenarioDefinition> = {
  war: {
    id: 'war', name: 'Supercolony War',
    description: 'Connect your nests. Build a swarm. Follow the network around the world.',
    objective: 'Eliminate the rival colonies by taking their last nests and defeating their remaining swarms.',
    learning: 'Colony recognition, budding, native range, and human-assisted dispersal.', duration: null,
  },
  species: {
    id: 'species', name: 'Species Clash',
    description: 'Argentine recruitment meets meat-ant strength on an Australian battlefield.',
    objective: 'Eliminate the rival colony by taking its last nest and defeating its remaining swarms.',
    learning: 'Worker strength, recruitment, and the effect of complex terrain.', duration: null,
  },
  ecologist: {
    id: 'ecologist', name: 'Ecologist',
    description: 'Protect native communities as Argentine ants spread. Choose where your next intervention matters.',
    objective: 'Retain at least 60% of starting native habitat after five minutes.',
    learning: 'Habitat complexity, food subsidies, and prevention of accidental spread.', duration: 300,
  },
};
