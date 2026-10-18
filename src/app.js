import { createTree, fromKeys, insert, validateTree, searchTrace, layoutTree, DEFAULT_KEYS } from './btree.js';
import { frameFor, readout, highlightModel } from './scene.js';
import { evidenceFor, validateEvidenceGraph } from './evidence.js';
import { createComparison, describeComparison, COMPARED_DEGREES } from './comparison.js';
import { PRESETS, WEIGHT_PRESETS, validateWeights, evaluateCost, explainCost } from './cost-model.js';
import { LEARNING_QUESTIONS, gradeQuiz } from './learning.js';

const NS = 'http://www.w3.org/2000/svg';
const byId = id => document.getElementById(id);
const state = { keys: [...DEFAULT_KEYS], degree: 2, lastQuery: 24, tree: fromKeys(), comparison: null, trace: null, index: 0, lang: 'zh', timer: null, layout: null, inspectPart: null, inspectTarget: '', costWeights:WEIGHT_PRESETS.nodes, datasetPreset:'baseline' };
validateEvidenceGraph();
const texts = {
  zh: { hero:'一座能够解释搜索的档案柜', subtitle:'真实 B-tree 算法 · 轴测机械示意 · 证据与假设可追踪', query:'检索整数', degree:'当前模型的最小度数', degreeHint:'切换度数会按相同插入顺序，使用同一组整数重新建树。', comparisonHeading:'更改假设，比较两棵树', comparisonIntro:'固定同一组整数和插入顺序，仅改变最小度数 t。点击不同案例，机械模型随之重新计算。', comparisonEvidence:'查看参数证据', comparisonBoundary:'访问节点数、键比较数并非磁盘 I/O 或真实性能。模型编号是非加密的界面标识，不是证据校验哈希。', search:'开始检索', insert:'插入卡片', previous:'上一步', next:'下一步', autoplay:'自动播放', pause:'暂停', reset:'恢复初始档案', records:'卡片', drawers:'抽屉', levels:'层级', gate:'算法门槛', sources:'来源与假设', explain:'每张抽屉是一个 B-tree 节点。比较档案号，再沿正确的子节点通道下降。动画只反映真实搜索轨迹。', idle:'请开始一次检索。', error:'请输入安全范围内的整数。', duplicate:'该整数已存在，未重复插入。', inserted:'卡片已插入，B-tree 已重新平衡。', status:'状态：' },
  en: { hero:'An archive cabinet that explains search', subtitle:'Real B-tree algorithm · isometric machine · inspectable evidence', query:'Look up integer', degree:'Minimum degree of the active model', degreeHint:'Switching t rebuilds both models from the same keys, in the same insertion order.', comparisonHeading:'Change an assumption. Compare two trees.', comparisonIntro:'Hold the ordered input dataset fixed and vary only minimum degree t. Choose a case to rebuild the machine.', comparisonEvidence:'Inspect parameter evidence', comparisonBoundary:'Node visits and comparisons do not measure disk I/O or real latency. Scenario IDs are non-cryptographic UI labels, not integrity proofs.', search:'Search', insert:'Insert card', previous:'Previous', next:'Next', autoplay:'Autoplay', pause:'Pause', reset:'Reset archive', records:'Cards', drawers:'Drawers', levels:'Levels', gate:'Invariant gate', sources:'Sources & assumptions', explain:'Each drawer is a B-tree node. Compare the file number and descend through the correct corridor. Every motion comes from a real search trace.', idle:'Start a search.', error:'Enter a safe integer.', duplicate:'This key already exists; no duplicate inserted.', inserted:'Card inserted; B-tree rebalanced.', status:'Status: ' },
};

