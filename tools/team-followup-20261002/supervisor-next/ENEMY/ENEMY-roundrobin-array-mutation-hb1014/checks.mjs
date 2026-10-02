// ENEMY-roundrobin-array-mutation-hb1014 — F06 예산 루프의 배열 변경 후 순환 cursor 기아
// 새 경계: budget break(비보스 _ei%32·>12ms)로 매 tick 일부만 처리되는 상태에서, tick 사이 배열이
//   변이(앞 원소 사망 splice→인덱스 하향 shift / tail 생성→성장)할 때, 위치기반 cursor가 유효 적을
//   영구/과도 skip하는지 actual loop 식 + 가상시계로 측정한다.
// 비교: ①prod(현행: 항상 _ei=0, cursor 없음) ②cand(F06 roundrobin, roundrobin-boundary.patch의 위치 cursor)
//        ③idcand(최소 memory 후보: identity 기반 cursor). control=정적 무변이 정상순서.
// 이전 idx60/CD decrement/phase gap30/음수정규화 검사 반복0. 가짜 counter로 실제 계약 대체0.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>createHash('sha256').update(s).digest('hex');
const startedAt=new Date().toISOString();

// ── 실제 소스 앵커 추출(읽기전용) ──
const prodRe=/for\(let _ei=0;_ei<ens\.length;_ei\+\+\)\{const e=ens\[_ei\];\s*\n\s*\/\/ 타임버짓[^\n]*\n\s*(if\(_ei%\(IS_MOBILE\?8:32\)===0&&_ei>0&&!e\.ib&&performance\.now\(\)-_eUpdateStart>\(IS_MOBILE\?8:12\)\)break;)/;
const anchors={};
for(const f of ['game.html','game-easy-test.html']){
  const html=readFileSync(`${ROOT}/${f}`,'utf8');
  const m=html.match(prodRe);
  assert.ok(m,`prod budget-loop 앵커 추출 실패: ${f}`);
  anchors[f]={fullSha:sha(html),prodBreakLine:m[1],prodBreakSha:sha(m[0]),
    // 현행 prod: cursor 없음(항상 _ei=0), budget break 식만 존재 확인
    hasCursor:/G\._eLoopStart/.test(html)};
}
// F06 candidate(roundrobin-boundary.game.patch) — 위치 cursor 식(읽기전용 참조, production 아님)
const patchPath=`${ROOT}/tools/team-followup-20261001/ENEMY/roundrobin-boundary.game.patch`;
const patchTxt=readFileSync(patchPath,'utf8');
const candCursorInit=patchTxt.match(/const _eStart=\(_elen>0&&typeof _rr0==='number'&&Number\.isFinite\(_rr0\)\)\?\(\(\(Math\.floor\(_rr0\)%_elen\)\+_elen\)%_elen\):0;/);
const candCursorAdv=patchTxt.match(/G\._eLoopStart=_elen>0\?\(\(_eStart\+1\)%_elen\):0;/);
const candRotIdx=patchTxt.match(/for\(let _k=0;_k<_elen;_k\+\+\)\{const _ei=\(_eStart\+_k\)%_elen;const e=ens\[_ei\];if\(!e\)continue;/);
const candBreak=patchTxt.match(/if\(_k%\(IS_MOBILE\?8:32\)===0&&_k>0&&!e\.ib&&performance\.now\(\)-_eUpdateStart>\(IS_MOBILE\?8:12\)\)break;/);
assert.ok(candCursorInit&&candCursorAdv&&candRotIdx&&candBreak,'F06 candidate cursor 식 추출');
const candSha=sha(candCursorInit[0]+candCursorAdv[0]+candRotIdx[0]+candBreak[0]);

// ── 가상시계 모델: 실제 budget break 식(비보스·_x%32===0·>12ms)과 cursor 식을 그대로 반영 ──
// 대역(stub): updateE(e) → served 기록. 비용은 SYNTH 고정(COST ms/적). 근접priority/LOD/상태순서는
//   이 경계(처리/미처리 커버리지)와 직교하므로 served 여부만 본다(명시 대역).
const IS_MOBILE=false, INTERVAL=IS_MOBILE?8:32, BUDGET_MS=IS_MOBILE?8:12;
// 한 tick 실행: variant∈{prod,cand,idcand}. G=cursor 상태. ens=현재 배열. COST=적당 served cost.
// 반환: 이번 tick에 full-update(served)된 적 id 집합.
function runTick(variant,G,ens,COST){
  const served=new Set();
  const _elen=ens.length; if(_elen===0) return served;
  let nowRel=0; // 가상시계(이 tick 시작=0). budget break: nowRel>BUDGET_MS
  const elapsed=()=>nowRel;
  if(variant==='prod'){
    for(let _ei=0;_ei<_elen;_ei++){const e=ens[_ei];
      if(_ei%INTERVAL===0&&_ei>0&&!e.ib&&elapsed()>BUDGET_MS)break;  // 실제 prod break 식(_ei)
      if(e.alive){served.add(e.id);nowRel+=COST;}
    }
  }else if(variant==='cand'){
    const _rr0=G._eLoopStart;
    const _eStart=(_elen>0&&typeof _rr0==='number'&&Number.isFinite(_rr0))?(((Math.floor(_rr0)%_elen)+_elen)%_elen):0; // 실제 cand init
    G._eLoopStart=_elen>0?((_eStart+1)%_elen):0;                     // 실제 cand +1/tick 전진
    for(let _k=0;_k<_elen;_k++){const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;
      if(_k%INTERVAL===0&&_k>0&&!e.ib&&elapsed()>BUDGET_MS)break;     // 실제 cand break 식(_k)
      if(e.alive){served.add(e.id);nowRel+=COST;}
    }
  }else if(variant==='idcand'){
    // 최소 memory 후보: cursor를 '다음에 선두가 될 적의 identity'로 보관(G._eLoopId).
    //   변이 후에도 그 id의 현재 위치에서 재개 → 인덱스 shift로 건너뛰지 않음. 없으면 0.
    let _eStart=0;
    if(G._eLoopId!=null){const _ix=ens.findIndex(x=>x&&x.id===G._eLoopId);_eStart=_ix>=0?_ix:0;}
    let _served=0,_lastK=-1;
    for(let _k=0;_k<_elen;_k++){const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;
      if(_k%INTERVAL===0&&_k>0&&!e.ib&&elapsed()>BUDGET_MS){break;}
      if(e.alive){served.add(e.id);nowRel+=COST;_lastK=_k;}
    }
    // 다음 선두 = 이번에 마지막으로 처리한 적의 '다음' identity (미처리분 선두 승격)
    const _nextIx=((_eStart+_lastK+1)%_elen);
    const _nx=ens[_nextIx]; G._eLoopId=_nx?_nx.id:null;
  }
  return served;
}

// ── 시나리오 러너: T tick 동안, 매 tick 변이 적용 후 runTick. 추적 적(persistent)의 최대 무처리 gap 측정 ──
// mutate(ens, tickNo): 배열을 실제 게임식(사망 splice / tail 생성)으로 변이. persistent id는 제거 안 함.
function scenario(variant,{N,T,COST,mutate}){
  const G={}; let nextId=1000;
  const ens=[]; const persistent=[];
  for(let i=0;i<N;i++){const e={id:nextId++,alive:true,ib:false,_persistent:true};ens.push(e);persistent.push(e.id);}
  const lastServed=new Map(persistent.map(id=>[id,-1]));
  const everServed=new Map(persistent.map(id=>[id,false]));
  for(let t=0;t<T;t++){
    if(mutate) nextId=mutate(ens,t,nextId);          // tick 시작 변이(GC splice + spawn)
    const served=runTick(variant,G,ens,COST);
    for(const id of persistent){ if(served.has(id)){lastServed.set(id,t);everServed.set(id,true);} }
  }
  // persistent 적별 최종 무처리 gap(마지막 처리~T) 및 전체 미처리 여부
  let maxTailGap=0, neverServed=0;
  for(const id of persistent){
    const gap=T-1-lastServed.get(id); if(gap>maxTailGap)maxTailGap=gap;
    if(!everServed.get(id))neverServed++;
  }
  return {maxTailGap,neverServed,N,T};
}

// 변이 패턴들(실제 게임식: splice 제거 + tail push, persistent 보존)
function mutNone(){return undefined;}
// 앞 churn: 매 tick 맨 앞 '비추적 transient' 1기 사망 제거 + tail에 transient 1기 생성 → persistent 인덱스 shift
function mutFrontChurn(ens,t,nextId){
  // tail에 transient 생성(배열 성장)
  ens.push({id:nextId++,alive:true,ib:false,_persistent:false});
  // 맨 앞의 비추적 transient 제거(없으면 맨 앞 제거 안 함 → persistent만이면 shift 없음)
  const fi=ens.findIndex(x=>x&&!x._persistent);
  if(fi>=0&&fi<ens.length-1) ens.splice(fi,1); // 방금 push한 tail 말고 앞쪽 transient 제거
  return nextId;
}
// tail 성장: 매 tick tail에 1기 생성(제거 없음) → 배열 길이 증가
function mutTailGrow(ens,t,nextId){ens.push({id:nextId++,alive:true,ib:false,_persistent:false});return nextId;}

const results=[];
function witness(name,observe,pred,expectNote){const a=observe();const ok=pred(a);results.push({name,status:ok?'REPRODUCED':'FAIL',actual:a,expect:expectNote});}
function check(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.message});}}

