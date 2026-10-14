import { useMemo, useState } from 'react';
import { californiaObservations, globalSamples, recognitionLinks, researchDatasets } from '../data/research';
import { gameStore } from '../game/store';
import world from '../../public/world.json';

const globalPoint = (lon: number, lat: number) => [30 + (lon + 180) / 360 * 820, 30 + (85 - lat) / 170 * 370];
const worldPaths = world.features.flatMap(feature => {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  return (polygons as number[][][][]).map(polygon => polygon.map(ring => ring.map(([lon, lat], index) => `${index ? 'L' : 'M'}${globalPoint(lon, lat).join(',')}`).join(' ') + ' Z').join(' '));
});
export default function ResearchMap() {
  const [layer, setLayer] = useState('global-2010');
  const [sampleId, setSampleId] = useState('US1');
  const [site, setSite] = useState<'TPSR' | 'PLECA'>('TPSR');
  const [period, setPeriod] = useState<'recent' | 'original'>('recent');
  const [pointId, setPointId] = useState('');
  const isGlobal = layer === 'global-2010';
  const dataset = researchDatasets[isGlobal ? 0 : 1];
  const sample = globalSamples.find(s => s.id === sampleId)!;
  const points = useMemo(() => californiaObservations.filter(p => p.site === site && (period === 'original' ? p.original : !p.original)), [site, period]);
  const bounds = useMemo(() => {
    const all = californiaObservations.filter(p => p.site === site);
    return { west: Math.min(...all.map(p => p.lon)), east: Math.max(...all.map(p => p.lon)), south: Math.min(...all.map(p => p.lat)), north: Math.max(...all.map(p => p.lat)) };
  }, [site]);
  const localPoint = (lon: number, lat: number) => [65 + (lon - bounds.west) / (bounds.east - bounds.west) * 750, 40 + (bounds.north - lat) / (bounds.north - bounds.south) * 350];
  const current = points.find(p => p.pointId === pointId) ?? points[0];
  return <section className="research-map" aria-label="Published research map">
    <p className="research-period">Observations: {dataset.observationPeriod}</p><div className="research-controls"><label>Research dataset<select aria-label="Research dataset" value={layer} onChange={e => setLayer(e.target.value)}><option value="global-2010">Global recognition · 2010</option><option value="california-resurvey">California observations · 2025</option></select></label>
      {isGlobal ? <label>Sample<select value={sampleId} onChange={e => setSampleId(e.target.value)}>{globalSamples.map(s => <option key={s.id} value={s.id}>{s.label} · {s.id}</option>)}</select></label> : <><label>Study site<select value={site} onChange={e => { setSite(e.target.value as 'TPSR' | 'PLECA'); setPointId(''); }}><option value="TPSR">Torrey Pines</option><option value="PLECA">Point Loma</option></select></label><label>Survey period<select value={period} onChange={e => setPeriod(e.target.value as 'recent' | 'original')}><option value="recent">2022–2024</option><option value="original">Original · 1995–1997</option></select></label></>}
    </div>
    <div className="research-reading">
      <div className="research-heading"><span className="eyebrow">Published {dataset.publicationYear} · observations {dataset.observationPeriod}</span><h2>{dataset.title}</h2><p>{dataset.summary}</p></div>
      <svg className="research-chart" viewBox="0 0 880 450" role="img" aria-label={isGlobal ? 'Historical global sampling locations and reported recognition assays. Select a sample to read its relationships.' : `${site} GPS sampling points. Symbols distinguish detection from non-detection. Inspect records with the Sampling point selector.`}>
        <rect x="0" y="0" width="880" height="450" className="research-water" />
        {isGlobal ? <>
          {worldPaths.map((d, i) => <path key={i} d={d} className="research-land" />)}
          {recognitionLinks.filter(l => l.from === sampleId || l.to === sampleId).map(l => {
            const a = globalSamples.find(s => s.id === l.from)!, b = globalSamples.find(s => s.id === l.to)!;
            const [x1, y1] = globalPoint(a.lon, a.lat), [x2, y2] = globalPoint(b.lon, b.lat);
            return <line key={`${l.from}-${l.to}`} x1={x1} y1={y1} x2={x2} y2={y2} className={`research-link-line ${l.classification}`} />;
          })}
          {globalSamples.map(s => { const [x, y] = globalPoint(s.lon, s.lat); return <g key={s.id}><circle cx={x} cy={y} r={s.id === sampleId ? 7 : 5} className="research-sample" /><text x={x + 9} y={y - 8}>{s.id}</text></g>; })}
        </> : <>
          <rect x="40" y="25" width="800" height="385" className="research-land" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={40 + i * 100} x2={40 + i * 100} y1={25} y2={410} className="research-grid" />)}
          {points.map(p => { const [x, y] = localPoint(p.lon, p.lat); return <circle key={p.id} cx={x} cy={y} r={p.pointId === current?.pointId ? 7 : 3.5} className={`observation-point ${p.status}`} />; })}
          <text x="55" y="435">{bounds.west.toFixed(4)}° longitude</text><text x="650" y="435">{bounds.east.toFixed(4)}° longitude</text><text x="810" y="45">N ↑</text>
        </>}
      </svg>
      <div className="research-legend">{isGlobal ? <><span>— No aggression reported</span><span>┄ Low aggression</span><span>— High aggression</span><span>Unreported pairs remain unknown</span></> : <><span>● Detected</span><span>○ Not detected</span><span>GPS points · simplified geographic backdrop</span></>}</div>
      <section className="research-record"><h3>{isGlobal ? sample.label : 'Inspect an observation'}</h3>
        {isGlobal ? <><p>{sample.locality} · {sample.precision}</p><p className="coordinate-note">{sample.coordinateNote}</p><ul className="relationship-list">{globalSamples.filter(s => s.id !== sampleId).map(other => {
          const result = recognitionLinks.find(l => l.from === sampleId && l.to === other.id || l.to === sampleId && l.from === other.id);
          return <li key={other.id}><strong>{other.label}</strong><span>{result ? `${result.aggressive}/${result.total} aggressive trials · ${result.classification === 'none' ? 'none observed' : `${result.classification} aggression`}` : 'No reported result in this layer'}</span></li>;
        })}</ul></> : <><label>Sampling point<select value={current?.pointId ?? ''} onChange={e => setPointId(e.target.value)}>{points.map(p => <option value={p.pointId} key={p.id}>{p.samplingPoint}</option>)}</select></label>{current && <><p><strong>{current.status === 'present' ? 'Detected' : 'Not detected'}</strong> · {current.period} · {current.method}</p><p>{current.lat.toFixed(6)}, {current.lon.toFixed(6)} · {current.soilType || 'Soil type not supplied'}</p>{'coordinateNote' in current && <p className="coordinate-note">{String(current.coordinateNote)}</p>}</>}</>}
      </section>
      <div className="research-source"><p>{dataset.caveat}</p><p className="reading-caption">Method: {dataset.method}<br />Precision: {dataset.precision}<br />Reviewed {dataset.reviewedAt}</p><a href={dataset.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Read the research (opens in a new tab)">Read the research ↗</a></div>
    </div>
  </section>;
}
