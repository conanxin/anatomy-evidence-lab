import test from 'node:test';
import assert from 'node:assert/strict';
import {createComparison} from '../src/comparison.js';
import { DEFAULT_KEYS } from '../src/btree.js';
import { PRESETS,TRADEOFF_KEYS,WEIGHT_PRESETS,validateWeights,evaluateCost,explainCost,verifiedTradeoffExample } from '../src/cost-model.js';

test('42-key counterexample is synthetic, fixed, and consists of unique safe integers',()=>{
 assert.equal(TRADEOFF_KEYS.length,42);
 assert.equal(new Set(TRADEOFF_KEYS).size,42);
 assert.ok(TRADEOFF_KEYS.every(Number.isSafeInteger));
 assert.equal(PRESETS.tradeoff.query,7);
});
test('original 25-key P5 baseline not altered',()=>{
 assert.strictEqual(PRESETS.baseline.keys,DEFAULT_KEYS);
 const c=createComparison(PRESETS.baseline.keys,PRESETS.baseline.query);
 assert.deepEqual(c.cases.map(x=>[x.visits,x.comparisons]),[[2,4],[3,6]]);
});
test('counterexample counts are from actual trace and both miss key 7',()=>{
 const c=createComparison(TRADEOFF_KEYS,7);
 assert.deepEqual(c.cases.map(x=>[x.visits,x.comparisons,x.found]),[[4,5,false],[3,6,false]]);
 assert.deepEqual(c.cases.map(x=>[x.stats.height,x.stats.keys]),[[4,42],[3,42]]);
 for(const s of c.cases){
  assert.equal(s.trace.steps.filter(x=>x.type==='visit').length,s.visits);
  assert.equal(s.trace.steps.filter(x=>x.type==='compare').length,s.comparisons);
 }
});
test('node-heavy regime t=3 wins 21 against 25; key-heavy regime t=2 wins 29 against 33',()=>{
 const {nodes,keys,equal}=verifiedTradeoffExample();
 assert.equal(nodes.winner,3);assert.deepEqual(nodes.cases.map(x=>x.score),[25,21]);
 assert.equal(keys.winner,2);assert.deepEqual(keys.cases.map(x=>x.score),[29,33]);
 assert.equal(equal.winner,null);assert.deepEqual(equal.cases.map(x=>x.score),[9,9]);
});
test('weight changes only cost objects, never B-tree structure or actual trace',()=>{
 const c=createComparison(TRADEOFF_KEYS,7), snapshot=JSON.stringify(c);
 const first=evaluateCost(c,{node:5,comparison:1});
 const second=evaluateCost(c,{node:1,comparison:5});
 assert.equal(JSON.stringify(c),snapshot);
 assert.deepEqual(first.cases.map(x=>[x.nodeVisits,x.keyComparisons,x.scenarioId]),second.cases.map(x=>[x.nodeVisits,x.keyComparisons,x.scenarioId]));
 assert.notDeepEqual(first.cases.map(x=>x.score),second.cases.map(x=>x.score));
 assert.notStrictEqual(first.weights,second.weights);
});
test('dominance on P5 query 24 cannot reverse for positive weights',()=>{
 const c=createComparison(DEFAULT_KEYS,24);
 for(const weights of [WEIGHT_PRESETS.nodes,WEIGHT_PRESETS.keys,WEIGHT_PRESETS.balanced,{node:100,comparison:0},{node:0,comparison:100}]){
  const score=evaluateCost(c,weights);
  assert.equal(score.winner,2);
  assert.equal(score.tradeoff,false);
 }
});
test('arbitrary positive equality line in tradeoff is nodeWeight === comparisonWeight',()=>{
 const c=createComparison(TRADEOFF_KEYS,7);
 for(const w of [1,3,10])assert.equal(evaluateCost(c,{node:w,comparison:w}).winner,null);
});
test('full arithmetic breakdown is consistent',()=>{
 const c=createComparison(TRADEOFF_KEYS,7),res=evaluateCost(c,{node:2,comparison:3});
 for(const v of res.cases){assert.equal(v.score,v.nodeScore+v.comparisonScore);}
 assert.equal(res.delta,res.cases[1].score-res.cases[0].score);
 assert.deepEqual(res.coefficients,{visits:-1,comparisons:1});
});
test('weights allow zero on only one dimension, not both',()=>{
 assert.deepEqual({...validateWeights({node:0,comparison:1})},{node:0,comparison:1});
 assert.deepEqual({...validateWeights({node:1,comparison:0})},{node:1,comparison:0});
 assert.throws(()=>validateWeights({node:0,comparison:0}),/zero/);
});
test('rejects invalid weights instead of silently rounding or coercing',()=>{
 for(const bad of [null,undefined,{node:-1,comparison:1},{node:Infinity,comparison:1},{node:NaN,comparison:2},{node:101,comparison:2},{node:'5',comparison:1},{node:5,comparison:'1'},{}]){
  assert.throws(()=>validateWeights(bad));
 }
});
test('reject malformed cost comparison objects',()=>{
 assert.throws(()=>evaluateCost({},WEIGHT_PRESETS.nodes));
 assert.throws(()=>evaluateCost({cases:[{degree:2,visits:1,comparisons:2},{degree:3,visits:-1,comparisons:1}]},WEIGHT_PRESETS.nodes));
});
test('bilingual verdict explicitly mentions hypothesis and cannot claim measured latency',()=>{
 const data=evaluateCost(createComparison(TRADEOFF_KEYS,7),WEIGHT_PRESETS.nodes);
 assert.match(explainCost(data,'zh'),/教学假设/);
 assert.match(explainCost(data,'en'),/Teaching points/);
 assert.match(explainCost(data,'zh'),/反转/);
});
test('unmodified P5 corpus is stable under repeated scoring',()=>{
 const c=createComparison(), data=JSON.stringify(c);
 for(let i=1;i<=10;i++)evaluateCost(c,{node:i,comparison:11-i});
 assert.equal(JSON.stringify(c),data);
});
