import { useEffect, useRef, useState } from 'react';
import { specimens } from '../data/specimens';
import { species } from '../data/content';
import { gameStore } from '../game/store';
import type { SpeciesId } from '../game/types';
import Specimen, { AntAnatomy, anatomy } from './Specimen';
import { Icon } from './Icons';

/** Photo gestures never mutate the game or issue swarm orders. */
export default function SpecimenExplorer({ speciesId, onBack, backLabel = 'Back to details' }: {
  speciesId: SpeciesId; onBack: () => void; backLabel?: string;
}) {
  const [currentSpecies, setCurrentSpecies] = useState(speciesId);
  const [zoom, setZoom] = useState(1);
  const [comparison, setComparison] = useState(false);
  const [anatomyRevision, setAnatomyRevision] = useState(0);
  const [part, setPart] = useState(0);
  const screen = useRef<HTMLElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { backButton.current?.focus(); }, []);
  const [failedId, setFailedId] = useState<string>();
  const pane = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLDivElement>(null);
  const offset = useRef<[number, number]>([0, 0]);
  const drag = useRef<{ id: number; x: number; y: number; initial: [number, number] } | null>(null);
  const asset = specimens.find(entry => entry.speciesId === currentSpecies);
  // Positions were inspected against these exact source photos. Meat labels refer to the right worker.
  const guidePoints = currentSpecies === 'argentine' ? [[.12,.13],[.14,.53],[.15,.34],[.45,.24],[.61,.28],[.79,.34]] : [[.46,.39],[.50,.42],[.55,.35],[.63,.44],[.70,.42],[.75,.42]];
  const photoWidth = currentSpecies === 'argentine' ? 1156 : 3008, photoHeight = currentSpecies === 'argentine' ? 808 : 2000;
  const guide = guidePoints[part];
  function paint(next: [number, number] = offset.current, scale = zoom) {
    const rect = pane.current?.getBoundingClientRect();
    const maxX = (rect?.width ?? 0) * (scale - 1) / 2;
    const maxY = (rect?.height ?? 0) * (scale - 1) / 2;
    offset.current = [Math.max(-maxX, Math.min(maxX, next[0])), Math.max(-maxY, Math.min(maxY, next[1]))];
    if (picture.current) picture.current.style.transform = 'translate(' + offset.current[0] + 'px,' + offset.current[1] + 'px) scale(' + scale + ')';
  }
  function changeZoom(next: number) {
    drag.current = null;
    const clamped = Math.max(1, Math.min(4, next));
    setZoom(clamped); paint(offset.current, clamped);
  }
  function fit() { offset.current = [0, 0]; changeZoom(1); }
  function choose(id: SpeciesId) { fit(); setCurrentSpecies(id); }
  function reset() { fit(); setComparison(false); setCurrentSpecies(speciesId); setAnatomyRevision(value => value + 1); setPart(0); }
  function cancelDrag() { const initial = drag.current?.initial; drag.current = null; if (initial) paint(initial); }
  return <section ref={screen} className="specimen-explorer" role="dialog" aria-label="Specimen explorer" aria-modal="true" onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); if (drag.current) cancelDrag(); else onBack(); }
      if (event.key !== 'Tab') return;
      const controls = Array.from(screen.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], summary, [tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
    <header className="specimen-explorer-header"><button ref={backButton} onClick={onBack}><Icon name="arrow" />{backLabel}</button><h2>Look closer</h2></header>
    <div className="specimen-explorer-scroll">
      {!asset ? <p className="empty-state">The native-community proxy represents many invertebrates, rather than one photographed ant species.</p> : <>
        <div className="specimen-explorer-intro"><h3>{species[currentSpecies].name}</h3><p className="scientific-name">{asset.scientificName}</p><p>Drag the photograph to look around. Use the controls to zoom.</p></div>
        <div className="specimen-species-picker" role="group" aria-label="Photographed species">
          <button aria-pressed={currentSpecies === 'argentine'} onClick={() => choose('argentine')}>Argentine ant</button><button aria-pressed={currentSpecies === 'meat'} onClick={() => choose('meat')}>Meat ant</button>
        </div>
        <div className="specimen-photo-pane" ref={pane} role="group" tabIndex={0} aria-label="Pan the specimen photograph with arrow keys" onKeyDown={event => {
          const directions: Record<string, [number, number]> = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
          const movement = directions[event.key];
          if (movement) { event.preventDefault(); paint([offset.current[0] + movement[0], offset.current[1] + movement[1]]); }
          if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(zoom + .5); }
          if (event.key === '-') { event.preventDefault(); changeZoom(zoom - .5); }
          if (event.key === 'Escape' && drag.current) { event.preventDefault(); event.stopPropagation(); cancelDrag(); }
        }} onPointerDown={event => {
          event.stopPropagation();
          if (!event.isPrimary || drag.current) { cancelDrag(); return; }
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, initial: [...offset.current] };
          try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Synthetic events need no native pointer capture. */ }
        }} onPointerMove={event => {
          const current = drag.current;
          if (!current || event.pointerId !== current.id) return;
          event.preventDefault(); event.stopPropagation();
          paint([current.initial[0] + event.clientX - current.x, current.initial[1] + event.clientY - current.y]);
        }} onPointerUp={event => {
          event.stopPropagation(); if (drag.current?.id === event.pointerId) drag.current = null;
        }} onPointerCancel={cancelDrag} onLostPointerCapture={() => { drag.current = null; }}>
          {failedId === asset.id ? <p role="status">Photograph could not be loaded. Open the credited source below.</p> : <div ref={picture} className="specimen-photo-layer"><img key={asset.id} src={asset.path} draggable={false} onDragStart={event => event.preventDefault()} alt={asset.label + ': ' + asset.scientificName} width={photoWidth} height={photoHeight} onLoad={() => paint()} onError={() => setFailedId(asset.id)} /><svg className="specimen-guide" viewBox={'0 0 ' + photoWidth + ' ' + photoHeight} aria-hidden="true"><circle className="guide-halo" cx={guide[0] * photoWidth} cy={guide[1] * photoHeight} r={photoWidth * .025} /><circle cx={guide[0] * photoWidth} cy={guide[1] * photoHeight} r={photoWidth * .025} /></svg></div>}
        </div>
        <p className="specimen-orientation-note">{anatomy[part].name} · approximate orientation guide{currentSpecies === 'meat' ? ' for the right-hand worker' : ''}. The original photograph is unchanged.</p>
        <div className="specimen-zoom-controls" role="group" aria-label="Specimen view controls"><button aria-label="Zoom out" disabled={zoom === 1} onClick={() => changeZoom(zoom - .5)}>−</button><span role="status" aria-live="polite">{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" disabled={zoom === 4} onClick={() => changeZoom(zoom + .5)}>+</button><button onClick={fit}>Fit specimen</button><button onClick={reset}>Reset specimen</button></div>
        <div className="specimen-explorer-credit"><strong>{asset.label}</strong><span>Photo: {asset.photographer} · {asset.specimenCode}</span><span><a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Photograph source (opens in a new tab)">Photograph source ↗</a> · <a href={asset.licenseUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label={asset.license + ' photograph license (opens in a new tab)'}>{asset.license} ↗</a></span><p>{asset.changes}</p></div>
        <AntAnatomy key={anatomyRevision} selectedPart={part} onSelectPart={setPart} />
        <button className="specimen-compare-toggle" aria-expanded={comparison} onClick={() => setComparison(value => !value)}>Compare species <Icon name="zoom" size={16} /></button>
        {comparison && <section className="specimen-worker-comparison"><h3>Compare the workers</h3><p>Both species have one worker form. These photographs use different scales; their displayed sizes are not a size comparison.</p><div className="comparison-photos"><div><h4>Argentine ant</h4><Specimen speciesId="argentine" compact /></div><div><h4>Australian meat ant</h4><Specimen speciesId="meat" compact /></div></div></section>}
        <details className="specimen-advanced"><summary>Advanced research</summary>{asset.viewerUrl ? <><p>Antscan’s viewer shows internal micro-CT slices of a different worker, OKENT0105450.</p><a href={asset.viewerUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Micro-CT slice research viewer (opens in a new tab)">Micro-CT slice viewer ↗</a></> : <p>This field photograph shows two workers. An exact meat-ant 3D scan is not included.</p>}</details>
      </>}
    </div>
  </section>;
}
