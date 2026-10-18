/**
 * P9 桔槔 (jiégāo): source-constrained teaching model.
 * Pure calculations represent ideal moments only; no historical dimensions or fluid dynamics.
 * Citation locators pinned in docs/P9_HISTORICAL_JIEGAO.md.
 */
export const JG_SOURCES = Object.freeze({
  ZZ01: Object.freeze({id:'ZZ01',label:'《庄子》外篇·天地',labelEn:'Zhuangzi, Heaven and Earth',url:'https://ctext.org/text.pl?if=en&node=2795&remap=gb&show=parallel',locator:'天地 / 子贡与汉阴丈人',excerpt:'凿木为机，后重前轻，挈水若抽',type:'TRANSMITTED_TEXT'}),
  WZ01: Object.freeze({id:'WZ01',label:'《王祯农书》卷十八·灌溉门·桔槔',labelEn:'Wang Zhen Nong Shu, juan 18, Jiégāo',url:'https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890',locator:'卷十八／农器图谱／桔槔（校录转写）',excerpt:'引之则俯，舍之则仰',type:'TRANSMITTED_TEXT',note:'王祯在此引述更早文献；不能视为独立实测'}),
  WZ02: Object.freeze({id:'WZ02',label:'《王祯农书》卷十八·辘轳',labelEn:'Wang Zhen Nong Shu, juan 18, Windlass',url:'https://zh.wikisource.org/w/index.php?title=王禎農書/卷十八&oldid=1142890',locator:'卷十八／农器图谱／辘轳',excerpt:'取其俯仰则桔槔，取其圆转则辘轳',type:'TRANSMITTED_TEXT'}),
});
export const JG_CLAIMS = Object.freeze([
  {id:'JG-C01',text:'文字记载前轻后重的提水机械',en:'The texts describe a rear-heavy water-lifting mechanism.',state:'DOCUMENTED',sourceIds:['ZZ01','WZ01'],limit:'说明工作原理，而非出土实物尺寸'},
  {id:'JG-C02',text:'桔槔作俯仰运动，并有手动下压和松手回升的描述',en:'The described beam moves up and down; pull down and release.',state:'DOCUMENTED',sourceIds:['WZ01'],limit:'王祯引用了较早文本，并非另一项独立测量'},
  {id:'JG-C03',text:'辘轳靠轴的圆转提水，与桔槔的俯仰不同',en:'A windlass uses axial rotation rather than the beam tipping action.',state:'DOCUMENTED',sourceIds:['WZ02'],limit:'比较来自传世文本'},
  {id:'JG-C04',text:'杠杆绕轴点转动，可用理想力矩辅助理解',en:'Modern ideal torque is an interpretive teaching model.',state:'INFERRED',sourceIds:['ZZ01','WZ01'],limit:'牛顿力学公式不是古籍中的原始测量'},
  {id:'JG-C05',text:'样例的长度、配重、桶形和颜色均是教学假设',en:'Every numerical dimension, mass, bucket shape, and color is illustrative.',state:'ILLUSTRATIVE',sourceIds:[],limit:'没有证据支持复原为某一件元代实物'},
  {id:'JG-C06',text:'历史实物的尺寸、效率和确切流量未知',en:'Exact historical geometry, throughput and efficiency are unknown.',state:'UNKNOWN',sourceIds:[],limit:'需要原始图版、测绘/遗存或可靠实测资料'},
]);
export const JG_PARTS = Object.freeze([
  {id:'support',zh:'立柱与枢轴',en:'Post and pivot',claim:'JG-C04',status:'INFERRED'},
  {id:'beam',zh:'俯仰横杆',en:'Tilting beam',claim:'JG-C02',status:'INFERRED'},
  {id:'counterweight',zh:'后端配重',en:'Rear counterweight',claim:'JG-C01',status:'INFERRED'},
  {id:'cord',zh:'前端悬索',en:'Forward cord',claim:'JG-C05',status:'ILLUSTRATIVE'},
  {id:'vessel',zh:'提水容器',en:'Water vessel',claim:'JG-C01',status:'INFERRED'},
  {id:'waterline',zh:'示意井水面',en:'Illustrative water level',claim:'JG-C05',status:'ILLUSTRATIVE'},
]);
export const JG_DEFAULT = Object.freeze({counterMassKg:11,loadMassKg:9,counterArmM:1.3,loadArmM:1.0,angleDeg:0});
const ranges=Object.freeze({counterMassKg:[0,30],loadMassKg:[0,30],counterArmM:[0.5,2.5],loadArmM:[0.5,2.5],angleDeg:[-28,28]});
export function jgValidate(p){
  if(!p || typeof p!=='object')throw new TypeError('Parameter object required');
  for(const [name,[lo,hi]] of Object.entries(ranges)){
    if(typeof p[name]!=='number'||!Number.isFinite(p[name])||p[name]<lo||p[name]>hi)throw new RangeError(`${name} outside illustrative range ${lo}..${hi}`);
  }
  return p;
}
export function jgEvaluate(p){
  jgValidate(p);
  const g=9.81;
  const projection=Math.cos(p.angleDeg*Math.PI/180);
  const counterMomentNm=g*p.counterMassKg*p.counterArmM*projection;
  const loadMomentNm=g*p.loadMassKg*p.loadArmM*projection;
  const netMomentNm=counterMomentNm-loadMomentNm;
  const tendency=Math.abs(netMomentNm)<1e-8?'balanced':netMomentNm>0?'counterweight-lifts':'load-lowers';
  return Object.freeze({counterMomentNm,loadMomentNm,netMomentNm,tendency,units:'N·m (hypothetical)',status:'ILLUSTRATIVE',input:Object.freeze({...p})});
}
export function jgPartEvidence(id){
  const part=JG_PARTS.find(p=>p.id===id);
  if(!part)throw new RangeError(`Unknown part ${id}`);
  const claim=JG_CLAIMS.find(c=>c.id===part.claim);
  return {part,claim,sources:claim.sourceIds.map(source=>JG_SOURCES[source])};
}
export function jgPosition(p){
  jgValidate(p);
  const a=p.angleDeg*Math.PI/180,ox=425,oy=220,scale=103;
  return {
    pivot:{x:ox,y:oy},
    counter:{x:ox-p.counterArmM*scale*Math.cos(a),y:oy-p.counterArmM*scale*Math.sin(a)},
    load:{x:ox+p.loadArmM*scale*Math.cos(a),y:oy+p.loadArmM*scale*Math.sin(a)}
  };
}
/** Display geometry is purely schematic; source classes attach to interactive parts. */
export function jgSvg(p){
  const pt=jgPosition(p),a=pt.counter,b=pt.load,c=pt.pivot;
  const fmt=n=>Number(n.toFixed(2));
  const attrs=id=>`data-part="${id}" role="button" tabindex="0" aria-label="${JG_PARTS.find(x=>x.id===id).en}: view evidence"`;
  const vesselY=Math.min(426,b.y+104),ropeY=vesselY-23;
  return `<svg id="jg-diagram" viewBox="185 145 605 345" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schematic counterweight water lifter, values illustrative">
 <defs><linearGradient id="jg-wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bd996d"/><stop offset="1" stop-color="#704d2f"/></linearGradient><linearGradient id="jg-metal" x1="0" x2="1"><stop stop-color="#7f9d8e"/><stop offset="1" stop-color="#3d6558"/></linearGradient></defs>
 <rect width="850" height="495" rx="22" fill="#f7f3e9"/>
 <path d="M0 448H850" stroke="#baab96" stroke-width="2"/><rect x="605" y="368" width="149" height="126" rx="9" fill="#d9d4c4" stroke="#a5a090" stroke-width="4"/><path d="M612 410 Q665 398 747 410 L747 485 H612Z" fill="#b4d4d6"/>
 <g ${attrs('waterline')}><path d="M613 411 Q633 403 653 411 T695 411 T747 411" stroke="#468995" stroke-width="3" fill="none"/><text x="680" y="472" fill="#477b84" font-size="15" text-anchor="middle">水位 / water</text></g>
 <g ${attrs('support')}><path d="M394 425 L412 230 L438 230 L456 425Z" fill="url(#jg-metal)" stroke="#31564a" stroke-width="4"/><rect x="377" y="424" width="97" height="18" rx="5" fill="#526e62"/><circle cx="${c.x}" cy="${c.y}" r="19" fill="#dfcaa0" stroke="#3f594d" stroke-width="6"/></g>
 <g ${attrs('beam')}><line x1="${fmt(a.x)}" y1="${fmt(a.y)}" x2="${fmt(b.x)}" y2="${fmt(b.y)}" stroke="#684c30" stroke-width="21" stroke-linecap="round"/><line x1="${fmt(a.x)}" y1="${fmt(a.y-4)}" x2="${fmt(b.x)}" y2="${fmt(b.y-4)}" stroke="#d4b181" stroke-width="8" stroke-linecap="round"/></g>
 <g ${attrs('counterweight')}><path d="M${fmt(a.x-18)} ${fmt(a.y+16)} L${fmt(a.x+18)} ${fmt(a.y+16)} L${fmt(a.x+30)} ${fmt(a.y+61)} L${fmt(a.x-30)} ${fmt(a.y+61)}Z" fill="#7e8990" stroke="#465664" stroke-width="3"/><text x="${fmt(a.x)}" y="${fmt(a.y+45)}" text-anchor="middle" font-size="17" fill="white">${p.counterMassKg.toFixed(1)}kg</text></g>
 <g ${attrs('cord')}><line x1="${fmt(b.x)}" y1="${fmt(b.y+8)}" x2="${fmt(b.x)}" y2="${fmt(ropeY)}" stroke="#ac8b58" stroke-width="5" stroke-dasharray="6 3"/></g>
 <g ${attrs('vessel')}><path d="M${fmt(b.x-23)} ${fmt(vesselY-19)} Q${fmt(b.x)} ${fmt(vesselY-45)} ${fmt(b.x+23)} ${fmt(vesselY-19)}" fill="none" stroke="#465864" stroke-width="4"/><path d="M${fmt(b.x-24)} ${fmt(vesselY-20)}H${fmt(b.x+24)} L${fmt(b.x+18)} ${fmt(vesselY+27)}H${fmt(b.x-18)}Z" fill="#b99b6e" stroke="#746044" stroke-width="3"/><path d="M${fmt(b.x-18)} ${fmt(vesselY+7)}H${fmt(b.x+18)} L${fmt(b.x+15)} ${fmt(vesselY+23)}H${fmt(b.x-15)}Z" fill="#96cbd0"/></g>
 <text x="28" y="40" fill="#284437" font-size="22" font-weight="650">桔槔 · 俯仰提水原理</text><text x="28" y="65" fill="#70685a" font-size="14">教学示意 / illustrated principle — 非文物实测复原</text>
 <text x="30" y="471" fill="#726b5e" font-size="13">文本证据 ≠ 实测尺寸。点击任一构件可核对来源及推断状态。</text></svg>`;
}
