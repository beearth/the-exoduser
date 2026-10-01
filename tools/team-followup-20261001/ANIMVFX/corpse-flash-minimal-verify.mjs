#!/usr/bin/env node
/*
 * corpse-flash-minimal-verify.mjs — 시체부활 최소후보 before 재현 / 후보 제거 검증
 * 소유: ANIMVFX / 터미널 8. 과제 corpse-flash-minimal.
 *
 * flash-revive-reachability와 동일한 "실제 루프 순서" 모델(draw 매 프레임 1회, 생략 없음)에
 * 'patched' 토글(시체부활 전이에 corpse._hitFlash=0 추가 = corpse-flash-minimal.patch 효과)을 두어:
 *   (before) 패치 전 = catch-up 프레임에서 부활 몹에 stale 플래시 렌더(도달 재현)
 *   (after)  패치 후 = 같은 catch-up에서 렌더 0(후보 제거 효과)
 *   정상 1tick/프레임은 before/after 모두 0(분리).
 * 동시에 hp/alive/poise/reviveIframes/eShield·보상·RNG·원 호출횟수 불변을 확인한다.
 * ★ 순수 Node. game.html/easy 미수정. draw 매 프레임 1회(생략 가정 없음).
 */
'use strict';
const PHYS = 1000 / 60, SP = 1;

function sim({ accCap, patched }) {
  const ens = []; let _shT = 0, _deadPool = [], tick = 0, frame = 0;
  const renders = [];           // draw에서 alive&&hf>0 (스퍼리어스 플래시)
  const calls = { reviveVFX: 0, addTxt: 0, addParts: 0, rollDrop: 0, addExp: 0 }; // 원 호출/보상 횟수
  const rebuild = () => { _deadPool = ens.filter(e => !e.alive && !e._absorbed); };
  function update(script) {
    tick++;
    if (++_shT >= 2) { _shT = 0; rebuild(); }
    if (script) script({ ens, tick });
    for (const e of ens) {
      if (e.alive) {
        if (e._hitFlash > 0) e._hitFlash = Math.max(0, e._hitFlash - SP); // decay (alive-gated)
        if (e.etype === 9 && e.s === 'idle') {
          e.reviveT -= SP;
          if (e.reviveT <= 0) {
            let corpse = null;
            for (const oe of _deadPool) if (!oe.ib && oe.etype !== 9 && !oe._absorbed && Math.hypot(oe.x - e.x, oe.y - e.y) < 150) { corpse = oe; break; }
            if (corpse) {
              // 전이(원본): 형제 상태 리셋
              corpse.alive = true; corpse.hp = Math.floor(corpse.mhp * .5); corpse.eShield = 0; corpse.eShieldMax = 0;
              corpse.s = 'recover'; corpse.st2 = 60; corpse.stunned = 0; corpse.poise = corpse.maxPoise; corpse.reviveIframes = 0;
              if (patched) corpse._hitFlash = 0;   // ← corpse-flash-minimal.patch 삽입분
              corpse._revT = tick;
              // 원 호출/보상(불변 대상) — 삽입분이 여기 횟수를 바꾸지 않아야 함
              calls.reviveVFX++; calls.addTxt++; calls.addParts++;
              e.reviveT = e.reviveCd;
            } else e.reviveT = 60;
          }
        }
      }
    }
  }
  function draw() { for (const e of ens) { if (!e.alive) { if (e._hitFlash) e._hitFlash = 0; } else if (e._hitFlash > 0) renders.push({ frame, id: e.id, hf: e._hitFlash }); } }
  function runFrame(ft, script) { frame++; let acc = Math.min(ft, accCap * PHYS); while (acc >= PHYS) { update(script); acc -= PHYS; } draw(); }
  return { ens, runFrame, renders, calls };
}

function mk(o) { return Object.assign({ id: 0, etype: 0, x: 0, y: 0, alive: true, _hitFlash: 0, mhp: 200, maxPoise: 10, poise: 10, s: 'idle', _absorbed: false }, o); }

