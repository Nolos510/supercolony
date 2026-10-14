import { regions, scenarios } from './scenarios';
import { colonyRelation, referencePopulation } from '../data/colonies';
import type {
  BatchCommandResult, ColonyRelation, CombatResult, CommandResult, FleetState, GameState, GrowthInfo, Intervention,
  ModeId, NestState, Owner, RallyInfo, SpeciesId, Terrain, TrailState,
} from './types';

const TICK = 0.1;
const CAPACITY = 110;
const EFFECT_SECONDS: Record<Intervention, number> = { habitat: 60, food: 45, transport: 45 };
const WORKERS: Record<SpeciesId, { growth: number; strength: number; capacity: number }> = {
  argentine: { growth: 0.95, strength: 1, capacity: CAPACITY },
  meat: { growth: 0.32, strength: 3, capacity: 54 },
  // Abstract native-community resistance; these are game parameters, not an ant species.
  native: { growth: 0.32, strength: 3, capacity: 54 },
};
const POSITIONS: [number, number][] = [[20, 38], [40, 25], [67, 23], [27, 69], [55, 61], [81, 70]];
const LOCAL_PAIRS: [number, number][] = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [4, 5], [2, 5]];
const PLACE_NAMES = ['Gateway nest', 'Garden edge', 'Open clearing', 'Shaded grove', 'Leaf-litter trail', 'Habitat margin'];
const WAR_RESERVES: Record<string, readonly number[]> = {
  california: [66, 32, 32, 30, 16, 18],
  mediterranean: [48, 10, 32, 30, 16, 18],
  japan: [48, 10, 32, 30, 16, 18],
  africa: [20, 10, 32, 30, 16, 18],
  australia: [48, 10, 32, 30, 16, 18],
  newzealand: [66, 32, 32, 30, 16, 18],
  hawaii: [20, 10, 32, 30, 16, 18],
};
/** Frozen game balance; these values are not measurements of ant populations. */
export const REGIONAL_BALANCE = {
  autoThreshold: 20, autoBatch: 10, developmentCost: 30,
  preparationSeconds: 20, growthMultiplier: 1.2,
} as const;

/** Ownership compatibility remains the policy for Species Clash and Ecologist. */
export function compatibleOwners(first: Owner, second: Owner): boolean {
  return first === second || (first === 'player' || first === 'ally') && (second === 'player' || second === 'ally');
}

type ColonyActor = Pick<NestState, 'owner' | 'colonyId' | 'species'>;

/** Unclaimed reserves are a game obstacle; they do not assert a colony relationship. */
export function nestRelation(state: GameState, first: ColonyActor, second: ColonyActor): ColonyRelation {
  if (second.owner === 'neutral') return 'hostile';
  if (state.mode === 'war') return colonyRelation(first.colonyId, second.colonyId);
  return compatibleOwners(first.owner, second.owner) ? 'friendly' : 'hostile';
}

export function compatibleNests(state: GameState, first: ColonyActor, second: ColonyActor): boolean {
  return nestRelation(state, first, second) === 'friendly';
}

function colonyId(owner: Owner, nestId: string): string {
  return owner === 'neutral' ? `simulated-${nestId}` : `simulated-${owner}-network`;
}

function warOwner(regionId: string, index: number, populationId: string): Owner {
  if (regionId === 'africa') return 'rival';
  if (regionId === 'california' && [0, 3].includes(index)) return 'player';
  if (index === 1) return 'ally';
  return ['US2', 'H2', 'SA'].includes(populationId) ? 'rival' : 'neutral';
}

function copy(state: GameState): GameState {
  return {
    ...state,
    nodes: state.nodes.map(node => ({ ...node })),
    edges: state.edges.map(edge => ({ ...edge })),
    fleets: state.fleets.map(fleet => ({ ...fleet, path: [...fleet.path] })),
    effects: state.effects.map(effect => ({ ...effect })),
    autoRally: { ...state.autoRally },
    developments: Object.fromEntries(Object.entries(state.developments).map(([regionId, development]) => [regionId, { ...development }])),
    events: state.events.map(event => ({ ...event })),
    discovered: [...state.discovered], stats: { ...state.stats },
  };
}

function record(state: GameState, message: string, factId: string) {
  if (!state.discovered.includes(factId)) state.discovered.push(factId);
  const id = (state.events.at(-1)?.id ?? 0) + 1;
  state.events.push({ id, time: state.time, message, factId });
  // Bound the event log during untimed expeditions.
  if (state.events.length > 40) state.events.shift();
}

function node(id: string, regionId: string, index: number, owner: Owner, species: SpeciesId): NestState {
  const [x, y] = POSITIONS[index % POSITIONS.length];
  const name = PLACE_NAMES[index % PLACE_NAMES.length];
  return {
    id, name, roleId: name.toLowerCase().replace(/ /g, '-'), regionId, x, y, owner, colonyId: colonyId(owner, id), species,
    units: owner === 'neutral' ? 8 + index * 2 : species === 'meat' ? 24 : 44,
    capacity: WORKERS[species].capacity, growth: WORKERS[species].growth,
    terrain: index === 3 || index === 4 ? 'complex' : 'open',
    habitat: 1, gateway: index === 0,
  };
}

