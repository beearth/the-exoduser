/* ============================================================================
 * SKILL-20261002-HELLRAY-CONFIRM-GATE — hellRay 확정 경계 RED→patch→GREEN
 *   실행: node tools/team-followup-20261001/SKILL/hellray-confirm-gate.test.mjs
 *
 * 승인 SKILL03 '다른 조준-확정 스킬 자원 변경 재검사' 중 hellRay 건.
 * game.html / game-easy-test.html 의 실제 `if(P._hrAiming)` 좌클릭 확정 블록을
 * 원문 그대로 추출해 실행한다(읽기 전용). 확정에서 조준 시작 이후 MP<100·스택0
 * 재검사가 없어 MP99에서 mp 음수, 스택0에서 stk 음수로 설치되는 결함을 RED로
 * 재현하고, 최소 게이트 patch를 메모리에서 적용해 GREEN을 확인한다.
 *
 * SSOT(2_1:408): MP100 / 스택1(elecRepent 합체 2~3) / 600f 충전 / 범위 200+(Lv-1)×22.
 * 새 비용·효과·환급·리젠·보호 설계를 만들지 않는다. 성공 경로는 기존 행동/비용 유지.
 * game/easy 생산 적용은 root가 별도로 한다(본 테스트는 메모리 전용).
 * ========================================================================= */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
const FILES = ['game.html', 'game-easy-test.html'];
// root 인수 후에도 RED 증거는 고정 before에서 재현한다.
// 실제 현재 게임의 회귀는 test/hellRayConfirmGate.test.js가 검사한다.
const acceptedBefore = JSON.parse(readFileSync(path.join(repoRoot, 'tools/team-followup-20261001/root-review/hellray-before-20261002.json'), 'utf8'));

