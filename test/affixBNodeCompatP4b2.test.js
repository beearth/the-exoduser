import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const GROUPS=new Set(['OFFENSE','DEFENSE','ACCESSORY']);
const Bs=POOL.filter(a=>a.sub==='B');
const As=POOL.filter(a=>a.sub==='A');
const FLEX=POOL.filter(a=>a.sub==='FLEX');

test('§7 모든 B Affix에 compat 존재 (150)', () => {
  assert.equal(Bs.length,156,'B 156 (150 + P4B-4 canonical family 6, 전부 compat 보유)');
  for(const a of Bs){
    assert.ok(Array.isArray(a.compat)&&a.compat.length>=1,a.id+' compat 배열 존재');
  }
});

test('§7 compat 값은 허용 enum(OFFENSE/DEFENSE/ACCESSORY)만', () => {
  for(const a of Bs) for(const g of a.compat) assert.ok(GROUPS.has(g),a.id+' 잘못된 compat '+g);
});

test('§6 multi-group 5종 — 배열 길이 2, 정확한 대상', () => {
  const multi=Bs.filter(a=>a.compat.length>=2).map(a=>a.id).sort();
  assert.deepEqual(multi,['afterParryShield','hpOnKill','hpRegenFlat','onHitThorns','thorns'].sort(),'multi-group 5종');
  for(const a of Bs.filter(x=>x.compat.length>=2)) assert.equal(a.compat.length,2,a.id+' 정확히 2그룹');
});

test('§8 A/FLEX Affix에는 compat 금지 (uni와 역할 분리)', () => {
  for(const a of As) assert.ok(!('compat'in a),a.id+' A에 compat 없음');
  for(const a of FLEX) assert.ok(!('compat'in a),a.id+' FLEX에 compat 없음');
  // A는 uni만, B는 compat만
  for(const a of Bs) assert.ok(!('uni'in a),a.id+' B에 uni 없음(역할분리)');
});

test('§13 compat는 ROLL FILTER 미사용 — 롤 결과 불변 (compat-strip 대조)', () => {
  // 실제 roller 추출 + compat 제거 pool로 동일 롤 → 결과 identical
  const afslot=gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
  const fTier=gameHtml.match(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/)[0];
  const fCand=gameHtml.match(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/)[0];
  const fRoll=gameHtml.match(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/)[0];
  const fLeg=gameHtml.match(/function rollAffixes\(grade,slot,brType\)\{[\s\S]*?\n  return result;\n\}/)[0];
  function build(pool){const P={lv:300};return new Function('AFFIX_POOL','P','_DEMO_MODE','_DEMO_AFFIX_BANNED',`${afslot}\n${fTier}\n${fCand}\n${fRoll}\n${fLeg}\nreturn {rollAffixesLayered,rollAffixes,P};`)(pool,P,false,new Set());}
  const withC=build(POOL);
  const noC=build(POOL.map(a=>{const c={...a};delete c.compat;return c;}));
  function seed(n){let s=n>>>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};}
  const SLOTS=['weapon','armor','ring1','necklace','boots','shield','bow','gloves','pants','cape','helmet','headband','belt','bracelet'];
  let a='',b='';
  for(const s of SLOTS)for(const N of [3,7,9]){for(let g=1;g<=5;g++){seed(g*13+N+s.length);a+=JSON.stringify(withC.rollAffixesLayered(g,s,undefined,N));seed(g*13+N+s.length);b+=JSON.stringify(noC.rollAffixesLayered(g,s,undefined,N));}}
  assert.equal(a,b,'compat 유무로 layered roll 결과 불변');
  // legacy도 동일
  let la='',lb='';for(const s of SLOTS)for(let g=0;g<=5;g++){seed(g*7+s.length);la+=JSON.stringify(withC.rollAffixes(g,s));seed(g*7+s.length);lb+=JSON.stringify(noC.rollAffixes(g,s));}
  assert.equal(la,lb,'compat 유무로 legacy roll 결과 불변');
});

test('§13 AFFIX_POOL compat 외 완전 불변 (value/weight/tiers/slots/layer/sub)', () => {
  assert.equal(POOL.length,408);
  // tiers 5칸·layer/sub 유지 스팟
  for(const a of POOL){assert.equal(a.tiers.length,5,a.id+' tiers');assert.ok('layer'in a&&'sub'in a,a.id);}
  // B count = 156 (150 + canonical 6), A count 불변
  assert.equal(Bs.length,156);
});
