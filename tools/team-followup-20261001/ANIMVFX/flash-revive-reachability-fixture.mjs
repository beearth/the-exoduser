#!/usr/bin/env node
/*
 * flash-revive-reachability-fixture.mjs — stale _hitFlash가 "부활"까지 살아남는 실제 도달 경로 검수
 * 소유: ANIMVFX / 터미널 8. 과제 ANIMVFX-FLASH-REVIVE-REACHABILITY.
 *
 * root 구분 유지: flash-transition의 제출은 소스상 초기화 누락/잠재상태 차이이며,
 *   실제 게임에서 도달하는 잔상 결함은 아직 미입증. 본 fixture는 그 도달 여부를
 *   "draw를 임의로 생략하는 가정 없이" 실제 루프 순서로 검증한다.
 *
 * 실제 추출 순서(game.html):
 *   메인 루프 59803-59830: while(_acc>=PHYS_STEP){ update(); _acc-=PHYS_STEP }  → draw() 1회(G.on이면 항상)
 *   _accCap 59763: 프레임당 update 최대 5틱(데스크톱 _prof.u<=8) / 3(무거움) / 2(모바일)
 *   update(): rebuildDeadPool 33089(++G._shT>=2, 2틱 주기) → 적 AI 루프 [decay 33149 'if(e.alive)' 안] [etype9 시체부활 37552]
 *   draw(): 사망분기 50888 'if(!e.alive){ if(e._hitFlash)e._hitFlash=0 }' → alive&&hf>0 플래시 렌더(51851/5227)
 *   부활 전이(37558)는 eShield/stunned/reviveIframes는 리셋하나 _hitFlash 소거 없음.
 *
 * ★ 게임/브라우저/빌드 실행 0. 순수 Node 모델(생산 미수정). draw는 매 프레임 1회 반드시 실행(생략 가정 없음).
 *
 * 사용: node flash-revive-reachability-fixture.mjs
 * exit 0 = 모든 시나리오가 기대대로 재현(도달/미도달 판정 일관), 1 = 불일치.
 */
'use strict';

const PHYS_STEP = 1000 / 60;
const SP = 1; // 정상(슬로모/히트스톱 아님)

// ── 실제 순서를 모델한 시뮬레이터 ────────────────────────────────────────────
function makeSim({ accCapTicks }) {
  const ens = [];
  let _shT = 0;
  let _deadPool = [];
  const log = [];
  let frame = 0, tick = 0;
  const flashRendersOnAlive = []; // draw에서 "부활/생존 몹에 플래시 그림" 기록

  function rebuildDeadPool() { _deadPool = ens.filter(e => !e.alive && !e._absorbed); }

  // update() 1틱 — game.html update() 순서 반영
  function update(scriptTick) {
    tick++;
    // 33089: 2틱 주기 _deadPool 재구성 (AI 루프보다 먼저)
    if (++_shT >= 2) { _shT = 0; rebuildDeadPool(); }
    // 스크립트 훅: 이 틱에 가해지는 외부 사건(플레이어 막타 등)
    if (scriptTick) scriptTick({ ens, tick, frame, log });
    // 적 AI 루프 (index 순서)
    for (let i = 0; i < ens.length; i++) {
      const e = ens[i];
      if (e.alive) {
        // 33149: 피격 플래시 감쇠 — alive 전용
        if (e._hitFlash > 0) e._hitFlash = Math.max(0, e._hitFlash - SP);
        // 37552: etype9 주술사 — 죽은 아군 부활
        if (e.etype === 9 && e.s === 'idle') {
          e.reviveT -= SP;
          if (e.reviveT <= 0) {
            let corpse = null;
            for (const oe of _deadPool) { if (!oe.ib && oe.etype !== 9 && !oe._absorbed && Math.hypot(oe.x - e.x, oe.y - e.y) < 150) { corpse = oe; break; } }
            if (corpse) {
              // 37558 전이: 형제 상태 리셋, _hitFlash 소거 없음(현재 생산 그대로)
              corpse.alive = true; corpse.hp = Math.floor(corpse.mhp * .5); corpse.eShield = 0; corpse.eShieldMax = 0;
              corpse.s = 'recover'; corpse.st2 = 60; corpse.stunned = 0; corpse.reviveIframes = 0;
              log.push(`tick${tick}(frame${frame}): REVIVE corpse#${corpse.id} alive=true hf=${corpse._hitFlash} (draw 미실행 상태)`);
              e.reviveT = e.reviveCd;
            } else { e.reviveT = 60; }
          }
        }
        // 보스 reviveTimer 카운트다운(별도 전이) — 동일프레임 불가 입증용
        if (!e.alive) { /* no-op */ }
      } else {
        // 죽은 보스/부활대기: reviveTimer 카운트다운
        if (e._reviveTimer > 0) {
          e._reviveTimer -= SP;
          if (e._reviveTimer <= 0 && e._bossRevive) {
            // 33205 보스 전이: _hitFlash 소거 없음
            e.alive = true; e.eShield = 0; e.stunned = 0; e.reviveIframes = 90;
            log.push(`tick${tick}(frame${frame}): BOSS REVIVE #${e.id} alive=true hf=${e._hitFlash}`);
          }
        }
      }
    }
  }

  // draw() — 프레임당 1회. 50888 사망분기 소거 + alive&&hf>0 플래시 렌더.
  function draw() {
    for (const e of ens) {
      if (!e.alive) { if (e._hitFlash) e._hitFlash = 0; }   // 50888
      else if (e._hitFlash > 0) {                           // 51851/5227 alive 플래시 렌더
        flashRendersOnAlive.push({ frame, id: e.id, hf: e._hitFlash });
      }
    }
  }

  // 메인 루프 1 rAF 프레임: _acc 누산(클램프) → while update → draw 1회
  function runFrame(frameTimeMs, scriptTick) {
    frame++;
    let _acc = Math.min(frameTimeMs, accCapTicks * PHYS_STEP);  // 59763 클램프
    while (_acc >= PHYS_STEP) { update(scriptTick); _acc -= PHYS_STEP; }  // 59803
    draw();  // 59828/59830 — G.on이면 항상 1회
  }

  return { ens, runFrame, log, flashRendersOnAlive, get tick() { return tick; } };
}

