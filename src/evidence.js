/**
 * P4 evidence graph. Typed, read-only, inspectable *claims* about a pedagogical
 * model. A source can support an abstract definition without proving a chosen
 * animation or a real database implementation.
 *
 * Identity and relation IDs remain stable across UI and unit tests.
 */
export const EVIDENCE_RECORDS = Object.freeze([
  { id:'C-BALANCED', type:'claim', zh:'B-tree 是平衡的多路搜索树，所有叶子处于同一深度。', en:'A B-tree is a balanced multiway search tree; its leaves share a depth.', status:'SOURCE_SUPPORTED' },
  { id:'C-COMPARE', type:'claim', zh:'按有序键依次比较，在当前节点中确定命中或选择分支。', en:'Ordered keys determine a match or the next branch in the current node.', status:'MODEL_TESTED' },
  { id:'C-DESCEND', type:'claim', zh:'落在相邻键之间的查询值，只能继续检查对应范围的子节点。', en:'A query between adjacent keys continues into the corresponding child range.', status:'MODEL_TESTED' },
  { id:'C-RESULT', type:'claim', zh:'命中或未命中由真实检索步骤决定，不由图形动画预设。', en:'Hit or miss comes from the search trace, not a pre-scripted visual result.', status:'MODEL_TESTED' },
  { id:'S-NIST', type:'source', zh:'NIST DADS：B-tree 定义。支持平衡多路树这一基本概念；不验证本站具体视觉效果。', en:'NIST DADS: B-tree. Supports the multiway balanced-tree concept, not the custom animation.', status:'PRIMARY_REFERENCE', href:'https://xlinux.nist.gov/dads/HTML/btree.html' },
  { id:'A-DEGREE', type:'assumption', zh:'教学约定：最小度数 t=2；每节点至多 3 个键、至多 4 个子节点。', en:'Teaching convention: minimum degree t=2, at most 3 keys and 4 children per node.', status:'EXPLICIT_SIMPLIFICATION' },
  { id:'A-METAPHOR', type:'assumption', zh:'抽屉、卡片、通道只是机械隐喻，不是历史设备或数据库的实物照片。', en:'Cabinets, cards and rails are a metaphor, not historical or database hardware.', status:'SYNTHETIC' },
  { id:'A-SCOPE', type:'assumption', zh:'不模拟删除、磁盘 I/O、并发及 BOOK-ID-SEARCH 的实际内部实现。', en:'No deletion, disk I/O, concurrency or claim about BOOK-ID-SEARCH internals.', status:'OUT_OF_SCOPE' },
  { id:'M-TREE', type:'model', zh:'B-tree 不变量：键排序、容量约束、同深度叶子。', en:'B-tree invariant model: ordered keys, size bounds and equal leaf depths.', status:'CODE_AND_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/src/btree.js' },
  { id:'M-TRACE', type:'model', zh:'searchTrace 为每个节点比较、下钻、命中与未命中产生结构化事件。', en:'searchTrace produces structured visit, compare, descend, found and miss events.', status:'CODE_AND_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/src/btree.js' },
  { id:'V-DRAWER', type:'visual', zh:'抽屉 = 单个 B-tree 节点；编号仅是合成模型的稳定节点 ID。', en:'Drawer = one B-tree node; IDs identify synthetic model nodes.', status:'VISUAL_MAPPING' },
  { id:'V-CARD', type:'visual', zh:'数字卡片 = 节点中的有序键；琥珀色表示当前比较。', en:'Numbered card = an ordered key; amber marks the current comparison.', status:'VISUAL_MAPPING' },
  { id:'V-RAIL', type:'visual', zh:'连接通道 = 父子引用；高亮表示本次轨迹选择的子节点。', en:'Rail = parent-child link; highlight indicates the child selected by the trace.', status:'VISUAL_MAPPING' },
  { id:'V-READOUT', type:'visual', zh:'状态读数、节点高亮由同一个 searchTrace 步骤派生。', en:'Text status and SVG highlight are projected from the same searchTrace step.', status:'VISUAL_MAPPING' },
  { id:'T-BTREE', type:'test', zh:'B-tree 单元测试：排序、深度、节点约束和搜索结果。', en:'B-tree tests: ordering, depth, node bounds and search results.', status:'AUTOMATED_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/tests/btree.test.mjs' },
  { id:'T-SCENE', type:'test', zh:'视图测试：轨迹事件与读数/高亮状态保持一致。', en:'View tests: trace events consistently drive readout and highlight.', status:'AUTOMATED_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/tests/scene.test.mjs' },
  { id:'T-PROOF', type:'test', zh:'证据关联测试：每个事件均有关联声明、来源、假设、模型、部件和测试。', en:'Evidence graph tests: every event is linked to a claim, source, assumption, model, visual and test.', status:'AUTOMATED_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/tests/evidence.test.mjs' },
]);

