import test from 'node:test';
import assert from 'node:assert/strict';
import {LEARNING_QUESTIONS,gradeQuiz} from '../src/learning.js';

test('comprehension study has stable five bilingual questions',()=>{
 assert.equal(LEARNING_QUESTIONS.length,5);
 assert.equal(new Set(LEARNING_QUESTIONS.map(x=>x.id)).size,5);
 for(const q of LEARNING_QUESTIONS){
  assert.ok(q.zh&&q.en&&q.options.length>1);
  assert.ok(q.options.some(o=>o.value===q.answer));
  assert.ok(q.options.every(o=>o.zh&&o.en));
 }
});
test('answer key agrees with documented real-model arithmetic',()=>{
 assert.deepEqual(LEARNING_QUESTIONS.map(q=>q.answer),['t2','t3','t2','no','no']);
});
test('all correct responses yield perfect score (synthetic unit fixture, not participants)',()=>{
 const answers=Object.fromEntries(LEARNING_QUESTIONS.map(q=>[q.id,q.answer]));
 const s=gradeQuiz(answers);
 assert.equal(s.correct,5);assert.equal(s.answered,5);assert.equal(s.total,5);
});
test('blank answers are not treated as real responses or scored as correct',()=>{
 assert.deepEqual(Object.fromEntries(Object.entries(gradeQuiz({})).filter(([k])=>k!=='details')),{total:5,answered:0,correct:0});
});
test('partial answers compute answered separately from correct',()=>{
 const s=gradeQuiz({'Q-BASELINE':'t2','Q-KEY-WEIGHT':'t3'});
 assert.equal(s.correct,1);assert.equal(s.answered,2);
});
test('invalid responses are rejected to prevent untrustworthy aggregate scoring',()=>{
 assert.throws(()=>gradeQuiz([]));assert.throws(()=>gradeQuiz(null));
 assert.throws(()=>gradeQuiz({'Q-BASELINE':'nonexistent'}));
});

import {aggregateStudy} from '../src/learning.js';
test('no participant data yields null outcomes, not invented zero-percent responses',()=>{
 const s=aggregateStudy([]);
 assert.equal(s.status,'NO_PARTICIPANT_DATA');
 for(const group of Object.values(s.groups)){
  assert.equal(group.n,0);assert.equal(group.meanCorrect,null);assert.equal(group.meanProportionCorrect,null);
 }
});
test('real supplied, pseudonymous rows yield descriptive statistics only (synthetic test fixtures)',()=>{
 const good=Object.fromEntries(LEARNING_QUESTIONS.map(q=>[q.id,q.answer]));
 const wrong={...good,'Q-BASELINE':'t3','Q-IMMUTABLE':'yes'};
 const s=aggregateStudy([{participantId:'synthetic-fixture-a',condition:'static',answers:wrong},{participantId:'synthetic-fixture-b',condition:'interactive',answers:good}]);
 assert.equal(s.groups.static.n,1);assert.equal(s.groups.interactive.n,1);
 assert.equal(s.groups.static.meanCorrect,3);assert.equal(s.groups.interactive.meanCorrect,5);
 assert.match(s.caution,/not a causal inference/);
});
test('invalid or incomplete participants are rejected instead of silently biasing means',()=>{
 assert.throws(()=>aggregateStudy([{}]));
 assert.throws(()=>aggregateStudy([{participantId:'a',condition:'static',answers:{}}]),/Incomplete/);
 const a=Object.fromEntries(LEARNING_QUESTIONS.map(q=>[q.id,q.answer]));
 assert.throws(()=>aggregateStudy([{participantId:'same',condition:'static',answers:a},{participantId:'same',condition:'interactive',answers:a}]),/unique/);
});
