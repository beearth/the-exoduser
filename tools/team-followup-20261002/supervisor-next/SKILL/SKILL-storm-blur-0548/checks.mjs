// SKILL-storm-blur-0548 — maliceStorm(악의폭풍) 홀드→release의 포커스 상실 경계 1건
// 감독 인수: continuous/SKILL의 mortar 결과(실제 차감/쿨660/bomb/SFX/RNG3, 후보A 정상동등·blur무발사)를
//   source 근거로 인수. mortar 4대조/C0/142는 재실행하지 않는다. 이번은 "다른 기존 스킬" maliceStorm의
//   독립 경계만 검사: 현행 router→_msAiming/_msCharging/_msDist→_msRel→실제 fireZone/쿨/생성 caller 체인을
//   읽고, 정상 keyup 1입력 + 충전 중 _clearHeldInput 합성 blur 1입력만 source fixture로 대조.
// 금지 준수: 가짜 HP/MP 대입·probe 전비용 PASS 조작 안 함(플레인 storm은 release에서 MP 미차감 — 실제
//   소스 동작 그대로 관찰). 원상수/연출/자원/정상 release/RNG 순서/키바인딩/스킬공식/2_3 불변.
//   mortar 두 플래그는 root 통합분이며 본인 수정 0. pause/death/revive/패드/stage 확장 0.
// productionApplied=false. source fixture PASS ≠ 실입력 포커스/음향/시각/게임 PASS.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 실제 소스 출처(현행 game.html, SHA는 result/evidence. 현행 grep/Read 행):
//   router case 'maliceStorm'       : 12484-12491 (진입만, MP 체크/차감 없음 — 쿨다운만)
//   maliceStorm aim/charge/release  : 35039-35122 (플레인 storm 플로우 verbatim)
//   _clearHeldInput                 : 12877-12885 (12883 P guard에 _mm 2플래그는 root 기통합, _ms 미포함)
//   _isFused / EL                   : 43007 / 13838
//   _r                              : 12004
//   P 초기 선언 null                : 15899

import crypto from 'node:crypto';
function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }
function mulberry32(a){ return function(){ a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296; }; }

const SRC = {};

