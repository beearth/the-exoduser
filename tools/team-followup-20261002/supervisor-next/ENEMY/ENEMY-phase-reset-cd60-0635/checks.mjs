// ENEMY 후속 — 실제 _bossPhaseCheck(phase1→2) 전환의 idx60 reset 경계 fixture (읽기전용 추출)
// 목적: "직전 phase1에서 실제 _bossAI 선택1회로 CD60 기록 → HP 임계값 합성 → 실제 _bossPhaseCheck 호출"
//       흐름에서 idx60 CD가 reset(36945/35750)에서 빠지는지만 양판 source 실행으로 대조한다.
// 이전(continuous)의 A~I/300f·격리 reset-loop 검사는 반복하지 않는다. 전환 핵심/reset은 대역화하지 않는다.
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

// ── 실제 source 추출: const BOSS_MOVES/BOSS_PHASES, function _bossScore/_bossAI/_bossPhaseCheck ──
function extract(html){
  const decls={},fns={},lineOf=off=>html.slice(0,off).split('\n').length;
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
    const body=m[1];if(!/function _bossPhaseCheck\(/.test(body)&&!/const BOSS_MOVES=/.test(body))continue;
    const offset=m.index+m[0].indexOf('>')+1;
    const program=parse(body,{ecmaVersion:'latest',sourceType:'script'});
    for(const n of program.body){
      if(n.type==='FunctionDeclaration')fns[n.id.name]={text:body.slice(n.start,n.end),line:lineOf(offset+n.start)};
      if(n.type==='VariableDeclaration')for(const d of n.declarations)
        if(d.id.type==='Identifier'&&['BOSS_MOVES','BOSS_PHASES'].includes(d.id.name))
          decls[d.id.name]={text:body.slice(n.start,n.end),line:lineOf(offset+n.start)};
    }
  }
  assert.ok(decls.BOSS_MOVES&&decls.BOSS_PHASES&&fns._bossScore&&fns._bossAI&&fns._bossPhaseCheck,'BOSS_MOVES/PHASES/_bossScore/_bossAI/_bossPhaseCheck 추출');
  const resetLine='if(e._moveCDs)for(let i=0;i<BOSS_MOVES.length;i++)e._moveCDs[i]=0;';
  const initExpr='new Array(BOSS_MOVES.length).fill(0)';
  assert.equal(fns._bossPhaseCheck.text.split(resetLine).length-1,1,'_bossPhaseCheck 내 reset문 유일');
  assert.ok(html.includes('_moveCDs:ib?'+initExpr+':undefined'),'실제 spawn 초기화식 존재(인용)');
  // reset문 절대 라인
  const rLocal=fns._bossPhaseCheck.text.indexOf(resetLine);
  const resetLineNo=fns._bossPhaseCheck.line+fns._bossPhaseCheck.text.slice(0,rLocal).split('\n').length-1;
  return {decls,fns,resetLine,initExpr,resetLineNo};
}

// ── 메모리 후보: reset문만 정의 idx 기준으로(한 곳). 감소후보/정의/스탯/임계값/HP/텔레포트·공격수치/드루이드/parry 불변 ──
function candidatePhaseCheck(src){
  const cand='if(e._moveCDs)for(const _m of BOSS_MOVES)e._moveCDs[_m.idx]=0;';
  return src.fns._bossPhaseCheck.text.replace(src.resetLine,cand);
}

