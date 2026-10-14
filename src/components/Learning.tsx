import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { facts, resources, species } from '../data/content';
import { regionalContexts } from '../data/regional';
import { regions } from '../game/scenarios';
import type { ResourceEntry, SpeciesId } from '../game/types';
import { Icon } from './Icons';
import { gameStore } from '../game/store';
import Specimen, { SpeciesComparison } from './Specimen';
import HabitatGallery from './HabitatGallery';

export function ResourceLink({ resource, children }: { resource: ResourceEntry; children?: ReactNode }) {
  const label = typeof children === 'string' ? children : resource.title;
  return <a href={resource.url} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} className="research-link" aria-label={`${label} (opens in a new tab)`}>{children ?? resource.title} <span aria-hidden="true">↗</span></a>;
}

type Category = 'topics' | 'species' | 'regions' | 'resources';
type Article = { kind: 'fact' | 'species' | 'region'; id: string };
const categoryNames: Record<Category, string> = { topics: 'Topics', species: 'Species', regions: 'Regions', resources: 'Resources' };
const resourceGroups = { research: 'Research & documentation', participate: 'Observe & participate', support: 'Conservation & support' };
const reviewedDate = (date: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date));
interface ReadingMemory { category: Category; article: Article | null; query: string; topic: string; region: string; filtersOpen: boolean; indexScroll: number; scroll: number }
let readingMemory: ReadingMemory | undefined;
const matches = (query: string, ...values: string[]) => values.join(' ').toLowerCase().includes(query.trim().toLowerCase());

function Sources({ ids }: { ids: string[] }) {
  const entries = resources.filter(resource => ids.includes(resource.id));
  return <section className="article-sources" aria-label="Supporting sources"><h3>Follow the evidence</h3>{entries.map(resource => <div key={resource.id}><span>{resource.organization}{resource.year ? ` · ${resource.year}` : ''}</span><ResourceLink resource={resource}>{`Read the research: ${resource.title}`}</ResourceLink>{resource.accessNote && <p className="resource-access-note">{resource.accessNote}</p>}</div>)}</section>;
}

interface LearningProps {
  tab: 'guide' | 'resources'; focusFact?: string; focusSpecies?: SpeciesId; focusRegion?: string;
  onClose: () => void; onCooperation?: () => void; returnLabel?: string; restorePrevious?: boolean;
}

