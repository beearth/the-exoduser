// SKILL (continuous) — blur 취소 후보 A의 실제 발사·차감 대조 (현행 vs 후보 A)
// 인수: claude-native-6/SKILL — C0 PASS, MM-B1/B1b 재현(FAIL). 그 세 검사는 반복하지 않는다.
// 빈칸: 이전 하니스는 fireMaliceMortar 호출 probe만 실행 → 후보 A의 "실제 MP/쿨다운/bomb/음향
//        차감 보존"을 미검증. 이번 과제는 실제 fireMaliceMortar·useMp·mpCost 체인을 verbatim
//        실행해 현행(ghost-fire 차감 발생) vs 후보 A(무발사·무차감)를 대조하고, 정상 keyup
//        동등성을 확인한다. productionApplied=false. MP식/쿨다운/합체/RNG/입력배열/beam·dash·
//        cutscene·거리·키는 바꾸지 않는다.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 실제 소스 출처(현행 game.html, SHA는 result/evidence 참조. 이전 행힌트 아닌 현행 grep 행):
//   _COST_BASE/_COST_SK/_COST_DPS : game.html 30718-30738
//   _skLv/_dpsCostMul             : 30739-30740
//   mpCost/useMp (+_lastCost)     : 30717,30750-30754
//   pMagicCost                    : 26828
//   _isFused                      : 43007
//   _r                            : 12004
//   EL                            : 13838
//   fireMaliceMortar              : 43770-43786
//   _clearHeldInput               : 12877-12885  (blur 등록 12886)
//   mortar aim/charge/release 블록: 35217-35228
//   P 초기 선언(null)             : 15899  `let P=null,...`
// game.html == game-easy-test.html 동일성은 result.md 표 참조(양판 동일 행 확인).

import crypto from 'node:crypto';
function sha(s){ return crypto.createHash('sha256').update(s).digest('hex'); }

// ── 시드 PRNG (대역) : 두 변형을 동일 seed로 돌려 호출/RNG 순서·개수를 결정적으로 대조 ──
// 비용을 가짜 대입하지 않는다. 실제 source가 Math.random 스트림을 실제 순서로 소비하며, seed만
// 고정해 current/candidate 관찰을 byte 단위 비교 가능하게 만든다.
function mulberry32(a){ return function(){ a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296; }; }

// 실제 소스 fragment 문자열(자기검증 해시용). 아래 함수 본문과 1:1 동일해야 한다.
const SRC = {};