function localEdges(regionId: string): TrailState[] {
  return LOCAL_PAIRS.map(([from, to], index) => ({
    id: `${regionId}-trail-${index}`, from: `${regionId}-${from}`, to: `${regionId}-${to}`,
    kind: 'local', travelSeconds: from === 0 && to === 1 ? 5 : 6 + index % 3,
  }));
}

export function createGame(mode: ModeId, playerSpecies: SpeciesId = 'argentine', seed = 42): GameState {
  const nodes: NestState[] = [];
  const edges: TrailState[] = [];
  if (mode === 'species') {
    const opposing: SpeciesId = playerSpecies === 'argentine' ? 'meat' : 'argentine';
    for (let i = 0; i < 12; i++) {
      const owner: Owner = i === 0 || i === 3 ? 'player' : i === 8 || i === 11 ? 'rival' : 'neutral';
      const species = owner === 'rival' ? opposing : playerSpecies;
      const site = node(`australia-${i}`, 'australia', i, owner, species);
      site.x = 13 + (i % 4) * 24;
      site.y = 22 + Math.floor(i / 4) * 27;
      site.name = ['Port verge', 'Sandy clearing', 'Scrub edge', 'Garden bed', 'Dry creek', 'Open track', 'Leaf litter', 'Woodland floor', 'Established nest', 'Bark corridor', 'Rocky refuge', 'Gravel mound'][i];
      site.roleId = site.name.toLowerCase().replace(/ /g, '-');
      site.terrain = [4, 6, 7, 10, 11].includes(i) ? 'complex' : 'open';
      site.gateway = i === 0;
      if (owner === 'neutral') site.units = 6 + i;
      if (owner !== 'neutral') site.units = species === 'argentine' ? 78 : 28;
      nodes.push(site);
    }
    for (let i = 0; i < 12; i++) {
      for (const target of [i % 4 < 3 ? i + 1 : -1, i < 8 ? i + 4 : -1]) {
        if (target < 0) continue;
        edges.push({ id: `australia-trail-${i}-${target}`, from: `australia-${i}`, to: `australia-${target}`, kind: 'local', travelSeconds: 5 + (i + target) % 3 });
      }
    }
  } else {
    regions.filter(region => !region.nativeRange).forEach((region, regionIndex) => {
      for (let i = 0; i < 6; i++) {
        let owner: Owner = i === 2 ? 'rival' : i === 3 ? 'player' : 'neutral';
        if (i === 0) owner = [0, 5].includes(regionIndex) ? 'player' : [1, 2, 4].includes(regionIndex) ? 'rival' : 'neutral';
        let species: SpeciesId = 'argentine';
        if (mode === 'ecologist') {
          owner = i === 0 || i === 2 ? 'rival' : 'player';
          species = owner === 'rival' ? 'argentine' : region.id === 'australia' ? 'meat' : 'native';
        }
        const sourcePopulationId = mode === 'war' ? referencePopulation(region.id, i) : undefined;
        if (mode === 'war') owner = warOwner(region.id, i, sourcePopulationId!);
        const site = node(`${region.id}-${i}`, region.id, i, owner, species);
        if (mode === 'war') {
          site.units = WAR_RESERVES[region.id][i];
          if (owner !== 'neutral') site.colonyId = sourcePopulationId!;
        }
        if (mode === 'ecologist') site.units = owner === 'rival' ? 65 : 18;
        nodes.push(sourcePopulationId ? { ...site, sourcePopulationId } : site);
      }
      edges.push(...localEdges(region.id));
    });
    const connections: [string, string, number][] = [
      ['california', 'hawaii', 23], ['california', 'mediterranean', 30],
      ['mediterranean', 'africa', 24], ['mediterranean', 'japan', 34],
      ['japan', 'australia', 27], ['australia', 'newzealand', 20], ['hawaii', 'japan', 28],
    ];
    const presentRegions = new Set(nodes.map(site => site.regionId));
    connections.filter(([from, to]) => presentRegions.has(from) && presentRegions.has(to)).forEach(([from, to, travelSeconds]) => edges.push({
      id: `dispersal-${from}-${to}`, from: `${from}-0`, to: `${to}-0`, kind: 'overseas', travelSeconds,
    }));
  }
  const normalizedSeed = Number.isFinite(seed) ? seed >>> 0 : 42;
  const state: GameState = {
    mode, playerSpecies, seed: normalizedSeed, rng: normalizedSeed || 1,
    time: 0, duration: scenarios[mode].duration, status: 'running', aiEnabled: true,
    nodes, edges, fleets: [], effects: [], charges: 3, chargeProgress: 0, autoRally: {}, developments: {},
    initialHabitat: nodes.reduce((sum, site) => sum + site.habitat, 0),
    events: [], discovered: [], nextFleetId: 1,
    stats: { orders: 0, captures: 0, interventions: 0, losses: 0, reinforcementOrders: 0, reinforcementWorkers: 0, automaticRallyOrders: 0, automaticRallyWorkers: 0, developmentOrders: 0, developmentWorkers: 0 },
  };
  record(state, mode === 'ecologist' ? 'Protect habitat while the simulated invasion unfolds.' : mode === 'species' ? 'More workers or stronger workers? Terrain changes the contest.' : 'Your nests share one network. Select a nest to issue an order.', mode === 'ecologist' ? 'biodiversity' : mode === 'species' ? 'species' : 'supercolonies');
  return state;
}

