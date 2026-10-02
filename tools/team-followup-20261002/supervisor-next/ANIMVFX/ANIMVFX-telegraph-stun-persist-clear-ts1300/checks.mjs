// ANIMVFX-telegraph-stun-persist-clear-ts1300 (CH1-1 playable — hit/telegraph/lifetime 실제 연결)
// 경계: windup 중 stun 전이 때 _telegraphT 효과수명이 렌더 consumer에 잔존하는가.
// 실제 source: updateE 감소(stun 게이트 없음)·어디서도 _telegraphT=0 clear 없음·prep/2D 링 조건(stunned 無)·death는 alive-cull.
// 실행: 실제 링 render 조건 expression + death-cull 가드를 원문에서 추출해 enemy 상태에 적용(손모델 아님).
// 후보: updateE에서 stun 시 _telegraphT=0 (render-only; 공격은 e.s/e.st2로 별도 → 판정/수명공식/asset 불변).
// 경계: 읽기 전용. Git 0. production 미적용. pixel/native = QA Gate.
import fs from 'node:fs';
import crypto from 'node:crypto';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const read=p=>fs.readFileSync(root+'/'+p,'utf8');
const startedAt=new Date().toISOString();
const rows=[];
function check(id,a){ try{a();rows.push({id,status:'PASS'});}catch(e){rows.push({id,status:'FAIL',reason:e.message});} }
function expect(v,r){ if(!v) throw new Error(r); }
function eq(a,b,r){ if(a!==b) throw new Error(`${r}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`); }

const gh=read('game.html'), ge=read('game-easy-test.html');

