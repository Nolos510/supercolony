import { useState } from 'react';
import type { SpeciesId } from '../game/types';
import { species } from '../data/content';
import { specimens } from '../data/specimens';
import { gameStore } from '../game/store';
import Ant from './Ant';
import { Icon } from './Icons';

export default function Specimen({ speciesId, compact = false, onExplore }: { speciesId: SpeciesId; compact?: boolean; onExplore?: (speciesId: SpeciesId) => void }) {
  const asset = specimens.find(entry => entry.speciesId === speciesId);
  const [failedId, setFailedId] = useState<string>();
  const profile = species[speciesId];
  if (!asset) return <figure className="specimen-figure illustrated-specimen">{speciesId === 'native' ? <Icon name="leaf" size={48} /> : <Ant large />}<figcaption>{speciesId === 'native' ? 'Native habitat and invertebrate communities: a game proxy, not one identified species.' : 'Illustrative worker drawing.'}</figcaption></figure>;
  return <figure className={`specimen-figure ${compact ? 'compact' : ''}`}>
    {failedId === asset.id ? <div className="specimen-unavailable"><Ant large /><p>Photograph could not be loaded.</p></div> : <img className="specimen-photo" src={asset.path} alt={`${asset.label}: ${asset.scientificName}`} width={speciesId === 'argentine' ? 1156 : 3008} height={speciesId === 'argentine' ? 808 : 2000} loading="lazy" onError={() => setFailedId(asset.id)} />}
    <figcaption className="specimen-credits"><strong>{asset.label}</strong><span>Photo: {asset.photographer}</span><span><a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label={`${profile.name} photo source (opens in a new tab)`}>Photo source ↗</a> · <a href={asset.licenseUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label={`${asset.license} photograph license (opens in a new tab)`}>{asset.license} ↗</a>{asset.specimenCode ? ` · ${asset.specimenCode}` : ''}</span></figcaption>
    {onExplore && <div className="specimen-viewer"><button className="specimen-explore-button" onClick={() => onExplore(speciesId)}>Explore this ant <Icon name="zoom" size={16} /></button><span>Zoom the photograph, find body parts, and compare workers.</span></div>}
    {!compact && asset.viewerUrl && <div className="specimen-advanced-inline"><strong>Advanced research</strong><a href={asset.viewerUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Micro-CT research viewer (opens in a new tab)">Micro-CT slice viewer ↗</a><span>Internal slices of a different worker, OKENT0105450.</span></div>}
  </figure>;
}

export const anatomy = [
  { name: 'Antennae', detail: 'Jointed feelers at the front of the head.', x: 75, y: 65 },
  { name: 'Mandibles', detail: 'Paired jaws at the front of the head.', x: 105, y: 135 },
  { name: 'Head', detail: 'The front body region, carrying the eyes, antennae, and mandibles.', x: 167, y: 116 },
  { name: 'Mesosoma', detail: 'The middle body region. The six legs attach here.', x: 280, y: 122 },
  { name: 'Waist', detail: 'The narrow connection between the mesosoma and gaster.', x: 359, y: 117 },
  { name: 'Gaster', detail: 'The rounded rear portion of the body.', x: 462, y: 125 },
];

export function AntAnatomy({ selectedPart, onSelectPart }: { selectedPart?: number; onSelectPart?: (part: number) => void } = {}) {
  const [localPart, setLocalPart] = useState(0);
  const part = selectedPart ?? localPart;
  const setPart = (next: number) => { setLocalPart(next); onSelectPart?.(next); };
  const selected = anatomy[part];
  return <section className="species-comparison" aria-label="Species and anatomy comparison">
    <h3>Find the body parts</h3>
    <svg className="anatomy-diagram" viewBox="0 0 600 260" role="img" aria-label={`Illustrative worker anatomy. Selected part: ${selected.name}. Numbered labels match the buttons below.`}>
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M149 91 111 61 73 56 44 30M143 135 101 154 57 164M119 114l-20-12-13 12 12 14 22-4" />
        <ellipse cx="158" cy="116" rx="38" ry="32" /><ellipse cx="268" cy="119" rx="69" ry="28" /><path d="M198 109h11m-11 19h11M336 111q16-20 29-2l14 4m-43 13q16 10 29-5l14-1" /><ellipse cx="449" cy="120" rx="76" ry="48" />
        <path d="m235 104-14-37-48-31m87 58 6-40 46-19m-76 101-17 43-52 33m90-61 14 44 44 27m-28-123 40-42 53-6m-62 66 43 50 50 6" /><circle cx="139" cy="105" r="3" fill="currentColor" />
      </g>
      {anatomy.map((entry, index) => <g key={entry.name} className={`anatomy-marker ${index === part ? 'selected' : ''}`} aria-hidden="true"><circle cx={entry.x} cy={entry.y} r="15" /><text x={entry.x} y={entry.y + 5} textAnchor="middle">{index + 1}</text></g>)}
    </svg>
    <div className="anatomy-controls">{anatomy.map((entry, index) => <button key={entry.name} aria-pressed={part === index} onClick={() => setPart(index)}>{index + 1}. {entry.name}</button>)}</div>
    <p className="anatomy-description" aria-live="polite"><strong>{selected.name}.</strong> {selected.detail}</p><p className="reading-caption">Original schematic for orientation. It does not show diagnostic differences or a three-dimensional model. Use the specimen photographs and research for identification.</p>
  </section>;
}

export function SpeciesComparison({ onExplore }: { onExplore?: (speciesId: SpeciesId) => void } = {}) {
  return <section className="species-comparison" aria-label="Species comparison"><h3>Compare the workers</h3><p>Both playable species have one worker form. These photographs are shown at different scales.</p><div className="comparison-photos"><div><h4>Argentine ant</h4><Specimen speciesId="argentine" compact onExplore={onExplore} /></div><div><h4>Australian meat ant</h4><Specimen speciesId="meat" compact onExplore={onExplore} /></div></div><AntAnatomy /></section>;
}