// 한 번의 (variant, scenario) 실행을 완전히 독립 월드에서 수행
function run(variant, scenario){
  // ── 최소 전역 그릇(실제 전역 모양 축소) ──────────────────────────
  let K=Object.create(null), KH=Object.create(null);
  let MB=[false,false,false], MBjust=[false,false,false];
  let _dashHold=false,_dashHoldF=0,_dashTier=0,_cutSkipHolding=false,_cutSkipHold=0;
  const sp=1;
  let _lastCost=0;                                   // SRC: game.html 30717 (verbatim)
  // ── 대역(baseline 입력·side-effect 레코더) : 실제 cost 공식에 "가짜 비용" 대입 아님 ──
  const PASSIVES={pMagic:0};                         // 무패시브 baseline
  const _eqAffix=()=>0;                              // 무장비 baseline
  const _uEq=()=>0;                                  // 무유니크 baseline
  const sfxLog=[];
  const SFX={magic:(e)=>sfxLog.push('SFX.magic('+e+')')};
  const playSample=(n)=>sfxLog.push('playSample('+n+')');
  const shake=(n)=>sfxLog.push('shake('+n+')');
  const showPH=()=>{}; const _T=s=>s;
  const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};            // SRC: 13838 (verbatim)
  const G={};                                         // 실제 전역 그릇
  // ── 플레이어 baseline : Lv1·MP100·무합체 → mpCost('mortar')=~~(50*1*1)=50 (실제 공식 실행) ──
  let P={ x:0,y:0,facing:0, mp:100, skills:{maliceMortar:1}, _fused:null,
          _mmAiming:false,_mmAimKey:null,_mmDist:150,_mmCharging:false,
          _beamHold:false,_mmCd:0 };

  // ── 실제 소스 비용 체인 (verbatim) ───────────────────────────────
  const _COST_BASE={
    weapon:10,finisher:50,shield:10,giantSlam:50,
    charge:50,bladeDash:50,
    bow:35,bladeShot:35,blastShot:35,shieldThrow:35,fanShot:35,
    magic:10,blink:50,iceOrb:50,dimBreach:50,exBolt:50,mortar:50,
    whirlTick:.4,sBlockTick:.4,qsTick:.5
  };
  const _COST_SK={
    bladeShot:'bladeShot',mortar:'maliceMortar',
    blastShot:'blastShot',shieldThrow:'shieldThrow',fanShot:'fanShot',
    blink:'magicBlink',iceOrb:'iceOrb',dimBreach:'magicBlink',
    charge:'chargeBoost',bladeDash:'bladeDash',giantSlam:'giantSlam',
    whirlTick:'whirlwind',sBlockTick:'maliceSwipe',exBolt:'maliceSwipe'
  };
  const _COST_DPS={
    giantSlam:.45,charge:.45,bladeDash:.30,finisher:.45,
    bow:.15,fanShot:.15,bladeShot:.30,blastShot:.30,shieldThrow:.25,
    magic:.35,blink:.30,iceOrb:.35,dimBreach:.30,exBolt:.30,mortar:.35,
    whirlTick:.05,sBlockTick:.05,qsTick:.05
  };
  function _skLv(key){const id=_COST_SK[key];return id?(P.skills[id]||1):1}
  function _dpsCostMul(key){const lv=_skLv(key);const s=_COST_DPS[key]||.10;return 1+(lv-1)*s}
  function pMagicCost(){return Math.max(.40,1-PASSIVES.pMagic*.04-_eqAffix('mpCostRed')-(_uEq('_uHelmMagic')||0))}
  function mpCost(key){
    const base=_COST_BASE[key]||7;
    return~~(base*_dpsCostMul(key)*pMagicCost());
  }
  function useMp(key){const c=mpCost(key),b=P.mp;P.mp=Math.max(0,P.mp-c);_lastCost=b-P.mp;return _lastCost}
  function _isFused(key){return!!(P._fused&&P._fused[key])}
  function _r(v,s){return v*(1+(Math.random()-.5)*2*(s||.05))}

  // ── 실제 fireMaliceMortar (verbatim, 43770-43786) ────────────────
  function fireMaliceMortar(_tx,_ty){
    P._mmAiming=false;
    useMp('mortar');
    const tx=_tx!=null?_tx:P.x+Math.cos(P.facing)*(P._mmDist||150);
    const ty=_ty!=null?_ty:P.y+Math.sin(P.facing)*(P._mmDist||150);
    const _mmSlv=P.skills.maliceMortar||1;
    const _mmR=400+(_mmSlv-1)*18; // 1렙400(×2), 20렙742(+20%)
    const _iceFuse=P.skills.iceOrb>=1&&_isFused('iceMortar');
    if(_iceFuse){P._mmCd=660;P._ioCd=600;}else{P._mmCd=660;}
    G._mmBomb={sx:P.x,sy:P.y,tx:tx,ty:ty,x:P.x,y:P.y,t:0,maxT:40,r:_mmR,phase:'throw',
      vortex:true,iceFuse:!!_iceFuse,slv:_mmSlv};
    if(_iceFuse){
      SFX.magic(EL.I);  }else{
      SFX.magic(EL.D);  }
    if(Math.random()<.3)playSample('voice_magic',1,1);else{const _ve=['voice_grunt','male_grunt'];playSample(_ve[~~(Math.random()*2)],1,_r(1,.15))};
    shake(5);
  }

  // ── _clearHeldInput : current(verbatim) 또는 candidate A(기존 P guard 안 2플래그 추가) ──
  function _clearHeldInput_current(){
    for(const k in K)K[k]=false;
    for(const k in KH)KH[k]=false;
    for(const b in MB)MB[b]=false;
    for(const b in MBjust)MBjust[b]=false;
    _dashHold=false;_dashHoldF=0;_dashTier=0; // 쉬프트 홀드 무장 해제 (팬텀 릴리즈/재발사 차단)
    if(typeof P!=='undefined'&&P)P._beamHold=false;
    _cutSkipHolding=false;_cutSkipHold=0;
  }
  function _clearHeldInput_candidateA(){
    for(const k in K)K[k]=false;
    for(const k in KH)KH[k]=false;
    for(const b in MB)MB[b]=false;
    for(const b in MBjust)MBjust[b]=false;
    _dashHold=false;_dashHoldF=0;_dashTier=0; // 쉬프트 홀드 무장 해제 (팬텀 릴리즈/재발사 차단)
    if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false} // [후보A] 기존 guard 안 2플래그만 취소
    _cutSkipHolding=false;_cutSkipHold=0;
  }
  const _clearHeldInput = variant==='candidateA' ? _clearHeldInput_candidateA : _clearHeldInput_current;

  // ── aim/charge/release 한 update 프레임 (verbatim, 35217-35228) ──
  function mortarAimFrame(){
    if(P._mmAiming){
      const _mmK=P._mmAimKey;
      if(_mmK&&KH[_mmK]){P._mmCharging=true;P._mmDist=Math.min((P._mmDist||150)+24*sp,1000)}
      const _mmRel=P._mmCharging&&_mmK&&!KH[_mmK];
      if(MBjust[2]||K['Escape']){P._mmAiming=false;P._mmCharging=false;MBjust[2]=false;K['Escape']=false}
      else if(MBjust[0]||_mmRel){
        MBjust[0]=false;
        const _mmwx=P.x+Math.cos(P.facing)*(P._mmDist||150);
        const _mmwy=P.y+Math.sin(P.facing)*(P._mmDist||150);
        fireMaliceMortar(_mmwx,_mmwy);
        P._mmCharging=false;
      }
    }
  }
  function enterAim(keyCode){ P._mmAiming=true; P._mmAimKey=keyCode; P._mmDist=150; P._mmCharging=false; KH[keyCode]=true; }

  // fragment 해시(변형 방지) — 1회만 채움
  if(!SRC.fire){ SRC.fire=sha(fireMaliceMortar.toString()); SRC.aim=sha(mortarAimFrame.toString());
    SRC.clearCur=sha(_clearHeldInput_current.toString()); SRC.useMp=sha(useMp.toString()+mpCost.toString()); }

  // ── RNG 대역 설치(결정적 비교), 실행 후 복원 ──
  const realRandom=Math.random; let rngCount=0;
  const seeded=mulberry32(0x5EED);
  Math.random=()=>{ rngCount++; return seeded(); };
  const mpBefore=P.mp;
  try{
    enterAim('KeyR');       // 조준 진입 + 키 홀드
    mortarAimFrame();       // 1프레임 홀드 → _mmCharging=true
    const chargedBefore=P._mmCharging===true;
    if(scenario==='normalKeyup'){
      KH['KeyR']=false;     // 사용자 정상 keyup
    } else if(scenario==='blur'){
      _clearHeldInput();    // 등록 핸들러 addEventListener('blur',_clearHeldInput) 그대로
    }
    mortarAimFrame();       // release/복귀 프레임
    const obs={
      variant, scenario, chargedBefore,
      mpBefore, mpAfter:P.mp, mpDelta:mpBefore-P.mp, lastCost:_lastCost,
      fired: !!G._mmBomb, bombCreated: !!G._mmBomb,
      cooldownSet: P._mmCd||0,
      bombR: G._mmBomb?G._mmBomb.r:null,
      sfxCalls: sfxLog.slice(),
      rngCount,
      aimingAfter:P._mmAiming, chargingAfter:P._mmCharging
    };
    return obs;
  } finally { Math.random=realRandom; }
}