function run(variant, scenario){
  // ── 최소 전역 그릇 ──
  let K=Object.create(null), KH=Object.create(null);
  let MB=[false,false,false], MBjust=[false,false,false];
  let _dashHold=false,_dashHoldF=0,_dashTier=0,_cutSkipHolding=false,_cutSkipHold=0;
  const sp=1;
  // ── 대역(band) : baseline 입력·side-effect 레코더. 비용 가짜대입 아님 ──
  const _gpActive=true;                 // 게임패드 경로 고정 → fire 위치 = P.facing×_msDist (mouse/cam 비의존)
  const mouse={x:0,y:0}, VW=1600, VH=900;              // KBM else 미도달(합성 입력 명시)
  const dst=(a,b,c,d)=>Math.hypot(c-a,d-b);            // KBM/zone 거리 band(플레인+빈 _fireZones라 미호출)
  const magicRef=()=>1, statInt=()=>1, pMagicMul=()=>1, _skMul=()=>1, _fuseMul=()=>1; // _msDmg 데미지 helper baseline(피해값은 본 결함 대상 아님)
  const meleeRef=()=>1, statStr=()=>1, pAtkMul=()=>1, pBeamMul=()=>1; // 합체 분기 전용(본 실행서 미도달)
  const sfxLog=[];
  const SFX={magic:(e)=>sfxLog.push('SFX.magic('+e+')')};
  const playSample=(n)=>sfxLog.push('playSample('+(Array.isArray(n)?'[]':n)+')');
  const addTxt=()=>{}; const shake=(n)=>sfxLog.push('shake('+n+')');
  const showPH=()=>{}; const _T=s=>s; const _addSkProf=()=>{};
  const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};              // SRC 13838 verbatim
  const G={ cam:{x:0,y:0}, mats:999, _fireZones:[], _boneWalls:[] };
  // ── 플레이어 baseline : maliceStorm Lv1·무합체·MP100(플레인 경로 MP 불변 관찰용) ──
  let P={ x:0,y:0,facing:0, mp:100, skills:{maliceStorm:1}, _fused:null,
          _msAiming:false,_msAimKey:null,_msDist:150,_msCharging:false,
          _beamHold:false,_mmAiming:false,_mmCharging:false,_msCd:0,_bnsCd:0 };

  function _isFused(key){return!!(P._fused&&P._fused[key])}   // SRC 43007 verbatim
  function _r(v,s){return v*(1+(Math.random()-.5)*2*(s||.05))} // SRC 12004 verbatim

  // ── _clearHeldInput : current(verbatim, mortar fix 기통합) vs candidate(+_ms 2플래그) ──
  function _clearHeldInput_current(){
    for(const k in K)K[k]=false;
    for(const k in KH)KH[k]=false;
    for(const b in MB)MB[b]=false;
    for(const b in MBjust)MBjust[b]=false;
    _dashHold=false;_dashHoldF=0;_dashTier=0; // 쉬프트 홀드 무장 해제 (팬텀 릴리즈/재발사 차단)
    if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false}
    _cutSkipHolding=false;_cutSkipHold=0;
  }
  function _clearHeldInput_candidate(){
    for(const k in K)K[k]=false;
    for(const k in KH)KH[k]=false;
    for(const b in MB)MB[b]=false;
    for(const b in MBjust)MBjust[b]=false;
    _dashHold=false;_dashHoldF=0;_dashTier=0; // 쉬프트 홀드 무장 해제 (팬텀 릴리즈/재발사 차단)
    if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false;P._msAiming=false;P._msCharging=false} // [후보] 기존 guard 안 _ms 2플래그만 추가(_mm은 root 기통합, 본인 미수정)
    _cutSkipHolding=false;_cutSkipHold=0;
  }
  const _clearHeldInput = variant==='candidate' ? _clearHeldInput_candidate : _clearHeldInput_current;

  // ── maliceStorm aim/charge/release 한 update 프레임 (verbatim, 35039-35122) ──
  function stormAimFrame(){
    if(P._msAiming){
      // 포격식: 키홀드→거리증가(KBM), 게임패드는 _isAimMode에서 처리
      const _msKk=P._msAimKey;
      if(_msKk&&KH[_msKk]){P._msCharging=true;P._msDist=Math.min((P._msDist||150)+24*sp,1000)}
      const _msRel=P._msCharging&&_msKk&&!KH[_msKk];
      // 발사 위치: P.facing방향 × P._msDist (게임패드), KBM은 마우스
      let _mswx,_mswy;
      if(_gpActive){
        _mswx=P.x+Math.cos(P.facing)*(P._msDist||150);
        _mswy=P.y+Math.sin(P.facing)*(P._msDist||150);
      }else{
        _mswx=mouse.x-VW/2+G.cam.x;
        _mswy=mouse.y-VH/2+G.cam.y;
        const _msDst=dst(P.x,P.y,_mswx,_mswy);
        if(_msDst>1000){const _msA=Math.atan2(_mswy-P.y,_mswx-P.x);_mswx=P.x+Math.cos(_msA)*1000;_mswy=P.y+Math.sin(_msA)*1000}
      }
      const _msLv=P.skills.maliceStorm||1;
      const _msR=200+(_msLv-1)*22; // 1렙200, Lv당+22
      if(MBjust[2]||K['Escape']){P._msAiming=false;P._msCharging=false;MBjust[2]=false;K['Escape']=false}
      else if(MBjust[0]||_msRel){
        MBjust[0]=false;P._msCharging=false;
        if(!G._fireZones)G._fireZones=[];
        const _msBF=_isFused('boneStorm')||_isFused('elecRepent');
        let _msBlocked=false;
        for(let fi=0;fi<G._fireZones.length;fi++){
          const fz=G._fireZones[fi];
          if((fz.type==='storm'||fz.type==='boneStorm')&&dst(fz.x,fz.y,_mswx,_mswy)<fz.r+_msR){_msBlocked=true;break}
        }
        if(_msBlocked){showPH(_T('이미 폭풍 지역!'),'#cc88ff')}
        else{
          const _msDmg=~~(magicRef()*statInt()*pMagicMul()*_skMul('maliceStorm')*_fuseMul('maliceStorm'));
          let _castSuccess=false;
          if(_msBF){
            const _bsMpCost=50;
            if(P.mp<_bsMpCost){showPH(_T('MP 부족!'),'#4488ff')}
            else{
              P.mp=Math.max(0,P.mp-_bsMpCost);
              const _bsLv=P.skills.boneWall||1;
              const _bsRingR=~~((400+(_bsLv-1)*18)*.7);
              const _erF=_isFused('elecRepent');
              const _hrLv=_erF?(P.skills.hellRay||1):0;
              const _syncDur=600;
              const _bsRiseDmg=~~(meleeRef()*statStr()*pAtkMul()*_skMul('boneWall')*_fuseMul('boneWall'));
              if(!G._boneWalls)G._boneWalls=[];
              G._boneWalls.push({x:_mswx,y:_mswy,ringR:_bsRingR,wallThk:14,
                t:0,riseT:60,maxT:_syncDur,dmg:_bsRiseDmg,hitSet:new Set(),phase:'rise'});
              G._fireZones.push({x:_mswx,y:_mswy,r:_bsRingR,t:0,maxT:_syncDur,
                dmg:_msDmg,el:EL.D,lv:_msLv,type:'boneStorm'});
              playSample('skull_summon',.6,_r(.9,.15));
              G.mats=Math.max(0,G.mats-12);
              if(_erF&&P.skills.hellRay>=1){
                const _hrDmg=~~(magicRef()*statInt()*pMagicMul()*pBeamMul()*_skMul('hellRay')*1.2);
                G._fireZones.push({x:_mswx,y:_mswy,r:200+(_hrLv-1)*22,t:0,maxT:_syncDur,
                  dmg:_hrDmg,el:EL.L,lv:_hrLv,type:'hellRay',ang:0,elec:true});
                SFX.magic(EL.L);playSample('repentance',.7,_r(1,.08));
                addTxt(_mswx,_mswy-20,_T('⚡🦴 참회 귀환!'),'#ffee44',50);
                shake(10);_addSkProf('hellRay');
              }else{
                SFX.magic(EL.D);
                addTxt(_mswx,_mswy-20,_T('🦴⚡해골번개!'),'#55cc77',30);
                shake(6);
              }
              _castSuccess=true;
            }
          }else{
            G._fireZones.push({x:_mswx,y:_mswy,r:_msR,t:0,maxT:600,
              dmg:_msDmg,el:EL.L,lv:_msLv,type:'storm'});
            SFX.magic(EL.L);
            playSample(['electric_storm','electric_storm2','electric_storm3','electric_storm4'][~~(Math.random()*4)],.6,_r(1,.1));
            addTxt(_mswx,_mswy-20,_T('⚡악의폭풍!'),'#55ccff',30);
            shake(4);
            _castSuccess=true;
          }
          if(_castSuccess){
            if(Math.random()<.3)playSample('voice_magic',1,1);else{const _ve=['voice_grunt','male_grunt'];playSample(_ve[~~(Math.random()*2)],1,_r(1,.15))};
            if(_msBF){P._bnsCd=1500}else{P._msCd=1200}
            _addSkProf('maliceStorm');
            P._msAiming=false;
          }
        }
      }
    }
  }
  // 진입 = router case 'maliceStorm'(12490) 핵심 (MP 미차감 — 쿨다운만)
  function enterAim(keyCode){ P._msAiming=true; P._msAimKey=keyCode; P._msDist=150; P._msCharging=false; KH[keyCode]=true; }

  if(!SRC.aim){ SRC.aim=sha(stormAimFrame.toString()); SRC.clearCur=sha(_clearHeldInput_current.toString()); }

  const realRandom=Math.random; let rngCount=0; const seeded=mulberry32(0x5EED);
  Math.random=()=>{ rngCount++; return seeded(); };
  const mpBefore=P.mp;
  try{
    enterAim('KeyQ');      // 조준 진입 + 키 홀드(합성)
    stormAimFrame();       // 1프레임 홀드 → _msCharging=true
    const chargedBefore=P._msCharging===true;
    if(scenario==='normalKeyup'){ KH['KeyQ']=false; }
    else if(scenario==='blur'){ _clearHeldInput(); }
    stormAimFrame();       // release/복귀 프레임
    const fired = G._fireZones.length>0;
    return {
      variant, scenario, chargedBefore,
      mpBefore, mpAfter:P.mp, mpDelta:mpBefore-P.mp,
      fired, fireZones:G._fireZones.length,
      fireZoneType: G._fireZones[0]?G._fireZones[0].type:null,
      cooldownMsCd: P._msCd||0, cooldownBnsCd: P._bnsCd||0,
      sfxCalls: sfxLog.slice(), rngCount,
      aimingAfter:P._msAiming, chargingAfter:P._msCharging,
      mortarFlagsTouched:{mmAiming:P._mmAiming,mmCharging:P._mmCharging}
    };
  } finally { Math.random=realRandom; }
}

