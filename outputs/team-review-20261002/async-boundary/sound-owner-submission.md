`ghost_laugh`는 `sfx/ghost_laugh.mp3`로 매핑(10003)되고 에셋 존재 — **등록음 누락 결함 없음**. bonePart 분기의 실제 소리/RNG 계약을 실행 검증하는 회귀를 제출합니다.

## 판정 (실제 소스 기준, 구조 문자열이 아닌 실행 계약)

`pickupItem` bonePart 분기(15677–15687) + `_boneRegister`(44315) + `_grantOssuaryIfNeeded`(44368) 실측:

| 경로 | 조건 | 등록음 `ghost_laugh` | 획득음 `playItemPickupSfx` | RNG |
|---|---|---|---|---|
| **등록 성공**(신규/상위 pts) | `_boneRegister` true → `return true` (가방 미접촉) | **1** (`_r(1.2,.1)`) | **0** | `_r`×1 |
| **중복/하위**(기존 pts≥신규) + 가방 여유 | `_boneRegister` false → 가방행 | 0 | **1** (`_r(1,.05)`+pool `Math.random`) | `_r`×1, `Math.random`×1 |
| **중복/하위 + 가방 가득** | 가방 full → pop·거부 | 0 | **0** | **0 (무음)** |
| 세트 완성 전환 | 등록 성공 + `_ossSetComplete` 신규 true | 1 (추가 notify/addTxt/shake, **추가음 없음**) | 0 | `_r`×1 |

- **이중음 없음**: 등록 성공은 가방 진입 전에 return → `playItemPickupSfx` 미호출. 가방 경로는 `ghost_laugh` 미호출.
- `_grantOssuaryIfNeeded`는 첫 부위에만 유골함 지급(미보유 시) — **소리·RNG 없음**, 재호출 시 early-return(멱등).
- 등록음 에셋/키 유효, `_r`·`Math.random` 소비 일관. → **실결함 미재현 → 생산 patch 없음**(조건부 "결함 재현 시"에 해당 없음).

## 회귀 fixture (owned `tools/team-followup-20261001/SOUND/bone-pickup-regression.cjs`)

실제 `pickupItem`/`_boneRegister`/`_grantOssuaryIfNeeded`/`playItemPickupSfx`를 추출·실행해 경로별 소리/RNG 횟수를 검증(문자열 가정 아님).

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../../..');
const SRC = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
function extractFn(sig) {                 // 중괄호 균형 스캔(템플릿 ${} 쌍 균형 전제)
  const i = SRC.indexOf(sig); assert.ok(i >= 0, 'not found: ' + sig);
  let d = 0, started = false;
  for (let k = i; k < SRC.length; k++) {
    const c = SRC[k];
    if (c === '{') { d++; started = true; }
    else if (c === '}') { d--; if (started && d === 0) return SRC.slice(i, k + 1); }
  }
  throw new Error('unbalanced: ' + sig);
}
const pickupItemSrc = extractFn('function pickupItem(item){');
const boneRegSrc    = extractFn('function _boneRegister(item){');
const grantSrc      = extractFn('function _grantOssuaryIfNeeded(){');
const playPickupSrc = SRC.split('\n').find(l => l.startsWith('function playItemPickupSfx(item){'));
assert.ok(playPickupSrc, 'playItemPickupSfx found');

// fixture: bone part 아이템
const bonePart = (anc, part, rarity, tier, name = 'bone') => ({ slot: 'bonePart', anc, part, rarity, tier, name });

