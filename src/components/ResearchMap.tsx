import { useMemo, useRef } from 'react';
import { californiaObservations, distributionRecords, globalSamples, recognitionLinks, researchDatasets } from '../data/research';
import { gameStore } from '../game/store';
import type { ResearchViewState } from '../game/types';
import { geographicProjection, WORLD_BOUNDS, type GeoBounds } from './Map';
import world from '../../public/world.json';
import californiaGeography from '../../public/research/california-geography.json';
import californiaGeographySource from '../../public/research/california-geography-source.json';

interface GeoFeature { geometry: { type: string; coordinates: number[][] | number[][][] | number[][][][] }; properties?: { kind?: string } }
const STATUS_LABELS: Record<string, string> = { native: 'Native region ○', 'established.outdoors': 'Outdoor establishment ◆', 'established.indoors': 'Indoor establishment □', 'border.interception': 'Border interception △' };
const STATUS_SYMBOLS: Record<string, string> = { native: '○', 'established.outdoors': '◆', 'established.indoors': '□', 'border.interception': '△' };
function paths(features: GeoFeature[], project: (lon: number, lat: number) => [number, number]) {
  const ring = (points: number[][], close = false) => points.map(([lon, lat], index) => (index ? 'L' : 'M') + project(lon, lat).map(value => value.toFixed(3)).join(',')).join(' ') + (close ? ' Z' : '');
  return features.flatMap((feature, index) => {
    const coordinates = feature.geometry.coordinates;
    const type = feature.geometry.type;
    const data = type === 'Polygon' ? [(coordinates as number[][][]).map(points => ring(points, true)).join(' ')] : type === 'MultiPolygon' ? (coordinates as number[][][][]).map(polygon => polygon.map(points => ring(points, true)).join(' ')) : type === 'LineString' ? [ring(coordinates as number[][])] : (coordinates as number[][][]).map(points => ring(points));
    return data.map((d, part) => ({ id: index + '-' + part, d, kind: feature.properties?.kind ?? 'land' }));
  });
}
const regionOptions = [...new Set(distributionRecords.map(record => record.region))].sort();
const transform = (view: ResearchViewState, pan = view.pan) => 'translate(' + (440 + pan[0]) + ',' + (225 + pan[1]) + ') scale(' + view.zoom + ') translate(-440,-225)';

