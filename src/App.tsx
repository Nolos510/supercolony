import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gameStore, startClock } from './game/store';
import { regions, scenarios } from './game/scenarios';
import { habitat, territory } from './game/engine';
import { facts, resources } from './data/content';
import type { ModeId, SpeciesId, Intervention } from './game/types';
import Map from './components/Map';
import Menu from './components/Menu';
import Inspector from './components/Inspector';
import Learning, { ResourceLink } from './components/Learning';
import { Icon } from './components/Icons';

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
      <div><dt>{state.mode === 'ecologist' ? 'Interventions used' : 'Swarms sent'}</dt><dd>{state.mode === 'ecologist' ? state.stats.interventions : state.stats.orders}</dd><dd className="stat-definition">{state.mode === 'ecologist' ? 'Accepted habitat, food, or transport actions.' : 'Successful dispatch commands, including reinforcements.'}</dd></div>
      <div><dt>Topics encountered</dt><dd>{state.discovered.length}</dd><dd className="stat-definition">Unique science topics linked to match events. This does not measure learning.</dd></div>
    </dl>
    <h3>Three things to take with you</h3><div className="result-discoveries">{discoveries.map(f => <article key={f.id}><h4>{f.title}</h4><p>{f.summary}</p><ResourceLink resource={resources.find(r => r.id === f.resourceIds[0])!}>Explore further</ResourceLink></article>)}</div>
    <section className="result-involvement"><h3>Keep following the ants</h3><div className="next-steps">
      <article><h4>Explore Argentine ants</h4><p>AntWeb offers specimen images, taxonomy, and recorded localities for research.</p><ResourceLink resource={antweb}>Compare Argentine-ant specimens</ResourceLink></article>
      <article><h4>Share an ant photo</h4><p>iNaturalist lets you share a photo, date, and location for community identification.</p><ResourceLink resource={observation}>Learn to record an observation</ResourceLink></article>
      <article><h4>Help prevent spread</h4><p>New Zealand’s official guidance explains checking plants and equipment before moving them.</p><ResourceLink resource={prevention}>Prevent accidental spread (NZ)</ResourceLink></article>
    </div></section>
    <div className="result-actions">{onContinue ? <button className="primary" onClick={onContinue}>Continue match <Icon name="play" /></button> : <button className="primary" onClick={onRestart}>Play again <Icon name="reset" /></button>}<button onClick={onMenu}>Choose another mode</button></div>
  </dialog>;
}