function harness({ full = false, preCollect = {}, ossuaryOwned = false } = {}) {
  const c = { registerN: 0, grabN: 0, rngR: 0, rngMath: 0, mkItemN: 0, notifies: [] };
  const seq = [0, 0, 0, 0, 0, 0]; let mi = 0;
  const IM = {}; for (const k of Object.getOwnPropertyNames(Math)) IM[k] = Math[k];
  IM.random = () => { c.rngMath++; return seq[mi++ % seq.length]; };
  const ctx = {
    _PICKUP_SFX_POOL: ['pickup_item', 'pickup_rummage1', 'pickup_rummage2', 'pickup_rummage3', 'pickup_rummage4', 'pickup_rummage5'],
    ANC_ROSTER: [{ id: 'iron_warlord', ko: '철갑 전대', en: 'Iron Warlord' }],
    _ossSetComplete: () => false,
    mkItem: () => { c.mkItemN++; return { slot: 'ossuary', name: '전대의 유골함' }; },
    _itemSz: () => [1, 1],
    INV: { bag: [], equipped: { ossuary: ossuaryOwned ? { slot: 'ossuary' } : null }, ossCollect: Object.assign({}, preCollect) },
    _invFindSpace: () => full ? null : { x: 0, y: 0 },
    notify: (m) => c.notifies.push(m), _T: x => x, _rarName: () => '', _L: (k) => k,
    Date: { now: () => 0 }, P: { x: 0, y: 0 }, addTxt: () => {}, shake: () => {}, recalcSt: () => {},
    dbSaveForce: () => {}, window: {}, EL: { P: 0 },
    _r: (a) => { c.rngR++; return a; },
    Math: IM,
    playSample: (key) => { if (key === 'ghost_laugh') c.registerN++; else if (/^pickup_/.test(key)) c.grabN++; },
    console
  };
  vm.createContext(ctx);
  vm.runInContext([boneRegSrc, grantSrc, playPickupSrc, pickupItemSrc].join('\n'), ctx);
  const run = (item) => vm.runInContext('pickupItem(' + JSON.stringify(item) + ')', ctx);
  return { c, ctx, run };
}

test('증거: bonePart 분기·헬퍼 추출', () => {
  assert.ok(pickupItemSrc.includes("if(item.slot==='bonePart'){"));
  assert.ok(boneRegSrc.includes("playSample('ghost_laugh'"));
  console.log('pickupItem=' + pickupItemSrc.length + ' boneReg=' + boneRegSrc.length);
});

test('등록 성공(신규): ghost_laugh 1 · 획득음 0 · 가방 미사용 · 유골함 자동지급', () => {
  const { c, ctx, run } = harness();
  const ret = run(bonePart('iron_warlord', 'skull', 1, 1));
  assert.equal(ret, true);
  assert.equal(c.registerN, 1); assert.equal(c.grabN, 0);
  assert.equal(c.rngR, 1); assert.equal(c.rngMath, 0);
  assert.equal(ctx.INV.bag.length, 0, '등록 성공은 가방에 넣지 않음');
  assert.ok(ctx.INV.ossCollect['iron_warlord_skull'], '도감 등록됨');
  assert.ok(ctx.INV.equipped.ossuary, '첫 부위 유골함 자동지급'); assert.equal(c.mkItemN, 1);
});

test('중복/하위(기존 pts≥) + 가방 여유: 획득음 1 · ghost_laugh 0 · 가방행', () => {
  const { c, ctx, run } = harness({ preCollect: { 'iron_warlord_skull': { r: 3, t: 3 } }, ossuaryOwned: true });
  const ret = run(bonePart('iron_warlord', 'skull', 1, 1)); // pts 2 <= 기존 6 → 거부→가방
  assert.equal(ret, true);
  assert.equal(c.registerN, 0); assert.equal(c.grabN, 1);
  assert.equal(c.rngR, 1); assert.equal(c.rngMath, 1, 'pool 선택 Math.random 1회');
  assert.equal(ctx.INV.bag.length, 1, '중복은 가방으로');
});

test('중복/하위 + 가방 가득: 무음(등록0·획득0·RNG0) · false · 롤백', () => {
  const { c, ctx, run } = harness({ full: true, preCollect: { 'iron_warlord_skull': { r: 3, t: 3 } }, ossuaryOwned: true });
  const ret = run(bonePart('iron_warlord', 'skull', 1, 1));
  assert.equal(ret, false);
  assert.equal(c.registerN, 0); assert.equal(c.grabN, 0);
  assert.equal(c.rngR, 0); assert.equal(c.rngMath, 0);
  assert.equal(ctx.INV.bag.length, 0, '가방 롤백');
});

test('상위 재등록: 더 높은 pts는 다시 ghost_laugh(갱신)', () => {
  const { c, ctx, run } = harness({ preCollect: { 'iron_warlord_skull': { r: 1, t: 0 } }, ossuaryOwned: true });
  const ret = run(bonePart('iron_warlord', 'skull', 3, 2)); // pts 5 > 기존 1 → 등록
  assert.equal(ret, true);
  assert.equal(c.registerN, 1); assert.equal(c.grabN, 0);
  assert.deepEqual(ctx.INV.ossCollect['iron_warlord_skull'], { r: 3, t: 2 });
});

