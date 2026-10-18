import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {fromKeys,searchTrace} from '../src/btree.js';
import {p7Case} from '../src/sensitivity.js';
import {
 P8_PROTOCOL,p8Dataset,p8Probe,p8IndependentOracle,p8VerifyOracle,p8Case,
 p8WeightedSummary,p8Summarize,runP8Robustness,
} from '../src/robustness.js';

const size=42,seed=19;
const probes=P8_PROTOCOL.probes;
const record=()=>runP8Robustness();

test('P8 design lock commit referenced, grid exactly 864, 288 unique rank designs',()=>{
 assert.equal(P8_PROTOCOL.designCommit,'df2dbc3ed06c320e1c0ed7693f6cd0e4f96cdede');
 assert.equal(P8_PROTOCOL.sizes.length*P8_PROTOCOL.seeds.length*P8_PROTOCOL.spacing.length*P8_PROTOCOL.orders.length*P8_PROTOCOL.probes.length,864);
 const x=record();assert.equal(x.summary.total,864);assert.equal(x.summary.rankDesigns,288);
 assert.equal(x.rows.length,new Set(x.rows.map(r=>r.id)).size);
});

test('Each order and spacing is a permutation with unique increasing rank map',()=>{
 for(const spacing of P8_PROTOCOL.spacing){
   const ascending=p8Dataset(size,seed,spacing,'ascending');
   assert.equal(new Set(ascending).size,size);
   assert.ok(ascending.every((x,i)=>Number.isSafeInteger(x)&&x%2===0&&(i===0||x>ascending[i-1])));
   for(const order of P8_PROTOCOL.orders){
     const keys=p8Dataset(size,seed,spacing,order);
     assert.deepEqual([...keys].sort((a,b)=>a-b),ascending);
   }
 }
});

test('P8 seed and chosen order reproducible',()=>{
 for(const order of P8_PROTOCOL.orders)assert.deepEqual(p8Dataset(25,7,'clustered-gap',order),p8Dataset(25,7,'clustered-gap',order));
 assert.notDeepEqual(p8Dataset(25,7,'baseline-even','shuffled'),p8Dataset(25,19,'baseline-even','shuffled'));
});

test('All six probe types have correctly verified membership',()=>{
 for(const spacing of P8_PROTOCOL.spacing){
   const keys=p8Dataset(25,7,spacing,'bursty');
   for(const probe of probes){
     const res=p8Probe(keys,probe);assert.equal(new Set(keys).has(res.query),res.found);
   }
 }
});

test('Reject out-of-protocol values and duplicated probe sets',()=>{
 assert.throws(()=>p8Dataset(12,7,'baseline-even','ascending'),RangeError);
 assert.throws(()=>p8Dataset(25,999,'baseline-even','ascending'),RangeError);
 assert.throws(()=>p8Dataset(25,7,'new-generator','ascending'),RangeError);
 assert.throws(()=>p8Dataset(25,7,'baseline-even','unk'),RangeError);
 assert.throws(()=>p8Probe([2,2],'hit-max'),RangeError);
 assert.throws(()=>p8Probe([2,4],'unknown'),RangeError);
});

test('Oracle independently agrees with found, miss and comparison sequence',()=>{
 const keys=p8Dataset(42,19,'clustered-gap','bursty'),tree=fromKeys(keys,2);
 for(const q of [keys[0],keys[21],keys.at(-1),keys[21]+1,keys[0]-1,keys.at(-1)+1]){
   const trace=searchTrace(tree,q),oracle=p8IndependentOracle(tree,q);
   assert.equal(oracle.found,keys.includes(q));
   assert.equal(p8VerifyOracle(tree,q,trace,keys).passed,true);
   assert.deepEqual(oracle.nodeIds,trace.steps.filter(x=>x.type==='visit').map(x=>x.nodeId));
 }
});

test('Oracle rejects fabricated data corruption instead of accepting trace',()=>{
 const keys=p8Dataset(25,7,'baseline-even','ascending'),tree=fromKeys(keys,3);
 const trace=searchTrace(tree,keys[2]);
 const corrupt=structuredClone(trace);const compare=corrupt.steps.find(s=>s.type==='compare');compare.comparedKey+=8;
 assert.throws(()=>p8VerifyOracle(tree,keys[2],corrupt,keys),/disagree/);
 assert.throws(()=>p8VerifyOracle(tree,keys[2],trace,keys.slice(3)),/disagrees/);
});

test('P8 produces 864 valid oracle-verified paired query rows',()=>{
 const x=record();
 assert.equal(x.rows.filter(r=>r.found).length,432);
 assert.equal(x.rows.filter(r=>!r.found).length,432);
 for(const r of x.rows){
   assert.ok(r.t2.visits>=1&&r.t3.visits>=1);
   assert.ok(r.t2.comparisons>=1&&r.t3.comparisons>=1);
   assert.equal(r.dv,r.t3.visits-r.t2.visits);
   assert.equal(r.dk,r.t3.comparisons-r.t2.comparisons);
 }
});