// ── 대조 수행 ───────────────────────────────────────────────────────
const matrix = [
  run('current','normalKeyup'),
  run('candidateA','normalKeyup'),
  run('current','blur'),
  run('candidateA','blur'),
];

function find(v,s){ return matrix.find(o=>o.variant===v&&o.scenario===s); }
const cN=find('current','normalKeyup'), aN=find('candidateA','normalKeyup');
const cB=find('current','blur'), aB=find('candidateA','blur');

// 판정
const verdicts = {};
// V1 정상 keyup 동등성: current==candidate 모든 핵심 관찰 동일 + 실제 발사·차감 발생
verdicts.NORMAL_EQUIV = (
  cN.fired && aN.fired &&
  cN.mpDelta===aN.mpDelta && cN.mpDelta>0 &&
  cN.cooldownSet===aN.cooldownSet && cN.cooldownSet>0 &&
  cN.bombR===aN.bombR &&
  JSON.stringify(cN.sfxCalls)===JSON.stringify(aN.sfxCalls) &&
  cN.rngCount===aN.rngCount
) ? 'PASS(정상 발사·차감·쿨다운·합체분기·호출/RNG 동일)' : 'FAIL';
// V2 현행 blur ghost-fire 실제 차감 발생
verdicts.CURRENT_BLUR_GHOSTFIRE = (
  cB.chargedBefore && cB.fired && cB.mpDelta>0 && cB.cooldownSet>0 && cB.sfxCalls.length>0 && cB.rngCount>0
) ? 'FAIL(결함: 현행 blur 유령발사 + 실제 MP차감·쿨다운·bomb·음향·RNG)' : 'UNKNOWN';
// V3 후보 A blur 무발사·무차감·무RNG
verdicts.CANDIDATEA_BLUR_NOFIRE = (
  aB.chargedBefore && !aB.fired && aB.mpDelta===0 && aB.cooldownSet===0 &&
  aB.sfxCalls.length===0 && aB.rngCount===0 && aB.aimingAfter===false && aB.chargingAfter===false
) ? 'PASS(후보A: 무발사·MP무차감·bomb/쿨다운/음향/RNG 추가0·조준해제)' : 'FAIL';

console.log(JSON.stringify({
  node:process.version,
  srcHashes:SRC,
  matrix,
  verdicts
}, null, 2));
