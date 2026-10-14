import { createTree, fromKeys, insert, validateTree, searchTrace, layoutTree, DEFAULT_KEYS } from './btree.js';
import { frameFor, readout, highlightModel } from './scene.js';

const NS = 'http://www.w3.org/2000/svg';
const byId = id => document.getElementById(id);
const state = { tree: fromKeys(), trace: null, index: 0, lang: 'zh', timer: null, layout: null };
const texts = {
  zh: { hero:'一座能够解释搜索的档案柜', subtitle:'真实 B-tree 算法 · 轴测机械示意 · 证据与假设可追踪', query:'检索整数', search:'开始检索', insert:'插入卡片', previous:'上一步', next:'下一步', autoplay:'自动播放', pause:'暂停', reset:'恢复初始档案', records:'卡片', drawers:'抽屉', levels:'层级', gate:'算法门槛', sources:'来源与假设', explain:'每张抽屉是一个 B-tree 节点。比较档案号，再沿正确的子节点通道下降。动画只反映真实搜索轨迹。', idle:'请开始一次检索。', error:'请输入安全范围内的整数。', duplicate:'该整数已存在，未重复插入。', inserted:'卡片已插入，B-tree 已重新平衡。', status:'状态：' },
  en: { hero:'An archive cabinet that explains search', subtitle:'Real B-tree algorithm · isometric machine · inspectable evidence', query:'Look up integer', search:'Search', insert:'Insert card', previous:'Previous', next:'Next', autoplay:'Autoplay', pause:'Pause', reset:'Reset archive', records:'Cards', drawers:'Drawers', levels:'Levels', gate:'Invariant gate', sources:'Sources & assumptions', explain:'Each drawer is a B-tree node. Compare the file number and descend through the correct corridor. Every motion comes from a real search trace.', idle:'Start a search.', error:'Enter a safe integer.', duplicate:'This key already exists; no duplicate inserted.', inserted:'Card inserted; B-tree rebalanced.', status:'Status: ' },
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
  byId('stats').textContent = `${texts[state.lang].records}: ${stats.keys}  ·  ${texts[state.lang].drawers}: ${stats.nodes}  ·  ${texts[state.lang].levels}: ${stats.height}`;
  byId('gate').textContent = `${texts[state.lang].gate}: PASS`;
}
function drawNode(canvas, node) {
  const g = append(canvas, 'g', { class:'drawer', 'data-node-id': node.id, transform:`translate(${node.x},${node.y})` });
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
    append(g, 'rect', { x:x-w/2, y:1, width:w, height:19, rx:2, class:'file-card', 'data-key':key });
    append(g, 'text', { x, y:14, 'text-anchor':'middle', class:'file-number' }, key);
  });
  append(g, 'circle', { cx:-55, cy:31, r:2.2, class:'brass-screw' });
  append(g, 'circle', { cx:40, cy:31, r:2.2, class:'brass-screw' });
  const handle = append(g, 'rect', { x:-12, y:27, width:24, height:7, rx:3, class:'drawer-handle' });
  g.setAttribute('role','img');
  g.setAttribute('aria-label',`Drawer ${node.id}: ${node.keys.join(', ')}`);
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
    append(railLayer,'path',{ d:`M ${start.x} ${start.y+40} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y-48}`, class:'rail', 'data-child-id':edge.to });
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
}
function startLookup() {
  stop(); const n=Number(byId('query').value);
  if (!Number.isSafeInteger(n)||!byId('query').value.trim()) { byId('readout').textContent=texts[state.lang].error; return; }
  state.trace=searchTrace(state.tree,n); state.index=0; renderFrame();
}
function insertKey() {
  stop(); const n=Number(byId('query').value);
  if (!Number.isSafeInteger(n)||!byId('query').value.trim()) { byId('readout').textContent=texts[state.lang].error; return; }
  const added=insert(state.tree,n);
  state.trace=null; state.index=0; drawMachine();
  byId('readout').textContent=added.duplicate ? texts[state.lang].duplicate : texts[state.lang].inserted;
}
function next() { if(!state.trace)return;state.index=Math.min(state.index+1,state.trace.steps.length-1);if(state.index===state.trace.steps.length-1)stop();renderFrame(); }
function previous(){ if(!state.trace)return;stop();state.index=Math.max(state.index-1,0);renderFrame(); }
function togglePlay(){
  if(state.timer!==null){stop();renderFrame();return;}
  if(!state.trace)startLookup();
  if(!state.trace)return;
  if(state.index===state.trace.steps.length-1)state.index=0;
  state.timer=window.setInterval(()=>{ next(); },900);
  renderFrame();
}
function reset(){stop();state.tree=fromKeys(DEFAULT_KEYS);state.trace=null;state.index=0;byId('query').value='24';drawMachine();}
function localize(){
  document.documentElement.lang=state.lang==='zh'?'zh-CN':'en';
  for(const [id,key] of [['hero','hero'],['subtitle','subtitle'],['label-query','query'],['search','search'],['insert','insert'],['previous','previous'],['next','next'],['reset','reset'],['source-title','sources'],['explain','explain']])byId(id).textContent=texts[state.lang][key];
  byId('toggle-language').textContent=state.lang==='zh'?'English':'中文';
  describe(validateTree(state.tree)); renderFrame();
}
byId('search').addEventListener('click',startLookup);
byId('insert').addEventListener('click',insertKey);
byId('previous').addEventListener('click',previous);
byId('next').addEventListener('click',()=>{stop();next();});
byId('play').addEventListener('click',togglePlay);
byId('reset').addEventListener('click',reset);
byId('toggle-language').addEventListener('click',()=>{state.lang=state.lang==='zh'?'en':'zh';localize();});
byId('query').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();startLookup();}});
document.addEventListener('keydown',e=>{
  if(e.target instanceof HTMLElement && (e.target.closest('input,textarea,button,select') || e.altKey || e.ctrlKey || e.metaKey))return;
  if(e.key==='ArrowRight'){e.preventDefault();stop();next();}
  if(e.key==='ArrowLeft'){e.preventDefault();previous();}
  if(e.code==='Space'){e.preventDefault();togglePlay();}
});
reset();localize();
