/* ============================================================================
 * SKILL-mortar-confirm-source — fireMaliceMortar 조준-확정 MP 재검사 RED→patch→GREEN
 *   실행: node tools/team-followup-20261001/SKILL/mortar-confirm-source.test.mjs
 *
 * SKILL03 '조준-확정 후 자원 변경 재검사' 조사: maliceMortar.
 *   aim-start(game.html:12444)은 MP>=mpCost('mortar')(50) && _mmCd<=0을 요구하지만,
 *   확정(35209-35215)은 재검사 없이 fireMaliceMortar()를 호출하고, 그 함수(43757-)는
 *   useMp('mortar')로 클램프 차감 후 조건 없이 발사한다. _mmAiming은 공격/스킬 조준차단
 *   목록(31756)에 없어 멀티프레임 홀드-충전 중 MP가 50 미만으로 떨어질 수 있다 →
 *   확정 시 MP<50이어도 무료 발사(실제 결함). fireBoneWall(43776-)은 내부 게이트가 있는 것과 대비.
 *
 * 실제 함수를 원문 그대로 추출(읽기 전용)해 RED 재현 → 최소 MP 재검사 patch로 GREEN.
 * SSOT(2_1:227): 쿨 11초(660f)=_mmCd, 스택/악의 비용 없음, MP 50(game.html:30709).
 * 새 비용·쿨다운·보호설계 변경 없음. 성공 경로 불변. 생산 적용은 root.
 * ========================================================================= */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
const FILES = ['game.html', 'game-easy-test.html'];

function extractFn(source) {
  const b = source.indexOf('function fireMaliceMortar(');
  assert.ok(b >= 0, 'fireMaliceMortar 못 찾음');
  const e = source.indexOf('\n}', b) + 2;
  assert.ok(e > b, '함수 끝 못 찾음');
  return source.slice(b, e);
}

// 최소 미적용 patch(메모리): 함수 진입에서 MP 재검사. 부족 시 발사/차감 없이 return(조준 유지).
// _mmAiming=false·useMp·발사·_mmCd는 성공 시에만(기존 그대로). 새 비용/쿨/설계 없음.
const GUARD = "\n  if(P.mp<mpCost('mortar')){showPH(_T('MP 부족!'),'#4488ff');return}";
function applyGate(fn) {
  const anchor = 'function fireMaliceMortar(_tx,_ty){\n  P._mmAiming=false;';
  assert.ok(fn.indexOf(anchor) === 0, 'anchor(함수 머리) 일치');
  const patched = fn.replace('function fireMaliceMortar(_tx,_ty){', 'function fireMaliceMortar(_tx,_ty){' + GUARD);
  assert.notEqual(patched, fn);
  return patched;
}

function run(fnSrc, opts) {
  const o = Object.assign({ mp: 50, mmSlv: 1, iceOrb: 0, fuse: false, mmCd: 0, ioCd: 0, aim: true }, opts);
  const calls = { sfx: 0, playSample: 0, shake: 0, showPH: [] };
  const P = { x: 0, y: 0, facing: 0, mp: o.mp, skills: { maliceMortar: o.mmSlv, iceOrb: o.iceOrb }, _mmAiming: o.aim, _mmDist: 150, _mmCd: o.mmCd, _ioCd: o.ioCd };
  const G = {};
  const args = {
    P, G,
    mpCost: (k) => (k === 'mortar' ? 50 : 0),
    useMp: (k) => { const c = (k === 'mortar' ? 50 : 0); const b = P.mp; P.mp = Math.max(0, P.mp - c); return b - P.mp; },
    _isFused: (n) => o.fuse && n === 'iceMortar',
    SFX: { magic: () => { calls.sfx++; } }, EL: { I: 1, D: 2 },
    playSample: () => { calls.playSample++; }, _r: (a) => a, shake: () => { calls.shake++; },
    showPH: (m) => { calls.showPH.push(m); }, _T: (x) => x,
  };
  // eslint-disable-next-line no-new-func
  const fire = new Function(...Object.keys(args), fnSrc + ';return fireMaliceMortar;')(...Object.values(args));
  fire(100, 50); // target coords
  return { mp: P.mp, aim: P._mmAiming, mmCd: P._mmCd, ioCd: P._ioCd, bomb: !!G._mmBomb, bombIce: G._mmBomb ? !!G._mmBomb.iceFuse : null, calls };
}
const noFire = (r) => r.bomb === false && r.calls.sfx === 0 && r.calls.playSample === 0 && r.calls.shake === 0;

