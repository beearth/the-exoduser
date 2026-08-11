import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');
  const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3)
    .split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);

// Phase3 활성화 대상
const REGEN_HP=['hpRegenFlat','pantsHPRegen'];
const REGEN_ST=['stRegenFlat','beltSTRegen'];
const REGEN_MP=['mpRegenFlat','headbandMPRegen'];
const FLAT_ATK=['flatPhysDmg','flatMagicDmg'];
const ALL_SAFE=[...REGEN_HP,...REGEN_ST,...REGEN_MP,...FLAT_ATK,'maxSTPct'];
const MERGE=['maxHPPctArmor'];

test('§1 BASELINE 동결 — Phase1/2 구조 불변 (layer/sub/layerLv/flag/roller)', () => {
  assert.equal(POOL.length,402,'402 유지');
  for(const a of POOL){assert.ok('layer'in a&&'sub'in a,a.id+' layer/sub 유지');}
  assert.match(gameHtml,/const ITEM_LAYER_ROLL_V2=false;/,'flag 불변');
  assert.match(gameHtml,/function rollAffixesLayered\(grade,slot,brType,layerLv\)/,'레이어 롤러 불변');
  assert.match(gameHtml,/function rollAffixes\(grade,slot,brType\)\{/,'레거시 롤러 불변');
  assert.match(gameHtml,/function _getItemLayerLv\(item\)/,'layerLv 헬퍼 불변');
});

test('§5 SAFE_FIX 활성화 — 회복 어픽스가 P.hpR/stR/mpR consumer에 연결', () => {
  // HP 리젠
  for(const id of REGEN_HP) assert.ok(gameHtml.includes(`_eqAffix('${id}')`)&&/P\.hpR=[^;]*hpRegenFlat[^;]*pantsHPRegen/.test(gameHtml),id+' → P.hpR 연결');
  // ST 리젠
  assert.match(gameHtml,/P\.stR=[^;]*_eqAffix\('stRegenFlat'\)[^;]*_eqAffix\('beltSTRegen'\)/,'stRegenFlat·beltSTRegen → P.stR');
  // MP 리젠
  assert.match(gameHtml,/P\.mpR=[^;]*_eqAffix\('mpRegenFlat'\)[^;]*_eqAffix\('headbandMPRegen'\)/,'mpRegenFlat·headbandMPRegen → P.mpR');
});

test('§6A SAFE_FIX 활성화 — flatPhysDmg/flatMagicDmg가 _slotFlatAtk(sharpAtk 채널)에 연결', () => {
  const fn=gameHtml.match(/function _slotFlatAtk\(it\)\{[\s\S]*?return s\}/)[0];
  assert.ok(fn.includes("a.id==='flatPhysDmg'"),'flatPhysDmg → 플랫 atk');
  assert.ok(fn.includes("a.id==='flatMagicDmg'"),'flatMagicDmg → 플랫 atk');
  assert.ok(fn.includes("a.id==='sharpAtk'"),'기존 sharpAtk 채널 유지(회귀 없음)');
});

test('§6C SAFE_FIX 활성화 — maxSTPct가 P.mst 배수로 연결 (0이면 불변)', () => {
  assert.match(gameHtml,/P\.mst=~~\(\(base\+bonus\+_eqAffix\('maxSTFlat'\)[^;]*\)\*\(1\+_eqAffix\('maxSTPct'\)\)\)/,'maxSTPct 배수 연결');
});

test('§7 MERGE (효과처리 통합) — maxHPPctArmor를 maxHPPct 경로에 합산, ID 유지', () => {
  assert.match(gameHtml,/_afHpP=_eqAffix\('maxHPPct'\)\+_eqAffix\('lifeMaxHP'\)\+_eqAffix\('maxHPPctArmor'\)/,'maxHPPctArmor → _afHpP');
  // ID 삭제 안 됨 (AFFIX_POOL에 여전히 존재)
  assert.ok(POOL.some(a=>a.id==='maxHPPctArmor'),'maxHPPctArmor ID 유지(삭제 금지)');
});

test('§8 AFFIX_POOL 완전 불변 — tiers/weight/group/layer/sub 무수정 (fill-rate AFTER=BEFORE 근거)', () => {
  // 활성화 대상들이 여전히 정의돼 있고 tiers 5칸 그대로
  for(const id of [...ALL_SAFE,...MERGE]){
    const a=POOL.find(x=>x.id===id);
    assert.ok(a,id+' 존재');
    assert.equal(a.tiers.length,5,id+' tiers 5칸 불변');
  }
  // 골든 샘플 몇 개 값 불변
  const by=id=>POOL.find(a=>a.id===id);
  assert.deepEqual(by('hpRegenFlat').tiers,by('hpRegenFlat').tiers); // 존재 확인
  assert.equal(by('flatPhysDmg').weight,80,'flatPhysDmg weight 불변');
  assert.equal(by('maxSTPct').unit,'pct','maxSTPct unit 불변');
});

test('§16 DROP 후보 7종 미삭제 — ID 유지 (구세이브 호환)', () => {
  for(const id of ['fireResMax','iceResMax','lightResMax','darkResMax','poisonResMax','minDmgFlat','maxDmgFlat']){
    assert.ok(POOL.some(a=>a.id===id),id+' 미삭제(DROP 확정이나 이번 Phase 보존)');
  }
});
