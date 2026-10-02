// ENEMY 다음 한 건 — 감소 후보의 sparse/overshoot 보존 경계 fixture (읽기전용 추출)
// 좁은 경계: 현행 _bossAI의 CD 감소가 stunned/recover 조기반환 '전'에 일어나는 접점에서,
//   작은 SYNTH 희소배열(CD30/41/58/60=1.25, sp=2.5)을 ①원문 0..58 loop ②정의-idx 감소 후보에 넣어
//   overshoot(1.25→-1.25) 보존·idx60 변화·공백30 의미차·hole/own-property만 대조한다.
// 반복0: continuous H(2→-1·candidate無)·300f·phase전환·전수·boot는 반복/확장하지 않는다. 좁은 범위만 집계.
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const require=createRequire(import.meta.url);
const {parse}=require(`${ROOT}/node_modules/acorn`);
const sha=s=>createHash('sha256').update(s).digest('hex');
const startedAt=new Date().toISOString();

// ── 실제 source 추출: const BOSS_MOVES/BOSS_PHASES, function _bossAI ──
function extract(html){
  const decls={},fns={},lineOf=off=>html.slice(0,off).split('\n').length;
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
    const body=m[1];if(!/function _bossAI\(/.test(body)&&!/const BOSS_MOVES=/.test(body))continue;
    const offset=m.index+m[0].indexOf('>')+1;
    const program=parse(body,{ecmaVersion:'latest',sourceType:'script'});
    for(const n of program.body){
      if(n.type==='FunctionDeclaration')fns[n.id.name]={text:body.slice(n.start,n.end),line:lineOf(offset+n.start)};
      if(n.type==='VariableDeclaration')for(const d of n.declarations)
        if(d.id.type==='Identifier'&&['BOSS_MOVES','BOSS_PHASES'].includes(d.id.name))
          decls[d.id.name]={text:body.slice(n.start,n.end),line:lineOf(offset+n.start)};
    }
  }
  assert.ok(decls.BOSS_MOVES&&decls.BOSS_PHASES&&fns._bossAI,'BOSS_MOVES/BOSS_PHASES/_bossAI 추출');
  const decLine='if(e._moveCDs)for(let i=0;i<BOSS_MOVES.length;i++){if(e._moveCDs[i]>0)e._moveCDs[i]-=sp}';
  const guardLine='if(e.stunned>0||e.s!==\'idle\')return;';
  assert.equal(fns._bossAI.text.split(decLine).length-1,1,'감소문 원문 유일');
  assert.ok(fns._bossAI.text.includes(guardLine),'stunned/recover 조기반환 존재');
  // 감소문이 조기반환 '앞'인지(접점) 라인 순서로 확인
  assert.ok(fns._bossAI.text.indexOf(decLine)<fns._bossAI.text.indexOf(guardLine),'감소문이 조기반환보다 앞');
  const decLineNo=fns._bossAI.line+fns._bossAI.text.slice(0,fns._bossAI.text.indexOf(decLine)).split('\n').length-1;
  return {decls,fns,decLine,guardLine,decLineNo};
}
// 이전 제안의 정의-idx 감소 후보(접점 1곳만 메모리 교체, 그 외 원문 바이트 유지)
function candidateBossAI(src){
  const cand='if(e._moveCDs)for(const _m of BOSS_MOVES){if(e._moveCDs[_m.idx]>0)e._moveCDs[_m.idx]-=sp}';
  return src.fns._bossAI.text.replace(src.decLine,cand);
}
// VM: _isDruidFinale(false)와 BOSS_PHASES만 조기반환 전 실행. 그 외(score/combo/pattern/hurtP)는 반환 후라 미실행(대역 카운터).
function setup(src,bossAIText){
  const calls={bossStartPattern:0,spawnBossProjectile:0,hurtP:0,druidFinaleAI:0};
  const ctx=vm.createContext({Math,console,
    G:{stage:17,_pStats:null},OPT:{bossDebug:false},
    _isDruidFinale:()=>false,_druidFinaleAI:()=>{calls.druidFinaleAI++;},
    _bossScore:()=>{throw new Error('reached _bossScore (조기반환 실패)');},
    _bossStartPattern:()=>{calls.bossStartPattern++;},
    _spawnBossProjectile:()=>{calls.spawnBossProjectile++;},hurtP:()=>{calls.hurtP++;},
    _BOSS_MOVESET:[],BOSS_COMBOS:[],_HELL_ABERRANT_FACE:new Set(),
    P:{x:0,y:0},addTxt(){},shake(){},
  });
  const bundle=[src.decls.BOSS_MOVES.text,src.decls.BOSS_PHASES.text,(bossAIText||src.fns._bossAI.text),
    'globalThis.BOSS_MOVES=BOSS_MOVES;globalThis.BOSS_PHASES=BOSS_PHASES;globalThis._bossAI=_bossAI;'].join('\n');
  vm.runInContext(bundle,ctx);
  return {ctx,calls};
}
// SYNTH 희소배열: 0..58의 일부만 own-property로 세팅(나머지는 hole). 60은 length 확장 own-property.
// 실제 정상 생성 state가 공백30에 양수 CD를 쓴다는 주장 아님(SYNTH 명시).
function synthSparse(){const a=[];a[30]=1.25;a[41]=1.25;a[58]=1.25;a[60]=1.25;return a;} // length=61
// 조기반환용 보스: stunned=1, s='recover' → 감소 직후 return (score/패턴/phase/hurtP 미실행)
function boss(moveCDs){return {ib:true,_bossPhase:1,stunned:1,s:'recover',bossPatT:50,_combatSt:'engage',_moveCDs:moveCDs};}

