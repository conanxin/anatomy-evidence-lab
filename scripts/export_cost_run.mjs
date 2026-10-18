#!/usr/bin/env node
/** P6 explicit hypothetical assumptions and actual deterministic source trace.
 * PROV-inspired JSON-LD, not a formal ontology-validation certificate.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import { createComparison } from '../src/comparison.js';
import { PRESETS, WEIGHT_PRESETS, evaluateCost } from '../src/cost-model.js';
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const iri=(part,value)=>`urn:conanxin:anatomy:${part}:${value}`;

export function makeCostProvenance({ keys=PRESETS.tradeoff.keys, query=7, weights=WEIGHT_PRESETS.nodes, timestamp, actor='anatomy-evidence-lab-cli', sourceRevision='UNPINNED' }={}) {
  if(typeof timestamp!=='string'||!/^\d{4}-\d\d-\d\dT/.test(timestamp)||Number.isNaN(Date.parse(timestamp)))throw new Error('Explicit ISO date-time required');
  if(typeof actor!=='string'||!actor.trim())throw new Error('Agent required');
  const comparison=createComparison(keys,query);
  const result=evaluateCost(comparison,weights);
  const input={keys:comparison.keys,query};
  const inputHash=sha(input);
  const traceByDegree=comparison.cases.map(c=>({degree:c.degree,trace:c.trace,stats:c.stats}));
  const traceHash=sha(traceByDegree);
  const assumptionHash=sha(result.weights);
  const outputHash=sha(result.cases.map(c=>({degree:c.degree,nodeVisits:c.nodeVisits,keyComparisons:c.keyComparisons,score:c.score})));
  const nonce=timestamp.replace(/[^0-9TZ]/g,'');
  const activityId=iri('cost-run',`${inputHash.slice(0,12)}:${assumptionHash.slice(0,12)}:${nonce}`);
  const inputId=iri('input',inputHash), traceId=iri('trace',traceHash), assumptionId=iri('assumption',assumptionHash), outputId=iri('result',outputHash);
  const actorId=iri('agent',encodeURIComponent(actor));
  const graph=[
    {'@id':inputId,'@type':'prov:Entity','lab:inputSha256':inputHash,'lab:insertionOrder':JSON.stringify(comparison.keys),'lab:query':query},
    {'@id':traceId,'@type':'prov:Entity','prov:wasDerivedFrom':{'@id':inputId},'lab:traceSha256':traceHash,'lab:nodeVisits':JSON.stringify(comparison.cases.map(c=>c.visits)),'lab:keyComparisons':JSON.stringify(comparison.cases.map(c=>c.comparisons))},
    {'@id':assumptionId,'@type':'prov:Entity','lab:assumptionSha256':assumptionHash,'lab:nodeWeight':result.weights.node,'lab:comparisonWeight':result.weights.comparison,'lab:units':'HYPOTHETICAL_TEACHING_POINTS'},
    {'@id':actorId,'@type':'prov:Agent','lab:agentLabel':actor},
    {'@id':activityId,'@type':'prov:Activity','prov:used':[{'@id':traceId},{'@id':assumptionId}],'prov:wasAssociatedWith':{'@id':actorId},'prov:startedAtTime':{'@value':timestamp,'@type':'xsd:dateTime'},'lab:sourceRevision':sourceRevision},
    {'@id':outputId,'@type':'prov:Entity','prov:wasGeneratedBy':{'@id':activityId},'prov:wasDerivedFrom':[{'@id':traceId},{'@id':assumptionId}],'lab:resultSha256':outputHash,'lab:scores':JSON.stringify(result.cases.map(c=>({t:c.degree,score:c.score}))), 'lab:winner':result.conclusion},
  ];
  return {'@context':{prov:'http://www.w3.org/ns/prov#',xsd:'http://www.w3.org/2001/XMLSchema#',lab:'https://github.com/conanxin/anatomy-evidence-lab/ns#'},'@graph':graph,'lab:schema':'P6-COST-PROVENANCE/0.1','lab:scope':result.warning};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const flag=(name,fallback)=>{const i=process.argv.indexOf(`--${name}`);return i<0?fallback:process.argv[i+1];};
  const dataset=flag('dataset','tradeoff');
  if(!PRESETS[dataset])throw new RangeError('Unknown dataset: '+dataset);
  const preset=PRESETS[dataset];
  const weights={node:Number(flag('node-weight','5')),comparison:Number(flag('comparison-weight','1'))};
  let sourceRevision='UNPINNED';
  try{sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',cwd:path.dirname(fileURLToPath(import.meta.url)),stdio:['ignore','pipe','ignore']}).trim();}catch{}
  const data=makeCostProvenance({keys:preset.keys,query:preset.query,weights,timestamp:new Date().toISOString(),sourceRevision});
  const out=new URL('../artifacts/cost-run.jsonld',import.meta.url);
  await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
  await writeFile(out,JSON.stringify(data,null,2)+'\n');
  console.log(`P6 cost run: ${fileURLToPath(out)} (${dataset}; node=${weights.node}, comparison=${weights.comparison})`);
}