// ── VM 하니스: 전환 핵심/reset은 원문. 주변 VFX/SFX/파티클/탄/충돌/타이머만 대역(stub) ──
function setup(src,{phaseCheckText,movesetIds=['burstCounter'],stage=17}={}){
  const committed=[],projectiles=[],calls={hurtP:0,addTxt:0,spawnProj:0};
  const math=Object.create(Math);math.random=()=>0.5; // SYNTH: 결정적 RNG
  const ctx=vm.createContext({Math:math,console,
    G:{stage,_pStats:null,hitStop:0,slowMo:0,_druidActCue:null}, OPT:{hitStop:100},
    _HS:{bossPhase:0},
    P:{x:400,y:400,facing:0,iframes:1,s:'idle',kb:{x:0,y:0}},
    _HELL_ABERRANT_FACE:new Set(),
    _BOSS_PHASE_AURA:{},
    _isDruidFinale:()=>false,_druidFinaleAI:()=>{},_druidFinaleAtk:()=>0,_druidFinaleAct:()=>0,
    BOSS_COMBOS:[],
    // ── 대역(전환 핵심이 아닌 주변 효과) ──
    _bossStartPattern:(e,mv)=>{committed.push(mv.id);},
    _spawnBossProjectile:(e,p)=>{projectiles.push(p.el);calls.spawnProj++;},
    poolPart(){},_addBlastLight(){},_addTpSmoke(){},_addTpImpact(){},_addTpBolt(){},
    _reviveVFX(){},playVFXAng(){},shake(){},playSample(){},_bossSfx:()=>null,_r:(a)=>a,
    SFX:{groggy(){},hit(){}},setTimeout:()=>0, // 지연 SFX 미실행(대역)
    canMv:()=>true,safePt:()=>null,dst:(a,b,c,d)=>Math.hypot(a-c,b-d),
    hurtP:()=>{calls.hurtP++;},addTxt:()=>{calls.addTxt++;},_T:s=>s,_L:a=>a,
  });
  ctx._BOSS_MOVESET=[];ctx._BOSS_MOVESET[stage]=new Set(movesetIds); // SYNTH 무브셋
  const bundle=[src.decls.BOSS_MOVES.text,src.decls.BOSS_PHASES.text,src.fns._bossScore.text,
    src.fns._bossAI.text,(phaseCheckText||src.fns._bossPhaseCheck.text),
    'globalThis.BOSS_MOVES=BOSS_MOVES;globalThis.BOSS_PHASES=BOSS_PHASES;globalThis._bossScore=_bossScore;globalThis._bossAI=_bossAI;globalThis._bossPhaseCheck=_bossPhaseCheck;'
  ].join('\n');
  vm.runInContext(bundle,ctx);
  return {ctx,committed,projectiles,calls};
}
// 실제 spawn 초기화식(new Array(BOSS_MOVES.length).fill(0))을 그대로 실행해 CD 그릇 생성(전체 spawn 함수는 미실행=경계)
function freshMoveCDs(ctx){return vm.runInContext('new Array(BOSS_MOVES.length).fill(0)',ctx);}
// SYNTH 경계: 선택직전 보스 엔티티(ib보스). 선택·CD쓰기·전환·reset은 원문 실행.
function boss(ctx,{phase=1}={}){
  return {ib:true,el:1,s:'idle',stunned:0,_bossPhase:phase,bossPatT:0,bossPatCd:30,
    _combatSt:'engage',_comboSeq:null,_comboIdx:0,_lastMoves:[],_feinting:false,_delaying:0,
    _meleeStreak:0,_dbgScores:null,
    hp:1000,mhp:1000,atk:100,baseAtk:100,speed:1.0,maxPoise:100,reviveIframes:0,
    x:300,y:300,r:20,kb:{x:0,y:0},
    _moveCDs:freshMoveCDs(ctx)};
}
const idxOf=(ctx,id)=>ctx.BOSS_MOVES.find(m=>m.id===id).idx;

// 전환 전 실제 _bossAI 선택 1회로 CD60 기록(원문 쓰기). 그 뒤 HP 합성→_bossPhaseCheck.
function selectOnceWriteCD60(S){
  const e=boss(S.ctx,{phase:1});
  S.ctx._bossAI(e,1,75);          // 실제 선택→실제 _moveCDs[bestMv.idx]=cd*cdM
  return e;
}
// 전환 전후 관측 스냅샷(전환 핵심/부수 trace)
function snap(e,S){return {phase:e._bossPhase,hp:e.hp,cd60:e._moveCDs[60],cd13:e._moveCDs[13],
  revive:e.reviveIframes,s:e.s,atk:e.atk,stunned:e.stunned,bossPatT:e.bossPatT,
  spawnProj:S.calls.spawnProj,hurtP:S.calls.hurtP};}