function mkEnemy(o) { return Object.assign({ id: 0, etype: 0, x: 0, y: 0, alive: true, hf: 0, _hitFlash: 0, mhp: 100, s: 'idle', _absorbed: false, _reviveTimer: 0 }, o); }

// ── 시나리오 ────────────────────────────────────────────────────────────────
function scenarioEtype9({ accCapTicks, killTick, resurrectorReviveT }) {
  const sim = makeSim({ accCapTicks });
  // 부활술사 E(etype9), 피격당해 죽을 A(인접, index A<E)
  const A = mkEnemy({ id: 1, etype: 3, x: 100, y: 100, alive: true, _hitFlash: 0, mhp: 200 });
  const E = mkEnemy({ id: 2, etype: 9, x: 150, y: 100, alive: true, s: 'idle', reviveT: resurrectorReviveT, reviveCd: 300 });
  sim.ens.push(A, E);
  // 단일 catch-up 프레임: killTick에서 플레이어 막타(A.hf=6 세팅 후 사망)
  const script = ({ ens, tick, frame, log }) => {
    if (tick === killTick && A.alive) {
      A._hitFlash = 6;            // hurtE: 피격 플래시 세팅
      A.alive = false; A.hp = 0;  // 막타 사망(같은 틱)
      log.push(`tick${tick}(frame${frame}): KILL A#1 hf=6 alive=false (막타 피격)`);
    }
  };
  // 하나의 긴 catch-up 프레임(accCapTicks 틱) 실행 — 이 프레임 내내 draw 없음, 끝에 1회
  // 프레임 실행: frameTime 크게(히치) → _acc=accCap → accCapTicks 틱
  sim.runFrame(accCapTicks * PHYS_STEP + 100, script);
  // 부활 후 몇 프레임 더(정상 60fps) 돌려 잔상 렌더 지속 관찰
  for (let f = 0; f < 8; f++) sim.runFrame(PHYS_STEP, null);
  return sim;
}

