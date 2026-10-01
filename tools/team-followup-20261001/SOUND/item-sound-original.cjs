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
