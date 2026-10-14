/* Hallmark · pre-emit critique: P4 H4 E4 S5 R5 V4 */
import type { ReactNode } from 'react';
import type { VisualSummary as SummaryDefinition } from '../game/types';

function Worker({ x, y, large = false }: { x: number; y: number; large?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${large ? 1.4 : 1})`} className="summary-worker"><ellipse cx="0" cy="0" rx="9" ry="6" /><circle cx="-16" cy="0" r="6" /><ellipse cx="17" cy="0" rx="11" ry="8" /><path d="m-19-5-9-8m9 18-9 8M-7-5l-5-13M2-6l3-14M9-4l14-12M-7 5l-5 13M2 6l3 14M9 4l14 12" /></g>;
}
function Nest({ x, y, rival = false }: { x: number; y: number; rival?: boolean }) {
  return <g className={rival ? 'summary-rival' : 'summary-player'}><circle cx={x} cy={y} r="19" /><path d={`M${x - 7} ${y + 6}v-10l7-5 7 5v10z`} className="summary-line" /></g>;
}
const arrow = (x1: number, y1: number, x2: number, y2: number) => <g className="summary-line"><path d={`M${x1} ${y1}L${x2} ${y2}`} /><path d={`m${x2 - 9} ${y2 - 6} 9 6-9 6`} /></g>;

function Mechanism({ summary }: { summary: SummaryDefinition }): ReactNode {
  switch (summary.diagram) {
    case 'network':
      if (summary.factId === 'budding') return <><Nest x={70} y={95} />{arrow(100, 95, 215, 95)}<Worker x={153} y={95} /><Nest x={250} y={95} /><path className="summary-line" d="M267 88q54-45 88 0" /><Nest x={382} y={95} /></>;
      if (summary.factId === 'prevention') return <><path className="summary-line" d="M65 95h95m0 0h90m0 0h100" /><Nest x={65} y={95} /><Nest x={250} y={95} /><Nest x={350} y={95} /><path className="summary-block" d="M145 65v60m20-60v60" /><path className="summary-line" d="m390 72 16 10v22q-5 16-16 22-11-6-16-22V82z" /></>;
      return <><path className="summary-line" d="M65 55 150 95 65 135M150 95 240 55M150 95 240 135" /><Nest x={65} y={55} /><Nest x={65} y={135} /><Nest x={150} y={95} /><Nest x={240} y={55} /><Nest x={240} y={135} /><path className="summary-unknown" d="M280 35v125" /><Nest x={350} y={70} rival /><Nest x={405} y={120} rival /></>;
    case 'growth': return <><path className="summary-line" d="M45 145V40M45 145h350" /><path className="summary-player-line" d="m65 135 55-23 60-28 60-27h92" /><path className="summary-unknown" d="M45 57h325" /><path className="summary-block" d="M370 83v45m18-45v45" /></>;
    case 'foraging': return <><path className="summary-line" d="M75 48v62m-16-40h32m-26 17h22" /><path className="summary-player-line" d="M95 95q80-75 145 0m-145 0q80 65 145 0" /><Worker x={163} y={65} /><Worker x={164} y={124} /><Nest x={270} y={95} />{arrow(300, 95, 360, 95)}<path className="summary-line" d="M390 125v-35m-14 35V104m28 21V70" /></>;
    case 'origin': return <><path className="summary-land" d="m82 34 59 19 27 39-19 31-11 42-25-15-15-42-33-35z" /><path className="summary-player-line" d="m122 61-8 33 21 28-8 25" /><Nest x={127} y={104} />{arrow(179, 95, 280, 95)}<circle className="summary-unknown" cx="337" cy="95" r="39" /><path className="summary-line" d="M302 95h70m-35-39q-27 39 0 78m0-78q27 39 0 78" /></>;
    case 'recognition': return <><Worker x={73} y={90} large /><path className="summary-player-line" d="M102 60q40-35 78 0m-70 9q35-25 62 0" /><path className="summary-line" d="M208 55v80m-18-62h36m-36 44h36" /><Worker x={265} y={90} large />{arrow(310, 90, 355, 90)}<circle className="summary-unknown" cx="393" cy="90" r="24" /><path className="summary-line" d="M389 81q3-10 10-5 7 6-2 12l-4 4m0 9v1" /></>;
    case 'transport': return <><path className="summary-land" d="M48 91h50l-8 39H56z" /><path className="summary-line" d="M73 92V53m0 16q-24 2-19-15 19-6 19 15m0 7q25 1 20-17-19-5-20 17" />{arrow(110, 95, 195, 95)}<path className="summary-line" d="M218 85h89l-14 34h-60zm34 0V52h33v33m-67 63q12-9 24 0t24 0 24 0" />{arrow(323, 95, 383, 95)}<Nest x={410} y={95} /></>;
    case 'terrain': return <><path className="summary-land" d="M190 35h65v38l-25 14 25 15v44h-65v-44l25-15-25-14z" />{[0, 1, 2, 3].map(i => <Worker key={i} x={65 + (i % 2) * 67} y={62 + Math.floor(i / 2) * 65} />)}<Worker x={225} y={87} /><Worker x={335} y={87} />{arrow(274, 87, 305, 87)}</>;
    case 'anatomy': return <><Worker x={105} y={93} /><Worker x={303} y={93} large /><path className="summary-line" d="M55 143h100m88 0h120" /><path className="summary-unknown" d="M200 40v110" /><circle className="summary-unknown" cx="392" cy="75" r="20" /><path className="summary-line" d="M388 68v15m8-15v15" /></>;
    case 'foodweb': return summary.factId === 'honeydew' ? <><path className="summary-line" d="M62 136V48m0 29q40-45 63-16-17 35-63 16m0 33q-39-34-37-9 9 28 37 9" /><ellipse className="summary-land" cx="110" cy="72" rx="13" ry="9" /><path className="summary-player" d="M195 62q-25 32 0 39 25-7 0-39" />{arrow(225, 89, 293, 89)}<Worker x={358} y={90} large /></> : <><Worker x={66} y={92} /><path className="summary-line" d="M100 90 205 55m-105 35 105 40m0-75 110 38m-110 37 110-37" /><circle className="summary-land" cx="215" cy="50" r="17" /><path className="summary-line" d="m200 120 15-17 15 17-15 18zM316 94q38-50 66-17-20 29-66 17" /><path className="summary-line" d="M336 100v37" /></>;
    case 'landscape': return <><path className="summary-land" d="M35 130h115V80H35zm140 0h100V90H175zm130 0h110V70H305z" /><path className="summary-line" d="M47 79V55h36v24M57 55V42h14v13" /><Nest x={94} y={106} /><path className="summary-line" d="M194 108h63M330 80v45m43-53v53m25-46v46" /><circle className="summary-land" cx="330" cy="61" r="24" /><circle className="summary-land" cx="374" cy="50" r="29" /></>;
    case 'habitat': return <><path className="summary-line" d="M35 136h375m-310 0V51m-30 13 30-27 30 27m-22 48q80-56 162-5M221 136l10-33 18 33m90 0 15-66" /><circle className="summary-land" cx="94" cy="62" r="31" /><path className="summary-land" d="m330 105 55-36 25 38z" /><Worker x={178} y={116} /><path className="summary-unknown" d="M294 30v100" /></>;
    case 'observation': return summary.factId === 'recovery' ? <><path className="summary-line" d="M46 47h72v95H46zm15 22h39m-39 25h26m-26 25h34" />{arrow(138, 95, 193, 95)}<path className="summary-land" d="M208 51h76v89h-76z" /><path className="summary-line" d="m218 73 9 9 15-19m-24 46 9 9 15-19" />{arrow(299, 95, 346, 95)}<circle className="summary-player" cx="389" cy="95" r="24" /><path className="summary-line" d="m379 95 8 9 14-18" /></> : <><path className="summary-line" d="M43 65h99v66H43zm21 0 10-15h38l9 15" /><circle className="summary-player" cx="94" cy="96" r="20" />{arrow(158, 95, 220, 95)}<path className="summary-line" d="M242 55h55v82h-55zm11 18h33m-33 20h33m-33 20h20" />{arrow(313, 95, 359, 95)}<circle className="summary-unknown" cx="398" cy="85" r="15" /><path className="summary-line" d="M374 137q0-35 25-35t25 35" /></>;
  }
}

export default function VisualSummary({ summary }: { summary: SummaryDefinition }) {
  const terrain = summary.diagram === 'terrain';
  const habitatDecoration = ['landscape', 'foraging', 'habitat'].includes(summary.diagram);
  return <figure className={`visual-summary${terrain ? ' visual-summary-terrain' : ''}`} aria-label="At a glance">
    <div className="visual-summary-heading">
      <span className="eyebrow">Field note</span>
      <strong>{terrain ? 'TLDR: Terrain matters' : 'At a glance'}</strong>
      <span className="summary-heading-mark" aria-hidden="true">✦</span>
    </div>
    {terrain ? <div className="summary-terrain-comparison">
      {summary.labels.slice(0, 2).map((label, index) => <div className="summary-terrain-panel" key={label}>
        <div className={`summary-terrain-art summary-terrain-${index === 0 ? 'open' : 'complex'}`} role="img" aria-label={index === 0 ? 'Illustrated open ground with space for ant workers' : 'Illustrated narrow trail among rocks, leaves, and fallen wood'}>
          <img src="/art/terrain-comparison.jpg" width={1774} height={887} alt="" loading="eager" decoding="async" />
        </div>
        <div className="summary-terrain-label"><span aria-hidden="true">{index + 1}</span><strong>{label}</strong></div>
      </div>)}
      <div className="summary-terrain-conclusion"><span className="summary-step" aria-hidden="true">3</span><strong>{summary.labels[2]}</strong></div>
    </div> : <>
      <div className="summary-diagram-surface">
        <svg viewBox="0 0 450 180" role="img" aria-label={`${summary.labels.join(' → ')}. ${summary.takeaway}`}><Mechanism summary={summary} /></svg>
      </div>
      <ol className="summary-labels">{summary.labels.map((label, index) => <li key={label}><span aria-hidden="true">{index + 1}</span>{label}</li>)}</ol>
    </>}
    <figcaption>
      {habitatDecoration && <span className={`summary-habitat-decoration summary-decoration-${summary.diagram}`} aria-hidden="true" />}
      <span>{summary.takeaway}</span>
    </figcaption>
    {terrain && <div className="summary-art-note">Illustrated mechanism · game terrain is an abstraction</div>}
  </figure>;
}