// 공통 파라미터: N=40(>INTERVAL32 이어야 break 발생), COST=0.5ms → _k=32에서 16ms>12 → 32기 처리/8기 미처리. T=400 tick.
const P={N:40,T:400,COST:0.5};

// C0 소스 앵커: 현행 prod는 cursor 없음(항상 _ei=0), cand cursor는 patch(미적용)만 존재
check('C0 현행 prod=cursor 없음(항상 _ei=0), cand cursor는 patch(미적용)',()=>{
  assert.equal(anchors['game.html'].hasCursor,false,'game.html production에 _eLoopStart 없음');
  assert.equal(anchors['game-easy-test.html'].hasCursor,false,'easy production에 _eLoopStart 없음');
  assert.ok(candCursorAdv[0].includes('(_eStart+1)%_elen'),'cand +1/tick 전진식');
});

// CONTROL(정적 무변이): cand roundrobin은 모든 적을 유한 tick 내 처리(문서 "_elen tick 내 1회 선두").
//   prod는 tail(인덱스≥32)을 영구 기아. idcand도 유한.
witness('A1-control cand 무변이: 모든 persistent 유한 gap(기아 없음)',
  ()=>scenario('cand',{...P,mutate:mutNone()}),
  r=>r.neverServed===0&&r.maxTailGap<=P.N, 'neverServed=0, maxGap<=N(=_elen tick 내 선두 보장)');
