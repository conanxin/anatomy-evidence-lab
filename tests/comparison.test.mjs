import test from 'node:test';
import assert from 'node:assert/strict';
import { createComparison, describeComparison, scenarioId, validateDataset, COMPARED_DEGREES } from '../src/comparison.js';
import { DEFAULT_KEYS, validateTree, searchTrace, search } from '../src/btree.js';

test('P5 case degrees are exactly t=2 and t=3', () => assert.deepEqual([...COMPARED_DEGREES], [2,3]));

test('both models use the identical input sequence without mutating caller inputs', () => {
  const keys = [...DEFAULT_KEYS]; const backup = [...keys];
  const c = createComparison(keys, 24);
  assert.deepEqual(c.keys, backup);
  assert.deepEqual(keys, backup);
  assert.notStrictEqual(c.keys, keys);
  for (const item of c.cases) assert.equal(item.stats.keys, keys.length);
});

test('t=2 and t=3 both satisfy all B-tree invariants', () => {
  const c = createComparison();
  for (const item of c.cases) {
    assert.equal(item.tree.t, item.degree);
    assert.ok(validateTree(item.tree).valid);
    assert.equal(item.stats.keys, DEFAULT_KEYS.length);
  }
});

test('node bounds differ with degree in the expected formula', () => {
  const cases = createComparison().cases;
  for (const { degree,tree } of cases) {
    const check = node => {assert.ok(node.keys.length <= 2*degree-1); node.children.forEach(check);};
    check(tree.root);
  }
});

test('each visited node id matches real nodes and trace visits', () => {
  for (const item of createComparison(DEFAULT_KEYS, 25).cases) {
    const all = new Set(); const crawl = n => {all.add(n.id);n.children.forEach(crawl);};crawl(item.tree.root);
    assert.ok(item.visitedNodeIds.length > 0);
    assert.ok(item.visitedNodeIds.every(id=>all.has(id)));
    assert.deepEqual(item.visitedNodeIds,item.trace.steps.filter(s=>s.type==='visit').map(s=>s.nodeId));
  }
});

test('search outputs agree across both degrees for every inserted key and a spread of misses', () => {
  for (const key of [...DEFAULT_KEYS, -100, 0, 25, 41, 59, 90, 100]) {
    const c = createComparison(DEFAULT_KEYS,key);
    const found = DEFAULT_KEYS.includes(key);
    assert.equal(c.cases[0].found, found);
    assert.equal(c.cases[1].found, found);
    assert.equal(search(c.cases[0].tree,key).found,found);
    assert.equal(search(c.cases[1].tree,key).found,found);
  }
});

test('visits, comparisons and descents are counts from trace events rather than guesses', () => {
  for(const item of createComparison().cases){
    for(const [property,type] of [['visits','visit'],['comparisons','compare'],['descents','descend']]){
      assert.equal(item[property], item.trace.steps.filter(s=>s.type===type).length);
    }
    assert.equal(item.descents,item.visits-1);
  }
});

test('comparison differences exactly equal case counters',()=>{
  const c=createComparison(DEFAULT_KEYS,25);
  for (const [key, attr] of [['nodeVisits','visits'],['comparisons','comparisons']])
    assert.equal(c.difference[key],c.cases[1][attr]-c.cases[0][attr]);
  assert.equal(c.difference.height,c.cases[1].stats.height-c.cases[0].stats.height);
});

test('scenario fingerprints are stable, specific to degree, insertion order, and query',()=>{
  const a=createComparison(),b=createComparison();
  assert.deepEqual(a.cases.map(i=>i.scenarioId),b.cases.map(i=>i.scenarioId));
  assert.notEqual(a.cases[0].scenarioId,a.cases[1].scenarioId);
  assert.notEqual(a.cases[0].scenarioId,scenarioId([...DEFAULT_KEYS].reverse(),24,2));
  assert.notEqual(a.cases[0].scenarioId,scenarioId(DEFAULT_KEYS,25,2));
  assert.match(a.cases[0].scenarioId,/^BT-2-[0-9a-f]{8}$/);
});

test('dataset validator rejects duplicates, unsafe keys, oversized and empty inputs',()=>{
  for(const value of [[1,1],[],[Number.MAX_SAFE_INTEGER+1],Array.from({length:401},(_,i)=>i)]){
    assert.throws(()=>validateDataset(value));
  }
  assert.deepEqual(validateDataset([1,3,2]),[1,3,2]);
});

test('model and output do not mutate the original dataset even after independent search',()=>{
  const keys=[...DEFAULT_KEYS]; const c=createComparison(keys,16);
  searchTrace(c.cases[0].tree,16);searchTrace(c.cases[1].tree,16);
  assert.deepEqual(keys,[...DEFAULT_KEYS]);
  assert.equal(c.cases[0].tree.t,2);assert.equal(c.cases[1].tree.t,3);
});

test('bilingual interpretation explicitly avoids the false I/O and latency conclusion',()=>{
  const c=createComparison(DEFAULT_KEYS,24);
  assert.match(describeComparison(c,'zh'),/不是磁盘 I\/O 或实际速度/);
  assert.match(describeComparison(c,'en'),/not disk I\/O or speed/);
  assert.match(describeComparison(c,'zh'),/t=3 相比 t=2/);
  assert.match(describeComparison(c,'en'),/t=3 vs t=2/);
});

test('inserting an extra value into common dataset affects both models identically',()=>{
  const keys=[...DEFAULT_KEYS,25];const c=createComparison(keys,25);
  assert.ok(c.cases.every(x=>x.found&&x.stats.keys===DEFAULT_KEYS.length+1));
});

test('invalid lookup and degree assumptions fail clearly',()=>{
  assert.throws(()=>createComparison(DEFAULT_KEYS,NaN),TypeError);
  assert.throws(()=>scenarioId(DEFAULT_KEYS,24,99),RangeError);
});