function activeEffect(state: GameState, nodeId: string, kind: Intervention): boolean {
  return state.effects.some(effect => effect.nodeId === nodeId && effect.kind === kind && effect.expires > state.time);
}

function blocked(state: GameState, edge: TrailState): boolean {
  return edge.kind === 'overseas' && (activeEffect(state, edge.from, 'transport') || activeEffect(state, edge.to, 'transport'));
}

function mayUseEdge(state: GameState, edge: TrailState, species: SpeciesId): boolean {
  if (blocked(state, edge)) return false;
  // Ecologist transport represents dispersal of the invading Argentine ants only.
  return edge.kind !== 'overseas' || species !== 'native' && (state.mode !== 'ecologist' || species === 'argentine');
}

function strength(species: SpeciesId, terrain: Terrain): number {
  const complexity = terrain === 'complex' && species !== 'argentine' ? 1.6 : 1;
  return WORKERS[species].strength * complexity;
}

function edgeBetween(state: GameState, from: string, to: string): TrailState | undefined {
  return state.edges.find(edge => edge.from === from && edge.to === to || edge.from === to && edge.to === from);
}

/** Shortest-time route; a hostile nest may be the destination, never a shortcut. */
function route(state: GameState, fromId: string, toId: string, actor: ColonyActor): string[] | undefined {
  const destination = state.nodes.find(site => site.id === toId);
  if (!destination || nestRelation(state, actor, destination) === 'unknown') return undefined;
  const distances = new Map<string, number>([[fromId, 0]]);
  const previous = new Map<string, string>();
  const remaining = new Set(state.nodes.map(site => site.id));
  while (remaining.size) {
    let current: string | undefined;
    let shortest = Infinity;
    for (const candidate of remaining) {
      const distance = distances.get(candidate) ?? Infinity;
      if (distance < shortest) { shortest = distance; current = candidate; }
    }
    if (!current) break;
    remaining.delete(current);
    if (current === toId) {
      const path = [current];
      while (path[0] !== fromId) path.unshift(previous.get(path[0])!);
      return path;
    }
    for (const edge of state.edges) {
      if (!mayUseEdge(state, edge, actor.species)) continue;
      const next = edge.from === current ? edge.to : edge.to === current ? edge.from : undefined;
      if (!next || !remaining.has(next)) continue;
      const site = state.nodes.find(item => item.id === next)!;
      if (next !== toId && !compatibleNests(state, actor, site)) continue;
      const tentative = shortest + edge.travelSeconds;
      if (tentative < (distances.get(next) ?? Infinity)) {
        distances.set(next, tentative); previous.set(next, current);
      }
    }
  }
  return undefined;
}

function dispatchUnits(state: GameState, source: NestState, path: string[], units: number) {
  source.units -= units;
  state.fleets.push({ id: state.nextFleetId++, owner: source.owner, colonyId: source.colonyId, species: source.species, units, path, legIndex: 0, elapsed: 0 });
}

function dispatch(state: GameState, source: NestState, path: string[], fraction: number) {
  dispatchUnits(state, source, path, Math.floor(source.units * fraction));
}

