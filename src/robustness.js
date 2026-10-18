/**
 * P8 fixed-grid rank-invariance / insertion order / query-mix robustness audit.
 * Design publicly locked BEFORE evaluation: docs/P8_DESIGN_LOCK.md,
 * GitHub commit df2dbc3ed06c320e1c0ed7693f6cd0e4f96cdede.
 * This is synthetic and correlated, never a real database workload estimate.
 */
import { fromKeys, searchTrace, validateTree, search } from './btree.js';
import { p7Dataset, p7Classify } from './sensitivity.js';

export const P8_PROTOCOL = Object.freeze({
  id: 'ANATOMY-P8-ROBUSTNESS/1.0',
  designCommit: 'df2dbc3ed06c320e1c0ed7693f6cd0e4f96cdede',
  sizes: Object.freeze([25,42,80]),
  seeds: Object.freeze([7,19,37,101]),
  spacing: Object.freeze(['baseline-even','clustered-gap','expanding-gap']),
  orders: Object.freeze(['ascending','descending','shuffled','bursty']),
  probes: Object.freeze(['hit-min','hit-median','hit-max','miss-below','miss-between','miss-above']),
  mixes: Object.freeze({
    balanced: Object.freeze([1,1,1,1,1,1]),
    'hit-heavy': Object.freeze([3,3,3,1,1,1]),
    'miss-heavy': Object.freeze([1,1,1,3,3,3]),
    'edge-heavy': Object.freeze([3,1,3,3,1,3]),
  }),
  source: 'Finite synthetic key rank and lookup-design experiment, NOT real-world prevalence or measured latency/I/O.',
});

function demand(ok, why) { if (!ok) throw new Error(why); }
function requireChoice(list,value,field) {
  if (!list.includes(value)) throw new RangeError(`${field} outside preregistered P8 design`);
}
const isEq = (a,b) => JSON.stringify(a)===JSON.stringify(b);
const metrics = (trace,tree) => ({
  visits:trace.steps.filter(x=>x.type==='visit').length,
  comparisons:trace.steps.filter(x=>x.type==='compare').length,
  levels:validateTree(tree).height,
  nodes:validateTree(tree).nodes,
});

export function p8Dataset(size,seed,spacing,order) {
  requireChoice(P8_PROTOCOL.sizes,size,'size');
  requireChoice(P8_PROTOCOL.seeds,seed,'seed');
  requireChoice(P8_PROTOCOL.spacing,spacing,'spacing');
  requireChoice(P8_PROTOCOL.orders,order,'order');
  const base=p7Dataset(size,seed,'ascending');
  const mapped=base.map((k,i)=>spacing==='baseline-even' ? k :
    spacing==='clustered-gap' ? k+300*Math.floor(3*i/size) : k*k);
  demand(mapped.every((key,i)=>Number.isSafeInteger(key) && key%2===0 && (i===0 || key>mapped[i-1])), 'Invalid monotonic spacing transform');
  if (order==='ascending') return [...mapped];
  if (order==='descending') return [...mapped].reverse();
  if (order==='shuffled') {
    const byKey=new Map(base.map((k,i)=>[k,mapped[i]]));
    return p7Dataset(size,seed,'shuffled').map(k=>byKey.get(k));
  }
  const blocks=[];
  for(let i=0;i<mapped.length;i+=5)blocks.push(mapped.slice(i,i+5));
  return [...blocks.filter((_,i)=>i%2===0),...blocks.filter((_,i)=>i%2===1)].flat();
}
export function p8Probe(keys,probe) {
  requireChoice(P8_PROTOCOL.probes,probe,'probe');
  if (!Array.isArray(keys) || !keys.length || new Set(keys).size!==keys.length) throw new RangeError('Nonempty unique keys required');
  const ordered=[...keys].sort((a,b)=>a-b);
  const mid=ordered[Math.floor(ordered.length/2)];
  const options={
    'hit-min':ordered[0], 'hit-median':mid, 'hit-max':ordered.at(-1),
    'miss-below':ordered[0]-1, 'miss-between':mid+1, 'miss-above':ordered.at(-1)+1,
  };
  const query=options[probe],found=probe.startsWith('hit-');
  demand(new Set(keys).has(query)===found,'Probe membership assumption failed');
  return {query,found};
}

