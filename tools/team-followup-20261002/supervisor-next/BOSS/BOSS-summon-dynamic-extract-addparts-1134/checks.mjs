// BOSS-summon-dynamic-extract-addparts-1134 — validator
// epoch: capacity-after-8c317a73-1134
// 실제 실행은 아래와 동일 로직을 `node /dev/stdin`(CommonJS)로 수행했고(result.md에 원 stdout 보존),
// 이 파일은 그 ESM 동일본이다(require→import만 차이). 지정 Node:
//   /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 목적(감독 피드백): hand-copy 모델이 실제 case의 arguments/RNG 동등을 미확정 → 양판 actual
// bossSummonWind case 를 동적 추출해 실제 body 를 new Function 으로 실행하고,
// 새 경계 "G.ens.push 뒤 addParts throw" 로 minimum finally recovery 후보를 검증한다.
// 대역: spawn/VFX 콜은 STUB, Math.random 은 결정론 seed. 실게임 throw 도달성은 환경대역(미증명).

import fs from 'node:fs';
import crypto from 'node:crypto';

function extract(file){
  const lines = fs.readFileSync(file,'utf8').split('\n');
  let s=-1; for(let i=0;i<lines.length;i++) if(lines[i].includes("case'bossSummonWind':{")){ s=i; break; }
  const buf=[]; for(let i=s;i<s+30;i++){ buf.push(lines[i]); if(lines[i].includes('}break}')) break; }
  const raw = buf.join('\n');
  // case'bossSummonWind':{ <body> }break}  → 'break}' 만 제거(if 닫는 '}' 유지)
  const body = raw.replace(/^\s*case'bossSummonWind':\{/,'').replace(/break\}\s*$/,'');
  return { file, startLine:s+1, endLine:s+buf.length, sha:crypto.createHash('sha256').update(raw).digest('hex').slice(0,16), body };
}

const EL={P:0,F:1,I:2,D:3,L:4,H:5};
const mul=a=>()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296; };
const build=src=>new Function('e','G','ens','EL','poolPart','SFX','addTxt','_L','mkEn','addParts',src);

function run(src,{stage=0,throwAtAddParts=0,seed=909}={}){
  const e={x:500,y:400,s:'bossSummonWind',st2:0,room:7}, G={stage}, ens=[], mkArgs=[];
  let ap=0, thrown=null;
  const mkEn=(sx,sy,st,et,isB,el,room)=>{ mkArgs.push({sx:+sx.toFixed(1),sy:+sy.toFixed(1),st,et,el,room}); return {x:sx,y:sy,hp:100,mhp:100,eShield:1,eShieldMax:1}; };
  const addParts=()=>{ ap++; if(throwAtAddParts&&ap===throwAtAddParts) throw new TypeError('BAND addParts @call'+ap); };
  const SFX={charge(){}}, poolPart=()=>{}, addTxt=()=>{}, _L=k=>k;
  const fn=build(src); const R=Math.random;
  Math.random=mul(seed);
  try{ fn(e,G,ens,EL,poolPart,SFX,addTxt,_L,mkEn,addParts); }catch(err){ thrown={name:err.constructor.name,msg:err.message}; }
  Math.random=R;
  const esAfterTick1=e.s, st2AfterTick1=e.st2, ensAfterTick1=ens.length;
  Math.random=mul(seed+1);                 // 다음 tick (장애 해소: throw 없음)
  try{ fn(e,G,ens,EL,poolPart,SFX,addTxt,_L,mkEn,addParts); }catch(_){}
  Math.random=R;
  return { esAfterTick1, st2AfterTick1, ensAfterTick1, ens2delta:ens.length-ensAfterTick1, esFinal:e.s, ensTotal:ens.length, thrown, mkArgs };
}

const cnt=s=>3+~~(s*.5);
let P=0,F=0; const L=[];
const ck=(n,c,d)=>{ (c?P++:F++); L.push(`  [${c?'PASS':'FAIL'}] ${n}${d?' — '+d:''}`); };

