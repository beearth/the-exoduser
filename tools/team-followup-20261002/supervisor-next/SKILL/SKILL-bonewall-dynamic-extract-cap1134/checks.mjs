// SKILL-bonewall-dynamic-extract-cap1134 — boneWall(_bwAiming) 포커스 취소 경계
//   DYNAMIC SOURCE EXTRACTION 검증 (hand-copy 회귀 Gate 해소)
//
// 감독 STATE nextByRole.SKILL: "boneWall _bwAiming focus cancellation을 양판 실제
//   _clearHeldInput/aim caller 원문을 동적 추출·해시·실행하여 다음 LMB 가로채기와 정상 control
//   검증. hellRay/mortar/storm 기존검사 반복0·비용/자원정책 변경0."
// 이전 하니스(hb1014/hb1946)는 소스를 손으로 복사(handcopy) → source-extraction 회귀 Gate가
//   열려 있었다. 이 하니스는 game.html / game-easy-test.html 디스크 바이트를 brace-match로 직접
//   추출·SHA-256 해시·new Function 동적 실행하여 그 Gate를 닫는다.
// productionApplied=false. source/fixture PASS ≠ native/시각/청취/실게임(특히 게임패드) PASS.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
// (저장 당시 결과는 result.md의 "원 stdout"에 그대로 인계. game.html 파일 SHA는 root WIP로
//  바뀔 수 있으나, 추출 슬라이스 3종은 양판 byte-identical로 안정이었다 — result.md 참조.)

import fs from 'node:fs'; import crypto from 'node:crypto';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');

// ── brace-match 추출기 ──
function sliceBrace(src,startIdx){let d=0;for(let i=startIdx;i<src.length;i++){const c=src[i];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(startIdx,i+1);}}throw new Error('no brace match');}
function extractFn(src,sig){const k=src.indexOf(sig);if(k<0)return null;const br=src.indexOf('{',k+sig.length-1);return src.slice(k,br)+sliceBrace(src,br);}
function extractIf(src,cond){const k=src.indexOf(cond);if(k<0)return null;const br=src.indexOf('{',k);return src.slice(k,br)+sliceBrace(src,br);}

// ── 양판에서 실제 바이트 추출 + 해시 + parity ──
const files={main:ROOT+'/game.html',easy:ROOT+'/game-easy-test.html'};
const ex={};
for(const [tag,fp] of Object.entries(files)){
  const src=fs.readFileSync(fp,'utf8');
  ex[tag]={file:sha(src),
    clear:extractFn(src,'function _clearHeldInput()'),
    fireBW:extractFn(src,'function fireBoneWall('),
    aimBW:extractIf(src,'if(P._bwAiming){')};
}
const parity={clear:ex.main.clear===ex.easy.clear,fireBW:ex.main.fireBW===ex.easy.fireBW,aimBW:ex.main.aimBW===ex.easy.aimBW};
const clearReal=ex.main.clear, fireReal=ex.main.fireBW, aimReal=ex.main.aimBW;

