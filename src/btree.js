/**
 * Pedagogical B-tree with minimum degree t >= 2 and *unique integer* keys.
 * Source for the basic data structure: NIST DADS, https://xlinux.nist.gov/dads/HTML/btree.html
 * Order conventions differ between textbooks; here maxChildren=2t and maxKeys=2t-1.
 * No deletion, storage pages or concurrency are modeled.
 */
export const DEFAULT_KEYS = Object.freeze([
  18, 12, 6, 30, 42, 4, 8, 16, 24, 36, 54, 2, 10,
  14, 20, 26, 32, 40, 48, 58, 60, 22, 28, 34, 50,
]);

export function createTree(t = 2) {
  if (!Number.isInteger(t) || t < 2) throw new RangeError('Minimum degree t must be >= 2');
  const tree = { t, root: null, size: 0, nextId: 1 };
  tree.root = makeNode(tree, true);
  return tree;
}

function makeNode(tree, leaf) {
  return { id: tree.nextId++, leaf, keys: [], children: [] };
}

function assertKey(key) {
  if (!Number.isSafeInteger(key)) throw new TypeError('Key must be a safe integer');
}

export function search(tree, key) {
  assertKey(key);
  let node = tree.root;
  while (node) {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && key === node.keys[i]) return { found: true, nodeId: node.id, keyIndex: i };
    node = node.leaf ? null : node.children[i];
  }
  return { found: false, nodeId: null, keyIndex: -1 };
}

function splitChild(tree, parent, index) {
  const t = tree.t;
  const left = parent.children[index];
  const right = makeNode(tree, left.leaf);
  const promoted = left.keys[t - 1];
  right.keys = left.keys.splice(t);        // all keys after the promoted median
  left.keys.pop();                        // remove promoted median from left
  if (!left.leaf) right.children = left.children.splice(t);
  parent.keys.splice(index, 0, promoted);
  parent.children.splice(index + 1, 0, right);
}

function insertNonfull(tree, node, key) {
  let i = node.keys.length - 1;
  if (node.leaf) {
    while (i >= 0 && key < node.keys[i]) i--;
    node.keys.splice(i + 1, 0, key);
    return;
  }
  while (i >= 0 && key < node.keys[i]) i--;
  i++;
  if (node.children[i].keys.length === 2 * tree.t - 1) {
    splitChild(tree, node, i);
    if (key > node.keys[i]) i++;
  }
  insertNonfull(tree, node.children[i], key);
}

export function insert(tree, key) {
  assertKey(key);
  if (search(tree, key).found) return { inserted: false, duplicate: true };
  const root = tree.root;
  if (root.keys.length === 2 * tree.t - 1) {
    const nextRoot = makeNode(tree, false);
    nextRoot.children.push(root);
    tree.root = nextRoot;
    splitChild(tree, nextRoot, 0);
  }
  insertNonfull(tree, tree.root, key);
  tree.size++;
  return { inserted: true, duplicate: false };
}

export function fromKeys(keys = DEFAULT_KEYS, t = 2) {
  const tree = createTree(t);
  for (const key of keys) insert(tree, key);
  return tree;
}

/** Pure structural audit. Throws on inconsistent content or structure. */
export function validateTree(tree) {
  if (!tree?.root || !Number.isInteger(tree.t) || tree.t < 2) throw new Error('Invalid tree');
  const depths = new Set();
  const ids = new Set();
  let total = 0;
  let count = 0;
  const visit = (node, depth, low, high, root = false) => {
    if (ids.has(node.id)) throw new Error(`Repeated node id ${node.id}`);
    ids.add(node.id);
    count++;
    if (node.keys.length > 2 * tree.t - 1 || (!root && node.keys.length < tree.t - 1) || (root && !node.leaf && node.keys.length < 1)) {
      throw new Error(`Node ${node.id} key count violates B-tree bounds`);
    }
    for (let i = 0; i < node.keys.length; i++) {
      const key = node.keys[i];
      if (!Number.isSafeInteger(key) || key <= low || key >= high || (i > 0 && key <= node.keys[i - 1])) {
        throw new Error(`Node ${node.id} ordering/range violation`);
      }
    }
    total += node.keys.length;
    if (node.leaf) {
      if (node.children.length !== 0) throw new Error(`Leaf ${node.id} has children`);
      depths.add(depth);
    } else {
      if (node.children.length !== node.keys.length + 1) throw new Error(`Node ${node.id} has invalid child count`);
      for (let i = 0; i < node.children.length; i++) {
        visit(node.children[i], depth + 1, i === 0 ? low : node.keys[i - 1], i === node.keys.length ? high : node.keys[i]);
      }
    }
  };
  visit(tree.root, 0, -Infinity, Infinity, true);
  if (depths.size !== 1) throw new Error('Leaves at unequal depths');
  if (total !== tree.size) throw new Error(`Size mismatch: ${total} vs ${tree.size}`);
  return { valid: true, height: [...depths][0] + 1, nodes: count, keys: total, leafDepth: [...depths][0] };
}

/** Every step is an inspectable snapshot of the algorithm's decision at a node. */
export function searchTrace(tree, key) {
  assertKey(key);
  const steps = [];
  let node = tree.root;
  const add = (type, extra = {}) => steps.push({ type, nodeId: node.id, key, ...extra });
  while (true) {
    add('visit', { nodeKeys: [...node.keys] });
    let i = 0;
    while (i < node.keys.length) {
      const current = node.keys[i];
      const relation = key === current ? 'equal' : key < current ? 'less' : 'greater';
      add('compare', { keyIndex: i, comparedKey: current, relation });
      if (relation === 'equal') {
        add('found', { keyIndex: i, comparedKey: current });
        return { key, found: true, nodeId: node.id, steps };
      }
      if (relation === 'less') break;
      i++;
    }
    if (node.leaf) {
      add('miss', { insertionSlot: i });
      return { key, found: false, nodeId: null, steps };
    }
    const next = node.children[i];
    add('descend', { childIndex: i, childId: next.id });
    node = next;
  }
}

/** Stable, planar cabinet layout: parent is centered above its children. */
export function layoutTree(tree) {
  const nodes = [];
  const edges = [];
  let leafIndex = 0;
  const xGap = 174;
  const yGap = 178;
  const descend = (node, depth) => {
    let x;
    if (node.leaf) x = (leafIndex++ + 0.5) * xGap;
    else {
      const positions = node.children.map(child => {
        const p = descend(child, depth + 1);
        edges.push({ from: node.id, to: child.id });
        return p;
      });
      x = (positions[0] + positions.at(-1)) / 2;
    }
    nodes.push({ id: node.id, x, y: 100 + depth * yGap, depth, leaf: node.leaf, keys: [...node.keys] });
    return x;
  };
  descend(tree.root, 0);
  const width = Math.max(720, Math.ceil(leafIndex * xGap + 100));
  const height = Math.max(420, 100 + (validateTree(tree).height - 1) * yGap + 170);
  return { nodes, edges, width, height };
}
