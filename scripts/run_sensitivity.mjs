#!/usr/bin/env node
/** P7 reproducible finite-grid analysis. The prereg plan is already committed. */
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { runP7Sensitivity, p7Dataset, P7_PROTOCOL } from '../src/sensitivity.js';
const out = new URL('../artifacts/', import.meta.url);
const docs = new URL('../docs/P7_RESULTS.md', import.meta.url);
const sha256 = x => createHash('sha256').update(x).digest('hex');
const sourcePaths = ['src/btree.js','src/comparison.js','src/cost-model.js','src/sensitivity.js'];
const sourceHashes = Object.fromEntries(await Promise.all(sourcePaths.map(async p=>[p,sha256(await readFile(new URL('../'+p,import.meta.url)))])));
const p = runP7Sensitivity();
const datasets = {};
for (const size of P7_PROTOCOL.sizes) for (const seed of P7_PROTOCOL.seeds) {
  datasets[`n${size}-s${seed}`]=sha256(JSON.stringify(p7Dataset(size,seed,'ascending')));
}
const digest = sha256(JSON.stringify(P7_PROTOCOL));
const report = {
  schema:'ANATOMY-P7-SENSITIVITY/1.0',
  status:'COMPLETE_SYNTHETIC_GRID_NO_REAL_WORKLOADS',
  scope:'Correlated finite deterministic design cells; not a random workload, benchmark, independent statistical sampling unit, or causal result',
  designLockCommit:P7_PROTOCOL.preregistrationCommit,
  designHashSHA256:digest,
  sourceSHA256:sourceHashes,
  datasetSHA256:datasets,
  summary:p.summary,
  rows:p.rows,
};
const fields=['id','size','seed','order','probe','query','found','category','dv','dk','visitsT2','comparesT2','nodesT2','heightT2','visitsT3','comparesT3','nodesT3','heightT3'];
const escapeCSV=x=>{const s=String(x);return /[",\n\r]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;};
const csv=fields.join(',')+'\n'+p.rows.map(x=>[
  x.id,x.size,x.seed,x.order,x.probe,x.query,x.found,x.category,x.dv,x.dk,
  x.t2.visits,x.t2.comparisons,x.t2.nodes,x.t2.levels,x.t3.visits,x.t3.comparisons,x.t3.nodes,x.t3.levels
].map(escapeCSV).join(',')).join('\n')+'\n';
const categories=['t2-dominates','t3-dominates','tradeoff','identical'];
function table(group, title){
  return `## ${title}\n\n| Group | t=2 dominates | t=3 dominates | Tradeoff | Identical | Total |\n|---|---:|---:|---:|---:|---:|\n`+
  Object.entries(group).map(([k,v])=>`| ${k} | ${categories.map(c=>v[c]).join(' | ')} | ${categories.reduce((acc,c)=>acc+v[c],0)} |`).join('\n')+'\n';
}
const summary=p.summary;
const markdown=`# P7 Results | Frozen finite-grid sensitivity analysis\n\n> **Result status: COMPUTED, synthetic-only.** Design committed first: [P7 design lock](https://github.com/conanxin/anatomy-evidence-lab/blob/${P7_PROTOCOL.preregistrationCommit}/docs/P7_DESIGN_LOCK.md). Exact design SHA-256: \`${digest}\`.\n\n## Primary endpoint\n\nTradeoffs: **${summary.counts.tradeoff}/${summary.total} (${(100*summary.tradeoffRate).toFixed(2)}%)**. This is the proportion **within these 288 correlated synthetic scenarios only**. There is no sampling-based confidence interval, inference to production databases, speed, disk I/O, nor user learning effect. The original P6 42-key reversal was a hand-selected teaching counterexample and **is not counted as an independent unit here**.\n\n## Exhaustive paired categories\n\n| Category | Cases | Share |\n|---|---:|---:|\n${categories.map(c=>`| ${c} | ${summary.counts[c]} | ${(100*summary.counts[c]/summary.total).toFixed(2)}% |`).join('\n')}\n\n${table(summary.bySize,'By number of inserted keys')}\n${table(summary.byOrder,'By insertion order')}\n${table(summary.byFound,'By search result')}\n\n## Interpretation and possible sources of error\n\n- **Pareto dominates** means no worse on both model-count metrics and strictly better on at least one. **Tradeoff** means fewer visits but more key comparisons, or the reverse; either candidate could score lower when fictional weights change. **Identical** means both raw metrics exactly match.\n- Different seeds within each n share a deterministic mechanism; six probes from the same tree share nodes. Treat cells as correlated, not independent samples. Therefore percentages by category are descriptive of a **designed finite grid**, not statistical estimates of a broader population.\n- A degree-3 B-tree can be shallower while producing more comparisons within a node. It is invalid to call these counts measured storage I/O or wall clock speed. NIST defines a B-tree as a balanced multiway search tree [NIST DADS](https://xlinux.nist.gov/dads/HTML/btree.html).\n- 42-key P6 intentionally selected reversal is retained as a pedagogical example; P7 includes all 288 preregistered queries and does not discard inconvenient results.\n- The browser heatmap uses 4×4 **hypothetical** positive integer weight pairs (1,2,5,10). No lab trial or participant responses were collected.\n\n## Reproduction\n\n\`npm run analysis:p7\` writes the machine-readable artifacts/p7-sensitivity.json, 288-row artifacts/p7-sensitivity.csv, and this markdown. The JSON includes the design lock commit, SHA-256 of input-generating sources, protocol and 16 keysets. No timestamps or fabricated human subjects appear in the deterministic record.\n\n**Evaluation:** STUDY_STATUS=NO_PARTICIPANT_DATA. Both study arm previews are implementation kits, not a deployed randomized trial.\n`;
await mkdir(out,{recursive:true});
await writeFile(new URL('p7-sensitivity.json',out),JSON.stringify(report,null,2)+'\n');
await writeFile(new URL('p7-sensitivity.csv',out),csv);
await writeFile(docs,markdown.replaceAll('\x7f','`'));
console.log(`P7_GRID_PASS: ${summary.total} paired query scenarios, ${summary.counts.tradeoff} tradeoffs, ${(100*summary.tradeoffRate).toFixed(2)}% within the fixed synthetic grid`);
console.log(`P7_EXPORT_PASS: JSON + CSV (${p.rows.length} rows) + docs/P7_RESULTS.md; protocol SHA-256 ${digest}`);
