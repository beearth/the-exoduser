/* ============================================================================
 * SKILL-20261002-AIM-RESOURCE-NEXT — thunderStake(뇌전창) 확정 경계 RED→patch→GREEN
 *   실행: node tools/team-followup-20261001/SKILL/aim-resource-next-gate.test.mjs
 *
 * SKILL03 다음 승인검수('조준-확정 후 자원 변화 재검사 없는 스킬')에서 _ms/_mm/_ts 중
 * thunderStake를 선정. game.html / game-easy-test.html 실제 `if(P._tsAiming)` 확정
 * 블록을 원문 그대로 추출(읽기 전용) → 조준 시작 후 MP<50·스택0 재검사 부재로 무료
 * 설치되는 결함을 RED로 재현 → 최소 게이트 patch를 메모리 적용해 GREEN 확인.
 *
 * SSOT(2_1:1321-1337): MP50/개, 5스택(720f 충전, Lv10→6), 지속 600+(Lv-1)×30f.
 * 새 비용·효과 없음. 성공은 기존 행동/비용 유지. 취소·패드(MBjust[0]) 공통경로 불변.
 * 이미 수정된 iceStorm/fireBoneWall/hellRay와 중복 아님. 생산 적용은 root.
 * ========================================================================= */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
const FILES = ['game.html', 'game-easy-test.html'];
const START = '// ═══ 뇌전창 — 조준 모드';
const END = '// ═══ 레인라이트닝 — 전류 폭파';

// 확정 블록만 추출(업데이트 루프의 조준 확정; draw 블록 아님)
function extractBlock(source) {
  const cs = source.indexOf(START);
  assert.ok(cs >= 0, '뇌전창 조준 모드 주석 못 찾음');
  const bs = source.indexOf('if(P._tsAiming){', cs);
  assert.ok(bs > cs, '확정 블록 시작 못 찾음');
  const be = source.indexOf(END, bs);
  assert.ok(be > bs, '블록 끝 못 찾음');
  return source.slice(bs, be);
}

// 최소 미적용 patch(메모리): 확정 본문을 스택0/MP<50 게이트로 감싼다.
//   anchor1: MBjust[0]=false; 뒤에 가드2 + else{ 삽입
//   anchor2: P._tsAiming=false; 성공 라인 뒤에 else 닫는 } 삽입
//   (MP50/스택1 비용·설치·SFX·숙련은 그대로 — 새 비용/효과 없음)
const GUARD = "\n      if((P._tsStk||0)<=0){P._tsAiming=false;showPH(_T('충전 중...'),'#ff8844')}\n"
  + "      else if(P.mp<50){showPH(_T('MP 부족! (50)'),'#4488ff')}\n"
  + "      else{";
function applyGate(block) {
  assert.equal((block.match(/      MBjust\[0\]=false;\n/g) || []).length, 1, 'anchor1 유일');
  assert.equal((block.match(/      P\._tsAiming=false;\n    \}/g) || []).length, 1, 'anchor2 유일');
  const patched = block
    .replace('      MBjust[0]=false;\n', '      MBjust[0]=false;' + GUARD + '\n')
    .replace('      P._tsAiming=false;\n    }', '      P._tsAiming=false;}\n    }');
  assert.notEqual(patched, block, 'patch가 블록을 바꿔야 함');
  return patched;
}

function run(block, opts) {
  const o = Object.assign({ mp: 50, stk: 1, click: true, cancel: false, escape: false, tsLv: 1, aim: true, rech: 0 }, opts);
  const calls = { sfx: 0, playSample: 0, addTxt: 0, prof: 0, shake: 0, showPH: [] };
  const P = { x: 0, y: 0, mp: o.mp, skills: { thunderStake: o.tsLv }, _tsStk: o.stk, _tsRech: o.rech, _tsAiming: o.aim };
  const G = { cam: { x: 0, y: 0 }, _thunderStakes: [] };
  const args = {
    P, G, mouse: { x: 0, y: 0 }, VW: 0, VH: 0, dst: Math.hypot, sp: 1,
    MBjust: [o.click, false, o.cancel], K: o.escape ? { Escape: true } : {},
    magicRef: () => 1, statInt: () => 1, pMagicMul: () => 1, _skMul: () => 1, _fuseMul: () => 1,
    _addSkProf: () => { calls.prof++; }, SFX: { magic: () => { calls.sfx++; } },
    playSample: () => { calls.playSample++; }, addTxt: () => { calls.addTxt++; }, shake: () => { calls.shake++; },
    _T: (x) => x, showPH: (m) => { calls.showPH.push(m); }, EL: { L: 3 },
  };
  // eslint-disable-next-line no-new-func
  new Function(...Object.keys(args), block)(...Object.values(args));
  return { mp: P.mp, stk: P._tsStk, aim: P._tsAiming, rech: P._tsRech, zones: G._thunderStakes.length, calls };
}
const sideEffectFree = (r) => r.zones === 0 && r.calls.sfx === 0 && r.calls.playSample === 0 && r.calls.addTxt === 0 && r.calls.prof === 0 && r.calls.shake === 0;

