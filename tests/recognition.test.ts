import { expect, it } from 'vitest';
import { advance, compatibleOwners, createGame, send, sendMany } from '../src/game/engine';
const total = (s: ReturnType<typeof createGame>) => s.nodes.reduce((v, n) => v + n.units, 0) + s.fleets.reduce((v, f) => v + f.units, 0);
it('seeds cooperation only in War and rejects commands from cooperating AI', () => {
  const s = createGame('war');
  expect(s.nodes.filter(n => n.owner === 'ally').map(n => [n.id, n.units])).toEqual([['california-1', 32], ['mediterranean-1', 10], ['japan-1', 10], ['australia-1', 10], ['newzealand-1', 32], ['hawaii-1', 10]]);
  expect(createGame('species').nodes.some(n => n.owner === 'ally')).toBe(false);
  expect(createGame('ecologist').nodes.some(n => n.owner === 'ally')).toBe(false);
  expect(send(s, 'california-1', 'california-0', .5).error).toBeTruthy();
  expect(compatibleOwners('player', 'ally')).toBe(true);
  expect(compatibleOwners('ally', 'player')).toBe(true);
  expect(compatibleOwners('ally', 'rival')).toBe(false);
});
it('friendly transit does not deposit workers and final reinforcement preserves affiliation', () => {
  const s = createGame('war'); s.aiEnabled = false; s.nodes.forEach(n => { n.growth = 0; });
  const passing = send(s, 'california-0', 'california-2', .5).state;
  expect(passing.fleets[0].path).toEqual(['california-0', 'california-1', 'california-2']);
  const intermediate = advance(passing, 5.1);
  expect(intermediate.nodes.find(n => n.id === 'california-1')!.units).toBe(32);
  const reinforced = advance(send(s, 'california-0', 'california-1', 1).state, 6);
  const ally = reinforced.nodes.find(n => n.id === 'california-1')!;
  expect(ally.owner).toBe('ally'); expect(ally.colonyId).toBe(s.nodes[1].colonyId);
  expect(ally.units).toBe(98); expect(total(reinforced)).toBeCloseTo(total(s));
  expect(reinforced.stats.reinforcementOrders).toBe(1);
});
it('batch reinforcement excludes AI sources and simultaneous arrivals conserve workers', () => {
  const s = createGame('war'); s.aiEnabled = false; s.nodes.forEach(n => { n.growth = 0; });
  const r = sendMany(s, ['california-0', 'california-3', 'california-1'], 'california-1', .5);
  expect(r.sentFromIds).toEqual(['california-0', 'california-3']);
  expect(total(advance(r.state, 30))).toBeCloseTo(total(s));
});
it('cooperating survivors do not prevent defeat, victory or simultaneous extinction', () => {
  for (const survivor of ['player', 'rival', 'neutral'] as const) {
    const s = createGame('war'); s.aiEnabled = false;
    s.nodes.forEach(n => { if (n.owner !== 'ally') { n.owner = survivor; n.colonyId = survivor === 'player' ? 'US1' : survivor === 'rival' ? 'US2' : `unclaimed-${n.id}`; } });
    expect(advance(s, .1).status).toBe(survivor === 'player' ? 'won' : survivor === 'rival' ? 'lost' : 'draw');
  }
});
it('cooperating AI sends support without attacking its compatible network', () => {
  const s = createGame('war'); s.nodes.forEach(n => { n.growth = 0; });
  s.nodes.find(n => n.id === 'california-0')!.units = 1;
  s.nodes.find(n => n.id === 'newzealand-0')!.units = 1;
  s.nodes.find(n => n.id === 'newzealand-0')!.owner = 'player';
  s.nodes.find(n => n.id === 'newzealand-0')!.colonyId = 'US1';
  const first = advance(s, 16);
  expect(first.fleets.some(f => f.owner === 'ally' && first.nodes.find(n => n.id === f.path.at(-1))?.owner === 'player')).toBe(true);
  const later = advance(s, 32);
  expect(later.nodes.find(n => n.id === 'california-0')!.owner).toBe('player');
  expect(later.nodes.filter(n => n.owner === 'ally').every(n => !!n.colonyId)).toBe(true);
  expect(advance(createGame('war', 'argentine', 77), 64)).toEqual(advance(createGame('war', 'argentine', 77), 64));
});
