import test from 'node:test';
import assert from 'node:assert/strict';
import {JG_DEFAULT,JG_CLAIMS,JG_SOURCES,JG_PARTS,jgEvaluate,jgPosition,jgValidate,jgPartEvidence,jgSvg} from '../src/jiegao.js';

test('All six typed documentary/illustrative claims have stable IDs and states',()=>{
  assert.equal(JG_CLAIMS.length,6);
  assert.equal(new Set(JG_CLAIMS.map(x=>x.id)).size,6);
  assert.deepEqual(new Set(JG_CLAIMS.map(x=>x.state)),new Set(['DOCUMENTED','INFERRED','ILLUSTRATIVE','UNKNOWN']));
});
test('Source IDs and locators point to explicit historical passages',()=>{
  for(const claim of JG_CLAIMS) for(const id of claim.sourceIds){
    assert.ok(JG_SOURCES[id]?.url.startsWith('https://'));
    assert.ok(JG_SOURCES[id].locator.length>10);
  }
});
test('Written sources are transmitted narratives, not measured artifacts',()=>{
  assert.ok(Object.values(JG_SOURCES).every(s=>s.type==='TRANSMITTED_TEXT'));
  assert.ok(JG_CLAIMS.find(x=>x.state==='UNKNOWN').text.includes('未知'));
});
test('Do not mix windlass circular motion with tipping lever',()=>{
  assert.match(JG_SOURCES.WZ02.excerpt,/俯仰/);
  assert.match(JG_SOURCES.WZ02.excerpt,/圆转/);
});
test('All visible parts reference a typed claim',()=>{
  for(const part of JG_PARTS){
    const record=jgPartEvidence(part.id);
    assert.equal(record.claim.id,part.claim);
    assert.ok(record.claim.state);
    assert.deepEqual(record.sources.map(x=>x.id),record.claim.sourceIds);
  }
});
test('Absent part IDs throw, not fabricate sources',()=>assert.throws(()=>jgPartEvidence('undocumented-axle'),RangeError));
test('Default ideal moments use only hypothetical masses and arms',()=>{
  const x=jgEvaluate(JG_DEFAULT);
  assert.equal(Number(x.counterMomentNm.toFixed(3)),Number((9.81*11*1.3).toFixed(3)));
  assert.equal(Number(x.loadMomentNm.toFixed(3)),Number((9.81*9*1).toFixed(3)));
  assert.equal(x.tendency,'counterweight-lifts');
  assert.equal(x.status,'ILLUSTRATIVE');
});
test('Counterweight too small causes front load tendency',()=>{
  const x=jgEvaluate({...JG_DEFAULT,counterMassKg:2});
  assert.equal(x.tendency,'load-lowers');assert.ok(x.netMomentNm<0);
});
test('Exact illustrative balance has zero net moment',()=>{
  const x=jgEvaluate({...JG_DEFAULT,counterMassKg:10,loadMassKg:10,counterArmM:1,loadArmM:1});
  assert.equal(x.tendency,'balanced');assert.equal(x.netMomentNm,0);
});
test('Increasing counter mass does not change supplied historical claims',()=>{
  const before=JSON.stringify(JG_CLAIMS),input={...JG_DEFAULT};
  const low=jgEvaluate({...input,counterMassKg:2});const high=jgEvaluate({...input,counterMassKg:16});
  assert.ok(high.netMomentNm>low.netMomentNm);
  assert.equal(JSON.stringify(JG_CLAIMS),before);
  assert.deepEqual(input,JG_DEFAULT);
});
test('Load mass or load arm increases downward tendency',()=>{
  const a=jgEvaluate({...JG_DEFAULT,loadMassKg:2}),b=jgEvaluate({...JG_DEFAULT,loadMassKg:20});
  const c=jgEvaluate({...JG_DEFAULT,loadArmM:2});
  assert.ok(b.netMomentNm<a.netMomentNm);
  assert.ok(c.netMomentNm<jgEvaluate(JG_DEFAULT).netMomentNm);
});
test('Reject missing/out of bounds/nonfinite model parameters',()=>{
  for(const p of [null,{}, {...JG_DEFAULT,counterMassKg:-1},{...JG_DEFAULT,loadArmM:0},{...JG_DEFAULT,angleDeg:100},{...JG_DEFAULT,loadMassKg:NaN},{...JG_DEFAULT,loadMassKg:Infinity}])
    assert.throws(()=>jgValidate(p),/object|outside/);
});
test('Position rotates front and back oppositely around same pivot',()=>{
  const neutral=jgPosition(JG_DEFAULT);
  const down=jgPosition({...JG_DEFAULT,angleDeg:20});
  assert.equal(neutral.pivot.x,down.pivot.x);
  assert.ok(down.load.y>neutral.load.y);
  assert.ok(down.counter.y<neutral.counter.y);
});
test('SVG contains every part as keyboard-addressable interactive group',()=>{
  const s=jgSvg(JG_DEFAULT);
  for(const part of JG_PARTS){
    assert.ok(s.includes(`data-part="${part.id}"`));
  }
  assert.ok(s.includes('tabindex="0"'));
  assert.match(s,/非文物实测复原/);
});
test('Documentary claims and numerical variables remain separate',()=>{
  const initial=JSON.stringify(JG_SOURCES),x=jgEvaluate({...JG_DEFAULT,angleDeg:15});
  assert.equal(JSON.stringify(JG_SOURCES),initial);
  assert.equal(x.input.angleDeg,15);
  assert.equal(jgSvg(x.input).includes('11.0kg'),true);
});

test('Tilted beam reduces gravity moment magnitude by cos angle',()=>{
  const flat=jgEvaluate(JG_DEFAULT);
  const tilted=jgEvaluate({...JG_DEFAULT,angleDeg:25});
  assert.ok(Math.abs(tilted.netMomentNm)<Math.abs(flat.netMomentNm));
  assert.ok(Math.abs(tilted.netMomentNm-flat.netMomentNm*Math.cos(25*Math.PI/180))<1e-9);
});