witness('A1-control prod 무변이: tail 영구 기아(baseline F06)',
  ()=>scenario('prod',{...P,mutate:mutNone()}),
  r=>r.neverServed>0, 'neverServed>0 (인덱스>=32 tail 전혀 미처리)');
witness('A1-control idcand 무변이: 기아 없음',
  ()=>scenario('idcand',{...P,mutate:mutNone()}),
  r=>r.neverServed===0&&r.maxTailGap<=P.N, 'neverServed=0, maxGap<=N');

// M1(앞 churn: splice shift + tail spawn): cand 위치 cursor가 변이로 커버리지 저하(경미).
witness('M1 cand 앞churn: 무변이 대비 gap 저하(경미, 영구기아 아님)',
  ()=>{const ctl=scenario('cand',{...P,mutate:mutNone()});const mut=scenario('cand',{...P,mutate:mutFrontChurn});return {ctlGap:ctl.maxTailGap,mutGap:mut.maxTailGap,mutNever:mut.neverServed};},
  r=>r.mutGap>=r.ctlGap&&r.mutNever===0, 'mutGap>=ctlGap(변이 민감) & neverServed=0(앞churn은 경미)');
witness('M1 idcand 앞churn: 변이에도 유한 gap(identity 복원)',
  ()=>scenario('idcand',{...P,mutate:mutFrontChurn}),
  r=>r.neverServed===0&&r.maxTailGap<=P.N, 'identity cursor는 변이에도 persistent 영구기아 0·gap<=N');
