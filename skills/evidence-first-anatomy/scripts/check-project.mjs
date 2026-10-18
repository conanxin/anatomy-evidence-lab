#!/usr/bin/env node
import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
const skillRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const projectRoot=resolve(skillRoot,'..','..');
const strict=process.argv.includes('--strict');
const errors=[];
function assert(ok,why){if(!ok)errors.push(why);}
const exists=async p=>{try{await access(p);return true;}catch{return false;}};
const doc=await readFile(join(skillRoot,'SKILL.md'),'utf8');
const meta=doc.match(/^---\n([\s\S]*?)\n---\n/);
assert(Boolean(meta),'Must have closed YAML frontmatter');
const fields=meta?meta[1]:'';
const name=fields.match(/^name:\s*(\S+)\s*$/m)?.[1];
const desc=fields.match(/^description:\s*(.+)$/m)?.[1];
assert(name==='evidence-first-anatomy','name must match directory');
assert(Boolean(desc && desc.length>20 && desc.length<=1024),'Non-empty <=1024-character description required');
assert(doc.length<25000 && doc.includes('# Evidence-first Anatomy'),'Readable skill body required');
const refs=['references/protocol.md','evals/evals.json','scripts/check-project.mjs'];
for(const rel of refs)assert(await exists(join(skillRoot,rel)),`Missing skill resource: ${rel}`);
const evals=JSON.parse(await readFile(join(skillRoot,'evals/evals.json'),'utf8'));
assert(evals.notExecuted===true && evals.cases?.length>=3,'Eval definitions must not masquerade as executed agent tests');
for(const item of evals.cases??[])assert(Boolean(item.id && item.prompt && item.required?.length>=2),`Incomplete eval ${item.id}`);
if(strict){
  for(const rel of ['src/btree.js','src/robustness.js','tests/robustness.test.mjs','docs/P8_DESIGN_LOCK.md','docs/P8_RESULTS.md','artifacts/p8-robustness.json'])
    assert(await exists(join(projectRoot,rel)),`Project reference missing: ${rel}`);
}
const result={skill:name,check:strict?'project-reference':'portable-structure',passed:errors.length===0,errorCount:errors.length,errors,
 note:'File and metadata structure only. Does NOT verify an agent runtime loaded the skill or that prompts were evaluated.'};
console.log(JSON.stringify(result,null,2));
if(errors.length)process.exitCode=1;
