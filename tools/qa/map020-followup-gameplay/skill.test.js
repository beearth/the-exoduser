// UI03 후속 / SKILL 실제 소스 추출 검증. 브라우저나 디스크 게임 상태는 실행하지 않음.
// 신규 경계 전용: 조준 중 자동 리젠 · 외부 자원 변동 · 취소 후 유령클릭.
// 기존 skillStackConfirmGate(단발 확정 16검사)와 중복 금지 — 다중 프레임/외부변이만.
// 실제 소스에서 (1) 아이스스톰 리젠 블록 (2) 아이스스톰 확정 블록 (3) fireBoneWall 추출·실행.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { functionSource, dst } from './source.mjs';

const noop = () => {};

for (const file of ['game.html', 'game-easy-test.html']) {
  const source = readFileSync(new URL('../../../' + file, import.meta.url), 'utf8');

  // ── 준비: 앵커 추출 (배너/들여쓰기 의존 — 못 찾으면 소리내어 실패) ──
  const regenStart = source.indexOf('// ═══ 아이스스톰 — 2스택 충전');
  const regenEnd   = source.indexOf('// ═══ 아이스스톰 — 조준 모드', regenStart);
  const confStart  = source.search(/^  if\(P\._isAiming\)\{\r?$/m);
  const confEnd    = source.indexOf('// ═══ 독가스탄', confStart);
  const boneStart  = source.indexOf('function fireBoneWall(tx,ty){');
  const boneEnd    = source.indexOf('// ═══ 폭산탄', boneStart);
  assert.ok(regenStart >= 0 && regenEnd > regenStart, `${file}: 아이스스톰 리젠 배너 앵커`);
  assert.ok(confStart  >= 0 && confEnd  > confStart,  `${file}: 아이스스톰 확정 블록 앵커`);
  assert.ok(boneStart  >= 0 && boneEnd  > boneStart,  `${file}: fireBoneWall 앵커`);
  assert.ok(regenEnd < confStart, `${file}: 실제 리젠→확정 순서`);
  const regenSrc = source.slice(regenStart, regenEnd);
  const confSrc  = source.slice(confStart, confEnd);
  const boneSrc  = functionSource(source, 'fireBoneWall');
  const malCost = new Function('const _MALICE_COST_MUL=.5;' + functionSource(source, '_malCost') + ';return _malCost;')();

  // 아이스스톰 한 프레임 = 리젠(P,sp) → 확정(click/cancel). 외부변이는 호출 전 P/G 직접 수정.
  function iceFrame(P, G, {click = false, cancel = false, escape = false, sp = 0} = {}) {
    new Function('P', 'sp', regenSrc)(P, sp);                         // 리젠 블록 (확정보다 선행)
    const a = {P, G, mouse: {x: 0, y: 0}, VW: 0, VH: 0, dst,
      MBjust: [click, false, cancel], K: {Escape: escape}, showPH: noop, _T: x => x,
      EL: {I: 1}, SFX: {magic: noop}, playSample: noop, addTxt: noop, shake: noop};
    new Function(...Object.keys(a), confSrc)(...Object.values(a));    // 확정/취소 블록
    return {mp: P.mp, stk: P._isStk, zones: (G._fireZones || []).length, aim: P._isAiming};
  }
  function newIce(over = {}) {               // 관찰 대상 초기상태
    const P = {x: 0, y: 0, mp: 40, skills: {iceStorm: 1}, _isStk: 1, _isRech: 1500, _isAiming: true, ...over};
    const G = {cam: {x: 0, y: 0}, _fireZones: []};
    return {P, G};
  }
  function fireBone(P, G) {                   // fireBoneWall 실체 호출
    const a = {P, G, _malCost: malCost, showPH: noop, _T: x => x,
      _addSkProf: noop, meleeRef: () => 1, statStr: () => 1, pAtkMul: () => 1, _skMul: () => 1,
      EL: {D: 1}, SFX: {magic: noop}, playSample: noop, _r: () => 1, shake: noop, addTxt: noop};
    new Function(...Object.keys(a), boneSrc + ';return fireBoneWall;')(...Object.values(a))(0, 0);
    return {walls: (G._boneWalls || []).length, mats: G.mats, stk: P._bwStk, mp: P.mp, aim: P._bwAiming};
  }

  // ── IceN1: 조준 중 MP39 거부 → 외부 리젠(MP40) 후 재클릭 성공 (거부→성공 전환) ──
  test(`${file}: [N1] 조준 중 MP 외부회복으로 거부→설치 성공`, () => {
    const {P, G} = newIce({mp: 39});
    assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 39, stk: 1, zones: 0, aim: true}); // 거부·조준유지·무차감
    P.mp = 40;                                                                              // 외부 MP 리젠
    assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 0, stk: 0, zones: 1, aim: false}); // 성공·정확차감
  });

  // ── IceN2: 조준 중 자동 스택 리젠(단일 프레임 regen→confirm) 후 즉시 설치 ──
  test(`${file}: [N2] 조준 중 스택 리젠 직후 같은 프레임 설치`, () => {
    const {P, G} = newIce({_isStk: 0, _isRech: 10});        // 스택0, 리젠 임박
    const r = iceFrame(P, G, {click: true, sp: 20});        // sp20 → _isRech 10-20<=0 → stk 0→1 → 확정 성공
    assert.deepEqual(r, {mp: 0, stk: 0, zones: 1, aim: false});
  });

  // ── IceN3: 조준 중 외부 스택 소진(합체 등) 후 클릭 → 조준 종료·무차감 ──
  test(`${file}: [N3] 조준 중 외부 스택0 → 클릭 시 조준종료·무차감`, () => {
    const {P, G} = newIce();
    P._isStk = 0;                                           // 외부 소모
    assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 40, stk: 0, zones: 0, aim: false});
  });

  // ── IceN4: 취소(Esc/우클릭) 후 유령 좌클릭이 자원을 건드리지 않음 ──
  test(`${file}: [N4] 취소 후 유령클릭 무차감 (확정블록 미진입)`, () => {
    const {P, G} = newIce();
    assert.deepEqual(iceFrame(P, G, {cancel: true}), {mp: 40, stk: 1, zones: 0, aim: false}); // 취소 우선
    assert.deepEqual(iceFrame(P, G, {click: true}),  {mp: 40, stk: 1, zones: 0, aim: false}); // aim=false라 블록 미진입
  });

  // ── IceN5: 조준 중 MP 외부 드레인(0) → 클릭 거부·조준 유지(재클릭 가능) ──
  test(`${file}: [N5] 조준 중 MP0 드레인 → 거부·조준유지`, () => {
    const {P, G} = newIce();
    P.mp = 0;                                               // 외부 드레인
    assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 0, stk: 1, zones: 0, aim: true});
    // 주: 확정블록은 진입 즉시 MBjust[0]=false 소비 → 프레임당 1회만 평가(연타 무효).
  });

  test(`${file}: [N6] Escape/우클릭은 같은 프레임 좌클릭보다 우선하고 다음 유령클릭도 무차감`, () => {
    for (const input of [{escape: true}, {cancel: true}]) {
      const {P, G} = newIce();
      assert.deepEqual(iceFrame(P, G, {...input, click: true}), {mp: 40, stk: 1, zones: 0, aim: false});
      assert.deepEqual(iceFrame(P, G, {click: true}), {mp: 40, stk: 1, zones: 0, aim: false});
    }
  });

  // ── BoneN1: 조준(패드) 중 외부 악의 부족 → 확정 실패해도 조준 해제 (iceStorm과 비대칭) ──
  test(`${file}: [BN1] fireBoneWall 자원부족 실패 시에도 _bwAiming 해제`, () => {
    const P = {mp: 0, x: 0, y: 0, skills: {boneWall: 1}, _bwStk: 1, _bwAiming: true};
    assert.deepEqual(fireBone(P, {mats: 5}), {walls: 0, mats: 5, stk: 1, mp: 0, aim: false});
  });

  // ── BoneN2: 조준 중 외부 스택 소진 → 확정 실패·조준 해제·무차감 ──
  test(`${file}: [BN2] fireBoneWall 스택0 실패 시 조준 해제·무차감`, () => {
    const P = {mp: 0, x: 0, y: 0, skills: {boneWall: 1}, _bwStk: 0, _bwAiming: true};
    assert.deepEqual(fireBone(P, {mats: 6}), {walls: 0, mats: 6, stk: 0, mp: 0, aim: false});
  });

  // ── BoneN3: 조준 중 실비 충족 → 성공·정확차감·조준 해제·MP 무접촉 ──
  test(`${file}: [BN3] fireBoneWall 성공 시 악의6+스택1 차감·MP불변·조준해제`, () => {
    const P = {mp: 0, x: 0, y: 0, skills: {boneWall: 1}, _bwStk: 1, _bwAiming: true};
    assert.deepEqual(fireBone(P, {mats: 6}), {walls: 1, mats: 0, stk: 0, mp: 0, aim: false});
  });
}
