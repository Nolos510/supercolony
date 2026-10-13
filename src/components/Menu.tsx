import { useEffect, useRef, useState } from 'react';
import type { ModeId, SpeciesId } from '../game/types';
import { scenarios } from '../game/scenarios';
import Ant from './Ant';
import { Icon } from './Icons';

export default function Menu({ onStart, onLearn, onResume, onReview }: { onStart: (mode: ModeId, species: SpeciesId) => void; onLearn: () => void; onResume?: () => void; onReview?: () => void }) {
  const [mode, setMode] = useState<ModeId>('war');
  const [species, setSpecies] = useState<SpeciesId>('argentine');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="menu-dialog" aria-labelledby="menu-title" onCancel={e => { e.preventDefault(); onResume?.(); }}>
    <div className="menu-art" aria-hidden="true">
      <span className="specimen-caption">LINEPITHEMA HUMILE</span><Ant large />
      <div className="trail-doodle"><span /><span /><span /><span /></div>
      <div className="menu-art-caption">One ant is tiny.<br />Their story spans the planet.</div>
    </div>
    <div className="menu-content">
      <div className="brand menu-brand"><Icon name="leaf" size={25} /><span translate="no">SUPER<span className="brand-light">Colony</span></span></div>
      <h1 id="menu-title">Small ants.<br />A bigger world.</h1>
      <p className="menu-intro">Follow the trails of one of nature’s most remarkable invaders. A little strategy. A lot to discover.</p>
      <div className="mode-picker" aria-label="Choose a game mode">
        {(['war', 'species', 'ecologist'] as const).map(id => <button key={id} className={`mode-option ${mode === id ? 'selected' : ''}`} aria-pressed={mode === id} onClick={() => setMode(id)}>
          <span className="mode-icon" aria-hidden="true">{id === 'war' ? '◉' : id === 'species' ? '⚔' : <Icon name="leaf" />}</span>
          <span>{scenarios[id].name}</span><span className="mode-radio" aria-hidden="true" />
        </button>)}
      </div>
      <p className="mode-description">{scenarios[mode].description}</p>
      {mode === 'species' && <div className="species-picker" aria-label="Choose your species">
        <button aria-pressed={species === 'argentine'} onClick={() => setSpecies('argentine')}>Argentine ant</button>
        <button aria-pressed={species === 'meat'} onClick={() => setSpecies('meat')}>Australian meat ant</button>
      </div>}
      <button className="primary start-button" onClick={() => onStart(mode, species)}>Start match <Icon name="arrow" /></button>
      {onReview && <button className="resume-current" onClick={onReview}>Review current match <Icon name="book" size={16} /></button>}
      {onResume && <button className="resume-current" onClick={onResume}>Resume current match <Icon name="play" size={16} /></button>}
      <div className="menu-foot"><span>{mode === 'ecologist' ? '5-minute habitat survey' : 'No time limit'} · Single player</span><button className="text-button" onClick={onLearn}>Learn & get involved <span aria-hidden="true">↗</span></button></div>
      <p className="science-caption">Real places and biology. Simulated nests, frontlines, and populations.</p>
    </div>
  </dialog>;
}
