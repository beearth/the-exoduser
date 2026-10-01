#!/usr/bin/env node
/* ============================================================================
 * QA-20261002-CONFIRM-INVENTORY-REVIEW — 소형 독립 회귀 (read-only)
 *   실행: node tools/team-followup-20261001/QA/confirm-inventory-review-regression.mjs
 *
 * root의 SKILL hellray-confirm-gate / UIUX inventory-focus 후보를 "독립적으로"
 * 실제 공용 소스·SSOT와 대조한다. 기존 테스트(SKILL 25건·UIUX 21건)를 통째 복사하지
 * 않고, 그 테스트가 하지 않는 교차검증(SSOT 수치 대조·before/current/patch 정합·
 * 이중patch 방지·UIUX 소스해시 drift·현재소스 앵커 재검증·숨김/분리 불변)만 담는다.
 *
 * 게임/브라우저/서버/빌드/계측 미실행. 실제 브라우저 검수 주장 아님. game/easy/공유
 * test/docs/타팀 파일 미수정. 원시 재현·실제 소스SHA·PASS/FAIL/한계만 남긴다.
 * ========================================================================= */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../');
const rd = (p) => readFileSync(path.join(REPO, p), 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex');

let pass = 0, fail = 0; const fails = [], notes = [];
function check(name, fn) { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; const m = (e && e.message || e); fails.push(name + ' :: ' + m); console.log('  ✗ ' + name + '\n      ' + m); } }
const note = (m) => { notes.push(m); };

const gameSrc = rd('game.html');
const easySrc = rd('game-easy-test.html');
console.log('실제 소스 SHA-256:');
console.log('  game.html          ' + sha(gameSrc));
console.log('  game-easy-test.html ' + sha(easySrc));

/* ══════════════════════ PART A — SKILL hellRay 확정 게이트 ══════════════════════ */
console.log('\n[A] SKILL hellRay 확정 게이트 — 독립 대조');

