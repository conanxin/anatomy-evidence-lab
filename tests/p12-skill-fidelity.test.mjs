import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const skill=readFileSync(new URL('../skills/evidence-first-anatomy/SKILL.md',import.meta.url),'utf8');
const rules=readFileSync(new URL('../skills/evidence-first-anatomy/references/source-fidelity.md',import.meta.url),'utf8');
const evals=JSON.parse(readFileSync(new URL('../skills/evidence-first-anatomy/evals/evals.json',import.meta.url),'utf8'));
test('P12: skill requires verified verbatim source and keeps unsupported dimensions UNKNOWN',()=>{
 assert.match(skill,/validate source fidelity/i);
 assert.match(skill,/source-fidelity\.md/);
 assert.match(rules,/QUOTE_NOT_VERIFIED/);
 assert.match(rules,/UNKNOWN/);
});
test('P12: known lever-volume misinterpretation is explicitly forbidden',()=>{
 assert.match(rules,/3× water volume/);
 assert.match(rules,/m_c \* L_c/);
 assert.match(skill,/arm-length ratio alone/);
});
test('P12: anti-fabrication prompt evaluated only as specification, not a fabricated runtime result',()=>{
 const e=evals.cases.find(x=>x.id==='false-historical-quotation');
 assert.ok(e);
 assert.ok(e.required.some(x=>x.includes('do not fabricate')));
 assert.equal(evals.notExecuted,true);
});