export default function ResearchMap({ viewState, onViewStateChange }: {
  viewState: ResearchViewState; onViewStateChange: (next: ResearchViewState) => void;
}) {
  const dataset = researchDatasets.find(entry => entry.id === viewState.dataset) ?? researchDatasets[0];
  const isGlobal = dataset.id === 'global-2010', isDistribution = dataset.id === 'distribution-2022';
  const sample = globalSamples.find(entry => entry.id === viewState.sampleId) ?? globalSamples[0];
  const points = useMemo(() => californiaObservations.filter(point => point.site === viewState.site && (viewState.period === 'original' ? point.original : !point.original)), [viewState.site, viewState.period]);
  const records = useMemo(() => distributionRecords.filter(record => (viewState.distributionStatus === 'all' || record.status === viewState.distributionStatus) && (viewState.distributionRegion === 'all' || record.region === viewState.distributionRegion)), [viewState.distributionStatus, viewState.distributionRegion]);
  const current = points.find(point => point.pointId === viewState.pointId) ?? points[0];
  const bounds = useMemo<GeoBounds>(() => {
    if (isGlobal || isDistribution) return WORLD_BOUNDS;
    const all = californiaObservations.filter(point => point.site === viewState.site);
    const west = Math.min(...all.map(point => point.lon)), east = Math.max(...all.map(point => point.lon));
    const south = Math.min(...all.map(point => point.lat)), north = Math.max(...all.map(point => point.lat));
    return { west: west - (east - west) * .14, east: east + (east - west) * .14, south: south - (north - south) * .14, north: north + (north - south) * .14 };
  }, [isGlobal, isDistribution, viewState.site]);
  const project = useMemo(() => geographicProjection(bounds, 880, 450), [bounds]);
  const base = useMemo(() => paths((isGlobal || isDistribution ? world.features : californiaGeography.features) as GeoFeature[], project), [isGlobal, isDistribution, project]);
  const svg = useRef<SVGSVGElement>(null), layer = useRef<SVGGElement>(null);
  const drag = useRef<{ id: number; point: [number, number]; initial: [number, number]; next: [number, number] } | null>(null);
  function change(values: Partial<ResearchViewState>) {
    drag.current = null;
    onViewStateChange({ ...viewState, ...values });
  }
  function locate(clientX: number, clientY: number): [number, number] {
    const matrix = svg.current?.getScreenCTM();
    const point = matrix ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse()) : { x: clientX, y: clientY };
    return [point.x, point.y];
  }
  function cancelPan() { drag.current = null; layer.current?.setAttribute('transform', transform(viewState)); }
  const zoom = (amount: number) => change({ zoom: Math.max(1, Math.min(6, viewState.zoom + amount)) });
  const periodLabel = isDistribution ? 'Snapshot: 15 June 2022 · individual observation dates unavailable' : 'Observations: ' + dataset.observationPeriod;
  return <section className="research-map atlas-research-map" aria-label="Published research map">
    <div className="research-map-title"><h2>{dataset.title}</h2><p>{periodLabel}</p></div>
    <div className="research-controls">
      <label>Research dataset<select aria-label="Research dataset" value={dataset.id} onChange={event => change({ dataset: event.target.value, zoom: 1, pan: [0, 0] })}><option value="global-2010">Global recognition · 2010</option><option value="distribution-2022">Distribution snapshot · 2022</option><option value="california-2025">California observations · 2025</option></select></label>
      {isGlobal ? <label>Sample<select value={sample.id} onChange={event => change({ sampleId: event.target.value })}>{globalSamples.map(entry => <option key={entry.id} value={entry.id}>{entry.label} · {entry.id}</option>)}</select></label> : isDistribution ? <>
        <label>Distribution status<select value={viewState.distributionStatus} onChange={event => change({ distributionStatus: event.target.value })}><option value="all">All recorded statuses</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label>Recorded region<select value={viewState.distributionRegion} onChange={event => change({ distributionRegion: event.target.value })}><option value="all">All recorded regions</option>{regionOptions.map(region => <option value={region} key={region}>{region}</option>)}</select></label>
      </> : <>
        <label>Study site<select value={viewState.site} onChange={event => change({ site: event.target.value as 'TPSR' | 'PLECA', pointId: '', zoom: 1, pan: [0, 0] })}><option value="TPSR">Torrey Pines</option><option value="PLECA">Point Loma</option></select></label>
        <label>Survey period<select value={viewState.period} onChange={event => change({ period: event.target.value as 'recent' | 'original', pointId: '' })}><option value="recent">2022–2024</option><option value="original">Original · 1995–1997</option></select></label>
      </>}
    </div>
    <div className="atlas-research-body">
      <div className="research-geography">
        <svg className="research-chart" ref={svg} viewBox="0 0 880 450" role="img" tabIndex={0} aria-label={isGlobal ? 'Historical sampling locations and reported recognition assays. Choose a sample to inspect its relationships. Arrow keys pan the map.' : isDistribution ? 'Dated regional distribution reference anchors. Select a recorded region to inspect. Arrow keys pan the map.' : 'Published GPS survey sites on NOAA land and coastline geography. Use the record selector to inspect. Arrow keys pan the map.'} onKeyDown={event => {
          const moves: Record<string, [number, number]> = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
          const movement = moves[event.key];
          if (movement) { event.preventDefault(); change({ pan: [viewState.pan[0] + movement[0], viewState.pan[1] + movement[1]] }); }
          if (event.key === 'Escape') cancelPan();
        }} onPointerDown={event => {
          if (!event.isPrimary || drag.current) { cancelPan(); return; }
          drag.current = { id: event.pointerId, point: locate(event.clientX, event.clientY), initial: [...viewState.pan], next: [...viewState.pan] };
          try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Synthetic gestures need no native capture. */ }
        }} onPointerMove={event => {
          const currentDrag = drag.current;
          if (!currentDrag || currentDrag.id !== event.pointerId) return;
          event.preventDefault(); const point = locate(event.clientX, event.clientY);
          currentDrag.next = [currentDrag.initial[0] + point[0] - currentDrag.point[0], currentDrag.initial[1] + point[1] - currentDrag.point[1]];
          layer.current?.setAttribute('transform', transform(viewState, currentDrag.next));
        }} onPointerUp={event => { const currentDrag = drag.current; if (currentDrag?.id === event.pointerId) change({ pan: currentDrag.next }); }} onPointerCancel={cancelPan}>
          <rect width="880" height="450" className="research-water" />
          <g ref={layer} transform={transform(viewState)}>
            {base.map(feature => <path key={feature.id} d={feature.d} className={feature.kind === 'coastline' ? 'research-coastline' : 'research-land'} />)}
            {isGlobal ? <>
              {recognitionLinks.filter(link => link.from === sample.id || link.to === sample.id).map(link => {
                const first = globalSamples.find(entry => entry.id === link.from)!, second = globalSamples.find(entry => entry.id === link.to)!;
                const [x1, y1] = project(first.lon, first.lat), [x2, y2] = project(second.lon, second.lat);
                return <line key={link.from + '/' + link.to} x1={x1} y1={y1} x2={x2} y2={y2} className={'research-link-line ' + link.classification} />;
              })}
              {globalSamples.map(entry => { const [x, y] = project(entry.lon, entry.lat); return <g key={entry.id}><circle cx={x} cy={y} r={entry.id === sample.id ? 7 : 5} className="research-sample" /><text x={x + 9} y={y - 8}>{entry.id}</text></g>; })}
            </> : isDistribution ? records.map(record => { const [x, y] = project(record.lon, record.lat); return <text key={record.id} className={'distribution-marker ' + record.status.replaceAll('.', '-')} x={x} y={y + 4} textAnchor="middle">{STATUS_SYMBOLS[record.status]}</text>; }) : points.map(point => { const [x, y] = project(point.lon, point.lat); return <circle key={point.id} cx={x} cy={y} r={point.pointId === current?.pointId ? 7 : 3.5} className={'observation-point ' + point.status} />; })}
          </g>
        </svg>
        <div className="research-zoom-controls" role="group" aria-label="Research map controls"><button aria-label="Zoom out" disabled={viewState.zoom === 1} onClick={() => zoom(-.5)}>−</button><span role="status" aria-live="polite">{Math.round(viewState.zoom * 100)}%</span><button aria-label="Zoom in" disabled={viewState.zoom === 6} onClick={() => zoom(.5)}>+</button><button onClick={() => change({ zoom: 1, pan: [0, 0] })}>Fit map</button></div>
        <div className="research-legend">{isGlobal ? <><span className="recognition-legend-item"><i className="recognition-swatch none" aria-hidden="true" />None observed</span><span className="recognition-legend-item"><i className="recognition-swatch low" aria-hidden="true" />Low aggression</span><span className="recognition-legend-item"><i className="recognition-swatch high" aria-hidden="true" />High aggression</span><span>Unreported pairs: unknown</span></> : isDistribution ? Object.values(STATUS_LABELS).map(label => <span key={label}>{label}</span>) : <><span>● Detected</span><span>○ Not detected</span><span>NOAA land & coastline</span></>}</div>
      </div>
      <aside className="research-inspection" aria-label="Research evidence and source">
        <p className="research-period">Published {dataset.publicationYear} · {periodLabel}</p>
        <section className="research-record"><h3>{isGlobal ? sample.label : isDistribution ? records.length + ' regional records' : 'Inspect an observation'}</h3>
          {isGlobal ? <><p>{sample.locality} · {sample.precision}</p><p className="coordinate-note">{sample.coordinateNote}</p><ul className="relationship-list">{globalSamples.filter(entry => entry.id !== sample.id).map(other => {
            const result = recognitionLinks.find(link => link.from === sample.id && link.to === other.id || link.to === sample.id && link.from === other.id);
            return <li key={other.id}><strong>{other.label}</strong><span>{result ? result.aggressive + '/' + result.total + ' aggressive trials · ' + (result.classification === 'none' ? 'none observed' : result.classification + ' aggression') : 'Unknown comparison · no reported result'}</span></li>;
          })}</ul></> : isDistribution ? <><p>Regional reference anchors indicate the authors’ classifications. They are not collection points or colony borders.</p>{!records.length ? <p role="status">No records match both filters. Choose All recorded regions to broaden the view.</p> : viewState.distributionRegion !== 'all' ? records.map(record => <p key={record.id}><strong>{record.region}</strong><br />{STATUS_LABELS[record.status]}<br />{record.precision}</p>) : <dl className="distribution-counts">{Object.entries(STATUS_LABELS).map(([value, label]) => <div key={value}><dt>{label}</dt><dd>{records.filter(record => record.status === value).length}</dd></div>)}</dl>}<p>Individual observation dates and bibliographic references are not supplied in the deposited regional rows. Missing records do not prove absence.</p><a href="https://antmaps.org/?mode=species&species=Linepithema.humile" target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Explore Antmaps (opens in a new tab)">Explore Antmaps ↗</a></> : <><label>Sampling point<select aria-label="Sampling point" value={current?.pointId ?? ''} onChange={event => change({ pointId: event.target.value })}>{points.map(point => <option value={point.pointId} key={point.id}>{point.samplingPoint}</option>)}</select></label>{current && <><p><strong>{current.status === 'present' ? 'Detected' : 'Not detected'}</strong> · {current.period} · {current.method}</p><p>{current.lat.toFixed(6)}, {current.lon.toFixed(6)} · {current.soilType || 'Soil type not supplied'}</p>{current.coordinateNote && <p className="coordinate-note">{current.coordinateNote}</p>}</>}<p className="geography-credit">Backdrop: NOAA Office of Coast Survey · land and coastline share the GPS projection. Chart source dates vary.</p><a href={californiaGeographySource.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="NOAA geographic source (opens in a new tab)">NOAA source ↗</a></>}
        </section>
        <section className="research-source"><p>{dataset.caveat}</p><details><summary>Method, precision & credits</summary><p>{dataset.summary}</p><p>Method: {dataset.method}</p><p>Precision: {dataset.precision}</p><p>Reviewed {new Intl.DateTimeFormat('en', {dateStyle: 'medium', timeZone: 'UTC'}).format(new Date(dataset.reviewedAt))}</p>{isDistribution && <p>Wong, Economo & Guénard · version 1 · CC BY 4.0.</p>}<p>Global basemap: Natural Earth, public domain. Research points do not identify current battlefronts.</p></details><a href={dataset.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Read the research (opens in a new tab)">Read the research ↗</a></section>
      </aside>
    </div>
  </section>;
}
