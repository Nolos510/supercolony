import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gameStore, startClock } from './game/store';
import { regions, scenarios } from './game/scenarios';
import { habitat, territory } from './game/engine';
import { facts, resources } from './data/content';
import type { ModeId, SpeciesId, Intervention } from './game/types';
import Map from './components/Map';
import Menu from './components/Menu';
import Inspector from './components/Inspector';
import SourcePicker from './components/SourcePicker';
import MatchMenu from './components/MatchMenu';
import CooperationTour from './components/CooperationTour';
import RegionalCommands, { RegionProgress } from './components/RegionalCommands';

import Learning, { ResourceLink } from './components/Learning';
import { Icon } from './components/Icons';

const ResearchMap = lazy(() => import('./components/ResearchMap'));

function Results({ onRestart, onMenu, onContinue }: { onRestart: () => void; onMenu: () => void; onContinue?: () => void }) {
  const state = gameStore.getState();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const reviewing = !!onContinue;
  const ending = reviewing ? 'Your trails so far.' : state.status === 'won' ? 'Your little world, thriving.' : state.status === 'draw' ? 'A closely matched world.' : 'Every trail teaches something.';
  const discoveries = [state.mode === 'ecologist' ? 'habitats' : state.mode === 'species' ? 'terrain' : 'supercolonies', ...state.discovered, 'transport', 'biodiversity'].filter((id, i, list) => list.indexOf(id) === i).slice(0, 3).map(id => facts.find(f => f.id === id)!).filter(Boolean);
  const antweb = resources.find(r => r.id === 'antweb')!;
  const observation = resources.find(r => r.id === 'inaturalist')!;
  const prevention = resources.find(r => r.id === 'doc-nz')!;
  return <dialog ref={dialog} className="results-dialog" aria-label={reviewing ? 'Match review' : 'Match results'} onCancel={onContinue ?? onMenu}>
    <span className="eyebrow">{reviewing ? 'Match review' : state.status === 'won' ? 'Victory' : state.status === 'draw' ? 'A draw' : 'Match complete'} · {scenarios[state.mode].name}</span><h2>{ending}</h2>
    <p>{state.mode === 'ecologist' ? `You retained ${Math.round(habitat(state) * 100)}% of the starting native habitat.` : `You currently hold ${territory(state).player} of ${state.nodes.length} nests.`} {reviewing ? 'Your match is paused while you explore.' : state.mode === 'ecologist' ? 'The five-minute habitat survey is complete.' : 'The match ended because one colony had no nests or swarms left.'}</p>
    <dl className="result-stats">
      <div><dt>Capture events</dt><dd>{state.stats.captures}</dd><dd className="stat-definition">Unclaimed or rival nests taken, including recaptures.</dd></div>
      <div><dt>{state.mode === 'ecologist' ? 'Interventions used' : 'Manual swarms sent'}</dt><dd>{state.mode === 'ecologist' ? state.stats.interventions : state.stats.orders}</dd><dd className="stat-definition">{state.mode === 'ecologist' ? 'Accepted habitat, food, or transport actions.' : 'Accepted manual dispatches, including rally and reinforcements. Automatic rally is counted separately.'}</dd></div>
      <div><dt>Topics encountered</dt><dd>{state.discovered.length}</dd><dd className="stat-definition">Unique science topics linked to match events. This does not measure learning.</dd></div>
    </dl>
    <p className="support-summary">Manual reinforcements: {state.stats.reinforcementOrders} orders · {state.stats.reinforcementWorkers} workers sent. These orders targeted your own or cooperating nests.</p><p className="support-summary">Automatic rally: {state.stats.automaticRallyOrders} swarms · {state.stats.automaticRallyWorkers} workers moved. Foraging development: {state.stats.developmentOrders} investments · {state.stats.developmentWorkers} worker units committed. Automatic swarms are separate from manual orders.</p><h3>Three things to take with you</h3><div className="result-discoveries">{discoveries.map(f => <article key={f.id}><h4>{f.title}</h4><p>{f.summary}</p><ResourceLink resource={resources.find(r => r.id === f.resourceIds[0])!}>Explore further</ResourceLink></article>)}</div>
    <section className="result-involvement"><h3>Keep following the ants</h3><div className="next-steps">
      <article><h4>Explore Argentine ants</h4><p>AntWeb offers specimen images, taxonomy, and recorded localities for research.</p><ResourceLink resource={antweb}>Compare Argentine-ant specimens</ResourceLink></article>
      <article><h4>Share an ant photo</h4><p>iNaturalist lets you share a photo, date, and location for community identification.</p><ResourceLink resource={observation}>Learn to record an observation</ResourceLink></article>
      <article><h4>Help prevent spread</h4><p>New Zealand’s official guidance explains checking plants and equipment before moving them.</p><ResourceLink resource={prevention}>Prevent accidental spread (NZ)</ResourceLink></article>
    </div></section>
    <div className="result-actions">{onContinue ? <button className="primary" onClick={onContinue}>Continue match <Icon name="play" /></button> : <button className="primary" onClick={onRestart}>Play again <Icon name="reset" /></button>}<button onClick={onMenu}>Choose another mode</button></div>
  </dialog>;
}