// ── 후보: 실제 _clearHeldInput 텍스트의 결정적 1줄 변환 (기존 guard 끝에 _bwAiming 취소만) ──
const guardTail='P._msCharging=false}';
if(!clearReal.includes(guardTail)) throw new Error('guard anchor not found in real source — guard shape changed, abort');
const clearCand=clearReal.replace(guardTail,'P._msCharging=false;P._bwAiming=false}');

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ── 추출한 실제 바이트를 동적 주입 실행 (hand-copy 아님) ──
function run(variant,scenario){
  const body=`
    // 대역(band): side-effect 레코더·데미지 helper baseline·합성 좌표. 비용 가짜대입 아님.
    let K=Object.create(null),KH=Object.create(null);
    let MB=[false,false,false],MBjust=[false,false,false];
    let _dashHold=false,_dashHoldF=0,_dashTier=0,_cutSkipHolding=false,_cutSkipHold=0;
    const mouse={x:900,y:500},VW=1600,VH=900;
    const dst=(a,b,c,d)=>Math.hypot(c-a,d-b);
    const _skMul=()=>1,_fuseMul=()=>1,meleeRef=()=>1,statStr=()=>1,pAtkMul=()=>1;
    const _malCost=(v)=>v;
    const sfxLog=[];
    const SFX={magic:(e)=>sfxLog.push('SFX.magic('+e+')')};
    const playSample=(n)=>sfxLog.push('playSample('+n+')');
    const addTxt=()=>{}; const shake=(n)=>sfxLog.push('shake('+n+')');
    const showPH=()=>{}; const _T=s=>s; const _addSkProf=()=>{};
    const console={error:()=>{}};
    const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};
    const G={cam:{x:0,y:0},mats:999,_boneWalls:[]};
    let P={x:0,y:0,facing:0,mp:200,skills:{boneWall:1},_fused:null,
      _bwAiming:false,_bwStk:1,_bwRech:0,
      _beamHold:false,_mmAiming:false,_mmCharging:false,_msAiming:false,_msCharging:false};
    function _isFused(key){return!!(P._fused&&P._fused[key])}
    function _r(v,s){return v*(1+(Math.random()-.5)*2*(s||.05))}
    // ── 실제 추출 소스(동적 주입) ──
    ${variant==='candidate'?clearCand:clearReal}
    ${fireReal}
    function boneWallFrame(){ ${aimReal} }
    // ── 드라이버 ──
    const realRandom=Math.random; let rngCount=0; const seeded=env.seed();
    Math.random=()=>{rngCount++;return seeded();};
    const mpBefore=P.mp,matsBefore=G.mats,stkBefore=P._bwStk;
    let aimAfterClear=null;
    try{
      P._bwAiming=true; // router 12463 _gpActive 전용 진입(게임패드 조준 확정)
      if('${scenario}'==='controlLMB'){ MBjust[0]=true; boneWallFrame(); }
      else { _clearHeldInput(); aimAfterClear=P._bwAiming; MBjust[0]=true; boneWallFrame(); }
      return {variant:'${variant}',scenario:'${scenario}',aimAfterClear,
        mpDelta:mpBefore-P.mp,matsDelta:matsBefore-G.mats,stkDelta:stkBefore-P._bwStk,
        cooldown:P._bwRech||0,fired:G._boneWalls.length>0,installs:G._boneWalls.length,
        mbjust0AfterFrame:MBjust[0],sfxCalls:sfxLog.slice(),rngCount,aimAfterFrame:P._bwAiming};
    } finally { Math.random=realRandom; }
  `;
  return new Function('env',body)({seed:()=>mulberry32(0x5EED)});
}

const matrix=[run('current','controlLMB'),run('candidate','controlLMB'),run('current','blurThenLMB'),run('candidate','blurThenLMB')];
const f=(v,s)=>matrix.find(o=>o.variant===v&&o.scenario===s);
const cC=f('current','controlLMB'),aC=f('candidate','controlLMB'),cB=f('current','blurThenLMB'),aB=f('candidate','blurThenLMB');
const verdicts={
  CONTROL_EQUIV:(cC.fired&&aC.fired&&cC.installs===aC.installs&&cC.matsDelta===aC.matsDelta&&cC.stkDelta===aC.stkDelta&&cC.cooldown===aC.cooldown&&cC.cooldown>0&&JSON.stringify(cC.sfxCalls)===JSON.stringify(aC.sfxCalls)&&cC.rngCount===aC.rngCount&&cC.mbjust0AfterFrame===false)?'PASS':'FAIL',
  CURRENT_DEFECT:(cB.aimAfterClear===true&&cB.fired&&cB.cooldown>0&&cB.matsDelta>0&&cB.mbjust0AfterFrame===false)?'FAIL(결함 재현)':'UNKNOWN',
  CANDIDATE_FIX:(aB.aimAfterClear===false&&!aB.fired&&aB.matsDelta===0&&aB.stkDelta===0&&aB.cooldown===0&&aB.mbjust0AfterFrame===true&&aB.rngCount===0)?'PASS':'FAIL'
};
console.log(JSON.stringify({dynamicSource:true,
  fileSha:{main:ex.main.file,easy:ex.easy.file},
  sliceSha:{clear:sha(clearReal),fireBW:sha(fireReal),aimBW:sha(aimReal),clearCandidate:sha(clearCand)},
  parityBothBuilds:parity, matrix, verdicts},null,2));