const results=[],sources={};
function check(file,name,fn){try{fn();results.push({file,name,status:'PASS'});}catch(e){results.push({file,name,status:'FAIL',error:e.message});}}
function witness(file,name,observe,expected){const a=observe();results.push({file,name,status:JSON.stringify(a)===JSON.stringify(expected)?'REPRODUCED':'FAIL',actual:a,expected});}

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(`${ROOT}/${file}`,'utf8');
  const src=extract(html);
  const candAI=candidateBossAI(src);
  sources[file]={sha256_full:sha(html),readAt:new Date().toISOString(),
    _bossAI_line:src.fns._bossAI.line,_bossAI_sha:sha(src.fns._bossAI.text),
    decLineNo:src.decLineNo,decLineSha:sha(src.decLine),
    BOSS_MOVES_line:src.decls.BOSS_MOVES.line,BOSS_MOVES_sha:sha(src.decls.BOSS_MOVES.text)};

  // 공통: 희소 state를 원문/후보에 각각 넣고 _bossAI(sp=2.5) 1회 호출(조기반환). 전후 값·hole·대역카운터 비교.
  const runOne=(bossAIText)=>{
    const S=setup(src,bossAIText),cd=synthSparse(),e=boss(cd);
    S.ctx._bossAI(e,2.5,100);
    return {cd,calls:S.calls,bossPatT:e.bossPatT,combatSt:e._combatSt};
  };

  // B1 조기반환 접점(원문): 감소는 실행되나 score/패턴/phase/hurtP는 반환 후라 미실행
  witness(file,'B1 원문: 감소 pre-return, guard 이후 미실행',()=>{
    const r=runOne(null);
    return {decremented:r.cd[41]===-1.25, // 감소 실행 증거(idx41 1.25→-1.25)
      bossStartPattern:r.calls.bossStartPattern,spawnBossProjectile:r.calls.spawnBossProjectile,hurtP:r.calls.hurtP,
      bossPatT_unchanged:r.bossPatT===50,combatSt_unchanged:r.combatSt==='engage'};
  },{decremented:true,bossStartPattern:0,spawnBossProjectile:0,hurtP:0,bossPatT_unchanged:true,combatSt_unchanged:true});

  // B2 원문 0..58 loop 결과: 30/41/58 → -1.25(overshoot), 60 → 미감소(1.25 유지)
  witness(file,'B2 원문 결과: 30/41/58 overshoot, 60 미감소',()=>{
    const r=runOne(null);return {cd30:r.cd[30],cd41:r.cd[41],cd58:r.cd[58],cd60:r.cd[60]};
  },{cd30:-1.25,cd41:-1.25,cd58:-1.25,cd60:1.25});

  // B3 후보 정의-idx 결과: 41/58 → -1.25(overshoot 보존), 60 → -1.25(감소됨), 30 → 1.25(정의idx 없음, 미감소)
  witness(file,'B3 후보 결과: 41/58 overshoot보존·60 감소·30 미감소',()=>{
    const r=runOne(candAI);return {cd30:r.cd[30],cd41:r.cd[41],cd58:r.cd[58],cd60:r.cd[60]};
  },{cd30:1.25,cd41:-1.25,cd58:-1.25,cd60:-1.25});

  // B4 overshoot 보존: 정의 양수 CD 1.25→-1.25가 원문·후보 모두에서 동일(idx41,58)
  check(file,'B4 정의 양수 CD overshoot(1.25→-1.25) 원문=후보',()=>{
    const o=runOne(null),c=runOne(candAI);
    assert.equal(o.cd[41],-1.25);assert.equal(c.cd[41],-1.25);
    assert.equal(o.cd[58],-1.25);assert.equal(c.cd[58],-1.25);
  });

  // B5 idx60: 원문 미감소(1.25) vs 후보 감소(-1.25) — 유일한 '의도된' 차이 축
  check(file,'B5 idx60 변화: 원문 1.25 유지 → 후보 -1.25',()=>{
    const o=runOne(null),c=runOne(candAI);
    assert.equal(o.cd[60],1.25);assert.equal(c.cd[60],-1.25);
  });

  // B6 공백30 의미차: 원문 0..58 loop는 값 있는 30을 감소(-1.25), 후보는 정의idx 없어 미감소(1.25).
  //    단 SYNTH 전용 — 실제 init은 idx30=0(own) → 양쪽 모두 미변(0). 실제 호환성 UNKNOWN(root 결정).
  witness(file,'B6 공백30 차이는 SYNTH 전용(실제 init은 0)',()=>{
    const o=runOne(null),c=runOne(candAI);
    const realInit=vm.runInContext('new Array(BOSS_MOVES.length).fill(0)',setup(src,null).ctx);
    return {synth_orig_cd30:o.cd[30],synth_cand_cd30:c.cd[30],synthDiffers:o.cd[30]!==c.cd[30],
      realInit_idx30_ownAndZero:Object.prototype.hasOwnProperty.call(realInit,30)&&realInit[30]===0};
  },{synth_orig_cd30:-1.25,synth_cand_cd30:1.25,synthDiffers:true,realInit_idx30_ownAndZero:true});

  // B7 hole/own-property 구분: 30/41/58/60 own-property, 31/59 hole. 양쪽 호출 후 hole은 densify 안 됨.
  check(file,'B7 hole vs own-property 구분·densify 없음',()=>{
    const o=runOne(null),c=runOne(candAI),H=Object.prototype.hasOwnProperty;
    for(const r of [o.cd,c.cd]){
      assert.ok(H.call(r,30)&&H.call(r,41)&&H.call(r,58)&&H.call(r,60),'설정 인덱스 own');
      assert.ok(!H.call(r,31)&&!H.call(r,59),'31/59 hole 유지(densify 없음)');
    }
    // 실제 init 대조: 30은 own(gap이나 fill로 0), 59/60은 length59 밖이라 hole
    const realInit=vm.runInContext('new Array(BOSS_MOVES.length).fill(0)',setup(src,null).ctx);
    assert.equal(realInit.length,59);
    assert.ok(H.call(realInit,30)&&realInit[30]===0,'실제 idx30 = own 0(gap이나 vessel 존재)');
    assert.ok(!H.call(realInit,59)&&!H.call(realInit,60),'실제 idx59/60 = hole(length 밖)');
  });

  // B8 후보는 감소문 1접점만 교체(그 외 _bossAI 바이트 동일)
  check(file,'B8 후보는 감소문 1곳만 교체(그 외 원문 동일)',()=>{
    const back=candAI.replace('if(e._moveCDs)for(const _m of BOSS_MOVES){if(e._moveCDs[_m.idx]>0)e._moveCDs[_m.idx]-=sp}',src.decLine);
    assert.equal(back,src.fns._bossAI.text);
  });
}

