#!/usr/bin/env node
/** A small PROV-O-inspired JSON-LD export of a *real execution* of createComparison.
 * This is a partial PROV vocabulary mapping, not an OWL/RDF conformance claim.
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DEFAULT_KEYS } from '../src/btree.js';
import { createComparison } from '../src/comparison.js';

export const sha256 = text => createHash('sha256').update(text).digest('hex');

export function makeProvenance({ keys = DEFAULT_KEYS, query = 24, timestamp, actor = 'anatomy-evidence-lab-cli', sourceRevision = 'UNPINNED' } = {}) {
  if (!timestamp || Number.isNaN(Date.parse(timestamp)) || !/^\d{4}-\d{2}-\d{2}T/.test(timestamp)) throw new Error('An explicit ISO timestamp is required for provenance');
  const comparison = createComparison(keys, query);
  const canonicalInput = JSON.stringify({ keys: comparison.keys, query });
  const inputSha = sha256(canonicalInput);
  const runId = `urn:conanxin:anatomy:run:${inputSha.slice(0,16)}:${timestamp.replace(/[^0-9TZ]/g, '')}`;
  const inputId = `urn:conanxin:anatomy:input:${inputSha}`;
  const agentId = `urn:conanxin:anatomy:agent:${encodeURIComponent(actor)}`;
  const graph = [
    { '@id': agentId, '@type': 'prov:Agent', 'lab:agentLabel': actor },
    { '@id': inputId, '@type': 'prov:Entity', 'lab:inputSha256': inputSha, 'lab:insertionOrderJSON': JSON.stringify(comparison.keys), 'lab:query': query },
    { '@id': runId, '@type': 'prov:Activity', 'prov:startedAtTime': { '@value': timestamp, '@type': 'xsd:dateTime' }, 'prov:used': { '@id': inputId }, 'prov:wasAssociatedWith': { '@id': agentId }, 'lab:codeRevision': sourceRevision },
    ...comparison.cases.map(item => ({ '@id': `urn:conanxin:anatomy:model:${item.scenarioId}`, '@type': 'prov:Entity', 'prov:wasGeneratedBy': { '@id': runId }, 'prov:wasDerivedFrom': { '@id': inputId }, 'lab:scenarioId': item.scenarioId, 'lab:minDegree': item.degree, 'lab:nodeVisits': item.visits, 'lab:keyComparisons': item.comparisons, 'lab:treeHeight': item.stats.height, 'lab:found': item.found })),
  ];
  return { '@context': { prov: 'http://www.w3.org/ns/prov#', xsd: 'http://www.w3.org/2001/XMLSchema#', lab: 'https://github.com/conanxin/anatomy-evidence-lab/ns#' }, '@graph': graph, 'lab:scope': comparison.scope, 'lab:schema': 'P5-LAB-PROVENANCE/0.1' };
}

async function main() {
  const queryFlag = process.argv.indexOf('--query');
  const query = queryFlag >= 0 ? Number(process.argv[queryFlag + 1]) : 24;
  const actor = 'anatomy-evidence-lab-cli';
  let revision = 'UNPINNED';
  try {revision = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',cwd:path.dirname(fileURLToPath(import.meta.url)),stdio:['ignore','pipe','ignore']}).trim();}catch{}
  const data = makeProvenance({ query, timestamp: new Date().toISOString(), actor, sourceRevision: revision });
  const dir = new URL('../artifacts/',import.meta.url);
  await mkdir(dir,{recursive:true});
  const out = new URL('comparison-run.jsonld',dir);
  await writeFile(out,JSON.stringify(data,null,2)+'\n');
  console.log(`JSON-LD export: ${fileURLToPath(out)} · input SHA-256 ${data['@graph'][1]['lab:inputSha256']}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
