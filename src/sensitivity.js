/**
 * P7 finite-grid sensitivity audit. Protocol locked in docs/P7_DESIGN_LOCK.md
 * BEFORE results were generated (GitHub commit 33f35b83a93ec9ae5e821e8c5e2aec522d369e35).
 * This is a deterministic *synthetic* enumeration, not a population sample.
 */
import { fromKeys, searchTrace, validateTree } from './btree.js';
import { createComparison } from './comparison.js';
import { evaluateCost } from './cost-model.js';

export const P7_PROTOCOL = Object.freeze({
  id: 'ANATOMY-P7-FINITE-GRID/1.0',
  preregistrationCommit: '33f35b83a93ec9ae5e821e8c5e2aec522d369e35',
  sizes: Object.freeze([12, 25, 42, 80]),
  seeds: Object.freeze([7, 19, 37, 101]),
  orders: Object.freeze(['ascending', 'descending', 'shuffled']),
  probes: Object.freeze(['hit-min', 'hit-median', 'hit-max', 'miss-below', 'miss-between', 'miss-above']),
  weights: Object.freeze([1, 2, 5, 10]),
  scope: 'Finite synthetic paired B-tree experiment; not empirical workload, disk I/O, latency, or human study.',
});

function p7Assert(condition, message) {
  if (!condition) throw new Error(message);
}
function p7Rng(initial) {
  let x = initial >>> 0;
  if (x === 0) throw new RangeError('PRNG seed must be nonzero');
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 0x100000000;
  };
}
function p7Shuffle(items, random) {
  const next = [...items];
  for (let i = next.length - 1; i >= 1; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Same sampled key set across insertion orders and both t assumptions. */
export function p7Dataset(size, seed, order) {
  if (!P7_PROTOCOL.sizes.includes(size) || !P7_PROTOCOL.seeds.includes(seed) || !P7_PROTOCOL.orders.includes(order)) {
    throw new RangeError('Scenario outside locked design');
  }
  const pool = Array.from({ length: 8 * size }, (_, i) => (i + 1) * 2);
  const random = p7Rng(seed ^ Math.imul(size, 0x9e3779b1));
  const ascending = p7Shuffle(pool, random).slice(0, size).sort((a,b) => a-b);
  if (order === 'ascending') return ascending;
  if (order === 'descending') return ascending.toReversed();
  return p7Shuffle(ascending, p7Rng(seed ^ Math.imul(size, 0x85ebca6b) ^ 0x51ed));
}

export function p7Probe(keys, probe) {
  if (!P7_PROTOCOL.probes.includes(probe)) throw new RangeError('Probe outside locked design');
  if (!Array.isArray(keys) || !keys.length || new Set(keys).size !== keys.length) throw new RangeError('Unique nonempty dataset required');
  const sorted = [...keys].sort((a,b)=>a-b);
  const mid = sorted[Math.floor(sorted.length / 2)];
  const queries = {
    'hit-min': sorted[0], 'hit-median': mid, 'hit-max': sorted.at(-1),
    'miss-below': sorted[0]-1, 'miss-between': mid+1, 'miss-above': sorted.at(-1)+1,
  };
  const query = queries[probe];
  const found = probe.startsWith('hit-');
  p7Assert(sorted.includes(query) === found, `Query ${probe} mismatch`);
  return {query, found};
}

/** Pareto dominance: one metric no worse, at least one strictly better. */
export function p7Classify(dv, dk) {
  if (![dv,dk].every(Number.isSafeInteger)) throw new TypeError('Integer paired differences required');
  if (dv === 0 && dk === 0) return 'identical';
  if (dv * dk < 0) return 'tradeoff';
  if (dv >= 0 && dk >= 0) return 't2-dominates';
  if (dv <= 0 && dk <= 0) return 't3-dominates';
  throw new Error('Classification not exhaustive');
}

export function p7Case(size, seed, order, probe) {
  const keys = p7Dataset(size, seed, order);
  const {query, found} = p7Probe(keys, probe);
  const paired = createComparison(keys, query);
  for (const c of paired.cases) {
    const checks = validateTree(c.tree);
    const direct = searchTrace(c.tree, query);
    p7Assert(checks.valid && direct.found === found && c.trace.found === found, 'Pair parity or invariants fail');
    p7Assert(direct.steps.length === c.trace.steps.length, 'Trace instability');
  }
  const [two,three] = paired.cases;
  const dv = three.visits - two.visits;
  const dk = three.comparisons - two.comparisons;
  const label = p7Classify(dv,dk);
  return {
    id: `P7-n${size}-s${seed}-${order}-${probe}`,
    size, seed, order, probe, query, found,
    t2: {visits:two.visits, comparisons:two.comparisons, levels:two.stats.height, nodes:two.stats.nodes},
    t3: {visits:three.visits, comparisons:three.comparisons, levels:three.stats.height, nodes:three.stats.nodes},
    dv, dk, category:label,
  };
}

const CATEGORIES = Object.freeze(['t2-dominates','t3-dominates','tradeoff','identical']);
export function p7Summarize(rows) {
  if (!Array.isArray(rows)) throw new TypeError('Row array required');
  const empty = () => Object.fromEntries(CATEGORIES.map(c=>[c,0]));
  const counts = empty();
  const bySize = Object.fromEntries(P7_PROTOCOL.sizes.map(n=>[String(n),empty()]));
  const byOrder = Object.fromEntries(P7_PROTOCOL.orders.map(n=>[n,empty()]));
  const byFound = { hit:empty(), miss:empty() };
  const seen = new Set();
  for (const row of rows) {
    if (!CATEGORIES.includes(row.category) || seen.has(row.id) || row.category !== p7Classify(row.dv,row.dk)) {
      throw new Error('Duplicate or invalid classification');
    }
    seen.add(row.id);
    counts[row.category]++;
    bySize[String(row.size)][row.category]++;
    byOrder[row.order][row.category]++;
    byFound[row.found?'hit':'miss'][row.category]++;
  }
  const total = rows.length;
  return { total, counts, tradeoffRate:total?counts.tradeoff/total:null, bySize, byOrder, byFound };
}

/** Enumerate every locked design cell. Treat rows as correlated fixed design cells. */
export function runP7Sensitivity() {
  const rows = [];
  for (const size of P7_PROTOCOL.sizes)
    for (const seed of P7_PROTOCOL.seeds)
      for (const order of P7_PROTOCOL.orders)
        for (const probe of P7_PROTOCOL.probes)
          rows.push(p7Case(size,seed,order,probe));
  const summary=p7Summarize(rows);
  p7Assert(summary.total===288,'Protocol grid must contain 288 cases');
  p7Assert(summary.byFound.hit.tradeoff+summary.byFound.miss.tradeoff <=288,'Invalid query groups');
  return {protocol:P7_PROTOCOL,summary,rows};
}

export function p7Heatmap(record, levels = P7_PROTOCOL.weights) {
  if (!record || !record.t2 || !record.t3) throw new TypeError('An actual p7Case record is required');
  if (!Array.isArray(levels) || !levels.length || levels.some(x=>!Number.isInteger(x)||x<1||x>100))throw new RangeError('Positive integer weights required');
  // Use canonical evaluateCost rather than a separate interpretation engine.
  const cases=[{degree:2,visits:record.t2.visits,comparisons:record.t2.comparisons,scenarioId:record.id+'-2'},
               {degree:3,visits:record.t3.visits,comparisons:record.t3.comparisons,scenarioId:record.id+'-3'}];
  return levels.map(nodeWeight => levels.map(keyWeight=>{
    const result=evaluateCost({cases},{node:nodeWeight,comparison:keyWeight});
    return {nodeWeight,keyWeight,scoreT2:result.cases[0].score,scoreT3:result.cases[1].score,
            preference:result.winner===null?'tie':`t${result.winner}`,delta:result.delta};
  }));
}