// ── 양판 동적 추출 + 동일성 ──
const g=extract('game.html'), e2=extract('game-easy-test.html');
console.log('game.html     ', g.startLine+'..'+g.endLine, g.sha);
console.log('game-easy-test', e2.startLine+'..'+e2.endLine, e2.sha);
const norm=s=>s.split('\n').map(l=>l.trim()).join('\n');
ck('양판 case 로직 동일(정규화)', norm(g.body)===norm(e2.body));
ck('양판 raw sha256 동일', g.sha===e2.sha, g.sha);

const body=g.body;
const STATE="e.s='recover';e.st2=70;";
const fixedBody=body.replace('if(e.st2<=0){','if(e.st2<=0){try{').replace(STATE,'}finally{'+STATE+'}');

// C1 CONTROL (실제 body, no throw)
{ const r=run(body,{stage:0});
  ck('C1 정상 tick1 소환=cnt(3)', r.ensAfterTick1===cnt(0), 'ens='+r.ensAfterTick1);
  ck('C1 tick1 상태 recover/70', r.esAfterTick1==='recover'&&r.st2AfterTick1===70, 'e.s='+r.esAfterTick1);
  ck('C1 실제 mkEn 인자 el∈[0..5]·et∈[0,2,3]·room=7', r.mkArgs.slice(0,3).every(a=>a.el>=0&&a.el<=5&&[0,2,3].includes(a.et)&&a.room===7), JSON.stringify(r.mkArgs.slice(0,3)));
  console.log('C1 real mkEn args[0..2]=',JSON.stringify(r.mkArgs.slice(0,3))); }

// C2 DEFECT (현행 body, addParts 2번째 = ens.push 뒤 throw)
{ const r=run(body,{stage:0,throwAtAddParts:2});
  ck('C2 에러 동일성 = TypeError', r.thrown&&r.thrown.name==='TypeError', r.thrown&&r.thrown.msg);
  ck('C2 tick1 push 완료(ens=2, 실패 iter mob도 push)', r.ensAfterTick1===2, 'ens1='+r.ensAfterTick1);
  ck('C2 tick1 상태 bossSummonWind 고착(st2<=0)', r.esAfterTick1==='bossSummonWind'&&r.st2AfterTick1<=0, 'e.s='+r.esAfterTick1);
  ck('C2 다음 tick 중복 재소환(ens2delta=cnt=3)', r.ens2delta===cnt(0), 'ens2delta='+r.ens2delta+',total='+r.ensTotal);
  console.log('C2 ens1=',r.ensAfterTick1,'→ total=',r.ensTotal,'thrown=',JSON.stringify(r.thrown)); }

// C3 FIXED (minimum finally, 실제 body 변환, 동일 throw)
{ const r=run(fixedBody,{stage:0,throwAtAddParts:2});
  ck('C3 throw 전파 유지(TypeError)', r.thrown&&r.thrown.name==='TypeError');
  ck('C3 tick1 부분 spawn 유지(ens=2)', r.ensAfterTick1===2, 'ens1='+r.ensAfterTick1);
  ck('C3 tick1 상태 recover/70 안전종료', r.esAfterTick1==='recover'&&r.st2AfterTick1===70, 'e.s='+r.esAfterTick1);
  ck('C3 다음 tick 재소환 없음(ens2delta=0)', r.ens2delta===0, 'ens2delta='+r.ens2delta); }

// C4 FIXED 정상 등가 (실인자/RNG 동등)
{ const a=run(body,{stage:0}), b=run(fixedBody,{stage:0});
  ck('C4 정상 mkEn 인자 트레이스 동일(RNG 동등)', JSON.stringify(a.mkArgs)===JSON.stringify(b.mkArgs));
  ck('C4 정상 상태 recover/70 동일', b.esAfterTick1==='recover'&&b.st2AfterTick1===70); }

console.log(L.join('\n'));
console.log(`\n== RESULT: ${P} PASS / ${F} FAIL ==`);
process.exit(F?1:0);