test('Spacing negative control: all 288 rank-equivalent groups agree',()=>{
 const x=record();assert.equal(x.summary.spacingInvariantGroups,288);
 assert.equal(x.summary.spacingMismatches,0);
 assert.equal(x.summary.incompleteGroups,0);
 for(const sp of P8_PROTOCOL.spacing)assert.deepEqual(x.summary.bySpacing[sp],x.summary.bySpacing['baseline-even']);
});

test('Inserted key distribution differs but all relative search metrics stay equal',()=>{
 const a=p8Case(80,7,'baseline-even','shuffled','miss-between');
 const b=p8Case(80,7,'clustered-gap','shuffled','miss-between');
 const c=p8Case(80,7,'expanding-gap','shuffled','miss-between');
 assert.notEqual(a.query,b.query);assert.notEqual(a.query,c.query);
 for(const row of [b,c])assert.deepEqual([row.t2,row.t3,row.category],[a.t2,a.t3,a.category]);
});

test('P7-compatible subset unchanged: P8 baseline, P7 orders, same sizes & seeds',()=>{
 for(const size of P8_PROTOCOL.sizes)
 for(const seed of P8_PROTOCOL.seeds)
 for(const order of ['ascending','descending','shuffled'])
 for(const probe of P8_PROTOCOL.probes){
   const old=p7Case(size,seed,order,probe),next=p8Case(size,seed,'baseline-even',order,probe);
   for(const field of ['query','found','dv','dk','category'])assert.deepEqual(next[field],old[field]);
   assert.deepEqual(next.t2,old.t2);assert.deepEqual(next.t3,old.t3);
 }
});

test('Four categories mutually exclusive, exhaustive, and distinguish insert orders',()=>{
 const x=record(),s=x.summary;
 assert.equal(Object.values(s.counts).reduce((a,b)=>a+b,0),864);
 assert.equal(s.counts.tradeoff,336);
 assert.equal(s.rankCounts.tradeoff,112);
 assert.equal(s.byOrder.ascending.tradeoff,120);
 assert.equal(s.byOrder.bursty.tradeoff,48);
 for(const size of P8_PROTOCOL.sizes)assert.equal(Object.values(s.bySize[String(size)]).reduce((a,b)=>a+b,0),288);
});

test('Summary rejects duplicate and misclassified cases',()=>{
 const first=p8Case(25,7,'baseline-even','ascending','hit-min');
 assert.throws(()=>p8Summarize([first,first]),/Duplicate/);
 assert.throws(()=>p8Summarize([{...first,category:'identical'}]),/Invalid category/);
});

test('Query mix reweights only summaries, not traces or input rows',()=>{
 const all=record(),original=JSON.stringify(all.rows),before=all.rows.map(x=>x.t2.visits+x.t3.comparisons).join(',');
 const denominators={'balanced':864,'hit-heavy':1728,'miss-heavy':1728,'edge-heavy':2016};
 for(const [mix,n] of Object.entries(denominators)){
   const result=p8WeightedSummary(all.rows,mix);
   assert.equal(result.denominator,n);
   assert.equal(Object.values(result.counts).reduce((a,b)=>a+b,0),n);
 }
 assert.equal(JSON.stringify(all.rows),original);
 assert.equal(all.rows.map(x=>x.t2.visits+x.t3.comparisons).join(','),before);
 assert.notEqual(p8WeightedSummary(all.rows,'hit-heavy').tradeoffRate,p8WeightedSummary(all.rows,'miss-heavy').tradeoffRate);
});

test('Mix by order has correct strict denominator and no pseudo-independent claims',()=>{
 const all=record();
 for(const order of P8_PROTOCOL.orders){
   assert.equal(p8WeightedSummary(all.rows,'balanced',order).denominator,216);
   assert.equal(p8WeightedSummary(all.rows,'edge-heavy',order).denominator,504);
 }
 assert.throws(()=>p8WeightedSummary(all.rows,'unknown'),RangeError);
 assert.throws(()=>p8WeightedSummary(all.rows,'balanced','other'),RangeError);
});

test('Synthetic output is reproducible as exact canonical SHA256',()=>{
 const first=JSON.stringify(record());const second=JSON.stringify(record());
 assert.equal(createHash('sha256').update(first).digest('hex'),createHash('sha256').update(second).digest('hex'));
});

test('Packaged Agent Skill manifest, evals and references structurally valid',()=>{
 const skill=resolve('skills/evidence-first-anatomy/SKILL.md');
 const content=readFileSync(skill,'utf8');
 assert.match(content,/^---\nname: evidence-first-anatomy\n/m);
 assert.match(content,/description:/);
 const result=spawnSync(process.execPath,['skills/evidence-first-anatomy/scripts/check-project.mjs','--strict'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||result.stdout);
 const report=JSON.parse(result.stdout);
 assert.equal(report.passed,true);assert.match(report.note,/NOT verify an agent runtime/);
});
