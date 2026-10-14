import { useEffect, useMemo, useRef, useState } from 'react';
import { regions } from '../game/scenarios';
import { gameStore } from '../game/store';
import type { GameState, NestState } from '../game/types';
import { Icon } from './Icons';
import { resources } from '../data/content';
import { ResourceLink } from './Learning';
import { globalSamples } from '../data/research';
import { nestRelation } from '../game/engine';
import { atlasArtboards, habitatMedallionPosition } from '../data/artboards';
import TerrainBoard from './TerrainBoard';
import '../rich-terrain.css';

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
/** Only screen coordinates change: nest identities, trails and fixed-step travel remain in the engine. */
function nestPoint(node: NestState, view: string | null, width = 880, height = 450): [number, number] {
  if (view) {
    const index = regionalRoleIds.indexOf(node.roleId);
    if (index >= 0) {
      if (width >= 600 && height < 230) return [.10 + index * .16, .50];
      if (width <= 600 && height <= 390) return [.18 + index % 3 * .32, index < 3 ? .38 : .74];
      const desktop: [number, number][] = [[.39,.58],[.38,.29],[.72,.42],[.57,.22],[.56,.79],[.80,.68]];
      const phone: [number, number][] = [[.26,.60],[.29,.34],[.72,.44],[.58,.22],[.47,.81],[.78,.69]];
      return (width <= 600 ? phone : desktop)[index];
    }
    const indexInMatch = Number(node.id.split('-').at(-1));
    if (height < 230 && width >= 600) return [.09 + indexInMatch % 6 * .162, .32 + Math.floor(indexInMatch / 6) * .44];
    if (width <= 600) return [.14 + indexInMatch % 4 * .24, .33 + Math.floor(indexInMatch / 4) * .25];
    return [.18 + indexInMatch % 4 * .22, .25 + Math.floor(indexInMatch / 4) * .28];
  }
  const region = regions.find(r => r.id === node.regionId)!;
  const point = geographicProjection(WORLD_BOUNDS, width, height, .075)(...region.anchor);
  if (width <= 600) {
    // Small atlas callouts keep neighbouring regions touchable; fine leaders retain the geographic anchors.
    if (height > 300) {
      const callouts: Record<string, [number,number]> = { california:[.20,.30], hawaii:[.10,.46], mediterranean:[.50,.24], japan:[.84,.30], africa:[.51,.60], australia:[.72,.80], newzealand:[.91,.64] };
      if (callouts[node.regionId]) return callouts[node.regionId];
    }
    const offsets: Record<string, [number, number]> = { california:[0,-.035], hawaii:[0,.015], mediterranean:[0,-.06], japan:[0,-.04], africa:[0,.045], australia:[-.06,.075], newzealand:[-.01,.18] };
    const offset = offsets[node.regionId] ?? [0,0];
    return [Math.max(26 / width, Math.min(1 - 26 / width, point[0] / width + offset[0])), point[1] / height + offset[1]];
  }
  return [point[0] / width, point[1] / height];
}

type Curve = { a: [number, number]; b: [number, number]; c1: [number, number]; c2: [number, number] };
function landscapeTrail(from: NestState, to: NestState, view: string | null, width: number, height: number): Curve {
  const start = nestPoint(from, view, width, height), end = nestPoint(to, view, width, height);
  const a: [number, number] = [start[0] * width, start[1] * height], b: [number, number] = [end[0] * width, end[1] * height];
  const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.max(1, Math.hypot(dx, dy));
  const direction = from.id < to.id ? 1 : -1;
  const bend = (view ? 1 : direction) * Math.min(view ? 90 : 120, length * (view ? .34 : .20));
  const offset: [number, number] = [-dy / length * bend, dx / length * bend];
  const c1: [number, number] = [a[0] + dx / 3 + offset[0], a[1] + dy / 3 + offset[1]];
  const c2: [number, number] = [a[0] + dx * 2 / 3 + offset[0] * (view ? -1 : 1), a[1] + dy * 2 / 3 + offset[1] * (view ? -1 : 1)];
  return { a, b, c1, c2 };
}
function traceTrail(ctx: CanvasRenderingContext2D, curve: Curve) {
  ctx.beginPath(); ctx.moveTo(...curve.a); ctx.bezierCurveTo(...curve.c1, ...curve.c2, ...curve.b);
}
function alongTrail(curve: Curve, t: number): [number, number, number] {
  const q = 1 - t;
  const x = q ** 3 * curve.a[0] + 3 * q ** 2 * t * curve.c1[0] + 3 * q * t ** 2 * curve.c2[0] + t ** 3 * curve.b[0];
  const y = q ** 3 * curve.a[1] + 3 * q ** 2 * t * curve.c1[1] + 3 * q * t ** 2 * curve.c2[1] + t ** 3 * curve.b[1];
  const dx = 3 * q ** 2 * (curve.c1[0] - curve.a[0]) + 6 * q * t * (curve.c2[0] - curve.c1[0]) + 3 * t ** 2 * (curve.b[0] - curve.c2[0]);
  const dy = 3 * q ** 2 * (curve.c1[1] - curve.a[1]) + 6 * q * t * (curve.c2[1] - curve.c1[1]) + 3 * t ** 2 * (curve.b[1] - curve.c2[1]);
  return [x, y, Math.atan2(dy, dx)];
}