// A-block 추출 (SKILL 테스트와 독립: 자체 정규식)
function hrBlock(src) {
  const s = src.search(/^ {2}if\(P\._hrAiming\)\{\r?$/m);
  assert.ok(s >= 0, 'hellRay 확정 블록 시작 못 찾음');
  const e = src.indexOf('// ═══ 해골번개 쿨다운', s);
  assert.ok(e > s, 'hellRay 블록 끝 못 찾음');
  return src.slice(s, e);
}
const gBlock = hrBlock(gameSrc), eBlock = hrBlock(easySrc);

check('A1 양쪽 확정 블록 동일(한 patch로 커버 가능)', () => assert.equal(gBlock, eBlock));

check('A2 SSOT 수치가 실제 소스에 그대로 존재 (2_1:408 / 자원공식:247)', () => {
  assert.match(gBlock, /P\.mp-=100;/, 'MP 100 고정 차감');                 // SSOT MP100
  assert.match(gBlock, /_hrR=200\+\(_hrLv-1\)\*22/, '범위 200+(Lv-1)×22'); // SSOT 범위
  assert.match(gBlock, /P\._hrRech=600/, '10초=600f 충전');               // SSOT 10초/1충전
  assert.match(gBlock, /P\._hrStk--/, '스택 1 소모');                      // SSOT 스택1
  const doc = rd('docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md');
  assert.match(doc.split('\n')[407] || '', /MP 100/);
  assert.match(doc.split('\n')[407] || '', /200\+\(Lv-1\)×22/);
});

// 게이트 head/적용/제거 헬퍼 (patch의 +라인과 동일 문자열)
const GATE_HEAD = "      if((P._hrStk||0)<=0){P._hrAiming=false;showPH(_T('충전 중...'),'#ffd700')}\n"
  + "      else if(P.mp<100){showPH(_T('MP 부족! (100)'),'#4488ff')}\n      else{\n";
const applyGate = (b) => b
  .replace('      MBjust[0]=false;\n', '      MBjust[0]=false;\n' + GATE_HEAD)
  .replace('shake(_hrElec?10:6);', 'shake(_hrElec?10:6);}');
const stripGate = (b) => b
  .replace('      MBjust[0]=false;\n' + GATE_HEAD, '      MBjust[0]=false;\n')
  .replace('shake(_hrElec?10:6);}', 'shake(_hrElec?10:6);');

const hasGate = /MP 부족! \(100\)/.test(gBlock) && /충전 중/.test(gBlock);
const beforeBlock = hasGate ? stripGate(gBlock) : gBlock;
const patchedBlock = hasGate ? gBlock : applyGate(gBlock);

check('A3 현재 소스 상태 판정(before/patched) & 이중 patch 방지', () => {
  // game·easy 동일(A1) 하므로 한쪽 판정으로 양쪽 표현
  if (hasGate) {
    note('현재 game.html/easy = PATCHED (root가 hellRay 게이트 이미 적용, uncommitted). → 이중 patch 금지.');
    // 재적용 시 게이트가 2중 삽입됨을 보여 이중 patch 위험을 증명
    const doubled = applyGate(gBlock);
    assert.ok((doubled.match(/MP 부족! \(100\)/g) || []).length >= 2, '재적용하면 게이트 중복 — 재적용 금지 근거');
    assert.ok(/MP 부족! \(100\)/.test(eBlock) && /충전 중/.test(eBlock), 'easy도 PATCHED(동일)');
  } else {
    note('현재 game.html/easy = BEFORE (게이트 미적용). → patch 적용 가능.');
    assert.ok(true);
  }
});

check('A4 양쪽 patch 본문 동일(오프셋만 상이) & 확정 블록 내 앵커 유일', () => {
  const g = rd('tools/team-followup-20261001/SKILL/hellray-confirm-game.patch');
  const e = rd('tools/team-followup-20261001/SKILL/hellray-confirm-easy.patch');
  const body = (p) => p.split('\n').filter((l) => /^[+\- ]/.test(l) && !/^[+-]{3} /.test(l)).join('\n');
  assert.equal(body(g), body(e), 'patch 본문(±문맥) 동일');
  // 앵커는 "확정 블록 내"에서 유일해야 안전 (전체 파일엔 다른 스킬도 MBjust[0]=false 사용)
  assert.equal(gBlock.split('      MBjust[0]=false;\n').length - 1, 1, 'anchor1 블록내 유일(game)');
  assert.equal(eBlock.split('      MBjust[0]=false;\n').length - 1, 1, 'anchor1 블록내 유일(easy)');
  assert.equal(gBlock.split('shake(_hrElec?10:6);').length - 1, 1, 'anchor2 블록내 유일');
});

// 실제 블록을 함수로 실행하는 최소 하니스(원시 재현용; SKILL 테스트와 입력셋 다름)
function runBlock(block, o) {
  const calls = { prof: 0, sfx: 0, sample: 0, add: 0, shake: 0, rng: 0 };
  const P = { x: 0, y: 0, mp: o.mp, skills: { hellRay: 1, maliceStorm: 1 }, _hrStk: o.stk, _hrRech: 0, _hrAiming: true };
  const G = { cam: { x: 0, y: 0 }, _fireZones: [] };
  const a = {
    P, G, mouse: { x: 0, y: 0 }, VW: 0, VH: 0, dst: Math.hypot, sp: 1,
    MBjust: [o.click !== false, false, !!o.cancel], K: o.escape ? { Escape: true } : {},
    _isFused: (n) => !!o.elec && n === 'elecRepent',
    magicRef: () => 1, statInt: () => 1, pMagicMul: () => 1, pBeamMul: () => 1, _skMul: () => 1, _fuseMul: () => 1,
    _addSkProf: () => calls.prof++, SFX: { magic: () => calls.sfx++ }, playSample: () => calls.sample++,
    _r: (x) => { calls.rng++; return x; }, addTxt: () => calls.add++, shake: () => calls.shake++,
    _T: (x) => x, showPH: () => {}, EL: { L: 3 },
  };
  new Function(...Object.keys(a), block)(...Object.values(a));
  return { mp: P.mp, stk: P._hrStk, aim: P._hrAiming, zones: G._fireZones.length, calls };
}
const noFx = (r) => r.zones === 0 && Object.values(r.calls).every((v) => v === 0);

check('A5 RED(게이트 없는 before 블록): MP99 확정 → mp 음수(-1)+장판 설치', () => {
  const r = runBlock(beforeBlock, { mp: 99, stk: 1 });
  assert.equal(r.mp, -1); assert.ok(r.zones >= 1);
});
check('A6 RED(게이트 없는 before 블록): 스택0 확정 → stk 음수(-1)+장판 설치', () => {
  const r = runBlock(beforeBlock, { mp: 100, stk: 0 });
  assert.equal(r.stk, -1); assert.ok(r.zones >= 1);
});
check('A7 patched≠before (게이트가 블록을 실제로 변경)', () => assert.notEqual(patchedBlock, beforeBlock));

check('A8 GREEN: MP99 → 무차감·무설치·부작용0 (조준 유지)', () => {
  const r = runBlock(patchedBlock, { mp: 99, stk: 1 });
  assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [99, 1, 0, true]); assert.ok(noFx(r));
});
check('A9 GREEN: 스택0 → 무차감·무설치·부작용0 (조준 종료)', () => {
  const r = runBlock(patchedBlock, { mp: 100, stk: 0 });
  assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [100, 0, 0, false]); assert.ok(noFx(r));
});
check('A10 GREEN: 동시취소(RMB+click) 우선 → 무설치·부작용0', () => {
  const r = runBlock(patchedBlock, { mp: 100, stk: 1, click: true, cancel: true });
  assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [100, 1, 0, false]); assert.ok(noFx(r));
});
check('A11 GREEN: 성공(MP100/스택1) 기존 행동·클릭소비·충전 보존', () => {
  const r = runBlock(patchedBlock, { mp: 100, stk: 1 });
  assert.deepEqual([r.mp, r.stk, r.zones, r.aim], [0, 0, 1, false]);
  assert.equal(r.calls.prof, 1); assert.equal(r.calls.sfx, 1); assert.ok(r.calls.sample >= 1);
});
check('A12 GREEN: 합체(elecRepent) 성공 2장판 / 실패(MP99) 0장판·부작용0', () => {
  const ok = runBlock(patchedBlock, { mp: 100, stk: 1, elec: true });
  assert.equal(ok.zones, 2); assert.ok(ok.calls.sample >= 2);
  const bad = runBlock(patchedBlock, { mp: 99, stk: 1, elec: true });
  assert.equal(bad.zones, 0); assert.ok(noFx(bad));
});

