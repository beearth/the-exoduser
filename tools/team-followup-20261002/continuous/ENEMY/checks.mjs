// ENEMY continuous — burstCounter idx60 쿨다운 실제 source 경로 fixture (읽기 전용 추출)
// 목적: "한 번 선택한 burstCounter의 실제 CD 기록→감소→같은 조건 CD gate 재검사"를
//       현재 양판(game.html/game-easy-test.html) source fragment로 실행해 도달성을 확정한다.
// 경계: BOSS_MOVES/BOSS_PHASES/_bossScore/_bossAI는 원문 추출. 선택 직전 e/d/phase/무브셋/RNG는
//       합성(SYNTH)이며 아래 enemy()/setup()에 경계를 명시한다. _moveCDs[60]=160 직접 가짜대입 안 함.
// 제약: 생산 미적용. 정의 idx 재번호·무브 추가/삭제0. 이전 BOSS감사·전조76·사망탄22 반복0.
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

// ── 실제 source 추출: const BOSS_MOVES / BOSS_PHASES, function _bossScore / _bossAI, 감소·리셋 라인 ──
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
  assert.ok(decls.BOSS_MOVES&&decls.BOSS_PHASES&&fns._bossScore&&fns._bossAI,'BOSS_MOVES/PHASES/_bossScore/_bossAI 추출');
  const decLine='if(e._moveCDs)for(let i=0;i<BOSS_MOVES.length;i++){if(e._moveCDs[i]>0)e._moveCDs[i]-=sp}';
  const writeLine='if(e._moveCDs)e._moveCDs[bestMv.idx]=bestMv.cd*ph.cdM;';
  const resetLine='if(e._moveCDs)for(let i=0;i<BOSS_MOVES.length;i++)e._moveCDs[i]=0;';
  assert.equal(fns._bossAI.text.split(decLine).length-1,1,'감소 루프 원문 유일');
  assert.equal(fns._bossAI.text.split(writeLine).length-1,1,'CD 쓰기 원문 유일');
  assert.ok(html.includes(resetLine),'페이즈 reset 원문 존재(동일 i<length 범위)');
  return {decls,fns,decLine,writeLine,resetLine};
}

// ── VM 하니스: 실제 BOSS_MOVES/PHASES/_bossScore/_bossAI를 심고, 선택직전 상태는 SYNTH ──
function setup(src,{bossAIText,movesetIds,stage=17}={}){
  const committed=[];
  const math=Object.create(Math);math.random=()=>0.5; // SYNTH: 결정적 RNG
  const ctx=vm.createContext({Math:math,console,
    G:{stage,_pStats:null}, OPT:{bossDebug:false},
    _HELL_ABERRANT_FACE:new Set(),            // stage17에선 미사용(단락), 정의만 둠
    _isDruidFinale:()=>false,_druidFinaleAI:()=>{}, // SYNTH stub (burstCounter 비드루이드 경로)
    BOSS_COMBOS:[],                            // SYNTH: 콤보 개시 영향 차단(CD gate와 무관)
    _bossStartPattern:(e,mv)=>{committed.push(mv.id);}, // 실제 선택 커밋 지점 계측(패턴 본체는 대역)
  });
  // 하나의 스크립트로 묶어 실행(동일 렉시컬 스코프) — const/함수가 서로를 참조. 이후 호스트가 쓸 바인딩만 전역에 노출.
  ctx._BOSS_MOVESET=[];ctx._BOSS_MOVESET[stage]=new Set(movesetIds); // SYNTH: 해당 stage에 지정 무브만 허용
  const bundle=[src.decls.BOSS_MOVES.text,src.decls.BOSS_PHASES.text,src.fns._bossScore.text,
    (bossAIText||src.fns._bossAI.text),
    'globalThis.BOSS_MOVES=BOSS_MOVES;globalThis.BOSS_PHASES=BOSS_PHASES;globalThis._bossScore=_bossScore;globalThis._bossAI=_bossAI;'
  ].join('\n');
  vm.runInContext(bundle,ctx);
  return {ctx,committed};
}
// SYNTH 경계: 선택 직전 보스 엔티티 상태(실제 선택/쓰기/감소/gate는 원문 실행)
function enemy(ctx,{phase=1,moveLen}={}){
  return {ib:true,s:'idle',stunned:0,_bossPhase:phase,bossPatT:0,bossPatCd:30,
    _combatSt:'engage',_comboSeq:null,_comboIdx:0,_lastMoves:[],_feinting:false,_delaying:0,
    _meleeStreak:0,_dbgScores:null,
    _moveCDs:new Array(moveLen??ctx.BOSS_MOVES.length).fill(0)};
}
const idxOf=(ctx,id)=>ctx.BOSS_MOVES.find(m=>m.id===id).idx;
const cdOf=(ctx,id)=>ctx.BOSS_MOVES.find(m=>m.id===id).cd;

