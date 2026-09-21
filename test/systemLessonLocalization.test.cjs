const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
class Element {
  constructor(){this.children=[];this.attrs={};this.classList={contains:()=>false};}
  append(...nodes){this.children.push(...nodes);}
  setAttribute(key,value){this.attrs[key]=value;}
  addEventListener(){}
  remove(){}
}
function fixture(lang){
  const c=vm.createContext({window:{_parryLesson:{seen:true,active:false}},OPT:{lang},
    location:{search:''},URLSearchParams,document:{body:new Element(),createElement:()=>new Element(),getElementById:()=>null},
    G:{on:true,stage:0},P:{hp:100},INV:{bag:[],equipped:{}},BINDS:{interact:'KeyR'},BINDS2:{},
    keyName:code=>code.replace('Key',''),_EDITOR_MODE:false,_MAP_QA_MODE:false,_bossTestReq:-1,_saving:false});
  c._L=(ko,en,values={})=>(c.OPT.lang==='ko'?ko:en).replace(/\{(\w+)\}/g,(all,key)=>values[key]??all);
  vm.runInContext(fs.readFileSync('system-lesson.js','utf8'),c);
  const lesson=c.window._systemLesson;lesson.tick();return {c,lesson};
}
function texts(el){return [el.textContent||'',...Object.values(el.attrs),...el.children.flatMap(texts)].join('\n');}
test('English system lessons translate every step, status and controls',()=>{
  const {c,lesson}=fixture('en');
  assert.match(lesson.hint.textContent,/\[R\]/);
  for(const step of lesson.steps){
    assert.doesNotMatch(texts(lesson.panel),/[가-힣]/);
    lesson.record(step.id);
  }
  assert.doesNotMatch(texts(lesson.panel),/[가-힣]/);
  assert.equal(lesson.checks.size,7);
  assert.equal(c.P.hp,100);
});
test('Open system lesson changes language while preserving progress and DOM children',()=>{
  const {c,lesson}=fixture('ko');lesson.skip.onclick();
  const nodes=lesson.body.children.slice();
  c.OPT.lang='en';lesson.tick();
  assert.doesNotMatch(texts(lesson.panel),/[가-힣]/);
  assert.equal(lesson.skipped.has('pickup'),true);
  assert.deepEqual(lesson.body.children,nodes);
  c.OPT.lang='ko';lesson.tick();assert.match(lesson.title.textContent,/[가-힣]/);
});
