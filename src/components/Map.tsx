import { useEffect, useMemo, useRef, useState } from 'react';
import { regions } from '../game/scenarios';
import { gameStore } from '../game/store';
import type { GameState, NestState } from '../game/types';
import { Icon } from './Icons';
import { resources } from '../data/content';
import { ResourceLink } from './Learning';
import { globalSamples } from '../data/research';
import { nestRelation } from '../game/engine';

type Polygon = number[][][];
interface Geography { features: { geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Polygon | Polygon[] } }[] }
export interface GeoBounds { west: number; east: number; south: number; north: number }
export const WORLD_BOUNDS: GeoBounds = { west: -180, east: 180, south: -61, north: 84 };
const regionalRoleIds: readonly string[] = ['gateway-nest', 'garden-edge', 'open-clearing', 'shaded-grove', 'leaf-litter-trail', 'habitat-margin'];
const compactRegionalSize = (width: number, height: number) => width <= 600 && height <= 400 || width >= 600 && height < 230;
/** One aspect-preserving geographic projection for basemaps, locators, and research points. */
export function geographicProjection(bounds: GeoBounds, width: number, height: number, padding = .04) {
  const cosine = Math.cos((bounds.north + bounds.south) / 2 * Math.PI / 180);
  const spanX = Math.max(.00001, (bounds.east - bounds.west) * cosine);
  const spanY = Math.max(.00001, bounds.north - bounds.south);
  const scale = Math.min(width * (1 - padding * 2) / spanX, height * (1 - padding * 2) / spanY);
  const left = (width - spanX * scale) / 2, top = (height - spanY * scale) / 2;
  return (lon: number, lat: number): [number, number] => [left + (lon - bounds.west) * cosine * scale, top + (bounds.north - lat) * scale];
}
export const project = (lon: number, lat: number) => geographicProjection(WORLD_BOUNDS, 2, 1)(lon, lat).map((value, index) => value / (index === 0 ? 2 : 1));
function nestPoint(node: NestState, view: string | null, width = 880, height = 450): [number, number] {
  if (view) {
    const regionalIndex = regionalRoleIds.indexOf(node.roleId);
    if (regionalIndex !== -1) {
      if (width >= 600 && height < 230) return [.09 + regionalIndex * .164, .54];
      if (width <= 600 && height <= 400) return [.17 + regionalIndex % 3 * .33, regionalIndex < 3 ? .38 : .74];
    }
    const speciesSetting = regionalIndex === -1;
    if (speciesSetting && height < 230 && width >= 600) { const index = Number(node.id.split('-').at(-1)); return [.09 + (index % 6) * .162, .32 + Math.floor(index / 6) * .44]; }
    return [.1 + node.x * .008, .12 + node.y * .0074];
  }
  const region = regions.find(r => r.id === node.regionId)!;
  const point = geographicProjection(WORLD_BOUNDS, width, height)(...region.anchor);
  return [point[0] / width, point[1] / height];
}
function geographicPaths(geography: Geography, point: (lon: number, lat: number) => [number, number]) {
  return geography.features.flatMap(feature => {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates as Polygon] : feature.geometry.coordinates as Polygon[];
    return polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat], index) => (index ? 'L' : 'M') + point(lon, lat).map(value => value.toFixed(2)).join(',')).join(' ') + ' Z').join(' '));
  });
}
type SceneColors = { land: string; paper: string; contour: string; habitat: string; ink: string; water: string; ochre: string; earth: string };
/** Original illustrated surroundings; these coordinates never claim to be real nests. */
function drawRegionalScene(ctx: CanvasRenderingContext2D, width: number, height: number, regionId: string, nodes: NestState[], colors: SceneColors) {
  let seed = [...regionId].reduce((value, character) => value * 31 + character.charCodeAt(0), 7) >>> 0;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const fillEllipse = (x: number, y: number, rx: number, ry: number, fill: string, alpha = 1) => {
    ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -.25, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  };
  ctx.fillStyle = colors.paper; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = colors.land; ctx.globalAlpha = .72; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1;
  for (let i = 0; i < 18; i++) fillEllipse(random() * width, random() * height, 70 + random() * width / 6, 25 + random() * height / 8, i % 3 ? colors.paper : colors.habitat, .12);
  for (let i = 0; i < 110; i++) {
    const x = random() * width, y = random() * height;
    ctx.strokeStyle = colors.contour; ctx.globalAlpha = .25; ctx.lineWidth = .5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 15, y - 6, x + 32, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (const node of nodes) {
    const [nx, ny] = nestPoint(node, regionId, width, height), x = nx * width, y = ny * height;
    const complex = node.terrain === 'complex';
    fillEllipse(x, y, Math.max(42, width * .085), Math.max(23, height * .06), complex ? colors.habitat : colors.paper, complex ? .13 : .30);
    const role = node.roleId;
    if (node.gateway) {
      ctx.fillStyle = colors.earth; ctx.globalAlpha = .16; ctx.fillRect(x - 55, y - 22, 110, 44); ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.earth; ctx.lineWidth = 1.3;
      for (let i = 0; i < 4; i++) { ctx.strokeRect(x - 51 + i * 25, y - 19, 21, 38); }
    }
    for (let i = 0; i < (complex ? 13 : 8); i++) {
      const angle = i / (complex ? 13 : 8) * Math.PI * 2;
      const distance = 38 + random() * Math.min(75, width / 9);
      const px = x + Math.cos(angle) * distance, py = y + Math.sin(angle) * distance * .6;
      if (role.includes('litter') || role.includes('bark')) {
        ctx.save(); ctx.translate(px, py); ctx.rotate(random() * Math.PI);
        ctx.strokeStyle = colors.earth; ctx.fillStyle = colors.ochre; ctx.globalAlpha = .48;
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(11, 0); ctx.stroke(); ctx.restore();
      } else if (complex || role.includes('scrub') || role.includes('garden') || role.includes('margin')) {
        const tall = ['japan', 'newzealand'].includes(regionId);
        const spread = tall ? 8 : 13;
        ctx.strokeStyle = colors.habitat; ctx.lineWidth = 1.1; ctx.globalAlpha = .6;
        ctx.beginPath(); ctx.moveTo(px, py + 7); ctx.lineTo(px, py - (tall ? 25 : 13)); ctx.stroke(); ctx.globalAlpha = 1;
        for (let leaf = 0; leaf < 3; leaf++) fillEllipse(px + (leaf % 2 ? 7 : -5), py - leaf * 7, spread, 5, colors.habitat, .35);
        if (role.includes('garden') || regionId === 'africa') fillEllipse(px + 3, py - 17, 2.5, 2.5, colors.ochre, .9);
      } else {
        ctx.strokeStyle = regionId === 'hawaii' ? colors.earth : colors.habitat; ctx.globalAlpha = .38; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px - 3, py + 3); ctx.lineTo(px, py - 4); ctx.lineTo(px + 2, py + 3); ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (role.includes('rock') || role.includes('gravel') || regionId === 'hawaii' || regionId === 'mediterranean') {
        fillEllipse(px + 12, py + 12, 5 + random() * 6, 3 + random() * 4, colors.earth, .2);
      }
    }
  }
}

function ant(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string, size = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(size, size);
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.ellipse(-2.8, 0, 2.1, 1.5, 0, 0, Math.PI * 2); ctx.ellipse(.5, 0, 1.7, 1, 0, 0, Math.PI * 2); ctx.ellipse(3, 0, 1.4, 1.3, 0, 0, Math.PI * 2); ctx.fill();
  for (const i of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(i * 1.5, -1); ctx.lineTo(i * 2.4 - 1, -3.6); ctx.moveTo(i * 1.5, 1); ctx.lineTo(i * 2.4 - 1, 3.6); ctx.stroke(); }
  ctx.restore();
}

export default function BattlefieldMap({ state, view, selected, onSelect, onZoom, onGroupOrder, onSelection, gestureRevision = 0, active = true }: { state: GameState; view: string | null; selected: string[]; onSelect: (id: string, order?: boolean, additive?: boolean) => void; onZoom: (region: string | null) => void; onOrder: (from: string, to: string) => void; onGroupOrder: (sources: string[], target: string) => void; onSelection: (sources: string[]) => void; active?: boolean; gestureRevision?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const geometry = useRef<Geography | null>(null);
  const selectedRef = useRef(selected);
  const [load, setLoad] = useState<'loading' | 'ready' | 'error'>('loading');
  const [revision, setRevision] = useState(0);
  const [size, setSize] = useState({ width: 880, height: 450 });
  const locatorPaths = useMemo(() => geometry.current ? geographicPaths(geometry.current, geographicProjection(WORLD_BOUNDS, 180, 84)) : [], [load]);
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
    const colors = { paper: color('--color-paper'), ochre: color('--color-rival'), earth: color('--color-rival-dark'), water: color('--color-water'), land: color('--color-land'), contour: color('--color-contour'), grid: color('--color-map-grid'), ink: color('--color-ink'), player: color('--color-player-dark'), rival: color('--color-rival-dark'), ally: color('--color-player-dark'), neutral: color('--color-neutral'), habitat: color('--color-habitat') };
    let width = 0, height = 0, frame = 0, redraw = true, lastDraw = 0;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const geographicPoint = (lon: number, lat: number) => geographicProjection(WORLD_BOUNDS, width, height)(lon, lat);
    const resize = new ResizeObserver(entries => {
      width = Math.max(1, entries[0].contentRect.width); height = Math.max(1, entries[0].contentRect.height);
      setSize({ width, height });
      surface.width = width * scale; surface.height = height * scale;
      background.width = surface.width; background.height = surface.height;
      ctx.setTransform(scale, 0, 0, scale, 0, 0); bg.setTransform(scale, 0, 0, scale, 0, 0); redraw = true;
    });
    resize.observe(surface);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    function drawBackground() {
      if (view) { drawRegionalScene(bg, width, height, view, gameStore.getState().nodes.filter(node => node.regionId === view), colors); redraw = false; return; }
      bg.fillStyle = colors.water; bg.fillRect(0, 0, width, height);
      if (geometry.current) {
        bg.fillStyle = colors.land; bg.strokeStyle = colors.contour; bg.lineWidth = .7;
        for (const feature of geometry.current.features) {
          const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates as Polygon] : feature.geometry.coordinates as Polygon[];
          for (const polygon of polygons) {
            bg.beginPath();
            for (const ring of polygon) {
              ring.forEach(([lon, lat], i) => { const p = geographicPoint(lon, lat); if (i === 0) bg.moveTo(p[0], p[1]); else bg.lineTo(p[0], p[1]); });
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
      const current = gameStore.getState();
      if (!redraw && (reduced.matches || current.status !== 'running') && now - lastDraw < 100) { frame = requestAnimationFrame(draw); return; }
      lastDraw = now;
      if (redraw) drawBackground();
      ctx.clearRect(0, 0, width, height); ctx.drawImage(background, 0, 0, width, height);
      const s = gameStore.getState();
      const byId = new Map(s.nodes.map(n => [n.id, n]));
      if (view) {
        for (const n of s.nodes.filter(n => n.regionId === view && n.terrain === 'complex')) {
          const [px, py] = nestPoint(n, view, width, height); ctx.fillStyle = colors.habitat; ctx.globalAlpha = .18;
          ctx.beginPath(); ctx.ellipse(px * width, py * height, 48, 32, -.3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.contour; ctx.lineWidth = .8;
          for (let t = 0; t < 4; t++) { const x = px * width - 34 + t * 19, y = py * height + (t % 2 ? 22 : -25); ctx.beginPath(); ctx.moveTo(x - 4, y + 5); ctx.lineTo(x, y - 5); ctx.lineTo(x + 4, y + 5); ctx.closePath(); ctx.stroke(); }
        }
      }
      for (const edge of s.edges) {
        const from = byId.get(edge.from)!, to = byId.get(edge.to)!;
        if (view ? from.regionId !== view || to.regionId !== view : edge.kind !== 'overseas') continue;
        const a = nestPoint(from, view, width, height), b = nestPoint(to, view, width, height);
        ctx.strokeStyle = selectedRef.current.includes(edge.from) || selectedRef.current.includes(edge.to) ? colors.ink : view ? colors.earth : colors.contour;
        ctx.lineWidth = selectedRef.current.includes(edge.from) || selectedRef.current.includes(edge.to) ? 1.5 : 1;
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
        const a = nestPoint(from, view, width, height), b = nestPoint(to, view, width, height);
        const edge = s.edges.find(e => (e.from === from.id && e.to === to.id) || (e.to === from.id && e.from === to.id));
        const progress = Math.min(1, fleet.elapsed / (edge?.travelSeconds || 5));
        const fleetColor = colors[fleet.owner];
        if (from.regionId !== to.regionId) {
          const x = (a[0] + (b[0] - a[0]) * progress) * width, y = (a[1] + (b[1] - a[1]) * progress) * height;
          ctx.save(); ctx.translate(x, y); ctx.fillStyle = fleetColor; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(3, 5); ctx.lineTo(-3, 5); ctx.closePath(); ctx.fill(); ctx.fillRect(-2, -5, 4, 4); ctx.restore();
        } else {
          const count = reduced.matches ? 1 : Math.min(width < 600 ? 10 : 20, Math.max(3, Math.floor(fleet.units / 3)));
          for (let i = 0; i < count; i++) { const t = Math.max(0, Math.min(1, progress - (i % 8) * .012)); ant(ctx, (a[0] + (b[0] - a[0]) * t) * width, (a[1] + (b[1] - a[1]) * t) * height + Math.floor(i / 8) * 5 - 5, Math.atan2((b[1] - a[1]) * height, (b[0] - a[0]) * width), fleetColor, .9); }
        }
      }
      if (!view && width < 600) {
        for (const n of s.nodes.filter(n => n.gateway)) { const p = nestPoint(n, view, width, height); ctx.beginPath(); ctx.fillStyle = colors[n.owner]; ctx.arc(p[0] * width, p[1] * height, 4.5, 0, Math.PI * 2); ctx.fill(); }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, [view, load, state.mode]);

  const viewport = useRef<HTMLDivElement>(null);
  const trail = useRef<SVGPolylineElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const suppressClick = useRef(false);
  type Target = { id: string; x: number; y: number; width: number; height: number };
  type Gesture = { id: number; x: number; y: number; moved: boolean; sources: string[]; prior: string[]; targets: Target[]; left: number; top: number };
  const gesture = useRef<Gesture | null>(null);
  function clearGesture(restore = false) {
    const g = gesture.current;
    if (g && restore) onSelection(g.prior);
    gesture.current = null;
    trail.current?.setAttribute('points', '');
    if (preview.current) preview.current.hidden = true;
    viewport.current?.classList.remove('ordering');
  }
  useEffect(() => { clearGesture(true); return () => clearGesture(true); }, [view, active, gestureRevision]); // A view/menu/pause change cancels the order.
  useEffect(() => {
    const surface = viewport.current;
    if (!surface) return;
    let width = surface.clientWidth, height = surface.clientHeight;
    const cancel = () => { if (gesture.current) { suppressClick.current = true; clearGesture(true); } };
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      if (rect.width !== width || rect.height !== height) cancel();
      width = rect.width; height = rect.height;
    });
    const anotherPointer = (event: PointerEvent) => { if (gesture.current && event.pointerId !== gesture.current.id) cancel(); };
    observer.observe(surface);
    window.addEventListener('resize', cancel);
    window.addEventListener('pointerdown', anotherPointer, true);
    return () => { observer.disconnect(); window.removeEventListener('resize', cancel); window.removeEventListener('pointerdown', anotherPointer, true); };
  }, []);
  function hit(g: Gesture, x: number, y: number) {
    return g.targets.filter(t => Math.abs(t.x - x) <= Math.max(22, t.width / 2) && Math.abs(t.y - y) <= Math.max(22, t.height / 2)).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
  }
  function begin(e: React.PointerEvent<HTMLDivElement>) {
    if (gesture.current) { suppressClick.current = true; clearGesture(true); return; }
    if (!active || state.mode === 'ecologist' || !e.isPrimary && e.pointerType === 'touch') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const targets = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-nest-id]')).map(button => {
      const r = button.getBoundingClientRect(); return { id: button.dataset.nestId!, x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
    });
    const initial: Gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, sources: [], prior: selectedRef.current, targets, left: rect.left, top: rect.top };
    const source = hit(initial, e.clientX, e.clientY);
    if (!source || gameStore.getState().nodes.find(n => n.id === source.id)?.owner !== 'player') return;
    initial.sources = selectedRef.current.includes(source.id) ? [...selectedRef.current] : [source.id];
    gesture.current = initial;
  }
  function move(e: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 8) return;
    e.preventDefault();
    if (!g.moved) {
      g.moved = true; onSelection(g.sources); viewport.current?.classList.add('ordering');
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* Synthetic pointer tests have no active native pointer. */ }
    }
    const target = hit(g, e.clientX, e.clientY);
    const node = target && gameStore.getState().nodes.find(n => n.id === target.id);
    if (node?.owner === 'player' && !g.sources.includes(node.id)) { g.sources.push(node.id); onSelection([...g.sources]); }
    const points = g.sources.map(id => g.targets.find(t => t.id === id)).filter((t): t is Target => !!t).map(t => `${t.x - g.left},${t.y - g.top}`);
    points.push(`${e.clientX - g.left},${e.clientY - g.top}`); trail.current?.setAttribute('points', points.join(' '));
    if (preview.current) {
      preview.current.hidden = false;
      const currentState = gameStore.getState();
      const source = currentState.nodes.find(entry => entry.id === g.sources[0]);
      const relation = node && source ? nestRelation(currentState, source, node) : 'unknown';
      preview.current.textContent = node && relation === 'unknown' ? 'Recognition unknown · inspect before sending' : node ? `${node.owner === 'neutral' ? 'Capture' : relation === 'friendly' ? 'Reinforce' : 'Attack'} ${node.name} · ${g.sources.filter(id => id !== node.id).length} sources` : 'Release outside a nest to cancel';
    }
  }
  function end(e: React.PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const target = hit(g, e.clientX, e.clientY);
    if (g.moved) {
      e.preventDefault(); suppressClick.current = true;
      if (target && active) onGroupOrder([...g.sources], target.id);
    }
    clearGesture(g.moved && !target);
  }
  const visible = state.nodes.filter(n => view ? n.regionId === view : n.gateway);
  const compactRegional = !!view && visible.length === 6 && compactRegionalSize(size.width, size.height);
  const nativeRegion = regions.find(region => region.id === 'southamerica');
  const nativePoint = nativeRegion && geographicProjection(WORLD_BOUNDS, size.width, size.height)(...nativeRegion.anchor);
  return <div className={'map-stage ' + (view ? 'illustrated-region' + (compactRegional ? ' compact-regional-board' : '') : 'geographic-world')} data-view={view ?? 'world'}>
    <div ref={viewport} className="map-viewport" onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { suppressClick.current = true; clearGesture(true); }} onClickCapture={e => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false; } }}>
    <canvas ref={canvas} className="map-canvas" aria-hidden="true" /><svg className="order-trail" aria-hidden="true"><polyline ref={trail} fill="none" /></svg><div ref={preview} className="drag-preview" hidden role="status" />
    <div className="map-heading"><span className="eyebrow">{view ? currentRegion?.nativeRange ? 'Native-range field notes' : 'Regional trail network' : 'A planet connected by tiny travelers'}</span><h2>{currentRegion?.name ?? 'The living world'}</h2><p>{view ? currentRegion?.nativeRange ? 'Native-range context · no playable nests' : 'Illustrated game board · fictional nest sites' : state.mode === 'species' ? 'Australian matchup · Worldwide context' : `${new Set(state.nodes.map(n => n.regionId)).size} regions. One continuous match.`}</p></div>
    {view && <button className="back-world" onClick={() => onZoom(null)}><Icon name="world" />World view</button>}
    {!view && <><span className="ocean-label ocean-pacific">Pacific Ocean</span><span className="ocean-label ocean-atlantic">Atlantic Ocean</span><span className="ocean-label ocean-indian">Indian Ocean</span></>}
    {visible.map(n => {
      const p = nestPoint(n, view, size.width, size.height); const region = regions.find(r => r.id === n.regionId)!;
      return <div key={n.id} data-region={n.regionId} className={`map-node-wrap ${!view && p[0] > .90 ? 'label-left' : ''}`} style={{ left: `${p[0] * 100}%`, top: `${p[1] * 100}%` }}>
        <button data-nest-id={n.id} className={`map-node ${n.owner} ${selected.includes(n.id) ? 'selected' : ''}`} aria-label={`${n.name}, ${n.owner === 'player' ? 'your nest' : n.owner === 'rival' ? 'rival nest' : n.owner === 'ally' ? 'cooperating nest' : 'unclaimed nest'}, ${Math.floor(n.units)} game units`} aria-pressed={selected.includes(n.id)} onClick={e => onSelect(n.id, true, e.shiftKey || e.metaKey)}><span className="owner-glyph" aria-hidden="true">{n.owner === 'rival' ? '◆' : n.owner === 'neutral' ? '○' : n.owner === 'ally' ? '◐' : '●'}</span><span className="node-count">{Math.floor(n.units)}</span></button>
        <div className="map-node-label"><span>{view ? n.name : region.shortName}</span>{!view ? <button aria-label={`Zoom into ${region.shortName}`} onClick={() => onZoom(region.id)}>Explore region <Icon name="zoom" size={12} /></button> : <small>{n.terrain === 'complex' ? 'Complex habitat' : 'Open terrain'}</small>}</div>
      </div>;
    })}
    {!view && nativeRegion && nativePoint && <button className="native-context-marker" style={{left: `${nativePoint[0] / size.width * 100}%`, top: `${nativePoint[1] / size.height * 100}%`}} aria-label="Zoom into South America" onClick={() => onZoom(nativeRegion.id)}><Icon name="leaf" size={18} /><span>South America<small>Native-range context</small></span></button>}
    {view && !visible.length && currentRegion && <section className="regional-context-card"><span className="eyebrow">Explore the science</span><h3>{currentRegion.nativeRange ? 'At home in the Paraná basin' : 'Regional research context'}</h3><p>{currentRegion.overview}</p><p>{currentRegion.nativeRange ? 'Argentine ants are native to this region. This area provides ecological context while the introduced-region match continues elsewhere.' : 'Species Clash’s playable matchup is in Australia. This region provides context for Argentine-ant research.'}</p><ResourceLink resource={resources.find(r => r.id === currentRegion.sourceIds[0])!}>Read the regional research</ResourceLink><button onClick={() => onZoom(state.mode === 'ecologist' ? 'california' : state.mode === 'species' ? 'australia' : null)}>{state.mode === 'ecologist' ? 'Return to the habitat survey' : state.mode === 'species' ? 'Return to the Australian matchup' : 'Return to the world map'} <Icon name="arrow" /></button></section>}
    {state.mode === 'species' && !view && <div className="species-context"><Icon name="leaf" /><span>This species matchup lives in Australia.</span><button onClick={() => onZoom('australia')}>Enter the battlefield <Icon name="arrow" /></button></div>}
    {load !== 'ready' && <div className="map-load" role={load === 'error' ? 'alert' : 'status'}>{load === 'loading' ? 'Preparing the map…' : <><span>The geographic map couldn’t load.</span><button onClick={() => { setLoad('loading'); setRevision(v => v + 1); }}>Retry map</button></>}</div>}
    {view && <figure className="region-locator" aria-label="Regional geographic locator"><svg viewBox="0 0 180 84" role="img" aria-label={currentRegion?.nativeRange ? 'Paraná native-range geographic context' : 'Historical sampled populations in this region, 2008–2009'}><rect width="180" height="84" className="locator-water" />{locatorPaths.map((path, index) => <path key={index} d={path} className="locator-land" />)}{globalSamples.filter(sample => sample.regionId === view).map(sample => { const [x, y] = geographicProjection(WORLD_BOUNDS, 180, 84)(sample.lon, sample.lat); return <circle key={sample.id} cx={x} cy={y} r="3" className="locator-point" />; })}{currentRegion?.nativeRange && (() => { const [x,y] = geographicProjection(WORLD_BOUNDS, 180, 84)(...currentRegion.anchor); return <circle cx={x} cy={y} r="3" className="locator-point" />; })()}</svg><figcaption>{currentRegion?.nativeRange ? 'Native-range context' : 'Historical samples · 2008–2009'}</figcaption></figure>}
    <div className="map-key"><span><i className="key-player" />Your colony ●</span><span><i className="key-ally" />Cooperating ◐</span><span><i className="key-rival" />Rival colony ◆</span><span><i className="key-neutral" />Unclaimed ○</span><span className="route-key">{view ? '— Local trails' : '┄ Human-assisted dispersal'}</span></div>
    <span className="map-credit">{view ? 'Original illustrated surroundings · fictional nests' : 'Geography: Natural Earth · Match state: simulated'}</span>
    </div>
  </div>;
}