let pass = 0, fail = 0; const fails = [];
function check(name, fn) { try { fn(); pass++; } catch (e) { fail++; fails.push(name + ' :: ' + (e && e.message || e)); console.error('  ✗ ' + name + '\n    ' + (e && e.message || e)); } }

const fns = {};
for (const f of FILES) fns[f] = extractFn(readFileSync(path.join(repoRoot, f), 'utf8'));
check('양쪽 원함수 동일(한 patch로 커버)', () => assert.equal(fns['game.html'], fns['game-easy-test.html']));

for (const file of FILES) {
  const orig = fns[file];
  const patched = applyGate(orig);

  /* RED: 원함수가 MP<50에서도 무료 발사 */
  check(file + ' RED: MP50 정상 발사(기준)', () => {
    const r = run(orig, { mp: 50 });
    assert.equal(r.bomb, true); assert.equal(r.mp, 0); assert.equal(r.mmCd, 660); assert.equal(r.aim, false);
  });
  check(file + ' RED: MP30에서도 발사·MP 전소(0) [결함]', () => {
    const r = run(orig, { mp: 30 });
    assert.equal(r.bomb, true); assert.equal(r.mp, 0); assert.equal(r.mmCd, 660); // 무료 발사 + 쿨 소모
  });

  /* GREEN: MP 재검사 patch */
  check(file + ' GREEN: MP50 성공은 기존 행동/비용 유지', () => {
    const r = run(patched, { mp: 50 });
    assert.equal(r.bomb, true); assert.equal(r.mp, 0); assert.equal(r.mmCd, 660); assert.equal(r.aim, false);
    assert.equal(r.calls.sfx, 1); assert.ok(r.calls.playSample >= 1);
  });
  check(file + ' GREEN: 정확 MP50 차감(80→30)', () => {
    assert.equal(run(patched, { mp: 80 }).mp, 30);
  });
  check(file + ' GREEN: MP49 → 발사·차감 없음·조준 유지·쿨 불변·부작용0', () => {
    const r = run(patched, { mp: 49 });
    assert.equal(r.mp, 49); assert.equal(r.aim, true); assert.equal(r.mmCd, 0);
    assert.ok(noFire(r));
    assert.ok(r.calls.showPH.some((m) => m.includes('MP 부족')), 'MP 부족 안내');
  });
  check(file + ' GREEN: MP0 → 무발사·조준 유지', () => {
    const r = run(patched, { mp: 0 });
    assert.equal(r.mp, 0); assert.equal(r.bomb, false); assert.equal(r.aim, true); assert.equal(r.mmCd, 0);
  });
  check(file + ' GREEN: 합체(iceMortar) 성공 — iceFuse 폭탄·_ioCd/_mmCd 보존', () => {
    const r = run(patched, { mp: 50, iceOrb: 1, fuse: true });
    assert.equal(r.bomb, true); assert.equal(r.bombIce, true);
    assert.equal(r.mmCd, 660); assert.equal(r.ioCd, 600); assert.equal(r.mp, 0);
  });
  check(file + ' GREEN: 합체 실패(MP30) — iceFuse도 무발사·_ioCd 미설정·조준 유지', () => {
    const r = run(patched, { mp: 30, iceOrb: 1, fuse: true });
    assert.equal(r.bomb, false); assert.equal(r.ioCd, 0); assert.equal(r.mmCd, 0); assert.equal(r.aim, true);
    assert.ok(noFire(r));
  });
}

console.log(`\nfireMaliceMortar 확정 경계: ${pass} PASS / ${fail} FAIL`);
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