// ── 실제 블록 추출: 첫 `  if(P._hrAiming){`(업데이트 확정 블록) ~ 해골번개 쿨다운 주석 ──
function extractBlock(source) {
  const start = source.search(/^ {2}if\(P\._hrAiming\)\{\r?$/m);
  assert.ok(start >= 0, 'hellRay 확정 블록 시작 못 찾음');
  const end = source.indexOf('// ═══ 해골번개 쿨다운', start);
  assert.ok(end > start, 'hellRay 블록 끝(해골번개 쿨다운) 못 찾음');
  return source.slice(start, end);
}

// ── 최소 미적용 patch(메모리): 확정 본문을 스택0/ MP<100 게이트로 감싼다 ──
//   anchor1: MBjust[0]=false; 뒤에 가드 2개 + else{ 삽입
//   anchor2: 마지막 shake(...); 뒤에 else 닫는 } 삽입
//   (P.mp-=100 등 기존 비용/행동/합체 branch는 그대로 — 새 비용/효과 없음)
const GUARD = "\n      if((P._hrStk||0)<=0){P._hrAiming=false;showPH(_T('충전 중...'),'#ffd700')}\n"
  + "      else if(P.mp<100){showPH(_T('MP 부족! (100)'),'#4488ff')}\n"
  + "      else{";
function applyGate(block) {
  assert.equal((block.match(/      MBjust\[0\]=false;\n/g) || []).length, 1, 'anchor1 유일성');
  assert.equal((block.match(/shake\(_hrElec\?10:6\);/g) || []).length, 1, 'anchor2 유일성');
  const patched = block
    .replace('      MBjust[0]=false;\n', '      MBjust[0]=false;' + GUARD + '\n')
    .replace('shake(_hrElec?10:6);', 'shake(_hrElec?10:6);}');
  assert.notEqual(patched, block, 'patch가 블록을 바꿔야 함');
  return patched;
}

// ── 사이드이펙트 계수 하니스 ───────────────────────────────────────────────
function run(block, opts) {
  const o = Object.assign({ mp: 100, stk: 1, elec: false, click: true, cancel: false, escape: false, hrLv: 1, msLv: 1 }, opts);
  const calls = { sfx: 0, playSample: 0, addTxt: 0, prof: 0, rng: 0, shake: 0, showPH: [] };
  const P = { x: 0, y: 0, mp: o.mp, skills: { hellRay: o.hrLv, maliceStorm: o.msLv }, _hrStk: o.stk, _hrRech: 0, _hrAiming: true };
  const G = { cam: { x: 0, y: 0 }, _fireZones: [] };
  const args = {
    P, G, mouse: { x: 0, y: 0 }, VW: 0, VH: 0, dst: Math.hypot, sp: 1,
    MBjust: [o.click, false, o.cancel], K: o.escape ? { Escape: true } : {},
    _isFused: (n) => o.elec && n === 'elecRepent',
    magicRef: () => 1, statInt: () => 1, pMagicMul: () => 1, pBeamMul: () => 1, _skMul: () => 1, _fuseMul: () => 1,
    _addSkProf: () => { calls.prof++; }, SFX: { magic: () => { calls.sfx++; } },
    playSample: () => { calls.playSample++; }, _r: (a) => { calls.rng++; return a; },
    addTxt: () => { calls.addTxt++; }, shake: () => { calls.shake++; },
    _T: (x) => x, showPH: (m) => { calls.showPH.push(m); }, EL: { L: 3 },
  };
  // eslint-disable-next-line no-new-func
  const fn = new Function(...Object.keys(args), block);
  fn(...Object.values(args));
  const zones = G._fireZones;
  return {
    mp: P.mp, stk: P._hrStk, aim: P._hrAiming, rech: P._hrRech,
    zones: zones.length,
    hr: zones.filter((z) => z.type === 'hellRay').length,
    storm: zones.filter((z) => z.type === 'storm').length,
    hrEl: (zones.find((z) => z.type === 'hellRay') || {}).el,
    calls,
  };
}
const sideEffectFree = (r) => r.zones === 0 && r.calls.sfx === 0 && r.calls.playSample === 0 && r.calls.addTxt === 0 && r.calls.prof === 0 && r.calls.rng === 0 && r.calls.shake === 0;

let pass = 0, fail = 0; const fails = [];
function check(name, fn) { try { fn(); pass++; } catch (e) { fail++; fails.push(name + ' :: ' + (e && e.message || e)); console.error('  ✗ ' + name + '\n    ' + (e && e.message || e)); } }

const blocks = {};
for (const file of FILES) blocks[file] = acceptedBefore.files[file].block;

check('양쪽 원블록 동일(한 patch로 커버)', () => {
  assert.equal(blocks['game.html'], blocks['game-easy-test.html']);
});

for (const file of FILES) {
  const orig = blocks[file];
  const patched = applyGate(orig);

  /* ── RED: 원블록이 조준 이후 자원 변경 재검사 없이 설치(결함) ── */
  check(file + ' RED: MP100/스택1 정상 설치(기준)', () => {
    const r = run(orig, { mp: 100, stk: 1 });
    assert.deepEqual([r.mp, r.stk, r.hr, r.aim], [0, 0, 1, false]);
  });
  check(file + ' RED: MP99에서도 설치되어 mp 음수(-1)·zone1 [결함]', () => {
    const r = run(orig, { mp: 99, stk: 1 });
    assert.equal(r.mp, -1); assert.equal(r.hr, 1); assert.equal(r.aim, false);
  });
  check(file + ' RED: 스택0에서도 설치되어 stk 음수(-1)·zone1 [결함]', () => {
    const r = run(orig, { mp: 100, stk: 0 });
    assert.equal(r.stk, -1); assert.equal(r.hr, 1); assert.equal(r.mp, 0);
  });

  /* ── GREEN: 게이트 patch 적용 후 ── */
  check(file + ' GREEN: MP100/스택1 성공은 기존 행동/비용 유지', () => {
    const r = run(patched, { mp: 100, stk: 1 });
    assert.deepEqual([r.mp, r.stk, r.hr, r.aim], [0, 0, 1, false]);
    assert.equal(r.calls.prof, 1); assert.equal(r.calls.sfx, 1); assert.ok(r.calls.playSample >= 1);
    assert.equal(r.rech, 600); // 스택 소진 후 리젠 시작(기존 동작 보존)
  });
  check(file + ' GREEN: 정확 MP100 차감(150→50)', () => {
    assert.equal(run(patched, { mp: 150, stk: 1 }).mp, 50);
  });
  check(file + ' GREEN: MP99 → 조준 유지·무차감·무설치·부작용0', () => {
    const r = run(patched, { mp: 99, stk: 1 });
    assert.deepEqual([r.mp, r.stk, r.hr, r.aim], [99, 1, 0, true]);
    assert.ok(sideEffectFree(r), 'MP부족은 자원/장판/숙련/RNG/음향 0');
    assert.ok(r.calls.showPH.some((m) => m.includes('100')), 'MP 부족 안내');
  });
  check(file + ' GREEN: 스택0 → 조준 종료·무차감·무설치·부작용0', () => {
    const r = run(patched, { mp: 100, stk: 0 });
    assert.deepEqual([r.mp, r.stk, r.hr, r.aim], [100, 0, 0, false]);
    assert.ok(sideEffectFree(r));
    assert.ok(r.calls.showPH.some((m) => m.includes('충전 중')), '충전 중 안내');
  });
  check(file + ' GREEN: 취소(RMB) 우선 — 클릭 동시에도 무설치', () => {
    const r = run(patched, { mp: 100, stk: 1, click: true, cancel: true });
    assert.deepEqual([r.mp, r.stk, r.hr, r.aim], [100, 1, 0, false]);
    assert.ok(sideEffectFree(r));
  });
  check(file + ' GREEN: Escape 취소 우선', () => {
    const r = run(patched, { mp: 100, stk: 1, click: false, escape: true });
    assert.deepEqual([r.mp, r.stk, r.hr, r.aim], [100, 1, 0, false]);
    assert.ok(sideEffectFree(r));
  });
  check(file + ' GREEN: 성공 1회 — 재실행(조준 off)은 재설치/재차감 없음', () => {
    const r1 = run(patched, { mp: 100, stk: 1 });
    assert.equal(r1.hr, 1);
    // 설치 직후 aim=false, MBjust[0] 소비됨 → 같은 클릭으로 두 번째 블록 재진입해도 무동작
    const o2 = Object.assign({ mp: r1.mp, stk: r1.stk, elec: false, click: true, cancel: false, escape: false, hrLv: 1, msLv: 1 });
    const P = { x: 0, y: 0, mp: o2.mp, skills: { hellRay: 1, maliceStorm: 1 }, _hrStk: o2.stk, _hrRech: 0, _hrAiming: false };
    const G = { cam: { x: 0, y: 0 }, _fireZones: [] };
    const args = { P, G, mouse: { x: 0, y: 0 }, VW: 0, VH: 0, dst: Math.hypot, sp: 1, MBjust: [true, false, false], K: {}, _isFused: () => false, magicRef: () => 1, statInt: () => 1, pMagicMul: () => 1, pBeamMul: () => 1, _skMul: () => 1, _fuseMul: () => 1, _addSkProf: () => {}, SFX: { magic: () => {} }, playSample: () => {}, _r: (a) => a, addTxt: () => {}, shake: () => {}, _T: (x) => x, showPH: () => {}, EL: { L: 3 } };
    new Function(...Object.keys(args), patched)(...Object.values(args));
    assert.equal(G._fireZones.length, 0, '조준 off면 재설치 없음');
    assert.equal(P.mp, 0); assert.equal(P._hrStk, 0);
  });
  check(file + ' GREEN: 합체(elecRepent) 성공은 hellRay+storm 두 장판 보존', () => {
    const r = run(patched, { mp: 100, stk: 1, elec: true });
    assert.equal(r.hr, 1); assert.equal(r.storm, 1); assert.equal(r.zones, 2);
    assert.equal(r.hrEl, 3); // EL.L (전기)
    assert.equal(r.mp, 0); assert.equal(r.stk, 0);
    assert.ok(r.calls.playSample >= 2); // 참회 + 전기폭풍
  });
  check(file + ' GREEN: 합체 실패(MP99)는 storm 장판도 생성 안 함(합체 branch 보존)', () => {
    const r = run(patched, { mp: 99, stk: 1, elec: true });
    assert.equal(r.zones, 0); assert.equal(r.aim, true);
    assert.ok(sideEffectFree(r));
  });
}

console.log(`\nhellRay 확정 경계: ${pass} PASS / ${fail} FAIL`);
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