export default function Learning({ tab, focusFact, focusSpecies, focusRegion, onClose, onCooperation, returnLabel = 'Back to map', restorePrevious = false }: LearningProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const restoreMemory = restorePrevious || (!focusFact && !focusSpecies && !focusRegion && tab === 'guide');
  const initial = restoreMemory ? readingMemory : undefined;
  const indexScroll = useRef(initial?.indexScroll ?? 0);
  const firstView = useRef(true);
  const [category, setCategory] = useState<Category>(restorePrevious && initial ? initial.category : focusSpecies ? 'species' : focusRegion ? 'regions' : tab === 'resources' ? 'resources' : initial?.category ?? 'topics');
  const [article, setArticle] = useState<Article | null>(restorePrevious && initial ? initial.article : focusFact ? { kind: 'fact', id: focusFact } : focusSpecies ? { kind: 'species', id: focusSpecies } : focusRegion ? { kind: 'region', id: focusRegion } : initial?.article ?? null);
  const [query, setQuery] = useState(initial?.query ?? '');
  const [topic, setTopic] = useState(initial?.topic ?? 'all');
  const [region, setRegion] = useState(initial?.region ?? 'all');
  const [filtersOpen, setFiltersOpen] = useState(initial?.filtersOpen ?? false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (scroller.current) scroller.current.scrollTop = firstView.current && initial ? initial.scroll : article ? 0 : indexScroll.current;
    firstView.current = false;
  }, [article, category]);

  const latest = useRef({ category, article, query, topic, region, filtersOpen });
  latest.current = { category, article, query, topic, region, filtersOpen };
  useLayoutEffect(() => () => { readingMemory = { ...latest.current, indexScroll: indexScroll.current, scroll: scroller.current?.scrollTop ?? 0 }; }, []);

  function openArticle(next: Article) {
    if (!article) indexScroll.current = scroller.current?.scrollTop ?? 0;
    setArticle(next);
  }
  function changeCategory(next: Category) {
    indexScroll.current = 0;
    setCategory(next); setArticle(null); setQuery('');
  }

  const fact = article?.kind === 'fact' ? facts.find(entry => entry.id === article.id) : undefined;
  const profile = article?.kind === 'species' ? species[article.id as SpeciesId] : undefined;
  const area = article?.kind === 'region' ? regions.find(entry => entry.id === article.id) : undefined;
  const context = area ? regionalContexts.find(entry => entry.regionId === area.id) : undefined;
  const title = fact?.title ?? profile?.name ?? area?.name ?? (category === 'resources' ? 'Learn & get involved' : 'Field guide');
  const filteredFacts = facts.filter(entry => matches(query, entry.title, entry.summary, entry.topic));
  const filteredSpecies = Object.values(species).filter(entry => matches(query, entry.name, entry.scientificName, entry.description));
  const filteredRegions = regions.filter(entry => matches(query, entry.name, entry.country, entry.overview));
  const filteredResources = resources.filter(entry => matches(query, entry.title, entry.organization, entry.summary, entry.regionLabel) && (topic === 'all' || entry.topics.includes(topic)) && (region === 'all' || entry.regionIds.includes(region) || entry.regionIds.includes('global')));
  const resultCount = category === 'topics' ? filteredFacts.length : category === 'species' ? filteredSpecies.length : category === 'regions' ? filteredRegions.length : filteredResources.length;

  return <dialog ref={dialog} className="learning-dialog reading-dialog" aria-label={category === 'resources' ? 'Learn & get involved' : 'Field guide'} onCancel={event => { event.preventDefault(); if (article) setArticle(null); else onClose(); }}>
    <header className="reading-header">
      <button className="reading-back" onClick={() => article ? setArticle(null) : onClose()} aria-label={article ? 'Back to index' : category === 'resources' ? 'Close resources' : 'Close field guide'}><span aria-hidden="true">←</span> {article ? 'Index' : 'Back'}</button>
      <h2 ref={heading} tabIndex={-1}>{title}</h2>
      <button className="reading-resume" onClick={onClose}>{returnLabel} <Icon name="play" size={16} /></button>
    </header>
    <div ref={scroller} className="reading-scroll">
      {article ? <article className="reading-article">
        {fact && <><span className="fact-topic">{fact.topic.replaceAll('-', ' ')}</span><p className="article-lead">{fact.summary}</p><p>{fact.detail}</p><Sources ids={fact.resourceIds} />
          <div className="article-related">{fact.speciesIds.map(id => <button key={id} onClick={() => openArticle({ kind: 'species', id })}>Meet {species[id].name} <Icon name="arrow" size={16} /></button>)}{fact.regionIds.filter(id => id !== 'global').map(id => <button key={id} onClick={() => openArticle({ kind: 'region', id })}>{regions.find(entry => entry.id === id)?.name} context <Icon name="arrow" size={16} /></button>)}</div>
          {(fact.id === 'recognition' || fact.id === 'supercolonies') && onCooperation && <button onClick={onCooperation}>How cooperation works <Icon name="arrow" size={16} /></button>}
        </>}
        {profile && <><p className="scientific-name">{profile.scientificName}</p><p className="article-lead">{profile.description}</p><Specimen speciesId={profile.id} />
          <dl className="species-facts"><div><dt>Worker size</dt><dd>{profile.sizeLabel}</dd></div><div><dt>Worker forms</dt><dd>{profile.workerForms ?? 'Multiple species; varies'}</dd></div><div><dt>In the game</dt><dd>{profile.strengthLabel}</dd></div></dl>
          {profile.id !== 'native' && <SpeciesComparison />}
          <Sources ids={profile.resourceIds} />
        </>}
        {area && <><span className="fact-topic">{area.country}{area.nativeRange ? ' · Native range' : ' · Introduced range context'}</span><p className="article-lead">{area.overview}</p>
          {context && <><section><h3>Environment</h3><p>{context.environment}</p></section><section><h3>Ecological stakes</h3><p>{context.ecologicalStakes}</p></section><section><h3>In this game</h3><p>{context.gameAbstraction}</p></section></>}
          <HabitatGallery key={area.id} regionId={area.id} />
          <Sources ids={context?.sourceIds ?? area.sourceIds} />
          {context && <section className="article-sources" aria-label="Regional research"><h3>Regional research</h3>{context.sourceUrls.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label={`${source.label} (opens in a new tab)`}>{source.label} <span aria-hidden="true">↗</span></a>)}<p className="reading-caption">Reviewed {reviewedDate(context.reviewedAt)}</p></section>}
        </>}
        {!fact && !profile && !area && <div className="empty-state"><h3>This entry is unavailable</h3><button onClick={() => setArticle(null)}>Browse the index</button></div>}
      </article> : <div className="learn-index">
        <nav className="reading-tabs" aria-label="Learning categories">{(Object.keys(categoryNames) as Category[]).map(id => <button key={id} aria-pressed={category === id} onClick={() => changeCategory(id)}>{categoryNames[id]}</button>)}</nav>
        <label className="learning-search">Search {categoryNames[category].toLowerCase()}<input type="search" name="learning-search" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try terrain, Hawaii, or identification…" /></label>
        {category === 'topics' && <><p className="reading-intro">Short discoveries, with a path to the evidence.</p>{Array.from(new Set(filteredFacts.map(entry => entry.topic))).map(id => <section className="topic-index" key={id}><h3>{id.replaceAll('-', ' ')}</h3>{filteredFacts.filter(entry => entry.topic === id).map(entry => <button className="learn-row" key={entry.id} aria-label={entry.title} onClick={() => openArticle({ kind: 'fact', id: entry.id })}><span><strong>{entry.title}</strong><span>{entry.summary}</span></span><Icon name="arrow" size={18} /></button>)}</section>)}{onCooperation && <button className="learn-row" onClick={onCooperation}><span><strong>How cooperation works</strong><span>Recognition, research, and reinforcing a friendly nest.</span></span><Icon name="arrow" size={18} /></button>}</>}
        {category === 'species' && <><p className="reading-intro">Look closer at the workers behind the swarms.</p>{filteredSpecies.map(entry => <button className="learn-row" key={entry.id} aria-label={entry.name} onClick={() => openArticle({ kind: 'species', id: entry.id })}><span><strong>{entry.name}</strong><span>{entry.scientificName}</span></span><Icon name="arrow" size={18} /></button>)}</>}
        {category === 'regions' && <><p className="reading-intro">Place changes the story. Each region separates research from game abstractions.</p>{filteredRegions.map(entry => <button className="learn-row" key={entry.id} aria-label={entry.name} onClick={() => openArticle({ kind: 'region', id: entry.id })}><span><strong>{entry.name}</strong><span>{entry.country}{entry.nativeRange ? ' · Native range' : ''}</span></span><Icon name="arrow" size={18} /></button>)}</>}
        {category === 'resources' && <>
          <p className="reading-intro">Read ant research, share wildlife observations, or explore conservation work.</p>
          <button className="filter-resources" aria-expanded={filtersOpen} aria-controls="resource-filter-controls" onClick={() => setFiltersOpen(value => !value)}>Filter resources <span aria-hidden="true">{filtersOpen ? '−' : '+'}</span></button>
          {filtersOpen && <div id="resource-filter-controls" className="resource-filters"><label>Topic<select name="resource-topic" value={topic} onChange={event => setTopic(event.target.value)}><option value="all">All topics</option>{Array.from(new Set(resources.flatMap(entry => entry.topics))).sort().map(id => <option key={id} value={id}>{id.replaceAll('-', ' ')}</option>)}</select></label><label>Region<select name="resource-region" value={region} onChange={event => setRegion(event.target.value)}><option value="all">Worldwide & all regions</option>{regions.map(entry => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label></div>}
          {(Object.keys(resourceGroups) as (keyof typeof resourceGroups)[]).map(group => {
            const entries = filteredResources.filter(entry => entry.group === group);
            return entries.length ? <section className="resource-group" key={group}><h3>{resourceGroups[group]}</h3>{entries.map(entry => <article className="resource-entry" key={entry.id}><div className="resource-meta">{entry.organization}<span>{entry.type.replaceAll('-', ' ')}{entry.year ? ` · ${entry.year}` : ''}</span></div><h4><ResourceLink resource={entry} /></h4><p>{entry.summary}</p>{entry.accessNote && <p className="resource-access-note">{entry.accessNote}</p>}<footer><span>{entry.regionLabel}</span><span>Reviewed {reviewedDate(entry.reviewedAt)}</span></footer></article>)}</section> : null;
          })}
          <p className="reading-caption">Organization listings imply no partnership. Community observations support identification; they are not official invasive-species reports. Support links are optional and lead to the organization’s own site.</p>
        </>}
        {resultCount === 0 && <div className="empty-state" role="status"><h3>No matching entries</h3><p>Try another search or clear your filters.</p><button onClick={() => { setQuery(''); setTopic('all'); setRegion('all'); }}>Show all entries</button></div>}
      </div>}
    </div>
  </dialog>;
}