function scenarioSmooth() {
  // 매 프레임 1틱(정상 60fps): A 사망 프레임 → 그 프레임 draw가 즉시 소거 → 이후 부활은 hf=0
  const sim = makeSim({ accCapTicks: 5 });
  const A = mkEnemy({ id: 1, etype: 3, x: 100, y: 100, _hitFlash: 0, mhp: 200 });
  const E = mkEnemy({ id: 2, etype: 9, x: 150, y: 100, s: 'idle', reviveT: 4, reviveCd: 300 });
  sim.ens.push(A, E);
  let f = 0;
  const script = ({ tick }) => { if (f === 0 && A.alive) { A._hitFlash = 6; A.alive = false; A.hp = 0; } };
  for (f = 0; f < 10; f++) sim.runFrame(PHYS_STEP, script); // 각 프레임 1틱 + draw
  return sim;
}

function scenarioBoss({ accCapTicks }) {
  const sim = makeSim({ accCapTicks });
  const B = mkEnemy({ id: 9, etype: 0, ib: true, x: 100, y: 100, _hitFlash: 0, mhp: 1000, _bossRevive: true });
  sim.ens.push(B);
  // 사망: hf=6, reviveTimer=90(보스)
  const script = ({ tick }) => { if (tick === 1 && B.alive) { B._hitFlash = 6; B.alive = false; B._reviveTimer = 90; } };
  // 긴 catch-up 프레임 + 이후 정상 프레임 다수(reviveTimer 소진까지)
  sim.runFrame(accCapTicks * PHYS_STEP + 100, script);
  for (let f = 0; f < 120; f++) sim.runFrame(PHYS_STEP, null);
  return sim;
}

function run() {
  let fail = 0;
  const ok = (b, msg) => { console.log(`[${b ? 'OK ' : 'XX '}] ${msg}`); if (!b) fail++; };

  console.log('flash-revive-reachability — 실제 루프 순서 실행 fixture (draw 매 프레임 1회, 생략 없음)\n');

  // 1) etype9 시체부활 — 단일 catch-up 프레임(5틱)에서 kill tick1, 부활술사 reviveT=1
  console.log('── 시나리오 A: etype9 시체부활, catch-up 5틱 프레임 ──');
  const s1 = scenarioEtype9({ accCapTicks: 5, killTick: 1, resurrectorReviveT: 2 });
  s1.log.forEach(l => console.log('   ' + l));
  const staleRender = s1.flashRendersOnAlive.length > 0;
  console.log(`   draw에서 '부활/생존 몹에 플래시 렌더' 횟수 = ${s1.flashRendersOnAlive.length}` + (staleRender ? `  첫: frame${s1.flashRendersOnAlive[0].frame} hf=${s1.flashRendersOnAlive[0].hf}` : ''));
  ok(staleRender, 'A: catch-up 프레임 내 사망→etype9 부활(같은 프레임, draw 없음) → 부활 몹에 stale _hitFlash 렌더 = 실제 도달 확인');

  // 2) 정상 60fps(프레임당 1틱): 사망 프레임 draw가 즉시 소거 → 부활 시 hf=0
  console.log('\n── 시나리오 B: 정상 60fps(프레임당 1틱) ──');
  const s2 = scenarioSmooth();
  ok(s2.flashRendersOnAlive.length === 0, 'B: 매 프레임 draw가 사망 몹 _hitFlash 즉시 소거 → 부활 잔상 렌더 0 (미도달)');

  // 3) 보스 부활(reviveTimer=90): 5틱 catch-up으로도 동일프레임 부활 불가 → 사망 중 draw 소거 → 미도달
  console.log('\n── 시나리오 C: 보스 부활(reviveTimer=90), catch-up 5틱 ──');
  const s3 = scenarioBoss({ accCapTicks: 5 });
  s3.log.forEach(l => console.log('   ' + l));
  ok(s3.flashRendersOnAlive.length === 0, 'C: reviveTimer 90은 ≤5틱/프레임으로 동일프레임 불가 → 사망 중 draw가 소거 → 부활 시 hf=0 (미도달, 방어 전용)');

  console.log(`\n판정: etype9 시체부활 = ${staleRender ? '실제 도달(REACHABLE)' : '미도달'} · boss/druid = 미도달(방어 전용)`);
  console.log(`${fail === 0 ? 'ALL OK' : fail + ' FAIL'} (exit ${fail === 0 ? 0 : 1})`);
  process.exit(fail === 0 ? 0 : 1);
}
run();
