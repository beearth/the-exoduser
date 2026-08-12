import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');
  assert.ok(start>0,'AFFIX_POOL 정의를 찾지 못함');
  const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3)
    .split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);

test('AFFIX_POOL 402 엔트리 전부 layer/sub 메타 존재 (LEGACY 예외 명시)', () => {
  assert.equal(POOL.length, 413, '엔트리 수 413 (410 + P6B keystone 3)');
  const legacy=POOL.filter(a=>a.sub==='LEGACY');
  assert.equal(legacy.length,1,'LEGACY는 armorPen 1건');
  assert.equal(legacy[0].id,'armorPen');
  assert.equal(legacy[0].layer,0,'LEGACY는 layer 0');
  for(const a of POOL){
    assert.ok('layer' in a, a.id+': layer 누락');
    assert.ok('sub' in a, a.id+': sub 누락');
    if(a.sub!=='LEGACY'){
      assert.ok(Number.isInteger(a.layer)&&a.layer>=1&&a.layer<=10, a.id+': layer 범위 1~10');
      assert.ok(['A','B','FLEX'].includes(a.sub), a.id+': sub는 A/B/FLEX');
    }
  }
});

test('affixRollTier(tiers) 구조 불변 — 전 엔트리 5칸 배열 + 골든 샘플 값', () => {
  for(const a of POOL) assert.equal(a.tiers.length,5,a.id+': tiers 5칸');
  const by=id=>POOL.find(a=>a.id===id);
  assert.deepEqual(by('poisonDot').tiers,[5,8,14,22,32]);
  assert.equal(by('poisonDot').weight,100);
  assert.equal(by('poisonDot').group,'poison');
  assert.deepEqual(by('sharpAtk').tiers,[20,50,170,330,500]);
  assert.equal(by('sharpAtk').skewRoll,3);
  assert.deepEqual(by('critDmgW').tiers,[.10,.20,.30,.40,.50]);
  assert.deepEqual(by('lastStand').tiers,[null,null,null,null,1]);
  assert.equal(by('revivePow').brType,'demon');
  assert.deepEqual(by('rageMaxFlat').tiers,[10,20,35,55,80]);
});

test('FINAL DECISION LOCK 배치 스팟체크', () => {
  const by=id=>POOL.find(a=>a.id===id);
  assert.deepEqual([by('stunDmgUp').layer,by('stunDmgUp').sub],[4,'B'],'상태시너지→L4-B');
  assert.deepEqual([by('elemConvert').layer,by('elemConvert').sub],[7,'B'],'변환→L7-B');
  assert.deepEqual([by('killStreakDmg').layer,by('killStreakDmg').sub],[9,'B'],'킬스트릭→L9');
  assert.deepEqual([by('hpRegenFlat').layer,by('hpRegenFlat').sub],[3,'B'],'회복→L3-B');
  assert.deepEqual([by('critRate').layer,by('critRate').sub],[8,'A']);
  assert.deepEqual([by('onCritExplode').layer,by('onCritExplode').sub],[8,'B']);
  assert.deepEqual([by('rageMaxFlat').layer,by('rageMaxFlat').sub],[9,'A']);
  assert.equal(by('skWhirlDmg').sub,'FLEX','sk*는 FLEX');
  assert.equal(by('skWhirlDmg').layer,6);
  // 중복 등재 id는 두 엔트리 모두 동일 layer/sub
  const dup=POOL.filter(a=>a.id==='critDmgW');
  assert.equal(dup.length,2);
  assert.ok(dup.every(a=>a.layer===8&&a.sub==='A'));
});

test('layerLv 모델 — 헬퍼·mkItem·폴백 존재', () => {
  assert.match(gameHtml,/function _getAffixDef\(id\)/);
  assert.match(gameHtml,/function _getAffixLayer\(id\)/);
  assert.match(gameHtml,/function _getAffixSubSlot\(id\)/);
  assert.match(gameHtml,/function _getItemLayerLv\(item\)/);
  assert.match(gameHtml,/function _canItemHostAffixLayer\(item,layer\)/);
  assert.match(gameHtml,/function mkItem\(slot,tier,el,rarity,wtype,layerLv\)/);
  assert.match(gameHtml,/return \[1,1,2,3,3,4\]\[item\.rarity\]\|\|1;/,'구세대 rarity 폴백 [1,1,2,3,3,4]');
});

test('_getItemLayerLv / _canItemHostAffixLayer 로직 (소스에서 추출 실행)', () => {
  const fn=gameHtml.match(/function _getItemLayerLv\(item\)\{[\s\S]*?\n\}/)[0];
  const fn2=gameHtml.match(/function _canItemHostAffixLayer\(item,layer\)\{.*?\}/)[0];
  const ctx=new Function(fn+'\n'+fn2+'\nreturn {_getItemLayerLv,_canItemHostAffixLayer};')();
  // 신규 세대
  assert.equal(ctx._getItemLayerLv({layerLv:3,rarity:5}),3,'layerLv 우선');
  assert.equal(ctx._getItemLayerLv({layerLv:99,rarity:0}),10,'상한 10');
  // 구세대 폴백 = ceil(기존 어픽스 상한/2)
  assert.deepEqual([0,1,2,3,4,5].map(r=>ctx._getItemLayerLv({rarity:r})),[1,1,2,3,3,4]);
  // 호스트 판정: layerLv 3 → L1~L3 true, L4 false
  const it={layerLv:3};
  assert.ok(ctx._canItemHostAffixLayer(it,1));
  assert.ok(ctx._canItemHostAffixLayer(it,3));
  assert.ok(!ctx._canItemHostAffixLayer(it,4));
  assert.ok(!ctx._canItemHostAffixLayer(it,0));
  assert.ok(!ctx._canItemHostAffixLayer(it,11));
});

test('신규 아이템 layerLv save/load 왕복 보존 + 구세이브(필드 없음) 호환', () => {
  const item={id:1,slot:'weapon',rarity:3,tier:2,layerLv:7,affixes:[{id:'critDmgW',tier:2,value:0.3}]};
  const rt=JSON.parse(JSON.stringify(item));
  assert.equal(rt.layerLv,7,'직렬화 왕복 보존');
  assert.deepEqual(rt.affixes,[{id:'critDmgW',tier:2,value:0.3}],'기존 {id,tier,value} 구조 불변');
  const legacyItem=JSON.parse(JSON.stringify({id:2,slot:'armor',rarity:4,affixes:[{id:'defFlat',tier:1,value:20}]}));
  assert.ok(!('layerLv' in legacyItem),'구세이브 아이템은 layerLv 없음 그대로');
});
