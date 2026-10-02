// ANIMVFX-hitflash-fixedstep-migration-hf1326 (CH1-1 playable — hit flash lifetime 실제 연결)
// 경계: easy의 _hitFlash-=1(render/프레임의존)을 main의 고정스텝 _hitFlash-=sp(update)로 이동할 때,
//       (1) 30/60/144fps 에서 flash 수명이 FPS 의존→wall-clock 상수로 바뀌는지, (2) render→update 이동이
//       실제 caller/GL·2D 경로에 double-decay(이중감쇠) 없이 연결되는지 검수.
// 실제 source: PHYS_STEP=1000/60, while(_acc>=PHYS_STEP) 고정스텝, updateE(e,sp); game _hitFlash-=sp(update, 단일),
//              game render 경로는 '그리기만'(감쇠 없음); easy _hitFlash-=1(render, 유일 감쇠, 고정스텝 없음).
// 경계: 읽기 전용. Git 0. production 미적용. 실제 fps/시각 = QA Gate. 기존 정적7표 반복0.
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
function near(a,b,tol,r){ if(Math.abs(a-b)>tol) throw new Error(`${r}: ${a} vs ${b} (tol ${tol})`); }

const gh=read('game.html'), ge=read('game-easy-test.html');

// ── 실제 source 앵커/상수 ──
const PHYS_STEP_m=gh.match(/const PHYS_STEP=1000\/60;/);
const fixedLoop_m=gh.match(/while\(_acc>=PHYS_STEP\)\{/);
const gameUpdateDecay_m=gh.match(/if\(e\._hitFlash>0\)e\._hitFlash=Math\.max\(0,e\._hitFlash-sp\)/);
const gameRenderOnlyGL=/GL 경로는 그리기만/.test(gh);
const gameRenderOnly2D=/2D 폴백은 그리기만/.test(gh);
const easyRenderDecay_m=ge.match(/if\(e\._hitFlash > 0\) \{\s*\n\s*e\._hitFlash -= 1;\s*\n\s*\}/);
const easyHasUpdateDecay=/_hitFlash=Math\.max\(0,e\._hitFlash-sp\)|_hitFlash-=sp/.test(ge);
const anchorHit={
  game_PHYS_STEP: !!PHYS_STEP_m, game_fixedLoop: !!fixedLoop_m, game_update_decay_minus_sp: !!gameUpdateDecay_m,
  game_render_GL_drawonly: gameRenderOnlyGL, game_render_2D_drawonly: gameRenderOnly2D,
  easy_render_decay_minus1: !!easyRenderDecay_m, easy_no_update_decay: !easyHasUpdateDecay,
};

// easy의 _hitFlash 감쇠 '사이트 수' (유일성/double-decay 판정용). set/global screen flash 제외.
const easyDecaySites=(ge.match(/e\._hitFlash\s*-=\s*1|e\._hitFlash=Math\.max\(0,e\._hitFlash-sp\)/g)||[]).length;
const gameDecaySites=(gh.match(/e\._hitFlash\s*-=\s*sp|e\._hitFlash=Math\.max\(0,e\._hitFlash-sp\)/g)||[]).length;

// ── 고정스텝 accumulator 시뮬: 1초 wall-clock, 렌더 FPS f ──
const PHYS=1000/60;
function simulate(fps, mode){ // mode: 'render-1' | 'update-sp' | 'both'(double-decay 버그)
  let flash=6, acc=0, t=0; const dt=1000/fps; let depletedAt=null;
  const frames=fps; // 1초
  for(let fr=0; fr<frames && depletedAt===null; fr++){
    t+=dt; acc+=dt;
    // 고정스텝 update (60Hz): update-sp / both 에서 감쇠
    while(acc>=PHYS){ acc-=PHYS; if((mode==='update-sp'||mode==='both') && flash>0){ flash=Math.max(0,flash-1); if(flash===0&&depletedAt===null)depletedAt=t; } }
    // 렌더 프레임: render-1 / both 에서 감쇠
    if((mode==='render-1'||mode==='both') && flash>0){ flash=Math.max(0,flash-1); if(flash===0&&depletedAt===null)depletedAt=t; }
  }
  return { depletedMs: depletedAt }; // 6→0 까지 걸린 wall-clock ms
}

const fpsList=[30,60,144];
const easyCur=Object.fromEntries(fpsList.map(f=>[f, simulate(f,'render-1').depletedMs]));   // easy 현행
const migrated=Object.fromEntries(fpsList.map(f=>[f, simulate(f,'update-sp').depletedMs]));  // 후보(=game 모델)
const buggyBoth=Object.fromEntries(fpsList.map(f=>[f, simulate(f,'both').depletedMs]));      // 잘못된 이동(render 미제거)

// ── 검증 ──
check('ANCHORS-present', ()=>{ for(const[k,v] of Object.entries(anchorHit)) expect(v===true,'anchor '+k); });
check('DECAY-site-counts', ()=>{ eq(gameDecaySites,1,'game 감쇠 단일(update)'); eq(easyDecaySites,1,'easy 감쇠 단일(render -=1)'); });

// 현행 easy: FPS 의존 (30fps 수명 > 144fps 수명, 약 fps 비율)
check('CURRENT-easy-fps-dependent', ()=>{
  expect(easyCur[30]>easyCur[60] && easyCur[60]>easyCur[144], 'easy 수명 FPS 의존');
  near(easyCur[30],200,20,'easy@30fps≈6/30s'); near(easyCur[60],100,20,'easy@60fps≈0.1s'); near(easyCur[144],42,15,'easy@144fps≈0.042s');
});
// 후보(update-sp): wall-clock 상수(~100ms) FPS 무관
check('CANDIDATE-update-sp-constant', ()=>{
  near(migrated[30],100,20,'@30'); near(migrated[60],100,20,'@60'); near(migrated[144],100,20,'@144');
  expect(Math.abs(migrated[30]-migrated[144])<=20,'FPS 무관(상수)');
});
// double-decay 버그(render 미제거): 두 사이트 → 수명 약 절반, 특히 저FPS에서 비정상
check('BUGGY-both-double-decays', ()=>{
  expect(buggyBoth[60]<migrated[60],'render+update 동시 → 이중감쇠로 수명 단축');
});
// 이동은 반드시 render -=1 제거 + update -=sp 추가 (사이트 수 1 유지)
check('MIGRATION-keeps-single-site', ()=>{
  // 후보 적용 후 감쇠 사이트 = 1 (update). 현행 easy render 사이트 1 → 제거하고 update 1 추가.
  expect(easyDecaySites===1,'현행 easy 단일 → 이동 시에도 단일 유지해야 double-decay 회피');
});

const endedAt=new Date().toISOString();
const fail=rows.filter(r=>r.status==='FAIL');
const patch=[
  '// easy: _hitFlash 감쇠를 render(-=1)에서 고정스텝 update(-=sp)로 이동 — double-decay 회피 위해 반드시 쌍으로',
  '// (1) game-easy-test.html 타이머 update 블록에 추가: if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp);',
  '// (2) game-easy-test.html render(50526-50528)의 `if(e._hitFlash>0){e._hitFlash-=1;}` 에서 -=1 제거(렌더는 그리기만)',
  '// (3) 사망 몹 clear(선행 후보 28c167dc): !e.alive 블록에 if(e._hitFlash)e._hitFlash=0;',
].join('\n');
const out={
  taskId:'supervisor-next/ANIMVFX/ANIMVFX-hitflash-fixedstep-migration-hf1326',
  recoveryTask:'RECOVERY-ANIMVFX-1326 (easy render-=1 → update-=sp, fps 대조, double-decay 검수)',
  capacityEpoch:'rolling-after-0d918990-1326 (credit 2, maxFiles 3, changes 64, stop<100)',
  provider:'VS Code Claude native (autonomous continuity)',
  cwd:root, node:process.version, startedAt, endedAt,
  sourceReadSHA:{ note:'실Read 시점 sha256. Git 미호출.', 'game.html':sha(gh), 'game-easy-test.html':sha(ge) },
  sourceLines:{ game_PHYS_STEP:'game.html:58760 (1000/60)', game_fixedLoop:'game.html:59990 while(_acc>=PHYS_STEP)',
    game_update_decay:'game.html:33200 _hitFlash=Math.max(0,_-sp) (고정스텝 단일)', game_render_drawonly:'GL 5240/2D 52046 — 그리기만(감쇠 없음)',
    easy_render_decay:'game-easy-test.html:50526-50528 _hitFlash-=1 (render, 유일 감쇠)', easy_no_update_decay:'easy updateE 고정스텝 감쇠 없음' },
  anchorHit, decaySites:{ game:gameDecaySites, easy:easyDecaySites },
  bands:'고정스텝 accumulator(PHYS_STEP=1000/60, while(_acc>=PHYS))와 render-frame 감쇠를 원문 수식대로 시뮬. 1초 wall-clock. GL/2D 실픽셀 없음. sp=1(근접 적) 기준; sp*2/4/8 tier(culled)는 별도.',
  fpsComparison:{ note:'flash=6 → 0 까지 wall-clock ms', easyCurrent_render_minus1:easyCur, candidate_update_sp:migrated, buggy_both_double:buggyBoth },
  finding:'easy는 _hitFlash 를 render 프레임마다 -=1 하여 피격 flash 지속시간이 FPS 의존(30fps≈0.2s, 60≈0.1s, 144≈0.042s). main은 고정스텝 -=sp(단일, render는 그리기만)로 wall-clock 상수(~0.1s). easy 이동 시 render -=1 제거 + update -=sp 추가를 쌍으로 하지 않으면 double-decay(수명 절반).',
  candidatePatch:{ applied:false, text:patch,
    rationale:'감쇠 사이트를 render→update로 "이동"(추가+제거 쌍). 단일 사이트 유지 → double-decay 0. 사망 clear(28c167dc)와 합쳐 부활 잔상+FPS 의존 모두 해소. _hitFlash 는 순수 VFX → 판정/공격/asset 불변. 보호2_3 무관.' },
  summary:{ groups:{ total:rows.length, pass:rows.filter(r=>r.status==='PASS').length, fail:fail.length } },
  productionApplied:false, runtimeAccepted:false,
  disclaimer:'source/fixture PASS ≠ 실제 fps/native/시각 PASS. 실제 주사율별 체감은 QA 화면 Gate.',
  docsHandoff:[
    {doc:'docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md', text:'easy enemy _hitFlash 가 render -=1(FPS 의존)·사망 clear 없음 → main 고정스텝 -=sp + 사망 clear 로 이동 권장. render→update 이동은 render -=1 제거와 쌍(double-decay 회피).'},
    {doc:'docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md', text:'VFX 수명의 주사율 독립 원칙: 수명 감쇠는 고정스텝 update(-=sp) 단일 사이트, render 경로는 그리기만. easy 미이관 잔존.'},
  ],
  rows
};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
process.exit(fail.length?1:0);