export function send(state: GameState, fromId: string, toId: string, fraction: number): CommandResult {
  if (state.status !== 'running') return { state, error: 'Resume the match before sending workers.' };
  if (state.mode === 'ecologist') return { state, error: 'Choose a habitat intervention in Ecologist mode.' };
  if (!Number.isFinite(fraction) || fraction <= 0 || fraction > 1) return { state, error: 'Choose a worker share between 1% and 100%.' };
  const source = state.nodes.find(site => site.id === fromId);
  const target = state.nodes.find(site => site.id === toId);
  if (!source || !target) return { state, error: 'Choose two nests on this map.' };
  if (source.owner !== 'player') return { state, error: 'Select a nest belonging to your colony first.' };
  if (fromId === toId) return { state, error: 'Choose a different destination nest.' };
  if (Math.floor(source.units * fraction) < 1) return { state, error: 'This nest needs more workers before it can send a swarm.' };
  const relation = nestRelation(state, source, target);
  if (relation === 'unknown') return { state, error: 'Recognition between these colonies is unknown. No workers were sent for an unreported relationship.' };
  const path = route(state, fromId, toId, source);
  if (!path) return { state, error: 'No open route. Capture the connecting nest or wait for transport to reopen.' };
  const next = copy(state);
  dispatch(next, next.nodes.find(site => site.id === fromId)!, path, fraction);
  next.stats.orders++;
  const units = Math.floor(source.units * fraction);
  const reinforcement = relation === 'friendly';
  if (reinforcement) {
    next.stats.reinforcementOrders++;
    next.stats.reinforcementWorkers += units;
  }
  const overseas = path.some((id, index) => index > 0 && edgeBetween(state, path[index - 1], id)?.kind === 'overseas');
  const terrain = path.some(id => state.nodes.find(site => site.id === id)?.terrain === 'complex');
  const factId = target.owner === 'ally' ? 'recognition' : overseas ? 'transport' : terrain && state.mode === 'species' ? 'terrain' : 'budding';
  record(next, `${units} workers sent to ${target.name}${target.owner === 'ally' ? ' in the cooperating network' : ''}${overseas ? ' by simulated transport' : ''}.`, factId);
  return { state: next };
}

/** Independently dispatch unique selected nests; unsuccessful sources stay untouched. */
export function sendMany(state: GameState, sourceIds: string[], toId: string, fraction: number): BatchCommandResult {
  const sentFromIds: string[] = [];
  const skipped: BatchCommandResult['skipped'] = [];
  const reject = (error: string): BatchCommandResult => ({ state, sentFromIds, skipped, error });
  if (state.status !== 'running') return reject('Resume the match before sending workers.');
  if (state.mode === 'ecologist') return reject('Choose a habitat intervention in Ecologist mode.');
  if (!Number.isFinite(fraction) || fraction <= 0 || fraction > 1) return reject('Choose a worker share between 1% and 100%.');
  if (!state.nodes.some(site => site.id === toId)) return reject('Choose a destination nest on this map.');
  const sources = [...new Set(sourceIds)].filter(sourceId => sourceId !== toId);
  if (!sources.length) return reject('Select at least one owned source nest other than the destination.');

  let next = state;
  for (const sourceId of sources) {
    const result = send(next, sourceId, toId, fraction);
    if (result.error) skipped.push({ sourceId, reason: result.error });
    else { next = result.state; sentFromIds.push(sourceId); }
  }
  return {
    state: next, sentFromIds, skipped,
    ...(sentFromIds.length ? {} : { error: 'No swarms were sent. Review the selected source nests.' }),
  };
}

function regionalGateway(state: GameState, regionId: string): NestState | undefined {
  return state.nodes.find(site => site.regionId === regionId && site.gateway);
}

/** Uses the engine's routes so the waiting preview agrees with actual orders. */
export function rallyInfo(state: GameState, regionId: string, fraction = 1): RallyInfo {
  const gateway = regionalGateway(state, regionId);
  const gatewayOwned = gateway?.owner === 'player';
  const eligibleSourceIds: string[] = [];
  const waitingSourceIds: string[] = [];
  const blockedSourceIds: string[] = [];
  const validFraction = Number.isFinite(fraction) && fraction > 0 && fraction <= 1;
  for (const source of state.nodes) {
    if (source.regionId !== regionId || source.owner !== 'player' || source.gateway) continue;
    if (!gateway || !compatibleNests(state, source, gateway) || !route(state, source.id, gateway.id, source)) {
      blockedSourceIds.push(source.id);
      continue;
    }
    if (source.units < REGIONAL_BALANCE.autoThreshold) waitingSourceIds.push(source.id);
    if (validFraction && Math.floor(source.units * fraction) >= 1) eligibleSourceIds.push(source.id);
  }
  return {
    gatewayId: gateway?.id, gatewayOwned,
    autoEnabled: gatewayOwned && !!state.autoRally[regionId],
    eligibleSourceIds, waitingSourceIds, blockedSourceIds,
    canRally: state.status === 'running' && state.mode !== 'ecologist' && gatewayOwned && eligibleSourceIds.length > 0,
  };
}

