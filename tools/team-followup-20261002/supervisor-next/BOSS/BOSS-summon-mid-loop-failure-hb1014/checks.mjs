// BOSS-summon-mid-loop-failure-hb1014 — validator / primary reproduction
// 지정 Node: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node
// 실행: node checks.mjs
//
// 대상 소스 (verbatim, game.html:39442-39458 / game-easy-test.html:38244-38260,
//            fragment sha256 = 8e2c0a343479a55ba637e3ed62eb0c23d97625504c7f3d17a46ed6702164ac45, 양판 동일):
//
//   case'bossSummonWind':{
//     if(Math.random()>.6)poolPart(...);
//     if(e.st2<=0){
//       const cnt=3+~~(G.stage*.5);
//       for(let si=0;si<cnt;si++){
//         const a=Math.PI*2*si/cnt,sd=50+Math.random()*30;
//         const sx=e.x+Math.cos(a)*sd,sy=e.y+Math.sin(a)*sd;
//         const el=[EL.P,EL.F,EL.I,EL.D,EL.L,EL.H][~~(Math.random()*6)];
//         const et=[0,2,3,3,3][~~(Math.random()*5)];
//         const ne=mkEn(sx,sy,G.stage,et,false,el,e.room);   // throwable caller
//         ne.hp=~~(ne.hp*.5);ne.mhp=ne.hp;ne.eShield=0;ne.eShieldMax=0;
//         ens.push(ne);
//         addParts(sx,sy,'#aa00ff',8);                        // throwable caller
//       }
//       SFX.charge();addTxt(...);                             // throwable caller
//       e.s='recover';e.st2=70;   // <<< 루프/부수호출 뒤에 위치 — throw 시 도달 못함
//     }break}
//
// 대역(band) 경계: mkEn/addParts/poolPart/SFX/addTxt 는 STUB(합성 입력)이다. 결함은 mkEn 내부가
// 아니라 case 자신의 제어흐름(상태전이가 throwable 작업 뒤에 있음)이며, 그 제어흐름만 verbatim
// 으로 재현한다. mkEn/addParts 가 실게임에서 실제로 throw 하는지(도달성)는 환경대역이며 여기서
// 증명하지 않는다. RNG 는 결정론 seed 로 고정해 소환 수/el/et/hp.5/room/70f trace 를 보존한다.

const EL = { P:0, F:1, I:2, D:3, L:4, H:5 };

// 결정론 RNG (mulberry32) — 실게임 Math.random 자리. 소환 수/트레이스 재현용.
function makeRng(seed){ let a = seed>>>0; return () => { a |= 0; a = (a + 0x6D2B79F5)|0; let t = Math.imul(a ^ (a>>>15), 1|a); t = (t + Math.imul(t ^ (t>>>7), 61|t)) ^ t; return ((t ^ (t>>>14))>>>0) / 4294967296; }; }

function makeEnv(opts={}){
  let mkCalls = 0, apCalls = 0, sfxCalls = 0;
  const rng = makeRng(opts.seed ?? 909);
  return {
    EL, rng,
    poolPart(){ /* no-op stub */ },
    mkEn(sx,sy,stage,et,isB,el,room){
      mkCalls++;
      if(opts.throwOnMkEn && mkCalls === opts.throwOnMkEn) throw new Error('BAND: mkEn throw @mkCall'+mkCalls);
      // 실제 mkEn 은 더 크지만, 소환수 계약상 필요한 필드만 합성(hp.5 전 기준 hp=100)
      return { x:sx, y:sy, stage, et, el, room, hp:100, mhp:100, eShield:1, eShieldMax:1, _summon:true };
    },
    addParts(){ apCalls++; if(opts.throwOnAddParts && apCalls === opts.throwOnAddParts) throw new Error('BAND: addParts throw @apCall'+apCalls); },
    SFX:{ charge(){ if(opts.throwOnSFX){ throw new Error('BAND: SFX.charge throw'); } } },
    addTxt(){},
    _L:(ko,_en)=>ko,
    get mkCalls(){return mkCalls;}, get apCalls(){return apCalls;}, get sfxCalls(){return sfxCalls;}
  };
}

// ── CURRENT: 현행 소스 제어흐름 재현 (상태전이가 루프/부수호출 뒤) ──
function summonCurrent(e, G, ens, env){
  if(env.rng() > .6) env.poolPart(e.x, e.y);
  if(e.st2 <= 0){
    const cnt = 3 + ~~(G.stage * .5);
    for(let si=0; si<cnt; si++){
      const a = Math.PI*2*si/cnt, sd = 50 + env.rng()*30;
      const sx = e.x + Math.cos(a)*sd, sy = e.y + Math.sin(a)*sd;
      const el = [env.EL.P,env.EL.F,env.EL.I,env.EL.D,env.EL.L,env.EL.H][~~(env.rng()*6)];
      const et = [0,2,3,3,3][~~(env.rng()*5)];
      const ne = env.mkEn(sx, sy, G.stage, et, false, el, e.room);   // throwable
      ne.hp = ~~(ne.hp*.5); ne.mhp = ne.hp; ne.eShield = 0; ne.eShieldMax = 0;
      ens.push(ne);
      env.addParts(sx, sy, '#aa00ff', 8);                            // throwable
    }
    env.SFX.charge(); env.addTxt();                                  // throwable
    e.s = 'recover'; e.st2 = 70;   // throw 시 미도달
  }
}

