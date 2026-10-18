import test from 'node:test';
import assert from 'node:assert/strict';
import { makeProvenance, sha256 } from '../scripts/export_provenance.mjs';
import { DEFAULT_KEYS } from '../src/btree.js';
import { createComparison } from '../src/comparison.js';
const input={keys:DEFAULT_KEYS,query:24,timestamp:'2026-10-18T12:00:00.000Z',actor:'verification-test',sourceRevision:'local-test'};

test('P5 JSON-LD has typed agent, one input, activity and two generated model entities',()=>{
  const graph=makeProvenance(input)['@graph'];
  assert.equal(graph.length,5);
  assert.deepEqual(graph.map(x=>x['@type']),['prov:Agent','prov:Entity','prov:Activity','prov:Entity','prov:Entity']);
  assert.equal(graph[2]['prov:used']['@id'],graph[1]['@id']);
  assert.equal(graph[2]['prov:wasAssociatedWith']['@id'],graph[0]['@id']);
  assert.ok(graph.slice(3).every(x=>x['prov:wasGeneratedBy']['@id']===graph[2]['@id']));
});

test('input hash is a genuine SHA-256 over canonical input, not UI fingerprint',()=>{
  const graph=makeProvenance(input)['@graph'];
  const expected=sha256(JSON.stringify({keys:DEFAULT_KEYS,query:24}));
  assert.equal(graph[1]['lab:inputSha256'],expected);
  assert.match(expected,/^[0-9a-f]{64}$/);
});

test('exported model counters are computed from the same pure search traces',()=>{
  const actual=makeProvenance(input)['@graph'].slice(3);
  const c=createComparison(DEFAULT_KEYS,24);
  for(let i=0;i<2;i++){
    assert.equal(actual[i]['lab:nodeVisits'],c.cases[i].visits);
    assert.equal(actual[i]['lab:keyComparisons'],c.cases[i].comparisons);
    assert.equal(actual[i]['lab:minDegree'],c.cases[i].degree);
  }
});

test('same input, actor, timestamp and code revision yield identical JSON-LD',()=>{
  assert.deepEqual(makeProvenance(input),makeProvenance(input));
});

test('changing query changes input digest; changing actor only changes agent provenance',()=>{
  const before=makeProvenance(input);
  const queryChange=makeProvenance({...input,query:25});
  const actorChange=makeProvenance({...input,actor:'other-reviewer'});
  assert.notEqual(before['@graph'][1]['lab:inputSha256'],queryChange['@graph'][1]['lab:inputSha256']);
  assert.equal(before['@graph'][1]['lab:inputSha256'],actorChange['@graph'][1]['lab:inputSha256']);
  assert.notEqual(before['@graph'][0]['@id'],actorChange['@graph'][0]['@id']);
});

test('no timestamp or invalid timestamp cannot be passed off as a real run',()=>{
  assert.throws(()=>makeProvenance({query:24}),/timestamp/);
  assert.throws(()=>makeProvenance({...input,timestamp:'yesterday'}),/timestamp/);
});

test('JSON-LD language tags are known compact property terms',()=>{
  const p=makeProvenance(input);
  assert.equal(p['@context'].prov,'http://www.w3.org/ns/prov#');
  assert.equal(p['@context'].xsd,'http://www.w3.org/2001/XMLSchema#');
  assert.equal(p['lab:schema'],'P5-LAB-PROVENANCE/0.1');
});
