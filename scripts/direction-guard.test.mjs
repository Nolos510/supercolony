import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { validateDirection } from './direction-guard.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'supercolony-direction-'));
  for (const [file, value] of [['reference.png','reference'], ['Map.tsx','source'], ['desktop.png','render']]) writeFileSync(join(root,file),value);
  return { root, acceptance: { reference:'reference.png', requiredSurfaces:['world'], requiredCriteria:['rich-illustration'] }, report: {
    reference:{path:'reference.png',sha256:hash('reference')},
    artifactFiles:[{path:'Map.tsx',sha256:hash('source')}],
    surfaces:[{id:'world',status:'pass',finding:'Actual game inspected against reference; rich art visible.',screenshots:[{path:'desktop.png',sha256:hash('render')}]}],
    criteria:[{id:'rich-illustration',status:'pass',finding:'Detailed original illustrated landscape fills the board.'}],
    reviewer:{name:'Independent reviewer',method:'Rendered reference-to-game comparison'},
  }};
}
function check(change) {const f=fixture();try{change?.(f);return validateDirection(f.report,f.acceptance,f.root);}finally{rmSync(f.root,{recursive:true,force:true});}}
test('matching reviewed renders can pass the direction gate',()=>assert.deepEqual(check(),[]));
test('replays the rejected delivery even when engineering checks passed',()=>assert.match(check(f=>{f.report.surfaces[0].status='fail';f.report.criteria[0].status='fail';}).join('\n'),/world|rich-illustration/));
test('missing reference cannot be replaced by confident prose',()=>assert.match(check(f=>{f.report.reference=null;}).join('\n'),/reference/i));
test('source changes invalidate the rendered review',()=>assert.match(check(f=>writeFileSync(join(f.root,'Map.tsx'),'different source')).join('\n'),/stale|hash/i));
test('missing required surface blocks completion',()=>assert.match(check(f=>{f.report.surfaces=[];}).join('\n'),/world/));
test('unreviewed criterion is not a passing engineering result',()=>assert.match(check(f=>{f.report.criteria[0].status='unreviewed';}).join('\n'),/rich-illustration/));
test('overwritten screenshots invalidate the evidence',()=>assert.match(check(f=>writeFileSync(join(f.root,'desktop.png'),'overwritten')).join('\n'),/stale|hash/i));
test('a review without findings cannot pass',()=>assert.match(check(f=>{f.report.criteria[0].finding='';}).join('\n'),/finding/i));
