/* ============================================================================
 * SKILL-mortar-confirm-dispatch — aim-start→확정→fireMaliceMortar 통합 제어흐름 회귀
 *   실행: node tools/team-followup-20261001/SKILL/mortar-confirm-dispatch.test.mjs
 *
 * mortar-confirm-source(단독 함수 17검사)를 보존하고, 이번에는 실제 3개 소스 슬라이스를
 * 함께 추출해 프레임 단위 제어흐름으로 검증한다:
 *   (1) aim-start   = dispatch의 `case 'maliceMortar':` 본문 (MP>=50 && _mmCd<=0 게이트)
 *   (2) confirm     = 업데이트 루프의 `if(P._mmAiming){…}` (MBjust/릴리즈, RMB/Esc 취소,
 *                      → fireMaliceMortar 위임)
 *   (3) fire        = `function fireMaliceMortar(…)` (useMp 차감 후 발사)
 *
 * 조준 중 MP가 50 미만으로 떨어졌을 때 원 결함(무료 발사)과 후보 가드(발사 차단·조준유지)를
 * 실제 흐름에서 비교한다. actual source(추출 문자열)와 fixture(환경/프레임 드라이버)를
 * 명확히 분리한다 — 아래 EXTRACTED_* 는 파일 원문, makeRig/scenario* 는 fixture.
 *
 * 새 결함 없음: 기존 mortar-confirm-source의 MP 재검사 결함 1건만. 신규 patch 생성 안 함.
 * 후보 가드 = fireMaliceMortar 진입 MP 재검사(mortar-confirm-source patch와 동일 변환).
 * 새 비용/쿨/밸런스/thunderStake duration 변경 0. 생산 적용은 root.
 * ========================================================================= */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../../');
const FILES = ['game.html', 'game-easy-test.html'];

/* ── actual source 추출 (원문, fixture 아님) ─────────────────────────────── */
function extractAimStart(src) {
  const cs = src.indexOf("case 'maliceMortar':");
  const next = src.indexOf("case 'boneWall':", cs);
  assert.ok(cs >= 0 && next > cs, 'aim-start case 추출');
  // case 라벨 이후 ~ 다음 case 직전(본문 + 종료 break;) 원문 그대로
  return src.slice(cs + "case 'maliceMortar':".length, next).replace(/\s+$/, '');
}
function extractConfirm(src) {
  const cs = src.indexOf('// ═══ 폭풍소환 — 조준');
  const bs = src.indexOf('if(P._mmAiming){', cs);
  const be = src.indexOf('// ═══ 벽소환', bs);
  assert.ok(cs >= 0 && bs > cs && be > bs, 'confirm 블록 추출');
  return src.slice(bs, be).replace(/\s+$/, '');
}
function extractFire(src) {
  const b = src.indexOf('function fireMaliceMortar(');
  const e = src.indexOf('\n}', b) + 2;
  assert.ok(b >= 0 && e > b, 'fireMaliceMortar 추출');
  return src.slice(b, e);
}
// 후보 가드(= mortar-confirm-source patch와 동일): 함수 진입 MP 재검사
const GUARD = "\n  if(P.mp<mpCost('mortar')){showPH(_T('MP 부족!'),'#4488ff');return}";
const applyGate = (fireSrc) => fireSrc.replace('function fireMaliceMortar(_tx,_ty){', 'function fireMaliceMortar(_tx,_ty){' + GUARD);

/* ── fixture: 공유 환경 + 3슬라이스 결선 + 프레임 드라이버 ───────────────── */
function makeRig(aimSrc, confirmSrc, fireSrc, opts = {}) {
  const counters = { sfx: 0, playSample: 0, shake: 0, fires: 0, showPH: [] };
  const P = { x: 0, y: 0, facing: 0, mp: opts.mp ?? 50, skills: { maliceMortar: 1, iceOrb: opts.iceOrb ?? 0 },
    _mmAiming: false, _mmCharging: false, _mmAimKey: null, _mmDist: 150, _mmCd: 0, _ioCd: 0 };
  const G = {};
  const KH = {};               // key-hold 맵(릴리즈 판정용)
  const MBjust = [false, false, false];
  const K = {};
  const env = {
    P, G, KH, MBjust, K, sp: 1,
    mpCost: (k) => (k === 'mortar' ? 50 : 0),
    useMp: (k) => { const c = (k === 'mortar' ? 50 : 0); const b = P.mp; P.mp = Math.max(0, P.mp - c); return b - P.mp; },
    _isFused: (n) => !!opts.fuse && n === 'iceMortar',
    _gpActive: false, mouse: { x: 0, y: 0 }, VW: 0, VH: 0,
    SFX: { magic: () => { counters.sfx++; } }, EL: { I: 1, D: 2 },
    playSample: () => { counters.playSample++; }, _r: (a) => a, shake: () => { counters.shake++; },
    showPH: (m) => { counters.showPH.push(m); }, _T: (x) => x,
  };
  // fire: 원문(또는 가드본) → fireMaliceMortar 획득(발사 시 counters.fires++는 bomb로 판정)
  const fireKeys = ['P', 'G', 'mpCost', 'useMp', '_isFused', 'SFX', 'EL', 'playSample', '_r', 'shake', 'showPH', '_T'];
  const fire = new Function(...fireKeys, fireSrc + ';return fireMaliceMortar;')(...fireKeys.map((k) => env[k]));
  const fireWrap = (tx, ty) => { const had = !!G._mmBomb; fire(tx, ty); if (!!G._mmBomb && !had) counters.fires++; };
  // confirm: 원문. fireMaliceMortar 주입
  const confirm = new Function('P', 'KH', 'sp', 'MBjust', 'K', 'fireMaliceMortar', confirmSrc)
    .bind(null, P, KH, env.sp, MBjust, K, fireWrap);
  // aim-start: 원문. break 합법화를 위해 switch(1){case 1:…} 래핑 + _skOk 반환
  const aim = new Function('P', 'G', 'mpCost', 'showPH', '_T', '_gpActive', 'mouse', 'VW', 'VH', 'keyCode',
    'let _skOk=false; switch(1){case 1:\n' + aimSrc + '\n} return _skOk;');
  const aimStart = (keyCode) => aim(P, G, env.mpCost, env.showPH, env._T, env._gpActive, env.mouse, env.VW, env.VH, keyCode);
  return { P, G, KH, MBjust, K, counters, aimStart, confirm };
}

