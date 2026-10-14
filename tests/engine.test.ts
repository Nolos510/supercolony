import { describe, expect, it } from 'vitest';
import { createGame, advance, send, intervene, resolveCombat, territory, habitat } from '../src/game/engine';
import acceptance from '../verification/acceptance.json';

describe('simulation contract', () => {
  it('contains seven introduced War regions, six sites each, and a twelve-site species scenario', () => {
    const s = createGame('war');
    expect(s.duration).toBe(acceptance.combatDurationSeconds);
    expect(createGame('ecologist').duration).toBe(acceptance.durationSeconds);
    expect(createGame('ecologist').nodes.some(n => n.regionId === 'southamerica')).toBe(false);
    expect(s.nodes.some(n => n.regionId === 'southamerica')).toBe(false);
    expect(s.nodes).toHaveLength(42);
    for (const region of acceptance.worldRegions) expect(s.nodes.filter(n => n.regionId === region)).toHaveLength(6);
    expect(createGame('species', 'meat').nodes).toHaveLength(12);
  });
  it('replays seeded decisions deterministically', () => {
    expect(advance(createGame('war', 'argentine', 77), 50)).toEqual(advance(createGame('war', 'argentine', 77), 50));
  });
  it('conserves workers during dispatch and rejects empty or foreign orders', () => {
    const s = createGame('war');
    const from = s.nodes.find(n => n.owner === 'player')!;
    const edge = s.edges.find(e => e.kind === 'local' && (e.from === from.id || e.to === from.id))!;
    const to = edge.from === from.id ? edge.to : edge.from;
    const before = s.nodes.reduce((sum, n) => sum + n.units, 0);
    const result = send(s, from.id, to, .5);
    expect(result.error).toBeUndefined();
    expect(result.state.nodes.reduce((sum, n) => sum + n.units, 0) + result.state.fleets.reduce((sum, f) => sum + f.units, 0)).toBeCloseTo(before);
    expect(s.fleets).toHaveLength(0);
    expect(send(s, 'missing', to, .5).error).toBeTruthy();
    expect(send(s, from.id, to, 0).error).toBeTruthy();
    expect(send(s, s.nodes.find(n => n.owner === 'rival')!.id, to, .5).error).toBeTruthy();
  });
  it('handles simultaneous friendly arrivals without lost or duplicated workers', () => {
    const s = createGame('species'); s.aiEnabled = false;
    s.nodes.forEach(n => { n.growth = 0; n.owner = 'player'; });
    s.nodes.at(-1)!.owner = 'rival';
    const edge = s.edges[0];
    const first = send(s, edge.from, edge.to, .25).state;
    const second = send(first, edge.from, edge.to, .25).state;
    const total = second.nodes.reduce((a, n) => a + n.units, 0) + second.fleets.reduce((a, f) => a + f.units, 0);
    const arrived = advance(second, 50);
    expect(arrived.nodes.reduce((a, n) => a + n.units, 0) + arrived.fleets.reduce((a, f) => a + f.units, 0)).toBeCloseTo(total);
  });
  it('complex terrain reduces native meat-ant losses in the controlled matchup', () => {
    const open = resolveCombat(20, 60, 'meat', 'argentine', 'open');
    const complex = resolveCombat(20, 60, 'meat', 'argentine', 'complex');
    expect(complex.defenderRemaining).toBeGreaterThan(open.defenderRemaining);
    expect(complex.defenderRemaining).toBeGreaterThanOrEqual(0);
  });
  it('pause freezes time, fleets, and ecology', () => {
    const s = createGame('ecologist'); s.status = 'paused';
    expect(advance(s, 60)).toEqual(s);
  });
  it('charges regenerate and intervention effects expire', () => {
    let s = createGame('ecologist'); s.aiEnabled = false;
    const command = intervene(s, s.nodes[0].id, 'habitat');
    expect(command.error).toBeUndefined(); s = command.state;
    expect(s.charges).toBe(2); expect(s.effects).toHaveLength(1);
    s = advance(s, 15); expect(s.charges).toBe(3);
    s = advance(s, 90); expect(s.effects).toHaveLength(0);
    expect(intervene(createGame('war'), 'california-0', 'habitat').error).toBeTruthy();
  });
  it('ends combat only when a colony has no nests or surviving fleets', () => {
    for (const owner of ['player', 'rival'] as const) {
      const s = createGame('war'); s.aiEnabled = false; s.nodes.forEach(n => { n.owner = owner; n.colonyId = owner === 'player' ? 'US1' : 'US2'; });
      expect(advance(s, 1).status).toBe(owner === 'player' ? 'won' : 'lost');
    }
    const empty = createGame('species'); empty.aiEnabled = false;
    empty.nodes.forEach(n => { n.owner = 'neutral'; });
    expect(advance(empty, 1).status).toBe('draw');
  });
  it('does not end combat at five minutes or 60 percent territory', () => {
    for (const mode of ['war', 'species'] as const) {
      const s = createGame(mode); s.aiEnabled = false;
      s.nodes.forEach((n, i) => { n.owner = i < Math.ceil(s.nodes.length * .7) ? 'rival' : 'player'; if (mode === 'war') n.colonyId = n.owner === 'player' ? 'US1' : 'US2'; });
      const later = advance(s, 900);
      expect(later.status).toBe('running'); expect(later.time).toBe(900);
      expect(later.duration).toBeNull();
    }
  });
  it('lets a colony with no nests recover through its in-flight workers', () => {
    const s = createGame('species'); s.aiEnabled = false;
    s.nodes.forEach(n => { n.owner = 'rival'; n.growth = 0; n.units = 0; });
    s.fleets = [{ id: 1, owner: 'player', colonyId: 'player-network', species: 'argentine', units: 20, path: ['australia-0', 'australia-1'], legIndex: 0, elapsed: 0 }];
    const moving = advance(s, 1); expect(moving.status).toBe('running');
    const recovered = advance(moving, 10); expect(recovered.status).toBe('running');
    expect(recovered.nodes.find(n => n.id === 'australia-1')!.owner).toBe('player');
    const defeated = createGame('species'); defeated.aiEnabled = false;
    defeated.nodes.forEach(n => { n.owner = 'rival'; n.growth = 0; n.units = 100; });
    defeated.fleets = s.fleets;
    expect(advance(defeated, 10).status).toBe('lost');
  });
  it('counts capture events separately from nests currently held', () => {
    let s = createGame('species'); s.aiEnabled = false;
    s.nodes.forEach(n => { n.growth = 0; });
    s.nodes[0].units = 100; s.nodes[1].units = 0;
    s = advance(send(s, 'australia-0', 'australia-1', .25).state, 10);
    expect(s.stats.captures).toBe(1);
    s.nodes[1].owner = 'rival'; s.nodes[1].units = 0;
    s = advance(send(s, 'australia-0', 'australia-1', .25).state, 10);
    expect(s.stats.captures).toBe(2); expect(territory(s).player).toBe(3);
  });
  it('evaluates native habitat at the full five-minute ecology boundary', () => {
    for (const level of [1, .1]) {
      const s = createGame('ecologist'); s.aiEnabled = false; s.time = 299.9;
      s.nodes.forEach(n => { n.habitat = level; });
      expect(advance(s, .2).status).toBe(level === 1 ? 'won' : 'lost');
    }
  });
  it('keeps long combat runs finite and completes the ecology survey', () => {
    for (const mode of ['war', 'species', 'ecologist'] as const) {
      const s = advance(createGame(mode), 300);
      expect(['running', 'won', 'lost', 'draw']).toContain(s.status);
      if (mode === 'ecologist') expect(['won', 'lost']).toContain(s.status);
      expect(s.time).toBeLessThanOrEqual(300.1);
      expect(s.nodes.every(n => Number.isFinite(n.units) && n.units >= 0 && n.habitat >= 0 && n.habitat <= 1)).toBe(true);
      expect(territory(s).player).toBeGreaterThanOrEqual(0);
      expect(habitat(s)).toBeGreaterThanOrEqual(0);
    }
  });
});
