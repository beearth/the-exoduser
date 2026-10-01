import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {lookupItemProposal} from '../../../unique-item-project/definitions.js';
import {toStoredValue,fromStoredValue} from '../../../unique-item-project/roll-values.js';

export const SOURCE_FILES=['game.html','game-easy-test.html'];
const sources=new Map(SOURCE_FILES.map(file=>{
  const text=readFileSync(new URL(`../../../${file}`,import.meta.url),'utf8');
  const start=text.indexOf('function activateGiantSlam(');
  const end=text.indexOf('// earthBreaker / earthSlam',start);
  assert(start>=0&&end>start);
  return [file,{code:text.slice(start,end),sha256:createHash('sha256').update(text).digest('hex')}];
}));

export function runSource(scenario, {transform=code=>code, consumer=null}={}) {
  const source=sources.get(scenario.file);
  assert(source);
  assert(Number.isFinite(scenario.rage)&&scenario.rage>=0&&scenario.rage<=1000);
  const context=vm.createContext({scenario:structuredClone(scenario),_d10Candidate:consumer});
  vm.runInContext(`
    const window={},PASSIVES={pRage:0},OPT={shake:0},EL={F:1};
    const P={rage:scenario.rage,skills:{giantSlam:1,giantSlam2:1},facing:0,x:0,y:0,_rageFullLatch:scenario.latch};
    const G={mats:scenario.failed?0:100},evidence={hits:[],rageCast:[],fullEvents:0};
    const INV={equipped:{armor:scenario.item?{...scenario.item,fixtureStored:scenario.stored}:null}};
    window._parryLesson={active:false,rageCast:value=>evidence.rageCast.push(value)};
    const _addSkProf=()=>{},_malCost=value=>Math.ceil(value*.5),showPH=()=>{},_T=value=>value;
    const useStPct=()=>{},_isFused=id=>id===scenario.fusion,_cdRed=()=>0;
    const SFX={slam:()=>{}},playSample=()=>{},_r=()=>1;
    const _eqAffix=()=>0,meleeRef=()=>5,statStr=()=>1,_skMul=()=>1;
    const addTxt=()=>{},_addLavaErupt=()=>{},wp=()=>({el:0}),poolPart=()=>{},_detonateAssaultFlames=()=>{};
    let nested=false;
    const _gSlamHit=(...args)=>{
      evidence.hits.push(args);
      if(scenario.reentrant&&!nested){nested=true;activateGiantSlam(scenario.srcId)}
    };
    Math.random=()=>.5;
    ${transform(source.code.trim(),scenario.file)}
    for(let iteration=0;iteration<(scenario.repeats||1);iteration++)activateGiantSlam(scenario.srcId);
    globalThis.result={rage:P.rage,cooldown:P._gslCd??null,mats:G.mats,hits:evidence.hits,
      rageCast:evidence.rageCast,latch:P._rageFullLatch,fullEvents:evidence.fullEvents};
  `,context,{timeout:1000});
  return JSON.parse(JSON.stringify(context.result));
}

export function runOriginal(scenario) { return runSource(scenario); }

export function expectedRefund(scenario) {
  const definition=lookupItemProposal(scenario.item);
  if(scenario.failed||scenario.rage<100||definition?.uniqueId!=='UI-10')return 0;
  fromStoredValue('UI-10',scenario.stored);
  return Math.min(30,scenario.rage*scenario.stored);
}

export function scenarios() {
  const rows=[];
  for(const file of SOURCE_FILES)for(let raw=10;raw<=20;raw++)for(const rage of [99,100,150,1000,99.5,100.5]) {
    rows.push({file,raw,stored:toStoredValue('UI-10',raw),rage,item:{uniqueId:'UI-10',slot:'armor'},latch:true});
  }
  for(const file of SOURCE_FILES) {
    for(const item of [null,{slot:'armor'},{uniqueId:'UI-10',slot:'helmet'},{uniqueId:'unknown',slot:'armor'},{uniqueId:'UI-21',slot:'armor'}]) {
      rows.push({file,raw:20,stored:.2,rage:150,item,latch:false});
    }
    rows.push({file,raw:20,stored:.2,rage:150,item:{uniqueId:'UI-10',slot:'armor'},failed:true,latch:true});
    for(const fusion of ['pillarSlam','infernoSlam'])rows.push({file,raw:20,stored:.2,rage:150,item:{uniqueId:'UI-10',slot:'armor'},srcId:'giantSlam2',fusion,latch:true});
  }
  return rows;
}

export async function verifyCandidate(runCandidate) {
  assert.equal(typeof runCandidate,'function','root 명시 어댑터 runD10Scenario 필요');
  const rows=[];
  for(const scenario of scenarios()) {
    const original=runOriginal(scenario);
    const candidate=await runCandidate(structuredClone(scenario));
    const expected={...original,rage:scenario.failed?original.rage:expectedRefund(scenario)};
    assert.deepEqual(candidate,expected,JSON.stringify({scenario,original,candidate,expected}));
    rows.push({scenario,original,candidate});
  }
  for(const file of SOURCE_FILES) {
    const scenario={file,raw:20,stored:.2,rage:150,item:{uniqueId:'UI-10',slot:'armor'},latch:true};
    const first=await runCandidate(structuredClone(scenario));
    const next={...scenario,rage:first.rage};
    const second=await runCandidate(structuredClone(next));
    assert.deepEqual(second,runOriginal(next),'복원 분노<100인 다음 시전은 재환급 없음');
    rows.push({sequence:'두 독립 실제 시전',file,first,second});
  }
  return {status:'candidate_checked',runtimeReady:false,rows};
}

export function sourceEvidence() {
  return Object.fromEntries([...sources].map(([file,entry])=>[file,entry.sha256]));
}
