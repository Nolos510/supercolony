import { it, expect } from 'vitest';
import { createGame, sendMany, advance } from '../src/game/engine';
const total = (s: ReturnType<typeof createGame>) => s.nodes.reduce((n, x) => n + x.units, 0) + s.fleets.reduce((n, f) => n + f.units, 0);
it('batch sends unique sources independently and conserves workers', () => {
  const s = createGame('species'); s.aiEnabled = false;
  s.nodes[1].owner = 'player'; s.nodes[1].units = 41;
  const result = sendMany(s, ['australia-0', 'australia-1', 'australia-0', 'australia-4'], 'australia-4', .5);
  expect(result.error).toBeUndefined(); expect(result.sentFromIds).toEqual(['australia-0', 'australia-1']);
  expect(result.state.fleets).toHaveLength(2); expect(result.state.stats.orders).toBe(2);
  expect(total(result.state)).toBeCloseTo(total(s)); expect(s.fleets).toHaveLength(0);
  expect(result.state.nodes[0].units).toBe(39); expect(result.state.nodes[1].units).toBe(21);
});
it('skips unreachable, foreign and empty sources while retaining successful sends', () => {
  const s = createGame('species'); s.nodes[3].units = 0;
  const r = sendMany(s, ['australia-0', 'australia-3', 'australia-8', 'missing'], 'australia-1', .5);
  expect(r.sentFromIds).toEqual(['australia-0']); expect(r.skipped).toHaveLength(3);
  expect(r.state.nodes[3].units).toBe(s.nodes[3].units); expect(r.state.nodes[8].units).toBe(s.nodes[8].units);
});
it('rejects paused or invalid shared commands without partial mutation', () => {
  const s = createGame('war'); s.status = 'paused';
  expect(sendMany(s, ['california-0'], 'california-1', .5).state).toBe(s);
  const e = createGame('ecologist'); expect(sendMany(e, ['california-1'], 'california-0', .5).error).toBeTruthy();
  const w = createGame('war'); expect(sendMany(w, ['california-0'], 'missing', .5).state).toBe(w);
  expect(sendMany(w, ['california-0'], 'california-1', 2).state).toBe(w);
});
it('friendly batch arrivals do not clip or duplicate workers', () => {
  const s = createGame('species'); s.aiEnabled = false;
  s.nodes.forEach(n => { n.owner = 'player'; n.growth = 0; }); s.nodes.at(-1)!.owner = 'rival';
  const r = sendMany(s, ['australia-0', 'australia-1'], 'australia-4', 1).state;
  expect(total(advance(r, 30))).toBeCloseTo(total(s));
});
