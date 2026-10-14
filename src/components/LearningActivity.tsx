import { useState } from 'react';
import type { LearningActivityDefinition } from '../game/types';
import { resources } from '../data/content';
import { specimens } from '../data/specimens';
import { globalSamples, recognitionLinks } from '../data/research';
import { gameStore } from '../game/store';

const parts = [
  { name: 'antennae', label: 'Antennae', x: 9, y: 12, detail: 'Jointed feelers at the front of the head sense the surroundings.' },
  { name: 'mandibles', label: 'Mandibles', x: 11, y: 56, detail: 'Paired jaws at the front of the head grasp and manipulate material.' },
  { name: 'head', label: 'Head', x: 16, y: 35, detail: 'The front body region carries the eyes, antennae and mandibles.' },
  { name: 'mesosoma', label: 'Mesosoma', x: 47, y: 24, detail: 'The middle body region is where all six legs attach.' },
  { name: 'waist', label: 'Waist', x: 65, y: 28, detail: 'The narrow connection joins the mesosoma to the gaster.' },
  { name: 'gaster', label: 'Gaster', x: 80, y: 32, detail: 'The rounded rear body region lies beyond the waist.' },
];
function AnatomyLab() {
  const [part, setPart] = useState(0);
  const [failed, setFailed] = useState(false);
  const asset = specimens.find(photo => photo.speciesId === 'argentine')!;
  return <section className="anatomy-lab" aria-label="Explore worker anatomy"><p>Tap a numbered part, or use the labeled buttons below.</p>
    <figure className="activity-specimen">
      {failed ? <p role="status">The specimen photo could not load. The labeled controls still explain each body part.</p> : <><img src={asset.path} alt="Argentine ant worker in profile, head at left and gaster at right" width="1156" height="808" onError={() => setFailed(true)} />
        {parts.map((entry, index) => <button className="activity-hotspot" style={{ left: `${entry.x}%`, top: `${entry.y}%` }} key={entry.name} aria-label={`Anatomy hotspot: ${entry.name}`} aria-pressed={part === index} onClick={() => setPart(index)}>{index + 1}</button>)}</>}
    </figure>
    <div className="activity-parts">{parts.map((entry, index) => <button key={entry.name} aria-pressed={part === index} onClick={() => setPart(index)}>{index + 1}. {entry.label}</button>)}</div>
    <p className="activity-observation" aria-live="polite"><strong>{parts[part].label}.</strong> {parts[part].detail}</p>
    <p className="reading-caption">Photo: {asset.photographer} · {asset.specimenCode} · {asset.license}. Numbered markers are teaching annotations, not diagnostic identification.</p>
    <a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Anatomy photograph source (opens in a new tab)">Photo source ↗</a> · <a href={asset.licenseUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label={`${asset.license} anatomy photograph license (opens in a new tab)`}>Photo license ↗</a>
  </section>;
}
function TerrainLab() {
  const [width, setWidth] = useState(4);
  return <section className="terrain-lab" aria-label="Adjust a trail bottleneck">
    <label>Passage width<input type="range" name="passage-width" min="1" max="8" step="1" value={width} onChange={event => setWidth(Number(event.target.value))} /><span>{width} illustrative workers abreast</span></label>
    <svg viewBox="0 0 440 200" role="img" aria-label={`${width} of twelve illustrative workers fit through the passage together.`}>
      <path className="terrain-wall" d={`M182 18h76v${78 - width * 7}h-76zM182 ${104 + width * 7}h76v${78 - width * 7}h-76z`} />
      {Array.from({ length: 12 }, (_, i) => <g key={i} className="terrain-waiting"><circle cx={35 + (i % 3) * 39} cy={39 + Math.floor(i / 3) * 39} r="9" /><path d={`m${29 + (i % 3) * 39} ${35 + Math.floor(i / 3) * 39}-4-5m16 5 4-5`} /></g>)}
      {Array.from({ length: width }, (_, i) => <g className="terrain-admitted" key={i}><circle cx="220" cy={100 - (width - 1) * 6 + i * 12} r="4" /></g>)}
      <path className="summary-line" d="M285 100h40m-8-7 8 7-8 7" /><path className="terrain-opponent" d="m357 74 15 27h-30zm33 23 15 27h-30z" />
    </svg>
    <p className="activity-observation" aria-live="polite"><strong>{width} of 12 workers</strong> can enter together in this illustration. Narrowing the passage reduces simultaneous participation.</p>
    <p className="reading-caption">Illustrative counts, not experimental measurements or game coefficients. Meat ants won every tested arena in the cited study; complex arenas reduced their fatalities.</p>
  </section>;
}
function RecognitionLab() {
  const [first, setFirst] = useState('US1');
  const [second, setSecond] = useState('J');
  const link = recognitionLinks.find(entry => (entry.from === first && entry.to === second) || (entry.from === second && entry.to === first));
  const label = first === second ? 'Same sample' : !link ? 'Unknown comparison' : link.classification === 'none' ? 'No aggression observed' : link.classification === 'low' ? 'Occasional aggression reported' : 'High aggression reported';
  const firstSample = globalSamples.find(sample => sample.id === first)!;
  const secondSample = globalSamples.find(sample => sample.id === second)!;
  return <section className="recognition-lab" aria-label="Historical recognition evidence explorer">
    <div className="recognition-selectors"><label>First sample<select name="first-sample" value={first} onChange={event => setFirst(event.target.value)}>{globalSamples.map(sample => <option key={sample.id} value={sample.id}>{sample.label}</option>)}</select></label><label>Second sample<select name="second-sample" value={second} onChange={event => setSecond(event.target.value)}>{globalSamples.map(sample => <option key={sample.id} value={sample.id}>{sample.label}</option>)}</select></label></div>
    <div className={`recognition-result recognition-${link?.classification ?? 'unknown'}`} aria-live="polite"><div><span className="recognition-sample" aria-hidden="true">○</span><strong>{firstSample.label}</strong><span>{firstSample.locality}</span></div><div><span className="recognition-evidence-symbol" aria-hidden="true">{first === second ? '=' : !link ? '?' : link.classification === 'high' ? '×' : '↔'}</span><strong>{label}</strong>{first === second ? <span>Choose two different populations.</span> : link ? <span>{link.aggressive} aggressive trials / {link.total} paired-worker trials</span> : <span>No reported pairing in this layer.</span>}</div><div><span className="recognition-sample" aria-hidden="true">○</span><strong>{secondSample.label}</strong><span>{secondSample.locality}</span></div></div>
    <p className="reading-caption">2010 publication · workers sampled in 2008–2009 · 17 reported pairings. Historical assay results do not establish current alliances, continuous territory or battlefronts. Unreported comparisons stay unknown.</p>
  </section>;
}