export default function App() {
  const state = useSyncExternalStore(gameStore.subscribe, gameStore.getSnapshot);
  const [menuOpen, setMenuOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [view, setView] = useState<string | null>(null);
  const [selected, setSelected] = useState('california-0');
  const [destination, setDestination] = useState('california-1');
  const [fraction, setFraction] = useState(.5);
  const [learning, setLearning] = useState<{ tab: 'guide' | 'resources'; fact?: string } | null>(null);
  const [tutorial, setTutorial] = useState<'intro' | 'active' | null>(null);
  const [notice, setNotice] = useState('');
  const pausedBeforeLearning = useRef(true);
  const pausedBeforeMenu = useRef(true);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { gameStore.pause(true); return startClock(); }, []);
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);
  const node = state.nodes.find(n => n.id === selected) ?? state.nodes[0];
  const owned = state.nodes.filter(n => n.owner === 'player');
  const sourceNode = owned.find(n => n.id === selected) ?? owned[0] ?? node;
  const targetNode = state.nodes.find(n => n.id === destination && n.id !== sourceNode.id) ?? state.nodes.find(n => n.id !== sourceNode.id)!;
  const counts = territory(state);
  const share = state.mode === 'ecologist' ? habitat(state) : counts.player / state.nodes.length;
  const timeLeft = state.duration === null ? null : Math.max(0, state.duration - Math.floor(state.time));
  const ended = ['won', 'lost', 'draw'].includes(state.status);

  function notify(message: string) { setNotice(message); if (noticeTimer.current) clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(''), 4500); }
  function start(mode: ModeId, species: SpeciesId = 'argentine', withTutorial = true) {
    gameStore.start(mode, species); setSelected(mode === 'species' ? 'australia-0' : 'california-0');
    setDestination(mode === 'species' ? 'australia-1' : 'california-1'); setView(mode === 'species' ? 'australia' : null);
    setMenuOpen(false); setReviewOpen(false); setHasStarted(true); setNotice(''); setTutorial(withTutorial ? 'intro' : null);
    if (withTutorial) gameStore.pause(true);
  }
  function learn(tab: 'guide' | 'resources', fact?: string) {
    pausedBeforeLearning.current = gameStore.getState().status !== 'running'; gameStore.pause(true); setLearning({ tab, fact });
  }
  function closeLearning() { setLearning(null); if (!pausedBeforeLearning.current && !menuOpen) gameStore.pause(false); }
  function order(from = sourceNode.id, to = targetNode.id) {
    const error = gameStore.send(from, to, fraction); notify(error ?? 'Swarm dispatched. Follow the trail.');
  }
  function choose(id: string, issueOrder = false) {
    const target = state.nodes.find(n => n.id === id)!;
    if (state.mode === 'ecologist') { setSelected(id); return; }
    if (issueOrder && target.owner !== 'player' && node.owner === 'player' && state.status === 'running') { setDestination(id); order(node.id, id); }
    else { setSelected(id); if (target.owner === 'player') { const neighbor = state.edges.find(e => e.from === id || e.to === id); if (neighbor) setDestination(neighbor.from === id ? neighbor.to : neighbor.from); } }
  }
  function intervene(kind: Intervention) { const error = gameStore.intervene(node.id, kind); notify(error ?? `${kind === 'habitat' ? 'Habitat restored' : kind === 'food' ? 'Food subsidy reduced' : 'Transport restricted'}. Watch this site recover.`); }
  function menu() { pausedBeforeMenu.current = gameStore.getState().status !== 'running'; gameStore.pause(true); setMenuOpen(true); setReviewOpen(false); setTutorial(null); }
  function review() { setMenuOpen(false); setReviewOpen(true); }
  function continueReview() { setReviewOpen(false); gameStore.pause(false); }
  function resumeMenu() { setMenuOpen(false); if (!pausedBeforeMenu.current) gameStore.pause(false); }

  return <div className="app-shell">
    <a className="skip-link" href="#battlefield">Skip to the battlefield</a>
    <div className="game-surface" inert={menuOpen || !!learning || ended || reviewOpen} aria-hidden={menuOpen || !!learning || ended || reviewOpen}>
    <header className="topbar">
      <button className="brand brand-button" onClick={menu} aria-label="SUPERColony game menu"><Icon name="leaf" size={25} /><span translate="no">SUPER<span className="brand-light">Colony</span></span></button>
      <nav aria-label="Main navigation"><button className={!view ? 'nav-active' : ''} onClick={() => setView(null)}><Icon name="world" />World</button><button onClick={() => learn('guide')}><Icon name="book" />Field guide</button><button onClick={() => learn('resources')}><Icon name="leaf" />Learn & get involved</button></nav>
      <div className="topbar-controls"><span className={`match-clock ${timeLeft === null ? 'untimed-clock' : ''}`} aria-label={timeLeft === null ? 'No time limit' : `${Math.floor(timeLeft / 60)} minutes ${timeLeft % 60} seconds remaining`}>{timeLeft === null ? 'No time limit' : `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</span><button className="pause-button" aria-label={state.status === 'paused' ? 'Resume match' : 'Pause match'} onClick={() => gameStore.pause(state.status !== 'paused')} disabled={ended}><Icon name={state.status === 'paused' ? 'play' : 'pause'} /><span>{state.status === 'paused' ? 'Resume' : 'Pause'}</span></button></div>
    </header>
    <section className="match-bar" aria-label="Match progress"><span className="mode-badge">{scenarios[state.mode].name}</span><div className="territory-progress"><div className="progress-label"><span>{state.mode === 'ecologist' ? 'Native habitat retained' : 'Your territory'}</span><strong>{Math.round(share * 100)}%</strong></div><div className="progress-track"><span style={{ width: `${Math.min(100, share * 100)}%` }} /></div><span className="progress-target">{state.mode === 'ecologist' ? 'Target 60% habitat' : 'Play until one colony has no nests or swarms'}</span></div><label className="region-switch"><span>Explore</span><select value={view ?? 'world'} onChange={e => setView(e.target.value === 'world' ? null : e.target.value)} aria-label="Map view"><option value="world">World map</option>{regions.map(r => <option value={r.id} key={r.id}>{r.shortName}</option>)}</select></label></section>
    <main className="game-layout" id="battlefield">
      <h1 className="sr-only">SUPERColony strategy game</h1>
      <div className="battlefield-wrap"><Map state={state} view={view} selected={node.id} onSelect={choose} onZoom={setView} onOrder={order} />
        {tutorial && <section className="tutorial" aria-label="Interactive tutorial"><span className="eyebrow">A small first step</span><h2>{tutorial === 'intro' ? 'Your first trail' : state.stats.orders > 0 || state.stats.interventions > 0 ? 'Watch your decision unfold' : state.mode === 'ecologist' ? 'Protect a patch of habitat' : 'Choose a destination'}</h2><p>{tutorial === 'intro' ? state.mode === 'ecologist' ? 'Select a habitat, then try one intervention. Watch the effects and replenish your charges.' : 'Select a cyan nest, choose a destination, and send part of your swarm. Connected nests are your strength.' : state.stats.orders > 0 || state.stats.interventions > 0 ? 'The match keeps running across every region. Pause whenever you want to explore the science.' : state.mode === 'ecologist' ? 'Try Restore habitat in the selected habitat panel.' : 'Use the source and destination controls below, then Send swarm. You can also tap a rival or unclaimed nest.'}</p><div>{tutorial === 'intro' ? <button className="primary" onClick={() => { setTutorial('active'); setView(state.mode === 'species' ? 'australia' : 'california'); gameStore.pause(false); }}>Begin tutorial <Icon name="arrow" /></button> : (state.stats.orders > 0 || state.stats.interventions > 0) && <button className="primary" onClick={() => setTutorial(null)}>Finish tutorial <Icon name="arrow" /></button>}<button className="text-button" onClick={() => { setTutorial(null); gameStore.pause(false); }}>Skip tutorial</button></div></section>}
        {state.status === 'paused' && !tutorial && !learning && !menuOpen && <div className="paused-indicator"><Icon name="pause" size={14} />Match paused · Take your time</div>}
      </div>
      <Inspector state={state} node={node} view={view} onIntervene={intervene} onGuide={id => learn('guide', id)} />
    </main>
    <footer className="command-bar">
      {state.mode !== 'ecologist' ? <><div className="order-heading"><Icon name="arrow" size={23} /><div><strong>Send your swarm</strong><span>{Math.floor(sourceNode.units * fraction)} units from {sourceNode.name}</span></div></div><div className="order-fields"><label>Source nest<select aria-label="Source nest" value={owned.some(n => n.id === selected) ? selected : owned[0]?.id ?? ''} onChange={e => choose(e.target.value)}>{owned.map(n => <option key={n.id} value={n.id}>{n.name} · {regions.find(r => r.id === n.regionId)?.shortName}</option>)}</select></label><label>Destination nest<select aria-label="Destination nest" value={targetNode.id} onChange={e => setDestination(e.target.value)}>{state.nodes.filter(n => n.id !== sourceNode.id).map(n => <option key={n.id} value={n.id}>{n.name} · {regions.find(r => r.id === n.regionId)?.shortName}</option>)}</select></label></div><div className="fraction-picker" aria-label="Swarm strength">{[.25, .5, 1].map(f => <button key={f} aria-pressed={fraction === f} onClick={() => setFraction(f)}>{f * 100}%</button>)}</div><button className="primary send-button" onClick={() => order(owned.some(n => n.id === selected) ? selected : owned[0]?.id)} disabled={state.status !== 'running' || !owned.length}>Send swarm <Icon name="arrow" /></button></> : <><div className="order-heading"><Icon name="leaf" size={25} /><div><strong>Protect the living network</strong><span>Choose a site. Apply an intervention. Watch what changes.</span></div></div><div className="charge-status">{Array.from({ length: 3 }, (_, i) => <span key={i} className={i < state.charges ? 'full' : ''} aria-hidden="true" />)}<strong>{state.charges}/3 charges</strong><span>Next in {Math.ceil(15 - state.chargeProgress)}s</span></div><button onClick={() => learn('resources')}>Find ways to get involved <Icon name="arrow" /></button></>}
    </footer>
    <div className={`notice ${notice ? 'show' : ''}`} role="status" aria-live="polite">{notice}</div>
    </div>
    {menuOpen && !learning && <Menu onStart={start} onLearn={() => learn('resources')} onResume={hasStarted && !ended ? resumeMenu : undefined} onReview={hasStarted && !ended ? review : undefined} />}
    {learning && <Learning tab={learning.tab} focusFact={learning.fact} onClose={closeLearning} />}
    {(ended || reviewOpen) && !menuOpen && <Results onRestart={() => start(state.mode, state.playerSpecies, false)} onMenu={menu} onContinue={reviewOpen ? continueReview : undefined} />}
  </div>;
}
