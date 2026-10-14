import type { GameState, Owner } from '../game/types';
import { regions } from '../game/scenarios';
import { rallyInfo, REGIONAL_BALANCE } from '../game/engine';

const ownerSymbols: Record<Owner, string> = { player: '●', ally: '◐', rival: '◆', neutral: '○' };
const ownerLabels: Record<Owner, string> = { player: 'Yours', ally: 'Cooperating', rival: 'Rival', neutral: 'Unclaimed' };

export function RegionProgress({ state, regionId, showRegionName = false }: { state: GameState; regionId: string; showRegionName?: boolean }) {
  const nodes = state.nodes.filter(node => node.regionId === regionId);
  const yours = nodes.filter(node => node.owner === 'player').length;
  const habitat = nodes.length ? Math.round(nodes.reduce((sum, node) => sum + node.habitat, 0) / nodes.length * 100) : undefined;
  return <div className="region-progress" role="group" aria-label="Area progress">
    {showRegionName && <span className="region-progress-name">{regions.find(region => region.id === regionId)?.shortName}</span>}
    <strong>{state.mode === 'ecologist' ? habitat === undefined ? 'Habitat · educational context' : `Habitat ${habitat}% retained` : nodes.length ? `Yours ${yours}/${nodes.length}` : 'Educational context'}</strong>
    {state.mode === 'ecologist' ? <span className="region-proxy-status">{nodes.length ? `${nodes.filter(node => node.owner !== 'rival').length} native community proxies · ${nodes.filter(node => node.owner === 'rival').length} invasive proxies` : 'Native-range ecology; no invasion simulated.'}</span> : <>
      <span className="ownership-dots">{nodes.map(node => <span className={`ownership-dot ${node.owner}`} key={node.id} role="img" aria-label={`${node.name}: ${ownerLabels[node.owner]}`}>{ownerSymbols[node.owner]}</span>)}</span>
      <span className="region-ownership-legend"><span>● Yours</span><span>◐ Cooperating</span><span>◆ Rival</span><span>○ Unclaimed</span></span>
    </>}
  </div>;
}

interface RegionalCommandsProps {
  state: GameState; regionId: string; fraction: number;
  onSelectRegion: () => void; onRally: () => void; onAutoRally: (enabled: boolean) => void;
}

export default function RegionalCommands({ state, regionId, fraction, onSelectRegion, onRally, onAutoRally }: RegionalCommandsProps) {
  if (state.mode === 'ecologist') return null;
  const region = regions.find(entry => entry.id === regionId);
  const info = rallyInfo(state, regionId, fraction);
  const gateway = state.nodes.find(node => node.id === info.gatewayId);
  const owned = state.nodes.filter(node => node.regionId === regionId && node.owner === 'player');
  const running = state.status === 'running';
  const configurable = running || state.status === 'paused';
  const blockedNames = info.blockedSourceIds.map(id => state.nodes.find(node => node.id === id)?.name).filter(Boolean);
  const statusId = `auto-rally-${regionId}-status`;
  return <section className="regional-commands" aria-label="Regional orders">
    <div className="regional-command-heading"><h3>{region?.shortName ?? 'Region'} orders</h3><span>{owned.length} owned {owned.length === 1 ? 'nest' : 'nests'}</span></div>
    <div className="regional-command-actions"><button disabled={!owned.length} onClick={onSelectRegion}>Select region</button><button className="primary rally-button" disabled={!info.canRally || !running} onClick={onRally}>Rally to gateway</button></div>
    <p className="regional-command-help">{!info.gatewayOwned ? `Own ${gateway?.name ?? 'the gateway'} to rally this region.` : `${Math.round(fraction * 100)}% from ${info.eligibleSourceIds.length} reachable ${info.eligibleSourceIds.length === 1 ? 'source' : 'sources'} goes to ${gateway?.name ?? 'the gateway'}. The gateway keeps its reserves.`}</p>
    <label className="auto-rally-toggle"><input type="checkbox" name="auto-rally" aria-label="Auto rally" aria-describedby={statusId} checked={info.autoEnabled} disabled={!info.gatewayOwned || !configurable} onChange={event => onAutoRally(event.target.checked)} /><span>Auto rally</span></label>
    <p id={statusId} className="auto-rally-help">Each game second, reachable nests with {REGIONAL_BALANCE.autoThreshold}+ workers send {REGIONAL_BALANCE.autoBatch}, keeping at least {REGIONAL_BALANCE.autoThreshold - REGIONAL_BALANCE.autoBatch}. Cooperating nests keep their own orders.</p>
    {info.autoEnabled && <p className="auto-rally-status">{info.waitingSourceIds.length} {info.waitingSourceIds.length === 1 ? 'nest waits' : 'nests wait'} for workers.</p>}
    {blockedNames.length > 0 && <p className="auto-rally-status">Waiting for a friendly route: {blockedNames.join(', ')}. These sources retain their workers.</p>}
    {!running && <p className="regional-command-status">{state.status === 'paused' ? 'Resume the match to launch rally swarms. Automatic settings can change while paused.' : 'Start a new match to rally or change automation.'}</p>}
  </section>;
}