/** A rally is a batch of ordinary orders; cooperating nests remain AI-controlled. */
export function rallyRegion(state: GameState, regionId: string, fraction: number): BatchCommandResult {
  const reject = (error: string): BatchCommandResult => ({ state, error, sentFromIds: [], skipped: [] });
  if (state.status !== 'running') return reject('Resume the match before rallying workers.');
  if (state.mode === 'ecologist') return reject('Choose a habitat intervention in Ecologist mode.');
  if (!Number.isFinite(fraction) || fraction <= 0 || fraction > 1) return reject('Choose a worker share between 1% and 100%.');
  const gateway = regionalGateway(state, regionId);
  if (!gateway) return reject('Choose a region with a gateway on this map.');
  if (gateway.owner !== 'player') return reject('Capture this region’s gateway before rallying workers.');
  const sources = state.nodes.filter(site => site.regionId === regionId && site.owner === 'player' && !site.gateway);
  const friendly = sources.filter(site => compatibleNests(state, site, gateway));
  const incompatible = sources.filter(site => !compatibleNests(state, site, gateway)).map(site => ({
    sourceId: site.id,
    reason: nestRelation(state, site, gateway) === 'unknown'
      ? 'Recognition is unknown; this source cannot reinforce the gateway.'
      : 'This colony cannot reinforce the gateway.',
  }));
  const result = sendMany(state, friendly.map(site => site.id), gateway.id, fraction);
  return { ...result, skipped: [...result.skipped, ...incompatible] };
}

/** Configuration can change while paused; swarms launch only during game ticks. */
export function setAutoRally(state: GameState, regionId: string, enabled: boolean): CommandResult {
  if (state.mode === 'ecologist') return { state, error: 'Automatic rally is available in combat modes.' };
  if (!['running', 'paused'].includes(state.status)) return { state, error: 'Start a new match before changing automatic rally.' };
  if (typeof enabled !== 'boolean') return { state, error: 'Choose whether automatic rally is on or off.' };
  const gateway = regionalGateway(state, regionId);
  if (!gateway) return { state, error: 'Choose a region with a gateway on this map.' };
  if (enabled && gateway.owner !== 'player') return { state, error: 'Capture this region’s gateway before enabling automatic rally.' };
  if (!!state.autoRally[regionId] === enabled) return { state };
  const next = copy(state);
  if (enabled) next.autoRally[regionId] = true;
  else delete next.autoRally[regionId];
  return { state: next };
}

export function developRegion(state: GameState, regionId: string): CommandResult {
  if (state.mode === 'ecologist') return { state, error: 'Foraging development is available in combat modes.' };
  if (state.status !== 'running') return { state, error: 'Resume the match before improving a foraging network.' };
  const gateway = regionalGateway(state, regionId);
  if (!gateway) return { state, error: 'Choose a region with a gateway on this map.' };
  if (gateway.owner !== 'player') return { state, error: 'Capture this region’s gateway before improving its foraging network.' };
  if (state.developments[regionId]) return { state, error: 'This region already has a foraging development.' };
  if (gateway.units < REGIONAL_BALANCE.developmentCost) return { state, error: 'The gateway needs 30 worker game units to fund this improvement.' };
  const next = copy(state);
  next.nodes.find(site => site.id === gateway.id)!.units -= REGIONAL_BALANCE.developmentCost;
  next.developments[regionId] = {
    gatewayId: gateway.id, startedAt: next.time, readyAt: next.time + REGIONAL_BALANCE.preparationSeconds,
  };
  next.stats.developmentOrders++;
  next.stats.developmentWorkers += REGIONAL_BALANCE.developmentCost;
  record(next, '30 worker game units committed to a foraging network. Preparation takes 20 game seconds; gateway loss removes the improvement.', 'foraging-development');
  return { state: next };
}

/** Growth replenishes game reserves, not measured births or real population rates. */
export function growthInfo(state: GameState, site: NestState): GrowthInfo {
  const investment = state.mode !== 'ecologist' && site.owner === 'player' ? state.developments[site.regionId] : undefined;
  const development = investment && state.nodes.some(gateway => gateway.id === investment.gatewayId && gateway.gateway && gateway.owner === 'player')
    ? investment : undefined;
  const phase: GrowthInfo['development'] = !development ? 'none' : state.time + 1e-8 < development.readyAt ? 'preparing' : 'active';
  const foodMultiplier = activeEffect(state, site.id, 'food') && site.species === 'argentine' ? 0.15 : 1;
  const multiplier = foodMultiplier * (phase === 'active' ? REGIONAL_BALANCE.growthMultiplier : 1);
  const reason: GrowthInfo['reason'] = state.status === 'paused' ? 'paused'
    : state.status !== 'running' ? 'finished'
      : site.owner === 'neutral' ? 'unclaimed'
        : site.units >= site.capacity ? 'capacity' : 'growing';
  const base = Number.isFinite(site.growth) ? Math.max(0, site.growth) : 0;
  return {
    base, current: reason === 'growing' ? base * multiplier : 0,
    capacity: site.capacity, multiplier, reason, development: phase,
    developmentRemaining: development ? Math.max(0, development.readyAt - state.time) : 0,
  };
}

function invalidateGateway(state: GameState, site: NestState, capturedFromPlayer = false) {
  if (!site.gateway || site.owner === 'player' && !capturedFromPlayer) return;
  delete state.autoRally[site.regionId];
  delete state.developments[site.regionId];
}

