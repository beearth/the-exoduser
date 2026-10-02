// SKILL-autofire-fanshot-cost-without-fire-cap1445
//   결함: T 자동발사(_autoFireBowSkill)에서 fanShot/blastShot은 fired=true를 무조건 설정 →
//   스킬 내부 가드 실패(ST 부족 등) 시 발사 0인데 fired=true로 fallback 석궁을 억제하고
//   27539가 _xbStCost를 차감 → "ST 소비·발사 0"(cost-without-effect). bladeShot/needleShot은
//   fired=pProjs.length>_pBefore(실제 생성 검증)로 올바름 → 비일관성.
//
// 과제: bladeShot/blastShot/fanShot ST/MP 비용→발사/취소 원장 whole caller 연결, 정상/취소 대조.
//   현재 실제 입력(T 자동발사)에서 도달하는 경계. basicLMB/329/charge 반복0. 보호2_3/Q/E/어택티켓 무관.
//   값·공식·수치 변경 0(후보는 fired 검출 일관화 — 기존 fallback을 올바로 발동시킬 뿐).
// productionApplied=false. source 대역 ≠ native6/화면/청취 PASS.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 실제 소스 출처(현행 game.html):
//   _autoFireBowSkill fired 검출 : 27516-27521
//     27518 bladeShot: fired=pProjs.length>_pBefore   (올바름)
//     27519 blastShot: {activateBlastShot();fired=true}  (무조건 — 결함)
//     27520 fanShot  : {_fireFanShot();fired=true}        (무조건 — 결함)
//     27521 needleShot: fired=pProjs.length>_pBefore  (올바름)
//   자동 ST 차감 : 27538-27539  _xbStCost=(1.5+fanShot*1.5)*_stDisc('bow'); P.st=max(0,_sSt-_xbStCost)
//   fallback 억제: 27528 if(!fired){ ... _fireXbow ... }   (fired=true면 미발동)
//   _fireFanShot ST 가드 : 43501  if(P.st<_fsStC){showPH('ST 부족!');return false}
//   참고 SHA16: firedblock 0eceaa44, STcharge abbd51cf, fanShotHead 8b69b057

import fs from 'node:fs'; import crypto from 'node:crypto';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const main=fs.readFileSync(ROOT+'/game.html','utf8'),easy=fs.readFileSync(ROOT+'/game-easy-test.html','utf8');
function grab(src,needle,span=1){const k=src.indexOf(needle);if(k<0)throw new Error('missing '+needle);const start=src.lastIndexOf('\n',k)+1;let end=k;for(let i=0;i<span;i++)end=src.indexOf('\n',end+1);return src.slice(start,end);}
const firedBlkM=grab(main,"let fired=false;",6);
const stChargeM=grab(main,"const _xbStCost=(1.5+(P.skills.fanShot||0)*1.5)*_stDisc('bow');",2);
const fanGuardM=grab(main,"if(P.st<_fsStC){showPH(_T('ST 부족!'),'#ff4444');return false}",1);
const firedBlkE=grab(easy,"let fired=false;",6);
const parity={firedBlock:firedBlkM===firedBlkE};

// 실제 _autoFireBowSkill fanShot 경로 제어 전사(27513 백업 → 27520 호출/ fired → 27528 fallback → 27539 ST차감)
// _fireFanShot: ST 부족이면 return false·미발사(실제 43501). pProjs 생성 여부로 발사 판정.
function run(variant, st0, fanLv){
  let P={st:st0, skills:{fanShot:fanLv}};
  let pProjs=0;               // 생성된 투사체 수(발사 효과)
  let xbowFallback=0;         // _fireXbow 폴백 발동 수
  const _fsStC=2+fanLv;       // _fireFanShot 내부 ST 요구(실제 43500)
  const _stDisc=1;            // baseline
  const _xbStCost=(1.5+fanLv*1.5)*_stDisc; // 실제 27538
  const _sSt=P.st;            // 27513 백업
  function _fireFanShot(){ if(P.st<_fsStC){return false} /* 발사 */ for(let i=0;i<3;i++)pProjs++; return true; }
  function _fireXbow(){ xbowFallback++; }  // 기본 석궁 폴백(항상 1발)
  // 27520 fanShot 분기
  let fired;
  const _pBefore=pProjs;
  const ret=_fireFanShot();
  if(variant==='current'){ fired=true; }                 // 현재: 반환값 무시, 무조건 true
  else { fired=(pProjs>_pBefore); }                       // 후보: 실제 생성 검증(bladeShot/needleShot과 동일)
  // 27528 fallback
  if(!fired){ _fireXbow(); }
  // 27539 ST 차감(항상)
  P.st=Math.max(0,_sSt-_xbStCost);
  const shotsFired = pProjs + xbowFallback;
  return {variant, st0, fanLv, fsStC:_fsStC, xbStCost:_xbStCost, fanFired:(pProjs>0), fallback:xbowFallback>0,
    stCharged:+(st0-P.st).toFixed(2), shotsTotal:shotsFired, costWithoutEffect:(st0-P.st>0 && shotsFired===0)};
}
// ST 부족(st0=10 < fanLv10 _fsStC=12) : current vs candidate
const curLow=run('current',10,10), candLow=run('candidate',10,10);
// ST 충분(st0=50) : 정상 발사 — 양변형 동일해야(정상 control)
const curOk=run('current',50,10), candOk=run('candidate',50,10);

const verdicts={
  CURRENT_COST_WITHOUT_FIRE:(curLow.costWithoutEffect===true && curLow.shotsTotal===0 && curLow.stCharged>0)
    ?('FAIL(ST부족 자동 fanShot: ST '+curLow.stCharged+' 차감·발사 0·fallback 억제)'):'UNKNOWN',
  CANDIDATE_FIX:(candLow.fallback===true && candLow.shotsTotal>=1)
    ?('PASS(후보: fired=실제생성검증→미발사 시 fallback 석궁 1발 발동; ST 차감 '+candLow.stCharged+' 에 효과 발행)'):'FAIL',
  NORMAL_EQUIV:(curOk.fanFired&&candOk.fanFired&&curOk.shotsTotal===candOk.shotsTotal&&curOk.stCharged===candOk.stCharged)
    ?'PASS(ST 충분 시 정상 fanShot 발사·ST차감 current==candidate)':'FAIL'
};
console.log(JSON.stringify({
  defect:'autofire fanShot/blastShot fired=true 무조건 → 스킬 내부 실패 시 ST차감·발사0·fallback억제',
  parityBothBuilds:parity,
  fragSha:{firedBlock:sha(firedBlkM),stCharge:sha(stChargeM),fanGuard:sha(fanGuardM)},
  candidate:"27520 fanShot: '_fireFanShot();fired=true' → 'const _pb=pProjs.length;_fireFanShot();fired=pProjs.length>_pb' (bladeShot/needleShot과 동일 패턴). blastShot(27519)은 G._bsBombs 생성이므로 'const _bb=(G._bsBombs?G._bsBombs.length:0);activateBlastShot();fired=(G._bsBombs?G._bsBombs.length:0)>_bb' 변형 필요. 값/공식/_xbStCost 불변.",
  cases:{curLow,candLow,curOk,candOk}, verdicts},null,2));
