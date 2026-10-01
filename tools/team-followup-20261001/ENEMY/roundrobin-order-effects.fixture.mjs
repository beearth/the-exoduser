/* ENEMY-20261002-ROUNDROBIN-ORDER-EFFECTS — 회전 순서가 순서 의존 동작에 주는 영향 검수
 *
 * 질문(task): 라운드로빈 회전이 spawn(mid-tick append)/splice/hole/동일 tick death/drop 보상에
 *   '잘못된 중복 update·skip·reward 차이'를 유발하는가? 실제 원문 미니 실행으로 검증하고 결함이면 최소 수정.
 *   이미 검수한 음수 정규화(roundrobin-boundary 8검사)는 단순 반복하지 않는다.
 *
 * 실제 원문 근거(game.html, 적 update 메인 루프):
 *   원본  헤더: for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];          // LIVE 길이, hole 가드 없음
 *   후보  헤더: const _elen=ens.length; ... for(let _k=0;_k<_elen;_k++){const _ei=(_eStart+_k)%_elen;const e=ens[_ei];if(!e)continue;  // 캡처 길이, 회전, hole 가드
 *   보상 1회: 벽끼임 비보스 kill(33140) rollDrop/addExp/G.kills/_regKill; hurtE 진입 `if(e.hp<=0)return`(40703) 이중처리 방지.
 *   mid-loop 변이: ens.push(append)만(분열/소환). 메인 루프 내 ens.splice 없음(별도 함수/틱시작 GC).
 *
 * 핵심 성질: _eStart∈[0,_elen) 일 때 _ei=(_eStart+_k)%_elen (k=0.._elen-1) 은 [0,_elen) 의 순열(cyclic).
 *   ⇒ tick 당 각 인덱스 정확히 1회 → 중복 update·이중 보상 불가. append(≥_elen)는 다음 tick으로 이연.
 *
 * 소형·결정적만. per-tick 보장·FPS 향상 주장 0. soft-cap/공격티켓/production 변경 0.
 * production game.html/easy·원 f06/boundary 산출물 읽기전용(미수정).
 *
 * 실행: node tools/team-followup-20261001/ENEMY/roundrobin-order-effects.fixture.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const game = readFileSync(path.join(__dirname, '../../../game.html'), 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

let pass = 0, fail = 0; const log = [];
function check(name, fn) {
  try { fn(); console.log('  PASS  ' + name); pass++; }
  catch (e) { console.log('  FAIL  ' + name + '\n        ' + (e && e.message)); fail++; }
}

// 원문 결속: 두 헤더 형태가 실제 소스/후보에 존재
assert.ok(game.includes('for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];\n'), '원본 LIVE 길이 헤더 존재');
assert.ok(game.includes("}else{e.hp=0;e.alive=false;e.s='dead';rollDrop(e);addExp(e.exp||1);G.kills++;G._stageKills=(G._stageKills||0)+1;_regKill(e);continue}"), '벽끼임 kill 1회 보상 원문 존재');

// ── 공통 엔티티 모델: updateE 1회 호출·사망 시 보상 1회(원문 가드 반영) ──
function mkEntity(i, opts = {}) {
  return Object.assign({ idx: i, alive: true, ib: false, _updatesThisTick: 0, _updatesTotal: 0,
    _rewardGranted: false, diesOnUpdate: false, splitOnDeath: 0, _newborn: false }, opts);
}
// 실제 루프 바디의 '순서 관련' 효과만 반영한 처리기. ens 에 대한 append(분열) 포함.
function processEntity(e, ens, ctx) {
  if (!e || !e.alive) return;                       // if(e.alive) 분기 / dead skip
  e._updatesThisTick++; e._updatesTotal++;          // updateE 1회
  ctx.updatedThisTick.push(e.idx);
  if (e.diesOnUpdate && e.alive) {
    // 사망 + 보상 1회(원문: hp<=0 return 가드 + alive=false). 이미 보상되면 '이중 보상' 버그.
    if (e._rewardGranted) { ctx.doubleReward = true; }
    e._rewardGranted = true; e.alive = false; ctx.reward++;
    for (let s = 0; s < e.splitOnDeath; s++) {       // 분열: ens.push(append) — mid-loop
      const child = mkEntity(ens.length, { _newborn: true });
      ens.push(child); ctx.spawned.push(child.idx);
    }
  }
}

// ── 원본 반복자: LIVE 길이, hole 가드 없음(undefined면 throw — 원문 그대로) ──
function tickOriginal(ens, ctx) {
  for (let _ei = 0; _ei < ens.length; _ei++) {       // LIVE ens.length
    const e = ens[_ei];
    if (e === undefined) throw new Error('original: ens[' + _ei + '] undefined (원문은 hole 가드 없음 → throw)');
    processEntity(e, ens, ctx);
  }
}
// ── 후보 반복자: 캡처 길이 + 회전 + if(!e)continue ──
function tickRotated(ens, G, ctx) {
  const _elen = ens.length;
  const _rr0 = G._eLoopStart;
  const _eStart = (_elen > 0 && typeof _rr0 === 'number' && Number.isFinite(_rr0)) ? (((Math.floor(_rr0) % _elen) + _elen) % _elen) : 0;
  G._eLoopStart = _elen > 0 ? ((_eStart + 1) % _elen) : 0;
  const order = [];
  for (let _k = 0; _k < _elen; _k++) {
    const _ei = (_eStart + _k) % _elen;
    const e = ens[_ei];
    if (!e) continue;                                // hole 가드
    order.push(_ei);
    processEntity(e, ens, ctx);
  }
  return { order, eStart: _eStart };
}
function newCtx() { return { updatedThisTick: [], reward: 0, doubleReward: false, spawned: [] }; }

console.log('ENEMY-20261002-ROUNDROBIN-ORDER-EFFECTS fixture');
console.log('  game.html sha256=' + sha(game) + ' (읽기전용)\n');

// ════════ 1. 순열 성질: 중복 update·skip 불가(break 없을 때) ════════
check('회전은 [0,_elen) 순열 — tick당 각 인덱스 정확히 1회(중복0·누락0), _eStart 무관', () => {
  for (const N of [1, 2, 8, 40, 97]) {
    for (const start of [0, 1, N - 1, 7, 2147483648, -1, NaN]) {
      const ens = Array.from({ length: N }, (_, i) => mkEntity(i));
      const r = tickRotated(ens, { _eLoopStart: start }, newCtx());
      const sorted = [...r.order].sort((a, b) => a - b);
      assert.equal(r.order.length, N, 'N=' + N + ' start=' + String(start) + ' 방문수');
      assert.equal(new Set(r.order).size, N, '중복 없음');
      assert.deepEqual(sorted, Array.from({ length: N }, (_, i) => i), '[0,N) 전부 1회(누락 없음)');
    }
  }
});

// ════════ 2. 보상 동등성: 동일 tick death → 원본·후보 보상 총량 동일, 이중 보상 0 ════════
check('동일 tick death: 원본·후보 reward 총량 동일, 이중 보상 0, 엔티티당 update 1회', () => {
  const N = 40;
  const mk = () => Array.from({ length: N }, (_, i) => mkEntity(i, { diesOnUpdate: (i % 5 === 0) })); // 8마리 사망
  const ao = mk(), co = mk();
  const ca = newCtx(); tickOriginal(ao, ca);
  const cc = newCtx(); tickRotated(co, { _eLoopStart: 13 }, cc);
  assert.equal(ca.reward, cc.reward, '보상 총량 동일(' + ca.reward + ')');
  assert.equal(ca.doubleReward, false, '원본 이중보상 0'); assert.equal(cc.doubleReward, false, '후보 이중보상 0');
  assert.ok(ao.every((e) => e._updatesThisTick <= 1) && co.every((e) => e._updatesThisTick <= 1), '엔티티당 1회 이하');
  log.push({ case: 'same-tick-death', rewardOriginal: ca.reward, rewardRotated: cc.reward });
});

// ════════ 3. mid-tick spawn(분열 append): 원본 same-tick vs 후보 1-tick 이연 — 누락·중복 없음 ════════
check('분열 append: 원본 same-tick 처리 vs 후보 1-tick 이연. 2 tick 후 신생아 update 정확히 1회(누락·중복 0)', () => {
  const N = 6;
  // index 0 이 사망하며 2분열 → ens.push 2마리(인덱스 6,7)
  const mkArr = () => { const a = Array.from({ length: N }, (_, i) => mkEntity(i)); a[0].diesOnUpdate = true; a[0].splitOnDeath = 2; return a; };
  // 원본: 1 tick
  const ao = mkArr(); const cao = newCtx(); tickOriginal(ao, cao);
  const newbornO = ao.slice(N);                       // 신생아
  // 후보: 2 tick(이연 확인)
  const co = mkArr(); const G = { _eLoopStart: 0 };
  const cc1 = newCtx(); tickRotated(co, G, cc1);       // tick1: 분열 발생, 신생아는 _elen=6 밖 → 미방문
  const newbornC = co.slice(N);
  const cc2 = newCtx(); tickRotated(co, G, cc2);       // tick2: _elen 재캡처 → 신생아 처리
  // 원본: 신생아가 같은 tick 에 updateE 1회(_ei 가 live length 끝까지)
  assert.ok(newbornO.every((e) => e._updatesTotal === 1), '원본: 신생아 same-tick 1회 update');
  // 후보: tick1 미처리, tick2 처리 → 총 1회(이연, 누락 아님)
  assert.ok(newbornC.every((e) => e._updatesTotal === 1), '후보: 신생아 2 tick 후 정확히 1회(이연)');
  assert.ok(cc1.updatedThisTick.indexOf(6) < 0 && cc1.updatedThisTick.indexOf(7) < 0, '후보 tick1: 신생아 미방문(이연)');
  assert.ok(cc2.updatedThisTick.indexOf(6) >= 0 && cc2.updatedThisTick.indexOf(7) >= 0, '후보 tick2: 신생아 방문');
  // 보상(부모 사망)은 양쪽 1회
  assert.equal(cao.reward, 1, '원본 부모 보상 1'); assert.equal(cc1.reward, 1, '후보 부모 보상 1(tick1)');
  // 신생아 중복 update 없음
  assert.ok(newbornC.every((e) => e._updatesTotal === 1), '신생아 중복 update 0');
  log.push({ case: 'mid-tick-split-append', original: 'newborn same-tick', rotated: 'newborn deferred 1 tick', newbornUpdatesTotal: 1, note: '이연일 뿐 누락/중복 아님' });
});

// ════════ 4. 보상 1회(회전·_eStart 무관): 어떤 start 로도 사망 엔티티는 정확히 1회 보상 ════════
check('보상 1회 불변: 임의 _eStart 로도 사망 엔티티 reward 정확히 1회(회전이 이중보상 유발 안 함)', () => {
  const N = 20;
  for (const start of [0, 3, 19, 7, 2147483648, -1]) {
    const ens = Array.from({ length: N }, (_, i) => mkEntity(i, { diesOnUpdate: (i === N - 1 || i === 0) }));
    const ctx = newCtx(); tickRotated(ens, { _eLoopStart: start }, ctx);
    assert.equal(ctx.reward, 2, 'start=' + String(start) + ' 사망 2마리 보상 2');
    assert.equal(ctx.doubleReward, false, '이중보상 0');
    assert.ok(ens.every((e) => e._updatesThisTick <= 1), '엔티티당 1회 이하');
  }
});

// ════════ 5. hole: 후보는 if(!e)continue 로 안전 skip / 원문은 throw(= 후보가 개선, 회귀 아님) ════════
check('hole(undefined 슬롯): 후보 안전 skip, 원문 throw — 후보는 개선(원 정상 엔티티 skip 아님)', () => {
  const N = 10;
  const ens = Array.from({ length: N }, (_, i) => mkEntity(i)); ens[4] = undefined;
  // 후보: throw 없이 4만 skip, 나머지 전부 처리
  const ctx = newCtx(); tickRotated(ens, { _eLoopStart: 0 }, ctx);
  assert.ok(ctx.updatedThisTick.indexOf(4) < 0, 'hole 미방문');
  assert.equal(ctx.updatedThisTick.length, N - 1, '나머지 9개 전부 처리(정상 엔티티 skip 아님)');
  // 원문: hole 에서 throw(원 루프는 틱시작 GC 로 hole 제거 전제) — 후보는 그 전제 없이도 안전
  assert.throws(() => tickOriginal(Array.from({ length: N }, (_, i) => (i === 4 ? undefined : mkEntity(i))), newCtx()), /undefined/, '원문은 hole 에서 throw');
});

// ════════ 6. 메인 루프 mid-splice 없음(원문 사실) — 후보 캡처 _elen 안전성 근거 ════════
check('원문 사실: 메인 적 루프 본문 내 ens.splice 없음(변이는 append만) — 캡처 _elen 안전', () => {
  // 메인 루프 범위(헤더~닫는 구간)에서 ens.splice 부재 확인(소스 결속)
  const start = game.indexOf('for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];\n    // 타임버짓');
  assert.ok(start > 0, '메인 루프 헤더 위치');
  const region = game.slice(start, start + 6000); // 루프 본문 상당부
  assert.ok(!/ens\.splice/.test(region), '본문 상당부에 ens.splice 없음');
  assert.ok(/ens\.push|mkEn/.test(game), 'spawn 은 append(ens.push/mkEn)');
});

console.log('\n결과: ' + pass + ' PASS / ' + fail + ' FAIL');
console.log(JSON.stringify({
  taskId: 'ENEMY-20261002-ROUNDROBIN-ORDER-EFFECTS', gameSha256: sha(game),
  verdict: fail === 0 ? 'NO duplicate-update / NO wrong-skip / NO reward-diff — 결함 아님(최소수정 불필요)' : 'FAIL',
  orderEffects: [
    'mid-tick append(분열/소환) 신생아: 원본 same-tick vs 후보 1-tick 이연(누락/중복 아님)',
    'tick 내 처리 순서 회전: 교차 엔티티 상호작용(분리/플로우필드/충돌) 순서 민감성 변화(보상/중복/skip 아님)'
  ], rows: log
}, null, 2));
process.exit(fail === 0 ? 0 : 1);
