// SKILL-hellray-focus-cancellation-hb1014 — 참회(hellRay) 조준 _hrAiming 가 blur/hidden 뒤 남는 취소 경계
// 인수: mortar(root 통합)·maliceStorm plain(4f7 통합/66 회귀) 완료 → 재실행 0.
// 새 대상: _hrAiming 은 _clearHeldInput 의 held clear에서 제외됨. hellRay 발사 트리거는 MBjust[0]
//   (LMB edge)이라 blur의 MBjust 비움으로 "즉시 유령발사"는 없다. 그러나 _hrAiming 이 남아
//   blur/hidden 복귀 후 플레이어의 다음 LMB(평타 의도)가 "조준 블록 if(P._hrAiming)"에 가로채여
//   의도치 않은 참회 설치(MP-100·_hrStk--·zone·쿨)로 소비되는지 실제 입력정리/발사 블록으로 재현.
// 후보: 기존 P guard 안에서 aim 플래그 P._hrAiming=false 만 취소. MP/ST/충전/_hrStk/CD/zone/숙련/RNG 불변.
// control: 정상 승인 LMB 발사(조준 중 LMB→정상 참회). control 없이 PASS 0.
// root _skUnclick/스킬카드 minus 재현·소유 제외. 보호2_3·패링·합체수치 수정 0. productionApplied=false.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 실제 소스 출처(현행 game.html, SHA는 result.md. 현행 grep/Read 행):
//   hellRay 조준/발사 블록 : 35030-35061 (발사 트리거 MBjust[0], 취소 MBjust[2]||Escape)
//   router hellRay 진입/취소: 31818-31820 (_hrAiming 토글), 31800 (E 취소)
//   _clearHeldInput        : 12877-12885 (12883 guard: _mm/_ms 기통합, _hr 미포함)
//   _isFused/_r/EL         : 43007 / 12004 / 13838
//   P 초기 null            : 15899

import crypto from 'node:crypto';
function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function mulberry32(a){ return function(){ a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296; }; }
const SRC={};