function validateRegionalState(state: GameState) {
  for (const regionId of Object.keys(state.autoRally)) {
    if (regionalGateway(state, regionId)?.owner !== 'player') delete state.autoRally[regionId];
  }
  for (const [regionId, development] of Object.entries(state.developments)) {
    const gateway = regionalGateway(state, regionId);
    if (!gateway || gateway.owner !== 'player' || gateway.id !== development.gatewayId) delete state.developments[regionId];
  }
}

function autoRally(state: GameState) {
  if (state.mode === 'ecologist') return;
  for (const source of state.nodes) {
    if (!state.autoRally[source.regionId] || source.owner !== 'player' || source.gateway || source.units < REGIONAL_BALANCE.autoThreshold) continue;
    const gateway = regionalGateway(state, source.regionId);
    if (!gateway || gateway.owner !== 'player' || !compatibleNests(state, source, gateway)) continue;
    const path = route(state, source.id, gateway.id, source);
    if (!path) continue;
    dispatchUnits(state, source, path, REGIONAL_BALANCE.autoBatch);
    state.stats.automaticRallyOrders++;
    state.stats.automaticRallyWorkers += REGIONAL_BALANCE.autoBatch;
  }
}

export function intervene(state: GameState, nodeId: string, kind: Intervention): CommandResult {
  if (state.mode !== 'ecologist') return { state, error: 'Interventions are available in Ecologist mode.' };
  if (state.status !== 'running') return { state, error: 'Resume the match before applying an intervention.' };
  if (!Object.hasOwn(EFFECT_SECONDS, kind)) return { state, error: 'Choose habitat, food, or transport.' };
  const site = state.nodes.find(item => item.id === nodeId);
  if (!site) return { state, error: 'Select a habitat site first.' };
  if (state.charges < 1) return { state, error: 'Your next intervention charge is still replenishing.' };
  if (activeEffect(state, nodeId, kind)) return { state, error: 'This intervention is already active at this site.' };
  if (kind === 'transport' && !site.gateway) return { state, error: 'Select a gateway nest to restrict simulated transport.' };
  const next = copy(state);
  next.charges--;
  next.effects.push({ nodeId, kind, expires: next.time + EFFECT_SECONDS[kind] });
  next.stats.interventions++;
  const labels = { habitat: 'Habitat complexity restored', food: 'Human food subsidy reduced', transport: 'Simulated transport restricted' };
  record(next, `${labels[kind]} at ${site.name} for ${EFFECT_SECONDS[kind]} seconds.`, kind === 'habitat' ? 'habitats' : kind === 'food' ? 'honeydew' : 'prevention');
  return { state: next };
}

/** Balanced worker coefficients illustrate the study's direction, not field mortality. */
export function resolveCombat(defenderUnits: number, attackerUnits: number, defenderSpecies: SpeciesId, attackerSpecies: SpeciesId, terrain: Terrain): CombatResult {
  const defenders = Math.max(0, Number.isFinite(defenderUnits) ? defenderUnits : 0);
  const attackers = Math.max(0, Number.isFinite(attackerUnits) ? attackerUnits : 0);
  const defense = defenders * strength(defenderSpecies, terrain);
  const attack = attackers * strength(attackerSpecies, terrain);
  if (attack > defense) return { defenderRemaining: 0, attackerRemaining: (attack - defense) / strength(attackerSpecies, terrain), ownerChanged: true };
  return { defenderRemaining: (defense - attack) / strength(defenderSpecies, terrain), attackerRemaining: 0, ownerChanged: false };
}

export function territory(state: GameState): Record<Owner, number> {
  return state.nodes.reduce((counts, site) => { counts[site.owner]++; return counts; }, { player: 0, ally: 0, rival: 0, neutral: 0 });
}

export function habitat(state: GameState): number {
  if (state.initialHabitat <= 0) return 0;
  return Math.min(1, Math.max(0, state.nodes.reduce((sum, site) => sum + site.habitat, 0) / state.initialHabitat));
}

function random(state: GameState): number {
  state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}

