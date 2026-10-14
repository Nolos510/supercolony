import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';

interface MatchMenuProps {
  modeName: string; onResume: () => void; onRestart: () => void; onExit: () => void; onReview: () => void;
}

export default function MatchMenu({ modeName, onResume, onRestart, onExit, onReview }: MatchMenuProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const resume = useRef<HTMLButtonElement>(null);
  const [confirmation, setConfirmation] = useState<'restart' | 'exit' | null>(null);
  useEffect(() => { dialog.current?.showModal(); resume.current?.focus(); }, []);
  useEffect(() => { if (confirmation) cancel.current?.focus(); else resume.current?.focus(); }, [confirmation]);
  return <dialog ref={dialog} className="match-menu" aria-label="Game menu" onCancel={event => { event.preventDefault(); if (confirmation) setConfirmation(null); else onResume(); }}>
    <header className="dialog-header"><div><span className="eyebrow">{modeName}</span><h2>{confirmation === 'restart' ? 'Restart this match?' : confirmation === 'exit' ? 'Exit to home?' : 'Game menu'}</h2></div>{!confirmation && <button className="icon-button" aria-label="Close game menu" onClick={onResume}><Icon name="close" /></button>}</header>
    {confirmation ? <div className="match-confirmation"><p>{confirmation === 'restart' ? 'Your current round will be discarded. Start a fresh round with the same mode and species.' : 'Your current match will be discarded. You can choose a new mode from home.'}</p><div className="confirmation-actions"><button ref={cancel} onClick={() => setConfirmation(null)}>Cancel</button><button className="primary" onClick={confirmation === 'restart' ? onRestart : onExit}>{confirmation === 'restart' ? 'Restart now' : 'Exit match'}</button></div></div> : <div className="match-menu-actions"><button ref={resume} className="primary" onClick={onResume}>Resume match <Icon name="play" /></button><button onClick={onReview}>Review current match <Icon name="book" /></button><button onClick={() => setConfirmation('restart')}>Restart match <Icon name="reset" /></button><button onClick={() => setConfirmation('exit')}>Exit to home <Icon name="arrow" /></button></div>}
  </dialog>;
}
