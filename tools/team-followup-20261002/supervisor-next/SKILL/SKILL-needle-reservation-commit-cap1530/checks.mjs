// SKILL-needle-reservation-commit-cap1530
//   결함: needleShot 자동발사(_autoFireBowSkill 27521)는 fired=pProjs.length>_pBefore 로 판정하나
//   activateNeedleShot은 즉시 투사체 대신 P._needleBurst 예약만 설정(지연 commit)·pProjs 증분 0 →
//   fired=false 로 오판 → 석궁 fallback이 불필요 볼트를 추가발사(예약 burst와 중복 출력).
//   bladeShot/blastShot(fan)과 별개: 이 건은 "지연 예약 commit을 발사 성공으로 인정"하는 경계.
//
// 과제 CO-SKILL-1540: 정상예약 / ST부족 early-return / 기존burst 경계를 실제 activateNeedleShot+caller로
//   대조, 지연 commit을 false로 봐 fallback 추가하는 경로를 자연 caller 조건으로 좁힘.
// 후보: fired = (pProjs.length>_pBefore) || (신규 _needleBurst 예약). 비용/수치/2_3/Q/방패/패링 변경 0
//   (_xbStCost 불변 — 불필요 fallback 볼트만 제거). productionApplied=false. fixture≠playable.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 실제 소스 출처(현행 game.html):
//   _autoFireBowSkill needleShot 분기 : 27521  else if(...needleShot&&(P._ndCd||0)<=0){activateNeedleShot();fired=pProjs.length>_pBefore}
//   _skOnCd(cd 게이트)                : 27532-27533  needleShot&&_ndCd>0 → restore/return (fallback·ST 없음)
//   fallback / ST 차감                : 27528 if(!fired){_fireXbow} / 27538-27539 _xbStCost
//   activateNeedleShot (예약 commit)  : 43883-43894  P.st-=8; _ndCd=90; P._needleBurst={cnt:0,max,...}  (즉시 투사체 0)
//   activateNeedleShot SHA16          : 40a46c44

import fs from 'node:fs'; import crypto from 'node:crypto';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const main=fs.readFileSync(ROOT+'/game.html','utf8'),easy=fs.readFileSync(ROOT+'/game-easy-test.html','utf8');
let startAt;
function sliceBrace(src,i){let d=0;for(;i<src.length;i++){const c=src[i];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(startAt,i+1);}}throw new Error('nb');}
function exFn(src,sig){const k=src.indexOf(sig);const br=src.indexOf('{',k+sig.length-1);startAt=br;return src.slice(k,br)+sliceBrace(src,br);}
const ndM=exFn(main,'function activateNeedleShot('), ndE=exFn(easy,'function activateNeedleShot(');
const parity={activateNeedleShot:ndM===ndE};

// 실제 activateNeedleShot 동적 주입 + 27521 caller + 27528 fallback + 27539 ST + 27533 on-cd
function run(variant, scenario){
  const body=`
    const _addSkProf=()=>{}, playSample=()=>{}, addTxt=()=>{}, shake=()=>{}, _r=(v)=>v, _T=s=>s;
    const bowRef=()=>1,statDex=()=>1,pBowMul=()=>1,_skMul=()=>1;
    let P={skills:{needleShot:env.ndLv,fanShot:0}, st:env.st, facing:0, x:0,y:0, _ndCd:env.cd, _needleBurst:null};
    ${ndM}
    let pProjs=0; const _getPProj=()=>({_hitSet:{clear(){}}});  // activateNeedleShot은 예약만 → 즉시 증분 0
    let xbow=0; function _fireXbow(){xbow++;}
    const _stDisc=1; const _xbStCost=(1.5+(P.skills.fanShot||0)*1.5)*_stDisc;
    const _sSt=P.st; let fired=false;
    const _pBefore=pProjs, _nbBefore=P._needleBurst;
    if(P.skills.needleShot && (P._ndCd||0)<=0){
      activateNeedleShot();
      if(env.variant==='current') fired=(pProjs>_pBefore);
      else fired=(pProjs>_pBefore) || (!!P._needleBurst && P._needleBurst!==_nbBefore); // [후보] 신규 예약 commit 인정
    } else if((P._ndCd||0)>0){ // 27533 _skOnCd: restore/return (fallback·ST 없음)
      return {scenario:'${scenario}',variant:env.variant,onCd:true,reserved:false,fired:false,fallback:0,extraBolt:false,stCharged:0};
    }
    if(!fired){ _fireXbow(); }
    P.st=Math.max(0,_sSt-_xbStCost);
    return {scenario:'${scenario}',variant:env.variant,onCd:false,
      reserved:(!!P._needleBurst && P._needleBurst!==_nbBefore), immediateProj:pProjs-_pBefore,
      fired, fallback:xbow, extraBolt:(xbow>0 && (!!P._needleBurst && P._needleBurst!==_nbBefore)),
      stCharged:+(env.st-P.st).toFixed(2)};
  `;
  return new Function('env',body)({variant, ...scenario});
}
const S={
  normalReserve:{ndLv:10,st:50,cd:0},  // ST 충분·cd0 → 예약 성공(즉시 투사체 0)
  stLow:{ndLv:10,st:3,cd:0},            // st3<_nStC8 → early-return(미예약)
  onCd:{ndLv:10,st:50,cd:60},           // cd>0 → _skOnCd restore/return
};
const out={};
for(const k of Object.keys(S)){ out['cur_'+k]=run('current',{...S[k]}); out['cand_'+k]=run('candidate',{...S[k]}); out['cur_'+k].scenario=k; out['cand_'+k].scenario=k; }
const verdicts={
  CURRENT_RESERVE_MISFIRE:(out.cur_normalReserve.reserved&&!out.cur_normalReserve.fired&&out.cur_normalReserve.extraBolt)
    ?'FAIL(정상 예약 commit인데 fired=false→불필요 석궁 fallback 추가발사·예약 burst와 중복)':'UNKNOWN',
  CANDIDATE_RECOGNIZES_RESERVE:(out.cand_normalReserve.reserved&&out.cand_normalReserve.fired&&out.cand_normalReserve.fallback===0&&out.cand_normalReserve.stCharged===out.cur_normalReserve.stCharged)
    ?'PASS(후보: 신규 예약 commit 인정→fired=true→불필요 fallback 제거·_xbStCost 불변)':'FAIL',
  STLOW_FALLBACK_OK:(!out.cur_stLow.reserved&&out.cur_stLow.fallback===1&&out.cand_stLow.fallback===1)
    ?'PASS(ST 부족=미예약→양변형 fallback 석궁 정상, 후보 과발사 없음)':'FAIL',
  ONCD_GATED:(out.cur_onCd.onCd&&out.cand_onCd.onCd)
    ?'PASS(cd>0=_skOnCd restore/return→무발사·무fallback 양변형 동일)':'FAIL'
};
console.log(JSON.stringify({
  defect:'needleShot 자동발사 지연 예약(_needleBurst) commit을 fired=pProjs증분으로 오판→불필요 석궁 fallback 추가발사',
  candidate:"27521 needleShot: 'fired=pProjs.length>_pBefore' → 'const _nb=P._needleBurst;activateNeedleShot();fired=(pProjs.length>_pBefore)||(!!P._needleBurst&&P._needleBurst!==_nb)' (예약 commit 인정). 비용/수치/쿨/2_3 불변.",
  parityBothBuilds:parity, fragSha:{activateNeedleShot:sha(ndM)}, cases:out, verdicts},null,2));
