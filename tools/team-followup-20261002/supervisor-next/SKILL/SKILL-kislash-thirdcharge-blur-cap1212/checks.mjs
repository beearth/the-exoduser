// SKILL-kislash-thirdcharge-blur-cap1212 — kiSlash(기검참) 3타 홀드차지 blur 유령발사 경계
//   DYNAMIC SOURCE EXTRACTION (hand-copy 아님). 양판 game.html/game-easy-test.html 디스크 바이트를
//   직접 추출·SHA-256 해시·new Function 실행.
//
// CH1-1 마일스톤 SKILL 행: "현재 CH1-1 입력 release/cancel의 실제 연결 후보 한 건 / 기존 스킬·
//   키보드/패드/blur 취소 lifecycle / 정상 발사와 취소의 자원·쿨다운·효과 기존 규칙 일치; 소스·대역·
//   실입력 범위 구분". 이미 채택된 가족(mortar/storm/hellRay/iceStorm/boneWall/thunderStake) 중복검사 0.
// 새 경계: _updateKiSlashThirdCharge(16011-16030) release가 레벨 기반(isHeld('weapon')=MB[0]).
//   _clearHeldInput가 MB[0]은 비우나 _kiChargeActive/P.s='wWindup'은 미초기화 → 업데이트 루프(32114)가
//   다음 프레임 release 판정 → 유령 검기 발사. 아이템 가족과 달리 "단일 플래그"가 아니라 상태머신
//   복원(wWindup→idle)이 필요한 구별 경계.
// productionApplied=false. source/fixture PASS ≠ native/시각/청취/실게임(게임패드 포함) PASS.
//   _fireKiSlashCrescent/isHeld는 대역(발사 레코더/입력) — 정상 발사의 실제 ST/CD 수치는 band(아래 §한계).
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs

import fs from 'node:fs'; import crypto from 'node:crypto';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
let startAt;
function sliceBrace(src,i){let d=0;for(;i<src.length;i++){const c=src[i];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(startAt,i+1);}}throw new Error('no brace match');}
function extractFn(src,sig){const k=src.indexOf(sig);if(k<0)return null;const br=src.indexOf('{',k+sig.length-1);startAt=br;return src.slice(k,br)+sliceBrace(src,br);}
function extractClear(src){const k=src.indexOf('function _clearHeldInput()');const br=src.indexOf('{',k);startAt=br;return src.slice(k,br)+sliceBrace(src,br);}

const main=fs.readFileSync(ROOT+'/game.html','utf8');
const easy=fs.readFileSync(ROOT+'/game-easy-test.html','utf8');
const updMain=extractFn(main,'function _updateKiSlashThirdCharge('), updEasy=extractFn(easy,'function _updateKiSlashThirdCharge(');
const clrMain=extractClear(main), clrEasy=extractClear(easy);
const parity={upd:updMain===updEasy, clear:clrMain===clrEasy};

// 후보: 현행 실제 _clearHeldInput 말미(_cutSkipHolding anchor 앞)에 kiSlash 3차차지 취소(상태복원) 삽입.
//   기존 idle 클린업(31758)과 동일 플래그 + wWindup→idle 상태 복원. 원상수/연출/정상 release 불변.
const anchor='_cutSkipHolding=false;_cutSkipHold=0;';
if(!clrMain.includes(anchor)) throw new Error('clear anchor missing — _clearHeldInput shape changed');
const clrCand=clrMain.replace(anchor, "if(typeof P!=='undefined'&&P&&P.s==='wWindup'&&P._kiChargeActive){P._kiChargeActive=false;P._kiChargeT=0;P.s='idle';P.st2=0}\n  "+anchor);

