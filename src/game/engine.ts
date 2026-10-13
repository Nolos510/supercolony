import { regions, scenarios } from './scenarios';
import type {
  CombatResult, CommandResult, FleetState, GameState, Intervention,
  ModeId, NestState, Owner, SpeciesId, Terrain, TrailState,
} from './types';

const TICK = 0.1;
const CAPACITY = 110;
const DOMINANCE_SHARE = 0.6;
const DOMINANCE_SECONDS = 20;
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

function copy(state: GameState): GameState {
  return {
    ...state,
    nodes: state.nodes.map(node => ({ ...node })),
    edges: state.edges.map(edge => ({ ...edge })),
    fleets: state.fleets.map(fleet => ({ ...fleet, path: [...fleet.path] })),
    effects: state.effects.map(effect => ({ ...effect })),
    events: state.events.map(event => ({ ...event })),
    discovered: [...state.discovered], stats: { ...state.stats },
  };
}

function record(state: GameState, message: string, factId: string) {
  if (!state.discovered.includes(factId)) state.discovered.push(factId);
  const id = (state.events.at(-1)?.id ?? 0) + 1;
  state.events.push({ id, time: state.time, message, factId });
  // The last forty reports are enough for a five-minute round and bound UI work.
  if (state.events.length > 40) state.events.shift();
}

function node(id: string, regionId: string, index: number, owner: Owner, species: SpeciesId): NestState {
  const [x, y] = POSITIONS[index % POSITIONS.length];
  return {
    id, name: PLACE_NAMES[index % PLACE_NAMES.length], regionId, x, y, owner, species,
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
      site.name = ['Port verge', 'Sandy clearing', 'Scrub edge', 'Garden bed', 'Dry creek', 'Open track', 'Leaf litter', 'Woodland floor', 'Native nest', 'Bark corridor', 'Rocky refuge', 'Meat-ant mound'][i];
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
    regions.forEach((region, regionIndex) => {
      for (let i = 0; i < 6; i++) {
        let owner: Owner = i === 2 ? 'rival' : i === 3 ? 'player' : 'neutral';
        if (i === 0) owner = [0, 5].includes(regionIndex) ? 'player' : [1, 2, 4].includes(regionIndex) ? 'rival' : 'neutral';
        let species: SpeciesId = 'argentine';
        if (mode === 'ecologist') {
          owner = i === 0 || i === 2 ? 'rival' : 'player';
          species = owner === 'rival' ? 'argentine' : region.id === 'australia' ? 'meat' : 'native';
        }
        const site = node(`${region.id}-${i}`, region.id, i, owner, species);
        if (mode === 'war' && i === 0) site.units = owner === 'player' ? 66 : owner === 'rival' ? 48 : 20;
        if (mode === 'war' && i === 2) site.units = 32;
        if (mode === 'war' && i === 3) site.units = 30;
        if (mode === 'ecologist') site.units = owner === 'rival' ? 65 : 18;
        nodes.push(site);
      }
      edges.push(...localEdges(region.id));
    });
    const connections: [string, string, number][] = [
      ['california', 'hawaii', 23], ['california', 'mediterranean', 30],
      ['mediterranean', 'africa', 24], ['mediterranean', 'japan', 34],
      ['japan', 'australia', 27], ['australia', 'newzealand', 20], ['hawaii', 'japan', 28],
    ];
    connections.forEach(([from, to, travelSeconds]) => edges.push({
      id: `dispersal-${from}-${to}`, from: `${from}-0`, to: `${to}-0`, kind: 'overseas', travelSeconds,
    }));
  }
  const normalizedSeed = Number.isFinite(seed) ? seed >>> 0 : 42;
  const state: GameState = {
    mode, playerSpecies, seed: normalizedSeed, rng: normalizedSeed || 1,
    time: 0, duration: scenarios[mode].duration, status: 'running', aiEnabled: true,
    nodes, edges, fleets: [], effects: [], charges: 3, chargeProgress: 0,
    dominanceTime: 0, initialHabitat: nodes.reduce((sum, site) => sum + site.habitat, 0),
    events: [], discovered: [], nextFleetId: 1,
    stats: { orders: 0, captures: 0, interventions: 0, losses: 0 },
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
function route(state: GameState, fromId: string, toId: string, owner: Owner, species: SpeciesId): string[] | undefined {
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
      if (!mayUseEdge(state, edge, species)) continue;
      const next = edge.from === current ? edge.to : edge.to === current ? edge.from : undefined;
      if (!next || !remaining.has(next)) continue;
      const site = state.nodes.find(item => item.id === next)!;
      if (next !== toId && site.owner !== owner) continue;
      const tentative = shortest + edge.travelSeconds;
      if (tentative < (distances.get(next) ?? Infinity)) {
        distances.set(next, tentative); previous.set(next, current);
      }
    }
  }
  return undefined;
}

