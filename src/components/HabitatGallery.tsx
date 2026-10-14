import { useState } from 'react';
import { habitats } from '../data/habitats';
import { gameStore } from '../game/store';
import type { Terrain } from '../game/types';

const reviewedDate = (date: string) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(date));

export default function HabitatGallery({ regionId, terrain = 'open' }: { regionId: string; terrain?: Terrain }) {
  const [selected, setSelected] = useState<Terrain>(terrain);
  const [failedId, setFailedId] = useState<string>();
  const asset = habitats.find(entry => entry.regionId === regionId && entry.terrain === selected);
  return <section className="habitat-gallery" aria-label="Representative regional habitats">
    <h3>See the surroundings</h3>
    <div className="habitat-switch" role="group" aria-label="Habitat photograph">
      <button aria-pressed={selected === 'open'} onClick={() => setSelected('open')}>Open habitat</button>
      <button aria-pressed={selected === 'complex'} onClick={() => setSelected('complex')}>Complex habitat</button>
    </div>
    {asset ? <figure className="habitat-figure">
      {failedId === asset.id ? <div className="habitat-unavailable" role="status"><p>Photograph could not be loaded. Open its source to see this landscape.</p></div> : <img className="habitat-photo" src={asset.path} alt={`${asset.caption} ${asset.locality}.`} width={asset.width} height={asset.height} loading="lazy" onError={() => setFailedId(asset.id)} />}
      <figcaption className="habitat-credits">
        <strong>{asset.locality}</strong><p>{asset.caption}</p>
        <span>Photo: {asset.creator}</span>
        <span><a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label="Habitat photograph source (opens in a new tab)">Photograph source ↗</a> · <a href={asset.licenseUrl} target="_blank" rel="noopener noreferrer" onClick={() => gameStore.pause(true)} aria-label={`${asset.license} habitat photograph license (opens in a new tab)`}>{asset.license} ↗</a></span>
        <span>Reviewed {reviewedDate(asset.reviewedAt)}</span>
        <p className="reading-caption">Representative habitat; the game nest is fictional.</p>
        <details className="habitat-asset-notes"><summary>Image notes</summary><p>{asset.changes}</p><p>This photograph does not establish ant occurrence, colony identity, or measured combat outcomes.</p></details>
      </figcaption>
    </figure> : <p className="empty-state" role="status">A verified photograph is unavailable for this habitat.</p>}
  </section>;
}
