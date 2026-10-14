/** Pure view state and bilingual readouts; the DOM/SVG never invent an algorithm step. */
export function frameFor(trace, index) {
  if (!trace?.steps?.length) return { index: -1, total: 0, step: null, activeNodeId: null, comparedKey: null, childId: null, found: null };
  const safe = Math.max(0, Math.min(trace.steps.length - 1, Math.trunc(index)));
  const step = trace.steps[safe];
  return {
    index: safe, total: trace.steps.length, step,
    activeNodeId: step.nodeId,
    comparedKey: step.comparedKey ?? null,
    childId: step.childId ?? null,
    found: step.type === 'found' ? true : step.type === 'miss' ? false : null,
  };
}

export function readout(frame, lang = 'zh') {
  if (!frame.step) return lang === 'zh' ? '输入整数，观察索引逐层检索。' : 'Enter an integer to trace the index lookup.';
  const s = frame.step;
  const pre = lang === 'zh' ? `步骤 ${frame.index + 1}/${frame.total} · ` : `Step ${frame.index + 1}/${frame.total} · `;
  if (lang === 'en') {
    switch (s.type) {
      case 'visit': return pre + `Open drawer #${s.nodeId} [${s.nodeKeys.join(', ')}].`;
      case 'compare': return pre + `Compare ${s.key} with ${s.comparedKey}: ${s.relation}.`;
      case 'descend': return pre + `Follow corridor ${s.childIndex + 1} to drawer #${s.childId}.`;
      case 'found': return pre + `Found ${s.key} in drawer #${s.nodeId}.`;
      case 'miss': return pre + `${s.key} not found. The leaf has no matching key.`;
    }
  }
  switch (s.type) {
    case 'visit': return pre + `打开抽屉 #${s.nodeId} [${s.nodeKeys.join('、')}]。`;
    case 'compare': return pre + `比较 ${s.key} 与 ${s.comparedKey}：${{equal:'相等',less:'目标较小',greater:'目标较大'}[s.relation]}。`;
    case 'descend': return pre + `沿第 ${s.childIndex + 1} 条通道进入抽屉 #${s.childId}。`;
    case 'found': return pre + `在抽屉 #${s.nodeId} 中命中 ${s.key}。`;
    case 'miss': return pre + `未命中 ${s.key}：已到达叶节点。`;
  }
  throw new TypeError(`Unknown trace step type: ${s.type}`);
}

/** This projection can be independently unit-tested and compared to SVG attributes. */
export function highlightModel(layout, frame) {
  const ids = new Set(layout.nodes.map(node => node.id));
  const status = frame.found === true ? 'found' : frame.found === false ? 'miss' : 'searching';
  return {
    status,
    activeNodeId: ids.has(frame.activeNodeId) ? frame.activeNodeId : null,
    childId: ids.has(frame.childId) ? frame.childId : null,
    comparedKey: frame.comparedKey,
    step: frame.step,
  };
}
