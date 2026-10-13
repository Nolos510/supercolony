import { useEffect, useRef, useState } from 'react';
import { regions } from '../game/scenarios';
import { gameStore } from '../game/store';
import type { GameState, NestState, RegionDefinition } from '../game/types';
import { Icon } from './Icons';
import { resources } from '../data/content';
import { ResourceLink } from './Learning';

type Polygon = number[][][];
interface Geography { features: { geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Polygon | Polygon[] } }[] }
export const project = (lon: number, lat: number) => [.06 + (lon + 180) / 360 * .88, .08 + (84 - lat) / 145 * .78];
function camera(region: RegionDefinition | undefined, lon: number, lat: number) {
  return region ? [(lon - region.anchor[0] + 10) / 20, (region.anchor[1] + 8 - lat) / 16] : project(lon, lat);
}
function nestPoint(node: NestState, view: string | null): [number, number] {
  if (view) return [.1 + node.x * .008, .12 + node.y * .0074];
  const region = regions.find(r => r.id === node.regionId)!;
  return project(...region.anchor) as [number, number];
}
function ant(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, size = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(size, size);
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.ellipse(-2.8, 0, 2.1, 1.5, 0, 0, Math.PI * 2); ctx.ellipse(.5, 0, 1.7, 1, 0, 0, Math.PI * 2); ctx.ellipse(3, 0, 1.4, 1.3, 0, 0, Math.PI * 2); ctx.fill();
  for (const i of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(i * 1.5, -1); ctx.lineTo(i * 2.4 - 1, -3.6); ctx.moveTo(i * 1.5, 1); ctx.lineTo(i * 2.4 - 1, 3.6); ctx.stroke(); }
  ctx.restore();
}

