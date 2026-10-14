import { useEffect, useRef, useState } from 'react';
import { introScenes, storyArt, vignettes } from '../data/atlasStory';
import { resources } from '../data/content';
import { gameStore } from '../game/store';

export default function Story({ onBack, backLabel = 'Back', intro = true }: { onBack: () => void; backLabel?: string; intro?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [imageFailed, setImageFailed] = useState(false);
  const scenes = intro ? introScenes : vignettes;
  const scene = scenes[panel];
  useEffect(() => { dialog.current?.showModal(); heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { setReducedMotion(media.matches); if (media.matches) setPlaying(false); };
    media.addEventListener('change', change); return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setTimeout(() => { if (panel < scenes.length - 1) setPanel(panel + 1); else setPlaying(false); }, 7000);
    return () => window.clearTimeout(timer);
  }, [panel, playing, reducedMotion, scenes.length]);
  function choose(next: number) { setPlaying(false); setPanel(next); if (scroller.current) scroller.current.scrollTop = 0; }
  return <dialog ref={dialog} className="reading-dialog story-dialog" aria-label="General Mandible" onCancel={event => { event.preventDefault(); onBack(); }}>
    <header className="reading-header"><button className="reading-back" onClick={onBack}>← {backLabel}</button><h2 ref={heading} tabIndex={-1}>General Mandible</h2><button className="reading-resume" onClick={onBack}>Skip story</button></header>
    <div ref={scroller} className="reading-scroll"><article className="story-content">
      {!intro && <nav className="vignette-selector" aria-label="General Mandible stories">{vignettes.map((entry, index) => <button key={entry.id} aria-pressed={panel === index} onClick={() => choose(index)}>{entry.title}</button>)}</nav>}
      <div className="comic-scene" key={scene.id} data-playing={playing && !reducedMotion}><div className="comic-scene-heading"><span className="eyebrow">{intro ? `Panel ${panel + 1} of 4` : 'A field-atlas diversion'}</span><h3>{scene.title}</h3></div>
        {imageFailed ? <div className="comic-art-unavailable" role="status">The illustration could not load. The complete story and field note are below.</div> : <div className={`comic-art comic-panel-${scene.panel}`} role="img" aria-label={`Fictional comic illustration: ${scene.title}`}><img src={storyArt.path} alt="" width={storyArt.width} height={storyArt.height} onError={() => setImageFailed(true)} /></div>}
        <p className="comic-narration">{scene.narration}</p><blockquote className="comic-dialogue">{scene.dialogue}</blockquote>
        <aside className="comic-field-note"><span className="eyebrow">The field notebook</span><p>{scene.fieldNote}</p>{scene.resourceIds.map(id => { const resource = resources.find(entry => entry.id === id); return resource ? <a key={id} href={resource.url} target="_blank" rel="noopener noreferrer" onClick={() => { setPlaying(false); gameStore.pause(true); }} aria-label={`Read the research: ${resource.title} (opens in a new tab)`}>Read the research: {resource.title} ↗</a> : null; })}</aside>
      </div>
      <div className="comic-controls"><button disabled={panel === 0} onClick={() => choose(panel - 1)}>Previous panel</button><button disabled={reducedMotion} onClick={() => setPlaying(value => !value)}>{playing ? 'Pause story' : 'Play story'}</button><button disabled={panel === scenes.length - 1} onClick={() => choose(panel + 1)}>Next panel</button><button onClick={() => choose(0)}>Replay story</button></div>
      <p className="reading-caption">{reducedMotion ? 'Reduced motion: read at your own pace with the panel controls.' : playing ? 'Playing at seven seconds per panel. Pause whenever you like.' : 'Read at your own pace, or play a short panel sequence.'}</p>
      <p className="comic-credit">{storyArt.credit}. {storyArt.note}</p>
    </article></div>
  </dialog>;
}
