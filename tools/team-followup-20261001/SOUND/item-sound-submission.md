교차 확인 완료. `playEquipSfx`는 3곳(정의 15467 / 수동장착 15558 / 제작 자동장착 49313)뿐이고, **`playItemPickupSfx(item);playEquipSfx(item)` 인접은 어디에도 없습니다.** 세계아이템 습득(31581/31607)·수동장착·제작 라인은 현재도 테스트와 일치합니다.

## 판정: 실제 소리 결함 아님 — **낡은 인접 문자열 가정(리팩터)**

- 두 실패 어서션은 **"픽업 시 자동장착" 경로**(`INV.equipped[_autoSlot]=item;...playItemPickupSfx;playEquipSfx` + `...획득! ⚡ 자동 장착!` notify)를 가정합니다.
- 현재 `pickupItem`(15593–15619)에는 그 분기가 **의도적으로 삭제**됨 — 15606–15607 주석: "획득 장비는 빈 부위가 있어도 가방으로; 장착은 플레이어가 아이템창에서 결정". 획득 경로는 `playItemPickupSfx` **1회만** + `획득!` notify.
- SSOT 함수/맵(15465–15473)·에셋존재·희귀 레이어·기본폴백·제작 자동장착(49313: `SFX.pickup();playEquipSfx`)·수동장착(15558)·세계습득 중복제거(31581/607)는 **모두 현행과 일치**(해당 어서션 통과).
- 즉 현재 **의도된 소리 횟수**: 가방 성공=pickup 1·equip 0 / 가방부족 거부=0·0 / 제작 자동장착=SFX.pickup 1·equip 1 / 수동장착=equip(base+rare≥2) 1~2. 중복/누락 없음.
> ∴ 생산 수정 불필요. **테스트의 폐기 가정 2줄만 교정**하고, 완화가 아니라 "현 설계=픽업 자동장착 없음·거부 무음"을 **양성으로 검증**하도록 보강.

## 미적용 후보 ① 공유 테스트 교정 diff (root가 적용)

```diff
--- a/test/itemEquipSound.test.js
+++ b/test/itemEquipSound.test.js
@@
   assert.match(gameHtml, /recalcSt\(\);\s*playEquipSfx\(item\);\s*notify\(_T\(item\.name\)\+_T\(' 장착!'\)\);/);
-  assert.match(gameHtml, /INV\.equipped\[_autoSlot\]=item;item\.slot=_autoSlot;\s*playItemPickupSfx\(item\);playEquipSfx\(item\);/);
+  // 2026-09-01 설계: 픽업 자동장착 폐기(획득→가방, 장착은 아이템창 수동). 픽업+장착 인접 호출이 없어야 한다.
+  assert.doesNotMatch(gameHtml, /playItemPickupSfx\(item\);playEquipSfx\(item\)/);
+  assert.match(gameHtml, /획득한 일반 장비는 비어 있는 장착 부위가 있어도 가방에 보낸다\./);
   assert.match(gameHtml, /INV\.equipped\[craftSlot\]=item;\s*SFX\.pickup\(\);playEquipSfx\(item\);/);
```

```diff
--- a/test/itemPickupSound.test.js
+++ b/test/itemPickupSound.test.js
@@
   // 가방 습득 경로
   assert.match(gameHtml, /playItemPickupSfx\(item\);notify\(`\$\{_rarName\(item\.rarity\)\} \$\{_T\(item\.name\)\} \$\{_T\('획득!'\)\}`\);/);
-  // 픽업 자동 장착 경로: 습득음(계층) + 장착음
-  assert.match(gameHtml, /playItemPickupSfx\(item\);playEquipSfx\(item\);notify\(`\$\{_rarName\(item\.rarity\)\} \$\{_T\(item\.name\)\} \$\{_T\('획득!'\)\} ⚡ \$\{_T\('자동 장착!'\)\}`\);/);
+  // 픽업 자동장착 폐기: 획득 경로엔 장착음·자동장착 notify 없음(완화가 아니라 현 설계 검증)
+  assert.doesNotMatch(gameHtml, /playItemPickupSfx\(item\);playEquipSfx\(item\);notify\(`[^`]*자동 장착[^`]*`\)/);
+  // 가방 공간 부족 거부 = 무음(습득음 호출 전에 pop·거부 notify·return false)
+  assert.match(gameHtml, /INV\.bag\.pop\(\);notify\(_T\('가방에 공간이 없습니다!'\)\);return false/);
```

