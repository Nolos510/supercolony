import type { ModeId, RegionDefinition, ScenarioDefinition } from './types';

/** Geographic anchors locate documented regions; playable nest sites are simulated. */
export const regions: RegionDefinition[] = [
  {
    id: 'california', name: 'Coastal California', shortName: 'California', country: 'United States',
    anchor: [-118.24, 34.05],
    overview: 'California has documented Argentine-ant supercolonies. The nests and ownership shown here are a game scenario, not surveyed boundaries.',
    sourceIds: ['global-study', 'uc-ipm'],
  },
  {
    id: 'mediterranean', name: 'Mediterranean coast', shortName: 'Mediterranean', country: 'Southern Europe',
    anchor: [5.37, 43.3],
    overview: 'Mediterranean populations feature in research on expansive supercolonies and recognition across distant populations. This network is simulated.',
    sourceIds: ['global-study'],
  },
  {
    id: 'japan', name: 'Southern Japan', shortName: 'Japan', country: 'Japan',
    anchor: [135.5, 34.69],
    overview: 'Japanese populations have been studied for relationships to other introduced Argentine-ant populations. Game frontlines do not show current field boundaries.',
    sourceIds: ['global-study'],
  },
  {
    id: 'africa', name: 'Southern Africa', shortName: 'Southern Africa', country: 'South Africa',
    anchor: [18.42, -33.93],
    overview: 'Argentine ants occur in southern Africa. Presence alone does not establish membership in a worldwide supercolony; the playable network is fictional.',
    sourceIds: ['global-study'],
  },
  {
    id: 'australia', name: 'Southern Australia', shortName: 'Australia', country: 'Australia',
    anchor: [138.6, -34.93],
    overview: 'Australian experiments explored how terrain changes contests between Argentine ants and native meat ants. This battlefield abstracts that finding.',
    sourceIds: ['terrain-study', 'global-study'],
  },
  {
    id: 'newzealand', name: 'Northern New Zealand', shortName: 'New Zealand', country: 'New Zealand',
    anchor: [174.76, -36.85],
    overview: 'New Zealand conservation guidance documents Argentine ants and ecological impacts. All nest positions in this scenario are simulated.',
    sourceIds: ['doc-nz', 'global-study'],
  },
  {
    id: 'hawaii', name: 'Hawaiian Islands', shortName: 'Hawaii', country: 'United States',
    anchor: [-155.58, 19.62],
    overview: 'Argentine ants occur in Hawaii. In-game dispersal links represent human-assisted movement as an abstraction, not documented active shipping routes.',
    sourceIds: ['global-study'],
  },
];

export const scenarios: Record<ModeId, ScenarioDefinition> = {
  war: {
    id: 'war', name: 'Supercolony War',
    description: 'Connect your nests. Build a swarm. Follow the network around the world.',
    objective: 'Hold 60% of nests for 20 seconds, or lead in territory after five minutes.',
    learning: 'Colony recognition, budding, and human-assisted dispersal.', duration: 300,
  },
  species: {
    id: 'species', name: 'Species Clash',
    description: 'Argentine recruitment meets meat-ant strength on an Australian battlefield.',
    objective: 'Hold 60% of nests for 20 seconds, or lead in territory after five minutes.',
    learning: 'Worker strength, recruitment, and the effect of complex terrain.', duration: 300,
  },
  ecologist: {
    id: 'ecologist', name: 'Ecologist',
    description: 'Protect native communities as Argentine ants spread. Choose where your next intervention matters.',
    objective: 'Retain at least 60% of starting native habitat after five minutes.',
    learning: 'Habitat complexity, food subsidies, and prevention of accidental spread.', duration: 300,
  },
};
