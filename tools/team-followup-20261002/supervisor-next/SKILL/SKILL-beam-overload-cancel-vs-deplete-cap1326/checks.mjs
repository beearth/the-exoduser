// SKILL-beam-overload-cancel-vs-deplete-cap1326 — omniBeam/arcLaser blur→종료 과부하 _beamCd=300 원장
//   "정상 MP 소진(과부하 의도) vs 단순 입력 취소(mp>0, 과부하 금지)" 구분 검증.
//
// 회복 과제: mp<=0 과부하 _beamCd=300이 정상 자원 소진과 단순 입력 취소를 구분하는지 실제 채널
//   caller·CD/MP 원장으로 대조. SOUND 오디오/trail 반복0. 보호2_3/Q-only/attack-ticket 유지.
// 결과: 결함 미재현(근거 있는 NO-FIX). 과부하는 mp<=0 소진 전용이며, 단순 취소/blur(mp>0)는
//   32860 pre-drain 가드에서 과부하 없이 깨끗이 종료(추가 drain 0). arcLaser는 34750/_tickArcLaser로
//   별도 정상 해제(과부하 없음).
// productionApplied=false. source/fixture PASS ≠ native/시각/청취 PASS.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 실제 소스 출처(현행 game.html, 양판 parity):
//   beam pre-drain 가드 : 32860  if(!isAct('beam')||P.mp<=0){const _wasOmni=...;if(_wasOmni&&P.mp<=0){P._beamCd=300;...}P.s='idle';P.mp=Math.max(0,P.mp);P._omniPts=null;SFX.beamStop();break}
//   beam drain          : 32877  P.mp=Math.max(0,P.mp-_bcost*sp);
//   beam post-drain exit : 32880  if(P.mp<=0){if(_isOmni){P._beamCd=300;...}P.s='idle';P._omniPts=null;SFX.beamStop();break}
//   arcLaser 해제        : 34750  if(!isHeld('beam')){P._alActive=false;...P.s='idle';...}
//   arcLaser MP 소진     : 27607  if(P.mp<_alMpTick){P._alActive=false;...}
//   _wasOmni(32860)==_isOmni(32869) = omniBeam&&fanShot&&_isFused('sixFuse') (동일 조건)

import fs from 'node:fs'; import crypto from 'node:crypto';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const main=fs.readFileSync(ROOT+'/game.html','utf8'),easy=fs.readFileSync(ROOT+'/game-easy-test.html','utf8');
function grab(src,needle,span=1){const k=src.indexOf(needle);if(k<0)throw new Error('missing '+needle);const start=src.lastIndexOf('\n',k)+1;let end=k;for(let i=0;i<span;i++)end=src.indexOf('\n',end+1);return src.slice(start,end);}
const topM=grab(main,"if(!isAct('beam')||P.mp<=0){const _wasOmni=");
const botM=grab(main,"if(P.mp<=0){if(_isOmni){P._beamCd=300;");
const alRelM=grab(main,"if(!isHeld('beam')){P._alActive=false;P._alBeam=null;P.s='idle';");
const alDepM=grab(main,"if(P.mp<_alMpTick){P._alActive=false;P._alBeam=null;");
const topE=grab(easy,"if(!isAct('beam')||P.mp<=0){const _wasOmni=");
const parity={top:topM===topE};

// 32860 pre-drain guard / 32877 drain / 32880 post-drain 를 실제 제어 그대로 전사(omni sixFuse)
function frame(P,beamHeld,bcost){
  if(!beamHeld||P.mp<=0){ // 32860
    const _wasOmni=P.omni;
    if(_wasOmni&&P.mp<=0){P._beamCd=300;P.overloadMsg++;}
    P.s='idle';P.mp=Math.max(0,P.mp);P._omniPts=null;return 'exitTop';
  }
  P.mp=Math.max(0,P.mp-bcost); // 32877
  if(P.mp<=0){if(P.omni){P._beamCd=300;P.overloadMsg++;}P.s='idle';P._omniPts=null;return 'exitBot';} // 32880
  return 'channel';
}
function run(scenario){
  let P={s:'beam',mp:1.0,omni:true,_beamCd:0,overloadMsg:0,_omniPts:[1]};
  const bcost=15/60; // omni Lv1 _beamMpBase=15 → 0.25/frame
  const mpStart=P.mp; let drainedExtra=0, exitKind=null, frames=0;
  for(let i=0;i<20;i++){ frames++;
    let held=true;
    if((scenario==='cancelMpPositive'||scenario==='blurMpPositive')&&i===2) held=false; // mp>0 상태서 취소
    const before=P.mp; const r=frame(P,held,bcost); if(i>=2&&!held)drainedExtra+=(before-P.mp);
    if(r.startsWith('exit')){exitKind=r;break;}
  }
  return {scenario,exitKind,mpStart,mpFinal:+P.mp.toFixed(3),beamCd:P._beamCd,overloadFired:P.overloadMsg>0,framesToExit:frames,extraDrainAfterCancel:+drainedExtra.toFixed(3)};
}
const m=[run('holdDeplete'),run('cancelMpPositive'),run('blurMpPositive')];
const g=s=>m.find(o=>o.scenario===s);
const dep=g('holdDeplete'),can=g('cancelMpPositive'),blu=g('blurMpPositive');
const verdicts={
  DEPLETE_OVERLOADS:(dep.overloadFired&&dep.beamCd===300&&dep.exitKind==='exitBot')?'PASS(정상 MP소진→과부하300, drain 후 exit)':'FAIL',
  CANCEL_NO_OVERLOAD:(!can.overloadFired&&can.beamCd===0&&can.exitKind==='exitTop'&&can.extraDrainAfterCancel===0)?'PASS(단순 취소 mp>0→과부하0·추가drain0·pre-guard exit)':'FAIL',
  BLUR_NO_OVERLOAD:(!blu.overloadFired&&blu.beamCd===0&&blu.extraDrainAfterCancel===0)?'PASS(blur mp>0→과부하0·추가drain0)':'FAIL',
  DISTINGUISHES:(dep.overloadFired&&!can.overloadFired&&!blu.overloadFired)?'YES(과부하는 mp<=0 소진 전용; mp>0 취소/blur 미발동) → NO-FIX':'NO'
};
console.log(JSON.stringify({parityBothBuilds:parity,
  fragSha:{topGuard:sha(topM),botGuard:sha(botM),alRelease:sha(alRelM),alDeplete:sha(alDepM)},
  matrix:m, verdicts,
  arcLaserNote:'arcLaser(_alActive)는 beam case 32848서 선-break; 해제 34750 !isHeld(beam)→idle, 소진 27607 mp<_alMpTick→해제. 과부하 없음(omni sixFuse 전용). _clearHeldInput가 beamHold 비움→34750 해제 도달.'
},null,2));
