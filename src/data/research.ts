import type { ResearchMapDataset } from '../game/types';
import globalData from '../../public/research/global-2010.json';
import californiaData from '../../public/research/california-2025.json';

export interface ResearchSample {
  id: string; label: string; locality: string; lon: number; lat: number;
  regionId: string; precision: string; coordinateNote: string;
}
export interface RecognitionLink {
  from: string; to: string; aggressive: number; total: number;
  classification: 'none' | 'low' | 'high';
}
export interface CaliforniaObservation {
  id: string; pointId: string; site: 'TPSR' | 'PLECA'; samplingPoint: string;
  lon: number; lat: number; period: '1995–1997' | '1996–1997' | '2022–2024';
  method: string; status: 'present' | 'not-detected'; soilType: string; original: boolean;
  reportedLongitude?: number; coordinateNote?: string; precision?: string;
}

// These imports are bundled at build time. Nothing is scraped during a match.
export const globalSamples = globalData.samples as ResearchSample[];
export const recognitionLinks = globalData.links as RecognitionLink[];
export const californiaObservations = californiaData as CaliforniaObservation[];

export const researchDatasets: ResearchMapDataset[] = [
  {
    id: 'global-2010', title: 'Global recognition samples', publicationYear: 2010,
    observationPeriod: '2008–2009',
    method: 'Three-minute, paired-worker aggression assays; 17 explicitly reported comparisons.',
    precision: 'Five published coordinates; four disclosed approximate locality markers.',
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3352483/',
    reviewedAt: '2026-10-13', dataPath: '/research/global-2010.json',
    summary: 'Nine sampled populations. Lines show only reported pairwise assays, including occasional aggression among otherwise tolerant samples.',
    caveat: 'Historical recognition tests, not current alliances or battlefronts. Unreported comparisons are unknown. Markers do not show colony borders.',
  },
  {
    id: 'california-2025', title: 'Coastal California resurvey', publicationYear: 2025,
    observationPeriod: 'Original: 1995–1997 · Resurvey: 2022–2024',
    method: 'Published appendix presence records; pitfall traps, visual searches, and baiting. Methods differ across periods.',
    precision: '295 appendix sites: 294 published GPS positions and one disclosed approximate longitude-sign correction. Field accuracy is not specified.',
    sourceUrl: 'https://link.springer.com/article/10.1007/s10530-025-03583-8',
    reviewedAt: '2026-10-13', dataPath: '/research/california-2025.json',
    summary: 'Torrey Pines and Point Loma: 111 repeated points plus 184 additional sites. Compare detection across survey periods.',
    caveat: 'Presence does not identify a supercolony. Not detected is not proven absence. These observations do not cover all California or describe today’s distribution.',
  },
];
