import type { ComicScene } from '../game/types';

/** Original fiction. Captions stay separate from artwork and from scientific claims. */
export const storyArt = {
  path: '/story/general-mandible.png', width: 1536, height: 1024,
  sha256: 'cde0d5c433145a7e5b41e33f666b8d016f1ec520b965d6976162770b579af275',
  credit: 'Original SUPERColony comic artwork · generated with OpenAI image generation',
  reviewedAt: '2026-10-14',
  note: 'Fictional costumes, dialogue, and campaigns. Not a specimen photograph, historical reconstruction, or surveyed habitat.',
};

export const introScenes: ComicScene[] = [
  { id: 'home', title: 'Before the empire', panel: 0,
    narration: 'Our story begins on a South American riverbank. General Mandible has ambitious plans. The workers have lunch plans.',
    dialogue: '“A perfectly respectable riverbank. Needs more crumbs.”',
    fieldNote: 'Argentine ants are native to the Paraná drainage. At home, they are part of an ecosystem. Native-range presence is not an invasion.',
    factId: 'native-range', resourceIds: ['antweb'] },
  { id: 'fleet', title: 'An unconventional fleet', panel: 1,
    narration: 'A plant pot leaves the nursery. The General calls it a naval operation. Nobody asked the human carrying it.',
    dialogue: '“Deploy the fleet! Mind the fern.”',
    fieldNote: 'Human transport can move Argentine ants between distant places. Our pot journey is fictional, not a documented route from Paraná to California.',
    factId: 'transport', resourceIds: ['global-study', 'doc-nz'] },
  { id: 'california', title: 'The California briefing', panel: 2,
    narration: 'Our fictional campaign opens near the Berkeley reference sample. One gateway, a few trails, and a very large ego.',
    dialogue: '“California first. Then we discuss my portrait.”',
    fieldNote: 'US1 is the Berkeley population sampled in 2008–2009. Your local nests, ownership, workers, and battles are game abstractions.',
    factId: 'supercolonies', resourceIds: ['global-study'] },
  { id: 'recognition', title: 'An awkward family reunion', panel: 3,
    narration: 'A familiar scent can open a trail. An unfamiliar colony can make that introduction considerably less friendly.',
    dialogue: '“Same species. Surely they love me?”',
    fieldNote: 'The global study reported tolerance among some populations and aggression between others. Unknown comparisons remain unknown. The General does not run real ants.',
    factId: 'recognition', resourceIds: ['global-study'] },
];

export const vignettes: ComicScene[] = [
  { id: 'logistics', title: 'The plant-pot admiral', panel: 1,
    narration: 'No ocean-going ant trail. No tiny engines. Just an enormous supply chain and some accidental passengers.',
    dialogue: '“Check the manifest. I packed only honeydew.”',
    fieldNote: 'Checking plants, soil, materials, and equipment before moving them helps prevent accidental spread. Follow local official guidance.',
    factId: 'transport', resourceIds: ['doc-nz', 'global-study'] },
  { id: 'charge', title: 'Send the cavalry', panel: 2,
    narration: 'The General orders a magnificent charge. The rock corridor admits a rather less magnificent number of workers at once.',
    dialogue: '“More ants! …Why is the queue not moving?”',
    fieldNote: 'In the terrain experiments, meat ants won every tested arena; complex arenas reduced their fatalities. The game uses balanced values to illustrate participation limits.',
    factId: 'terrain', resourceIds: ['terrain-study'] },
  { id: 'rebellion', title: 'A very scented rebellion', panel: 3,
    narration: 'Three banners. Three rival identities. The General sees a conspiracy. The field notebook sees several untested relationships.',
    dialogue: '“A rebellion! They must have a group chat.”',
    fieldNote: 'Distinct rival populations are not automatically allied. Game AI acts only on its allowed relationships; unreported research pairs are never labeled friendly or hostile.',
    factId: 'recognition', resourceIds: ['global-study'] },
];
