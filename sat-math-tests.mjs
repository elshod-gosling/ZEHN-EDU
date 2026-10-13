import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const bankSource=fs.readFileSync('dist/sat-math.js','utf8');
const bankContext=vm.createContext({Math});vm.runInContext(bankSource,bankContext);
const bank=vm.runInContext('SATMath',bankContext);
assert.equal(bank.questions.length,32);
assert.equal(new Set(bank.questions.map(q=>q.id)).size,32,'Each question has a stable, unique progress ID');
assert.equal(bank.questions.filter(q=>q.kind==='constant'||q.a>0).length,24);

// Derive solutions independently from the coefficients, rather than trusting the answer key.
for(const q of bank.questions){
  let expected;
  const discriminant=q.b*q.b-4*q.a*q.c;
  const vertex=-q.b/(2*q.a);
  switch(q.kind){
    case 'evaluate':expected=q.a*q.x*q.x+q.b*q.x+q.c;break;
    case 'solveLinear':expected=(q.rhs-q.n)/q.m;break;
    case 'constant':expected=q.r1*q.r2;break;
    case 'vertexX':expected=vertex;break;
    case 'vertexY':assert(q.a>0,'Minimum-value questions must open upward');expected=q.a*vertex*vertex+q.b*vertex+q.c;break;
    case 'solutionCount':expected=discriminant<0?0:discriminant===0?1:2;break;
    case 'sumRoots':assert(discriminant>=0);expected=-q.b/q.a;break;
    case 'productRoots':assert(discriminant>=0);expected=q.c/q.a;break;
    default:{assert(discriminant>=0);const roots=[(-q.b-Math.sqrt(discriminant))/(2*q.a),(-q.b+Math.sqrt(discriminant))/(2*q.a)];expected=q.kind==='smallerRoot'?Math.min(...roots):Math.max(...roots);if(q.kind==='positiveRoot')assert(expected>0);}
  }
  assert.equal(q.answer,expected,`Correct answer for ${q.id}`);
  assert(bank.matches(q,String(expected)));
  assert(!bank.matches(q,String(expected+1)));
  assert(!bank.matches(q,''),'Blank input must not solve a zero-answer question');
  for(const language of ['en','uz','ru']){
    assert(bank.prompt(q,language).length>5);
    assert(bank.hint(q,language).length>10);
    assert(!/undefined|\{x\}/.test(bank.prompt(q,language)+bank.hint(q,language)+bank.equation(q)));
  }
}
const fractional=bank.questions.find(q=>q.answer===.5);
for(const value of ['.5','0.5','0,5','1/2',' +1 / +2 '])assert(bank.matches(fractional,value));
assert.equal(bank.parseAnswer('−3'),-3);
for(const value of ['', ' ', '1/0','0/0','1/2/3','Infinity','NaN','0x5','1e309','alert(1)','1,2,3'])assert.equal(bank.parseAnswer(value),null,`Reject ${value}`);

let seed=17;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2**32;};
const deck=bank.createDeck(random),first=Array.from({length:32},()=>deck.next()),second=Array.from({length:32},()=>deck.next());
assert.equal(new Set(first.map(q=>q.id)).size,32,'No question repeats before the full deck is seen');
assert.equal(new Set(second.map(q=>q.id)).size,32);
assert.notEqual(first.at(-1).id,second[0].id,'No immediate repeat at a shuffle boundary');
assert.notDeepEqual(first.map(q=>q.id),bank.questions.map(q=>q.id),'Display order is shuffled');
assert.notDeepEqual(first.map(q=>q.id),second.map(q=>q.id),'Each cycle reshuffles');

// Reopen an existing browser profile: migrate both old math awards without losing XP.
const values=new Map([['levelup-progress',JSON.stringify({completed:['coding-python','math-linear','math-quadratic'],days:['2026-10-12']})]]);
const nodes=new Map();const element=selector=>{if(!nodes.has(selector))nodes.set(selector,{style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelectorAll(){return []},focus(){},open:false,innerHTML:'',textContent:''});return nodes.get(selector);};
const context=vm.createContext({console,Intl,Date,Math,Set,Array,JSON,Number,String,document:{querySelector:element,querySelectorAll(){return []},addEventListener(){},documentElement:{}},navigator:{languages:['en']},localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)},setTimeout,clearTimeout,setInterval,clearInterval});
vm.runInContext(bankSource,context);vm.runInContext(fs.readFileSync('dist/app.js','utf8').replace(/render\(\);\s*$/,''),context);
const migrated=JSON.parse(values.get('levelup-progress'));
assert.deepEqual(migrated.completed,['coding-python','math-sat-01','math-sat-02']);assert.deepEqual(migrated.days,['2026-10-12']);
assert.equal(vm.runInContext('allowedQuestIds.length',context),40);
assert.equal(vm.runInContext("unlocked('math')",context),true,'Existing math completion still unlocks the arena');
assert.equal(vm.runInContext("award('math-sat-01')",context),false,'Migrated awards cannot be earned twice');
assert.equal(vm.runInContext("award('math-sat-03')",context),true);
assert.equal(vm.runInContext("award('math-sat-03')",context),false);
assert.equal(nodes.get('#total-xp').textContent,'200 XP');
console.log('PASS: 32 independently checked answers, three-language prompts/hints, fractions and invalid input, no-repeat shuffled decks, legacy progress migration and XP deduplication.');