function run(variant, scenario){
  // ── 최소 전역 그릇 ──
  let K=Object.create(null), KH=Object.create(null);
  let MB=[false,false,false], MBjust=[false,false,false];
  let _dashHold=false,_dashHoldF=0,_dashTier=0,_cutSkipHolding=false,_cutSkipHold=0;
  // ── 대역(band): side-effect 레코더·데미지 helper baseline·합성 좌표 ──
  const mouse={x:900,y:500}, VW=1600, VH=900;        // 합성 조준 좌표(KBM)
  const dst=(a,b,c,d)=>Math.hypot(c-a,d-b);          // 거리 band
  const magicRef=()=>1, statInt=()=>1, pMagicMul=()=>1, pBeamMul=()=>1, _skMul=()=>1, _fuseMul=()=>1; // _hrDmg 데미지 helper baseline(피해값은 결함 대상 아님, 비용 가짜대입 아님)
  const sfxLog=[];
  const SFX={magic:(e)=>sfxLog.push('SFX.magic('+e+')')};
  const playSample=(n)=>sfxLog.push('playSample('+n+')');
  const addTxt=()=>{}; const shake=(n)=>sfxLog.push('shake('+n+')');
  const showPH=()=>{}; const _T=s=>s; const _addSkProf=()=>{};
  const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};            // SRC 13838 verbatim
  const G={ cam:{x:0,y:0}, _fireZones:[] };
  // ── 플레이어 baseline : hellRay Lv1(max 1충전)·무합체·MP200·_hrStk1(발사 시 0→쿨 600 engage) ──
  let P={ x:0,y:0,facing:0, mp:200, skills:{hellRay:1,maliceStorm:1}, _fused:null,
          _hrAiming:false, _hrStk:1, _hrRech:0,
          _beamHold:false,_mmAiming:false,_mmCharging:false,_msAiming:false,_msCharging:false };

  function _isFused(key){return!!(P._fused&&P._fused[key])}   // SRC 43007 verbatim
  function _r(v,s){return v*(1+(Math.random()-.5)*2*(s||.05))} // SRC 12004 verbatim

  // ── _clearHeldInput : current(verbatim, _mm/_ms 기통합) vs candidate(+_hr aim) ──
  function _clearHeldInput_current(){
    for(const k in K)K[k]=false;
    for(const k in KH)KH[k]=false;
    for(const b in MB)MB[b]=false;
    for(const b in MBjust)MBjust[b]=false;
    _dashHold=false;_dashHoldF=0;_dashTier=0; // 쉬프트 홀드 무장 해제 (팬텀 릴리즈/재발사 차단)
    if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false;P._msAiming=false;P._msCharging=false}
    _cutSkipHolding=false;_cutSkipHold=0;
  }
  function _clearHeldInput_candidate(){
    for(const k in K)K[k]=false;
    for(const k in KH)KH[k]=false;
    for(const b in MB)MB[b]=false;
    for(const b in MBjust)MBjust[b]=false;
    _dashHold=false;_dashHoldF=0;_dashTier=0; // 쉬프트 홀드 무장 해제 (팬텀 릴리즈/재발사 차단)
    if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false;P._msAiming=false;P._msCharging=false;P._hrAiming=false} // [후보] 기존 guard 안 _hrAiming aim 플래그만 추가
    _cutSkipHolding=false;_cutSkipHold=0;
  }
  const _clearHeldInput = variant==='candidate' ? _clearHeldInput_candidate : _clearHeldInput_current;

  // ── hellRay 조준/발사 한 update 프레임 (verbatim, 35030-35061) ──
  function hellRayAimFrame(){
    if(P._hrAiming){
      let _hrwx=mouse.x-VW/2+G.cam.x;
      let _hrwy=mouse.y-VH/2+G.cam.y;
      {const _hrD3=dst(P.x,P.y,_hrwx,_hrwy);if(_hrD3>1000){const _hrA3=Math.atan2(_hrwy-P.y,_hrwx-P.x);_hrwx=P.x+Math.cos(_hrA3)*1000;_hrwy=P.y+Math.sin(_hrA3)*1000}}
      if(MBjust[2]||K['Escape']){P._hrAiming=false;MBjust[2]=false;K['Escape']=false}
      else if(MBjust[0]){
        MBjust[0]=false;
        if((P._hrStk||0)<=0){P._hrAiming=false;showPH(_T('충전 중...'),'#ffd700')}
        else if(P.mp<100){showPH(_T('MP 부족! (100)'),'#4488ff')}
        else{
        const _hrLv=P.skills.hellRay||1;
        const _hrR=200+(_hrLv-1)*22; // 악의폭풍과 동일 크기
        const _hrElec=_isFused('elecRepent'); // 참회 귀환 합체
        const _hrDmg=~~(magicRef()*statInt()*pMagicMul()*pBeamMul()*_skMul('hellRay')*(_hrElec?1.2:1)*_fuseMul('hellRay')); // 통일공식: _skMul + 빔 장비 배율
        P.mp-=100;P._hrStk--;const _hrMx3=_hrElec?(_hrLv>=10?3:_hrLv>=5?2:1):1;if(P._hrStk<_hrMx3&&!P._hrRech)P._hrRech=600;
        const _hrDur=600; // 10초 고정
        if(!G._fireZones)G._fireZones=[];
        G._fireZones.push({x:_hrwx,y:_hrwy,r:_hrR,t:0,maxT:_hrDur,
          dmg:_hrDmg,el:_hrElec?EL.L:5,lv:_hrLv,type:'hellRay',ang:0,elec:_hrElec});
        if(_hrElec){
          // 전기 소용돌이 동시 생성 — storm DOT 장판
          const _msLv=P.skills.maliceStorm||1;
          const _msR=~~(_hrR*0.8);
          const _msDmg=~~(magicRef()*statInt()*pMagicMul()*_skMul('maliceStorm')*_fuseMul('maliceStorm'));
          G._fireZones.push({x:_hrwx,y:_hrwy,r:_msR,t:0,maxT:_hrDur,
            dmg:_msDmg,el:EL.L,lv:_msLv,type:'storm'});
        }
        P._hrAiming=false;_addSkProf('hellRay');
        SFX.magic(_hrElec?4:5);playSample('repentance',.7,_r(1,.08));
        if(_hrElec)playSample(Math.random()>.5?'electric_storm':'electric_storm2',.5,_r(1,.1));
        addTxt(_hrwx,_hrwy-20,_hrElec?_T('⚡⚡ 참회 귀환!'):_T('⚡ 참회!'),_hrElec?'#ffee44':'#ffd700',50);shake(_hrElec?10:6);}
      }
    }
  }
  // 진입 = router 31820 (P._hrAiming=true). 키 홀드 상태 아님(토글형).
  function enterAim(){ P._hrAiming=true; }

  if(!SRC.aim){ SRC.aim=sha(hellRayAimFrame.toString()); SRC.clearCur=sha(_clearHeldInput_current.toString()); }

  const realRandom=Math.random; let rngCount=0; const seeded=mulberry32(0x5EED);
  Math.random=()=>{ rngCount++; return seeded(); };
  const mpBefore=P.mp, stkBefore=P._hrStk;
  let hrAimingAfterClear=null;
  try{
    enterAim();                 // 참회 조준 진입
    if(scenario==='controlLMB'){
      // 정상 승인: 조준 중 플레이어가 LMB로 참회 설치
      MBjust[0]=true;
      hellRayAimFrame();
    } else if(scenario==='blurThenLMB'){
      // 결함: 조준 중 blur → _clearHeldInput → 복귀 후 플레이어가 "평타 의도"로 LMB
      _clearHeldInput();                 // 등록 핸들러 그대로 (MBjust 비움, _hrAiming은 current에서 잔존)
      hrAimingAfterClear = P._hrAiming;  // current=true(sticky) / candidate=false
      MBjust[0]=true;                    // 복귀 후 다음 LMB (평타 의도)
      hellRayAimFrame();
    }
    const firedHr = G._fireZones.some(z=>z.type==='hellRay');
    return {
      variant, scenario,
      hrAimingAfterClear,
      mpBefore, mpAfter:P.mp, mpDelta:mpBefore-P.mp,
      hrStkBefore:stkBefore, hrStkAfter:P._hrStk, hrStkDelta:stkBefore-P._hrStk,
      hrRech:P._hrRech||0,
      firedHellRay:firedHr, fireZones:G._fireZones.length,
      mbjust0AfterFrame:MBjust[0],   // true=평타로 보존, false=참회에 소비됨
      sfxCalls:sfxLog.slice(), rngCount,
      hrAimingAfterFrame:P._hrAiming
    };
  } finally { Math.random=realRandom; }
}