// ── 실제 source 앵커 ──
const anchors={
  // updateE 최상단 감소 (stun 게이트 없이)
  decrementNoStunGate: /function updateE\(e,sp\)\{[\s\S]{0,180}?if\(e\._telegraphT>0\)\{e\._telegraphT-=sp;e\._telegraphR=e\.r\+20\}/,
  // 어디서도 _telegraphT 를 0/명시값으로 clear 하지 않음
  noClearAssign: /_telegraphT\s*=\s*0/,           // 존재하면 안 됨
  // prep 링 조건 (stunned 항 없음)
  prepRingCond: /if\(e\._telegraphT>0&&e\._telegraphT<20\)\{/,
  // 2D 링 조건 (!_ensGLQueued, stunned 없음)
  twoDRingCond: /if\(!_ensGLQueued&&e\._telegraphT>0&&e\._telegraphT<20\)\{/,
  // 렌더 루프 death cull
  deadCull: /if\(!e\|\|!e\.alive\)continue/,
};
const anchorHit={
  decrementNoStunGate: anchors.decrementNoStunGate.test(gh),
  noClearAssign_absent: !anchors.noClearAssign.test(gh),   // clear 가 '없어야' 참
  prepRingCond: anchors.prepRingCond.test(gh),
  twoDRingCond: anchors.twoDRingCond.test(gh),
  deadCull: anchors.deadCull.test(gh),
};

// ── 실제 링 조건 expression 을 원문에서 추출해 실행 ──
// prep 조건 `e._telegraphT>0&&e._telegraphT<20` 를 그대로 평가 (손으로 다시 쓰지 않음)
const condMatch=gh.match(/if\((e\._telegraphT>0&&e\._telegraphT<20)\)\{/);
expect(condMatch,'ring 조건 추출');
const ringCond=new Function('e',`return (${condMatch[1]});`);
// death cull: 렌더 루프 진입 가드 `!e||!e.alive` → consumer 도달 여부
const consumerRenders=(e)=>{ if(!e || !e.alive) return false; return ringCond(e); };
// 후보 updateE 조각: stun 시 clear
const candidateUpdate=(e)=>{ if(e.stunned>0) e._telegraphT=0; return e; };

// ── 상태별 실행 ──
const normal ={_telegraphT:15,stunned:0,  alive:true, s:'windup'};
const stunned={_telegraphT:15,stunned:180,alive:true, s:'windup'}; // 공격 중단되었으나 _telegraphT 미clear
const dead   ={_telegraphT:15,stunned:0,  alive:false,s:'windup'};
const curNormal=consumerRenders({...normal});
const curStunned=consumerRenders({...stunned});
const curDead=consumerRenders({...dead});
const fixStunned=consumerRenders(candidateUpdate({...stunned}));
const fixNormal=consumerRenders(candidateUpdate({...normal})); // 후보가 정상 windup 건드리지 않음(control)

// ── 검증 ──
check('ANCHORS-present', ()=>{ for(const[k,v] of Object.entries(anchorHit)) expect(v===true,'anchor '+k); });
check('EX-ring-cond-identical-both-builds', ()=>{
  const em=ge.match(/if\((e\._telegraphT>0&&e\._telegraphT<20)\)\{/); expect(em&&em[1]===condMatch[1],'양판 링 조건 동일');
});
// 현행: 정상 windup 렌더 / stun windup 도 렌더(잔존 결함) / death 는 cull
check('CURRENT-normal-renders', ()=>{ eq(curNormal,true,'정상 windup 링'); });
check('CURRENT-stunned-persists-DEFECT', ()=>{ eq(curStunned,true,'stun windup 링 잔존(공격 중단에도 경고링 유지)'); });
check('CURRENT-dead-culled', ()=>{ eq(curDead,false,'death 는 alive-cull 로 미렌더(이 전이는 안전)'); });
// 후보: stun 잔존 제거, 정상 windup 불변(control)
check('CANDIDATE-stun-cleared', ()=>{ eq(fixStunned,false,'후보: stun 시 _telegraphT=0 → 잔존 제거'); });
check('CONTROL-normal-unaffected', ()=>{ eq(fixNormal,true,'후보가 정상 windup 미영향'); });

const endedAt=new Date().toISOString();
const fail=rows.filter(r=>r.status==='FAIL');
const patch=`if(e.stunned>0)e._telegraphT=0; // windup이 stun으로 중단되면 전조 링 즉시 제거(연출 진실성, render-only)`;
const out={
  taskId:'supervisor-next/ANIMVFX/ANIMVFX-telegraph-stun-persist-clear-ts1300',
  recoveryTask:'RECOVERY-ANIMVFX-1250-TASK.md (windup→stun/death _telegraphT 잔존 최초 경계)',
  capacityEpoch:'rolling-after-3b548b06-1300 (credits 2, maxIter 3, changes 63→, stop<100)',
  provider:'VS Code Claude native (autonomous continuity)',
  cwd:root, node:process.version, startedAt, endedAt,
  sourceReadSHA:{ note:'실Read 시점 sha256. Git 미호출.', 'game.html':sha(gh), 'game-easy-test.html':sha(ge) },
  sourceLines:{ decrement:'game.html:37240 (updateE 최상단, stun 게이트 없음)', noClear:'전체에 _telegraphT=0 clear 없음(grep 0건)',
    prepRing:'game.html:5224', twoDRing:'game.html:51839', deadCull:'prep/2D 렌더 루프 !e.alive continue' },
  anchorHit,
  bands:'링 render 조건 expression 과 death-cull 가드를 원문에서 추출해 실행. GL uniform/crop/실픽셀 없음. 공격 발동(e.s/e.st2) 로직은 _telegraphT 와 무관(별도).',
  finding:'일반 windup 중 stun 전이 시 _telegraphT 가 clear 되지 않아, 공격이 AI stun 으로 중단되는데도 빨간 경고링이 최대 ~20프레임 잔존(기절 알파 0.6). 거짓 "공격 임박" 신호. death 전이는 alive-cull 로 이미 안전.',
  observations:{ current:{normalRing:curNormal, stunnedRing:curStunned, deadRing:curDead},
    candidate:{stunnedRing:fixStunned, normalRing:fixNormal} },
  candidatePatch:{ applied:false, where:'game.html updateE 내 `if(e._telegraphT>0){e._telegraphT-=sp;...}` 인접(stun 분기). easy(game-easy-test.html) updateE 동일 위치 — 링 조건 양판 동일 확인됨.',
    text:patch,
    secondaryUnknown:'death 후 revive(구울/보스)가 windup-death 직후 복귀하면 stale _telegraphT 가능(revive 는 stunned=0 만 리셋). revive 타이밍 대개 >20f 라 실발생 UNKNOWN. revive 경로에 `e._telegraphT=0` 1줄 동반 가능(저비용).',
    rationale:'_telegraphT 는 순수 VFX 타이머(set/decrement/ring/_telegraphR 에만 쓰임). 공격 발동은 e.s/e.st2 → clear 는 render-only, 판정/수명공식/asset 불변. body-skip 미채택 Gate 보존.' },
  summary:{ groups:{ total:rows.length, pass:rows.filter(r=>r.status==='PASS').length, fail:fail.length } },
  productionApplied:false, runtimeAccepted:false,
  disclaimer:'source-sink PASS ≠ 가시픽셀/native/실게임 PASS. 실제 기절 적 링 잔존 체감은 QA 화면 Gate.',
  docsHandoff:[
    {doc:'docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md', text:'_telegraphT 가 clear 되지 않아 windup→stun 시 경고링 잔존(렌더 조건에 stunned 無). render-only 후보(stun 시 clear) 미적용. death 는 cull 로 안전, revive 는 UNKNOWN.'},
    {doc:'docs/5.1임펙트디자인/VFX_구현가이드.md', text:'전조 수명 정책: _telegraphT 는 어디서도 0 clear 안 됨 → 중단 공격에도 자연 감소까지 렌더. 중단(stun/revive) 시 clear 권장(render-only, 판정 불변).'},
  ],
  rows
};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
process.exit(fail.length?1:0);