function ai(state: GameState) {
  if (!state.aiEnabled) return;
  const ready = state.nodes.filter(site => (site.owner === 'rival' || site.owner === 'ally') && site.units >= (site.species === 'meat' ? 22 : 32));
  for (const source of ready) {
    if (source.owner === 'ally') {
      // Give depleted player nests dependable help before choosing an attack.
      const support = state.nodes.filter(site => site.owner === 'player' && compatibleNests(state, source, site) && site.units < Math.min(24, site.capacity * 0.3))
        .map(site => ({ site, path: route(state, source.id, site.id, source) }))
        .filter((candidate): candidate is { site: NestState; path: string[] } => !!candidate.path)
        .sort((first, second) => first.site.units - second.site.units || first.path.length - second.path.length);
      if (support.length) {
        dispatch(state, source, support[0].path, 0.5);
        continue;
      }
    }
    if (random(state) > 0.35) continue;
    const adjacent = state.edges.filter(edge => (edge.from === source.id || edge.to === source.id) && mayUseEdge(state, edge, source.species));
    const candidates = adjacent.map(edge => ({ edge, site: state.nodes.find(item => item.id === (edge.from === source.id ? edge.to : edge.from))! }))
      .filter(({ site }) => {
        if (source.owner === 'ally' && site.owner !== 'rival') return false;
        return nestRelation(state, source, site) === 'hostile';
      });
    if (!candidates.length) continue;
    const fraction = 0.6 + random(state) * 0.2;
    candidates.sort((a, b) => {
      const aDefense = a.site.units * strength(a.site.species, a.site.terrain);
      const bDefense = b.site.units * strength(b.site.species, b.site.terrain);
      return aDefense + a.edge.travelSeconds * 0.7 - bDefense - b.edge.travelSeconds * 0.7;
    });
    const target = candidates[0].site;
    // Wait to muster an effective attack; recruitment is a strategic resource.
    const outcome = resolveCombat(target.units, source.units * fraction, target.species, source.species, target.terrain);
    if (!outcome.ownerChanged && random(state) > 0.12) continue;
    dispatch(state, source, [source.id, target.id], fraction);
  }
}

function arrive(state: GameState, fleet: FleetState, site: NestState): boolean {
  if (compatibleNests(state, fleet, site)) {
    if (fleet.legIndex === fleet.path.length - 2) { site.units += fleet.units; return true; }
    return false;
  }
  const terrain = activeEffect(state, site.id, 'habitat') ? 'complex' : site.terrain;
  const result = resolveCombat(site.units, fleet.units, site.species, fleet.species, terrain);
  const wasPlayer = site.owner === 'player';
  site.units = result.ownerChanged ? result.attackerRemaining : result.defenderRemaining;
  if (result.ownerChanged) {
    site.owner = fleet.owner; site.colonyId = fleet.colonyId; site.species = fleet.species;
    site.capacity = WORKERS[fleet.species].capacity; site.growth = WORKERS[fleet.species].growth;
    // Invalidate at the actual loss, including a loss followed by same-tick recapture.
    invalidateGateway(state, site, wasPlayer);
    if (fleet.owner === 'player') {
      state.stats.captures++;
      record(state, `${site.name} joins your colony network.`, state.mode === 'species' ? 'terrain' : 'recognition');
    } else if (wasPlayer) {
      state.stats.losses++;
      record(state, `${site.name} was taken by a rival colony.`, state.mode === 'ecologist' ? 'biodiversity' : 'recognition');
    } else if (fleet.owner === 'ally') {
      record(state, `${site.name} joins the cooperating network.`, 'recognition');
    }
  }
  // An order stops at the first hostile encounter, even if that nest changes hands in flight.
  return true;
}

function moveFleets(state: GameState, dt: number) {
  const surviving: FleetState[] = [];
  for (const fleet of state.fleets) {
    const edge = edgeBetween(state, fleet.path[fleet.legIndex], fleet.path[fleet.legIndex + 1]);
    if (!edge) {
      // A malformed route is returned to its current nest instead of deleting workers.
      const origin = state.nodes.find(site => site.id === fleet.path[fleet.legIndex]);
      if (origin && compatibleNests(state, fleet, origin)) origin.units += fleet.units;
      else surviving.push(fleet);
      continue;
    }
    if (edge.kind === 'overseas' && (fleet.species === 'native' || state.mode === 'ecologist' && fleet.species !== 'argentine')) {
      const origin = state.nodes.find(site => site.id === fleet.path[fleet.legIndex]);
      if (origin && compatibleNests(state, fleet, origin)) origin.units += fleet.units;
      else surviving.push(fleet);
      continue;
    }
    if (blocked(state, edge)) { surviving.push(fleet); continue; }
    const travelSeconds = edge.travelSeconds * (fleet.species === 'meat' ? 1.15 : 1);
    const previousElapsed = fleet.elapsed;
    fleet.elapsed += dt;
    if (fleet.elapsed + 1e-8 < travelSeconds) { surviving.push(fleet); continue; }
    const destination = state.nodes.find(site => site.id === fleet.path[fleet.legIndex + 1])!;
    if (nestRelation(state, fleet, destination) === 'unknown') {
      if (!fleet.withdrawing) {
        // Include the failed arrival, then retrace only the route already travelled.
        // Do not increment legIndex afterwards: the return starts on its first edge.
        fleet.path = [destination.id, ...fleet.path.slice(0, fleet.legIndex + 1).reverse()];
        fleet.legIndex = 0;
        fleet.elapsed = 0;
        fleet.withdrawing = true;
        record(state, 'An unreported recognition relationship blocked arrival. The swarm is returning along its traversed route.', 'recognition');
      } else {
        // A changed return destination may also be unknown. Wait for a known
        // relationship instead of deleting workers or bouncing indefinitely.
        if (previousElapsed + 1e-8 < travelSeconds) {
          record(state, 'The return path has an unknown recognition relationship. Workers wait without fighting until its destination changes.', 'recognition');
        }
        fleet.elapsed = travelSeconds;
      }
      surviving.push(fleet);
      continue;
    }
    if (arrive(state, fleet, destination)) continue;
    fleet.legIndex++; fleet.elapsed = 0;
    surviving.push(fleet);
  }
  state.fleets = surviving;
}

