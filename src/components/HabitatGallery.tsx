import { useState } from 'react';
import { habitatAssignments, habitatPhotos, habitats } from '../data/habitats';
import { nestRoles } from '../data/nestRoles';
import { gameStore } from '../game/store';
import type { HabitatAssignment, Terrain } from '../game/types';

const reviewedDate = (date: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date));

export default function HabitatGallery({ regionId, terrain = 'open', roleId, scenario = 'regional' }: {
  regionId: string; terrain?: Terrain; roleId?: string; scenario?: HabitatAssignment['scenario'];
}) {
  const [example, setExample] = useState<'setting' | Terrain>(roleId ? 'setting' : terrain);
  const [illustrativeRole, setIllustrativeRole] = useState('');
  const [failedId, setFailedId] = useState<string>();
  const regionalSettings = habitatAssignments.filter(entry => entry.regionId === regionId && entry.scenario === 'regional');
  const effectiveRole = roleId || illustrativeRole;
  const assignment = habitatAssignments.find(entry => entry.regionId === regionId && entry.roleId === effectiveRole && entry.scenario === (roleId ? scenario : 'regional'));
  const primary = assignment && habitatPhotos.find(entry => entry.id === assignment.photoId);
  const current = example === 'setting' && effectiveRole ? primary : habitats.find(entry => entry.regionId === regionId && entry.terrain === (example === 'setting' ? terrain : example));
  const role = nestRoles.find(entry => entry.id === effectiveRole);
  return <section className="habitat-gallery" aria-label="Representative regional habitats">
    <h3>{role ? 'Around the ' + role.name.toLowerCase() : 'See the surroundings'}</h3>
    {!roleId && !!regionalSettings.length && <div className="habitat-setting-picker"><label>Illustrative setting<select value={illustrativeRole} onChange={event => { setIllustrativeRole(event.target.value); setExample(event.target.value ? 'setting' : terrain); }}><option value="">Regional terrain examples</option>{regionalSettings.map(entry => <option key={entry.roleId} value={entry.roleId}>{nestRoles.find(setting => setting.id === entry.roleId)?.name ?? entry.roleId}</option>)}</select></label><p>Fictional setting; representative photograph.</p></div>}
    <div className="habitat-switch" role="group" aria-label="Habitat photograph">
      {effectiveRole && <button aria-pressed={example === 'setting'} onClick={() => setExample('setting')}>This setting</button>}
      <button aria-pressed={example === 'open'} onClick={() => setExample('open')}>Open habitat</button>
      <button aria-pressed={example === 'complex'} onClick={() => setExample('complex')}>Complex habitat</button>
    </div>
    {effectiveRole && example !== 'setting' && <p className="habitat-alternative">Regional terrain example · choose This setting for the fictional setting’s surroundings.</p>}
    {current ? <figure className="habitat-figure">
      {failedId === current.id ? <div className="habitat-unavailable" role="status"><p>Photograph could not be loaded. Open its source to see this landscape.</p></div> : <img className="habitat-photo" src={current.path} alt={current.caption + ' ' + current.locality + '.'} width={current.width} height={current.height} loading="lazy" onError={() => setFailedId(current.id)} />}
      <figcaption className="habitat-credits">
        <strong>{current.locality}</strong><p>{current.caption}</p>
        {example === 'setting' && assignment && <p className="habitat-setting-note">{assignment.description}</p>}
        <span>Photo: {current.creator}</span>
        <span><a href={current.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Habitat photograph source (opens in a new tab)">Photograph source ↗</a> · <a href={current.licenseUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label={current.license + ' habitat photograph license (opens in a new tab)'}>{current.license} ↗</a></span>
        <span>Reviewed {reviewedDate(current.reviewedAt)}</span>
        <p className="reading-caption">Representative habitat; the game nest is fictional.</p>
        <details className="habitat-asset-notes"><summary>Image notes</summary><p>{current.changes}</p><p>This photograph does not establish ant occurrence, colony identity, or measured combat outcomes.</p></details>
      </figcaption>
    </figure> : <p className="empty-state" role="status">A verified photograph is unavailable for this setting.</p>}
  </section>;
}