> 유지 항목(변경 없음): `equip_*`/`pickup_*` 에셋존재·SSOT 맵·`playEquipSfx`/`playItemPickupSfx` 본문·`doesNotMatch(폐기키)`·제작 자동장착·수동장착·세계습득 중복제거. 에셋존재/희귀효과/기본층 계약 보존.

## 미적용 후보 ② 실제 소스 추출 실행 회귀 (owned `tools/team-followup-20261001/SOUND/item-sound-regression.cjs`)

실제 `pickupItem`·`playItemPickupSfx`·`playEquipSfx` 소스를 추출·실행해 **의도한 소리 호출 횟수**를 검증(문자열 가정이 아니라 동작).

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../../..');
const SRC = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');

function extractFn(src, sig) {        // 중괄호 균형 스캔(템플릿 ${} 쌍 균형 전제)
  const i = src.indexOf(sig); assert.ok(i >= 0, 'not found: ' + sig);
  let d = 0, started = false;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (c === '{') { d++; started = true; }
    else if (c === '}') { d--; if (started && d === 0) return src.slice(i, k + 1); }
  }
  throw new Error('unbalanced: ' + sig);
}
const pickupItemSrc = extractFn(SRC, 'function pickupItem(item){');
const playPickupSrc = SRC.split('\n').find(l => l.startsWith('function playItemPickupSfx(item){'));
const playEquipSrc = SRC.split('\n').find(l => l.startsWith('function playEquipSfx(item){'));
assert.ok(playPickupSrc && playEquipSrc, 'sfx fns found');

function run(src, { full = false } = {}) {
  const c = { pickupN: 0, equipN: 0, bag: [], ret: undefined };
  const ctx = {
    _itemSz: () => [1, 1],
    INV: { bag: c.bag, equipped: {} },
    _invFindSpace: () => full ? null : { x: 0, y: 0 },
    notify: () => {}, _rarName: () => '', _T: x => x, Date: { now: () => 0 },
    playItemPickupSfx: () => { c.pickupN++; },        // pickupItem 이 부르는 실제 호출 카운트
    playEquipSfx: () => { c.equipN++; },
    _petSayCD: () => {}, _petOnFirstLegend: () => {},
    _grantOssuaryIfNeeded: () => {}, _boneRegister: () => false,
    dbSaveForce: () => {}, window: {}, console
  };
  vm.createContext(ctx);
  vm.runInContext(pickupItemSrc + '\n;globalThis.__r=pickupItem({slot:"weapon",rarity:1,name:"x"});', ctx);
  c.ret = ctx.__r;
  return c;
}

test('증거: 추출 소스에 픽업 자동장착 분기 부재(설계 주석 포함)', () => {
  assert.ok(pickupItemSrc.includes('획득한 일반 장비는 비어 있는 장착 부위가 있어도 가방에 보낸다.'));
  assert.ok(!/playItemPickupSfx\(item\);playEquipSfx\(item\)/.test(SRC), '픽업+장착 인접 없음');
  console.log('pickupItem bytes=' + pickupItemSrc.length);
});

test('가방 습득 성공: 습득음 1 · 장착음 0 · true', () => {
  const r = run({ full: false });
  assert.equal(r.pickupN, 1); assert.equal(r.equipN, 0); assert.equal(r.ret, true);
});

test('가방 공간 부족 거부: 무음(습득 0 · 장착 0) · false · bag 롤백', () => {
  const r = run({ full: true });
  assert.equal(r.pickupN, 0); assert.equal(r.equipN, 0); assert.equal(r.ret, false);
  assert.equal(r.bag.length, 0);
});

test('playItemPickupSfx: 풀에서 1회 재생(계층 랜덤)', () => {
  const pool = ['pickup_item', 'pickup_rummage1', 'pickup_rummage2', 'pickup_rummage3', 'pickup_rummage4', 'pickup_rummage5'];
  let n = 0, key = null;
  const ctx = { _PICKUP_SFX_POOL: pool, _r: a => a, Math: Object.assign(Object.create(Math), { random: () => 0 }),
                playSample: (k) => { n++; key = k; }, console };
  vm.createContext(ctx); vm.runInContext(playPickupSrc + '\n;playItemPickupSfx({rarity:1});', ctx);
  assert.equal(n, 1); assert.ok(pool.includes(key));
});