test('연속 중복등록(같은 부위 3회): 성공→중복가방→상위갱신 소리 횟수', () => {
  const { c, ctx, run } = harness();
  run(bonePart('iron_warlord', 'torso', 2, 1)); // 성공 등록
  run(bonePart('iron_warlord', 'torso', 1, 1)); // pts2<=3 → 가방
  run(bonePart('iron_warlord', 'torso', 3, 2)); // pts5>3 → 재등록
  assert.equal(c.registerN, 2, '등록 2회(최초+상위갱신)');
  assert.equal(c.grabN, 1, '중복 1회만 가방 획득음');
  assert.equal(c.mkItemN, 1, '유골함 지급은 최초 1회만(멱등)');
});

test('유골함 기보유 시 자동지급/소리 없음', () => {
  const { c, ctx, run } = harness({ ossuaryOwned: true });
  run(bonePart('iron_warlord', 'arms', 1, 1));
  assert.equal(c.mkItemN, 0, '이미 보유 → 재지급 없음');
  assert.equal(c.registerN, 1);
});
```

## SOUND-item-sound-result.md 추가분 / docs 동기화 제안
- bonePart 획득 음향 계약을 `docs/6사운드디자인/6사운드디자인.md`에 명시 제안: "유골 부위 **도감 등록 성공 = `ghost_laugh`** 1회(획득음 없음); 중복/하위는 가방행으로 일반 **획득음** 1회; 가방 가득은 **무음 거부**; 유골함 자동지급은 소리 없음·첫 부위 멱등." 수치·적용 미수행.
- 본편/easy: 본 판정은 game.html 기준. easy 동일 구조 여부는 root가 같은 fixture로 확인 권장(이 세션 미확인 — easy 읽기는 범위 내였으나 이번 한 건은 본편 분기로 종결, 중복 방지).

## receipt 요약 (OWNER_NEXT_20261002-receipt.json 기록용, 한국어)
- 수신: 2026-10-02. 첫 Read: OWNER_NEXT_20261002.md → `pickupItem` bonePart 분기(15675–15701) → `_boneRegister`(44315)·`_grantOssuaryIfNeeded`(44368) → `ghost_laugh` 매핑(10003)·에셋 Glob.
- 첫 Edit/명령: **없음**(읽기 전용 도구만, Write/Bash/git 미제공). 생산·공유·타팀 파일 미접촉.
- 완료: bonePart 소리/RNG 계약 실측·판정, 실행 회귀 fixture 작성.
- 근거: 위 라인/함수 직접 Read. 한계·미실행 아래.

## 한계 · 미실행 (구분)
- **미실행**: 위 회귀를 이 세션에서 **구동하지 않음**(Write/Bash 미제공) — 성공 주장 안 함. root가 owned 경로에 저장 후 실행·통합.
- **한계**: 회귀는 실제 추출 `pickupItem`/`_boneRegister`/`_grantOssuaryIfNeeded`/`playItemPickupSfx`를 실행하되, 주변 의존(`ANC_ROSTER`,`_ossSetComplete`,`mkItem`,`_invFindSpace` 등)은 스텁(소리/RNG 횟수 검증에 충분, 실제 도감 UI·세이브 연동은 비대상). `playSample` 내부 rate `Math.random`은 스텁으로 제외(RNG는 호출부 `_r`/pool 선택 기준으로 계수) — 이전 RNG 과제와 중복 회피. 브레이스 스캔은 템플릿 `${}` 균형 전제(현 소스 성립).
- **실결함**: 미재현 → 생산 patch 없음(조건부 과제). 게임/브라우저/서버/빌드/이미지/청취/Git/권한/새세션/타팀메시지 **0**, 사용자 세이브·사운드 에셋/볼륨/생산연결 변경 **0**.

이번 한 건(종결) 인계합니다. 소유(`tools/team-followup-20261001/SOUND/` 이번 접두사 `bone-pickup-*` + OWNER_NEXT_20261002-receipt/result) 밖은 실행하지 않았습니다.