export default function LearningActivity({ activity, onBack }: { activity: LearningActivityDefinition; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const question = activity.steps[step];
  function replay() { setStep(0); setAnswer(null); setComplete(false); setReplayCount(value => value + 1); }
  function next() { if (step + 1 === activity.steps.length) setComplete(true); else { setStep(value => value + 1); setAnswer(null); } }
  return <section className="learning-activity" aria-label={activity.title}>
    <p className="activity-intro">Explore first, then try three short questions. No timer, score or match bonus.</p>
    {activity.id === 'anatomy' ? <AnatomyLab key={replayCount} /> : activity.id === 'terrain' ? <TerrainLab key={replayCount} /> : <RecognitionLab key={replayCount} />}
    {complete ? <section className="activity-complete" role="status"><h3>Three ideas explored</h3><p>You can replay, follow the evidence, or return to the guide.</p><button onClick={replay}>Replay activity</button></section> : <section className="activity-question" aria-labelledby="activity-question-heading"><span className="eyebrow">Question {step + 1} of {activity.steps.length}</span><h3 id="activity-question-heading">{question.prompt}</h3><div className="activity-choices">{question.choices.map((choice, index) => <button key={choice} aria-pressed={answer === index} disabled={answer !== null && answer !== index} onClick={() => setAnswer(index)}>{choice}</button>)}</div>{answer !== null && <div className="activity-feedback" role="status"><strong>{answer === question.correctIndex ? 'That fits the evidence.' : `The supported answer: ${question.choices[question.correctIndex]}.`}</strong><p>{question.explanation}</p><button onClick={next}>{step + 1 === activity.steps.length ? 'Finish activity' : 'Next question'}</button></div>}</section>}
    <section className="activity-sources" aria-label="Activity research"><h3>Follow the evidence</h3>{activity.resourceIds.map(id => { const resource = resources.find(entry => entry.id === id); return resource ? <a key={id} href={resource.url} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label={`Read the research: ${resource.title} (opens in a new tab)`}>Read the research: {resource.title} ↗</a> : null; })}</section>
    <div className="activity-actions"><button onClick={onBack}>Skip activity</button>{!complete && <button onClick={replay}>Replay activity</button>}</div>
  </section>;
}