function dispatch(state: GameState, source: NestState, path: string[], fraction: number) {
  const units = Math.floor(source.units * fraction);
  source.units -= units;
  state.fleets.push({ id: state.nextFleetId++, owner: source.owner, species: source.species, units, path, legIndex: 0, elapsed: 0 });
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
  const path = route(state, fromId, toId, 'player', source.species);
  if (!path) return { state, error: 'No open route. Capture the connecting nest or wait for transport to reopen.' };
  const next = copy(state);
  dispatch(next, next.nodes.find(site => site.id === fromId)!, path, fraction);
  next.stats.orders++;
  const overseas = path.some((id, index) => index > 0 && edgeBetween(state, path[index - 1], id)?.kind === 'overseas');
  const terrain = path.some(id => state.nodes.find(site => site.id === id)?.terrain === 'complex');
  const factId = overseas ? 'transport' : terrain && state.mode === 'species' ? 'terrain' : 'budding';
  record(next, `${Math.floor(source.units * fraction)} workers sent to ${target.name}${overseas ? ' by simulated transport' : ''}.`, factId);
  return { state: next };
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

export function territory(state: GameState): { player: number; rival: number; neutral: number } {
  return state.nodes.reduce((counts, site) => { counts[site.owner]++; return counts; }, { player: 0, rival: 0, neutral: 0 });
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
  const ready = state.nodes.filter(site => site.owner === 'rival' && site.units >= (site.species === 'meat' ? 22 : 32));
  for (const source of ready) {
    if (random(state) > 0.35) continue;
    const adjacent = state.edges.filter(edge => (edge.from === source.id || edge.to === source.id) && mayUseEdge(state, edge, source.species));
    const candidates = adjacent.map(edge => ({ edge, site: state.nodes.find(item => item.id === (edge.from === source.id ? edge.to : edge.from))! }))
      .filter(({ site }) => site.owner !== 'rival');
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
  if (site.owner === fleet.owner) {
    if (fleet.legIndex === fleet.path.length - 2) { site.units += fleet.units; return true; }
    return false;
  }
  const terrain = activeEffect(state, site.id, 'habitat') ? 'complex' : site.terrain;
  const result = resolveCombat(site.units, fleet.units, site.species, fleet.species, terrain);
  const wasPlayer = site.owner === 'player';
  site.units = result.ownerChanged ? result.attackerRemaining : result.defenderRemaining;
  if (result.ownerChanged) {
    site.owner = fleet.owner; site.species = fleet.species;
    site.capacity = WORKERS[fleet.species].capacity; site.growth = WORKERS[fleet.species].growth;
    if (fleet.owner === 'player') {
      state.stats.captures++;
      record(state, `${site.name} joins your colony network.`, state.mode === 'species' ? 'terrain' : 'recognition');
    } else if (wasPlayer) {
      state.stats.losses++;
      record(state, `${site.name} was taken by the rival colony.`, state.mode === 'ecologist' ? 'biodiversity' : 'recognition');
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
      if (origin?.owner === fleet.owner) origin.units += fleet.units;
      continue;
    }
    if (edge.kind === 'overseas' && (fleet.species === 'native' || state.mode === 'ecologist' && fleet.species !== 'argentine')) {
      const origin = state.nodes.find(site => site.id === fleet.path[fleet.legIndex]);
      if (origin?.owner === fleet.owner) origin.units += fleet.units;
      continue;
    }
    if (blocked(state, edge)) { surviving.push(fleet); continue; }
    const travelSeconds = edge.travelSeconds * (fleet.species === 'meat' ? 1.15 : 1);
    fleet.elapsed += dt;
    if (fleet.elapsed + 1e-8 < travelSeconds) { surviving.push(fleet); continue; }
    const destination = state.nodes.find(site => site.id === fleet.path[fleet.legIndex + 1])!;
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
    if (site.owner !== 'neutral' && site.units < site.capacity) {
      const growthMultiplier = foodEffect && site.species === 'argentine' ? 0.15 : 1;
      site.units = Math.min(site.capacity, site.units + Math.max(0, site.growth) * growthMultiplier * dt);
    }
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

function dominant(state: GameState): Owner | undefined {
  const counts = territory(state);
  if (counts.player / state.nodes.length >= DOMINANCE_SHARE) return 'player';
  if (counts.rival / state.nodes.length >= DOMINANCE_SHARE) return 'rival';
  return undefined;
}

function finish(state: GameState) {
  if (state.mode === 'ecologist') {
    state.status = habitat(state) + 1e-9 >= 0.6 ? 'won' : 'lost';
    record(state, 'The habitat survey is complete. Explore ways to observe and protect biodiversity.', 'observation');
    record(state, 'Recovery and prevention are long-term work beyond a five-minute game.', 'recovery');
  } else {
    const counts = territory(state);
    state.status = counts.player > counts.rival ? 'won' : counts.player < counts.rival ? 'lost' : 'draw';
    record(state, 'The territory survey is complete. Every battlefield nest was simulated.', state.mode === 'species' ? 'terrain' : 'transport');
    if (state.discovered.length < 3) record(state, 'Colony identity helps explain cooperation within networks and conflict between them.', 'recognition');
  }
}

/** A fixed 100 ms tick. Hosts accumulate frame time before passing complete ticks. */
export function advance(state: GameState, seconds: number): GameState {
  if (state.status !== 'running' || !Number.isFinite(seconds) || seconds <= 0) return state;
  const ticks = Math.floor((seconds + 1e-8) / TICK);
  if (!ticks) return state;
  const next = copy(state);
  for (let tick = 0; tick < ticks && next.status === 'running'; tick++) {
    const previousDominant = dominant(next);
    next.time = Math.min(next.duration, Math.round((next.time + TICK) * 10) / 10);
    next.effects = next.effects.filter(effect => effect.expires > next.time);
    growAndEcology(next, TICK);
    moveFleets(next, TICK);
    if (Math.round(next.time * 10) % 160 === 0) ai(next);
    if (next.mode === 'ecologist') {
      if (next.charges < 3) {
        next.chargeProgress += TICK;
        if (next.chargeProgress + 1e-8 >= 15) { next.charges++; next.chargeProgress = 0; }
      } else next.chargeProgress = 0;
    } else {
      const owner = dominant(next);
      next.dominanceTime = owner ? owner === previousDominant ? next.dominanceTime + TICK : TICK : 0;
      if (next.dominanceTime + 1e-8 >= DOMINANCE_SECONDS) {
        next.status = owner === 'player' ? 'won' : 'lost';
        record(next, `${owner === 'player' ? 'Your colony' : 'The rival colony'} held 60% of nests for twenty seconds.`, next.mode === 'species' ? 'species' : 'supercolonies');
        if (next.discovered.length < 3) {
          record(next, next.mode === 'species' ? 'Complex terrain changes how numbers and worker strength interact.' : 'Transport connects distant regions in this game abstraction.', next.mode === 'species' ? 'terrain' : 'transport');
          record(next, 'Recognition shapes cooperation between real ant populations.', 'recognition');
        }
      }
    }
    if (next.time >= next.duration && next.status === 'running') finish(next);
  }
  return next;
}
