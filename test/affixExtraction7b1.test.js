import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 7B.1 / LOCK-42 hardening] EXTRACTION CONTRACT HARDENING ═══
// (1) FLEX extraction BLOCK (LOCK-43A 선행) 재확인 + failure mutation 0.
// (2) bag-slot 승계: source._gx/_gy → stone, same-slot 교체(splice(idx,1,stone)). bag count 불변·full bag 가능·
//     null-grid 미생성·_invFindSpace 비의존. (3) affixStone salvage/junk 소각 차단(source anchor).
// game.html 실제 함수 verbatim 실행.
const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab = (re, n) => { const m = game.match(re); assert.ok(m, 'grab fail ' + n); return m[0]; };
const AFFIX_POOL = (() => { const s = game.indexOf('const AFFIX_POOL=['); const e = game.indexOf('\n];', s);
  return new Function('return ' + game.slice(s + 'const AFFIX_POOL='.length, e + 3).split('\n').filter(l => !l.trim().startsWith('//')).join('\n'))(); })();

function build(findSpaceRet) {
  const parts = [
    grab(/function _getAffixExtractionStatus\(item,affix\)\{[\s\S]*?\n\}/, 'exStatus'),
    grab(/function getExtractableAffixes\(item\)\{[\s\S]*?\n\}/, 'gea'),
    grab(/function _createExtractedAffix\(affix\)\{[\s\S]*?\n\}/, 'create'),
    grab(/function extractAffix\(sourceItemId,affixId\)\{[\s\S]*?\n\}/, 'extract'),
  ].join('\n');
  const body = `let INV={bag:[],equipped:{}};let _saveN=0;
    function _invFindSpace(){return _FSR;}
    function dbSaveForce(){_saveN++}
    ${parts}
    return {extractAffix,getExtractableAffixes,_getAffixExtractionStatus,_createExtractedAffix,
      setBag:b=>{INV.bag=b},getBag:()=>INV.bag,setEquip:(s,it)=>{INV.equipped[s]=it},saveN:()=>_saveN};`;
  return new Function('AFFIX_POOL', '_FSR', body)(AFFIX_POOL, findSpaceRet === undefined ? { x: 0, y: 0 } : findSpaceRet);
}
const validAB = AFFIX_POOL.find(a => (a.sub === 'A' || a.sub === 'B') && !a.keystone && !a.v2skip && a.layer >= 1 && a.layer <= 10);
const flex = AFFIX_POOL.find(a => a.sub !== 'A' && a.sub !== 'B' && a.sub !== 'LEGACY' && !a.keystone && !a.v2skip && a.layer >= 1 && a.layer <= 10);
const srcItem = (over) => Object.assign({ id: 's1', slot: 'weapon', rarity: 4, layerLv: 10, _gx: 3, _gy: 5, affixes: [] }, over);

// ── §1 bag-slot 승계 — stone이 source _gx/_gy 승계 · 동일 index · bag count 불변 · null-grid 아님 ──
test('§1 bag-slot inheritance — stone._gx/_gy = source, same index, count 불변', () => {
  const A = build();
  const it = srcItem({ affixes: [{ id: validAB.id, tier: 2, value: 0.3 }] });
  A.setBag([{ id: 'x0', slot: 'ring1', _gx: 0, _gy: 0, affixes: [] }, it]); // it at index 1
  const before = A.getBag().length;
  const r = A.extractAffix('s1', validAB.id);
  assert.equal(r.ok, true, 'extraction 성공');
  const bag = A.getBag();
  assert.equal(bag.length, before, 'bag count 불변(remove1+add1 동일슬롯)');
  assert.equal(bag[1].type, 'affixStone', 'source 자리(index 1)에 stone 교체');
  assert.equal(bag[1]._gx, 3, 'stone._gx = source._gx');
  assert.equal(bag[1]._gy, 5, 'stone._gy = source._gy');
  assert.ok(bag[1]._gx != null && bag[1]._gy != null, 'null-grid stone 아님');
  assert.equal(bag.filter(i => i.id === 's1' && i.type !== 'affixStone').length, 0, 'source item 통째 제거');
});

// ── §2 _invFindSpace 비의존 — full bag(_invFindSpace null)에서도 성공 + 승계 ──
test('§2 full-bag / _invFindSpace null 무관 — 성공·승계 유지', () => {
  const A = build(null); // _invFindSpace가 null 반환(가방 가득 가정)
  const it = srcItem({ affixes: [{ id: validAB.id, tier: 1, value: 0.2 }] });
  A.setBag([it]);
  const r = A.extractAffix('s1', validAB.id);
  assert.equal(r.ok, true, 'full bag에서도 extraction 성공(_invFindSpace 미의존)');
  assert.equal(A.getBag().length, 1, 'count 불변');
  assert.equal(A.getBag()[0]._gx, 3, '_gx 승계(null-grid 미생성)');
  assert.equal(A.getBag()[0]._gy, 5, '_gy 승계');
});

// ── §3 FLEX extraction BLOCK (LOCK-43A) + failure mutation 0 ──
test('§3 FLEX extraction BLOCK + failure mutation 0', () => {
  assert.ok(flex, 'FLEX affix 존재(pool)');
  const A = build();
  const it = srcItem({ affixes: [{ id: flex.id, tier: 3, value: 0.5 }] });
  A.setBag([it]);
  const snap = JSON.stringify(A.getBag());
  // getExtractable 노출 0
  assert.equal(A.getExtractableAffixes(it).some(e => e.affixId === flex.id), false, 'FLEX는 extractable 목록 제외');
  // 직접 호출 BLOCK
  const r = A.extractAffix('s1', flex.id);
  assert.equal(r.ok, false, 'FLEX extraction 거부');
  assert.equal(r.reason, 'FLEX_BLOCKED', 'reason=FLEX_BLOCKED');
  assert.equal(JSON.stringify(A.getBag()), snap, 'failure mutation 0(bag 불변)');
  assert.equal(A.saveN(), 0, '실패 시 save 미호출');
});

// ── §4 salvage/junk 소각 차단 + bag-slot 코드 (source anchor) ──
test('§4 source anchor — salvage/junk affixStone 차단 · bag-slot 승계 코드', () => {
  assert.match(game, /if\(it&&it\.type==='affixStone'\)return 0;/, 'salvageVal(affixStone)=0');
  assert.match(game, /if\(INV\.bag\[idx\]&&INV\.bag\[idx\]\.type==='affixStone'\)continue;/, '분해 splice에서 affixStone skip');
  assert.match(game, /!it\.fav&&it\.type!=='affixStone'/, 'junk 지정에서 affixStone 제외');
  assert.match(game, /stone\._gx=\(src\._gx!=null\)\?src\._gx:null;stone\._gy=\(src\._gy!=null\)\?src\._gy:null;/, 'bag-slot 승계 코드');
  assert.match(game, /INV\.bag\.splice\(commitIdx,1,stone\);/, 'same-slot 원자 교체(splice replace)');
  // ordinary item 분해는 여전히 splice(변경 없음)
  assert.match(game, /for\(const idx of idxArr\)\{if\(INV\.bag\[idx\]&&INV\.bag\[idx\]\.type==='affixStone'\)continue;INV\.bag\.splice\(idx,1\);\}/, '일반 아이템 분해 splice 유지');
});