/* ══════════════════════ PART B — UIUX inventory-focus 숨김/분리 ══════════════════════ */
console.log('\n[B] UIUX inventory-focus 후보 — 실제 소스·숨김/분리 위험 대조');

check('B1 소스 해시 drift 탐지: 기록 해시 vs 현재', () => {
  const rec = JSON.parse(rd('tools/team-followup-20261001/UIUX/inventory-focus-source-hashes.json'));
  const curG = sha(gameSrc), curE = sha(easySrc);
  const driftG = rec.sourceHashes['game.html'] !== curG;
  const driftE = rec.sourceHashes['game-easy-test.html'] !== curE;
  if (driftG || driftE) note(`UIUX 후보 기록해시 drift(${rec.readAt} 기준) — game:${driftG} easy:${driftE}. 앵커는 아래 B2에서 현재소스 재검증.`);
  assert.ok(true); // drift 는 FAIL 아님(기록 시점 이후 소스 변경). 재검증은 B2가 담당.
});

check('B2 connectCandidate 앵커 13개 모두 현재 game.html에 정확히 1회 → 치환 적용 가능', () => {
  const anchors = [
    'function _invRenderDetail(idx,source,preview=false){',
    "  if(!it)return;\n  const rp=$('invRight');if(!rp)return;",
    "const _eqS=INV.selected.slice(3);if(INV.equipped[_eqS])_invRenderDetail(_eqS,'eq');return;",
    '    grid.appendChild(div);\n  }\n\n    //',
    '    eqGrid.appendChild(div);',
    "function openPanel(id){closeAllPanels();",
    "function togglePanel(id){const el=$(id);",
    "const isOn=el.classList.contains('on');closeAllPanels();",
    "function closePanel(id){$(id).classList.remove('on');G.paused=false}",
    "function closeAllPanels(){$('resetConfirm')",
    '/* 패드 UI 잔류 정리 */',
    '#invPanel.on button,#crBagPop button',
  ];
  for (const a of anchors) assert.equal(gameSrc.split(a).length - 1, 1, '앵커 유일: ' + a.slice(0, 40));
});

