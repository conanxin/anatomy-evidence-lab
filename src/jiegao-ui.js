import {JG_DEFAULT,jgEvaluate,jgSvg,jgPartEvidence} from './jiegao.js';
const $=sel=>document.querySelector(sel);
const state={...JG_DEFAULT};
const fields=[['#jg-counter','counterMassKg','#jg-out-counter','kg'],['#jg-load','loadMassKg','#jg-out-load','kg'],['#jg-rear','counterArmM','#jg-out-rear','m'],['#jg-front','loadArmM','#jg-out-front','m']];
function showEvidence(id){
 const {part,claim,sources}=jgPartEvidence(id);
 const links=sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a><br><small>${s.locator} · ${s.excerpt}</small></li>`).join('');
 $('#jg-evidence-card').innerHTML=`<strong>${part.zh}</strong> <small>(${part.en})</small><p>构件证据等级：<strong>${part.status}</strong></p><p>${claim.text}</p><p>主张 ${claim.id} · ${claim.state}</p><p>${claim.limit}</p>${links?`<ul>${links}</ul>`:'<p><strong>无原文尺寸证据；全部参数为现代教学假设。</strong></p>'}`;
}
function draw(){
 const result=jgEvaluate(state);
 $('#jg-svg').innerHTML=jgSvg(state);
 for(const [selector,key,out,unit] of fields){$(out).textContent=state[key].toFixed(1)+' '+unit;$(selector).value=state[key]}
 $('#jg-tau-c').textContent=result.counterMomentNm.toFixed(1)+' N·m';
 $('#jg-tau-l').textContent=result.loadMomentNm.toFixed(1)+' N·m';
 $('#jg-tau-net').textContent=(result.netMomentNm>=0?'+':'')+result.netMomentNm.toFixed(1)+' N·m';
 $('#jg-tendency').textContent=result.tendency==='balanced'?'理想平衡 / Balanced (ideal)':result.tendency==='counterweight-lifts'?'配重倾向提起前端 / Counterweight tends to lift':'前端载荷倾向下落 / Load tends to lower';
}
for(const [selector,key] of fields)$(selector).addEventListener('input',e=>{state[key]=Number(e.target.value);draw()});
$('#jg-lower').addEventListener('click',()=>{state.angleDeg=24;draw();$('#jg-motion-msg').textContent='人为下压前端（示意角度 24°），并非实测操作力。'});
$('#jg-release').addEventListener('click',()=>{const tendency=jgEvaluate(state).tendency;state.angleDeg=tendency==='balanced'?0:tendency==='counterweight-lifts'?-24:24;draw();$('#jg-motion-msg').textContent='松手后的方向为理想静力矩的符号示意，并非真实时间动力学。'});
$('#jg-reset').addEventListener('click',()=>{Object.assign(state,JG_DEFAULT);draw();showEvidence('beam');$('#jg-motion-msg').textContent='已恢复教学示例参数。'});
$('#jg-svg').addEventListener('click',e=>{const part=e.target.closest?.('[data-part]');if(part)showEvidence(part.dataset.part)});
$('#jg-svg').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target?.dataset?.part){e.preventDefault();showEvidence(e.target.dataset.part)}});
draw();showEvidence('beam');