export default function BattlefieldMap({ state, view, selected, onSelect, onZoom, onOrder }: { state: GameState; view: string | null; selected: string; onSelect: (id: string, order?: boolean) => void; onZoom: (region: string | null) => void; onOrder: (from: string, to: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const geometry = useRef<Geography | null>(null);
  const selectedRef = useRef(selected);
  const [load, setLoad] = useState<'loading' | 'ready' | 'error'>('loading');
  const [revision, setRevision] = useState(0);
  const currentRegion = regions.find(r => r.id === view);
  selectedRef.current = selected;
  useEffect(() => {
    let active = true;
    fetch('/world.json').then(r => { if (!r.ok) throw new Error('map'); return r.json(); }).then((json: Geography) => {
      if (!json.features?.length) throw new Error('empty map');
      if (active) { geometry.current = json; setLoad('ready'); }
    }).catch(() => { if (active) setLoad('error'); });
    return () => { active = false; };
  }, [revision]);

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const ctx = surface.getContext('2d');
    if (!ctx) { setLoad('error'); return; }
    const background = document.createElement('canvas');
    const bg = background.getContext('2d')!;
    const css = getComputedStyle(document.documentElement);
    const color = (token: string) => css.getPropertyValue(token).trim();
    const colors = { water: color('--color-water'), land: color('--color-land'), contour: color('--color-contour'), grid: color('--color-map-grid'), ink: color('--color-ink'), player: color('--color-player-dark'), rival: color('--color-rival-dark'), neutral: color('--color-neutral'), habitat: color('--color-habitat') };
    let width = 0, height = 0, frame = 0, redraw = true;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const region = regions.find(r => r.id === view);
    const resize = new ResizeObserver(entries => {
      width = entries[0].contentRect.width; height = entries[0].contentRect.height;
      surface.width = width * scale; surface.height = height * scale;
      background.width = surface.width; background.height = surface.height;
      ctx.setTransform(scale, 0, 0, scale, 0, 0); bg.setTransform(scale, 0, 0, scale, 0, 0); redraw = true;
    });
    resize.observe(surface);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    function drawBackground() {
      bg.fillStyle = colors.water; bg.fillRect(0, 0, width, height);
      if (geometry.current) {
        bg.fillStyle = colors.land; bg.strokeStyle = colors.contour; bg.lineWidth = .7;
        for (const feature of geometry.current.features) {
          const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates as Polygon] : feature.geometry.coordinates as Polygon[];
          for (const polygon of polygons) {
            bg.beginPath();
            for (const ring of polygon) {
              ring.forEach(([lon, lat], i) => { const p = camera(region, lon, lat); if (i === 0) bg.moveTo(p[0] * width, p[1] * height); else bg.lineTo(p[0] * width, p[1] * height); });
              bg.closePath();
            }
            bg.fill('evenodd'); bg.stroke();
          }
        }
      }
      bg.strokeStyle = colors.grid; bg.lineWidth = .6;
      for (let x = 0; x < width; x += width / 12) { bg.beginPath(); bg.moveTo(x, 0); bg.lineTo(x, height); bg.stroke(); }
      for (let y = 0; y < height; y += height / 6) { bg.beginPath(); bg.moveTo(0, y); bg.lineTo(width, y); bg.stroke(); }
      bg.globalAlpha = .2; bg.fillStyle = colors.contour;
      for (let x = 8; x < width; x += 13) for (let y = 6; y < height; y += 13) { if (((x * 7 + y * 3) % 19) < 8) bg.fillRect(x, y, .7, .7); }
      bg.globalAlpha = 1; redraw = false;
    }
    const draw = (now: number) => {
      if (redraw) drawBackground();
      ctx.clearRect(0, 0, width, height); ctx.drawImage(background, 0, 0, width, height);
      const s = gameStore.getState();
      const byId = new Map(s.nodes.map(n => [n.id, n]));
      if (view) {
        for (const n of s.nodes.filter(n => n.regionId === view && n.terrain === 'complex')) {
          const [px, py] = nestPoint(n, view); ctx.fillStyle = colors.habitat; ctx.globalAlpha = .18;
          ctx.beginPath(); ctx.ellipse(px * width, py * height, 48, 32, -.3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.contour; ctx.lineWidth = .8;
          for (let t = 0; t < 4; t++) { const x = px * width - 34 + t * 19, y = py * height + (t % 2 ? 22 : -25); ctx.beginPath(); ctx.moveTo(x - 4, y + 5); ctx.lineTo(x, y - 5); ctx.lineTo(x + 4, y + 5); ctx.closePath(); ctx.stroke(); }
        }
      }
      for (const edge of s.edges) {
        const from = byId.get(edge.from)!, to = byId.get(edge.to)!;
        if (view ? from.regionId !== view || to.regionId !== view : edge.kind !== 'overseas') continue;
        const a = nestPoint(from, view), b = nestPoint(to, view);
        ctx.strokeStyle = edge.from === selectedRef.current || edge.to === selectedRef.current ? colors.ink : colors.contour;
        ctx.lineWidth = edge.from === selectedRef.current || edge.to === selectedRef.current ? 1.5 : 1;
        ctx.setLineDash(edge.kind === 'overseas' ? [4, 6] : []);
        ctx.beginPath(); ctx.moveTo(a[0] * width, a[1] * height); ctx.lineTo(b[0] * width, b[1] * height); ctx.stroke(); ctx.setLineDash([]);
        if (view && from.owner !== 'neutral' && !reduced.matches) {
          const phase = s.status === 'running' ? now / 20000 : s.time / 20;
          for (let i = 0; i < 5; i++) { const t = (i / 5 + phase) % 1; ant(ctx, (a[0] + (b[0] - a[0]) * t) * width, (a[1] + (b[1] - a[1]) * t) * height, Math.atan2((b[1] - a[1]) * height, (b[0] - a[0]) * width), colors[from.owner], .65); }
        }
      }
      for (const fleet of s.fleets) {
        const from = byId.get(fleet.path[fleet.legIndex]), to = byId.get(fleet.path[fleet.legIndex + 1]);
        if (!from || !to || (view ? from.regionId !== view || to.regionId !== view : from.regionId === to.regionId)) continue;
        const a = nestPoint(from, view), b = nestPoint(to, view);
        const edge = s.edges.find(e => (e.from === from.id && e.to === to.id) || (e.to === from.id && e.from === to.id));
        const progress = Math.min(1, fleet.elapsed / (edge?.travelSeconds || 5));
        const fleetColor = colors[fleet.owner];
        if (from.regionId !== to.regionId) {
          const x = (a[0] + (b[0] - a[0]) * progress) * width, y = (a[1] + (b[1] - a[1]) * progress) * height;
          ctx.save(); ctx.translate(x, y); ctx.fillStyle = fleetColor; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(3, 5); ctx.lineTo(-3, 5); ctx.closePath(); ctx.fill(); ctx.fillRect(-2, -5, 4, 4); ctx.restore();
        } else {
          const count = Math.min(25, Math.max(3, Math.floor(fleet.units / 3)));
          for (let i = 0; i < count; i++) { const t = Math.max(0, Math.min(1, progress - (i % 8) * .012)); ant(ctx, (a[0] + (b[0] - a[0]) * t) * width, (a[1] + (b[1] - a[1]) * t) * height + Math.floor(i / 8) * 5 - 5, Math.atan2((b[1] - a[1]) * height, (b[0] - a[0]) * width), fleetColor, .9); }
        }
      }
      if (!view && width < 600) {
        for (const n of s.nodes.filter(n => n.gateway)) { const p = nestPoint(n, view); ctx.beginPath(); ctx.fillStyle = colors[n.owner]; ctx.arc(p[0] * width, p[1] * height, 4.5, 0, Math.PI * 2); ctx.fill(); }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, [view, load]);

  const visible = state.nodes.filter(n => view ? n.regionId === view : n.gateway);
  return <div className="map-stage" data-view={view ?? 'world'}>
    <div className="map-viewport">
    <canvas ref={canvas} className="map-canvas" aria-hidden="true" />
    <div className="map-heading"><span className="eyebrow">{view ? 'Within the supercolony' : 'A planet connected by tiny travelers'}</span><h2>{currentRegion?.name ?? 'The living world'}</h2><p>{view ? currentRegion?.nativeRange ? 'Native range · Simulated nests' : 'Simulated nests · Real regional context' : state.mode === 'species' ? 'Australian matchup · Worldwide context' : `${new Set(state.nodes.map(n => n.regionId)).size} regions. One continuous match.`}</p></div>
    {view && <button className="back-world" onClick={() => onZoom(null)}><Icon name="world" />World view</button>}
    {!view && <><span className="ocean-label ocean-pacific">Pacific Ocean</span><span className="ocean-label ocean-atlantic">Atlantic Ocean</span><span className="ocean-label ocean-indian">Indian Ocean</span></>}
    {visible.map(n => {
      const p = nestPoint(n, view); const region = regions.find(r => r.id === n.regionId)!;
      return <div key={n.id} data-region={n.regionId} className={`map-node-wrap ${!view && p[0] > .90 ? 'label-left' : ''}`} style={{ left: `${p[0] * 100}%`, top: `${p[1] * 100}%` }}>
        <button className={`map-node ${n.owner} ${selected === n.id ? 'selected' : ''}`} aria-label={`${n.name}, ${n.owner === 'player' ? 'your nest' : n.owner === 'rival' ? 'rival nest' : 'unclaimed nest'}, ${Math.floor(n.units)} game units`} aria-pressed={selected === n.id} onClick={() => onSelect(n.id, true)} draggable={n.owner === 'player' && state.mode !== 'ecologist'} onDragStart={e => e.dataTransfer.setData('text/plain', n.id)} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const from = e.dataTransfer.getData('text/plain'); if (from) onOrder(from, n.id); }}><span className="owner-glyph" aria-hidden="true">{n.owner === 'rival' ? '◆' : n.owner === 'neutral' ? '○' : '●'}</span><span className="node-count">{Math.floor(n.units)}</span></button>
        <div className="map-node-label"><span>{view ? n.name : region.shortName}</span>{!view ? <button aria-label={`Zoom into ${region.shortName}`} onClick={() => onZoom(region.id)}>Explore region <Icon name="zoom" size={12} /></button> : <small>{n.terrain === 'complex' ? 'Complex habitat' : 'Open terrain'}</small>}</div>
      </div>;
    })}
    {view && !visible.length && currentRegion && <section className="regional-context-card"><span className="eyebrow">Explore the science</span><h3>{currentRegion.name}</h3><p>{currentRegion.overview}</p><p>{state.mode === 'ecologist' && currentRegion.nativeRange ? 'Argentine ants are native to this region. Ecologist focuses on introduced populations elsewhere, so this area is educational context.' : 'Species Clash’s playable matchup is in Australia. This region provides context for Argentine-ant research.'}</p><ResourceLink resource={resources.find(r => r.id === currentRegion.sourceIds[0])!}>Read the regional research</ResourceLink><button onClick={() => onZoom(state.mode === 'ecologist' ? 'california' : 'australia')}>{state.mode === 'ecologist' ? 'Return to the habitat survey' : 'Return to the Australian matchup'} <Icon name="arrow" /></button></section>}
    {state.mode === 'species' && !view && <div className="species-context"><Icon name="leaf" /><span>This species matchup lives in Australia.</span><button onClick={() => onZoom('australia')}>Enter the battlefield <Icon name="arrow" /></button></div>}
    {load !== 'ready' && <div className="map-load" role={load === 'error' ? 'alert' : 'status'}>{load === 'loading' ? 'Preparing the map…' : <><span>The geographic map couldn’t load.</span><button onClick={() => { setLoad('loading'); setRevision(v => v + 1); }}>Retry map</button></>}</div>}
    <div className="map-key"><span><i className="key-player" />Your colony ●</span><span><i className="key-rival" />Rival colony ◆</span><span><i className="key-neutral" />Unclaimed ○</span><span className="route-key">{view ? '— Local trails' : '┄ Human-assisted dispersal'}</span></div>
    <span className="map-credit">Geography: Natural Earth · Match state: simulated</span>
    </div>
    {!view && <div className="mobile-world-regions" aria-label="World gateway nests">{regions.map(region => {
      const gateway = state.nodes.find(n => n.regionId === region.id && n.gateway);
      return <div className={`world-region-control ${gateway?.owner ?? 'neutral'}`} key={region.id}><button className="region-order" onClick={() => gateway ? onSelect(gateway.id, true) : onZoom(region.id)} aria-label={`${region.shortName}${gateway ? `, ${Math.floor(gateway.units)} game units` : ', scientific context'}`}><span className="region-owner" aria-hidden="true">{gateway?.owner === 'rival' ? '◆' : gateway?.owner === 'player' ? '●' : '○'}</span><span>{region.shortName}<small>{gateway ? `${Math.floor(gateway.units)} game units` : 'Scientific context'}</small></span></button><button aria-label={`Zoom into ${region.shortName}`} onClick={() => onZoom(region.id)}><Icon name="zoom" size={16} /></button></div>;
    })}</div>}
  </div>;
}