function run(variant,scenario){
  const body=`
    // ── 대역(band) ──
    let MB=[false,false,false],KH=Object.create(null),K=Object.create(null),MBjust=[false,false,false];
    let _dashHold=false,_dashHoldF=0,_dashTier=0,_cutSkipHolding=false,_cutSkipHold=0,_cresStep=0,_cresComboT=0;
    const _KI_HOLD_MAX=180;
    const _kiSlashHoldMultiplier=(t)=>t>=120?8:t>=60?4:2;   // 데미지 배율 helper(결함 대상 아님)
    const playSample=()=>{}, playVFXAng=()=>{}, _startSilvertailAttackMotion=()=>{}; const _VFX_SHEETS={};
    const BINDS={weapon:'mouse0'}, BINDS2={weapon:null};
    const _chkHeld=(b)=> b==='mouse0'?!!MB[0] : b?!!KH[b] : false;
    function isHeld(a){return _chkHeld(BINDS[a])||_chkHeld(BINDS2[a]);}
    let fired=null;
    function _fireKiSlashCrescent(stage,frames){fired={stage,frames};} // 대역: 발사 도달 레코더(실제 ST/CD는 crescent 경로 — §한계)
    let P={s:'idle',st2:0,facing:0,x:0,y:0,atkArc:0,_kiChargeActive:false,_kiChargeT:0,
      _beamHold:false,_mmAiming:false,_mmCharging:false,_msAiming:false,_msCharging:false,_bwAiming:false};
    const sp=1;
    ${variant==='candidate'?clrCand:clrMain}
    ${updMain}
    // 진입 + 홀드 충전 2프레임(isHeld true 유지)
    P.s='wWindup';P.st2=999;P._kiChargeActive=true;P._kiChargeT=0;P.atkArc=P.facing;
    MB[0]=true; _updateKiSlashThirdCharge(sp); _updateKiSlashThirdCharge(sp);
    const chargedT=P._kiChargeT, chargingActive=P._kiChargeActive;
    if('${scenario}'==='normalRelease'){ MB[0]=false; }   // 플레이어 정상 릴리즈
    else { _clearHeldInput(); }                            // blur 합성(등록 핸들러 그대로)
    const kiActiveAfterClear=P._kiChargeActive, stateAfterClear=P.s;
    // 업데이트 루프 32114 재현
    if(P.s==='wWindup'){ if(P._kiChargeActive)_updateKiSlashThirdCharge(sp); else if(P.st2<=0){P.s='wSwing';P.st2=5;} }
    return {variant:'${variant}',scenario:'${scenario}',chargedT,chargingActive,
      kiActiveAfterClear,stateAfterClear,fired:!!fired,fireInfo:fired,finalState:P.s,finalKiActive:P._kiChargeActive};
  `;
  return new Function(body)();
}
const m=[run('current','normalRelease'),run('candidate','normalRelease'),run('current','blur'),run('candidate','blur')];
const g=(v,s)=>m.find(o=>o.variant===v&&o.scenario===s);
const cN=g('current','normalRelease'),aN=g('candidate','normalRelease'),cB=g('current','blur'),aB=g('candidate','blur');
const verdicts={
  CONTROL_EQUIV:(cN.fired&&aN.fired&&JSON.stringify(cN.fireInfo)===JSON.stringify(aN.fireInfo)&&cN.finalState===aN.finalState)?'PASS(정상 릴리즈 발사 동일)':'FAIL',
  CURRENT_DEFECT:(cB.chargingActive&&cB.kiActiveAfterClear===true&&cB.fired)?'FAIL(blur 유령 검기 발사: _kiChargeActive 잔존→release)':'UNKNOWN',
  CANDIDATE_FIX:(aB.kiActiveAfterClear===false&&aB.stateAfterClear==='idle'&&!aB.fired&&aB.finalState!=='wSwing')?'PASS(blur 취소: 무발사·상태 idle 복원)':'FAIL'
};
console.log(JSON.stringify({dynamicSource:true,parityBothBuilds:parity,
  fileSha:{main:sha(main),easy:sha(easy)},
  sliceSha:{upd:sha(updMain),clear:sha(clrMain),clearCandidate:sha(clrCand)},matrix:m,verdicts},null,2));
