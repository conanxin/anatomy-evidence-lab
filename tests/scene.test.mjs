import test from 'node:test';
import assert from 'node:assert/strict';
import {fromKeys,searchTrace,layoutTree} from '../src/btree.js';
import {frameFor,readout,highlightModel} from '../src/scene.js';
const tree=fromKeys();

test('idle frame is explicit',()=>{const f=frameFor(null,0);assert.equal(f.step,null);assert.equal(f.activeNodeId,null);assert.match(readout(f,'zh'),/输入/);});
test('frame index clamps to real step bounds',()=>{const tr=searchTrace(tree,24);assert.equal(frameFor(tr,-100).index,0);assert.equal(frameFor(tr,1e5).index,tr.steps.length-1);});
test('step counter covers terminal success and miss',()=>{for(const n of [24,25]){const tr=searchTrace(tree,n);tr.steps.forEach((step,i)=>{const zh=readout(frameFor(tr,i),'zh'),en=readout(frameFor(tr,i),'en');assert.ok(zh.startsWith(`步骤 ${i+1}/${tr.steps.length}`));assert.ok(en.startsWith(`Step ${i+1}/${tr.steps.length}`));});}});
test('readout expresses hit and miss in both languages',()=>{const hit=searchTrace(tree,24),miss=searchTrace(tree,25);assert.match(readout(frameFor(hit,999),'zh'),/命中/);assert.match(readout(frameFor(hit,999),'en'),/Found/);assert.match(readout(frameFor(miss,999),'zh'),/未命中/);assert.match(readout(frameFor(miss,999),'en'),/not found/);});
test('all trace step kinds have bilingual explanations',()=>{const tr=searchTrace(tree,24);const types=new Set(tr.steps.map(s=>s.type));assert.ok(types.has('visit')&&types.has('compare')&&types.has('descend')&&types.has('found'));for(let i=0;i<tr.steps.length;i++){assert.ok(readout(frameFor(tr,i),'zh').length>15);assert.ok(readout(frameFor(tr,i),'en').length>15);}});
test('frame highlight keys come from the active trace step',()=>{const tr=searchTrace(tree,24),l=layoutTree(tree);tr.steps.forEach((step,i)=>{const f=frameFor(tr,i),p=highlightModel(l,f);assert.equal(p.activeNodeId,step.nodeId);assert.equal(p.comparedKey,step.comparedKey??null);assert.equal(p.childId,step.childId??null);});});
test('no phantom highlights outside layout ids',()=>{const f={step:{type:'visit'},activeNodeId:9999,childId:8888,comparedKey:null,found:null};const h=highlightModel(layoutTree(tree),f);assert.equal(h.activeNodeId,null);assert.equal(h.childId,null);});
test('model status derives only from terminal events',()=>{const tr=searchTrace(tree,25),l=layoutTree(tree);assert.equal(highlightModel(l,frameFor(tr,0)).status,'searching');assert.equal(highlightModel(l,frameFor(tr,999)).status,'miss');});
test('render readout is referentially transparent',()=>{const tr=searchTrace(tree,24),f=frameFor(tr,2);assert.equal(readout(f,'zh'),readout(f,'zh'));assert.deepEqual(frameFor(tr,2),frameFor(tr,2));});