let pass = 0, fail = 0; const fails = [];
function check(name, fn) { try { fn(); pass++; } catch (e) { fail++; fails.push(name + ' :: ' + (e && e.message || e)); console.error('  ✗ ' + name + '\n    ' + (e && e.message || e)); } }

const blocks = {};
for (const file of FILES) blocks[file] = extractBlock(readFileSync(path.join(repoRoot, file), 'utf8'));

check('양쪽 원블록 동일(한 patch로 커버)', () => assert.equal(blocks['game.html'], blocks['game-easy-test.html']));

for (const file of FILES) {
  const orig = blocks[file];
  const patched = applyGate(orig);

  /* RED: 원블록이 조준 후 자원 재검사 없이 설치 */
  check(file + ' RED: MP50/스택1 정상 설치(기준)', () => {
    const r = run(orig, { mp: 50, stk: 1 });
    assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [0, 0, 1, false]);
  });
  check(file + ' RED: MP49에서도 설치·MP 전소(0)·zone1 [결함]', () => {
    const r = run(orig, { mp: 49, stk: 1 });
    assert.equal(r.mp, 0); assert.equal(r.zones, 1); assert.equal(r.aim, false);
  });
  check(file + ' RED: 스택0에서도 설치·zone1 [결함]', () => {
    const r = run(orig, { mp: 50, stk: 0 });
    assert.equal(r.zones, 1); assert.equal(r.aim, false); // 무료 설치(스택 미보유)
  });

  /* GREEN: 게이트 patch 적용 */
  check(file + ' GREEN: MP50/스택1 성공은 기존 행동/비용 유지', () => {
    const r = run(patched, { mp: 50, stk: 1 });
    assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [0, 0, 1, false]);
    assert.equal(r.calls.prof, 1); assert.equal(r.calls.sfx, 1); assert.equal(r.rech, 720);
  });
  check(file + ' GREEN: 정확 MP50 차감(100/스택2 → 50)', () => {
    const r = run(patched, { mp: 100, stk: 2 });
    assert.equal(r.mp, 50); assert.equal(r.stk, 1);
  });
  check(file + ' GREEN: MP49 → 조준 유지·무차감·무설치·부작용0', () => {
    const r = run(patched, { mp: 49, stk: 1 });
    assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [49, 1, 0, true]);
    assert.ok(sideEffectFree(r));
    assert.ok(r.calls.showPH.some((m) => m.includes('50')), 'MP 부족 안내');
  });
  check(file + ' GREEN: 스택0 → 조준 종료·무차감·무설치·부작용0', () => {
    const r = run(patched, { mp: 50, stk: 0 });
    assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [50, 0, 0, false]);
    assert.ok(sideEffectFree(r));
    assert.ok(r.calls.showPH.some((m) => m.includes('충전 중')), '충전 중 안내');
  });
  check(file + ' GREEN: 취소(RMB) 우선 — 클릭 동시에도 무설치', () => {
    const r = run(patched, { mp: 50, stk: 1, click: true, cancel: true });
    assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [50, 1, 0, false]);
    assert.ok(sideEffectFree(r));
  });
  check(file + ' GREEN: Escape 취소 우선', () => {
    const r = run(patched, { mp: 50, stk: 1, click: false, escape: true });
    assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [50, 1, 0, false]);
    assert.ok(sideEffectFree(r));
  });
  check(file + ' GREEN: 패드 공통경로(MBjust[0]) 동일 게이트 — MP49 무설치', () => {
    // 패드 확정도 gamepad 핸들러가 MBjust[0]을 세팅하는 동일 경로 → 가드 공유
    const r = run(patched, { mp: 49, stk: 1, click: true });
    assert.equal(r.zones, 0); assert.equal(r.aim, true);
  });
  check(file + ' GREEN: 성공 1회 — 재확정(조준 off)은 재설치/재차감 없음', () => {
    const r2 = run(patched, { mp: 0, stk: 0, aim: false, click: true });
    assert.equal(r2.zones, 0); assert.equal(r2.mp, 0); assert.equal(r2.stk, 0);
  });
}

console.log(`\nthunderStake 확정 경계: ${pass} PASS / ${fail} FAIL`);
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