function geographicPaths(geography: Geography, point: (lon: number, lat: number) => [number, number]) {
  return geography.features.flatMap(feature => {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates as Polygon] : feature.geometry.coordinates as Polygon[];
    return polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat], index) => (index ? 'L' : 'M') + point(lon, lat).map(value => value.toFixed(2)).join(',')).join(' ') + ' Z').join(' '));
  });
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
    const colors = { paper: color('--color-paper'), sand: color('--color-paper-deep'), ochre: color('--color-rival'), earth: color('--color-rival-dark'), water: color('--color-water'), land: color('--color-land'), contour: color('--color-contour'), grid: color('--color-map-grid'), ink: color('--color-ink'), player: color('--color-player-dark'), rival: color('--color-rival-dark'), ally: color('--color-player-dark'), neutral: color('--color-neutral'), habitat: color('--color-habitat') };
    let width = 0, height = 0, frame = 0, redraw = true, lastDraw = 0, alive = true;
    delete surface.dataset.renderedView;
    const worldTerrain = new Image();
    if (!view) { worldTerrain.onload = () => { redraw = true; }; worldTerrain.src = '/art/world-terrain.jpg'; }
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const geographicPoint = (lon: number, lat: number) => geographicProjection(WORLD_BOUNDS, width, height, .075)(lon, lat);
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
      bg.clearRect(0, 0, width, height);
      if (view) { redraw = false; return; }
      const sea = bg.createLinearGradient(0, 0, width, height);
      sea.addColorStop(0, colors.water); sea.addColorStop(.62, colors.water); sea.addColorStop(1, colors.land);
      bg.fillStyle = sea; bg.fillRect(0, 0, width, height);
      const land = new Path2D();
      if (geometry.current) {
        for (const path of geographicPaths(geometry.current, geographicPoint)) land.addPath(new Path2D(path));
        bg.strokeStyle = colors.paper; bg.lineWidth = 6; bg.stroke(land);
        const landWash = bg.createLinearGradient(0, 0, 0, height);
        landWash.addColorStop(0, colors.paper); landWash.addColorStop(.42, colors.land); landWash.addColorStop(.68, colors.land); landWash.addColorStop(1, colors.paper);
        bg.fillStyle = landWash; bg.fill(land, 'evenodd');
        bg.save(); bg.clip(land, 'evenodd');
        if (worldTerrain.complete && worldTerrain.naturalWidth) {
          const illustration = bg.createPattern(worldTerrain, 'repeat');
          if (illustration) {
            illustration.setTransform(new DOMMatrix().scale(Math.max(220, width / 4) / worldTerrain.naturalWidth));
            bg.globalAlpha = .68; bg.fillStyle = illustration; bg.fillRect(0, 0, width, height); bg.globalAlpha = 1;
          }
        }
        // Engraved hill marks and botanical stippling enrich the true Natural Earth geometry.
        bg.strokeStyle = colors.habitat; bg.fillStyle = colors.habitat;
        for (let row = 0; row < height / 14; row++) for (let column = 0; column < width / 18; column++) {
          const x = column * 18 + row % 2 * 9, y = row * 14;
          const tone = ((column * 17 + row * 31) % 23) / 23;
          bg.globalAlpha = .07 + tone * .11; bg.lineWidth = .8;
          bg.beginPath(); bg.moveTo(x - 6, y + 3); bg.quadraticCurveTo(x, y - 6 - tone * 5, x + 6, y + 3); bg.stroke();
          if (tone > .65) { bg.beginPath(); bg.ellipse(x + 7, y + 6, 4, 2, -.4, 0, Math.PI * 2); bg.fill(); }
        }
        bg.restore(); bg.globalAlpha = 1; bg.lineWidth = .7; bg.strokeStyle = colors.contour; bg.stroke(land);
      }
      // Faint rhumb lines and paper grain belong to the atlas, not to fictional frontlines.
      bg.strokeStyle = colors.grid; bg.lineWidth = .6;
      const compassX = width * .17, compassY = height * .80;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        bg.beginPath(); bg.moveTo(compassX, compassY); bg.lineTo(compassX + Math.cos(angle) * width * 1.2, compassY + Math.sin(angle) * width * 1.2); bg.stroke();
      }
      bg.globalAlpha = .12; bg.fillStyle = colors.ink;
      for (let x = 6; x < width; x += 9) for (let y = 5; y < height; y += 11) { if (((x * 7 + y * 3) % 23) < 7) bg.fillRect(x, y, .8, .8); }

      bg.globalAlpha = 1; redraw = false;
    }
    const draw = (now: number) => {
      if (!alive) return;
      if (width <= 0 || height <= 0) { frame = requestAnimationFrame(draw); return; }
      const current = gameStore.getState();
      if (!redraw && (reduced.matches || current.status !== 'running') && now - lastDraw < 100) { frame = requestAnimationFrame(draw); return; }
      lastDraw = now;
      if (redraw) drawBackground();
      ctx.clearRect(0, 0, width, height); ctx.drawImage(background, 0, 0, width, height);
      const s = gameStore.getState();
      const byId = new Map(s.nodes.map(n => [n.id, n]));
      for (const edge of s.edges) {
        const from = byId.get(edge.from)!, to = byId.get(edge.to)!;
        if (view ? from.regionId !== view || to.regionId !== view : edge.kind !== 'overseas') continue;
        const curve = landscapeTrail(from, to, view, width, height);
        const highlighted = selectedRef.current.includes(edge.from) || selectedRef.current.includes(edge.to);
        ctx.lineCap = 'round';
        if (view) {
          ctx.strokeStyle = colors.earth; ctx.globalAlpha = .18; ctx.lineWidth = highlighted ? 9 : 7; traceTrail(ctx, curve); ctx.stroke();
          ctx.globalAlpha = highlighted ? 1 : .85; ctx.strokeStyle = colors.sand; ctx.lineWidth = highlighted ? 6 : 4.5; traceTrail(ctx, curve); ctx.stroke();
          ctx.strokeStyle = highlighted ? colors.ink : colors.earth; ctx.globalAlpha = highlighted ? 1 : .62; ctx.lineWidth = highlighted ? 2.2 : 1.7; ctx.setLineDash([1, 8]);
        } else { ctx.strokeStyle = highlighted ? colors.ink : colors.earth; ctx.globalAlpha = highlighted ? .9 : .48; ctx.lineWidth = highlighted ? 2 : 1.2; ctx.setLineDash([4, 6]); }
        traceTrail(ctx, curve); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        if (view && from.owner !== 'neutral' && !reduced.matches) {
          const phase = s.status === 'running' ? now / 20000 : s.time / 20;
          for (let i = 0; i < 5; i++) { const t = (i / 5 + phase) % 1; const [x, y, angle] = alongTrail(curve, t); ant(ctx, x, y, angle, colors.ink, .65); }
        }

      }
      for (const fleet of s.fleets) {
        const from = byId.get(fleet.path[fleet.legIndex]), to = byId.get(fleet.path[fleet.legIndex + 1]);
        if (!from || !to || (view ? from.regionId !== view || to.regionId !== view : from.regionId === to.regionId)) continue;
        const curve = landscapeTrail(from, to, view, width, height);
        const edge = s.edges.find(e => (e.from === from.id && e.to === to.id) || (e.to === from.id && e.from === to.id));
        const progress = Math.min(1, fleet.elapsed / (edge?.travelSeconds || 5));
        const fleetColor = colors[fleet.owner];
        if (from.regionId !== to.regionId) {
          const [x, y] = alongTrail(curve, progress);
          ctx.save(); ctx.translate(x, y); ctx.fillStyle = fleetColor; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(3, 5); ctx.lineTo(-3, 5); ctx.closePath(); ctx.fill(); ctx.fillRect(-2, -5, 4, 4); ctx.restore();
        } else {
          const count = reduced.matches ? 1 : Math.min(width < 600 ? 10 : 20, Math.max(3, Math.floor(fleet.units / 3)));
          for (let i = 0; i < count; i++) { const t = Math.max(0, Math.min(1, progress - (i % 8) * .012)); const [x, y, angle] = alongTrail(curve, t); ant(ctx, x, y + Math.floor(i / 8) * 5 - 5, angle, fleetColor, .9); }
        }
      }
      if (!view && width < 600) {
        for (const n of s.nodes.filter(n => n.gateway)) {
          const region = regions.find(entry => entry.id === n.regionId)!;
          const anchor = geographicPoint(...region.anchor), p = nestPoint(n, view, width, height);
          ctx.strokeStyle = colors.ink; ctx.globalAlpha = .40; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(...anchor); ctx.lineTo(p[0] * width, p[1] * height); ctx.stroke(); ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.fillStyle = colors.ink; ctx.arc(...anchor, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (surface.dataset.renderedView !== (view ?? 'world')) surface.dataset.renderedView = view ?? 'world';
      if (!view) surface.dataset.terrainReady = worldTerrain.complete && worldTerrain.naturalWidth ? 'true' : 'false';
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { alive = false; cancelAnimationFrame(frame); resize.disconnect(); worldTerrain.onload = null; };
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
  useEffect(() => { clearGesture(true); return () => clearGesture(true); }, [view, active, gestureRevision, size.width, size.height]); // Navigation or layout changes cancel the order.
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
  const nativePoint = nativeRegion && geographicProjection(WORLD_BOUNDS, size.width, size.height, .075)(...nativeRegion.anchor);
  return <div className={'map-stage ' + (view ? 'illustrated-region' + (compactRegional ? ' compact-regional-board' : '') : 'geographic-world')} data-view={view ?? 'world'} data-mode={state.mode}>
    <div ref={viewport} className="map-viewport" onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={() => { suppressClick.current = true; clearGesture(true); }} onClickCapture={e => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false; } }}>
    {view && atlasArtboards[view] ? <TerrainBoard key={view} art={atlasArtboards[view]} /> : <div className="world-atlas-art" aria-hidden="true" />}
    <canvas ref={canvas} className="map-canvas" aria-hidden="true" /><svg className="order-trail" aria-hidden="true"><polyline ref={trail} fill="none" /></svg><div ref={preview} className="drag-preview" hidden role="status" />
    <div className="map-heading"><span className="eyebrow">{view ? currentRegion?.nativeRange ? 'Native-range field notes' : 'SUPERColony · Field atlas' : 'A planet connected by tiny travelers'}</span><h2>{currentRegion?.name ?? 'The living world'}</h2><p>{view ? currentRegion?.nativeRange ? 'Native-range context · no playable nests' : 'Simulated habitat board' : state.mode === 'species' ? 'Australian matchup · Worldwide context' : `${new Set(state.nodes.map(n => n.regionId)).size} regions. One continuous match.`}</p>{view && atlasArtboards[view] && <span className="terrain-surroundings">{atlasArtboards[view].surroundings}</span>}</div>
    {view && <button className="back-world" aria-label="World view" title="World view" onClick={() => onZoom(null)}><Icon name="world" /><span className="world-view-label">World view</span></button>}
    {!view && <><span className="ocean-label ocean-pacific">Pacific Ocean</span><span className="ocean-label ocean-atlantic">Atlantic Ocean</span><span className="ocean-label ocean-indian">Indian Ocean</span></>}
    {visible.map(n => {
      const p = nestPoint(n, view, size.width, size.height); const region = regions.find(r => r.id === n.regionId)!;
      return <div key={n.id} data-region={n.regionId} className={`map-node-wrap ${!view && p[0] > .90 ? 'label-left' : ''}`} style={{ left: `${p[0] * 100}%`, top: `${p[1] * 100}%` }}>
        <button data-nest-id={n.id} className={`map-node ${n.owner} ${selected.includes(n.id) ? 'selected' : ''}`} aria-label={`${n.name}, ${n.owner === 'player' ? 'your nest' : n.owner === 'rival' ? 'rival nest' : n.owner === 'ally' ? 'cooperating nest' : 'unclaimed nest'}, ${Math.floor(n.units)} game units`} aria-pressed={selected.includes(n.id)} onClick={e => onSelect(n.id, true, e.shiftKey || e.metaKey)}><span className="map-node-medallion" aria-hidden="true" style={view ? { backgroundPosition: habitatMedallionPosition(n.roleId, n.terrain, n.gateway) } : { backgroundImage: `url(${atlasArtboards[n.regionId]?.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} /><span className="owner-glyph" aria-hidden="true">{n.owner === 'rival' ? '◆' : n.owner === 'neutral' ? '○' : n.owner === 'ally' ? '◐' : '●'}</span><span className="node-count">{Math.floor(n.units)}</span></button>
        <div className="map-node-label"><span>{view ? n.name : region.shortName}</span>{!view ? <button aria-label={`Zoom into ${region.shortName}`} onClick={() => onZoom(region.id)}>Explore region <Icon name="zoom" size={12} /></button> : <small>{n.terrain === 'complex' ? 'Complex habitat' : 'Open terrain'}</small>}</div>
      </div>;
    })}
    {!view && nativeRegion && nativePoint && <button className="native-context-marker" style={{left: `${nativePoint[0] / size.width * 100}%`, top: `${nativePoint[1] / size.height * 100}%`}} aria-label="Zoom into South America" onClick={() => onZoom(nativeRegion.id)}><Icon name="leaf" size={18} /><span>South America<small>Native-range context</small></span></button>}
    {view && !visible.length && currentRegion && <section className="regional-context-card"><span className="eyebrow">Explore the science</span><h3>{currentRegion.nativeRange ? 'At home in the Paraná basin' : 'Regional research context'}</h3><p>{currentRegion.overview}</p><p>{currentRegion.nativeRange ? 'Argentine ants are native to this region. This area provides ecological context while the introduced-region match continues elsewhere.' : 'Species Clash’s playable matchup is in Australia. This region provides context for Argentine-ant research.'}</p><ResourceLink resource={resources.find(r => r.id === currentRegion.sourceIds[0])!}>Read the regional research</ResourceLink><button onClick={() => onZoom(state.mode === 'ecologist' ? 'california' : state.mode === 'species' ? 'australia' : null)}>{state.mode === 'ecologist' ? 'Return to the habitat survey' : state.mode === 'species' ? 'Return to the Australian matchup' : 'Return to the world map'} <Icon name="arrow" /></button></section>}
    {state.mode === 'species' && !view && <div className="species-context"><Icon name="leaf" /><span>This species matchup lives in Australia.</span><button onClick={() => onZoom('australia')}>Enter the battlefield <Icon name="arrow" /></button></div>}
    {load !== 'ready' && <div className="map-load" role={load === 'error' ? 'alert' : 'status'}>{load === 'loading' ? 'Preparing the map…' : <><span>The geographic map couldn’t load.</span><button onClick={() => { setLoad('loading'); setRevision(v => v + 1); }}>Retry map</button></>}</div>}
    {view && <figure className="region-locator" aria-label="Regional geographic locator"><svg viewBox="0 0 180 84" role="img" aria-label={currentRegion?.nativeRange ? 'Paraná native-range geographic context' : 'Historical sampled populations in this region, 2008–2009'}><rect width="180" height="84" className="locator-water" />{locatorPaths.map((path, index) => <path key={index} d={path} className="locator-land" />)}{globalSamples.filter(sample => sample.regionId === view).map(sample => { const [x, y] = geographicProjection(WORLD_BOUNDS, 180, 84)(sample.lon, sample.lat); return <circle key={sample.id} cx={x} cy={y} r="3" className="locator-point" />; })}{currentRegion?.nativeRange && (() => { const [x,y] = geographicProjection(WORLD_BOUNDS, 180, 84)(...currentRegion.anchor); return <circle cx={x} cy={y} r="3" className="locator-point" />; })()}</svg><figcaption>{currentRegion?.nativeRange ? 'Native-range context' : 'Historical samples · 2008–2009'}</figcaption></figure>}
    <div className="atlas-compass" aria-hidden="true"><span>N</span><svg viewBox="0 0 60 60"><path d="M30 3 34 25 57 30 34 34 30 57 26 34 3 30 26 26Z"/><path className="compass-light" d="m30 3 0 27 4-5ZM57 30H30l4 4ZM30 57V30l-4 4ZM3 30h27l-4-4Z"/><circle cx="30" cy="30" r="7"/></svg><span>S</span></div>
    <div className="map-key"><span><i className="key-player" />Your colony ●</span><span><i className="key-ally" />Cooperating ◐</span><span><i className="key-rival" />Rival colony ◆</span><span><i className="key-neutral" />Unclaimed ○</span><span className="route-key">{view ? '— Local trails' : '┄ Human-assisted dispersal'}</span></div>
    </div>
    <span className="map-credit">{view ? 'Original illustrated surroundings · fictional nests' : 'Natural Earth geography · illustrative terrain · simulated match'}</span>
  </div>;
}