type Screen = 'home' | 'play' | 'menu' | 'review' | 'sources' | 'details' | 'learn' | 'cooperation';
interface Navigation {
  screen: Screen; layer: 'game' | 'research'; returnTo: 'home' | 'play' | 'details' | 'learn'; history: Screen[];
  restoreReading?: boolean; tab: 'guide' | 'resources'; fact?: string; species?: SpeciesId; region?: string;
}
const initialNavigation: Navigation = { screen: 'home', layer: 'game', returnTo: 'home', history: [], tab: 'guide' };

export default function App() {
  const state = useSyncExternalStore(gameStore.subscribe, gameStore.getSnapshot);
  const [navigation, setNavigation] = useState<Navigation>(initialNavigation);
  const [hasStarted, setHasStarted] = useState(false);
  const [view, setView] = useState<string | null>(null);
  const [selected, setSelected] = useState('california-0');
  const [sourceIds, setSourceIds] = useState<string[]>(['california-0']);
  const [destination, setDestination] = useState('california-1');
  const [fraction, setFraction] = useState(.5);
  const [tutorial, setTutorial] = useState<'intro' | 'active' | null>(null);
  const [notice, setNotice] = useState('');
  const [matchRevision, setMatchRevision] = useState(0);
  const [cooperationSeen, setCooperationSeen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [fractionOpen, setFractionOpen] = useState(false);
  const [layoutRevision, setLayoutRevision] = useState(0);
  const mainLayout = useRef<HTMLElement>(null);
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 1000px) and (min-height: 600px)').matches);
  const detailsDialog = useRef<HTMLDialogElement>(null);
  const detailsScroll = useRef<HTMLDivElement>(null);
  const fieldworkTarget = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const screen = navigation.screen;
  const research = navigation.layer === 'research';
  const ended = ['won', 'lost', 'draw'].includes(state.status);
  const node = state.nodes.find(n => n.id === selected) ?? state.nodes[0];
  const owned = state.nodes.filter(n => n.owner === 'player');
  const selectedSources = sourceIds.filter(id => owned.some(n => n.id === id));
  const sourceNode = owned.find(n => n.id === selectedSources[0]) ?? owned[0] ?? node;
  const targetNode = state.nodes.find(n => n.id === destination && n.id !== sourceNode.id) ?? state.nodes.find(n => n.id !== sourceNode.id)!;
  const counts = territory(state);
  const commandRegion = view ?? node.regionId;
  const timeLeft = state.duration === null ? null : Math.max(0, state.duration - Math.floor(state.time));
  const unitPreview = owned.filter(n => selectedSources.includes(n.id) && n.id !== targetNode.id).reduce((sum, n) => sum + Math.floor(n.units * fraction), 0);
  useEffect(() => { gameStore.pause(true); return startClock(); }, []);
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);
  useEffect(() => {
    const media = matchMedia('(min-width: 1000px) and (min-height: 600px)');
    const changed = () => setDesktop(media.matches); media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  useEffect(() => {
    const dialog = detailsDialog.current;
    if (!dialog) return;
    dialog.close();
    if (!ended && screen === 'details') dialog.showModal();
    else if (!ended && desktop && inspectorOpen && screen === 'play' && !research) dialog.show();
  }, [screen, desktop, research, ended, inspectorOpen]);
  useEffect(() => {
    const valid = sourceIds.filter(id => state.nodes.some(n => n.id === id && n.owner === 'player'));
    if (valid.length !== sourceIds.length) setSourceIds(valid);
  }, [sourceIds, state.nodes]);
  useEffect(() => { if (detailsScroll.current) detailsScroll.current.scrollTop = 0; }, [matchRevision, node.id]);
  useEffect(() => { if (screen === 'details' && fieldworkTarget.current) { fieldworkTarget.current = false; requestAnimationFrame(() => detailsScroll.current?.querySelector('.fieldwork')?.scrollIntoView({ block: 'start' })); } }, [screen]);
  useEffect(() => {
    const dialog = detailsDialog.current, main = mainLayout.current;
    if (!dialog || !main) return;
    if (!desktop || !inspectorOpen || screen !== 'play' || research) { dialog.style.top = ''; dialog.style.bottom = ''; return; }
    const position = () => { const rect = main.getBoundingClientRect(); dialog.style.top = `${rect.top}px`; dialog.style.bottom = `${Math.max(0, innerHeight - rect.bottom)}px`; };
    const observer = new ResizeObserver(position); observer.observe(main); position();
    return () => observer.disconnect();
  }, [desktop, inspectorOpen, screen, research]);
  function changeView(next: string | null) {
    setView(next); setLayoutRevision(v => v + 1);
    if (next && node.regionId !== next) { const gateway = state.nodes.find(n => n.regionId === next && n.gateway); if (gateway) setSelected(gateway.id); }
  }
  function details() {
    if (view && !state.nodes.some(n => n.regionId === view)) { learn('guide', undefined, undefined, view); return; }
    setLayoutRevision(v => v + 1); setFractionOpen(false);
    if (desktop) setInspectorOpen(v => !v); else open('details');
  }
  function selectRegion() {
    const ids = gameStore.getState().nodes.filter(n => n.regionId === commandRegion && n.owner === 'player').map(n => n.id);
    setSourceIds(ids); notify(`${ids.length} regional nests selected. Choose a destination to send.`);
  }
  function rally() {
    const result = gameStore.rally(commandRegion, fraction);
    notify(result.error ?? `${result.sentFromIds.length} swarms rallying to the gateway.${result.skipped.length ? ` ${result.skipped.length} sources waiting.` : ''}`);
  }
  function automatic(enabled: boolean) { const error = gameStore.autoRally(commandRegion, enabled); notify(error ?? (enabled ? 'Auto rally on: wait for 20 workers, send 10, keep at least 10.' : 'Auto rally off.')); }
  function develop(regionId: string) { const resume = gameStore.getState().status === 'paused'; const error = gameStore.develop(regionId, resume); if (!error && screen === 'details') play(); notify(error ?? 'Foraging network preparing: 20 game seconds.'); }
  function notify(message: string) {
    setNotice(message); if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 4500);
  }
  function open(next: Screen, values: Partial<Navigation> = {}) {
    returnFocus.current = document.activeElement as HTMLElement;
    if (!(next === 'details' && state.mode === 'ecologist')) gameStore.pause(true);
    setNavigation(n => ({ ...n, screen: next, returnTo: n.screen === 'home' ? 'home' : n.screen === 'details' ? 'details' : n.screen === 'learn' ? 'learn' : 'play', history: [...n.history, n.screen], restoreReading: false, ...values }));
  }
  function back(resume = false) {
    setNavigation(n => { const history = n.history.slice(0, -1); const previous = n.history.at(-1) ?? (hasStarted ? 'play' : 'home'); return { ...n, screen: previous, history, restoreReading: previous === 'learn', returnTo: (history.at(-1) ?? (hasStarted ? 'play' : 'home')) as Navigation['returnTo'] }; });
    if (resume) gameStore.pause(false);
    requestAnimationFrame(() => returnFocus.current?.focus());
  }
  function play(resume = false) {
    setNavigation(n => ({ ...n, screen: 'play', history: [], returnTo: 'play' }));
    if (resume) gameStore.pause(false);
  }
  function start(mode: ModeId, species: SpeciesId = 'argentine', withTutorial = true) {
    gameStore.start(mode, species);
    const source = mode === 'species' ? 'australia-0' : 'california-0';
    setSelected(source); setSourceIds([source]); setDestination(mode === 'species' ? 'australia-1' : 'california-1');
    setView(mode === 'species' ? 'australia' : null); setMatchRevision(v => v + 1);
    setNavigation({ ...initialNavigation, screen: 'play', returnTo: 'play' });
    setHasStarted(true); setCooperationSeen(false); setInspectorOpen(false); setOrdersOpen(false); setFractionOpen(false); setLayoutRevision(v => v + 1); setNotice(''); setTutorial(withTutorial ? 'intro' : null);
    if (withTutorial) gameStore.pause(true);
  }
  function exit() {
    gameStore.start('war'); gameStore.pause(true); setHasStarted(false); setTutorial(null);
    setNavigation(initialNavigation); setSourceIds(['california-0']); setSelected('california-0'); setView(null);
    setMatchRevision(v => v + 1); setInspectorOpen(false); setOrdersOpen(false); setFractionOpen(false); setLayoutRevision(v => v + 1);
  }
  function learn(tab: 'guide' | 'resources', fact?: string, species?: SpeciesId, region?: string) { open('learn', { tab, fact, species, region }); }
  function choose(id: string, _order = false, additive = false) {
    const target = gameStore.getState().nodes.find(n => n.id === id);
    if (!target) return;
    setSelected(id);
    if (state.mode !== 'ecologist') {
      if (target.owner === 'player') setSourceIds(ids => additive ? ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id] : [id]);
      else setDestination(id);
      if (target.owner === 'ally' && !cooperationSeen) { setCooperationSeen(true); open('cooperation'); }
    }
  }
  function order(ids = selectedSources, to = targetNode.id) {
    const result = gameStore.sendMany(ids, to, fraction);
    setDestination(to);
    notify(result.error ?? `${result.sentFromIds.length === 1 ? 'Swarm dispatched' : `${result.sentFromIds.length} swarms dispatched`}.${result.skipped.length ? ` ${result.skipped.length} sources skipped.` : ''}`);
  }
  function intervene(kind: Intervention) {
    const error = gameStore.intervene(node.id, kind);
    notify(error ?? `${kind === 'habitat' ? 'Habitat supported' : kind === 'food' ? 'Food subsidy reduced' : 'Transport restricted'}. Watch what changes.`);
    return error;
  }
  function switchLayer(layer: 'game' | 'research') {
    setFractionOpen(false); setLayoutRevision(v => v + 1); gameStore.pause(true); setNavigation(n => ({ ...n, layer }));
  }
  const overlay = screen !== 'play' || ended;
  return <div className="app-shell">
    <a className="skip-link" href="#battlefield">Skip to the battlefield</a>
    <div className="game-surface" inert={overlay} aria-hidden={overlay}>
      <header className="topbar">
        <button className="game-menu-button" onClick={() => { setTutorial(null); if (hasStarted) open('menu'); else exit(); }} aria-label="SUPERColony game menu"><Icon name="leaf" /><span>Game menu</span></button>
        <div className="brand" translate="no"><span className="brand-word">SUPER<span className="brand-light">Colony</span></span><span className="header-mode">{scenarios[state.mode].name}</span></div>
        <div className="topbar-controls"><button onClick={() => learn('guide')}><Icon name="book" /><span>Learn</span></button><button className="pause-button" aria-label={state.status === 'paused' ? 'Resume match' : 'Pause match'} onClick={() => gameStore.pause(state.status !== 'paused')} disabled={ended || research || !hasStarted}><Icon name={state.status === 'paused' ? 'play' : 'pause'} /><span>{state.status === 'paused' ? 'Resume' : 'Pause'}</span></button></div>
      </header>
      <section className="match-bar" aria-label="Match progress">
        <span className="match-clock" aria-label={timeLeft === null ? 'No time limit' : `${Math.floor(timeLeft / 60)} minutes ${timeLeft % 60} seconds remaining`}>{timeLeft === null ? 'No time limit' : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</span>
        {state.mode === 'ecologist' ? <span className="habitat-status">Habitat <strong>{Math.round(habitat(state) * 100)}%</strong> · goal 60%</span> : <div className="network-counts" aria-label="Nest ownership"><span>● You <strong>{counts.player}</strong></span>{state.mode === 'war' && <span>◐ Cooperating <strong>{counts.ally}</strong></span>}<span>◆ Rival <strong>{counts.rival}</strong></span></div>}
        <div className="map-layers" aria-label="Map layer"><button aria-pressed={!research} onClick={() => research && (hasStarted ? switchLayer('game') : exit())}>Game</button><button aria-pressed={research} onClick={() => switchLayer('research')}>Research</button></div>
      </section>
      <main ref={mainLayout} className={`game-layout ${research ? 'research-layout' : ''} ${desktop && inspectorOpen && !research ? 'inspector-open' : ''}`} id="battlefield">
        <h1 className="sr-only">SUPERColony strategy game</h1>
        <div className="battlefield-wrap">
          {!research && <div className="map-toolbar"><label className="region-switch"><span className="sr-only">Explore region</span><select value={view ?? 'world'} onChange={e => changeView(e.target.value === 'world' ? null : e.target.value)} aria-label="Map view"><option value="world">World map</option>{regions.map(r => <option value={r.id} key={r.id}>{r.shortName}</option>)}</select></label><button className="details-toggle" onClick={details} aria-expanded={desktop ? inspectorOpen : screen === 'details'} aria-controls="nest-details">Nest details <span aria-hidden="true">{desktop && inspectorOpen ? '◂' : '▸'}</span></button></div>}
          {!research && <RegionProgress state={state} regionId={commandRegion} showRegionName={!view} />}
          {research ? <Suspense fallback={<div className="map-load" role="status">Loading research…</div>}><ResearchMap /></Suspense> : <Map state={state} view={view} selected={state.mode === 'ecologist' ? [node.id] : selectedSources} onSelect={choose} onZoom={changeView} gestureRevision={layoutRevision} onOrder={(from, to) => order([from], to)} onGroupOrder={order} onSelection={setSourceIds} active={screen === 'play' && state.status === 'running' && tutorial !== 'intro'} />}
          {tutorial && !research && <section className="tutorial" aria-label="Interactive tutorial"><h2>{tutorial === 'intro' ? 'Your first trail' : state.stats.orders > 0 || state.stats.interventions > 0 ? 'Watch your decision unfold' : state.mode === 'ecologist' ? 'Protect a patch of habitat' : 'Choose a destination'}</h2><p>{tutorial === 'intro' ? state.mode === 'ecologist' ? 'Observe a habitat, choose a response, then record what changes.' : 'Choose a percentage. Drag from your nest to another, then release to send.' : state.stats.orders > 0 || state.stats.interventions > 0 ? state.mode === 'ecologist' ? 'Orders explains the fieldwork controls. Nest details reveals habitat context. Both panels collapse to give the map room.' : 'Open Orders for Select region, Rally, and Auto rally. Nest details reveals growth and habitat context. Both panels collapse to give the map room.' : state.mode === 'ecologist' ? 'Open Nest details to begin fieldwork.' : 'Sweep across your nests to collect sources. Drop to send, or open Orders for a regional rally. Nest details opens the inspector.'}</p><div>{tutorial === 'intro' ? <button className="primary" onClick={() => { setTutorial('active'); setView(state.mode === 'species' ? 'australia' : 'california'); gameStore.pause(false); }}>Begin tutorial <Icon name="arrow" /></button> : (state.stats.orders > 0 || state.stats.interventions > 0) && <button className="primary" onClick={() => setTutorial(null)}>Finish tutorial <Icon name="arrow" /></button>}<button className="text-button" onClick={() => { setTutorial(null); gameStore.pause(false); }}>Skip tutorial</button></div></section>}
          {state.status === 'paused' && !tutorial && !research && <div className="paused-indicator"><Icon name="pause" size={14} />Paused · press Resume to play</div>}
        </div>
        {desktop && inspectorOpen && !research && <div className="inspector-space" />}
      </main>
      <footer className={`command-bar ${research ? 'research-dock' : ''} ${ordersOpen ? 'orders-expanded' : 'orders-compact'}`}>
        {research ? <><span>Research view · match paused</span><button onClick={() => hasStarted ? switchLayer('game') : exit()}>{hasStarted ? 'Back to map' : 'Back to home'} <Icon name="arrow" /></button></> : <>
          <div className="compact-orders">
            <button className="orders-toggle" aria-expanded={ordersOpen} aria-controls="expanded-orders" onClick={() => { setOrdersOpen(v => !v); setFractionOpen(false); setLayoutRevision(v => v + 1); }}>Orders <span aria-hidden="true">{ordersOpen ? '▾' : '▴'}</span></button>
            {state.mode !== 'ecologist' ? <><button className="source-toggle" aria-label={`Choose sources (${selectedSources.length})`} onClick={() => open('sources')}>Sources ({selectedSources.length})</button><span className="selection-count">{selectedSources.length} {selectedSources.length === 1 ? 'nest' : 'nests'} selected</span>
              <div className="compact-fraction"><button aria-expanded={fractionOpen} aria-controls="fraction-options" onClick={() => setFractionOpen(v => !v)}>{fraction * 100}%</button>{fractionOpen && <div id="fraction-options" className="fraction-options" role="group" aria-label="Workers per source">{[.25,.5,1].map(f => <button key={f} aria-pressed={fraction === f} onClick={() => { setFraction(f); setFractionOpen(false); }}>{f * 100}%</button>)}</div>}</div>
              <button className="primary send-button" aria-label={selectedSources.length > 1 ? 'Send swarms' : 'Send swarm'} onClick={() => order()} disabled={state.status !== 'running' || !selectedSources.length}><span className="send-wide">{selectedSources.length > 1 ? 'Send swarms' : 'Send swarm'}</span><span className="send-short">Send</span><Icon name="arrow" /></button>
            </> : <><div className="charge-status"><strong>{state.charges}/3 charges</strong><span>+1 in {Math.ceil(15 - state.chargeProgress)}s</span></div><button className="primary" onClick={() => { fieldworkTarget.current = true; open('details'); }}>Open fieldwork <Icon name="leaf" /></button></>}
          </div>
          {ordersOpen && <div id="expanded-orders" className="expanded-orders">
            {state.mode !== 'ecologist' ? <><RegionalCommands state={state} regionId={commandRegion} fraction={fraction} onSelectRegion={selectRegion} onRally={rally} onAutoRally={automatic} /><details className="keyboard-orders"><summary>Keyboard orders</summary><div className="order-fields"><label>Source nest<select aria-label="Source nest" value={sourceNode.id} onChange={e => choose(e.target.value)}>{owned.map(n => <option key={n.id} value={n.id}>{n.name} · {regions.find(r => r.id === n.regionId)?.shortName}</option>)}</select></label><label>Destination nest<select aria-label="Destination nest" value={targetNode.id} onChange={e => setDestination(e.target.value)}>{state.nodes.filter(n => n.id !== sourceNode.id).map(n => <option key={n.id} value={n.id}>{n.name} · {regions.find(r => r.id === n.regionId)?.shortName}</option>)}</select></label><span>{unitPreview} workers · {fraction * 100}% from each source</span></div></details></> : <p className="fieldwork-hint">Open Fieldwork to observe a site, choose a response, and record a follow-up. Nest details explains the habitat and its representative surroundings.</p>}
          </div>}
        </>}
      </footer>
      <div className={`notice ${notice ? 'show' : ''}`} role="status" aria-live="polite">{notice}</div>
    </div>
    <dialog id="nest-details" ref={detailsDialog} className={`details-dialog ${screen === 'details' ? 'details-full' : 'details-sidebar'}`} aria-label="Nest details" onCancel={e => { e.preventDefault(); play(); }}>
      {desktop && screen === 'play' && <div className="details-header"><strong>Nest details</strong><button onClick={() => { setInspectorOpen(false); setLayoutRevision(v => v + 1); }}>Hide details <span aria-hidden="true">◂</span></button></div>}
      {screen === 'details' && <header className="details-header"><button onClick={() => play()}>Back to map <Icon name="arrow" /></button>{state.mode === 'ecologist' && <button aria-label={state.status === 'running' ? 'Pause fieldwork' : 'Resume fieldwork'} onClick={() => gameStore.pause(state.status === 'running')}>{state.status === 'running' ? 'Pause fieldwork' : 'Resume fieldwork'}</button>}</header>}
      <div ref={detailsScroll} className="details-scroll"><Inspector key={matchRevision} visible={screen === 'details' || desktop && inspectorOpen && screen === 'play' && !research && !ended} detailed state={state} node={node} view={view} onIntervene={intervene} onDevelop={develop} onGuide={id => learn('guide', id)} onSpecies={id => learn('guide', undefined, id)} onRegion={id => learn('guide', undefined, undefined, id)} onCooperation={() => open('cooperation')} /></div>
    </dialog>
    {screen === 'home' && <Menu onStart={start} onLearn={() => learn('resources')} />}
    {screen === 'menu' && <MatchMenu modeName={scenarios[state.mode].name} onResume={() => play(true)} onRestart={() => start(state.mode, state.playerSpecies, false)} onExit={exit} onReview={() => open('review')} />}
    {screen === 'sources' && <SourcePicker state={state} selected={selectedSources} onConfirm={ids => { setSourceIds(ids); play(true); }} onCancel={() => play()} />}
    {screen === 'learn' && <Learning restorePrevious={navigation.restoreReading} returnLabel={navigation.returnTo === 'home' ? 'Back to home' : navigation.returnTo === 'details' ? 'Back to details' : 'Back to map'} tab={navigation.tab} focusFact={navigation.fact} focusSpecies={navigation.species} focusRegion={navigation.region} onClose={() => back()} onCooperation={() => open('cooperation')} />}
    {screen === 'cooperation' && <CooperationTour onClose={() => back()} onResearch={() => { setNavigation(n => ({ ...n, screen: 'play', layer: 'research', history: hasStarted ? [] : ['home'], returnTo: hasStarted ? 'play' : 'home' })); }} onReinforce={() => { if (!hasStarted) start('war', 'argentine', false); setView('california'); setSourceIds(['california-0']); setDestination('california-1'); play(true); notify('Drop your swarm on the ◐ cooperating nest to reinforce it.'); }} />}
    {(ended || screen === 'review') && screen !== 'home' && screen !== 'menu' && screen !== 'learn' && <Results onRestart={() => start(state.mode, state.playerSpecies, false)} onMenu={ended ? exit : () => open('menu')} onContinue={screen === 'review' ? () => play(true) : undefined} />}
    {!hasStarted && <span className="sr-only">Start a match from the home screen.</span>}
  </div>;
}
