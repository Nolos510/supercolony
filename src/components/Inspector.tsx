import { useState } from 'react';
import type { GameState, NestState, Intervention } from '../game/types';
import { regions } from '../game/scenarios';
import { facts, resources, species } from '../data/content';
import Ant from './Ant';
import { Icon } from './Icons';
import { ResourceLink } from './Learning';

export default function Inspector({ state, node, view, onIntervene, onGuide }: { state: GameState; node: NestState; view: string | null; onIntervene: (kind: Intervention) => void; onGuide: (id?: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const profile = species[node.species];
  const region = regions.find(r => r.id === (view ?? node.regionId))!;
  const factId = region.nativeRange ? 'native-range' : state.mode === 'ecologist' ? 'habitats' : node.terrain === 'complex' ? 'terrain' : state.events.at(-1)?.factId ?? 'supercolonies';
  const fact = facts.find(f => f.id === factId) ?? facts[0];
  const source = resources.find(r => r.id === fact.resourceIds[0])!;
  const effects = state.effects.filter(e => e.nodeId === node.id);
  return <aside className={`inspector ${expanded ? 'expanded' : ''}`} aria-label="Selected nest details">
    <button className="mobile-inspector-toggle" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>Nest details <span aria-hidden="true">{expanded ? '−' : '+'}</span></button>
    <div className="inspector-heading"><span className="eyebrow">{state.mode === 'ecologist' ? 'Selected habitat' : 'Selected nest'}</span><h2>{node.name}</h2><span className={`ownership ${node.owner}`}><span aria-hidden="true">{node.owner === 'player' ? '●' : node.owner === 'rival' ? '◆' : '○'}</span>{state.mode === 'ecologist' ? node.owner === 'rival' ? 'Invasive pressure' : 'Native community proxy' : node.owner === 'player' ? 'Your colony' : node.owner === 'rival' ? 'Rival colony' : 'Unclaimed nest'}</span></div>
    <div className="specimen"><Ant large /><span className="specimen-scale" aria-hidden="true">Illustrated specimen</span></div>
    <div className="species-name"><h3>{profile.name}</h3><p>{profile.scientificName}</p></div>
    <div className="nest-metrics"><div><strong>{Math.floor(node.units)}</strong><span>game units</span></div><div><strong>{state.mode === 'ecologist' ? `${Math.round(node.habitat * 100)}%` : `+${node.growth.toFixed(1)}`}</strong><span>{state.mode === 'ecologist' ? 'native habitat' : 'growth / sec'}</span></div></div>
    <div className="terrain-detail"><Icon name="leaf" /><div><strong>{node.terrain === 'complex' ? 'Complex habitat' : 'Open terrain'}</strong><span>{node.terrain === 'complex' ? 'Bottlenecks limit group combat.' : 'More room for swarms to engage.'}</span></div></div>
    {state.mode === 'ecologist' && <div className="intervention-tools"><h3>Your interventions <span>{state.charges}/3</span></h3><button aria-label='Restore habitat' onClick={() => onIntervene('habitat')} disabled={!state.charges || state.status !== 'running'}><Icon name="leaf" />Restore habitat <small>60s</small></button><button aria-label='Reduce food subsidy' onClick={() => onIntervene('food')} disabled={!state.charges || state.status !== 'running'}><Icon name="close" />Reduce food subsidy <small>45s</small></button><button aria-label='Restrict transport' onClick={() => onIntervene('transport')} disabled={!state.charges || state.status !== 'running' || !node.gateway}><Icon name="ship" />Restrict transport <small>45s</small></button><p>One charge returns every 15 seconds. Transport acts at gateway nests.</p>{effects.map(e => <span className="effect-label" key={e.kind}>{e.kind === 'habitat' ? 'Habitat restored' : e.kind === 'food' ? 'Food reduced' : 'Transport restricted'} · {Math.ceil(e.expires - state.time)}s</span>)}</div>}
    <section className="field-note"><div className="field-note-title"><Icon name="book" /><h3>Field note</h3></div><h4>{fact.title}</h4><p>{fact.summary}</p><div className="field-note-links"><ResourceLink resource={source}>Read the research</ResourceLink><button className="text-button" onClick={() => onGuide(fact.id)}>Open field guide <Icon name="arrow" size={14} /></button></div></section>
    <div className="region-context"><span className="eyebrow">{region.name} · {region.country}</span><p>{region.overview}</p></div>
  </aside>;
}
