import { useEffect, useRef, useState } from 'react';
import { facts, resources } from '../data/content';
import { regions } from '../game/scenarios';
import type { FactEntry, ResourceEntry } from '../game/types';
import { Icon } from './Icons';
import { gameStore } from '../game/store';

export function ResourceLink({ resource, children }: { resource: ResourceEntry; children?: React.ReactNode }) {
  return <a href={resource.url} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} className="research-link" aria-label={`${children ?? resource.title} (opens in a new tab)`}>{children ?? resource.title} <span aria-hidden="true">↗</span></a>;
}

function Fact({ fact }: { fact: FactEntry }) {
  const source = resources.find(r => r.id === fact.resourceIds[0]);
  return <article className="fact-entry"><span className="fact-topic">{fact.topic.replaceAll('-', ' ')}</span><h3>{fact.title}</h3><p>{fact.summary}</p><p className="fact-detail">{fact.detail}</p>{source && <ResourceLink resource={source}>Read the research</ResourceLink>}</article>;
}

export default function Learning({ tab, focusFact, onClose }: { tab: 'guide' | 'resources'; focusFact?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(tab);
  const [topic, setTopic] = useState('all');
  const [region, setRegion] = useState('all');
  useEffect(() => { dialog.current?.showModal(); }, []);
  const title = active === 'guide' ? 'Field guide' : 'Learn & get involved';
  const ordered = [...facts].sort((a, b) => a.id === focusFact ? -1 : b.id === focusFact ? 1 : 0);
  const filtered = resources.filter(r => (topic === 'all' || r.topics.includes(topic)) && (region === 'all' || r.regionIds.includes(region) || r.regionIds.includes('global')));
  return <dialog ref={dialog} className="learning-dialog" aria-label={title} onCancel={onClose}>
    <header className="dialog-header"><div><span className="eyebrow">The world beyond the game</span><h2>{title}</h2></div><button className="icon-button" aria-label="Close field guide" onClick={onClose}><Icon name="close" /></button></header>
    <div className="learning-tabs"><button aria-pressed={active === 'guide'} onClick={() => setActive('guide')}><Icon name="book" />Field guide</button><button aria-pressed={active === 'resources'} onClick={() => setActive('resources')}><Icon name="leaf" />Learn & get involved</button></div>
    <div className="dialog-scroll">
      {active === 'guide' ? <><p className="learning-intro">An extraordinary species. A complicated story. Follow each idea back to the people who study it.</p><div className="facts-grid">{ordered.map(f => <Fact key={f.id} fact={f} />)}</div></> : <>
        <p className="learning-intro">Keep following your curiosity. Read a study, observe the wildlife around you, or find a conservation project to support.</p>
        <div className="resource-filters"><label>Topic<select value={topic} onChange={e => setTopic(e.target.value)}><option value="all">All topics</option>{Array.from(new Set(resources.flatMap(r => r.topics))).sort().map(t => <option key={t} value={t}>{t.replaceAll('-', ' ')}</option>)}</select></label><label>Region<select value={region} onChange={e => setRegion(e.target.value)}><option value="all">Worldwide & all regions</option>{regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label></div>
        {(['research', 'participate', 'support'] as const).map(group => {
          const entries = filtered.filter(r => r.group === group);
          return entries.length ? <section className="resource-group" key={group}><h3>{group === 'research' ? 'Research & documentation' : group === 'participate' ? 'Observe & participate' : 'Conservation & support'}</h3>{entries.map(r => <article key={r.id} className="resource-entry"><div className="resource-meta">{r.organization} <span>{r.type.replaceAll('-', ' ')}{r.year ? ` · ${r.year}` : ''}</span></div><h4><ResourceLink resource={r} /></h4><p>{r.summary}</p><footer><span>{r.regionLabel}</span><span>Reviewed {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(r.reviewedAt))}</span></footer></article>)}</section> : null;
        })}
        {!filtered.length && <div className="empty-state"><Icon name="leaf" size={32} /><h3>No resources for this combination yet</h3><p>Choose another topic or browse all regions.</p><button onClick={() => { setTopic('all'); setRegion('all'); }}>Show all resources</button></div>}
        <p className="science-caption">Independent resources, selected for relevance. Organization listings do not imply a partnership. Community observations help identification; they are not official invasive-species reports.</p>
      </>}
    </div>
    <footer className="dialog-footer"><span>All scientific and conservation links open in a new tab.</span><button className="primary" onClick={onClose}>Back to the game <Icon name="arrow" /></button></footer>
  </dialog>;
}