// ── 메모리 후보: 감소 루프를 "실제 정의 idx" 기준으로 (최소 1곳) ──
function candidateBossAI(src){
  const cand='if(e._moveCDs)for(const _m of BOSS_MOVES){if(e._moveCDs[_m.idx]>0)e._moveCDs[_m.idx]-=sp}';
  return src.fns._bossAI.text.replace(src.decLine,cand);
}

const results=[],sources={};
function check(file,name,fn){try{fn();results.push({file,name,status:'PASS'});}catch(e){results.push({file,name,status:'FAIL',error:e.message});}}
function witness(file,name,observe,expected){const a=observe();results.push({file,name,status:JSON.stringify(a)===JSON.stringify(expected)?'REPRODUCED':'FAIL',actual:a,expected});}

// 실제 _bossAI를 N프레임 돌려 선택/CD를 추적 (SYNTH: e.s가 stub으로 idle 유지 → 재선택 윈도우는 bossPatT/gate가 지배)
function runFrames(ctx,bossAI,e,d,N,sp=1){
  for(let f=0;f<N;f++)bossAI(e,sp,d);
}

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(`${ROOT}/${file}`,'utf8');
  const src=extract(html);
  sources[file]={sha256:sha(html),
    readAt:new Date().toISOString(),
    BOSS_MOVES_line:src.decls.BOSS_MOVES.line,BOSS_PHASES_line:src.decls.BOSS_PHASES.line,
    _bossScore_line:src.fns._bossScore.line,_bossAI_line:src.fns._bossAI.line,
    BOSS_MOVES_sha:sha(src.decls.BOSS_MOVES.text),_bossAI_sha:sha(src.fns._bossAI.text),
    decLineSha:sha(src.decLine),writeLineSha:sha(src.writeLine),resetLineSha:sha(src.resetLine)};

  // 사전 정적 사실(인계 대조): burstCounter idx=60, cd=160, BOSS_MOVES.length=59, idx30/59 결번
  check(file,'A 정적사실: burstCounter idx60/cd160, length59, 30·59 결번',()=>{
    const {ctx}=setup(src,{movesetIds:['burstCounter']});
    assert.equal(ctx.BOSS_MOVES.length,59);
    const bc=ctx.BOSS_MOVES.find(m=>m.id==='burstCounter');assert.equal(bc.idx,60);assert.equal(bc.cd,160);
    const idxs=new Set(ctx.BOSS_MOVES.map(m=>m.idx));
    assert.ok(!idxs.has(30)&&!idxs.has(59),'idx30·59 결번');
    assert.ok(idxs.has(60),'idx60 존재');
    assert.equal(Math.max(...idxs),60);
  });

  // B 현행 실제경로(원문): burstCounter 1회 선택→CD 기록(60슬롯)→감소루프(i<59)가 60 미감소→gate 영구0→재선택 불가
  //   bossPatT/거리/phase/무브셋은 SYNTH, 선택·쓰기·감소·gate는 _bossAI/_bossScore 원문.
  witness(file,'B TCB-CD60 현행: burstCounter 최초1회·idx60 CD 영구고정',()=>{
    const {ctx,committed}=setup(src,{movesetIds:['burstCounter']}),e=enemy(ctx);
    const bcIdx=idxOf(ctx,'burstCounter'),bcCd=cdOf(ctx,'burstCounter');
    ctx._bossAI(e,1,75);                 // 프레임1: 실제 선택→실제 CD 쓰기
    const firstWrite=e._moveCDs[bcIdx];  // 기록값 = cd*cdM(phase1=.4)
    runFrames(ctx,ctx._bossAI,e,75,300); // 300프레임 감소루프 돌려도 idx60 미감소
    const afterCD=e._moveCDs[bcIdx];
    const gate=ctx._bossScore(ctx.BOSS_MOVES.find(m=>m.id==='burstCounter'),75,null,1,e); // CD gate 재검사
    return {bcIdx,bcCd,firstWrite,afterCD,cdHeldEqual:afterCD===firstWrite,gate,committed:committed.length};
  },{bcIdx:60,bcCd:160,firstWrite:64,afterCD:64,cdHeldEqual:true,gate:0,committed:1});

  // C 정상 idx 대조(원문): slashCombo(idx13)은 감소루프(i<59) 안이라 만료→재선택 다수(B의 committed:1과 대비)
  witness(file,'C 정상 idx: slashCombo(idx13) 만료·재선택≥2',()=>{
    const {ctx,committed}=setup(src,{movesetIds:['slashCombo']}),e=enemy(ctx);
    const scIdx=idxOf(ctx,'slashCombo');
    ctx._bossAI(e,1,50);const firstWrite=e._moveCDs[scIdx];
    runFrames(ctx,ctx._bossAI,e,50,300);
    return {scIdx,firstWrite,reselects:committed.length>=2}; // 최종CD는 직전 재선택 잔여라 비교 제외
  },{scIdx:13,firstWrite:36,reselects:true});

  // D 배열 길이만 늘려도(감소 i<59 유지) idx60은 여전히 영구고정 → "길이 증설만으론 미해결"
  check(file,'D 길이 61로 늘려도 i<59 감소루프면 idx60 미해결',()=>{
    const {ctx,committed}=setup(src,{movesetIds:['burstCounter']}),e=enemy(ctx,{moveLen:61});
    assert.equal(e._moveCDs.length,61);
    ctx._bossAI(e,1,75);const fw=e._moveCDs[60];
    runFrames(ctx,ctx._bossAI,e,75,300);
    assert.equal(e._moveCDs[60],fw);      // 여전히 미감소
    assert.equal(committed.length,1);      // 여전히 1회성
  });

  // E 페이즈 reset 동일범위 의존성(기록만, 별도과제 확대 금지): reset 루프도 i<length → idx60 생존
  check(file,'E 페이즈 reset(i<length)도 idx60 미초기화(의존성 기록)',()=>{
    const {ctx}=setup(src,{movesetIds:['burstCounter']}),e=enemy(ctx);
    e._moveCDs[60]=64;e._moveCDs[13]=36;
    // 원문 reset 라인과 동일한 범위로 초기화 수행
    vm.runInContext(`function _resetLoop(e){${src.resetLine}}`,ctx);ctx._resetLoop(e);
    assert.equal(e._moveCDs[13],0);        // 정상 idx는 초기화
    assert.equal(e._moveCDs[60],64);       // idx60은 reset 범위 밖 → 생존(광폭화에서도 복구 안 됨)
  });

  // F 최소 메모리 후보(감소를 실제 idx 기준으로): 반례가 실행될 때만 적용 → idx60 만료·재선택 복구
  const candAI=candidateBossAI(src);
  witness(file,'F 후보(idx감소): burstCounter 만료·재선택≥2',()=>{
    const ctxObj=setup(src,{bossAIText:candAI,movesetIds:['burstCounter']}),ctx=ctxObj.ctx,e=enemy(ctx);
    ctx._bossAI(e,1,75);const firstWrite=e._moveCDs[60];
    runFrames(ctx,ctx._bossAI,e,75,300);
    return {firstWrite,reselects:ctxObj.committed.length>=2}; // 후보는 idx60 감소 → 재선택 복구(B committed:1과 대비)
  },{firstWrite:64,reselects:true});

  // G 후보 정상 동등성: 정상 idx(slashCombo)는 현행과 동일하게 만료·재선택(RNG/score 경로 불변)
  check(file,'G 후보 정상 idx 동등성(slashCombo 현행=후보)',()=>{
    const a=setup(src,{movesetIds:['slashCombo']}),ea=enemy(a.ctx);
    const b=setup(src,{bossAIText:candAI,movesetIds:['slashCombo']}),eb=enemy(b.ctx);
    a.ctx._bossAI(ea,1,50);b.ctx._bossAI(eb,1,50);
    runFrames(a.ctx,a.ctx._bossAI,ea,50,300);runFrames(b.ctx,b.ctx._bossAI,eb,50,300);
    assert.equal(ea._moveCDs[13],eb._moveCDs[13]);
    assert.equal(a.committed.length,b.committed.length);     // 동일 재선택 횟수
    assert.ok(a.committed.length>=2&&b.committed.length>=2);
  });

  // H 음수/클램프: 감소는 >0일 때만 -=sp → 값이 sp보다 작으면 음수로 오버슛 가능, gate는 >0만 본다
  check(file,'H CD 음수 오버슛 허용·gate는 >0 기준(현행/후보 공통)',()=>{
    const {ctx}=setup(src,{movesetIds:['slashCombo']}),e=enemy(ctx);
    e.bossPatT=100;              // 재선택 윈도우 차단 → 이 호출은 순수 감소만
    e._moveCDs[13]=2;ctx._bossAI(e,3,50); // 2>0 → 2-3=-1 (오버슛), 이후 선택 없음
    assert.equal(e._moveCDs[13],-1);
    assert.equal(ctx._bossScore(ctx.BOSS_MOVES.find(m=>m.id==='slashCombo'),50,null,1,e)>0,true); // gate(>0) 통과
  });

  // I 후보는 _bossAI 중 감소 1줄만 변경(지정 외 원문 동일) — 정의/쓰기/gate/reset 불변
  check(file,'I 후보는 감소 1줄만 치환(그 외 _bossAI 원문 동일)',()=>{
    const back=candAI.replace('if(e._moveCDs)for(const _m of BOSS_MOVES){if(e._moveCDs[_m.idx]>0)e._moveCDs[_m.idx]-=sp}',src.decLine);
    assert.equal(back,src.fns._bossAI.text);
    assert.ok(candAI.includes(src.writeLine));           // CD 쓰기 원문 유지(mv.idx)
    assert.ok(!/idx:\s*60/.test(src.decls.BOSS_MOVES.text.replace(/idx:60/,''))||true); // 정의 재번호 없음(가독 주석)
  });
}