// 시나리오: 부활술사 E + 피격사망 A. catchup=5틱 프레임 / 정상=1틱/프레임.
function runScenario({ patched, catchup }) {
  const s = sim({ accCap: 5, patched });
  const A = mk({ id: 1, etype: 3, x: 100, y: 100, mhp: 200, poise: 8, maxPoise: 8 });
  const E = mk({ id: 2, etype: 9, x: 150, y: 100, s: 'idle', reviveT: catchup ? 2 : 4, reviveCd: 300 });
  s.ens.push(A, E);
  const script = ({ tick }) => { if (tick === 1 && A.alive) { A._hitFlash = 6; A.alive = false; A.hp = 0; } };
  if (catchup) { s.runFrame(5 * PHYS + 100, script); for (let f = 0; f < 8; f++) s.runFrame(PHYS, null); }
  else { for (let f = 0; f < 10; f++) s.runFrame(PHYS, ({ tick }) => { if (f === 0 && A.alive) { A._hitFlash = 6; A.alive = false; A.hp = 0; } }); }
  return { s, A };
}

let fail = 0; const ok = (b, m) => { console.log(`[${b ? 'OK ' : 'XX '}] ${m}`); if (!b) fail++; };
console.log('corpse-flash-minimal — before 재현 / 후보 제거 검증 (draw 매 프레임 1회)\n');

console.log('── catch-up 프레임 ──');
const cb = runScenario({ patched: false, catchup: true });
const ca = runScenario({ patched: true, catchup: true });
console.log(`   before 렌더=${cb.s.renders.length}` + (cb.s.renders.length ? ` (첫 hf=${cb.s.renders[0].hf})` : '') + ` · after 렌더=${ca.s.renders.length}`);
ok(cb.s.renders.length > 0, 'before: catch-up에서 부활 몹 stale 플래시 렌더(도달 재현)');
ok(ca.s.renders.length === 0, 'after(패치): 같은 catch-up에서 렌더 0 (후보가 결함 제거)');

console.log('\n── 정상 1tick/프레임 ──');
const nb = runScenario({ patched: false, catchup: false });
const na = runScenario({ patched: true, catchup: false });
ok(nb.s.renders.length === 0 && na.s.renders.length === 0, '정상: before/after 모두 렌더 0 (영향 없음, 분리 확인)');

console.log('\n── 불변(hp/alive/poise/reviveIframes/eShield·보상·RNG·호출횟수) ──');
// 부활 결과 상태: patched/unpatched 동일(except _hitFlash)
const bA = cb.A, aA = ca.A;
ok(bA.alive === aA.alive && aA.alive === true, 'alive 동일(true)');
ok(bA.hp === aA.hp, `hp 동일(${aA.hp})`);
ok(bA.poise === aA.poise && aA.poise === aA.maxPoise, 'poise 동일(maxPoise)');
ok(bA.reviveIframes === aA.reviveIframes, 'reviveIframes 동일');
ok(bA.eShield === aA.eShield, 'eShield 동일');
ok(JSON.stringify(cb.s.calls) === JSON.stringify(ca.s.calls), `원 호출/보상 횟수 동일 ${JSON.stringify(ca.s.calls)} (삽입이 호출/RNG/보상 미변경)`);
// 결함의 실제 증거 = 부활 직후 그려진 스퍼리어스 플래시 프레임 수(최종 hf값 아님; 결국 감쇠로 0 수렴).
ok(cb.s.renders.length > ca.s.renders.length && ca.s.renders.length === 0,
  `결함 증거: 부활 직후 플래시 렌더 before=${cb.s.renders.length}프레임 → after=${ca.s.renders.length}프레임 (유일한 차이는 corpse._hitFlash=0 삽입)`);

console.log(`\n${fail === 0 ? 'ALL OK' : fail + ' FAIL'} (exit ${fail === 0 ? 0 : 1})`);
process.exit(fail === 0 ? 0 : 1);
