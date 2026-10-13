import { useState } from 'react';
import type { GameState, NestState, Intervention } from '../game/types';
import { regions } from '../game/scenarios';
import { facts, resources, species } from '../data/content';
import Ant from './Ant';
import { Icon } from './Icons';
import { ResourceLink } from './Learning';
import Fieldwork from './Fieldwork';

export default function Inspector({ state, node, view, onIntervene, onGuide }: { state: GameState; node: NestState; view: string | null; onIntervene: (kind: Intervention) => string | undefined; onGuide: (id?: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const profile = species[node.species];
  const region = regions.find(r => r.id === (view ?? node.regionId))!;
  const factId = region.nativeRange ? 'native-range' : state.mode === 'ecologist' ? 'habitats' : node.terrain === 'complex' ? 'terrain' : state.events.at(-1)?.factId ?? 'supercolonies';
  const fact = facts.find(f => f.id === factId) ?? facts[0];
  const source = resources.find(r => r.id === fact.resourceIds[0])!;
  return <aside className={`inspector ${expanded ? 'expanded' : ''}`} aria-label="Selected nest details">
    <button className="mobile-inspector-toggle" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>Nest details <span aria-hidden="true">{expanded ? '−' : '+'}</span></button>
    <div className="inspector-heading"><span className="eyebrow">{state.mode === 'ecologist' ? 'Selected habitat' : 'Selected nest'}</span><h2>{node.name}</h2><span className={`ownership ${node.owner}`}><span aria-hidden="true">{node.owner === 'player' ? '●' : node.owner === 'rival' ? '◆' : '○'}</span>{state.mode === 'ecologist' ? node.owner === 'rival' ? 'Invasive pressure' : 'Native community proxy' : node.owner === 'player' ? 'Your colony' : node.owner === 'rival' ? 'Rival colony' : 'Unclaimed nest'}</span></div>
    <div className="specimen"><Ant large /><span className="specimen-scale" aria-hidden="true">Illustrated specimen</span></div>
    <div className="species-name"><h3>{profile.name}</h3><p>{profile.scientificName}</p></div>
    <div className="nest-metrics"><div><strong>{Math.floor(node.units)}</strong><span>game units</span></div><div><strong>{state.mode === 'ecologist' ? `${Math.round(node.habitat * 100)}%` : `+${node.growth.toFixed(1)}`}</strong><span>{state.mode === 'ecologist' ? 'native habitat' : 'growth / sec'}</span></div></div>
    <div className="terrain-detail"><Icon name="leaf" /><div><strong>{node.terrain === 'complex' ? 'Complex habitat' : 'Open terrain'}</strong><span>{node.terrain === 'complex' ? 'Bottlenecks limit group combat.' : 'More room for swarms to engage.'}</span></div></div>
    {state.mode === 'ecologist' && <div className="intervention-tools"><Fieldwork key={node.id} state={state} node={node} onApply={onIntervene} /></div>}
    <section className="field-note"><div className="field-note-title"><Icon name="book" /><h3>Field note</h3></div><h4>{fact.title}</h4><p>{fact.summary}</p><div className="field-note-links"><ResourceLink resource={source}>Read the research</ResourceLink><button className="text-button" onClick={() => onGuide(fact.id)}>Open field guide <Icon name="arrow" size={14} /></button></div></section>
    <div className="region-context"><span className="eyebrow">{region.name} · {region.country}</span><p>{region.overview}</p></div>
  </aside>;
}