const results=[],sources={};
function check(file,name,fn){try{fn();results.push({file,name,status:'PASS'});}catch(e){results.push({file,name,status:'FAIL',error:e.message});}}
function witness(file,name,observe,expected){const a=observe();results.push({file,name,status:JSON.stringify(a)===JSON.stringify(expected)?'REPRODUCED':'FAIL',actual:a,expected});}

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(`${ROOT}/${file}`,'utf8');
  const src=extract(html);
  sources[file]={sha256_full:sha(html),readAt:new Date().toISOString(),
    _bossPhaseCheck_line:src.fns._bossPhaseCheck.line,_bossPhaseCheck_sha:sha(src.fns._bossPhaseCheck.text),
    resetLineNo:src.resetLineNo,resetLineSha:sha(src.resetLine),
    _bossAI_line:src.fns._bossAI.line,_bossAI_sha:sha(src.fns._bossAI.text),
    BOSS_MOVES_line:src.decls.BOSS_MOVES.line,BOSS_PHASES_line:src.decls.BOSS_PHASES.line,
    BOSS_MOVES_sha:sha(src.decls.BOSS_MOVES.text)};
  const candPC=candidatePhaseCheck(src);

  // P1 reset문이 _bossPhaseCheck(36945/35750) 안에 있고 범위는 i<BOSS_MOVES.length(=59)
  check(file,'P1 reset문 위치·범위(i<BOSS_MOVES.length) 확인',()=>{
    const S=setup(src),ctx=S.ctx;
    assert.equal(ctx.BOSS_MOVES.length,59);
    assert.ok(src.fns._bossPhaseCheck.text.includes(src.resetLine));
    assert.equal(idxOf(ctx,'burstCounter'),60);
  });

  // P2 (핵심) 현행: 실제 선택으로 CD60=64 기록 → 실제 _bossPhaseCheck(HP .50 합성)로 phase1→2 전환
  //    → reset(i<59)이 idx60 미포함 → CD60 생존. 정상 idx(13, SYNTH주입)는 0으로 reset.
  witness(file,'P2 실제 전환 현행: idx60 CD reset에서 제외(생존)',()=>{
    const S=setup(src),e=selectOnceWriteCD60(S);
    const cd60Written=e._moveCDs[60];
    e._moveCDs[13]=36;            // SYNTH: 정상 idx 대조값 주입(표시)
    e.hp=Math.round(e.mhp*0.50);  // SYNTH: phase1→2 임계값(hpR .50 → _bp2)
    const before={phase:e._bossPhase};
    S.ctx._bossPhaseCheck(e,1);   // 실제 전환 실행
    return {cd60Written,phaseBefore:before.phase,phaseAfter:e._bossPhase,
      cd60AfterReset:e._moveCDs[60],cd13AfterReset:e._moveCDs[13],
      cd60Survived:e._moveCDs[60]===cd60Written,cd13Reset:e._moveCDs[13]===0};
  },{cd60Written:64,phaseBefore:1,phaseAfter:2,cd60AfterReset:64,cd13AfterReset:0,cd60Survived:true,cd13Reset:true});

  // P3 전환 없음(HP가 현 phase 유지 조건): _bossPhaseCheck 조기 return → reset 미실행 → CD60/13 불변
  witness(file,'P3 전환없음(HP .70): reset 미실행·CD/phase 불변',()=>{
    const S=setup(src),e=selectOnceWriteCD60(S);
    e._moveCDs[13]=36;e.hp=Math.round(e.mhp*0.70); // hpR .70 → _bp1, _bp<=phase → return
    const hpBefore=e.hp;S.ctx._bossPhaseCheck(e,1);
    return {phase:e._bossPhase,cd60:e._moveCDs[60],cd13:e._moveCDs[13],hpUnchanged:e.hp===hpBefore,sStillIdle:e.s==='idle'};
  },{phase:1,cd60:64,cd13:36,hpUnchanged:true,sStillIdle:true});

  // P4 (후보) reset문만 정의 idx 기준 → 동일 실제 전환에서 CD60도 reset(0). 정상 idx도 0.
  witness(file,'P4 후보 reset(idx기준): 실제 전환서 idx60도 reset',()=>{
    const S=setup(src,{phaseCheckText:candPC}),e=selectOnceWriteCD60(S);
    e._moveCDs[13]=36;e.hp=Math.round(e.mhp*0.50);
    S.ctx._bossPhaseCheck(e,1);
    return {phaseAfter:e._bossPhase,cd60AfterReset:e._moveCDs[60],cd13AfterReset:e._moveCDs[13],cd60Cleared:e._moveCDs[60]===0};
  },{phaseAfter:2,cd60AfterReset:0,cd13AfterReset:0,cd60Cleared:true});

  // P5 (차이 한정) 현행 vs 후보: idx60 CD만 다르고 phase/hp/atk/speed/revive/stunned/s/bossPatT/부수호출 전부 동일
  check(file,'P5 후보 차이는 idx60 reset에만 한정(그 외 전환 결과 동일)',()=>{
    const mk=(txt)=>{const S=setup(src,txt?{phaseCheckText:txt}:{}),e=selectOnceWriteCD60(S);
      e._moveCDs[13]=36;e.hp=Math.round(e.mhp*0.50);S.ctx._bossPhaseCheck(e,1);
      return {e,snap:snap(e,S),speed:e.speed,maxPoise:e.maxPoise,bossPatCd:e.bossPatCd};};
    const cur=mk(null),cand=mk(candPC);
    // idx60만 차이
    assert.equal(cur.snap.cd60,64);assert.equal(cand.snap.cd60,0);
    for(const k of ['phase','hp','revive','s','atk','stunned','bossPatT','cd13','spawnProj','hurtP'])
      assert.equal(cur.snap[k],cand.snap[k],`${k} 동일`);
    assert.equal(cur.speed,cand.speed);assert.equal(cur.maxPoise,cand.maxPoise);assert.equal(cur.bossPatCd,cand.bossPatCd);
  });

  // P6 (CD gate 분리) 전환 직후 CD gate는 패턴상태(s)·무브허용(moveset)과 분리 보고
  //    현행: s='recover'(패턴상태 차단) AND _moveCDs[60]>0(CD 차단). 후보: s='recover'는 동일하나 CD는 0(통과).
  check(file,'P6 전환직후 CD gate ⟂ 패턴상태/무브허용 분리',()=>{
    const bcMove=()=>setup(src).ctx.BOSS_MOVES.find(m=>m.id==='burstCounter');
    // 현행
    const Sc=setup(src),ec=selectOnceWriteCD60(Sc);ec._moveCDs[13]=36;ec.hp=Math.round(ec.mhp*0.50);Sc.ctx._bossPhaseCheck(ec,1);
    const bc=Sc.ctx.BOSS_MOVES.find(m=>m.id==='burstCounter');
    assert.equal(ec.s,'recover');                 // 패턴상태: 전환 직후 recover(선택 불가) — CD와 독립
    assert.equal(Sc.ctx._bossScore(bc,75,null,2,ec),0); // CD gate: [60]>0 → 0(차단) *moveset은 phase2에 burstCounter 포함
    // 후보
    const Sk=setup(src,{phaseCheckText:candPC}),ek=selectOnceWriteCD60(Sk);ek._moveCDs[13]=36;ek.hp=Math.round(ek.mhp*0.50);Sk.ctx._bossPhaseCheck(ek,1);
    const bk=Sk.ctx.BOSS_MOVES.find(m=>m.id==='burstCounter');
    assert.equal(ek.s,'recover');                 // 패턴상태는 현행과 동일
    assert.ok(Sk.ctx._bossScore(bk,75,null,2,ek)>0); // CD gate: [60]=0 → 통과(>0 아님)
  });

  // P7 후보는 reset 1줄만 치환(그 외 _bossPhaseCheck 원문 동일) — 임계값/HP/스탯/텔레포트/드루이드/parry 불변
  check(file,'P7 후보는 reset 1줄만 치환(그 외 _bossPhaseCheck 원문 동일)',()=>{
    const back=candPC.replace('if(e._moveCDs)for(const _m of BOSS_MOVES)e._moveCDs[_m.idx]=0;',src.resetLine);
    assert.equal(back,src.fns._bossPhaseCheck.text);
    // 임계값/회복/스탯 식이 후보에도 그대로 존재
    assert.ok(candPC.includes('hpR>.80?0:hpR>.60?1:hpR>.40?2:hpR>.20?3:4'));
    assert.ok(candPC.includes('e.atk=~~(e.atk*1.3)'));
    assert.ok(candPC.includes('e.reviveIframes=90'));
  });
}

