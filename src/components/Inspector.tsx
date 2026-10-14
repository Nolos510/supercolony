import type { GameState, NestState, Intervention, SpeciesId } from '../game/types';
import { regions } from '../game/scenarios';
import { facts, resources, species } from '../data/content';
import { regionalContexts } from '../data/regional';
import { Icon } from './Icons';
import { ResourceLink } from './Learning';
import Fieldwork from './Fieldwork';
import Specimen from './Specimen';

interface InspectorProps {
  state: GameState; node: NestState; view: string | null; detailed?: boolean; visible?: boolean;
  onIntervene: (kind: Intervention) => string | undefined; onGuide: (id?: string) => void;
  onSpecies?: (id: SpeciesId) => void; onRegion?: (id: string) => void; onCooperation?: () => void;
}

export default function Inspector({ state, node, detailed, visible = true, onIntervene, onGuide, onSpecies, onRegion, onCooperation }: InspectorProps) {
  const profile = species[node.species];
  const region = regions.find(entry => entry.id === node.regionId)!;
  const context = regionalContexts.find(entry => entry.regionId === region.id);
  const factId = region.nativeRange ? 'native-range' : node.owner === 'ally' ? 'recognition' : state.mode === 'ecologist' ? 'habitats' : node.terrain === 'complex' ? 'terrain' : state.events.at(-1)?.factId ?? 'supercolonies';
  const fact = facts.find(entry => entry.id === factId) ?? facts[0];
  const source = resources.find(entry => entry.id === fact.resourceIds[0]);
  const ownerLabel = state.mode === 'ecologist' ? node.owner === 'rival' ? 'Invasive pressure' : 'Native community proxy' : node.owner === 'player' ? 'Your colony' : node.owner === 'ally' ? 'Cooperating colony' : node.owner === 'rival' ? 'Rival colony' : 'Unclaimed nest';
  const symbols = { player: '●', ally: '◐', rival: '◆', neutral: '○' };
  return <aside className={`inspector expanded ${detailed ? 'full-details' : ''}`} aria-label="Selected nest details">
    <div className="inspector-heading"><span className="eyebrow">{state.mode === 'ecologist' ? 'Selected habitat' : 'Simulated nest'} · {region.shortName}</span><h2>{node.name}</h2><span className={`ownership ${node.owner}`}><span aria-hidden="true">{symbols[node.owner]}</span>{ownerLabel}</span></div>
    <div className="nest-metrics"><div><strong>{Math.floor(node.units)}</strong><span>worker game units</span></div><div><strong>{state.mode === 'ecologist' ? `${Math.round(node.habitat * 100)}%` : `+${node.growth.toFixed(1)}`}</strong><span>{state.mode === 'ecologist' ? 'native habitat score' : 'growth / sec'}</span></div></div>
    <dl className="nest-affiliation"><div><dt>Colony network</dt><dd>{node.colonyId.replaceAll('-', ' ')}</dd></div><div><dt>Recognition</dt><dd>{state.mode === 'ecologist' ? 'Ecological proxy' : node.owner === 'player' || node.owner === 'ally' ? 'Compatible with your colony' : node.owner === 'rival' ? 'Opposing colony' : 'Unaffiliated'}</dd></div></dl>
    {node.owner === 'ally' && <div className="cooperation-note"><p>This colony runs its own nests. Your reinforcements join its reserves; passage through a friendly nest keeps your swarm moving.</p>{onCooperation && <button className="text-button" onClick={onCooperation}>How cooperation works <Icon name="arrow" size={16} /></button>}</div>}
    <div className="terrain-detail"><Icon name="leaf" /><div><strong>{node.terrain === 'complex' ? 'Complex habitat' : 'Open terrain'}</strong><span>{node.terrain === 'complex' ? 'Bottlenecks limit group combat.' : 'More room for swarms to engage.'}{node.gateway ? ' Transport gateway.' : ''}</span></div></div>
    {state.mode === 'ecologist' && <div className="intervention-tools"><Fieldwork key={node.id} state={state} node={node} onApply={onIntervene} /></div>}
    <div className="species-name"><h3>{profile.name}</h3><p>{profile.scientificName}</p></div>
    {visible && <Specimen speciesId={node.species} compact />}
    <button className="inspector-link" onClick={() => onSpecies ? onSpecies(node.species) : onGuide('species')}>Species & anatomy <Icon name="arrow" size={16} /></button>
    <section className="region-context"><h3>{region.name}</h3><p>{context?.environment ?? region.overview}</p>{context && <p>{context.ecologicalStakes}</p>}<button className="text-button" onClick={() => onRegion ? onRegion(region.id) : onGuide(region.nativeRange ? 'native-range' : factId)}>Read regional profile <Icon name="arrow" size={16} /></button></section>
    <section className="field-note"><div className="field-note-title"><Icon name="book" /><h3>Field note</h3></div><h4>{fact.title}</h4><p>{fact.summary}</p><div className="field-note-links">{source && <ResourceLink resource={source}>Read the research</ResourceLink>}<button className="text-button" onClick={() => onGuide(fact.id)}>Open field guide <Icon name="arrow" size={16} /></button></div></section>
    <p className="reading-caption">Nests, workers, terrain values, and affiliations here are simulated. Research maps record separate, dated observations.</p>
  </aside>;
}
