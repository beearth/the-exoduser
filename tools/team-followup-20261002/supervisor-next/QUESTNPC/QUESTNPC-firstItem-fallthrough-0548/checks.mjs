// One new boundary only: refused firstItem reaches existing boss_summon T4.
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
const repo='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=t=>createHash('sha256').update(t).digest('hex');
const receipts=[],sources=[],cases=[];
function oneIndex(text, needle, from = 0) {
  const i = text.indexOf(needle, from);
  assert.ok(i >= 0, 'source marker missing: ' + needle);
  assert.equal(text.indexOf(needle, i + needle.length), -1, 'source marker ambiguous: ' + needle);
  return i;
}
function fragment(file, source, name, from, to) {
  assert.ok(to > from);
  const text = source.slice(from, to);
  const r = { file, name, fromLine: source.slice(0, from).split('\n').length,
    toLine: source.slice(0, to - 1).split('\n').length, sha256: sha(text) };
  receipts.push(r);
  return text;
}
function between(file, source, name, first, last) {
  const start = oneIndex(source, first);
  return fragment(file, source, name, start, oneIndex(source, last, start + first.length));
}
function functionText(file, source, name) {
  const start = oneIndex(source, 'function ' + name + '(');
  const brace = source.indexOf('{', start);
  let depth = 0, mode = '';
  for (let i = brace; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (mode === 'line') { if (c === '\n') mode = ''; continue; }
    if (mode === 'block') { if (c === '*' && n === '/') { mode = ''; i++; } continue; }
    if (mode) {
      if (c === '\\') { i++; continue; }
      if (c === mode) mode = '';
      continue;
    }
    if (c === '/' && n === '/') { mode = 'line'; i++; continue; }
    if (c === '/' && n === '*') { mode = 'block'; i++; continue; }
    if (c === "'" || c === '"' || c.charCodeAt(0) === 96) { mode = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return fragment(file, source, name, start, i + 1);
  }
  throw new Error('source function boundary changed: ' + name);
}

function parts(filename){
 const file=path.join(repo,filename),source=fs.readFileSync(file,'utf8');
 sources.push({path:file,sha256:sha(source)});
 const init=between(file,source,'all original pet state','const _petBubble=','// 대사 발동 함수');
 const priority=between(file,source,'priority constants','const _PET_TIER_COOL=','// id → 티어 추론');
 const diffStart=oneIndex(source,'const _diffSigned=');
 const diff=fragment(file,source,'real signed difficulty',diffStart,source.indexOf('\n',diffStart));
 const opStart=oneIndex(source,'const _PET_OP_MAX=');
 const op=fragment(file,source,'opacity constant',opStart,source.indexOf(';',opStart)+1);
 const full=functionText(file,source,'_checkPetDialogue');
 assert.ok(full.includes("_petBidCD('boss_summon'"));assert.ok(full.includes('_petFireBid(); // 프레임 경쟁'));
 const lines=full.split('\n').filter(l=>l.includes('if(!_petTut.firstItem&&INV.bag.length>=1)'));
 assert.equal(lines.length,1);const current=lines[0];
 assert.ok(current.includes('{_petTut.firstItem=true;_petSayCD('));assert.ok(current.endsWith(';return}'));
 const call=current.slice(current.indexOf('_petSayCD('),current.lastIndexOf(';return}'));
 const head=current.slice(0,current.indexOf('{'));
 const hold=head+'{if('+call+')_petTut.firstItem=true;return}';
 const fall=head+'{if('+call+'){_petTut.firstItem=true;return}}';
 const funcs=['_petTierOf','_petSay','_petSayCD','_petBidCD','_petSayUrgent','_petFireBid','_updatePetBubble','_petBagNext','updatePet','pickupItem','dst2'].map(n=>functionText(file,source,n)).join('\n');
 const guards=between(file,source,'real update guard prefix','function update(){','  // null 엔트리 정리');
 const pet=source.split('\n').filter(l=>l.trim().startsWith('if(G.pets)updatePet();'));assert.equal(pet.length,1);
 const petStart=source.indexOf(pet[0]);fragment(file,source,'real update pet call',petStart,petStart+pet[0].length);
 const summon=source.split('\n').filter(l=>l.trim().startsWith("case'summon':e.s='bossSummonWind';"));assert.equal(summon.length,1);
 const sumStart=source.indexOf(summon[0]);fragment(file,source,'original summon switch case',sumStart,sumStart+summon[0].length);
 return {file,init,priority,diff,op,funcs,guards,pet:pet[0],full,current,hold,fall,summon:summon[0]};
}
function env(p,variant){
 const ctx=vm.createContext({});
 vm.runInContext(`
 var trace={tick:0,says:[],bids:[],fires:[],shows:[],sfx:[],save:0,pickup:0,guide:0},subtitle={style:{opacity:'0'}};
 var G={on:true,paused:false,stage:0,frame:1,bossAlive:true,mats:20,pets:{crow:{},cat:{},xbow:{},iris:{}}},
 P={lv:1,hp:100,mhp:100,mp:100,mmp:100,st:100,mst:100,s:'idle',skills:{},x:0,y:0,sp:0,ap:0,rage:0},
 INV={bag:[],equipped:{}},STATS={str:0,dex:0,int:0,lck:0},ens=[],projs=[],ULT_SLOT=null,SI_TO_HELL={0:0},OPT={diff:5};
 G._bossRef={alive:true,hp:100,mhp:100,el:0,stunned:0,s:'idle',x:500,y:500,atk:1};
 ens.push(G._bossRef);
 var _dtSp=1,_MAP_QA_MODE=false,_DEMO_MODE=false,_DEMO_LAST_STAGE=3,_EDITOR_MODE=false;
 var window={_parryLesson:{tick(){return false}},_systemLesson:{tick(){},pickedUp(){trace.guide++}}};
 function $(id){return id==='petSubtitle'?subtitle:null}function _T(t){return t}
 function _petBubbleShow(who,txt){trace.shows.push({tick:trace.tick,who,txt})}
 function _petSfx(who,urgent){trace.sfx.push({tick:trace.tick,who,urgent})}
 function _updateOnePet(){}function _updateGhostXbow(){}function _updateGhostIris(){}
 function isJust(){return false}function _chkJust(){return false}
 function _itemSz(){return [1,1]}function _invFindSpace(){return {x:0,y:0}}function notify(){}
 function _rarName(r){return 'R'+r}function playItemPickupSfx(){trace.pickup++}function playEquipSfx(){}
 function recalcSt(){}function applyStats(){}function dbSaveForce(){trace.save++}
 function _grantOssuaryIfNeeded(){throw Error('unexpected bone')}function _boneRegister(){throw Error('unexpected bone')}
 function addTxt(){}var SFX={magic(){}};
 const NativeDate=Date;Date=class extends NativeDate{static now(){return 1700000000000}};
 `,ctx);
 const check=variant==='current'?p.full:p.full.replace(p.current,p[variant]);
 vm.runInContext([p.init,p.priority,p.diff,p.op,p.funcs,check,
 p.guards+'\nG.frame++;\n'+p.pet+'\n}',
 "function __summon(){let e=G._bossRef,tele=0;switch('summon'){"+p.summon+"}}"
 ].join('\n'),ctx);
 vm.runInContext(`
 const say=_petSay;_petSay=function(...a){const ok=say(...a);trace.says.push({tick:trace.tick,id:a[0],ok});return ok};
 const bid=_petBidCD;_petBidCD=function(...a){const out=bid(...a);trace.bids.push({tick:trace.tick,id:a[0],returned:out===undefined?'undefined':out,slot:_PB.id,tier:_PB.tier});return out};
 const fire=_petFireBid;_petFireBid=function(){const before={tier:_PB.tier,id:_PB.id};const out=fire();trace.fires.push({tick:trace.tick,before,returned:out===undefined?'undefined':out});return out};
 `,ctx);
 const run=t=>vm.runInContext(t,ctx);
 const snap=()=>JSON.parse(run('JSON.stringify({flag:_petTut.firstItem,flags:_petTut,bubble:_petBubble,cd:_petDlgCD,tiers:_petTierCD,pb:_PB,inFrame:_petInFrame,bag:INV.bag,equipped:INV.equipped,trace})'));
 const tick=n=>{for(let i=0;i<n;i++)run('trace.tick++;update()')};
 const pickup=id=>assert.equal(run("pickupItem({id:'"+id+"',slot:'headband',rarity:1,name:'ordinary fixture'})"),true);
 return {run,snap,tick,pickup};
}
function compact(s){return {...s,trace:{...s.trace,says:s.trace.says.filter(x=>x.tick===s.trace.tick||x.id==='tut_start'),bids:s.trace.bids.filter(x=>x.tick===s.trace.tick),fires:s.trace.fires.filter(x=>x.tick===s.trace.tick)}}}
function boundary(p){
 const worlds=['current','hold','fall'].map(v=>({v,e:env(p,v)}));
 for(const {e} of worlds){e.tick(1);e.pickup('seed');e.pickup('bag');e.tick(1);e.tick(598);}
 // No forged bubble/CD. Real startup pair expires on tick601; T1 still120f.
 const before=worlds.map(({v,e})=>({variant:v,state:e.snap()}));
 for(const {e} of worlds){e.run('__summon()');e.tick(1)}
 const after=worlds.map(({v,e})=>({variant:v,state:e.snap()}));
 for(const row of after){
  const s=row.state,bids=s.trace.bids.filter(b=>b.tick===601&&b.id==='boss_summon');
  const accepted=s.trace.says.filter(a=>a.tick===601&&a.id==='boss_summon'&&a.ok);
  assert.equal(bids.length,row.variant==='hold'?0:1);
  assert.equal(accepted.length,row.variant==='hold'?0:1);
  assert.equal(s.flag,row.variant==='current');
  assert.equal(s.cd.tut_firstItem,undefined);
  if(row.variant!=='hold'){
   assert.equal(s.cd.boss_summon,3600);assert.equal(s.tiers[4],240);
   assert.equal(s.bubble.who,'crow');assert.equal(s.bubble.t,240);
   assert.equal(s.bubble.pair.who,'cat');assert.equal(s.bubble.pair.mt,240);
  }else{assert.equal(s.cd.boss_summon,undefined);assert.equal(s.bubble.t,0)}
  assert.equal(s.tiers[1],120);assert.equal(s.trace.save,2);assert.equal(s.trace.guide,2);
 }
 cases.push({case:'refused-firstItem-T4-tail',source:p.file,status:'PASS',before:before.map(r=>({...r,state:compact(r.state)})),after:after.map(r=>({...r,state:compact(r.state)})),
  legality:'boss reference supplied synthetically; actual summon case sets st2=55, examined one tick only; complete AI/move eligibility not simulated'});
}
const main=parts('game.html'),easy=parts('game-easy-test.html');
boundary(main);boundary(easy);
// Exactly one normal acceptance contrast, main only, with same T4 condition.
const normal=['current','hold','fall'].map(v=>({v,e:env(main,v)}));
for(const {e} of normal){e.tick(720);e.pickup('seed');e.pickup('bag');e.run('__summon()');e.tick(1)}
const ns=normal.map(({v,e})=>({variant:v,state:e.snap()}));
assert.deepEqual(ns[0].state,ns[1].state);assert.deepEqual(ns[0].state,ns[2].state);
assert.equal(ns[0].state.flag,true);assert.equal(ns[0].state.cd.tut_firstItem,599940);
assert.equal(ns[0].state.bubble.t,300);assert.equal(ns[0].state.bubble.pair.mt,240);
assert.equal(ns[0].state.trace.bids.filter(b=>b.tick===721&&b.id==='boss_summon').length,0);
cases.push({case:'one-normal-firstItem-acceptance-with-T4-ready',source:main.file,status:'PASS',states:ns.map(r=>({...r,state:compact(r.state)}))});
console.log(JSON.stringify({taskId:'QUESTNPC-firstItem-fallthrough-0548',executionCount:1,
 productionApplied:false,previousEightGroupsRuns:0,sources,fragments:receipts,cases,
 candidates:{current:main.current,hold:main.hold,fallthrough:main.fall},
 stubs:['DOM/SFX/translation sinks','pet movement no-op','keys false; parry practice completed; guide calls count only',
 'inventory grid accepts ordinary headband; stats/save count only','synthetic stationary full-HP boss ref; real summon switch case executed once',
 'frame clock dtSp=1; middle gameplay/AI omitted; full current pet dispatcher and all pet bid/fire/say/timer helpers run'],
 limits:['single T4 boundary plus one normal contrast; no T5 rerun or long starvation claim','no game/UI/HTTP/save/audio/build','normal acceptance is crow/pair scheduling only; cat completion not exercised']
},null,2));