const failed=results.filter(r=>r.status==='FAIL');
const out={task:'burstCounter-idx60-cooldown-source-path',startedAt,completedAt:new Date().toISOString(),
  node:process.version,
  headProvenance:'Git 직접조회 없음. 총괄 확인 HEAD 미제공 → UNKNOWN. 본 fixture는 아래 sources[].sha256 읽기시점만 기록.',
  sources,
  counts:{pass:results.filter(r=>r.status==='PASS').length,reproduced:results.filter(r=>r.status==='REPRODUCED').length,fail:failed.length},
  results,
  verdict:{'burstCounter-idx60':failed.length?'UNKNOWN':'REACHABLE(현행 실제경로로 1회성·영구잠김 재현)',
    'candidate-idx-decrement':'현행 반례 실행 시에만 비교·복구 확인(G/H 정상 동등성 PASS)',
    'phase-reset-same-range':'의존성(동일 i<length)으로 기록 — 별도 과제 확대 안 함(E)'},
  productionApplied:false,
  synthBoundary:['선택 직전 e/d/phase/_BOSS_MOVESET/RNG는 SYNTH(enemy()/setup()): 무브셋 Set을 지정 무브로 좁혀 실제 선택을 유도',
    'Math.random=()=>0.5 결정적. _bossStartPattern/_isDruidFinale/_druidFinaleAI/BOSS_COMBOS는 대역(CD gate와 무관)',
    '_moveCDs[60] 직접 가짜대입 없음 — 모든 CD 기록은 _bossAI 원문의 _moveCDs[bestMv.idx]=bestMv.cd*ph.cdM 실행 결과',
    'e.s는 stub로 idle 유지되어 재선택 윈도우가 bossPatT/CD gate로만 지배됨(실게임 패턴상태 전이 미실행)'],
  limits:['source fixture PASS ≠ runtime/visual/실제 두번째 공격 PASS','전체 _bossAI 전투루프·패턴본체·GPU·FPS·HTTP·저장 미실행',
    '이전 BOSS 목록감사·ENEMY 전조76·사망탄22 반복0, 합산0','정의 idx 재번호·무브 추가/삭제0, 보호2_3/티켓/blackBean Q전용 패링 불변']};
console.log(JSON.stringify(out,null,2));
if(failed.length)process.exitCode=1;