const matrix=[
  run('current','normalKeyup'),
  run('candidate','normalKeyup'),
  run('current','blur'),
  run('candidate','blur'),
];
const f=(v,s)=>matrix.find(o=>o.variant===v&&o.scenario===s);
const cN=f('current','normalKeyup'), aN=f('candidate','normalKeyup');
const cB=f('current','blur'), aB=f('candidate','blur');

const verdicts={};
verdicts.NORMAL_EQUIV = (
  cN.fired && aN.fired &&
  cN.fireZones===aN.fireZones && cN.fireZoneType===aN.fireZoneType &&
  cN.cooldownMsCd===aN.cooldownMsCd && cN.cooldownMsCd>0 &&
  cN.mpDelta===aN.mpDelta &&
  JSON.stringify(cN.sfxCalls)===JSON.stringify(aN.sfxCalls) &&
  cN.rngCount===aN.rngCount
) ? 'PASS(정상 release 발사·연출·쿨다운·RNG current==candidate, MP 미차감 동일)' : 'FAIL';
verdicts.CURRENT_BLUR_GHOSTFIRE = (
  cB.chargedBefore && cB.fired && cB.cooldownMsCd>0 && cB.sfxCalls.length>0 && cB.rngCount>0
) ? 'FAIL(결함: 현행 maliceStorm blur 유령발사 + fireZone 설치·쿨다운1200·음향·RNG; 플레인은 MP 미차감)' : 'UNKNOWN';
verdicts.CANDIDATE_BLUR_NOFIRE = (
  aB.chargedBefore && !aB.fired && aB.fireZones===0 && aB.cooldownMsCd===0 &&
  aB.sfxCalls.length===0 && aB.rngCount===0 && aB.aimingAfter===false && aB.chargingAfter===false
) ? 'PASS(후보: 무발사·fireZone0·쿨다운0·음향/RNG 추가0·조준해제)' : 'FAIL';

console.log(JSON.stringify({ node:process.version, srcHashes:SRC, matrix, verdicts }, null, 2));
