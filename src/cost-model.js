/**
 * P6: contestable teaching score, not measured time, disk I/O, energy or money.
 * The underlying B-tree and traced event counts are independent of weights.
 */
import { DEFAULT_KEYS } from './btree.js';
import { createComparison } from './comparison.js';

// Intentionally synthetic, fixed insertion sequence. Search 7 misses both trees;
// t=2: 4 visits / 5 key comparisons; t=3: 3 visits / 6 comparisons.
export const TRADEOFF_KEYS = Object.freeze([
  12, 2, 10, 44, 32, 66, 30, 54, 62, 6, 28, 46, 84, 48, 34, 60, 24,
  70, 16, 72, 8, 76, 82, 58, 50, 42, 22, 26, 56, 68, 64, 40, 38,
  4, 52, 80, 36, 20, 14, 78, 18, 74,
]);
export const PRESETS = Object.freeze({
  baseline: Object.freeze({ id:'baseline', label:'25 synthetic integers', keys:DEFAULT_KEYS, query:24 }),
  tradeoff: Object.freeze({ id:'tradeoff', label:'42 synthetic integers, tradeoff example', keys:TRADEOFF_KEYS, query:7 }),
});
export const WEIGHT_PRESETS = Object.freeze({
  nodes: Object.freeze({node:5, comparison:1}),
  keys: Object.freeze({node:1, comparison:5}),
  balanced: Object.freeze({node:1, comparison:1}),
});

export function validateWeights(weights) {
  if (typeof weights !== 'object' || weights === null) throw new TypeError('Weights object required');
  const { node, comparison } = weights;
  if (![node,comparison].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100)) {
    throw new RangeError('Weights must be finite nonnegative numbers <=100');
  }
  if (node === 0 && comparison === 0) throw new RangeError('Both weights cannot be zero');
  return Object.freeze({node, comparison});
}

export function evaluateCost(comparison, weights) {
  const w = validateWeights(weights);
  if (!comparison || !Array.isArray(comparison.cases) || comparison.cases.length !== 2 ||
    comparison.cases[0].degree !== 2 || comparison.cases[1].degree !== 3) {
    throw new TypeError('Expected an actual t=2 vs t=3 comparison');
  }
  const cases = comparison.cases.map(c => {
    if (![c.visits, c.comparisons].every(n=>Number.isSafeInteger(n) && n>=0)) throw new Error('Invalid observed metrics');
    return Object.freeze({
      degree:c.degree, nodeVisits:c.visits, keyComparisons:c.comparisons,
      nodeScore:c.visits*w.node, comparisonScore:c.comparisons*w.comparison,
      score:c.visits*w.node + c.comparisons*w.comparison,
      scenarioId:c.scenarioId,
    });
  });
  const delta = cases[1].score - cases[0].score;
  const winner = delta > 1e-9 ? 2 : delta < -1e-9 ? 3 : null;
  const dv=cases[1].nodeVisits-cases[0].nodeVisits;
  const dk=cases[1].keyComparisons-cases[0].keyComparisons;
  const tradeoff = dv*dk < 0;
  const conclusion = winner === null ? 'tie' : `t=${winner}`;
  return Object.freeze({
    weights:w, cases:Object.freeze(cases), winner, conclusion, delta, tradeoff,
    formula:'score = node_weight * node_visits + comparison_weight * key_comparisons',
    warning:'Teaching points only: not observed latency, disk operations, or a production index benchmark.',
    // Identify coefficients of score(t3)-score(t2) without assuming either case is better.
    coefficients:Object.freeze({visits:dv, comparisons:dk}),
  });
}

export function explainCost(result, lang='zh') {
  const n=result.coefficients.visits,k=result.coefficients.comparisons;
  const terms=`(${n} × ${result.weights.node}) + (${k} × ${result.weights.comparison}) = ${result.delta}`;
  if(lang==='en'){
    return `Δ score (t=3 − t=2) = ${terms}. ${result.winner===null?'Tie':`Lower hypothetical score: t=${result.winner}`}. ${result.tradeoff?'The metrics conflict: changing weights can reverse the preference.':'This query has no metrics tradeoff; positive weights cannot reverse dominance.'} Teaching points, not real time or I/O.`;
  }
  return `Δ 分值 (t=3 − t=2) = ${terms}。${result.winner===null?'两者持平':`假设分值更低：t=${result.winner}`}。${result.tradeoff?'两项计数存在权衡：修改权重可以反转结论。':'本次两项计数没有相反取舍：调整正权重无法反转优势。'}分值只是教学假设，不是实际耗时或 I/O。`;
}

/** Pure, repeatable reversal example. Can be rechecked without UI or network. */
export function verifiedTradeoffExample() {
  const comparison=createComparison(TRADEOFF_KEYS,7);
  const nodes=evaluateCost(comparison,WEIGHT_PRESETS.nodes);
  const keys=evaluateCost(comparison,WEIGHT_PRESETS.keys);
  const equal=evaluateCost(comparison,WEIGHT_PRESETS.balanced);
  if (!nodes.tradeoff || nodes.winner!==3 || keys.winner!==2 || equal.winner!==null) {
    throw new Error('Teaching counterexample ceased to satisfy its documented tradeoff');
  }
  return { comparison, nodes, keys, equal };
}
