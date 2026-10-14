import type { RegionalContext } from '../game/types';

// Original editorial summaries; sources describe particular places and studies,
// while game nodes, terrain classes, and ownership remain fictional.
export const regionalContexts: RegionalContext[] = [
  {
    regionId: 'california',
    environment: 'Seasonally dry coastal habitats make moisture important. The 2025 San Diego resurvey found different invasion patterns across soils with different water retention.',
    ecologicalStakes: 'At the surveyed sites, native-ant richness was lower where Argentine ants were detected. This local association does not establish a statewide trend.',
    gameAbstraction: 'Open and complex trails stand in for varied habitat. The game does not model rainfall, irrigation, or actual surveyed reserves.',
    sourceIds: ['uc-ipm', 'california-resurvey', 'california-recognition'], sourceUrls: [{ label: 'Hathaway, Menke & Holway · California resurvey (2025)', url: 'https://link.springer.com/article/10.1007/s10530-025-03583-8' }, { label: 'Local recognition and diet experiments (2022 publication; collection dates unreported)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9026800/' }],
    reviewedAt: '2026-10-13',
  },
  {
    regionId: 'mediterranean',
    environment: 'Southern European nests can belong to different recognition networks. A 2002 study identified two behaviorally distinct supercolonies across sampled Mediterranean sites.',
    ecologicalStakes: 'Workers tolerated distant members of their own sampled supercolony but fought workers from the other. A coastline alone cannot tell us colony identity.',
    gameAbstraction: 'The gateway near Marseille and its six nests are fictional. Cooperating ownership illustrates recognition; it does not trace today’s Mediterranean colony borders.',
    sourceIds: ['global-study', 'mediterranean-recognition'], sourceUrls: [{ label: 'Giraud, Pedersen & Keller · Southern Europe (2002)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC122904/' }, { label: 'Mediterranean island identities (2021 publication; 2016 assays)', url: 'https://myrmecologicalnews.org/cms/index.php?option=com_download&view=download&filename=volume31/mn31_185-200_printable.pdf&format=raw' }],
    reviewedAt: '2026-10-13',
  },
  {
    regionId: 'japan',
    environment: 'Port landscapes can contain several Argentine-ant populations. A 2021 study compared four supercolonies sampled in Kobe Port.',
    ecologicalStakes: 'Those populations differed in diet breadth and introduced-range extent. Shared species identity does not guarantee the same recognition relationship.',
    gameAbstraction: 'The Iwakuni reference locates a historical sample, not six surveyed nests. Nara’s 2022 assays against Kobe populations enrich this profile without changing the global 2008–2009 comparisons.',
    sourceIds: ['global-study', 'japan-recognition'], sourceUrls: [{ label: 'Japanese supercolonies and diet breadth (2021)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7859199/' }, { label: 'Nara distribution and recognition (2023 publication; 2022 assays)', url: 'https://www.nature.com/articles/s41598-023-47734-0' }],
    reviewedAt: '2026-10-13',
  },
  {
    regionId: 'africa',
    environment: 'Cape fynbos plants often depend on native ants to carry and bury seeds. A 1984 field study examined this relationship where Argentine ants had invaded.',
    ecologicalStakes: 'Argentine ants moved the tested seeds shorter distances and did not bury them as native ants did. Losing a seed transporter can affect plant regeneration.',
    gameAbstraction: 'Habitat points summarize ecological pressure. They do not predict seed survival, fire recovery, or the outcome of a real intervention.',
    sourceIds: ['global-study'], sourceUrls: [{ label: 'Bond & Slingsby · Ant–plant mutualism (1984)', url: 'https://esajournals.onlinelibrary.wiley.com/doi/10.2307/1938311' }],
    reviewedAt: '2026-10-13',
  },
  {
    regionId: 'australia',
    environment: 'The Australian matchup draws on controlled battles between small Argentine ants and larger meat ants in open and structurally complex arenas.',
    ecologicalStakes: 'Meat ants won every tested group battle. Complex arenas reduced their fatalities, showing that crowd access can change a numerical advantage.',
    gameAbstraction: 'Bottlenecks limit simultaneous combatants. Either species can win with balanced game values; the scenario does not reproduce experimental mortality.',
    sourceIds: ['terrain-study'], sourceUrls: [{ label: 'Lymbery, Webber & Didham · Terrain experiment (2023)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10500280/' }],
    reviewedAt: '2026-10-13',
  },
  {
    regionId: 'newzealand',
    environment: 'New Zealand’s conservation agency describes Argentine ants in urban and natural sites. Linked nests make isolated local control difficult.',
    ecologicalStakes: 'Movable plants, soil, building materials, and gear can transport colonies. DOC recommends checking these items before movement to help prevent spread.',
    gameAbstraction: 'Transport restrictions temporarily delay simulated dispersal. They are not instructions for pesticide use or evidence that a real infestation has been controlled.',
    sourceIds: ['doc-nz'], sourceUrls: [{ label: 'New Zealand Department of Conservation · Argentine ants', url: 'https://www.doc.govt.nz/nature/pests-and-threats/animal-pests-and-threats/argentine-ants/' }],
    reviewedAt: '2026-10-13',
  },
  {
    regionId: 'hawaii',
    environment: 'Haleakalā rises from the coast to a cold, windy summit. Argentine-ant research in its high-elevation shrublands concerns a particular Hawaiian landscape, not every island.',
    ecologicalStakes: 'Hawaiʻi has no native ants. Endemic insects and other invertebrates can be vulnerable to introduced ants; local effects vary with elevation and community.',
    gameAbstraction: 'Ecologist tracks native habitat and invertebrate communities here. The Hawaiʻi Island gateway is fictional and separate from the cited Maui studies.',
    sourceIds: ['island-conservation'], sourceUrls: [
      { label: 'National Park Service · Haleakalā insects and arthropods', url: 'https://www.nps.gov/hale/learn/nature/insects-arachnids-arthropods.htm' },
      { label: 'Cole and colleagues · High-elevation shrubland study (1992)', url: 'https://esajournals.onlinelibrary.wiley.com/doi/10.2307/1940678' },
    ], reviewedAt: '2026-10-13',
  },
  {
    regionId: 'southamerica',
    environment: 'The native range follows lowland corridors of the Paraná drainage, including the Paraná, Paraguay, and Uruguay rivers.',
    ecologicalStakes: 'Wild’s 2004 collection-based study distinguishes likely native river-basin populations from introduced populations elsewhere in South America. Native presence is not an invasion.',
    gameAbstraction: 'Paraná provides native-range story and research context. It has no playable War nests or simulated invasive pressure in this scenario.',
    sourceIds: ['antweb'], sourceUrls: [{ label: 'Wild · Taxonomy and distribution (2004)', url: 'https://academic.oup.com/aesa/article/97/6/1204/54982' }],
    reviewedAt: '2026-10-13',
  },
];
