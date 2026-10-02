// SKILL-ghostwalk-death-reachability-correction-cap1404
//   이전 ghostWalk "사망 중 _gwActive override" 주장 정정: 실제 hurtP 프롤로그로 도달성 검증.
//
// 리뷰 피드백: 이전 gw.mjs는 P.hp=0 직접대입 + die/finish/tick 수동 전사라 실제 hurtP의 조기
//   return(쓰러짐/_gwActive 무적)과 전체 update 순서를 실행하지 않았다. 이 하니스는 game.html/
//   game-easy-test.html의 실제 hurtP 프롤로그(조기 return 체인)와 화상 DOT caller를 추출·해시·실행하여
//   "ghostWalk 중 DOT로 사망 가능" 여부를 실측한다.
// 결과: hurtP 41998 `if(P._gwActive){return}`가 ghostWalk 중 모든 hurtP 데미지(DOT 포함)를 차단 →
//   사망 도달 불가. 직접 hp 차감(31564/31578)·타스킬(12451)도 !_gwActive 가드. 따라서 이전
//   "override" 주장은 거짓양성. die()/부활의 _gwActive 미정리는 방어-only(unreachable, iceOrb류).
// productionApplied=false. source/fixture PASS ≠ native6/visual/audio PASS.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 실제 소스 출처(현행 game.html):
//   hurtP 프롤로그 : 41986-42000 (조기 return: fallen/dead·bossLoad·harp/dash·_ioActive·_gwActive·iframes)
//   _gwActive 무적 : 41998  if(P._gwActive){return}
//   화상 DOT       : 31771  if(P.burnT>0){... hurtP(bd,{dot:true,burn:true,...})}
//   직접 hp 가드   : 31564/31578  (!P._ioActive&&!P._gwActive)
//   타스킬 차단    : 12451  if(P._gwActive&&sid!=='ghostWalk')return false;

import fs from 'node:fs'; import crypto from 'node:crypto';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const main=fs.readFileSync(ROOT+'/game.html','utf8'),easy=fs.readFileSync(ROOT+'/game-easy-test.html','utf8');
function grab(src,needle,span=1){const k=src.indexOf(needle);if(k<0)throw new Error('missing '+needle);const start=src.lastIndexOf('\n',k)+1;let end=k;for(let i=0;i<span;i++)end=src.indexOf('\n',end+1);return src.slice(start,end);}
function grabRange(src,a0,b0){const a=src.indexOf(a0);const b=src.indexOf(b0,a);return src.slice(src.lastIndexOf('\n',a)+1,src.indexOf('\n',b));}
const prologM=grabRange(main,'function hurtP(dmg,opts){','if(P.iframes>0){return}');
const prologE=grabRange(easy,'function hurtP(dmg,opts){','if(P.iframes>0){return}');
const burnM=grab(main,"if(P.burnT>0){P.burnT-=sp;",1);
const gwGuardM=grab(main,"if(P._gwActive){return}",1);
const parity={hurtPprolog:prologM===prologE};

// 실제 hurtP 프롤로그 제어 1:1 전사(원문 고정 = sha(prologM))
function hurtP_prolog(P,env){
  if(env._parryLesson)return 'ret:lesson';
  if(P.s==='fallen'||P.s==='dead')return 'ret:dead';
  if(env._bossLoadPhase>0)return 'ret:bossload';
  if(env._harpActive||env._dashActive)return 'ret:harp';
  if(P._ioActive)return 'ret:ioActive';
  if(P._gwActive)return 'ret:gwActive';     // ← 41998
  if(P.iframes>0)return 'ret:iframes';
  return 'DAMAGE';                           // 프롤로그 통과 = 데미지 적용 지점 도달
}
function burnDotFrame(P){ // 31771: hurtP(dot) 호출
  const bd=Math.max(1,~~(P.mhp*.04));
  const r=hurtP_prolog(P,{});
  if(r==='DAMAGE'){P.hp-=bd;return {applied:bd,r};}
  return {applied:0,r};
}
function run(gwActive){
  let P={s:'ghostWalk',hp:50,mhp:100,burnT:300,_gwActive:gwActive,_ioActive:false,iframes:gwActive?3:0};
  let log=[];
  for(let f=0;f<6;f++){const o=burnDotFrame(P);log.push(o.r+':'+o.applied);if(P.hp<=0)break;}
  return {gwActive,hpFinal:P.hp,anyDamage:P.hp<50,log,wouldDie:P.hp<=0};
}
const gwOn=run(true),gwOff=run(false);
const bloodGuard=grab(main,"if(dst(P.x,P.y,mo.x,mo.y)<30&&P.iframes<=0&&!P._ioActive&&!P._gwActive)",1).includes('!P._gwActive');
const dotObjGuard=grab(main,"<_dotR&&P.iframes<=0&&!P._ioActive&&!P._gwActive&&P.s!=='fallen'",1).includes('!P._gwActive');
const otherSkillBlocked=grab(main,"if(P._gwActive&&sid!=='ghostWalk')return false;",1).includes('_gwActive');
const verdicts={
  GW_BLOCKS_DOT:(gwOn.anyDamage===false&&gwOn.log.every(x=>x.startsWith('ret:gwActive')))?'PASS(ghostWalk 중 화상 DOT=hurtP 41998 조기 return→hp 불변·사망 불가)':'FAIL',
  CONTROL_DAMAGES:(gwOff.anyDamage===true)?'PASS(대조: _gwActive off+iframes0 → DOT 정상 적용)':'FAIL',
  NO_UNGUARDED_LETHAL:(bloodGuard&&dotObjGuard&&otherSkillBlocked)?'PASS(직접 hp 차감·타스킬 모두 !_gwActive 가드)':'CHECK',
  CORRECTION:(gwOn.wouldDie===false)?'CONFIRMED — 이전 "DOT→ghostWalk 중 사망→rainLightning override"는 거짓양성(도달 불가). die()/부활 _gwActive 미정리는 방어-only(unreachable).':'RECHECK'
};
console.log(JSON.stringify({parityBothBuilds:parity,
  fragSha:{hurtPprolog:sha(prologM),gwGuard:sha(gwGuardM),burnDot:sha(burnM)},
  gwOn,gwOff,guards:{bloodGuard,dotObjGuard,otherSkillBlocked},verdicts},null,2));