const matrix=[
  run('current','controlLMB'),
  run('candidate','controlLMB'),
  run('current','blurThenLMB'),
  run('candidate','blurThenLMB'),
];
const f=(v,s)=>matrix.find(o=>o.variant===v&&o.scenario===s);
const cC=f('current','controlLMB'), aC=f('candidate','controlLMB');
const cB=f('current','blurThenLMB'), aB=f('candidate','blurThenLMB');

const verdicts={};
// CONTROL: 정상 승인 LMB 발사가 current==candidate 동일 (실제 발사·MP-100·_hrStk--·zone·쿨·RNG)
verdicts.CONTROL_EQUIV = (
  cC.firedHellRay && aC.firedHellRay &&
  cC.mpDelta===100 && aC.mpDelta===100 &&
  cC.hrStkDelta===1 && aC.hrStkDelta===1 &&
  cC.hrRech===aC.hrRech && cC.hrRech>0 &&
  cC.fireZones===aC.fireZones &&
  JSON.stringify(cC.sfxCalls)===JSON.stringify(aC.sfxCalls) &&
  cC.rngCount===aC.rngCount &&
  cC.mbjust0AfterFrame===false && aC.mbjust0AfterFrame===false
) ? 'PASS(정상 승인 LMB 참회 발사 current==candidate: MP-100·_hrStk-1·zone·쿨·RNG 동일)' : 'FAIL';
// DEFECT CURRENT: blur 뒤 _hrAiming 잔존 → 다음 LMB(평타 의도) 가로채여 참회 설치
verdicts.CURRENT_DEFECT = (
  cB.hrAimingAfterClear===true &&     // sticky aim
  cB.firedHellRay && cB.mpDelta===100 && cB.hrStkDelta===1 && cB.hrRech>0 &&
  cB.mbjust0AfterFrame===false        // LMB가 참회에 소비됨(평타로 못 감)
) ? 'FAIL(결함: blur 뒤 조준 잔존, 다음 LMB가 의도치 않은 참회로 소비 — MP-100·_hrStk-1·zone·쿨)' : 'UNKNOWN';
// CANDIDATE DEFECT FIX: blur 뒤 _hrAiming=false → 다음 LMB 미소비, 참회 미설치
verdicts.CANDIDATE_FIX = (
  aB.hrAimingAfterClear===false &&    // aim 취소됨
  !aB.firedHellRay && aB.mpDelta===0 && aB.hrStkDelta===0 && aB.hrRech===0 &&
  aB.fireZones===0 && aB.sfxCalls.length===0 && aB.rngCount===0 &&
  aB.mbjust0AfterFrame===true         // LMB 보존 → 평타 등 정상 처리로 감
) ? 'PASS(후보: blur 뒤 조준 취소, 다음 LMB 미소비·참회 미설치·MP/_hrStk/쿨/zone/RNG 불변)' : 'FAIL';

console.log(JSON.stringify({ node:process.version, srcHashes:SRC, matrix, verdicts }, null, 2));
