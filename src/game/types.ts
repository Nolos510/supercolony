export type ModeId = 'war' | 'species' | 'ecologist';
export type SpeciesId = 'argentine' | 'meat' | 'native';
export type Owner = 'player' | 'rival' | 'neutral';
export type Terrain = 'open' | 'complex';
export type Intervention = 'habitat' | 'food' | 'transport';
export type MatchStatus = 'running' | 'paused' | 'won' | 'lost' | 'draw';
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
  type: 'paper' | 'official-guide' | 'citizen-science' | 'conservation-group';
  summary: string; regionLabel: string; regionIds: string[]; topics: string[];
  speciesIds: SpeciesId[]; reviewedAt: string; year?: number;
}
export interface NestState {
  id: string; name: string; regionId: string; x: number; y: number;
  owner: Owner; species: SpeciesId; units: number; capacity: number; growth: number;
  terrain: Terrain; habitat: number; gateway: boolean;
}
export interface TrailState { id: string; from: string; to: string; kind: 'local' | 'overseas'; travelSeconds: number }
export interface FleetState {
  id: number; owner: Owner; species: SpeciesId; units: number;
  path: string[]; legIndex: number; elapsed: number;
}
export interface EffectState { nodeId: string; kind: Intervention; expires: number }
export interface GameEvent { id: number; time: number; message: string; factId: string }
export interface GameState {
  mode: ModeId; playerSpecies: SpeciesId; seed: number; rng: number;
  time: number; duration: number | null; status: MatchStatus; aiEnabled: boolean;
  nodes: NestState[]; edges: TrailState[]; fleets: FleetState[];
  effects: EffectState[]; charges: number; chargeProgress: number;
  initialHabitat: number; events: GameEvent[]; discovered: string[];
  nextFleetId: number; stats: { orders: number; captures: number; interventions: number; losses: number };
}
export interface CommandResult { state: GameState; error?: string }
export interface CombatResult { defenderRemaining: number; attackerRemaining: number; ownerChanged: boolean }
