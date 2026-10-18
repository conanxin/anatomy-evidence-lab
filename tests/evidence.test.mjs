import test from 'node:test';
import assert from 'node:assert/strict';
import { EVIDENCE_RECORDS, STEP_EVIDENCE, evidenceFor, validateEvidenceGraph } from '../src/evidence.js';
import { fromKeys, searchTrace } from '../src/btree.js';
import { frameFor } from '../src/scene.js';

const kinds=['idle','visit','compare','descend','found','miss'];
const knownTypes=['claim','source','assumption','model','visual','test'];

test('evidence graph has unique stable identifiers and every step has all six evidence types',()=>{
  const r=validateEvidenceGraph();
  assert.equal(r.valid,true);
  assert.equal(r.records,EVIDENCE_RECORDS.length);
  assert.ok(r.records>=12);
  assert.equal(r.chains,kinds.length);
  for(const kind of kinds){
    const records=evidenceFor(kind).records;
    for(const t of knownTypes) assert.ok(records.some(x=>x.type===t),`${kind} missing ${t}`);
  }
});

test('every trace event maps to a primary source, explicit assumption, model, visual part and reproducible test',()=>{
  const tree=fromKeys();
  for(const key of [24,25]){
    const trace=searchTrace(tree,key);
    for(const step of trace.steps){
      const chain=evidenceFor(step.type);
      assert.ok(chain.records.some(x=>x.type==='source'&&x.href.startsWith('https://')));
      assert.ok(chain.records.some(x=>x.type==='assumption'&&x.id==='A-SCOPE'));
      assert.ok(chain.records.some(x=>x.type==='model'));
      assert.ok(chain.records.some(x=>x.type==='visual'));
      assert.ok(chain.records.some(x=>x.type==='test'));
    }
  }
});

test('claims are distinct from evidence, assumptions and tests',()=>{
  assert.equal(evidenceFor('visit').records.find(x=>x.type==='claim').id,'C-BALANCED');
  assert.equal(evidenceFor('compare').records.find(x=>x.type==='claim').id,'C-COMPARE');
  assert.equal(evidenceFor('descend').records.find(x=>x.type==='claim').id,'C-DESCEND');
  assert.equal(evidenceFor('found').records.find(x=>x.type==='claim').id,'C-RESULT');
  assert.equal(evidenceFor('miss').records.find(x=>x.type==='claim').id,'C-RESULT');
});

test('visual drawer, numbered card and rail select relevant evidence chains',()=>{
  for(const [part,claimed,visual] of [['drawer','C-BALANCED','V-DRAWER'],['card','C-COMPARE','V-CARD'],['rail','C-DESCEND','V-RAIL']]){
    const result=evidenceFor('idle',part);
    assert.equal(result.inspectedPart,part);
    assert.equal(result.records.find(x=>x.type==='claim').id,claimed);
    assert.ok(result.records.some(x=>x.id===visual));
  }
});

test('changing language cannot change provenance IDs or graph links',()=>{
  for(const kind of kinds){
    const records=evidenceFor(kind).records;
    for(const r of records){assert.ok(r.zh.trim());assert.ok(r.en.trim());assert.ok(r.id);}
    assert.deepEqual(records.map(r=>r.id),STEP_EVIDENCE[kind]);
  }
});

test('model scope explicitly rejects treating analogy as BOOK-ID-SEARCH internals',()=>{
  const records=evidenceFor('visit').records;
  const scope=records.find(x=>x.id==='A-SCOPE');
  assert.match(scope.zh,/不模拟/);
  assert.match(scope.zh,/BOOK-ID-SEARCH/);
  assert.match(scope.en,/No deletion/);
});

test('source is the NIST primary definition, not an asserted validation of the illustration',()=>{
  const source=EVIDENCE_RECORDS.find(x=>x.id==='S-NIST');
  assert.equal(source.type,'source');
  assert.match(source.href,/xlinux\.nist\.gov\/dads\/HTML\/btree\.html/);
  assert.match(source.zh,/不验证/);
});

test('dangling relation is rejected by structural gate',()=>{
  const chains={...STEP_EVIDENCE,compare:[...STEP_EVIDENCE.compare,'M-MISSING']};
  assert.throws(()=>validateEvidenceGraph(EVIDENCE_RECORDS,chains),/Dangling evidence/);
});

test('duplicate relation or record is rejected by structural gate',()=>{
  const chains={...STEP_EVIDENCE,visit:[...STEP_EVIDENCE.visit,'S-NIST']};
  assert.throws(()=>validateEvidenceGraph(EVIDENCE_RECORDS,chains),/Duplicate relation/);
  assert.throws(()=>validateEvidenceGraph([...EVIDENCE_RECORDS,EVIDENCE_RECORDS[0]],STEP_EVIDENCE),/duplicate evidence ID/);
});

test('missing required category is rejected by structural gate',()=>{
  const chains={...STEP_EVIDENCE,compare:STEP_EVIDENCE.compare.filter(x=>x!=='S-NIST')};
  assert.throws(()=>validateEvidenceGraph(EVIDENCE_RECORDS,chains),/Missing source/);
});

test('unsafe links are rejected',()=>{
  const bad=EVIDENCE_RECORDS.map(x=> x.id==='S-NIST'?{...x,href:'javascript:alert(1)'}:x);
  assert.throws(()=>validateEvidenceGraph(bad,STEP_EVIDENCE),/Unsafe evidence URL/);
});

test('graph lookups are deterministic; unknown step kinds fail instead of silently fabricating evidence',()=>{
  assert.deepEqual(evidenceFor('compare'),evidenceFor('compare'));
  assert.throws(()=>evidenceFor('special-animation'),RangeError);
});

test('end-to-end trace step, frame and evidence stay aligned',()=>{
  const tree=fromKeys();
  for(const query of [24,25]){
    const trace=searchTrace(tree,query);
    for(let i=0;i<trace.steps.length;i++){
      const frame=frameFor(trace,i);
      assert.equal(evidenceFor(frame.step.type).stepType,frame.step.type);
      assert.equal(frame.step,trace.steps[i]);
    }
  }
});