export const STEP_EVIDENCE = Object.freeze({
  idle: ['C-BALANCED','S-NIST','A-DEGREE','A-METAPHOR','A-SCOPE','M-TREE','V-DRAWER','T-BTREE','T-PROOF'],
  visit: ['C-BALANCED','S-NIST','A-DEGREE','A-METAPHOR','A-SCOPE','M-TREE','V-DRAWER','T-BTREE','T-PROOF'],
  compare: ['C-COMPARE','S-NIST','A-DEGREE','A-METAPHOR','A-SCOPE','M-TRACE','V-CARD','T-BTREE','T-SCENE','T-PROOF'],
  descend: ['C-DESCEND','S-NIST','A-DEGREE','A-METAPHOR','A-SCOPE','M-TRACE','V-RAIL','T-BTREE','T-SCENE','T-PROOF'],
  found: ['C-RESULT','S-NIST','A-DEGREE','A-METAPHOR','A-SCOPE','M-TRACE','V-READOUT','T-BTREE','T-SCENE','T-PROOF'],
  miss: ['C-RESULT','S-NIST','A-DEGREE','A-METAPHOR','A-SCOPE','M-TRACE','V-READOUT','T-BTREE','T-SCENE','T-PROOF'],
});

export function validateEvidenceGraph(records = EVIDENCE_RECORDS, chains = STEP_EVIDENCE) {
  const kinds = new Set(['claim','source','assumption','model','visual','test']);
  const map = new Map();
  for (const r of records) {
    if (typeof r.id !== 'string' || !/^[A-Z]-[A-Z0-9-]+$/.test(r.id) || map.has(r.id)) throw new Error(`Invalid or duplicate evidence ID: ${r.id}`);
    if (!kinds.has(r.type) || !r.zh?.trim() || !r.en?.trim() || !r.status?.trim()) throw new Error(`Malformed evidence record ${r.id}`);
    if (r.href && (!r.href.startsWith('https://') || /\s/.test(r.href))) throw new Error(`Unsafe evidence URL in ${r.id}`);
    map.set(r.id, r);
  }
  for (const kind of ['idle','visit','compare','descend','found','miss']) {
    const chain = chains[kind];
    if (!Array.isArray(chain) || !chain.length) throw new Error(`Missing chain: ${kind}`);
    const types = new Set();
    for (const id of chain) {
      if (!map.has(id)) throw new Error(`Dangling evidence reference ${id} in ${kind}`);
      if (chain.indexOf(id) !== chain.lastIndexOf(id)) throw new Error(`Duplicate relation ${id} in ${kind}`);
      types.add(map.get(id).type);
    }
    for (const required of kinds) if (!types.has(required)) throw new Error(`Missing ${required} in ${kind}`);
    if (!chain.some(id => map.get(id).type === 'source' && map.get(id).href)) throw new Error(`No clickable primary reference in ${kind}`);
  }
  return {valid:true, records:map.size, chains:Object.keys(chains).length};
}

/** Returns an immutable-enough consumer copy: linked records are not mutated. */
export function evidenceFor(stepType = 'idle', inspectPart = null) {
  const override = {drawer:'visit',card:'compare',rail:'descend',status:'found'}[inspectPart];
  const key = override ?? stepType;
  const ids = STEP_EVIDENCE[key];
  if (!ids) throw new RangeError(`Unknown trace/evidence kind: ${key}`);
  const map = new Map(EVIDENCE_RECORDS.map(x=>[x.id,x]));
  return { stepType:key, inspectedPart:inspectPart, records:ids.map(id=>map.get(id)) };
}