// ── CANDIDATE (최소 memory 후보 B): try/finally 로 상태전이 보장 ──
// 재시도/수량 정책 도입 없음. 정상 경로는 현행과 동일(finally 는 try 정상종료 후 실행).
// 실패 경로: 이미 push 된 부분 spawn 은 유지(정책 미결정), 상태만 안전 종료 후 throw 재전파.
function summonFixed(e, G, ens, env){
  if(env.rng() > .6) env.poolPart(e.x, e.y);
  if(e.st2 <= 0){
    try {
      const cnt = 3 + ~~(G.stage * .5);
      for(let si=0; si<cnt; si++){
        const a = Math.PI*2*si/cnt, sd = 50 + env.rng()*30;
        const sx = e.x + Math.cos(a)*sd, sy = e.y + Math.sin(a)*sd;
        const el = [env.EL.P,env.EL.F,env.EL.I,env.EL.D,env.EL.L,env.EL.H][~~(env.rng()*6)];
        const et = [0,2,3,3,3][~~(env.rng()*5)];
        const ne = env.mkEn(sx, sy, G.stage, et, false, el, e.room);
        ne.hp = ~~(ne.hp*.5); ne.mhp = ne.hp; ne.eShield = 0; ne.eShieldMax = 0;
        ens.push(ne);
        env.addParts(sx, sy, '#aa00ff', 8);
      }
      env.SFX.charge(); env.addTxt();
    } finally {
      e.s = 'recover'; e.st2 = 70;   // throw 여부와 무관하게 상태 종료 보장
    }
  }
}

// 프레임 경계 모사: updateE throw 는 frame try/catch 에서 잡히고 다음 tick 에 같은 적의 updateE 가
// 다시 호출된다고 가정(band). 반환: {threw, err}
function tick(impl, e, G, ens, env){
  try { impl(e, G, ens, env); return { threw:false }; }
  catch(err){ return { threw:true, err:String(err.message) }; }
}

let pass = 0, fail = 0;
const log = [];
function check(name, cond, detail){ (cond?pass++:fail++); log.push(`  [${cond?'PASS':'FAIL'}] ${name}${detail?' — '+detail:''}`); }

// ───────────────────────────────────────────────────────────────────
// S1. CONTROL — 현행 정상 경로(throw 없음), stage0. 계약 trace 보존 검증.
{
  const e = { x:500, y:400, s:'bossSummonWind', st2:0, room:7 };
  const G = { stage:0 };
  const ens = [];
  const env = makeEnv({ seed:909 });
  const r = tick(summonCurrent, e, G, ens, env);
  const cntExpected = 3 + ~~(G.stage*.5);
  console.log('S1 CONTROL(current,normal,stage0):', { threw:r.threw, ens:ens.length, es:e.s, st2:e.st2, hp0:ens[0]?.hp, room:ens[0]?.room });
  check('S1 no throw', r.threw === false);
  check('S1 소환 수 = 3+floor(stage*.5)=3', ens.length === cntExpected, 'ens='+ens.length);
  check('S1 HP×.5 적용(100→50)', ens.every(n=>n.hp===50 && n.mhp===50), 'hp0='+ens[0]?.hp);
  check('S1 eShield 0', ens.every(n=>n.eShield===0 && n.eShieldMax===0));
  check('S1 room 전파(e.room=7)', ens.every(n=>n.room===7));
  check('S1 el 은 6원소 풀 내', ens.every(n=>n.el>=0 && n.el<=5));
  check('S1 et 는 [0,2,3,3,3] 풀 내', ens.every(n=>[0,2,3].includes(n.et)));
  check('S1 상태 recover/70f 전이', e.s==='recover' && e.st2===70, 'e.s='+e.s+',st2='+e.st2);
}

