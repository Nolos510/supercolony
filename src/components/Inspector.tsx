import type { GameState, NestState, Intervention, SpeciesId } from '../game/types';
import { regions } from '../game/scenarios';
import { facts, resources, species } from '../data/content';
import { regionalContexts } from '../data/regional';
import { nestRoles } from '../data/nestRoles';
import { growthInfo, REGIONAL_BALANCE } from '../game/engine';
import { Icon } from './Icons';
import { ResourceLink } from './Learning';
import Fieldwork from './Fieldwork';
import Specimen from './Specimen';
import HabitatGallery from './HabitatGallery';

interface InspectorProps {
  state: GameState; node: NestState; view: string | null; detailed?: boolean; visible?: boolean;
  onIntervene: (kind: Intervention) => string | undefined; onGuide: (id?: string) => void;
  onSpecies?: (id: SpeciesId) => void; onRegion?: (id: string) => void; onCooperation?: () => void;
  onDevelop?: (regionId: string) => void;
}

export default function Inspector({ state, node, detailed, visible = true, onIntervene, onGuide, onSpecies, onRegion, onCooperation, onDevelop }: InspectorProps) {
  const profile = species[node.species];
  const region = regions.find(entry => entry.id === node.regionId)!;
  const context = regionalContexts.find(entry => entry.regionId === region.id);
  const factId = region.nativeRange ? 'native-range' : node.owner === 'ally' ? 'recognition' : state.mode === 'ecologist' ? 'habitats' : node.terrain === 'complex' ? 'terrain' : state.events.at(-1)?.factId ?? 'supercolonies';
  const fact = facts.find(entry => entry.id === factId) ?? facts[0];
  const source = resources.find(entry => entry.id === fact.resourceIds[0]);
  const role = nestRoles.find(entry => entry.id === node.roleId);
  const growth = growthInfo(state, node);
  const gateway = state.nodes.find(entry => entry.regionId === node.regionId && entry.gateway);
  const regionalGrowth = gateway ? growthInfo(state, gateway) : growth;
  const canDevelop = Boolean(onDevelop && ['running', 'paused'].includes(state.status) && gateway?.owner === 'player' && gateway.units >= REGIONAL_BALANCE.developmentCost && regionalGrowth.development === 'none');
  const foragingSource = resources.find(entry => entry.id === (state.playerSpecies === 'meat' ? 'meat-trails' : 'argentine-diet'));
  const terrainSource = resources.find(entry => entry.id === 'terrain-study');
  const growthReasons = { growing: 'Replenishing worker reserves.', paused: 'Paused · replenishment resumes with play.', unclaimed: 'Unclaimed · no workers replenish here.', capacity: 'At reserve capacity · replenishment is stopped.', finished: 'Match ended · replenishment is stopped.' };
  const ownerLabel = state.mode === 'ecologist' ? node.owner === 'rival' ? 'Invasive pressure' : 'Native community proxy' : node.owner === 'player' ? 'Your colony' : node.owner === 'ally' ? 'Cooperating colony' : node.owner === 'rival' ? 'Rival colony' : 'Unclaimed nest';
  const symbols = { player: '●', ally: '◐', rival: '◆', neutral: '○' };
  return <aside className={`inspector expanded ${detailed ? 'full-details' : ''}`} aria-label="Selected nest details">
    <div className="inspector-heading"><span className="eyebrow">{state.mode === 'ecologist' ? 'Selected habitat' : 'Simulated nest'} · {region.shortName}</span><h2>{node.name}</h2><span className={`ownership ${node.owner}`}><span aria-hidden="true">{symbols[node.owner]}</span>{ownerLabel}</span></div>
    <div className="nest-metrics"><div><strong>{Math.floor(node.units)}</strong><span>worker game units</span></div><div><strong>{state.mode === 'ecologist' ? `${Math.round(node.habitat * 100)}%` : growth.current.toFixed(2)}</strong><span>{state.mode === 'ecologist' ? 'native habitat score' : 'current growth / sec'}</span></div></div>
    <section className="growth-detail" aria-label="Game growth">
      <dl className="growth-values"><div><dt>Base game growth</dt><dd><span>{growth.base.toFixed(2)}</span> units / sec</dd></div><div><dt>Current game growth</dt><dd><span>{growth.current.toFixed(2)}</span> units / sec</dd></div><div><dt>Reserve capacity</dt><dd>{growth.capacity} game units</dd></div></dl>
      <p className="growth-reason">{growthReasons[growth.reason]}</p>
      <p className="reading-caption">Game growth replenishes commandable worker reserves. It is a balance value, not a measured birth rate.</p>
      <button className="text-button" onClick={() => onGuide('game-growth')}>What growth means <Icon name="arrow" size={16} /></button>
    </section>
    {state.mode !== 'ecologist' && <section className="foraging-development" aria-label="Foraging development">
      <h3>Your regional development</h3>
      {regionalGrowth.development === 'active' ? <p className="development-status"><strong>Foraging network active</strong><span>+20% growth at your nests in this region while {gateway?.name ?? 'the gateway'} stays yours.</span></p> : regionalGrowth.development === 'preparing' ? <p className="development-status"><strong>Preparing foraging network</strong><span>{Math.ceil(regionalGrowth.developmentRemaining)} game seconds remaining. Preparation pauses with play.</span></p> : <>
        <p>Commit {REGIONAL_BALANCE.developmentCost} worker game units at {gateway?.name ?? 'the gateway'}. Prepare for {REGIONAL_BALANCE.preparationSeconds} game seconds to gain +20% growth at your regional nests.</p>
        <button className="develop-button" disabled={!canDevelop} onClick={() => onDevelop?.(node.regionId)}>{state.status === 'paused' ? 'Resume & improve network' : 'Improve foraging network'}</button>
        <p className="development-requirement">{gateway?.owner !== 'player' ? `Own ${gateway?.name ?? 'the gateway'} to develop this region.` : gateway.units < REGIONAL_BALANCE.developmentCost ? `Gateway reserves: ${Math.floor(gateway.units)}/${REGIONAL_BALANCE.developmentCost} required.` : state.status === 'paused' ? 'This action resumes play and starts preparation.' : state.status !== 'running' ? 'Start a new match to invest in development.' : `Gateway reserves: ${Math.floor(gateway.units)}. One improvement per region.`}</p>
      </>}
      <p className="reading-caption">Losing the gateway removes this improvement, without refund. Cooperating and rival nests receive no bonus. Cost, preparation, and growth bonus are game rules.</p>
      <p className="foraging-context">{state.playerSpecies === 'meat' ? 'Meat ants use persistent trails to food and adjust foraging to nutritional needs.' : 'Argentine-ant experiments link food availability with colony performance.'}</p>
      {foragingSource?.accessNote && <p className="resource-access-note">{foragingSource.accessNote}</p>}
      <div className="field-note-links">{foragingSource && <ResourceLink resource={foragingSource}>Read foraging research</ResourceLink>}<button className="text-button" onClick={() => onGuide('foraging-development')}>Food access & ecological pressure <Icon name="arrow" size={16} /></button></div>
    </section>}
    <dl className="nest-affiliation"><div><dt>Colony network</dt><dd>{node.colonyId.replaceAll('-', ' ')}</dd></div><div><dt>Recognition</dt><dd>{state.mode === 'ecologist' ? 'Ecological proxy' : node.owner === 'player' || node.owner === 'ally' ? 'Compatible with your colony' : node.owner === 'rival' ? 'Opposing colony' : 'Unaffiliated'}</dd></div></dl>
    {node.owner === 'ally' && <div className="cooperation-note"><p>This colony runs its own nests. Your reinforcements join its reserves; passage through a friendly nest keeps your swarm moving.</p>{onCooperation && <button className="text-button" onClick={onCooperation}>How cooperation works <Icon name="arrow" size={16} /></button>}</div>}
    <section className="nest-setting"><h3>{role?.name ?? node.name}</h3><p>{role?.description ?? 'A fictional setting in this regional network.'}</p>{role && <p>{role.purpose}</p>}<button className="text-button" onClick={() => onGuide('nest-settings')}>Read the landscape <Icon name="arrow" size={16} /></button></section>
    <div className="terrain-detail"><Icon name="leaf" /><div><strong>{node.terrain === 'complex' ? 'Complex habitat' : 'Open terrain'}</strong><span>{node.terrain === 'complex' ? 'Bottlenecks limit how many workers fight at once.' : 'More workers can engage at once.'}{node.gateway ? ' This site also connects regional transport.' : ''}</span>{terrainSource && <ResourceLink resource={terrainSource}>Read terrain research</ResourceLink>}</div></div>
    {state.mode === 'ecologist' && <div className="intervention-tools"><Fieldwork key={node.id} state={state} node={node} onApply={onIntervene} /></div>}
    <div className="species-name"><h3>{profile.name}</h3><p>{profile.scientificName}</p></div>
    {visible && <Specimen speciesId={node.species} compact />}
    <button className="inspector-link" onClick={() => onSpecies ? onSpecies(node.species) : onGuide('species')}>Species & anatomy <Icon name="arrow" size={16} /></button>
    <section className="region-context"><h3>{region.name}</h3><p>{context?.environment ?? region.overview}</p>{context && <p>{context.ecologicalStakes}</p>}{visible && <HabitatGallery key={`${node.regionId}-${node.id}`} regionId={node.regionId} terrain={node.terrain} />}<button className="text-button" onClick={() => onRegion ? onRegion(region.id) : onGuide(region.nativeRange ? 'native-range' : factId)}>Read regional profile <Icon name="arrow" size={16} /></button></section>
    <section className="field-note"><div className="field-note-title"><Icon name="book" /><h3>Field note</h3></div><h4>{fact.title}</h4><p>{fact.summary}</p><div className="field-note-links">{source && <ResourceLink resource={source}>Read the research</ResourceLink>}<button className="text-button" onClick={() => onGuide(fact.id)}>Open field guide <Icon name="arrow" size={16} /></button></div></section>
    <p className="reading-caption">Nests, workers, terrain values, and affiliations here are simulated. Research maps record separate, dated observations.</p>
  </aside>;
}