function svg(tag, attrs = {}, content) {
  const elem = document.createElementNS(NS, tag);
  for (const [name, value] of Object.entries(attrs)) elem.setAttribute(name, String(value));
  if (content !== undefined) elem.textContent = String(content);
  return elem;
}
const append = (parent, tag, attrs, content) => { const item = svg(tag, attrs, content); parent.append(item); return item; };
function stop() { if (state.timer !== null) clearInterval(state.timer); state.timer = null; }
function describe(stats) {
  byId('drawing-note').textContent = `MINIMUM DEGREE t = ${state.degree} · SYNTHETIC DATA`;
  byId('stats').textContent = `${texts[state.lang].records}: ${stats.keys}  ·  ${texts[state.lang].drawers}: ${stats.nodes}  ·  ${texts[state.lang].levels}: ${stats.height}`;
  byId('gate').textContent = `${texts[state.lang].gate}: PASS`;
}
function renderComparison() {
  const comparison = createComparison(state.keys, state.lastQuery);
  state.comparison = comparison;
  const zh = state.lang === 'zh';
  for (const scenario of comparison.cases) {
    const card = byId(`case-${scenario.degree}`);
    card.replaceChildren();
    const header = document.createElement('strong'); header.textContent = `t = ${scenario.degree}`;
    const metrics = document.createElement('small');
    metrics.textContent = zh
      ? `${scenario.stats.keys} 键 · ${scenario.stats.nodes} 节点 · ${scenario.stats.height} 层 · 访问 ${scenario.visits} 节点 · 比较 ${scenario.comparisons} 次`
      : `${scenario.stats.keys} keys · ${scenario.stats.nodes} nodes · ${scenario.stats.height} levels · ${scenario.visits} visits · ${scenario.comparisons} comparisons`;
    const path = document.createElement('div'); path.className = 'case-path';
    path.textContent = `${zh ? '检索节点' : 'Visit path'}: ${scenario.visitedNodeIds.map(id => `#${id}`).join(' → ')}`;
    card.append(header, metrics, path);
    card.setAttribute('aria-pressed', String(state.degree === scenario.degree));
    card.setAttribute('aria-label', `${header.textContent}. ${metrics.textContent}`);
    card.dataset.scenarioId = scenario.scenarioId;
    card.dataset.visits = String(scenario.visits);
    card.dataset.comparisons = String(scenario.comparisons);
    card.dataset.found = String(scenario.found);
  }
  byId('comparison-result').textContent = describeComparison(comparison, state.lang);
  byId('comparison-version').textContent = comparison.cases.map(c => c.scenarioId).join('  /  ');
  renderCost();
}
function renderCost(){
  const data=evaluateCost(state.comparison,state.costWeights);
  byId('weight-node').value=String(state.costWeights.node);
  byId('weight-compare').value=String(state.costWeights.comparison);
  byId('weight-node-value').textContent=String(state.costWeights.node);
  byId('weight-compare-value').textContent=String(state.costWeights.comparison);
  for(const c of data.cases){
    const card=byId(`cost-case-${c.degree}`);
    card.dataset.score=String(c.score);
    card.dataset.visits=String(c.nodeVisits);
    card.dataset.comparisons=String(c.keyComparisons);
    card.dataset.lower=String(data.winner===c.degree || data.winner===null);
    byId(`cost-value-${c.degree}`).textContent=String(c.score);
    byId(`cost-math-${c.degree}`).textContent=`(${c.nodeVisits} × ${data.weights.node}) + (${c.keyComparisons} × ${data.weights.comparison}) = ${c.score}`;
  }
  byId('cost-lab').dataset.winner=data.winner===null?'tie':`t${data.winner}`;
  byId('cost-lab').dataset.tradeoff=String(data.tradeoff);
  byId('cost-verdict').textContent=explainCost(data,state.lang);
  byId('cost-version').textContent=`DATASET: ${state.datasetPreset} · QUERY: ${state.lastQuery} · Δ(t3−t2): ${data.delta}`;
  for(const [key,preset] of Object.entries(PRESETS)) byId(`dataset-${key}`).setAttribute('aria-pressed',String(state.datasetPreset===key));
  for(const [key,weights] of Object.entries(WEIGHT_PRESETS))byId(`regime-${key}`).setAttribute('aria-pressed',String(weights.node===state.costWeights.node && weights.comparison===state.costWeights.comparison));
}
function setWeights(nextWeights){state.costWeights=validateWeights(nextWeights);renderCost();}
function changeDataset(id){
  if(!PRESETS[id])throw new RangeError('Unknown teaching dataset preset');
  stop();state.inspectPart=null;state.inspectTarget='';state.datasetPreset=id;
  state.keys=[...PRESETS[id].keys];state.lastQuery=PRESETS[id].query;state.degree=2;state.trace=null;state.index=0;
  state.tree=fromKeys(state.keys,state.degree);byId('degree').value='2';byId('query').value=String(state.lastQuery);
  drawMachine();renderComparison();
}
function buildQuiz(){
  const root=byId('study-questions');root.replaceChildren();
  LEARNING_QUESTIONS.forEach((q,i)=>{
    const box=document.createElement('div');box.className='study-question';
    const label=document.createElement('label');label.htmlFor=`study-q-${i}`;label.textContent=`${i+1}. ${q[state.lang]}`;
    const select=document.createElement('select');select.id=`study-q-${i}`;select.name=q.id;
    const empty=document.createElement('option');empty.value='';empty.textContent=state.lang==='zh'?'选择答案':'Choose an answer';select.append(empty);
    for(const op of q.options){const item=document.createElement('option');item.value=op.value;item.textContent=op[state.lang];select.append(item);}
    box.append(label,select);root.append(box);
  });
}
function handleQuiz(event){
  event.preventDefault();
  const answers={};for(let i=0;i<LEARNING_QUESTIONS.length;i++)answers[LEARNING_QUESTIONS[i].id]=byId(`study-q-${i}`).value;
  const score=gradeQuiz(answers);
  byId('study-score').textContent=state.lang==='zh'?`自测：${score.correct}/${score.total}；已答 ${score.answered}/${score.total}。未收集参与者数据，不证明教学有效性。`:`Self-check: ${score.correct}/${score.total}, answered ${score.answered}/${score.total}. No participant data collected, no teaching-effect claim.`;
  byId('study-score').dataset.correct=String(score.correct);
}
function localizeP6(){
 const en=state.lang==='en';
 const labels=en ? {
  heading:'Change the cost assumptions. Can the conclusion reverse?',intro:'Keep the B-tree trace unchanged and adjust fictional score weights. Compare the baseline and an authentic metric-tradeoff counterexample.',
  baseline:'25 integers · baseline',tradeoff:'42 integers · metric tradeoff',node:'Fictional points per visited node',key:'Fictional points per key comparison',nodes:'Visits costly (5 : 1)',keys:'Comparisons costly (1 : 5)',equal:'Equal weights (1 : 1)',formula:'Teaching score = node visits × visit weight + key comparisons × comparison weight',evidence:'Inspect the cost assumption chain',boundary:'These scores are imaginary teaching points—not milliseconds, disk I/O, actual costs or BOOK-ID-SEARCH performance. Moving a weight slider cannot alter B-tree traces.',study:'Comprehension self-check, not an aesthetic rating',studyIntro:'This is a question toolkit, not a completed participant study. A real A/B study must separate static and interactive participants, use identical items and record actual responses.',sheetLabel:'Read the equivalent static control material',sheet:'B-trees are balanced multiway search trees. Baseline query 24: t=2 makes 2 visits and 4 comparisons; t=3 makes 3 visits and 6 comparisons. Tradeoff query 7: t=2 makes 4 visits and 5 comparisons; t=3 makes 3 visits and 6 comparisons. Teaching score = node visits × visit weight + key comparisons × comparison weight. Weights do not change search behavior or measure hardware.',submit:'Check understanding'} : {
  heading:'当假设改变，结论也可能改变',intro:'固定每组的真实 B-tree 搜索路径，只调整人为设定的成本权重。先比较常规数据，再打开指标权衡反例。',baseline:'25 个整数 · 常规案例',tradeoff:'42 个整数 · 权衡反例',node:'访问每个节点的假想分值',key:'每次键比较的假想分值',nodes:'访问较贵（5 : 1）',keys:'比较较贵（1 : 5）',equal:'相同权重（1 : 1）',formula:'教学分值 = 节点访问数 × 节点权重 + 键比较次数 × 比较权重',evidence:'检查成本假设的证据链',boundary:'分值只是人为选择的教学权重，不是毫秒、磁盘 I/O、实际费用或 BOOK-ID-SEARCH 性能。权重不会修改树结构和轨迹。',study:'知识理解自测：测理解，不评价外观',studyIntro:'这是尚未用于正式受试者研究的题目工具。若开展实验，必须分开呈现静态/互动材料、使用同一组问题，并记录真实回答。',sheetLabel:'查看供静态组阅读的等价文字材料',sheet:'B-tree 是多路平衡搜索树。常规数据查询 24：t=2 访问 2 节点、比较 4 次；t=3 访问 3 节点、比较 6 次。反例数据查询 7：t=2 访问 4 节点、比较 5 次；t=3 访问 3 节点、比较 6 次。教学分值 = 访问节点数 × 节点权重 + 键比较次数 × 比较权重。权重不修改检索过程，也不是真实硬件性能。',submit:'检查理解结果'};
 const ids={ 'cost-heading':'heading','cost-intro':'intro','dataset-baseline':'baseline','dataset-tradeoff':'tradeoff','label-node-weight':'node','label-compare-weight':'key','regime-nodes':'nodes','regime-keys':'keys','regime-balanced':'equal','cost-formula':'formula','cost-evidence':'evidence','cost-boundary':'boundary','study-heading':'study','study-intro':'studyIntro','study-sheet-label':'sheetLabel','study-sheet':'sheet','study-submit':'submit' };
 for(const [id,k] of Object.entries(ids))byId(id).textContent=labels[k];
 buildQuiz();byId('study-score').textContent=en?'No answers saved or sent.':'尚无测验结果；页面不会保存或发送回答。';
}

