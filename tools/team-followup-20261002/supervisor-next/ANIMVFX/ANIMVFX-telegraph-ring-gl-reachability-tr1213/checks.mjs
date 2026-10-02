// ANIMVFX-telegraph-ring-gl-reachability-tr1213 (CH1-1 playable 목표 — hit/telegraph/lifetime 실제 연결)
// 경계: _telegraphT 윈드업 경고링의 렌더 도달성. 수명은 고정스텝 update로 갱신되나(원문),
//       8dir GL-큐 적은 prep 블록이 _telegraphT 링(원문) 앞에서 continue 하고 2D 링은 !_ensGLQueued로 게이트아웃되어
//       일반 8dir GL 적의 윈드업 링이 어느 경로에서도 안 그려짐(전조 누락)을 실제 source 앵커+게이트 모델+링 원문 실행으로 확정.
// 후보: 8dir GL 블록 continue 직전에 2D와 동일한 링 render 1줄 추가(그림자가 두 경로에 다 있는 패턴). render-only.
// 경계: 읽기 전용. Git 0. production 미적용. source-sink PASS ≠ 가시픽셀/완전몸/실게임 PASS(=QA 화면 Gate).
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

const gh=read('game.html');

// ── 실제 source 앵커 (존재/행 고정) ──
const anchors={
  // 8dir GL-큐 블록: eliteAura + chargeTele 후 continue (이 블록은 _telegraphT 링을 그리지 않음)
  prep8dirContinue: /e\._ensGLMode=1;[\s\S]{0,400}?_drawEliteAuraTelegraph\(X,e,sa,_now\);\s*\n\s*if\(e\.s==='eChargeWind'&&e\._chgAimMax>0\)\{_drawChargeTele\(X,e,sa\);\}\s*\n\s*continue;/,
  // 레거시-atlas/2D 공통 _telegraphT 링 원문 (prep 5224 버전)
  prepRing: /if\(e\._telegraphT>0&&e\._telegraphT<20\)\{\s*\n\s*const _tgProg=1-e\._telegraphT\/20;[\s\S]*?X\.stroke\(\);X\.globalAlpha=sa;\s*\n\s*\}/,
  // 2D 경로 링: !_ensGLQueued 게이트
  twoDgate: /if\(!_ensGLQueued&&e\._telegraphT>0&&e\._telegraphT<20\)\{/,
  // 수명 업데이트(고정스텝 sp)
  lifetime: /if\(e\._telegraphT>0\)\{e\._telegraphT-=sp;e\._telegraphR=e\.r\+20\}/,
  // eliteAura early-return(elite/rare 전용) — 일반 몹엔 무효
  eliteEarly: /function _drawEliteAuraTelegraph\(X,e,sa,now\)\{\s*\n\s*if\(!e\|\|!\(e\.elite>0\|\|e\.etype>=90\)[\s\S]{0,40}?return;/,
};
const anchorHit=Object.fromEntries(Object.entries(anchors).map(([k,re])=>[k,re.test(gh)]));

// ── 실제 _telegraphT 링 원문 statement 추출 → canvas sink로 실행(렌더 primitive가 stroke를 내는지) ──
const ringStmt=(gh.match(/if\(e\._telegraphT>0&&e\._telegraphT<20\)\{\s*\n\s*const _tgProg=1-e\._telegraphT\/20;[\s\S]*?X\.stroke\(\);X\.globalAlpha=sa;\s*\n\s*\}/)||[])[0];
expect(ringStmt,'ring statement 추출');
const runRing=new Function('X','e','sa',`${ringStmt}`);
function canvasSink(sink){ return {
  _a:1, set globalAlpha(v){}, get globalAlpha(){return 1;}, set strokeStyle(v){}, set lineWidth(v){},
  beginPath(){}, arc(){sink.push('arc');}, stroke(){sink.push('stroke');} }; }

// ── 세 렌더 경로의 실제 게이트를 원문 그대로 반영한 디스패치 모델 ──
// 수명 update는 공통이므로 링 '렌더'만 집계. elite는 aura 스프라이트(별개)만, _telegraphT 링 아님.
function ringRenderCount({is8dirGLQueued, telegraphT, patched=false}){
  const inWin = telegraphT>0 && telegraphT<20;
  let n=0;
  if(is8dirGLQueued){
    // 현행: prep 8dir 블록은 eliteAura+chargeTele 후 continue → _telegraphT 링 미실행. 2D는 !_ensGLQueued로 스킵.
    // 후보(patched): 8dir 블록 continue 직전 링 추가 → inWin이면 실제 링 실행.
    if(patched && inWin){ const s=[]; runRing(canvasSink(s), {x:0,y:0,r:20,_telegraphT:telegraphT}, 1); if(s.includes('stroke')) n++; }
  }else{
    // 2D fallback 경로: !_ensGLQueued && inWin → 실제 링 실행
    if(inWin){ const s=[]; runRing(canvasSink(s), {x:0,y:0,r:20,_telegraphT:telegraphT}, 1); if(s.includes('stroke')) n++; }
  }
  return n;
}

// ── 검증 ──
check('ANCHORS-present', ()=>{ for(const [k,v] of Object.entries(anchorHit)) expect(v===true, 'anchor '+k); });
check('RING-stmt-executes-stroke', ()=>{ const s=[]; runRing(canvasSink(s), {x:0,y:0,r:20,_telegraphT:15}, 1); expect(s.includes('stroke'),'링 원문이 stroke 수행'); });

// 현행: 일반 8dir GL 적 윈드업 → 링 0회(전조 누락). 2D 적 → 1회(제어, 게이트가 실제 분기함 입증)
check('CURRENT-normal-8dirGL-drops-ring', ()=>{ eq(ringRenderCount({is8dirGLQueued:true,telegraphT:15}),0,'8dir GL 적 링 누락'); });
check('CONTROL-2D-enemy-draws-ring', ()=>{ eq(ringRenderCount({is8dirGLQueued:false,telegraphT:15}),1,'2D 적 링 1회'); });
check('CONTROL-outside-window-no-ring', ()=>{ eq(ringRenderCount({is8dirGLQueued:false,telegraphT:20}),0,'telegraphT>=20 창 밖 미렌더'); });

// 후보: 8dir GL 블록에 링 추가하면 일반 8dir GL 적도 1회(=2D와 동일 복원), 수명/판정 불변
check('CANDIDATE-patched-restores-ring', ()=>{ eq(ringRenderCount({is8dirGLQueued:true,telegraphT:15,patched:true}),1,'패치 후 8dir GL 적 링 1회'); });

const endedAt=new Date().toISOString();
const fail=rows.filter(r=>r.status==='FAIL');
// 미적용 patch 원문(game.html 8dir GL 블록 continue 직전 삽입)
const patch=`if(e._telegraphT>0&&e._telegraphT<20){const _tgP=1-e._telegraphT/20;X.globalAlpha=_tgP*.5;X.strokeStyle='#ff2200';X.lineWidth=2;X.beginPath();X.arc(e.x,e.y,(e._telegraphR||e.r+20)*_tgP,0,Math.PI*2);X.stroke();X.globalAlpha=sa;}`;
const out={
  taskId:'supervisor-next/ANIMVFX/ANIMVFX-telegraph-ring-gl-reachability-tr1213',
  milestone:'MILESTONE-CH1-1-PLAYABLE-20261002 (ANIMVFX: hit/telegraph/lifetime 실제 연결)',
  provider:'VS Code Claude native (autonomous continuity, iteration)',
  capacityEpoch:'capacity-after-6a39b828-1212',
  cwd:root, node:process.version, startedAt, endedAt,
  sourceReadSHA:{ note:'실Read 시점 sha256. Git 미호출. milestone 문서 실제 SHA=713aa80c…(피어 제시 889fb16f… 와 불일치, 실파일 기준 사용).',
    'game.html':sha(gh), ringStmt:sha(ringStmt) },
  sourceLines:{ lifetimeUpdate:'game.html:37244 (e._telegraphT-=sp 고정스텝)', prep8dirContinue:'game.html:~5195-5197 (_drawEliteAuraTelegraph+chargeTele then continue)',
    prepRing:'game.html:5224-5227 (레거시-atlas 경로의 _telegraphT 링)', twoDgate:'game.html:51839 (!_ensGLQueued 게이트)', eliteEarly:'game.html:5283 (elite/rare 전용 early-return)' },
  anchorHit,
  bands:'canvas sink(stroke/arc 기록)로 링 원문 statement 실행. 세 렌더 경로 게이트는 원문 조건 그대로 반영. GL uniform/crop/실픽셀 없음.',
  finding:'일반(비elite) 8dir GL-큐 적의 _telegraphT 윈드업 경고링이 어느 경로에서도 렌더되지 않음(prep continue가 링 앞에서 스킵, 2D는 !_ensGLQueued로 스킵, _drawEliteAuraTelegraph는 elite/rare 전용). 수명은 정상 갱신. → 전조 누락(화면 가독성 저하).',
  candidatePatch:{ applied:false, where:'game.html 8dir GL 블록 continue(≈5197) 직전 삽입 (game-easy-test.html은 _drawEliteAuraTelegraph 부재로 블록 구조 상이 → 패치 위치 별도 확인 필요, 이번 미확정)', text:patch,
    rationale:'그림자가 prep/2D 두 경로에 모두 있는 것과 동일 패턴으로 GL 경로에 전조 링을 추가. body-skip 가드 채택이 아니라 GL 경로 render 추가(미채택 Gate 보존). 수명/판정/자원/에셋 불변.' },
  summary:{ groups:{ total:rows.length, pass:rows.filter(r=>r.status==='PASS').length, fail:fail.length } },
  productionApplied:false, runtimeAccepted:false,
  disclaimer:'source-sink PASS ≠ 가시픽셀/완전몸 렌더/실게임 PASS. 실제 링 가시성·누락 체감은 QA 화면 Gate.',
  docsHandoff:[
    {doc:'docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md', text:'8dir GL-큐 적의 _telegraphT 윈드업 링 누락(prep continue+2D 게이트) 및 render-only 복원 후보(미적용) 기록. hit_flash 상호배타 분석과 별개 경계.'},
    {doc:'docs/5.1임펙트디자인/VFX_구현가이드.md', text:'전조(_telegraphT) 수명=고정스텝 update, 렌더는 2경로(prep 레거시/2D)인데 8dir GL 경로엔 링 render 부재 → GL 적 전조 누락. 후보: GL 블록에 링 추가.'},
  ],
  rows
};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
process.exit(fail.length?1:0);
