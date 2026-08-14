import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 7D.1 UX] context reason + blocked reachability ═══
// (1) extraction context reason("추출 불가") vs absorption("흡수 불가") 구분. core reason string 무변경.
// (2) blocked-only item(FLEX/keystone/legacy-only)에서 _extractionVM.blocked에 사유 노출(silent hide 금지).
// (3) no-affix item은 Extract UI 미노출(detail 조건 source anchor).
const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab = (re, n) => { const m = game.match(re); assert.ok(m, 'grab ' + n); return m[0]; };
const AFFIX_POOL = (() => { const s = game.indexOf('const AFFIX_POOL=['); const e = game.indexOf('\n];', s);
  return new Function('return ' + game.slice(s + 'const AFFIX_POOL='.length, e + 3).split('\n').filter(l => !l.trim().startsWith('//')).join('\n'))(); })();

function build(lang) { // lang: 'ko'|'en'
  const parts = [
    grab(/function _getAffixExtractionStatus\(item,affix\)\{[\s\S]*?\n\}/, 'exStatus'),
    grab(/function getExtractableAffixes\(item\)\{[\s\S]*?\n\}/, 'gea'),
    grab(/function _transferReasonText\(reason,ctx\)\{[\s\S]*?\n\}/, 'reason'),
    grab(/function _affixNameOf\(id\)\{[^}]*\}/, 'nameOf'),
    grab(/function _layerSubLabel\(layer,sub\)\{[^}]*\}/, 'lsl'),
    grab(/function _extractionVM\(item\)\{[\s\S]*?item is destroyed\.'\)\};\n\}/, 'exVM'),
  ].join('\n');
  const body = `const _L=(ko,en)=>${lang === 'en' ? 'en' : 'ko'};const _T=x=>x;const AFFIX_NAMES_KO={};
    ${parts}
    return {_transferReasonText,_extractionVM,_getAffixExtractionStatus,getExtractableAffixes};`;
  return new Function('AFFIX_POOL', body)(AFFIX_POOL);
}
const K = build('ko'), E = build('en');
const flex = AFFIX_POOL.find(a => a.sub !== 'A' && a.sub !== 'B' && a.sub !== 'LEGACY' && !a.keystone && !a.v2skip && a.layer >= 1 && a.layer <= 10);
const keystone = AFFIX_POOL.find(a => a.keystone);
const validAB = AFFIX_POOL.find(a => (a.sub === 'A' || a.sub === 'B') && !a.keystone && !a.v2skip && a.layer >= 1 && a.layer <= 10);
const item = (affs) => ({ id: 'i1', slot: 'weapon', layerLv: 10, affixes: affs });

// ── §1 context reason: extract vs absorb 구분 ──
test('§1 extraction ctx → "추출 불가", absorption(default) → "흡수 불가"', () => {
  assert.equal(K._transferReasonText('FLEX_BLOCKED', 'extract'), '추출 불가 옵션');
  assert.equal(K._transferReasonText('FLEX_BLOCKED'), '흡수 불가 옵션');       // default=absorb
  assert.equal(K._transferReasonText('FLEX_BLOCKED', 'absorb'), '흡수 불가 옵션');
  assert.equal(E._transferReasonText('KEYSTONE_BLOCKED', 'extract'), 'Non-extractable option');
  assert.equal(E._transferReasonText('KEYSTONE_BLOCKED', 'absorb'), 'Non-transferable option');
  assert.equal(K._transferReasonText('WRONG_SUB', 'absorb'), '흡수 불가 옵션'); // 흡수 전용 reason
  // default fallback 유지(blank 금지)
  assert.equal(K._transferReasonText('___UNKNOWN___'), '불가');
});

// ── §2 blocked-only item — reason reachable via _extractionVM.blocked ──
test('§2 FLEX-only item — candidates 0, blocked에 사유(추출 불가) 노출', () => {
  assert.ok(flex, 'FLEX affix 존재');
  const vm = K._extractionVM(item([{ id: flex.id, tier: 3, value: 0.5 }]));
  assert.equal(vm.ok, true);
  assert.equal(vm.candidates.length, 0, 'extractable 0');
  assert.equal(vm.hasAffixes, true, 'affix 존재(hasAffixes)');
  assert.equal(vm.blocked.length, 1, 'blocked 1');
  assert.equal(vm.blocked[0].affixId, flex.id);
  assert.equal(vm.blocked[0].reason, 'FLEX_BLOCKED');
  assert.equal(vm.blocked[0].reasonText, '추출 불가 옵션', 'extract context 문구');
});

test('§2b keystone-only item — blocked 사유 노출', () => {
  assert.ok(keystone, 'keystone affix 존재');
  const vm = K._extractionVM(item([{ id: keystone.id, tier: 2, value: 1 }]));
  assert.equal(vm.candidates.length, 0);
  assert.equal(vm.blocked.some(b => b.reason === 'KEYSTONE_BLOCKED'), true);
});

// ── §3 mixed: 일부 extractable + 일부 blocked 동시 노출 ──
test('§3 mixed item — extractable candidate + blocked 사유 공존', () => {
  const vm = K._extractionVM(item([{ id: validAB.id, tier: 2, value: 0.3 }, { id: flex.id, tier: 1, value: 0.2 }]));
  assert.equal(vm.candidates.length, 1, 'extractable 1');
  assert.equal(vm.candidates[0].affixId, validAB.id);
  assert.equal(vm.blocked.length, 1, 'blocked 1');
  assert.equal(vm.blocked[0].affixId, flex.id);
});

// ── §4 distinguish: no-affix item vs blocked-only ──
test('§4 no-affix item — hasAffixes false (Extract UI 미노출 근거)', () => {
  const vm = K._extractionVM(item([]));
  assert.equal(vm.ok, true);
  assert.equal(vm.hasAffixes, false);
  assert.equal(vm.candidates.length, 0);
  assert.equal(vm.blocked.length, 0);
});

// ── §5 source anchors: detail 버튼 조건 + blocked 렌더 + equipped bag-only ──
test('§5 source anchor — detail 조건 affixes>0 · panel blocked 렌더 · reason ctx', () => {
  // detail 카드 Extract 버튼 = affixes.length>0 (getExtractable>0 아님) → blocked-only도 노출
  assert.match(game, /Array\.isArray\(it\.affixes\)&&it\.affixes\.length>0\)\?`<div class="id-btn" onclick="_openExtractPanel/);
  // extract 패널이 vm.blocked를 사유와 함께 렌더
  assert.match(game, /for\(const b of \(vm\.blocked\|\|\[\]\)\)\{h\+=/);
  assert.match(game, /_transferReasonText\(st\.reason,'extract'\)/, '추출 사유는 extract context');
  // core reason string 무변경(rename 안 함)
  assert.match(game, /reason:'FLEX_BLOCKED'/);
  assert.match(game, /reason:'KEYSTONE_BLOCKED'/);
});
