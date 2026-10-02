// SKILL-whirlwind-stormbeam-residual-cap1300 — whirlwind(회전참) 채널 입력취소 lifecycle
//   stormBeam 합체 종료 시 _eStormSrc 루프 소스 미정지 잔류 결함 + 실제 ST 드레인 대조.
//
// 회복 과제: whirlwind hold진입→whirlTick→blur/해제→효과수명/실제 ST 소비를 현재 source caller로
//   연결, 잔류효과·비의도 자원소모 최초 결함 1 + 정상 hold/release 대조. kiSlash 옛4/원장 반복0,
//   수치/환급/보호2_3 정책 임의0.
//
// 방법: provenance = game.html/game-easy-test.html에서 실제 조각(틱 31944-31945 / 종료 32045-32048 /
//   드레인 31908-31909)을 디스크에서 추출·SHA-256 해시·양판 parity 확인. 그 실제 제어 논리를
//   isolation 모델로 실행(채널 전체 200줄은 미실행 — 핫패스 deps 과다). playSample은 정지 가능
//   소스 대역(오디오 native는 별도 Gate; 여기선 _eStormSrc "소스-상태 수명"만 검증).
// productionApplied=false. source/fixture PASS ≠ native/시각/청취 PASS.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs

import fs from 'node:fs'; import crypto from 'node:crypto';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const main=fs.readFileSync(ROOT+'/game.html','utf8'), easy=fs.readFileSync(ROOT+'/game-easy-test.html','utf8');

// provenance: 실제 조각 추출(라인 내용 기반, 지정 줄수)
function grab(src,needle,span){const k=src.indexOf(needle);if(k<0)throw new Error('missing '+needle);const start=src.lastIndexOf('\n',k)+1;let end=k;for(let i=0;i<span;i++)end=src.indexOf('\n',end+1);return src.slice(start,end);}
const tickFrag_m=grab(main,"P._eStormT=(P._eStormT||0)+sp;P._eStormActive=true;",2);
const exitFrag_m=grab(main,"if(!isAct('weapon')||P.st<=0||(_wwFused&&P.hp<=P.mhp*.05)){",4);
const drainFrag_m=grab(main,"const _wwDrainTick=_wwCostSec/60*sp;",1);
const tickFrag_e=grab(easy,"P._eStormT=(P._eStormT||0)+sp;P._eStormActive=true;",2);
const exitFrag_e=grab(easy,"if(!isAct('weapon')||P.st<=0||(_wwFused&&P.hp<=P.mhp*.05)){",4);
const parity={tick:tickFrag_m===tickFrag_e, exit:exitFrag_m===exitFrag_e};

// 실제 상수(Lv1): _wwCostSec=~~(30+(1-1)*5)=30, drain=30/60*sp=0.5/frame
function run(variant,scenario){
  let sources=[];
  const playSample=(n)=>{const s={n,stopped:false,stop(){this.stopped=true;}};sources.push(s);return s;}; // 대역: 정지 가능 소스
  let P={st:100,_eStormActive:false,_eStormSrc:null,_eStormT:0,_eStormIdx:0,s:'whirlwind'};
  const sp=1,_wwLv=1; const _wwCostSec=~~(30+(_wwLv-1)*5); // =30 (실제식)
  let weaponHeld=true; const isAct=(a)=>a==='weapon'?weaponHeld:false; const tail=[];
  const stStart=P.st;
  function channelTick(){
    const _wwDrainTick=_wwCostSec/60*sp; P.st-=_wwDrainTick;            // 실제 31909
    P._eStormT=(P._eStormT||0)+sp; P._eStormActive=true;                 // 실제 31944
    if(P._eStormT>=120){P._eStormT=0;P._eStormIdx=((P._eStormIdx||0)+1)%2;if(P._eStormSrc)try{P._eStormSrc.stop()}catch(e){}P._eStormSrc=playSample('electric_storm_hiss'+P._eStormIdx);} // 실제 31945
  }
  P._eStormT=120; channelTick();      // 최초 틱에 소스 생성
  for(let i=0;i<3;i++)channelTick();   // 추가 홀드 틱
  // 입력취소: normalRelease=플레이어 해제, blur=_clearHeldInput가 MB/KH 비움→isAct('weapon') false
  weaponHeld=false;
  const _wwDrainTick=_wwCostSec/60*sp; P.st-=_wwDrainTick;             // 종료 프레임 1틱 drain(실제: drain 먼저)
  let exited=false;
  if(!isAct('weapon')||P.st<=0){                                       // 실제 32045
    if(P._eStormActive){P._eStormActive=false; tail.push('electric_storm_tail');} // 실제 32047
    if(variant==='candidate'){ if(P._eStormSrc){try{P._eStormSrc.stop()}catch(e){}P._eStormSrc=null;} } // [후보] 루프 소스 정지
    P.s='wRecover'; exited=true;                                       // 실제 32048
  }
  const residualUnstopped=sources.filter(s=>!s.stopped).length;
  return {variant,scenario,exited,stStart,stFinal:+P.st.toFixed(3),stDrainedTotal:+(stStart-P.st).toFixed(3),
    drainPerFrame:_wwCostSec/60,eStormActiveAfter:P._eStormActive,
    eStormSrcAfter:P._eStormSrc?('live:'+P._eStormSrc.n):null,
    residualUnstoppedSources:residualUnstopped,tailPlayed:tail.length,finalState:P.s};
}
const m=[run('current','normalRelease'),run('candidate','normalRelease'),run('current','blur'),run('candidate','blur')];
const g=(v,s)=>m.find(o=>o.variant===v&&o.scenario===s);
const cN=g('current','normalRelease'),aN=g('candidate','normalRelease'),cB=g('current','blur'),aB=g('candidate','blur');
const verdicts={
  ST_DRAIN_REAL:(cN.drainPerFrame===0.5&&cN.stDrainedTotal>0&&cB.stDrainedTotal===cN.stDrainedTotal)?'PASS(실제 drain 0.5/f Lv1, release==blur 동일, 환급0)':'FAIL',
  CURRENT_RESIDUAL_DEFECT:(cN.eStormActiveAfter===false&&cN.eStormSrcAfter&&cN.residualUnstoppedSources>=1)?'FAIL(종료 후 _eStormSrc 루프 소스 미정지 잔류)':'UNKNOWN',
  CANDIDATE_FIX:(aN.eStormSrcAfter===null&&aN.residualUnstoppedSources===0&&aB.eStormSrcAfter===null&&aB.residualUnstoppedSources===0)?'PASS(종료 시 _eStormSrc.stop()+null, 잔류0; release/blur)':'FAIL',
  NORMAL_EQUIV:(cN.finalState===aN.finalState&&cN.stDrainedTotal===aN.stDrainedTotal&&cN.tailPlayed===aN.tailPlayed)?'PASS(정상 release 상태/ST/tail 불변)':'FAIL'
};
console.log(JSON.stringify({parityBothBuilds:parity,
  fragSha:{tick:sha(tickFrag_m),exit:sha(exitFrag_m),drain:sha(drainFrag_m)},
  exitSource:exitFrag_m.trim(), matrix:m, verdicts},null,2));