function growAndEcology(state: GameState, dt: number) {
  for (const site of state.nodes) {
    const habitatEffect = activeEffect(state, site.id, 'habitat');
    const foodEffect = activeEffect(state, site.id, 'food');
    const growth = growthInfo(state, site);
    if (growth.current > 0) site.units = Math.min(site.capacity, site.units + growth.current * dt);
    if (state.mode !== 'ecologist') continue;
    const invasive = site.owner === 'rival' && site.species === 'argentine';
    let change = invasive ? -0.0036 * (0.45 + site.units / 110) : 0.0002;
    if (!invasive) {
      // Simulated local foraging pressure affects habitat before a nest changes hands.
      // These coefficients are balance values, not measurements of ecological decline.
      for (const edge of state.edges) {
        if (edge.kind !== 'local') continue;
        const neighborId = edge.from === site.id ? edge.to : edge.to === site.id ? edge.from : undefined;
        if (!neighborId) continue;
        const neighbor = state.nodes.find(item => item.id === neighborId)!;
        if (neighbor.owner !== 'rival' || neighbor.species !== 'argentine') continue;
        const mitigated = activeEffect(state, neighbor.id, 'habitat') || activeEffect(state, neighbor.id, 'food');
        change -= 0.0005 * (mitigated ? 0.2 : 1);
      }
    }
    if (invasive && site.terrain === 'complex') change *= 0.45;
    if (foodEffect && invasive) change *= 0.2;
    if (habitatEffect) change = Math.max(0.004, change * 0.1);
    site.habitat = Math.min(1, Math.max(0, site.habitat + change * dt));
  }
}

function finishSurvey(state: GameState) {
  state.status = habitat(state) + 1e-9 >= 0.6 ? 'won' : 'lost';
  record(state, 'The habitat survey is complete. Explore ways to observe and protect biodiversity.', 'observation');
}

function evaluateElimination(state: GameState) {
  const belongs = (actor: ColonyActor, owner: Owner) => actor.owner === owner
    && (state.mode !== 'war' || owner !== 'rival' || colonyRelation('US1', actor.colonyId) !== 'friendly');
  const alive = (owner: Owner) => state.nodes.some(site => belongs(site, owner))
    || state.fleets.some(fleet => belongs(fleet, owner) && fleet.units > 0);
  const playerAlive = alive('player');
  const rivalAlive = alive('rival');
  if (playerAlive && rivalAlive) return;
  state.status = playerAlive ? 'won' : rivalAlive ? 'lost' : 'draw';
  const message = state.status === 'won'
    ? state.mode === 'war'
      ? 'The rival colonies have no nests or workers in transit. Your colony survives.'
      : 'The rival colony has no nests or workers in transit. Your colony survives.'
    : state.status === 'lost'
      ? 'Your colony has no nests or workers in transit. Review the expedition and try a new strategy.'
      : 'Neither colony has nests or workers in transit. The expedition ends without a surviving colony.';
  record(state, message, state.mode === 'species' ? 'species' : 'recognition');
}

/** A fixed 100 ms tick. Hosts accumulate frame time before passing complete ticks. */
export function advance(state: GameState, seconds: number): GameState {
  if (state.status !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return state;
  const ticks = Math.floor((seconds + 1e-8) / TICK);
  if (!ticks) return state;
  const next = copy(state);
  for (let tick = 0; tick < ticks && next.status === 'running'; tick++) {
    next.time = Math.round((next.time + TICK) * 10) / 10;
    if (next.mode === 'ecologist' && next.duration !== null) next.time = Math.min(next.duration, next.time);
    next.effects = next.effects.filter(effect => effect.expires > next.time);
    validateRegionalState(next);
    growAndEcology(next, TICK);
    moveFleets(next, TICK);
    // Integer game seconds only; no UI or wall-clock timer controls rallying.
    if (Math.round(next.time * 10) % 10 === 0) autoRally(next);
    if (Math.round(next.time * 10) % 160 === 0) ai(next);
    if (next.mode === 'ecologist') {
      if (next.charges < 3) {
        next.chargeProgress += TICK;
        if (next.chargeProgress + 1e-8 >= 15) { next.charges++; next.chargeProgress = 0; }
      } else next.chargeProgress = 0;
      if (next.duration !== null && next.time >= next.duration) finishSurvey(next);
    } else evaluateElimination(next);
  }
  return next;
}
