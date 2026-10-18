/**
 * P4/P6 evidence graph. Typed, read-only, inspectable *claims* about a pedagogical
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
  { id:'C-COST', type:'claim', zh:'人为指定的访问权重和比较权重可以改变教学分值，不能改变同一查询的原始算法轨迹。', en:'Chosen visit and comparison weights can change the hypothetical score, not the underlying search trace.', status:'MODEL_TESTED' },
  { id:'C-SCENARIO', type:'claim', zh:'仅更改最小度数 t、保持同一插入序列，可观察由参数驱动的不同搜索路径。不同模型的节点访问量不代表实际 I/O 或速度。', en:'Changing only t while holding insertion order fixed can change the search path. Model visits are not disk I/O or real latency.', status:'MODEL_TESTED' },
  { id:'S-NIST', type:'source', zh:'NIST DADS：B-tree 定义。支持平衡多路树这一基本概念；不验证本站具体视觉效果。', en:'NIST DADS: B-tree. Supports the multiway balanced-tree concept, not the custom animation.', status:'PRIMARY_REFERENCE', href:'https://xlinux.nist.gov/dads/HTML/btree.html' },
  { id:'A-DEGREE', type:'assumption', zh:'可修改的教学约定：t=2 或 t=3；每节点最多 2t−1 个键、2t 个子节点。', en:'Variable teaching convention: t=2 or t=3, at most 2t−1 keys and 2t children per node.', status:'EXPLICIT_SIMPLIFICATION' },
  { id:'A-SAME-DATA', type:'assumption', zh:'两个案例输入相同、插入顺序相同且只包含唯一的安全整数。', en:'Both cases use the same unique safe-integer keys and identical insertion order.', status:'CONTROLLED_EXPERIMENT' },
  { id:'A-WEIGHTS', type:'assumption', zh:'成本分值仅为非负且非零的假设权重，不能宣称毫秒、存储 I/O 或产品优劣。', en:'Weights are nonnegative, nonzero, hypothetical teaching scores; no latency/I/O or product-performance claim.', status:'HYPOTHETICAL_ONLY' },
  { id:'A-NOT-IO', type:'assumption', zh:'节点访问、键比较只统计当前教学实现的步骤；不代表磁盘访问、墙钟耗时或任何生产数据库。', en:'Node visits and comparisons count this teaching algorithm only, not disk reads, elapsed time or production database performance.', status:'MEASUREMENT_BOUNDARY' },
  { id:'A-METAPHOR', type:'assumption', zh:'抽屉、卡片、通道只是机械隐喻，不是历史设备或数据库的实物照片。', en:'Cabinets, cards and rails are a metaphor, not historical or database hardware.', status:'SYNTHETIC' },
  { id:'A-SCOPE', type:'assumption', zh:'不模拟删除、磁盘 I/O、并发及 BOOK-ID-SEARCH 的实际内部实现。', en:'No deletion, disk I/O, concurrency or claim about BOOK-ID-SEARCH internals.', status:'OUT_OF_SCOPE' },
  { id:'M-TREE', type:'model', zh:'B-tree 不变量：键排序、容量约束、同深度叶子。', en:'B-tree invariant model: ordered keys, size bounds and equal leaf depths.', status:'CODE_AND_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/src/btree.js' },
  { id:'M-TRACE', type:'model', zh:'searchTrace 为每个节点比较、下钻、命中与未命中产生结构化事件。', en:'searchTrace produces structured visit, compare, descend, found and miss events.', status:'CODE_AND_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/src/btree.js' },
  { id:'M-COST', type:'model', zh:'纯函数 evaluateCost 使用实测轨迹事件计数和公开权重计算分数，不修改树和搜索事件。', en:'Pure evaluateCost multiplies counted trace events by explicit weights; no mutation of trees or events.', status:'CODE_AND_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/src/cost-model.js' },
  { id:'M-COMPARISON', type:'model', zh:'createComparison 在同一输入上重建 t=2 / t=3 的两棵树并比较真实检索轨迹。', en:'createComparison rebuilds t=2 / t=3 trees from identical inputs and compares their real search traces.', status:'CODE_AND_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/src/comparison.js' },
  { id:'V-COST', type:'visual', zh:'滑块与分值卡直接反映两组成本权重与两棵 B-tree 的真实访问/比较次数。', en:'Sliders and score cards show user-selected weights multiplied by actual visit/comparison counts.', status:'VISUAL_MAPPING' },
  { id:'V-COMPARISON', type:'visual', zh:'两张对照卡显示节点、层级、访问数、比较数、经过节点 ID 与模型编号；选择卡片即重新构造树。', en:'Two comparison cards display node counts, levels, visits, comparisons, visited IDs and version labels; selecting a case rebuilds the tree.', status:'VISUAL_MAPPING' },
  { id:'T-COST', type:'test', zh:'成本模型单元测试：偏好反转、持平、非负权重约束、同一轨迹与数据不变；附有交互测试。', en:'Cost tests: reversal, ties, input constraints, immutable traces/dataset and browser controls.', status:'AUTOMATED_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/tests/cost-model.test.mjs' },
  { id:'T-COMPARISON', type:'test', zh:'同输入跨 t 搜索等价、结构约束、可重复编号与实测计数测试。', en:'Tests for identical-query parity across t, invariants, deterministic IDs and real step counts.', status:'AUTOMATED_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/tests/comparison.test.mjs' },
  { id:'V-DRAWER', type:'visual', zh:'抽屉 = 单个 B-tree 节点；编号仅是合成模型的稳定节点 ID。', en:'Drawer = one B-tree node; IDs identify synthetic model nodes.', status:'VISUAL_MAPPING' },
  { id:'V-CARD', type:'visual', zh:'数字卡片 = 节点中的有序键；琥珀色表示当前比较。', en:'Numbered card = an ordered key; amber marks the current comparison.', status:'VISUAL_MAPPING' },
  { id:'V-RAIL', type:'visual', zh:'连接通道 = 父子引用；高亮表示本次轨迹选择的子节点。', en:'Rail = parent-child link; highlight indicates the child selected by the trace.', status:'VISUAL_MAPPING' },
  { id:'V-READOUT', type:'visual', zh:'状态读数、节点高亮由同一个 searchTrace 步骤派生。', en:'Text status and SVG highlight are projected from the same searchTrace step.', status:'VISUAL_MAPPING' },
  { id:'T-BTREE', type:'test', zh:'B-tree 单元测试：排序、深度、节点约束和搜索结果。', en:'B-tree tests: ordering, depth, node bounds and search results.', status:'AUTOMATED_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/tests/btree.test.mjs' },
  { id:'T-SCENE', type:'test', zh:'视图测试：轨迹事件与读数/高亮状态保持一致。', en:'View tests: trace events consistently drive readout and highlight.', status:'AUTOMATED_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/tests/scene.test.mjs' },
  { id:'T-PROOF', type:'test', zh:'证据关联测试：每个事件均有关联声明、来源、假设、模型、部件和测试。', en:'Evidence graph tests: every event is linked to a claim, source, assumption, model, visual and test.', status:'AUTOMATED_TEST', href:'https://github.com/conanxin/anatomy-evidence-lab/blob/feat/anatomy-btree-evidence/tests/evidence.test.mjs' },
]);

export const STEP_EVIDENCE = Object.freeze({
  cost: ['C-COST','S-NIST','A-WEIGHTS','A-NOT-IO','A-SAME-DATA','M-COST','V-COST','T-COST','T-PROOF'],
  scenario: ['C-SCENARIO','S-NIST','A-DEGREE','A-SAME-DATA','A-NOT-IO','M-COMPARISON','V-COMPARISON','T-COMPARISON','T-PROOF'],
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
  for (const kind of ['cost','scenario','idle','visit','compare','descend','found','miss']) {
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
  const override = {drawer:'visit',card:'compare',rail:'descend',status:'found',comparison:'scenario',cost:'cost'}[inspectPart];
  const key = override ?? stepType;
  const ids = STEP_EVIDENCE[key];
  if (!ids) throw new RangeError(`Unknown trace/evidence kind: ${key}`);
  const map = new Map(EVIDENCE_RECORDS.map(x=>[x.id,x]));
  return { stepType:key, inspectedPart:inspectPart, records:ids.map(id=>map.get(id)) };
}
