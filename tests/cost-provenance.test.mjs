import test from 'node:test';
import assert from 'node:assert/strict';
import {makeCostProvenance} from '../scripts/export_cost_run.mjs';

const time='2026-10-18T12:00:00.000Z';
const mk=(w)=>makeCostProvenance({timestamp:time,weights:w,actor:'unit-test-fixture',sourceRevision:'TEST_ONLY'});
const entity=(doc,t)=>doc['@graph'].find(e=>e['@type']===t);

test('PROV-inspired run has exactly one agent, activity, and typed entities',()=>{
 const g=mk({node:5,comparison:1})['@graph'];
 assert.equal(g.filter(e=>e['@type']==='prov:Agent').length,1);
 assert.equal(g.filter(e=>e['@type']==='prov:Activity').length,1);
 assert.equal(g.filter(e=>e['@type']==='prov:Entity').length,4);
});
test('same evidence and input give same SHA even as weights reverse',()=>{
 const a=mk({node:5,comparison:1}),b=mk({node:1,comparison:5});
 const get=(d,key)=>d['@graph'].find(x=>x[key]!==undefined)[key];
 assert.equal(get(a,'lab:inputSha256'),get(b,'lab:inputSha256'));
 assert.equal(get(a,'lab:traceSha256'),get(b,'lab:traceSha256'));
 assert.notEqual(get(a,'lab:assumptionSha256'),get(b,'lab:assumptionSha256'));
 assert.notEqual(get(a,'lab:resultSha256'),get(b,'lab:resultSha256'));
});
test('prov:Activity uses both actual trace and explicit cost assumption and names execution agent',()=>{
 const a=mk({node:5,comparison:1}); const act=entity(a,'prov:Activity');
 assert.equal(act['prov:used'].length,2);
 assert.ok(act['prov:wasAssociatedWith']['@id'].includes('unit-test-fixture'));
 assert.equal(act['lab:sourceRevision'],'TEST_ONLY');
});
test('time is required and score provenance explicitly disclaims real-world performance',()=>{
 assert.throws(()=>makeCostProvenance(),/ISO date-time/);
 assert.throws(()=>makeCostProvenance({timestamp:'yesterday'}));
 assert.match(mk({node:1,comparison:5})['lab:scope'],/not observed latency/);
});
test('same full configuration and timestamp produce deterministic JSON-LD (test fixtures only)',()=>{
 const a=mk({node:5,comparison:1}),b=mk({node:5,comparison:1});
 assert.equal(JSON.stringify(a),JSON.stringify(b));
});