witness('M1 prod 앞churn: tail 여전히 기아',
  ()=>scenario('prod',{...P,mutate:mutFrontChurn}),
  r=>r.neverServed>0||r.maxTailGap>P.N, 'prod는 변이와 무관히 tail 기아');

// M2(tail 성장 = 핵심 결함): _elen이 계속 커지면 위치 cursor의 wrap 주기(=_elen)가 무한 증가 →
//   초기 인덱스 persistent 적이 cursor가 지나간 뒤 run 내내 미처리(gap ≫ N). idcand는 bounded.
witness('M2 cand tail성장: 위치 cursor가 persistent를 과도 기아(gap ≫ N)',
  ()=>{const cand=scenario('cand',{N:40,T:200,COST:0.5,mutate:mutTailGrow});const idc=scenario('idcand',{N:40,T:200,COST:0.5,mutate:mutTailGrow});return {candGap:cand.maxTailGap,idcandGap:idc.maxTailGap,candNever:cand.neverServed};},
  r=>r.candGap>40&&r.candGap>r.idcandGap*5, 'candGap≫N(=40) 이며 idcand 대비 과도(위치 cursor 성장 미대응)');
witness('M2 idcand tail성장: persistent bounded gap(<=N)',
  ()=>scenario('idcand',{N:40,T:200,COST:0.5,mutate:mutTailGrow}),
  r=>r.neverServed===0&&r.maxTailGap<=P.N, 'identity cursor persistent gap<=N·영구기아 0');

const failed=results.filter(r=>r.status==='FAIL');
const out={task:'roundrobin-array-mutation-hb1014',startedAt,completedAt:new Date().toISOString(),node:process.version,
  verificationUUID:'8f65b5e7-50e6-493c-9571-32984157cfbe',provider:'Claude Code',
  anchors,candidateSource:{patch:patchPath,cursorSha:candSha,note:'F06 roundrobin cursor는 patch(미적용 후보). production 아님.'},
  model:{IS_MOBILE,INTERVAL,BUDGET_MS,params:P,
    boundaryStubs:['updateE→served 기록(대역)','가상시계 nowRel=servedThisTick*COST','근접priority/LOD parity/상태순서는 served 커버리지와 직교하여 미모델(명시 대역)'],
    synth:['COST·N·T·변이 cadence는 SYNTH 입력','mutFrontChurn/mutTailGrow는 실제 게임식(splice 제거 + tail push)을 모사하나 정확 발생빈도는 실게임 아님']},
  counts:{pass:results.filter(r=>r.status==='PASS').length,reproduced:results.filter(r=>r.status==='REPRODUCED').length,fail:failed.length},
  results,
  productionApplied:false,runtimeAccepted:false,
  gates:{realGame:'UNKNOWN',native:'UNKNOWN',GPU_visual_audio_deploy:'치환0'},
  limits:['source/fixture PASS ≠ 실게임/native/청취/GPU/맵visual/배포 PASS','새 attack ticket/지연/수치/탄수명 정책 0','bossdeath/roomgate=root','Git 조회 0']};
console.log(JSON.stringify(out,null,2));
if(failed.length)process.exitCode=1;