const failed=results.filter(r=>r.status==='FAIL');
const out={task:'decrement-sparse-overshoot-boundary',startedAt,completedAt:new Date().toISOString(),node:process.version,
  verificationUUID:'8f65b5e7-50e6-493c-9571-32984157cfbe',provider:'Claude Code',
  headProvenance:'Git 직접조회 없음. root 보존 commit 5420819d…(exactremote 07:21:16.394148Z)·b72f3f06 등은 독립 HEAD/원격검증값으로 미사용. 근거는 sources[].sha256_full 읽기시점.',
  sources,
  counts:{pass:results.filter(r=>r.status==='PASS').length,reproduced:results.filter(r=>r.status==='REPRODUCED').length,fail:failed.length,
    note:'좁은 경계 전용 집계. 양판 각 8건(witness 4 + probe/assert 4). 결함 수 아님.'},
  results,
  comparedFields:['cd[30]','cd[41]','cd[58]','cd[60]','own-property(30/31/41/58/59/60)','guard 이후 대역카운터(bossStartPattern/spawnBossProjectile/hurtP/druidFinaleAI)','bossPatT','_combatSt','실제 init vessel length/own/hole'],
  notCompared:['score/combo/pattern 실제 실행','300f 재선택','phase 전환','전체 58무브 동등','RNG/전투 QA','runtime/GPU/청취/저장/실게임','정상 생성 state가 공백30에 양수 CD를 쓰는지(원문 근거 없음)'],
  findings:{
    overshootPreserved:'정의 양수 CD 1.25→-1.25 overshoot는 원문·후보 모두 보존(idx41,58). B4',
    idx60ChangesInCandidate:'원문 미감소(1.25 유지) → 후보 감소(-1.25). idx60 누락이 후보에서 복구됨. B5',
    sparseSlot30:'SYNTH 공백30에 양수를 넣으면 원문 0..58 loop는 감소(-1.25), 정의-idx 후보는 미감소(1.25)로 의미 차 발생. 단 실제 init은 idx30=own 0이라 양쪽 미변(0) → 실게임 차이 없음. 정상 state가 공백을 쓴다는 원문 근거 없음 → 호환성 UNKNOWN(root 결정).',
    holeDistinction:'30=gap이나 vessel own 0 / 59·60=length59 밖 hole. SYNTH 세팅 인덱스만 own, 31/59 hole은 양쪽 호출 후에도 densify 안 됨. B7',
    decrementPreReturn:'감소는 stunned=1/recover 조기반환 전에 실행(접점 확인). 반환 후 score/패턴/phase/hurtP 미실행(대역카운터 0). B1'
  },
  idx41Note:'idx41 cageTrap은 예약이지만 정의에 있어 감소 대상이 될 수 있다(본 fixture에서 idx41 both 감소). 이는 사용가능/score 허용을 뜻하지 않는다(_bossScore return -1).',
  productionApplied:false,
  gates:{nativeRuntimeRealGate:'UNKNOWN','전체동등/모든무브/모든언어 PASS':'0(미주장)'},
  limits:['Node VM 추출. _isDruidFinale(false)+BOSS_PHASES만 반환 전 실행, 그 외 대역','SYNTH 희소배열은 합성 입력 — 정상 생성 state 아님','continuous H(2→-1·candidate無)/300f/phase전환/전수 반복0','정의 idx 재번호·무브 추가삭제·음수clamp·공백제거·슬롯정책·의도해석·production 수정 0','보호2_3·Q전용 blackBean magic패링·어택티켓금지 불변']};
console.log(JSON.stringify(out,null,2));
if(failed.length)process.exitCode=1;
