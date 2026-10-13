import { useEffect, useState } from 'react';
import type { GameState, Intervention, NestState } from '../game/types';
import { facts, resources } from '../data/content';
import { ResourceLink } from './Learning';

type SurveyKind = 'trails' | 'recruitment' | 'transport';
interface Snapshot {
  time: number;
  units: number;
  habitat: number;
  localLinks: number;
  rivalNeighbors: number;
  incomingLocal: number;
  overseasLinks: number;
  incomingOverseas: number;
}
type Work =
  | { phase: 'choose' }
  | { phase: 'survey'; kind: SurveyKind; before: Snapshot; due: number }
  | { phase: 'observed'; kind: SurveyKind; before: Snapshot; observation: Snapshot; planned: Intervention | null }
  | { phase: 'followup'; kind: SurveyKind; before: Snapshot; observation: Snapshot; response: Intervention; baseline: Snapshot; due: number }
  | { phase: 'reported'; kind: SurveyKind; before: Snapshot; observation: Snapshot; response: Intervention; baseline: Snapshot; result: Snapshot };

const labels: Record<Intervention, string> = { habitat: 'Restore habitat', food: 'Reduce food subsidy', transport: 'Restrict transport' };
const priorities: Record<Intervention, string> = { habitat: 'Improve habitat', food: 'Slow worker growth', transport: 'Delay transport' };
const durations: Record<Intervention, number> = { habitat: 60, food: 45, transport: 45 };
const number = new Intl.NumberFormat('en', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

function snapshot(state: GameState, node: NestState): Snapshot {
  const links = state.edges.filter(edge => edge.from === node.id || edge.to === node.id);
  const local = links.filter(edge => edge.kind === 'local');
  const neighborIds = new Set(local.map(edge => edge.from === node.id ? edge.to : edge.from));
  const rivalNeighbors = state.nodes.filter(site => neighborIds.has(site.id) && site.owner === 'rival' && site.species === 'argentine').length;
  let incomingLocal = 0, incomingOverseas = 0;
  for (const fleet of state.fleets) {
    if (fleet.path[fleet.legIndex + 1] !== node.id) continue;
    const origin = fleet.path[fleet.legIndex];
    const edge = links.find(link => link.from === origin || link.to === origin);
    if (edge?.kind === 'local') incomingLocal++;
    else if (edge?.kind === 'overseas') incomingOverseas++;
  }
  return { time: state.time, units: node.units, habitat: node.habitat, localLinks: local.length, rivalNeighbors, incomingLocal, overseasLinks: links.filter(edge => edge.kind === 'overseas').length, incomingOverseas };
}

function Observation({ kind, before, after }: { kind: SurveyKind; before: Snapshot; after: Snapshot }) {
  if (kind === 'trails') return <p>Local trails: {after.localLinks}. Neighboring sites with rival Argentine workers: {after.rivalNeighbors}. Incoming local swarms recorded: {after.incomingLocal}.</p>;
  if (kind === 'recruitment') return <p>Worker reserves changed from {number.format(before.units)} to {number.format(after.units)} game units during the survey. Growth, arrivals, and departures can all change reserves.</p>;
  return <p>{after.overseasLinks ? `Overseas links: ${after.overseasLinks}. ${after.incomingOverseas ? `Incoming overseas swarms recorded: ${after.incomingOverseas}, traveling or waiting.` : 'No incoming overseas swarm was recorded. This gateway was idle at survey time.'}` : 'This site has no overseas links. Select a gateway to investigate simulated transport.'}</p>;
}

export default function Fieldwork({ state, node, onApply }: { state: GameState; node: NestState; onApply: (kind: Intervention) => string | undefined }) {
  const [free, setFree] = useState(false);
  const [work, setWork] = useState<Work>({ phase: 'choose' });
  const [error, setError] = useState('');
  const effects = state.effects.filter(effect => effect.nodeId === node.id && effect.expires > state.time);
  const running = state.status === 'running';
  const unavailable = (kind: Intervention) => !running || state.charges < 1 || (kind === 'transport' && !node.gateway) || effects.some(effect => effect.kind === kind);

  useEffect(() => {
    if (work.phase !== 'survey' || state.time + 1e-8 < work.due) return;
    setWork({ phase: 'observed', kind: work.kind, before: work.before, observation: snapshot(state, node), planned: null });
  }, [state, node, work]);

  function survey(kind: SurveyKind) {
    setError('');
    setWork({ phase: 'survey', kind, before: snapshot(state, node), due: state.time + 3 });
  }
  function apply(kind: Intervention) {
    const baseline = snapshot(state, node);
    const message = onApply(kind);
    setError(message ?? '');
    if (!message && !free && work.phase === 'observed') {
      setWork({ phase: 'followup', kind: work.kind, before: work.before, observation: work.observation, response: kind, baseline, due: state.time + 10 });
    }
  }
  function restart() { setWork({ phase: 'choose' }); setError(''); }

  const observed = work.phase === 'observed' || work.phase === 'followup' || work.phase === 'reported';
  const factId = work.phase === 'choose' || work.phase === 'survey' ? 'habitats' : work.kind === 'recruitment' ? 'honeydew' : work.kind === 'transport' ? 'transport' : 'habitats';
  const fact = facts.find(entry => entry.id === factId)!;
  const resource = resources.find(entry => entry.id === fact.resourceIds[0])!;

  return <section className="fieldwork" aria-label="Habitat fieldwork">
    <h3>Fieldwork <span>{state.charges}/3 charges</span></h3>
    <button className="text-button" aria-pressed={free} onClick={() => { setFree(value => !value); setError(''); }}>Free fieldwork</button>
    {free ? <div className="fieldwork-step">
      <p>Choose any response. One charge returns every 15 game seconds.</p>
      <div className="fieldwork-choices">{(['habitat', 'food', 'transport'] as const).map(kind => <button key={kind} aria-label={labels[kind]} disabled={unavailable(kind)} onClick={() => apply(kind)}>{labels[kind]} <small>{durations[kind]}s</small></button>)}</div>
      {!node.gateway && <p>Transport restrictions need a gateway site.</p>}
    </div> : <>
      {work.phase === 'choose' && <div className="fieldwork-step">
        <h4>What’s happening at this site?</h4>
        <p>Choose a three-second survey, then test a response. The match keeps running.</p>
        <div className="fieldwork-choices"><button disabled={!running} onClick={() => survey('trails')}>Observe local trails</button><button disabled={!running} onClick={() => survey('recruitment')}>Watch worker reserves</button><button disabled={!running} onClick={() => survey('transport')}>Trace transport</button></div>
      </div>}
      {work.phase === 'survey' && <div className="fieldwork-step"><p role="status">Survey in progress</p><p>{Math.ceil(Math.max(0, work.due - state.time))} game seconds remaining. Pausing the match pauses your survey.</p></div>}
      {observed && <div className="fieldwork-observation">
        <h4>Your observation</h4>
        <Observation kind={work.kind} before={work.before} after={work.observation} />
        <p>Recorded at {number.format(work.observation.time)} game seconds. These are observations of this simulation.</p>
      </div>}
      {work.phase === 'observed' && <div className="fieldwork-step">
        <h4>Choose what to test</h4>
        <div className="fieldwork-choices">{(['habitat', 'food', 'transport'] as const).map(kind => <button key={kind} aria-pressed={work.planned === kind} disabled={kind === 'transport' && !node.gateway} onClick={() => { setWork({ ...work, planned: kind }); setError(''); }}>{priorities[kind]}</button>)}</div>
        {!node.gateway && <p>This site is not a transport gateway.</p>}
        {work.planned && <>
          <p>{work.planned === 'habitat' ? 'Support habitat recovery for 60 game seconds. The score is capped at 100%.' : work.planned === 'food' ? 'Slow modeled Argentine-ant worker replacement for 45 game seconds. Other species do not receive this growth change.' : 'Delay overseas swarms using this gateway for 45 game seconds.'} Costs one charge.</p>
          <button className="primary" aria-label={labels[work.planned]} disabled={unavailable(work.planned)} onClick={() => work.planned && apply(work.planned)}>{labels[work.planned]}</button>
        </>}
      </div>}
      {work.phase === 'followup' && <div className="fieldwork-step">
        <h4>Give your response time</h4>
        <p>{labels[work.response]} accepted. Compare this site after ten game seconds.</p>
        <p>{Math.ceil(Math.max(0, work.due - state.time))} game seconds until follow-up.</p>
        <button className="primary" disabled={state.time + 1e-8 < work.due} onClick={() => setWork({ phase: 'reported', kind: work.kind, before: work.before, observation: work.observation, response: work.response, baseline: work.baseline, result: snapshot(state, node) })}>Record follow-up</button>
      </div>}
      {work.phase === 'reported' && <div className="fieldwork-step">
        <h4>What changed?</h4>
        <p>Habitat score: {number.format(work.baseline.habitat * 100)}% → {number.format(work.result.habitat * 100)}%.</p>
        <p>Worker reserves: {number.format(work.baseline.units)} → {number.format(work.result.units)} game units.</p>
        <p>Recorded {number.format(work.result.time - work.baseline.time)} game seconds after your response. Other activity can also affect this site.</p>
        <button onClick={restart}>Start another survey</button>
      </div>}
    </>}
    {!running && <p>Resume the match to continue surveys or apply a response.</p>}
    {state.charges < 1 && <p>Your next charge arrives in {Math.ceil(15 - state.chargeProgress)} game seconds.</p>}
    {effects.length ? <div className="fieldwork-step">{effects.map(effect => <p key={effect.kind}>{labels[effect.kind]} · {Math.ceil(effect.expires - state.time)}s remaining</p>)}</div> : (work.phase === 'followup' || work.phase === 'reported') && <p>No timed response is active here.</p>}
    {error && <p role="alert">{error}</p>}
    <p className="science-caption">Surveys, responses, and scores are game abstractions.</p>
    <ResourceLink resource={resource}>Explore the science behind this idea</ResourceLink>
  </section>;
}