function setDegree(degree) {
  if (!COMPARED_DEGREES.includes(degree)) throw new RangeError('Unsupported pedagogical degree');
  stop(); state.degree = degree; state.inspectPart = null; state.inspectTarget = '';
  byId('degree').value = String(degree);
  state.tree = fromKeys(state.keys, degree);
  state.trace = searchTrace(state.tree, state.lastQuery);
  state.index = 0;
  drawMachine();
  renderComparison();
}
function drawNode(canvas, node) {
  const g = append(canvas, 'g', { class:'drawer', 'data-node-id': node.id, transform:`translate(${node.x},${node.y})`, tabindex:0, 'data-evidence-part':'drawer' });
  // A small 2.5D filing cabinet: top, flank and face, with brass trim.
  append(g, 'path', { d:'M -64 -26 L -40 -49 L 70 -49 L 49 -26 Z', class:'cabinet-top' });
  append(g, 'path', { d:'M 49 -26 L 70 -49 L 70 15 L 49 39 Z', class:'cabinet-side' });
  append(g, 'rect', { x:-64, y:-26, width:113, height:65, rx:6, class:'cabinet-front' });
  append(g, 'path', { d:'M -58 -10 H 41 M -58 20 H 41', class:'cabinet-detail' });
  append(g, 'rect', { x:-56, y:-19, width:94, height:11, rx:2, class:'drawer-slot' });
  append(g, 'text', { x:-50, y:-10.5, class:'drawer-id' }, `N${node.id}  ·  ${node.leaf ? 'LEAF':'INDEX'}`);
  const count = node.keys.length;
  const w = Math.min(30, 94 / Math.max(count, 1) - 2);
  node.keys.forEach((key, i) => {
    const x = -53 + (i + .5) * (95 / count);
    append(g, 'rect', { x:x-w/2, y:1, width:w, height:19, rx:2, class:'file-card', 'data-key':key, 'data-evidence-part':'card', tabindex:0, role:'button', 'aria-label':`Inspect evidence for key ${key}` });
    append(g, 'text', { x, y:14, 'text-anchor':'middle', class:'file-number' }, key);
  });
  append(g, 'circle', { cx:-55, cy:31, r:2.2, class:'brass-screw' });
  append(g, 'circle', { cx:40, cy:31, r:2.2, class:'brass-screw' });
  const handle = append(g, 'rect', { x:-12, y:27, width:24, height:7, rx:3, class:'drawer-handle' });
  g.setAttribute('role','group');
  g.setAttribute('aria-label',`Inspect evidence for drawer ${node.id}: ${node.keys.join(', ')}`);
}
function drawMachine() {
  state.layout = layoutTree(state.tree);
  const { nodes, edges, width, height } = state.layout;
  const canvas = byId('machine');
  canvas.replaceChildren();
  canvas.setAttribute('viewBox', `0 0 ${width} ${height}`);
  canvas.style.width = `${Math.max(750,width)}px`;
  canvas.setAttribute('aria-label', 'A B-tree represented as layered archive drawers');
  const background = append(canvas, 'g', {class:'machine-grid'});
  for(let x=0;x<width;x+=87) append(background,'path',{d:`M ${x} 40 V ${height-30}`});
  for(let y=40;y<height;y+=89) append(background,'path',{d:`M 20 ${y} H ${width-20}`});
  const railLayer = append(canvas,'g',{class:'rail-layer'});
  edges.forEach(edge => {
    const start = nodes.find(n=>n.id===edge.from), end=nodes.find(n=>n.id===edge.to);
    const midY = (start.y+end.y)/2;
    append(railLayer,'path',{ d:`M ${start.x} ${start.y+40} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y-48}`, class:'rail', 'data-child-id':edge.to, 'data-evidence-part':'rail', tabindex:0, role:'button', 'aria-label':`Inspect evidence for rail to node ${edge.to}` });
  });
  const drawerLayer=append(canvas,'g',{class:'drawers'});
  nodes.slice().sort((a,b)=>a.depth-b.depth||a.x-b.x).forEach(n=>drawNode(drawerLayer,n));
  describe(validateTree(state.tree));
  renderFrame();
  const scroll = document.querySelector('.canvas-scroller');
  if (window.matchMedia('(max-width: 760px)').matches) {
    const root = nodes.find(n => n.depth === 0);
    if (root) scroll.scrollLeft = Math.max(0, root.x - scroll.clientWidth / 2);
  }
}
/** Trace-step, mechanical part, source citation and test form a single inspectable chain. */
function renderEvidence(frame) {
  const chain=evidenceFor(frame.step?.type ?? 'idle',state.inspectPart);
  const lang=state.lang, section=byId('evidence-records');
  const labels={zh:{source:'一手来源',assumption:'显式假设',model:'模型代码',visual:'可视部件',test:'自动化测试',inspect:'检查部件',current:'当前轨迹',back:'返回当前步骤',heading:'这一步为何如此运动？',hint:'点击抽屉、数字卡片或连接通道，查看每个视觉元素的模型和证据。',boundary:'证据边界：NIST 说明 B-tree 的基本概念，不验证这个档案柜隐喻，更不证明 BOOK-ID-SEARCH 的内部实现。'},en:{source:'Primary reference',assumption:'Explicit assumption',model:'Model code',visual:'Visual part',test:'Automated test',inspect:'Inspecting part',current:'Current trace',back:'Return to current step',heading:'Why does this part move?',hint:'Click a drawer, numbered card or rail to inspect its model, assumptions, source and tests.',boundary:'Evidence boundary: NIST documents general B-tree concepts, not this cabinet metaphor or BOOK-ID-SEARCH internals.'}};
  const v=labels[lang], primary=chain.records.find(r=>r.type==='claim');
  byId('trace-evidence-heading').textContent=v.heading;
  byId('trace-evidence-hint').textContent=v.hint;
  byId('evidence-boundary').textContent=v.boundary;
  byId('evidence-follow').textContent=v.back;
  byId('evidence-follow').hidden=!state.inspectPart;
  byId('evidence-selection').textContent=state.inspectPart ? `${v.inspect}: ${state.inspectPart.toUpperCase()} ${state.inspectTarget}` : `${v.current}: ${frame.step?.type?.toUpperCase() ?? 'IDLE'} ${frame.step ? frame.index+1+'/'+frame.total : ''}`;
  byId('trace-evidence').dataset.stepType=chain.stepType;
  byId('evidence-claim').textContent=primary[lang];
  byId('evidence-claim').dataset.claimId=primary.id;
  section.replaceChildren();
  for(const rec of chain.records.filter(r=>r.type!=='claim')){
    const article=document.createElement('article');
    article.className='proof-record proof-'+rec.type;
    article.dataset.evidenceId=rec.id;
    const head=document.createElement('div');head.className='proof-head';
    const code=document.createElement('span');code.textContent=rec.id+' · '+v[rec.type];
    const status=document.createElement('small');status.textContent=rec.status.replaceAll('_',' ');
    head.append(code,status);article.append(head);
    const description=document.createElement('p');description.textContent=rec[lang];article.append(description);
    if(rec.href){const link=document.createElement('a');link.href=rec.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=lang==='zh'?'核对原始出处 ↗':'Inspect source ↗';article.append(link);}
    section.append(article);
  }
}
function inspectDiagramPart(target){
  const element=target.closest('[data-evidence-part]');
  if(!element)return;
  const kind=element.dataset.evidencePart;
  state.inspectPart=kind;
  state.inspectTarget=kind==='rail' ? `N${element.dataset.childId}` : kind==='card' ? `${element.dataset.key}` : `N${element.dataset.nodeId}`;
  renderEvidence(frameFor(state.trace,state.index));
}
function followTrace(){state.inspectPart=null;state.inspectTarget='';renderEvidence(frameFor(state.trace,state.index));}