const failed=results.filter(r=>r.status==='FAIL');
const out={task:'phase-reset-cd60-boundary',startedAt,completedAt:new Date().toISOString(),node:process.version,
  headProvenance:'Git 직접조회 없음. 제공 b72f3f06…는 root의 06:10 push 보고값(독립 현재HEAD 아님). 본 fixture 근거는 sources[].sha256_full 읽기시점.',
  sources,
  counts:{pass:results.filter(r=>r.status==='PASS').length,reproduced:results.filter(r=>r.status==='REPRODUCED').length,fail:failed.length},
  results,
  verdict:{'phase-reset-idx60':failed.length?'UNKNOWN':'CONFIRMED: 실제 _bossPhaseCheck(phase1→2) reset이 idx60 제외 → CD60 생존(현행), 후보(reset idx기준) 시 reset됨',
    'difference-confined':'현행 vs 후보 차이는 idx60 reset에만 한정(P5). phase/hp/atk/speed/revive/stunned/s/bossPatT/부수호출 동일',
    'cd-gate-vs-pattern-state':'전환 직후 선택불가는 패턴상태(s=recover)·CD gate 두 독립 조건. 후보는 CD만 해제, 패턴상태는 동일(P6)',
    'design-1회성/반복형':'UNKNOWN (문서 부재)'},
  productionApplied:false,
  synthBoundary:['HP 임계값(.50 전환/.70 비전환)은 SYNTH로 주입. phase전환 판정·회복·스탯·reset은 _bossPhaseCheck 원문 실행',
    'CD60 기록은 전환 전 실제 _bossAI 선택 1회(원문 _moveCDs[bestMv.idx]=cd*cdM). 직접 가짜대입 아님',
    'cd13(정상 idx)=36은 SYNTH 주입(대조용) — reset 범위 확인 보조',
    'CD 그릇은 실제 spawn 초기화식 new Array(BOSS_MOVES.length).fill(0)을 그대로 실행(전체 spawn/mkEn 함수는 미실행=경계)',
    '주변 효과는 대역: 텔레포트/파티클(poolPart)/VFX/SFX/지연사운드(setTimeout 미실행)/빨간콩 _spawnBossProjectile/충격파 hurtP/충돌 canMv — 전환 핵심·reset은 대역화 안 함',
    'Math.random=()=>0.5 결정적. P/G/타이머 대역. GPU/청취/저장/실게임 미검수'],
  limits:['source fixture PASS ≠ runtime/visual/실게임 전환·재공격 PASS','전체 spawn·보스전 루프·드루이드 피날레 분기·텔레포트 좌표·충격파 실제피해 미실행',
    '이전 continuous A~I/300f·격리 reset-loop·BOSS목록감사·전조76·사망탄22 반복/합산0',
    '정의 idx 재번호·무브 추가/삭제0, 감소후보/스탯/임계값/HP/텔레포트·공격수치/드루이드피날레/parry 불변, 보호2_3·어택티켓·Q전용 blackBean 패링 불변']};
console.log(JSON.stringify(out,null,2));
if(failed.length)process.exitCode=1;
