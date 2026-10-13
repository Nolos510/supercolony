import { createGame, advance, send, sendMany, intervene } from './engine';
import type { GameState, ModeId, SpeciesId, Intervention } from './types';

let current: GameState;
let cached: GameState;
const listeners = new Set<() => void>();
function publish() { cached = current; listeners.forEach(l => l()); }
export const gameStore = {
  getState: () => current,
  getSnapshot: () => cached,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  start(mode: ModeId, species: SpeciesId = 'argentine') { current = createGame(mode, species); publish(); },
  pause(paused: boolean) {
    if (current && ['running', 'paused'].includes(current.status)) {
      current = { ...current, status: paused ? 'paused' : 'running' }; publish();
    }
  },
  send(from: string, to: string, fraction: number) {
    const command = send(current, from, to, fraction); current = command.state; publish(); return command.error;
  },
  sendMany(from: string[], to: string, fraction: number) {
    const command = sendMany(current, from, to, fraction); current = command.state; publish(); return command;
  },
  intervene(nodeId: string, kind: Intervention) {
    const command = intervene(current, nodeId, kind); current = command.state; publish(); return command.error;
  },
  tick() { if (current) { current = advance(current, .1); if (Math.round(current.time * 10) % 3 === 0 || current.status !== 'running') publish(); } },
  advance(seconds: number) { if (current) { current = advance(current, seconds); publish(); } },
};
gameStore.start('war');

export function startClock() {
  const interval = window.setInterval(() => gameStore.tick(), 100);
  const onHidden = () => { if (document.hidden) gameStore.pause(true); };
  document.addEventListener('visibilitychange', onHidden);
  return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', onHidden); };
}
