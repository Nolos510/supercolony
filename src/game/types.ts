export type ModeId = 'war' | 'species' | 'ecologist';
export type SpeciesId = 'argentine' | 'meat' | 'native';
export type Owner = 'player' | 'ally' | 'rival' | 'neutral';
export type Terrain = 'open' | 'complex';
export type Intervention = 'habitat' | 'food' | 'transport';
export type MatchStatus = 'running' | 'paused' | 'won' | 'lost' | 'draw';
export type ColonyRelation = 'friendly' | 'hostile' | 'unknown';
export interface RegionDefinition {
  id: string; name: string; shortName: string; country: string;
  nativeRange?: boolean; anchor: [number, number]; overview: string; sourceIds: string[];
}
export interface ScenarioDefinition {
  id: ModeId; name: string; description: string; objective: string; learning: string; duration: number | null;
}
export interface SpeciesProfile {
  id: SpeciesId; name: string; scientificName: string; description: string;
  workerForms: number | null; sizeLabel: string; strengthLabel: string; regionIds: string[]; resourceIds: string[];
}
export interface FactEntry {
  id: string; title: string; summary: string; detail: string; topic: string;
  resourceIds: string[]; speciesIds: SpeciesId[]; regionIds: string[];
}
export interface ResourceEntry {
  id: string; title: string; organization: string; url: string;
  group: 'research' | 'participate' | 'support';
  type: 'paper' | 'dataset' | 'official-guide' | 'citizen-science' | 'conservation-group';
  summary: string; regionLabel: string; regionIds: string[]; topics: string[];
  speciesIds: SpeciesId[]; reviewedAt: string; year?: number; accessNote?: string;
}
export interface NestState {
  id: string; name: string; roleId: string; regionId: string; x: number; y: number;
  owner: Owner; colonyId: string; species: SpeciesId; units: number; capacity: number; growth: number;
  terrain: Terrain; habitat: number; gateway: boolean;
  /** Documented reference origin, never changed by simulated capture. */
  readonly sourcePopulationId?: string;
}
export interface TrailState { id: string; from: string; to: string; kind: 'local' | 'overseas'; travelSeconds: number }
export interface FleetState {
  id: number; owner: Owner; colonyId: string; species: SpeciesId; units: number;
  path: string[]; legIndex: number; elapsed: number;
  withdrawing?: boolean;
}
export interface EffectState { nodeId: string; kind: Intervention; expires: number }
export interface GameEvent { id: number; time: number; message: string; factId: string }
export interface GameState {
  mode: ModeId; playerSpecies: SpeciesId; seed: number; rng: number;
  time: number; duration: number | null; status: MatchStatus; aiEnabled: boolean;
  autoRally: Record<string, boolean>; developments: Record<string, RegionalDevelopment>;
  nodes: NestState[]; edges: TrailState[]; fleets: FleetState[];
  effects: EffectState[]; charges: number; chargeProgress: number;
  initialHabitat: number; events: GameEvent[]; discovered: string[];
  nextFleetId: number; stats: { orders: number; captures: number; interventions: number; losses: number; reinforcementOrders: number; reinforcementWorkers: number; automaticRallyOrders: number; automaticRallyWorkers: number; developmentOrders: number; developmentWorkers: number };
}
export interface SpecimenAsset {
  id: string; speciesId: SpeciesId; path: string; label: string; scientificName: string;
  photographer: string; license: string; licenseUrl: string; sourceUrl: string;
  sourceImageUrl: string; specimenCode?: string; viewerUrl?: string; reviewedAt: string; changes: string;
}
export interface RegionalContext {
  regionId: string; environment: string; ecologicalStakes: string; gameAbstraction: string;
  sourceIds: string[]; sourceUrls: { label: string; url: string }[]; reviewedAt: string;
}
export interface ResearchMapDataset {
  id: string; title: string; publicationYear: number; observationPeriod: string;
  method: string; precision: string; sourceUrl: string; reviewedAt: string;
  dataPath: string; summary: string; caveat: string;
  kind?: 'distribution' | 'recognition' | 'observations';
  snapshotDate?: string; license?: string; licenseUrl?: string;
}
export interface CommandResult { state: GameState; error?: string }
export interface BatchCommandResult extends CommandResult {
  sentFromIds: string[];
  skipped: { sourceId: string; reason: string }[];
}
export interface CombatResult { defenderRemaining: number; attackerRemaining: number; ownerChanged: boolean }

export interface RegionalDevelopment { gatewayId: string; startedAt: number; readyAt: number }
export interface GrowthInfo { base: number; current: number; capacity: number; multiplier: number; reason: 'growing' | 'paused' | 'unclaimed' | 'capacity' | 'finished'; development: 'none' | 'preparing' | 'active'; developmentRemaining: number }
export interface RallyInfo { gatewayId?: string; gatewayOwned: boolean; autoEnabled: boolean; eligibleSourceIds: string[]; waitingSourceIds: string[]; blockedSourceIds: string[]; canRally: boolean }
export interface NestRoleEntry { id: string; name: string; description: string; purpose: string }
export interface HabitatPhotoAsset { id: string; regionId: string; terrain: Terrain; path: string; caption: string; locality: string; creator: string; sourceUrl: string; imageUrl: string; license: string; licenseUrl: string; rightsEvidenceURL: string; reviewedAt: string; changes: string; sha256: string; originalSha256: string; width: number; height: number }

export interface ColonyProfile {
  id: string; label: string; regionId: string; networkId: 'main' | null;
  observationPeriod: string; sourceIds: string[]; sourceSampleId: string;
}
export interface HabitatAssignment {
  scenario: 'regional' | 'species'; regionId: string; roleId: string; photoId: string;
  description: string; reviewedAt: string;
}
export interface VisualSummary {
  factId: string; diagram: 'network' | 'growth' | 'foraging' | 'origin' | 'landscape' | 'recognition' | 'transport' | 'terrain' | 'anatomy' | 'foodweb' | 'habitat' | 'observation';
  labels: [string, string, string]; takeaway: string; resourceIds: string[];
}
export interface LearningActivityDefinition {
  id: 'anatomy' | 'terrain' | 'recognition'; title: string; factId: string; resourceIds: string[];
  steps: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[];
}
export interface ComicScene {
  id: string; title: string; panel: 0 | 1 | 2 | 3; narration: string; dialogue: string;
  fieldNote: string; factId: string; resourceIds: string[];
}
export interface ResearchViewState {
  dataset: string; sampleId: string; site: 'TPSR' | 'PLECA'; period: 'recent' | 'original';
  pointId: string; distributionStatus: string; distributionRegion: string;
  zoom: number; pan: [number, number];
}