// ───────────────────────────────────────────────────────────────────
// S2. DEFECT repro — 현행, 2번째 mkEn throw. 첫 spawn 남고 상태 bossSummonWind 고착 → 다음 tick 중복.
{
  const e = { x:500, y:400, s:'bossSummonWind', st2:0, room:7 };
  const G = { stage:0 };
  const ens = [];
  const env1 = makeEnv({ seed:909, throwOnMkEn:2 });
  const r1 = tick(summonCurrent, e, G, ens, env1);
  console.log('S2 tick1(current,throw@mkEn2):', { threw:r1.threw, err:r1.err, ensAfter1:ens.length, es:e.s, st2:e.st2 });
  check('S2 tick1 throw 발생', r1.threw === true, r1.err);
  check('S2 tick1 첫 spawn 1마리 잔존', ens.length === 1, 'ens='+ens.length);
  check('S2 tick1 상태 bossSummonWind 고착(미전이)', e.s==='bossSummonWind' && e.st2<=0, 'e.s='+e.s+',st2='+e.st2);

  // 다음 tick: 일시적 장애 해소(throw 없음) 가정 → st2<=0 이라 재진입하여 중복 소환
  const env2 = makeEnv({ seed:909 });
  const r2 = tick(summonCurrent, e, G, ens, env2);
  console.log('S2 tick2(current,no-throw):', { threw:r2.threw, ensAfter2:ens.length, es:e.s, st2:e.st2 });
  check('S2 tick2 중복 소환 발생(1 + 3 = 4)', ens.length === 4, 'ens='+ens.length+' (DEFECT: 첫 spawn 유지 + 전체 재소환)');

  // 장애가 지속되면 매 tick 재진입(부분 spawn 누적) — 상태가 영영 안 끝남
  const e3 = { x:500, y:400, s:'bossSummonWind', st2:0, room:7 };
  const ens3 = [];
  let reentries = 0;
  for(let t=0; t<5; t++){
    const env = makeEnv({ seed:909+t, throwOnMkEn:2 });
    const before = e3.s;
    tick(summonCurrent, e3, G, ens3, env);
    if(e3.s==='bossSummonWind' && e3.st2<=0) reentries++;
  }
  console.log('S2 지속장애 5tick:', { es:e3.s, st2:e3.st2, ens:ens3.length, reentries });
  check('S2 지속장애 시 매 tick 재진입(상태 영구 고착)', reentries===5 && e3.s==='bossSummonWind', 'reentries='+reentries+', ens누적='+ens3.length);
}

// ───────────────────────────────────────────────────────────────────
// S3. FIXED — candidate(try/finally), 2번째 mkEn throw. 부분 spawn 유지 + 상태 안전 종료 → 다음 tick 재소환 없음.
{
  const e = { x:500, y:400, s:'bossSummonWind', st2:0, room:7 };
  const G = { stage:0 };
  const ens = [];
  const env1 = makeEnv({ seed:909, throwOnMkEn:2 });
  const r1 = tick(summonFixed, e, G, ens, env1);
  console.log('S3 tick1(fixed,throw@mkEn2):', { threw:r1.threw, err:r1.err, ensAfter1:ens.length, es:e.s, st2:e.st2 });
  check('S3 tick1 throw 는 여전히 전파(삼킴 없음)', r1.threw === true, r1.err);
  check('S3 tick1 첫 spawn 1마리(부분)', ens.length === 1, 'ens='+ens.length);
  check('S3 tick1 상태 recover/70f 안전 종료', e.s==='recover' && e.st2===70, 'e.s='+e.s+',st2='+e.st2);

  const env2 = makeEnv({ seed:909 });
  const r2 = tick(summonFixed, e, G, ens, env2);
  console.log('S3 tick2(fixed,no-throw):', { threw:r2.threw, ensAfter2:ens.length, es:e.s, st2:e.st2 });
  check('S3 tick2 재소환 없음(st2=70>0)', ens.length === 1, 'ens='+ens.length+' (고착/중복 해소)');
}

// ───────────────────────────────────────────────────────────────────
// S4. FIXED 정상 경로 등가성 — candidate 가 정상 경로를 바꾸지 않음(S1 과 동일 결과).
{
  const e = { x:500, y:400, s:'bossSummonWind', st2:0, room:7 };
  const G = { stage:0 };
  const ensCur = [], ensFix = [];
  tick(summonCurrent, {...e}, G, ensCur, makeEnv({ seed:909 }));
  const eFix = {...e};
  tick(summonFixed, eFix, G, ensFix, makeEnv({ seed:909 }));
  const sameCount = ensCur.length === ensFix.length;
  const sameTrace = JSON.stringify(ensCur.map(n=>[n.el,n.et,n.hp,n.room])) === JSON.stringify(ensFix.map(n=>[n.el,n.et,n.hp,n.room]));
  console.log('S4 등가성:', { cur:ensCur.length, fix:ensFix.length, es:eFix.s, st2:eFix.st2, sameTrace });
  check('S4 정상 소환 수 동일', sameCount, 'cur='+ensCur.length+',fix='+ensFix.length);
  check('S4 정상 트레이스(el/et/hp/room) 동일', sameTrace);
  check('S4 정상 recover/70f 동일', eFix.s==='recover' && eFix.st2===70);
}

// 스테이지 분모 확인(소환 수 공식) — 정보성
{
  for(const st of [0,2,10,20,34]){
    const cnt = 3 + ~~(st*.5);
    console.log(`  stageN cnt: stage${st} → ${cnt}`);
  }
}

console.log('\n'+log.join('\n'));
console.log(`\n== RESULT: ${pass} PASS / ${fail} FAIL ==`);
process.exit(fail===0 ? 0 : 1);