function renderFrame() {
  const frame=frameFor(state.trace,state.index);
  const projection=highlightModel(state.layout,frame);
  for(const g of byId('machine').querySelectorAll('.drawer')) {
    const selected=Number(g.dataset.nodeId)===projection.activeNodeId;
    g.classList.toggle('active',selected);
    g.classList.toggle('found',selected && projection.status==='found');
    g.classList.toggle('miss',selected && projection.status==='miss');
    for(const card of g.querySelectorAll('[data-key]')) {
      card.classList.toggle('compared', selected && Number(card.dataset.key)===projection.comparedKey);
    }
  }
  for(const edge of byId('machine').querySelectorAll('.rail')) edge.classList.toggle('chosen', Number(edge.dataset.childId)===projection.childId);
  byId('readout').textContent=readout(frame,state.lang);
  byId('stepcount').textContent=frame.step ? `${frame.index+1} / ${frame.total}` : '— / —';
  const status = !frame.step ? 'IDLE' : projection.status==='found' ? 'FOUND' : projection.status==='miss' ? 'MISS' : 'SEARCHING';
  byId('status').textContent=`${texts[state.lang].status}${status}`;
  byId('previous').disabled=!state.trace||state.index<=0;
  byId('next').disabled=!state.trace||state.index>=state.trace.steps.length-1;
  byId('play').textContent=state.timer===null?texts[state.lang].autoplay:texts[state.lang].pause;
  renderEvidence(frame);
}
function startLookup() {
  stop(); state.inspectPart=null; const n=Number(byId('query').value);
  if (!Number.isSafeInteger(n)||!byId('query').value.trim()) { byId('readout').textContent=texts[state.lang].error; return; }
  state.lastQuery=n; state.trace=searchTrace(state.tree,n); state.index=0; renderFrame(); renderComparison();
}
function insertKey() {
  stop(); state.inspectPart=null; const n=Number(byId('query').value);
  if (!Number.isSafeInteger(n)||!byId('query').value.trim()) { byId('readout').textContent=texts[state.lang].error; return; }
  const added=insert(state.tree,n);
  if (added.inserted) state.keys.push(n);
  state.lastQuery=n; state.tree=fromKeys(state.keys,state.degree);
  state.trace=null; state.index=0; drawMachine(); renderComparison();
  byId('readout').textContent=added.duplicate ? texts[state.lang].duplicate : texts[state.lang].inserted;
}
function next() { if(!state.trace)return;state.inspectPart=null;state.index=Math.min(state.index+1,state.trace.steps.length-1);if(state.index===state.trace.steps.length-1)stop();renderFrame(); }
function previous(){ if(!state.trace)return;stop();state.inspectPart=null;state.index=Math.max(state.index-1,0);renderFrame(); }
function togglePlay(){
  if(state.timer!==null){stop();renderFrame();return;}
  if(!state.trace)startLookup();
  if(!state.trace)return;
  if(state.index===state.trace.steps.length-1)state.index=0;
  state.timer=window.setInterval(()=>{ next(); },900);
  renderFrame();
}
function reset(){stop();state.inspectPart=null;state.datasetPreset='baseline';state.costWeights=WEIGHT_PRESETS.nodes;state.keys=[...DEFAULT_KEYS];state.degree=2;state.lastQuery=24;state.tree=fromKeys(state.keys,state.degree);state.trace=null;state.index=0;byId('query').value='24';byId('degree').value='2';drawMachine();renderComparison();}
function localize(){
  document.documentElement.lang=state.lang==='zh'?'zh-CN':'en';
  for(const [id,key] of [['hero','hero'],['subtitle','subtitle'],['label-query','query'],['label-degree','degree'],['degree-hint','degreeHint'],['comparison-heading','comparisonHeading'],['comparison-intro','comparisonIntro'],['scenario-evidence','comparisonEvidence'],['comparison-boundary','comparisonBoundary'],['search','search'],['insert','insert'],['previous','previous'],['next','next'],['reset','reset'],['source-title','sources'],['explain','explain']])byId(id).textContent=texts[state.lang][key];
  byId('toggle-language').textContent=state.lang==='zh'?'English':'中文';
  describe(validateTree(state.tree)); renderFrame(); renderComparison(); localizeP6();
}
for(const id of Object.keys(PRESETS))byId(`dataset-${id}`).addEventListener('click',()=>changeDataset(id));
for(const [id,weights] of Object.entries(WEIGHT_PRESETS))byId(`regime-${id}`).addEventListener('click',()=>setWeights(weights));
byId('weight-node').addEventListener('input',e=>setWeights({node:Number(e.target.value),comparison:state.costWeights.comparison}));
byId('weight-compare').addEventListener('input',e=>setWeights({node:state.costWeights.node,comparison:Number(e.target.value)}));
byId('cost-evidence').addEventListener('click',()=>{state.inspectPart='cost';state.inspectTarget=`${state.costWeights.node} : ${state.costWeights.comparison}`;renderEvidence(frameFor(state.trace,state.index));});
byId('study-form').addEventListener('submit',handleQuiz);
byId('degree').addEventListener('change',e=>setDegree(Number(e.target.value)));
for(const degree of COMPARED_DEGREES)byId(`case-${degree}`).addEventListener('click',()=>setDegree(degree));
byId('scenario-evidence').addEventListener('click',()=>{state.inspectPart='comparison';state.inspectTarget='t=2 ↔ t=3';renderEvidence(frameFor(state.trace,state.index));});
byId('search').addEventListener('click',startLookup);
byId('insert').addEventListener('click',insertKey);
byId('previous').addEventListener('click',previous);
byId('next').addEventListener('click',()=>{stop();next();});
byId('play').addEventListener('click',togglePlay);
byId('reset').addEventListener('click',reset);
byId('toggle-language').addEventListener('click',()=>{state.lang=state.lang==='zh'?'en':'zh';localize();});
byId('evidence-follow').addEventListener('click',followTrace);
byId('machine').addEventListener('click',e=>inspectDiagramPart(e.target));
byId('machine').addEventListener('keydown',e=>{ if(['Enter',' '].includes(e.key) && e.target.closest('[data-evidence-part]')){e.preventDefault();inspectDiagramPart(e.target);} });
byId('query').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();startLookup();}});
document.addEventListener('keydown',e=>{
  if(e.target instanceof HTMLElement && (e.target.closest('input,textarea,button,select') || e.altKey || e.ctrlKey || e.metaKey))return;
  if(e.key==='ArrowRight'){e.preventDefault();stop();next();}
  if(e.key==='ArrowLeft'){e.preventDefault();previous();}
  if(e.code==='Space'){e.preventDefault();togglePlay();}
});
reset();localize();
