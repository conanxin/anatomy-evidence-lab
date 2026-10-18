/**
 * P6 question bank for a future A/B comprehension study.
 * Both conditions MUST use the identical questions, scoring key, and exposure time.
 * No participant responses are stored or transmitted by the demo page.
 */
export const LEARNING_QUESTIONS = Object.freeze([
  Object.freeze({id:'Q-BASELINE', zh:'在固定 25 键数据中，查询 24 时，哪个模型访问较少节点？', en:'On the 25-key baseline, which degree visits fewer nodes when searching for 24?', answer:'t2', options:[{value:'t2',zh:'t = 2',en:'t = 2'},{value:'t3',zh:'t = 3',en:'t = 3'},{value:'tie',zh:'持平',en:'Tie'}]}),
  Object.freeze({id:'Q-NODE-WEIGHT', zh:'42 键反例查询 7，访问权重 5、比较权重 1，哪个教学分值更低？', en:'For the 42-key counterexample querying 7, weights 5 per visit and 1 per comparison, whose score is lower?', answer:'t3', options:[{value:'t2',zh:'t = 2',en:'t = 2'},{value:'t3',zh:'t = 3',en:'t = 3'},{value:'tie',zh:'持平',en:'Tie'}]}),
  Object.freeze({id:'Q-KEY-WEIGHT', zh:'同一反例查询 7，访问权重 1、比较权重 5，哪个教学分值更低？', en:'On the same counterexample, weights 1 per visit and 5 per comparison, whose score is lower?', answer:'t2', options:[{value:'t2',zh:'t = 2',en:'t = 2'},{value:'t3',zh:'t = 3',en:'t = 3'},{value:'tie',zh:'持平',en:'Tie'}]}),
  Object.freeze({id:'Q-IMMUTABLE', zh:'只调整分值权重，会改变原来的 B-tree 节点结构或检索轨迹吗？', en:'Does changing only score weights alter the original B-tree structure or search trace?', answer:'no', options:[{value:'yes',zh:'会',en:'Yes'},{value:'no',zh:'不会',en:'No'}]}),
  Object.freeze({id:'Q-REALITY', zh:'此处的教学分值等同于数据库在真实硬件上的延迟吗？', en:'Are these fictional score points equal to measured database latency on real hardware?', answer:'no', options:[{value:'yes',zh:'是',en:'Yes'},{value:'no',zh:'否',en:'No'}]}),
]);
export function gradeQuiz(answers){
  if(!answers || typeof answers!=='object' || Array.isArray(answers))throw new TypeError('Answers object required');
  const details=LEARNING_QUESTIONS.map(q=>{
    const value=answers[q.id]??'';
    if(typeof value!=='string' || (value!==''&&!q.options.some(x=>x.value===value)))throw new RangeError(`Invalid choice ${q.id}`);
    return {id:q.id,answered:value!=='',correct:value===q.answer};
  });
  return {total:details.length,answered:details.filter(d=>d.answered).length,correct:details.filter(d=>d.correct).length,details};
}

/**
 * Aggregates real, explicitly supplied responses only. It never invents users.
 * This is a descriptive summary and cannot establish a causal learning effect.
 * Each row: {participantId, condition:'static'|'interactive', answers:{...}}.
 */
export function aggregateStudy(responses){
  if(!Array.isArray(responses))throw new TypeError('A list of real response rows is required');
  const ids=new Set();
  const labels=['static','interactive'];
  const groups=Object.fromEntries(labels.map(name=>[name,[]]));
  for(const row of responses){
    if(!row || typeof row.participantId!=='string'||!row.participantId.trim()||ids.has(row.participantId)){
      throw new RangeError('Each participant must have a unique nonblank pseudonymous ID');
    }
    ids.add(row.participantId);
    if(!labels.includes(row.condition))throw new RangeError('Condition must be static or interactive');
    const scored=gradeQuiz(row.answers);
    if(scored.answered!==scored.total)throw new RangeError('Incomplete questionnaires must be handled explicitly, not silently discarded');
    groups[row.condition].push(scored);
  }
  return {
    schema:'P6-STUDY-SUMMARY/0.1',
    status:responses.length?'RESPONSES_SUMMARIZED':'NO_PARTICIPANT_DATA',
    caution:'Descriptive results only. Nonrandom assignment and missing responses can bias comparisons. This summary is not a causal inference.',
    groups:Object.fromEntries(labels.map(name=>{
      const items=groups[name],n=items.length;
      return [name,{n,meanCorrect:n?items.reduce((sum,s)=>sum+s.correct,0)/n:null,
        meanProportionCorrect:n?items.reduce((sum,s)=>sum+s.correct,0)/(n*LEARNING_QUESTIONS.length):null,
        itemCorrect:Object.fromEntries(LEARNING_QUESTIONS.map(q=>[q.id,n?items.filter(s=>s.details.find(d=>d.id===q.id).correct).length:null]))}];
    })),
  };
}
