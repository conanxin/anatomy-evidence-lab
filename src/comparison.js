/**
 * P5 / Comparisons of explicit pedagogical B-tree assumptions.
 * Same insertion order and lookup for t=2 and t=3. Metrics count only the
 * implemented in-memory search's node visits and key comparisons; they are
 * NOT disk reads, wall-clock latency or a particular database's behavior.
 */
import { DEFAULT_KEYS, fromKeys, searchTrace, validateTree } from './btree.js';

export const COMPARED_DEGREES = Object.freeze([2, 3]);

export function validateDataset(keys) {
  if (!Array.isArray(keys) || keys.length > 400 || !keys.length || keys.some(key => !Number.isSafeInteger(key))) {
    throw new TypeError('Dataset must contain 1 to 400 safe integer keys');
  }
  if (new Set(keys).size !== keys.length) throw new RangeError('Comparison input cannot contain duplicate keys');
  return [...keys];
}

function tinyFingerprint(text) {
  // A quick UI version label, explicitly not a cryptographic integrity digest.
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function scenarioId(keys, query, degree) {
  if (!Number.isSafeInteger(query) || !COMPARED_DEGREES.includes(degree)) {
    throw new RangeError('Scenario query/degree invalid');
  }
  return `BT-${degree}-${tinyFingerprint(JSON.stringify({ keys: validateDataset(keys), query, degree }))}`;
}

export function createComparison(keys = DEFAULT_KEYS, query = 24) {
  const dataset = validateDataset(keys);
  if (!Number.isSafeInteger(query)) throw new TypeError('Lookup must be a safe integer');
  const cases = COMPARED_DEGREES.map(degree => {
    const tree = fromKeys(dataset, degree);
    const stats = validateTree(tree);
    const trace = searchTrace(tree, query);
    const visits = trace.steps.filter(step => step.type === 'visit').length;
    const comparisons = trace.steps.filter(step => step.type === 'compare').length;
    const descents = trace.steps.filter(step => step.type === 'descend').length;
    if (descents !== visits - 1) throw new Error('Trace visit/descent invariant failed');
    return {
      degree,
      scenarioId: scenarioId(dataset, query, degree),
      tree,
      trace,
      stats,
      visits,
      comparisons,
      descents,
      found: trace.found,
      visitedNodeIds: trace.steps.filter(step => step.type === 'visit').map(step => step.nodeId),
    };
  });
  if (cases[0].found !== cases[1].found) throw new Error('Identical lookup disagrees across degree assumptions');
  return {
    keys: dataset,
    query,
    cases,
    difference: {
      nodeVisits: cases[1].visits - cases[0].visits,
      comparisons: cases[1].comparisons - cases[0].comparisons,
      height: cases[1].stats.height - cases[0].stats.height,
    },
    scope: 'Search path through an in-memory teaching B-tree; not I/O, latency, or BOOK-ID-SEARCH internals.',
  };
}

export function describeComparison(comparison, lang = 'zh') {
  const [two, three] = comparison.cases;
  const d = comparison.difference;
  const fmt = n => (n > 0 ? `+${n}` : String(n));
  if (lang === 'en') {
    return `For key ${comparison.query}, t=3 vs t=2: ${fmt(d.nodeVisits)} visited nodes, ${fmt(d.comparisons)} key comparisons and ${fmt(d.height)} tree levels. Both ${two.found ? 'find' : 'miss'} the key. These are model counts, not disk I/O or speed.`;
  }
  return `同样查找 ${comparison.query}：t=3 相比 t=2，访问节点 ${fmt(d.nodeVisits)}、键比较 ${fmt(d.comparisons)}、树层数 ${fmt(d.height)}。两者均${two.found ? '命中' : '未命中'}。这些是模型计数，不是磁盘 I/O 或实际速度。`;
}