let pass = 0, fail = 0; const fails = []; const evidence = { byFile: {} };
function check(name, fn) { try { fn(); pass++; } catch (e) { fail++; fails.push(name + ' :: ' + (e && e.message || e)); console.error('  ✗ ' + name + '\n    ' + (e && e.message || e)); } }

const srcs = {};
for (const f of FILES) srcs[f] = readFileSync(path.join(repoRoot, f), 'utf8');

check('양쪽 aim-start/confirm/fire 원문 동일', () => {
  const g = srcs['game.html'], e = srcs['game-easy-test.html'];
  assert.equal(extractAimStart(g), extractAimStart(e), 'aim-start');
  assert.equal(extractConfirm(g), extractConfirm(e), 'confirm');
  assert.equal(extractFire(g), extractFire(e), 'fire');
});

for (const file of FILES) {
  const src = srcs[file];
  const aimSrc = extractAimStart(src), confirmSrc = extractConfirm(src), fireOrig = extractFire(src), firePatched = applyGate(fireOrig);

  check(file + ' 추출 슬라이스가 실제 소스 토큰 포함(흐름=source, env=fixture)', () => {
    assert.ok(/P\._mmAiming=true;P\._mmAimKey=keyCode/.test(aimSrc), 'aim-start 원문');
    assert.ok(/fireMaliceMortar\(_mmwx,_mmwy\)/.test(confirmSrc) && /MBjust\[2\]\|\|K\['Escape'\]/.test(confirmSrc), 'confirm 원문');
    assert.ok(/useMp\('mortar'\)/.test(fireOrig), 'fire 원문');
    assert.notEqual(firePatched, fireOrig);
  });

  // ── 시나리오 A: 조준중 MP 감소 → 저MP 확정 (원 결함 vs 후보 가드) ──
  function scenarioLowMp(fireSrc) {
    const rig = makeRig(aimSrc, confirmSrc, fireSrc, { mp: 50 });
    assert.equal(rig.aimStart('Digit1'), true, 'aim-start 성공(mp50,cd0)');
    assert.equal(rig.P._mmAiming, true);
    // 조준 중 외부 소비로 MP 30. 홀드→릴리즈로 확정 시도
    rig.P.mp = 30;
    rig.KH['Digit1'] = true; rig.confirm();          // 충전(hold)
    rig.KH['Digit1'] = false; rig.confirm();         // 릴리즈 → _mmRel 확정
    return rig;
  }
  check(file + ' A-RED: 원본은 조준중 MP30에서도 무료 발사', () => {
    const r = scenarioLowMp(fireOrig);
    assert.equal(r.counters.fires, 1); assert.equal(r.P.mp, 0); assert.equal(r.P._mmCd, 660);
  });
  check(file + ' A-GREEN: 후보는 MP30 발사 차단·차감0·조준유지·MP부족 안내', () => {
    const r = scenarioLowMp(firePatched);
    assert.equal(r.counters.fires, 0); assert.equal(r.P.mp, 30); assert.equal(r.P._mmAiming, true); assert.equal(r.P._mmCd, 0);
    assert.ok(r.counters.showPH.some((m) => m.includes('MP 부족')));
    assert.equal(r.counters.sfx, 0); assert.equal(r.counters.playSample, 0); assert.equal(r.counters.shake, 0);
  });

  // ── 시나리오 B: 저MP 조준유지 → MP 회복 → 재확정 성공 (후보) ──
  check(file + ' B-GREEN: 저MP 유지 후 MP 회복하면 다음 클릭에 정상 발사', () => {
    const r = scenarioLowMp(firePatched);       // 여기서 아직 조준 유지, 미발사
    r.P.mp = 50;                                // MP 회복(리젠)
    r.MBjust[0] = true; r.confirm();            // 재확정(클릭)
    assert.equal(r.counters.fires, 1); assert.equal(r.P.mp, 0); assert.equal(r.P._mmCd, 660); assert.equal(r.P._mmAiming, false);
  });

  // ── 시나리오 C: RMB/Escape 취소 우선(클릭 동시) ──
  for (const [label, setup] of [['RMB', (r) => { r.MBjust[2] = true; r.MBjust[0] = true; }], ['Escape', (r) => { r.K['Escape'] = true; r.MBjust[0] = true; }]]) {
    check(file + ' C-' + label + ': 취소 우선 — 무발사·조준해제·무차감', () => {
      const r = makeRig(aimSrc, confirmSrc, firePatched, { mp: 50 });
      r.aimStart('Digit1'); setup(r); r.confirm();
      assert.equal(r.counters.fires, 0); assert.equal(r.P._mmAiming, false); assert.equal(r.P.mp, 50);
    });
  }

  // ── 시나리오 D: 성공 후 중복 입력 차단(쿨다운) ──
  check(file + ' D: 성공 직후 중복 클릭/재조준 차단(_mmCd=660)', () => {
    const r = makeRig(aimSrc, confirmSrc, firePatched, { mp: 100 });
    r.aimStart('Digit1'); r.MBjust[0] = true; r.confirm();     // 성공
    assert.equal(r.counters.fires, 1); assert.equal(r.P._mmAiming, false);
    r.MBjust[0] = true; r.confirm();                           // 같은 틀에서 재클릭
    assert.equal(r.counters.fires, 1, '조준 off → 재발사 없음');
    const reAim = r.aimStart('Digit1');                        // 재조준 시도
    assert.equal(reAim, false, '_mmCd>0 → 재조준 거부'); assert.equal(r.P._mmAiming, false);
  });

  // ── 시나리오 E: iceMortar 합체 상태 — 성공/실패 ──
  check(file + ' E-GREEN: 합체(iceMortar) 성공은 _ioCd/_mmCd 보존, 저MP는 무발사', () => {
    const ok = makeRig(aimSrc, confirmSrc, firePatched, { mp: 50, iceOrb: 1, fuse: true });
    ok.aimStart('Digit1'); ok.MBjust[0] = true; ok.confirm();
    assert.equal(ok.counters.fires, 1); assert.equal(ok.G._mmBomb.iceFuse, true); assert.equal(ok.P._ioCd, 600); assert.equal(ok.P._mmCd, 660);
    const low = makeRig(aimSrc, confirmSrc, firePatched, { mp: 30, iceOrb: 1, fuse: true });
    // mp30이면 aim-start부터 거부(진입 게이트). 강제 조준 후 확정해도 가드로 차단
    low.P.mp = 50; low.aimStart('Digit1'); low.P.mp = 30; low.MBjust[0] = true; low.confirm();
    assert.equal(low.counters.fires, 0); assert.equal(low.P._ioCd, 0); assert.equal(low.P._mmAiming, true);
  });

  // ── 원본 vs 후보 호출/SFX/RNG 횟수 비교(동일 시나리오) ──
  check(file + ' 비교: 저MP 시나리오에서 원본=발사1·후보=발사0, 성공 시나리오는 동일', () => {
    const ro = scenarioLowMp(fireOrig), rp = scenarioLowMp(firePatched);
    assert.equal(ro.counters.fires - rp.counters.fires, 1, '제거된 무료 발사 1');
    assert.equal(ro.counters.sfx - rp.counters.sfx, 1);
    assert.ok(ro.counters.playSample - rp.counters.playSample >= 1);
    // 정상 MP 경로는 호출수 동일
    const so = makeRig(aimSrc, confirmSrc, fireOrig, { mp: 50 }); so.aimStart('Digit1'); so.MBjust[0] = true; so.confirm();
    const sp = makeRig(aimSrc, confirmSrc, firePatched, { mp: 50 }); sp.aimStart('Digit1'); sp.MBjust[0] = true; sp.confirm();
    assert.deepEqual([so.counters.fires, so.counters.sfx], [sp.counters.fires, sp.counters.sfx]);
    evidence.byFile[file] = { lowMp_orig: ro.counters, lowMp_cand: rp.counters, success_orig: so.counters, success_cand: sp.counters,
      fireSha: crypto.createHash('sha256').update(fireOrig).digest('hex').slice(0, 16) };
  });
}

writeFileSync(path.join(here, 'mortar-confirm-dispatch-evidence.json'),
  JSON.stringify({ taskId: 'SKILL-mortar-confirm-dispatch', head: 'f965a15b', generatedAtUTC: new Date().toISOString(),
    verdict: 'EXISTING_DEFECT_CONFIRMED_NO_NEW_DEFECT', newPatch: false, reusedGuard: 'fireMaliceMortar 진입 MP 재검사(mortar-confirm-source)',
    pass, fail, evidence }, null, 2) + '\n');

console.log(`\nmortar 통합 제어흐름 회귀: ${pass} PASS / ${fail} FAIL`);
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