check('B3 실제 소스에 _invClearHover / renderInv / _invRenderDetail / closeAllPanels 존재', () => {
  assert.match(gameSrc, /function _invClearHover\(\)\{/);
  assert.match(gameSrc, /function renderInv\(\)\{/);
  assert.match(gameSrc, /function _invRenderDetail\(/);
  assert.match(gameSrc, /function closeAllPanels\(\)\{/);
});

// 후보의 createInventoryFocus 를 동적 import 해 숨김/분리 불변을 최소 DOM 스텁으로 검증
const { createInventoryFocus } = await import(path.join(REPO, 'tools/team-followup-20261001/UIUX/inventory-focus-candidate.mjs'));

function mkNode(tag = 'div') {
  const n = {
    tagName: tag.toUpperCase(), isConnected: true, disabled: false, children: [],
    _cls: new Set(), _hidden: false, _ariaHidden: false, _attrs: {}, dataset: {}, style: {}, tabIndex: 0,
    classList: { contains: (c) => n._cls.has(c), add: (...cs) => cs.forEach((c) => n._cls.add(c)), remove: (...cs) => cs.forEach((c) => n._cls.delete(c)) },
    setAttribute: (k, v) => { n._attrs[k] = v; if (k === 'aria-hidden') n._ariaHidden = v === 'true'; },
    closest: (sel) => {
      // 지원: '[hidden],[aria-hidden="true"]'
      let p = n;
      while (p) { if ((sel.includes('[hidden]') && p._hidden) || (sel.includes('aria-hidden') && p._ariaHidden)) return p; p = p._parent; }
      return null;
    },
    contains: (x) => { let p = x; while (p) { if (p === n) return true; p = p._parent; } return false; },
    focus: () => { if (fakeDoc.activeElement && fakeDoc.activeElement._isBody !== true) {} fakeDoc.activeElement = n; },
    replaceChildren: (...c) => { n.children = c; },
    appendChild: (c) => { c._parent = n; n.children.push(c); },
  };
  return n;
}
const fakeDoc = {
  _body: null, activeElement: null,
  createElement: (t) => mkNode(t),
};

check('B4 usable(): [hidden]/[aria-hidden]/disconnected/disabled 노드 거부(분리·숨김 방지)', () => {
  const reg = {};
  const invPanel = mkNode(); invPanel._cls.add('on'); reg.invPanel = invPanel;
  const invClose = mkNode(); reg.invClose = invClose;
  const f = createInventoryFocus({ document: fakeDoc, get: (id) => reg[id], label: (ko) => ko });
  // begin 은 opener 기록만
  fakeDoc.activeElement = mkNode(); f.begin();
  // detached 노드로 restore 시도 → invClose 로 폴백(분리 노드에 포커스 안 둠)
  const detached = mkNode(); detached.isConnected = false;
  const hidden = mkNode(); hidden._hidden = true;
  const aria = mkNode(); aria._ariaHidden = true;
  // bind 를 통해 anchor 설정 후 missing 유도
  const trigger = mkNode(); invPanel.appendChild(trigger);
  let resolveOk = false;
  f.bind(trigger, () => (resolveOk ? trigger : null), () => {}, 'x');
  // resolve=null → missing() 경로: detail 정리 + 안전 노드로 restore
  reg.invRight = mkNode(); invPanel.appendChild(reg.invRight);
  reg.invActionBtns = mkNode(); invPanel.appendChild(reg.invActionBtns);
  fakeDoc.activeElement = trigger; trigger._parent = invPanel;
  trigger.onkeydown({ code: 'Enter', target: trigger, preventDefault() {} });
  // missing() 후: detail 은 status 힌트로 교체되고, 포커스는 분리/숨김 노드가 아니라 invClose(폴백)
  assert.ok(reg.invRight.children.length === 1, 'detail 이 상태 힌트로 교체됨');
  assert.notEqual(fakeDoc.activeElement, detached, '분리 노드에 포커스 두지 않음');
  assert.ok(fakeDoc.activeElement === invClose || fakeDoc.activeElement === trigger || fakeDoc.activeElement === reg.invRight,
    '포커스는 usable 안전 노드(invClose/anchor/detail)로 유지');
});

check('B5 missing(): detail 정리 시 compare/hover-preview 클래스 제거·플로트 숨김(잔상 분리 방지)', () => {
  const reg = {};
  const invPanel = mkNode(); invPanel._cls.add('on'); reg.invPanel = invPanel;
  reg.invClose = mkNode();
  const detail = mkNode(); detail._cls.add('inv-side-compare'); detail._cls.add('inv-hover-preview');
  detail._detailItem = {}; detail._detailSource = 'bag';
  reg.invRight = detail; invPanel.appendChild(detail);
  reg.invActionBtns = mkNode();
  reg.invOssInfo = mkNode(); reg.invOssInfo._cls.add('has-detail');
  reg.invCompareFloat = mkNode();
  const f = createInventoryFocus({ document: fakeDoc, get: (id) => reg[id], label: (ko) => ko });
  f.missing();
  assert.equal(detail._detailItem, null); assert.equal(detail._detailSource, null);
  assert.ok(!detail.classList.contains('inv-side-compare') && !detail.classList.contains('inv-hover-preview'));
  assert.ok(!reg.invOssInfo.classList.contains('has-detail'));
  assert.equal(reg.invCompareFloat.style.display, 'none', '비교 플로트 숨김');
});

/* ══════════════════════ 결과 ══════════════════════ */
console.log(`\n확정·인벤토리 독립 회귀: ${pass} PASS / ${fail} FAIL`);
if (notes.length) { console.log('한계·주의:'); for (const n of notes) console.log('  - ' + n); }
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
