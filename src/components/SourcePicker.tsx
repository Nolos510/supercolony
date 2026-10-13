import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../game/types';
import { regions } from '../game/scenarios';
import { Icon } from './Icons';

export default function SourcePicker({ state, selected, onConfirm, onCancel }: { state: GameState; selected: string[]; onConfirm: (ids: string[]) => void; onCancel: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(selected);
  const owned = state.nodes.filter(n => n.owner === 'player');
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="source-dialog" aria-label="Source selection" onCancel={onCancel}>
    <header className="dialog-header"><div><span className="eyebrow">Coordinate your colony</span><h2>Choose source nests</h2></div><button className="icon-button" aria-label="Cancel source selection" onClick={onCancel}><Icon name="close" /></button></header>
    <p>Your match is paused. Each selected nest sends the chosen fraction of its own workers.</p>
    <div className="source-options">{owned.map(n => <label className="source-option" key={n.id}><input type="checkbox" checked={draft.includes(n.id)} onChange={e => setDraft(ids => e.target.checked ? [...ids, n.id] : ids.filter(id => id !== n.id))} /><span><strong>{n.name} · {regions.find(r => r.id === n.regionId)?.shortName}</strong><small>{Math.floor(n.units)} game units</small></span></label>)}</div>
    <footer className="source-actions"><button onClick={() => setDraft([])}>Clear selection</button><button className="primary" onClick={() => onConfirm(draft.filter(id => owned.some(n => n.id === id)))}>Use selected nests <Icon name="arrow" /></button></footer>
  </dialog>;
}
