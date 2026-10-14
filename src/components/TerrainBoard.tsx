import { useState } from 'react';
import type { AtlasArtboard } from '../data/artboards';

/** The photograph-free illustrated scenery stays beneath the interactive, accessible game graph. */
export default function TerrainBoard({ art }: { art: AtlasArtboard }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  return <>
    <img className="terrain-plate" src={art.src + (retry ? `?retry=${retry}` : '')} width={1536} height={1024} fetchPriority="high" decoding="async" alt="" aria-hidden="true" draggable={false} style={{ objectPosition: art.objectPosition, visibility: status === 'ready' ? 'visible' : 'hidden' }} onLoad={() => setStatus('ready')} onError={() => setStatus('error')} />
    <div className="terrain-edge-shade" aria-hidden="true" />
    {status !== 'ready' && <div className="terrain-art-status" role={status === 'error' ? 'alert' : 'status'}>{status === 'loading' ? 'Opening the illustrated atlas…' : <><span>This region’s illustrated terrain couldn’t load.</span><button onClick={() => { setStatus('loading'); setRetry(value => value + 1); }}>Retry artwork</button></>}</div>}
  </>;
}