test('playEquipSfx: 기본폴백 + 희귀(≥2) 레이어', () => {
  function runEquip(item) {
    const calls = [];
    const ctx = { _EQUIP_SFX_BY_WTYPE: { sword: 'equip_sword' }, _EQUIP_SFX_BY_BTYPE: { crossbow: 'equip_crossbow' },
                  _r: a => a, playSample: (k) => calls.push(k), console };
    vm.createContext(ctx); vm.runInContext(playEquipSrc + '\n;globalThis.__c=null;playEquipSfx(' + JSON.stringify(item) + ');', ctx);
    return calls;
  }
  assert.deepEqual(runEquip({ wtype: 'sword', rarity: 1 }), ['equip_sword']);       // wtype 매핑, 희귀 없음
  assert.deepEqual(runEquip({ btype: 'crossbow', rarity: 1 }), ['equip_crossbow']); // btype 매핑
  assert.deepEqual(runEquip({ rarity: 1 }), ['equip_base']);                        // 폴백
  assert.deepEqual(runEquip({ wtype: 'sword', rarity: 2 }), ['equip_sword', 'equip_rare']); // 희귀 레이어
  assert.deepEqual(runEquip({ rarity: 3 }), ['equip_base', 'equip_rare']);
});

test('제작 자동장착/수동장착 라인 보존(구조 증거)', () => {
  assert.match(SRC, /INV\.equipped\[craftSlot\]=item;\s*SFX\.pickup\(\);playEquipSfx\(item\);notify\(`\$\{_rarName\(rar\)\} \$\{_T\(item\.name\)\} \$\{_T\('자동 장착!'\)\}`\);/);
  assert.match(SRC, /recalcSt\(\);playEquipSfx\(item\);notify\(_T\(item\.name\)\+_T\(' 장착!'\)\);/);
  assert.match(SRC, /if\(pickupItem\(wi\.item\)\)\{wi\.picked=true;addParts\(/); // 세계습득 중복 SFX 없음
});
```

## 본편/easy·docs 동기화 (SOUND-item-sound-result.md 기록용)
- 본 판정은 game.html 기준. easy(game-easy-test.html)도 동일 SSOT·설계면 같은 교정 적용 가능 — root가 easy의 `pickupItem` 자동장착 부재를 동일 회귀로 확인 권장(이 세션 미확인 항목으로 분리).
- docs 제안: `docs/6사운드디자인/6사운드디자인.md` 아이템 사운드 항목에 "픽업=가방행, 자동장착 폐기(2026-09-01); 획득음 1회, 거부 무음; 자동장착음은 **제작** 경로(SFX.pickup+equip)에만" 명시. 수치·적용 미수행.

## 한계 · 미실행
- **읽기 전용**: TASK·두 테스트·원로그·`pickupItem`/`playItemPickupSfx`/`playEquipSfx`/세계습득/제작/수동 라인만 Read. 공유 test/·생산·타팀 파일 미편집 — 교정 diff/회귀는 **답변 코드로만** 제출(root 적용·실행·통합).
- **미실행**: 회귀를 이 세션에서 구동하지 않음 — 성공 주장 안 함. 청취·게임·서버·브라우저·Git·새 세션 없음. RNG/HOWL 과제 반복 0.
- **한계**: 회귀는 `pickupItem` 일반장비 경로를 실행(비-bonePart). bonePart 도감 등록/오슈어리(44287) 경로·제작 자동장착·수동장착은 구조 증거(string)로만 검증. 브레이스 스캔은 템플릿 `${}` 쌍 균형 전제(현 소스에서 성립). HEAD 696bda0c는 root 제공값으로 이 세션에서 직접 확인 불가(미기재).

수신·실제 Read·완료·미실행을 구분해 보고했습니다. 소유 범위(`tools/team-followup-20261001/SOUND/item-sound*` + 전용 result/receipt) 밖은 실행하지 않고 인계합니다.