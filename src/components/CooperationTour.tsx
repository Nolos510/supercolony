import { useEffect, useRef, useState } from 'react';
import { resources } from '../data/content';
import { ResourceLink } from './Learning';
import { Icon } from './Icons';
import globalData from '../../public/research/global-2010.json';

const samplePoint = (lon: number, lat: number) => [20 + (lon + 180) / 360 * 340, 10 + (80 - lat) / 150 * 100];

const steps = [
  { title: 'Recognition connects nests', body: 'Ants use chemical cues in colony recognition. Our US1 player cooperates with the F, AU, NZ, J and H1 reference networks. This friendship is a game simplification, including pairs that were not directly tested.' },
  { title: 'See what was tested', body: 'The 2010 study compared samples collected in 2008–2009. Its lines show reported pairs, not today’s borders. US1–AU had 4 aggressive trials out of 50. The three independent rivals are not automatically friendly to one another.' },
  { title: 'Help a cooperating nest', body: 'Cooperating colonies command their own workers. Drop a swarm on their nest to reinforce it. Those workers join its reserves. Passing through keeps your swarm moving.' },
];

export default function CooperationTour({ onClose, onResearch, onReinforce }: { onClose: () => void; onResearch?: () => void; onReinforce?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const source = resources.find(entry => entry.id === 'global-study')!;
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => { heading.current?.focus(); }, [step]);
  return <dialog ref={dialog} className="cooperation-dialog" aria-label="Cooperation walkthrough" onCancel={onClose}>
    <header className="dialog-header"><div><span className="eyebrow">{step + 1} of 3 · Cooperation</span><h2 ref={heading} tabIndex={-1}>{steps[step].title}</h2></div><button className="icon-button" aria-label="Skip cooperation walkthrough" onClick={onClose}><Icon name="close" /></button></header>
    <div className="cooperation-body">
      <div className={`cooperation-visual step-${step}`} aria-hidden="true">{step === 0 ? <><span className="tour-nest player">●</span><span className="tour-trail">────</span><span className="tour-nest ally">◐</span><span className="tour-rival">◆</span></> : step === 1 ? <><svg className="tour-sample-map" viewBox="0 0 380 140"><rect x="0" y="0" width="380" height="140" className="research-water" />{[60,120,180,240,300].map(x => <line key={x} x1={x} x2={x} y1="8" y2="115" className="research-grid" />)}{globalData.links.filter(link => link.from === 'US1' || link.to === 'US1').map(link => { const a = globalData.samples.find(s => s.id === link.from)!, b = globalData.samples.find(s => s.id === link.to)!; const [x1,y1] = samplePoint(a.lon,a.lat), [x2,y2] = samplePoint(b.lon,b.lat); return <line key={`${link.from}-${link.to}`} x1={x1} y1={y1} x2={x2} y2={y2} className={`research-link-line ${link.classification}`} />; })}{globalData.samples.map(sample => { const [x,y] = samplePoint(sample.lon,sample.lat); return <g key={sample.id}><circle cx={x} cy={y} r="3" className="research-sample" /><text x={x+4} y={y+(sample.id === 'US2' || sample.id === 'H2' ? 14 : -6)}>{sample.id}</text></g>; })}<text x="12" y="132">9 samples · lines: reported US1 comparisons</text></svg><span className="tour-data-label">Historical samples · 2008–2009</span></> : <><span className="tour-nest player">●</span><span className="tour-transfer">••• →</span><span className="tour-nest ally">◐<small>+ workers</small></span></>}</div>
      <p>{steps[step].body}</p><ResourceLink resource={source}>Read the research</ResourceLink>
      {step === 1 && onResearch && <button className="text-button" onClick={onResearch}>Open research map <Icon name="world" size={16} /></button>}
      <p className="reading-caption">Game cooperation is a simplification, not evidence of negotiated alliances in nature.</p>
    </div>
    <footer className="cooperation-actions"><button onClick={onClose}>Skip walkthrough</button>{step > 0 && <button onClick={() => setStep(value => value - 1)}>Back</button>}<button className="primary" onClick={() => step < 2 ? setStep(value => value + 1) : (onReinforce ?? onClose)()}>{step < 2 ? 'Next' : onReinforce ? 'Try a reinforcement' : 'Return to game'} <Icon name="arrow" size={16} /></button></footer>
  </dialog>;
}