/** Independently traverses the actual B-tree without calling searchTrace. */
export function p8IndependentOracle(tree,key) {
  if (!Number.isSafeInteger(key)) throw new TypeError('Key must be safe integer');
  let node=tree.root;
  const nodeIds=[],compared=[];
  while(node){
    nodeIds.push(node.id);
    let i=0;
    while(i<node.keys.length){
      compared.push(node.keys[i]);
      if(key===node.keys[i])return {found:true,nodeIds,compared,nodeId:node.id};
      if(key<node.keys[i])break;
      i++;
    }
    node=node.leaf?null:node.children[i];
  }
  return {found:false,nodeIds,compared,nodeId:null};
}
export function p8VerifyOracle(tree,key,trace,insertedKeys) {
  const truth=new Set(insertedKeys).has(key);
  const oracle=p8IndependentOracle(tree,key);
  const actual=search(tree,key);
  demand(validateTree(tree).valid,'Tree invariants failed');
  demand(oracle.found===truth && actual.found===truth && trace.found===truth,'Independent membership disagrees');
  demand(isEq(oracle.nodeIds,trace.steps.filter(x=>x.type==='visit').map(x=>x.nodeId)),'Independent visited-node IDs disagree');
  demand(isEq(oracle.compared,trace.steps.filter(x=>x.type==='compare').map(x=>x.comparedKey)),'Independent comparisons disagree');
  demand(oracle.nodeId===trace.nodeId,'Independent terminal node disagrees');
  const terminal=trace.steps.at(-1)?.type;
  demand(terminal===(truth?'found':'miss'),'Incorrect terminal trace event');
  return {passed:true,oracle};
}
export function p8Case(size,seed,spacing,order,probe) {
  const keys=p8Dataset(size,seed,spacing,order);
  const {query,found}=p8Probe(keys,probe);
  const cases=[2,3].map(t=>{
    const tree=fromKeys(keys,t),trace=searchTrace(tree,query);
    p8VerifyOracle(tree,query,trace,keys);
    return metrics(trace,tree);
  });
  const [t2,t3]=cases,dv=t3.visits-t2.visits,dk=t3.comparisons-t2.comparisons;
  return {id:`P8-n${size}-s${seed}-${spacing}-${order}-${probe}`,
    size,seed,spacing,order,probe,query,found,t2,t3,dv,dk,category:p7Classify(dv,dk)};
}

export const P8_CATEGORIES=Object.freeze(['t2-dominates','t3-dominates','tradeoff','identical']);
function freshCounts() {return Object.fromEntries(P8_CATEGORIES.map(cat=>[cat,0]));}
function collect(records,field,values) {
  const map=Object.fromEntries(values.map(v=>[String(v),freshCounts()]));
  records.forEach(row=>map[String(row[field])][row.category]++);
  return map;
}
function signature(row){return [row.t2.visits,row.t2.comparisons,row.t3.visits,row.t3.comparisons,row.dv,row.dk,row.category];}
export function p8WeightedSummary(rows,mix='balanced',order=null) {
  const weights=P8_PROTOCOL.mixes[mix];
  if(!weights)throw new RangeError('Unknown P8 query mix');
  if(order!==null)requireChoice(P8_PROTOCOL.orders,order,'order');
  const counts=freshCounts();let denominator=0;
  for(const row of rows){
    if(order!==null && row.order!==order)continue;
    const w=weights[P8_PROTOCOL.probes.indexOf(row.probe)];
    demand(w>0,'Unknown P8 probe');
    counts[row.category]+=w;denominator+=w;
  }
  return {mix,order,denominator,counts,tradeoffRate:denominator ? counts.tradeoff/denominator : null};
}
export function p8Summarize(rows) {
  if(!Array.isArray(rows))throw new TypeError('Records array required');
  const seen=new Set(),counts=freshCounts(),group=new Map();
  for(const row of rows){
    demand(!seen.has(row.id),'Duplicate P8 ID'); seen.add(row.id);
    demand(P8_CATEGORIES.includes(row.category) && p7Classify(row.dv,row.dk)===row.category,'Invalid category');
    counts[row.category]++;
    const key=`n${row.size}-s${row.seed}-${row.order}-${row.probe}`;
    if(!group.has(key))group.set(key,[]);
    group.get(key).push(row);
  }
  let mismatches=0,incompleteGroups=0;
  const collapsed=freshCounts();
  for(const replicas of group.values()){
    if(replicas.length!==3 || new Set(replicas.map(x=>x.spacing)).size!==3){incompleteGroups++;continue;}
    if(!replicas.every(x=>isEq(signature(x),signature(replicas[0]))))mismatches++;
    collapsed[replicas[0].category]++;
  }
  const byFound={hit:freshCounts(),miss:freshCounts()};
  for(const row of rows)byFound[row.found?'hit':'miss'][row.category]++;
  const mixes=Object.fromEntries(Object.keys(P8_PROTOCOL.mixes).map(mix=>[mix,p8WeightedSummary(rows,mix)]));
  const byOrderMix=Object.fromEntries(P8_PROTOCOL.orders.map(order=>[order,
    Object.fromEntries(Object.keys(P8_PROTOCOL.mixes).map(mix=>[mix,p8WeightedSummary(rows,mix,order)]))]));
  return {total:rows.length,counts,tradeoffRate:rows.length ? counts.tradeoff/rows.length:null,
    rankDesigns:group.size,rankCounts:collapsed,spacingInvariantGroups:group.size-mismatches-incompleteGroups,
    spacingMismatches:mismatches,incompleteGroups,
    bySpacing:collect(rows,'spacing',P8_PROTOCOL.spacing),byOrder:collect(rows,'order',P8_PROTOCOL.orders),
    bySize:collect(rows,'size',P8_PROTOCOL.sizes),byFound,mixes,byOrderMix};
}
export function runP8Robustness(){
  const rows=[];
  for(const size of P8_PROTOCOL.sizes)
    for(const seed of P8_PROTOCOL.seeds)
      for(const spacing of P8_PROTOCOL.spacing)
        for(const order of P8_PROTOCOL.orders)
          for(const probe of P8_PROTOCOL.probes)
            rows.push(p8Case(size,seed,spacing,order,probe));
  const summary=p8Summarize(rows);
  demand(summary.total===864 && summary.rankDesigns===288 && summary.incompleteGroups===0,'Locked grid incomplete');
  demand(Object.values(summary.counts).reduce((s,n)=>s+n,0)===864,'Category counts must reconcile');
  return {protocol:P8_PROTOCOL,summary,rows};
}
