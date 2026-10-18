import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createComparison } from '../src/comparison.js';
import { evaluateCost } from '../src/cost-model.js';
import { search, fromKeys } from '../src/btree.js';
import {
  P7_PROTOCOL, p7Dataset, p7Probe, p7Case, p7Classify, p7Summarize,
  p7Heatmap, runP7Sensitivity,
} from '../src/sensitivity.js';

const fixture = runP7Sensitivity();
const categories = ['t2-dominates','t3-dominates','tradeoff','identical'];

const t = (label, fn) => test('P7: '+label, fn);
t('published preregistration SHA pinned',()=>{
  assert.equal(P7_PROTOCOL.preregistrationCommit,'33f35b83a93ec9ae5e821e8c5e2aec522d369e35');
  assert.deepEqual(P7_PROTOCOL.sizes,[12,25,42,80]);
  assert.deepEqual(P7_PROTOCOL.seeds,[7,19,37,101]);
  assert.deepEqual(P7_PROTOCOL.orders,['ascending','descending','shuffled']);
  assert.equal(P7_PROTOCOL.probes.length,6);
  assert.deepEqual(P7_PROTOCOL.weights,[1,2,5,10]);
});
t('finite full factorial contains 288 different IDs',()=>{
  assert.equal(fixture.rows.length,288);
  assert.equal(new Set(fixture.rows.map(x=>x.id)).size,288);
  assert.equal(fixture.summary.total,288);
});
t('exactly 144 hits and 144 misses',()=>{
  assert.equal(fixture.rows.filter(x=>x.found).length,144);
  assert.equal(fixture.rows.filter(x=>!x.found).length,144);
});
t('source keysets match across insertion order and differ by seed',()=>{
  const base=p7Dataset(42,7,'ascending');
  const reverse=p7Dataset(42,7,'descending');
  const shuffled=p7Dataset(42,7,'shuffled');
  assert.deepEqual(reverse,[...base].reverse());
  assert.deepEqual([...shuffled].sort((a,b)=>a-b),base);
  assert.notDeepEqual(p7Dataset(42,19,'ascending'),base);
  assert.notDeepEqual(shuffled,base);
});
t('all generated keys positive, even, unique and safe',()=>{
  for(const n of P7_PROTOCOL.sizes) for(const seed of P7_PROTOCOL.seeds) {
    const keys=p7Dataset(n,seed,'ascending');
    assert.equal(keys.length,n);
    assert.equal(new Set(keys).size,n);
    assert.ok(keys.every(x=>Number.isSafeInteger(x)&&x>0&&x%2===0));
  }
});
t('probe definitions preserve three hits and three guaranteed misses',()=>{
  const keys=p7Dataset(25,37,'ascending');
  for(const probe of P7_PROTOCOL.probes){
    const p=p7Probe(keys,probe);
    assert.equal(keys.includes(p.query),p.found);
    assert.equal(p.found,probe.startsWith('hit'));
  }
});
t('all 288 paired outcomes agree with independent B-tree search',()=>{
  for(const row of fixture.rows){
    const keys=p7Dataset(row.size,row.seed,row.order);
    for(const degree of [2,3]) assert.equal(search(fromKeys(keys,degree),row.query).found,row.found,row.id);
  }
});
t('every row has non-negative integer counters and a correct classification',()=>{
  for(const row of fixture.rows){
    for(const c of [row.t2,row.t3]) assert.ok([c.visits,c.comparisons,c.nodes,c.levels].every(x=>Number.isSafeInteger(x)&&x>=1),row.id);
    assert.equal(row.dv,row.t3.visits-row.t2.visits);
    assert.equal(row.dk,row.t3.comparisons-row.t2.comparisons);
    assert.equal(p7Classify(row.dv,row.dk),row.category);
  }
});
t('Pareto dominated, tradeoff and equal categories are mutually exclusive',()=>{
  assert.equal(p7Classify(0,0),'identical');
  assert.equal(p7Classify(0,3),'t2-dominates');
  assert.equal(p7Classify(2,0),'t2-dominates');
  assert.equal(p7Classify(-4,0),'t3-dominates');
  assert.equal(p7Classify(0,-7),'t3-dominates');
  assert.equal(p7Classify(-1,3),'tradeoff');
  assert.equal(p7Classify(2,-2),'tradeoff');
  assert.throws(()=>p7Classify(0.5,1));
  assert.throws(()=>p7Classify(Infinity,1));
});
t('locked grid golden counts match independent published deterministic algorithm',()=>{
  assert.deepEqual(fixture.summary.counts,{
    't2-dominates':13,'t3-dominates':152,'tradeoff':111,'identical':12,
  });
  assert.equal(fixture.summary.tradeoffRate,111/288);
  assert.deepEqual(Object.values(fixture.summary.bySize).map(x=>x.tradeoff),[15,25,33,38]);
});
t('every partition sums back to 288 without double counting',()=>{
  const total=cs=>categories.reduce((s,k)=>s+cs[k],0);
  assert.equal(total(fixture.summary.counts),288);
  for(const size of Object.values(fixture.summary.bySize))assert.equal(total(size),72);
  for(const order of Object.values(fixture.summary.byOrder))assert.equal(total(order),96);
  for(const result of Object.values(fixture.summary.byFound))assert.equal(total(result),144);
});
t('sensitivity reruns produce byte-identical canonical results',()=>{
  const a=createHash('sha256').update(JSON.stringify(runP7Sensitivity())).digest('hex');
  const b=createHash('sha256').update(JSON.stringify(runP7Sensitivity())).digest('hex');
  assert.equal(a,b);
});
t('all 16 weight matrix cells use reference evaluator, no unregistered weights',()=>{
  const row=fixture.rows.find(x=>x.category==='tradeoff');
  const grid=p7Heatmap(row);
  assert.equal(grid.length,4);
  for(let r=0;r<grid.length;r++)for(let c=0;c<grid[r].length;c++){
    const item=grid[r][c];
    assert.equal(item.nodeWeight,P7_PROTOCOL.weights[r]);
    assert.equal(item.keyWeight,P7_PROTOCOL.weights[c]);
    const ref=evaluateCost(createComparison(p7Dataset(row.size,row.seed,row.order),row.query),{node:item.nodeWeight,comparison:item.keyWeight});
    assert.equal(item.scoreT2,ref.cases[0].score);
    assert.equal(item.scoreT3,ref.cases[1].score);
    assert.equal(item.preference,ref.winner===null?'tie':`t${ref.winner}`);
  }
});
t('selected tradeoff cell flips preference when weights change',()=>{
  const row=p7Case(42,7,'ascending','hit-median');
  assert.equal(row.category,'tradeoff');
  const grid=p7Heatmap(row);
  assert.equal(grid[0][3].preference,'t2');
  assert.equal(grid[3][0].preference,'t3');
  assert.equal(grid[1][0].preference,'tie');
});
t('weight changes do not mutate selected source tree, traces or counter counts',()=>{
  const row=p7Case(42,7,'ascending','hit-median');
  const before=JSON.stringify(row);
  const first=p7Heatmap(row);
  const second=p7Heatmap(row,[10,5,2,1]);
  assert.equal(JSON.stringify(row),before);
  assert.notDeepEqual(first,second);
  assert.deepEqual(row,p7Case(42,7,'ascending','hit-median'));
});
t('invalid scenario settings are rejected rather than silently changed',()=>{
  assert.throws(()=>p7Dataset(21,7,'ascending'));
  assert.throws(()=>p7Dataset(12,6,'ascending'));
  assert.throws(()=>p7Dataset(12,7,'unknown'));
  assert.throws(()=>p7Probe([2,4],'unregistered'));
  assert.throws(()=>p7Heatmap(fixture.rows[0],[0]));
});
t('duplicate/forged results cannot silently pollute summary',()=>{
  assert.throws(()=>p7Summarize([fixture.rows[0],fixture.rows[0]]));
  assert.throws(()=>p7Summarize([{...fixture.rows[0],category:'tradeoff'}]));
});
