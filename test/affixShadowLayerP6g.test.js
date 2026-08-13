import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6G / LOCK-35] SHADOW LAYER TELEMETRY ═══
// production 무변경 관찰 전용 hook. flag off면 byte-identical, 독립 RNG(production Math.random 미소비),
// item 미변경. LOCK-34 추천 MODEL_A2 분포를 실 gameplay itemLv 스트림에 얹어 관측.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

// ── shadow 블록 추출 → 샌드박스(Math 주입 가능) ──
function buildShadow(injectMath){
  const start = gameHtml.indexOf('let _SHADOW_LAYER_LOG=false;');
  const end   = gameHtml.indexOf('if(typeof window!==', start); // window 라인 직전까지
  assert.ok(start > 0 && end > start, 'shadow 블록 추출 실패');
  // [P6J] shadow는 canonical _itemLayerCap/_itemLayerWeightsA2에 위임 → 샌드박스에 주입
  const canon = gameHtml.match(/function _itemLayerCap\(itemLv\)\{[^}]*\}/)[0]+'\n'+gameHtml.match(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/)[0];
  const body = canon + '\n' + gameHtml.slice(start, end) +
    '\nreturn {_shadowLayerCap,_shadowLayerWeights,_shadowRollLayer,_shadowObserve,_shadowReset,_shadowReport,' +
    'get _shadowHist(){return _shadowHist},' +  // live getter (reset가 재할당하므로 스냅샷 금지)
    'get model(){return _SHADOW_LAYER_MODEL},set model(v){_SHADOW_LAYER_MODEL=v},get log(){return _SHADOW_LAYER_LOG},set log(v){_SHADOW_LAYER_LOG=v}};';
  // 6H 확장: observe가 _AFSLOT/_keystoneCandidates/KEYSTONE_ROLL_RATE 참조 → typeof 가드로 미주입 시 skip
  return new Function('Math', 'console', body)(injectMath || Math, { log(){} });
}
const S = buildShadow();

function analyticP(cap, model){ // 정규화 weight = 이론 확률(idx0=L1)
  const w = S._shadowLayerWeights(cap, model);
  const sum = w.reduce((a,b)=>a+b,0);
  return w.map(x=>x/sum);
}
function bucket(p, lo, hi){ let s=0; for(let L=lo; L<=hi && L<=p.length; L++) s+=p[L-1]; return s; }
function mulberry(seed){ let a=seed>>>0; return function(){ a|=0;a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }

// ══════════════════════════════════════════════════════════════════════
test('§0 production 불변 — flag 기본 off · hook gated · 단일 관찰 지점', () => {
  assert.match(gameHtml, /let _SHADOW_LAYER_LOG=false;/, 'flag 기본 false(배포 상태)');
  // mkItem 관찰 hook = _SHADOW_LAYER_LOG 게이트 (off면 미진입 → byte-identical)
  assert.match(gameHtml, /if\(_SHADOW_LAYER_LOG\)_shadowObserve\(item\);/, 'hook은 flag 게이트');
  // 관찰 hook은 mkItem 안 정확히 1곳
  assert.equal([...gameHtml.matchAll(/_shadowObserve\(item\);/g)].length, 1, '관찰 호출 지점 1곳');
  // shadow 블록에 Math.random 없음 → 독립 RNG만 사용(production sequence 미소비)
  const start = gameHtml.indexOf('let _SHADOW_LAYER_LOG=false;');
  const end   = gameHtml.indexOf('if(typeof window!==', start);
  assert.equal(/Math\.random\(/.test(gameHtml.slice(start, end)), false, 'shadow 블록 Math.random() 미호출');
  // 두 production flag 여전히 false
  assert.match(gameHtml, /const ITEM_LAYER_ROLL_V2=true;/, 'V2 flag ON (P6J/LOCK-38 production 활성)');
  assert.match(gameHtml, /const KEYSTONE_ROLL_ENABLED=true;/, 'Keystone flag ON (P6K/LOCK-39)');
});

test('§1 layerCap = clamp(1+floor(itemLv/100),1,10) (LOCK-34 §1)', () => {
  const cases = [[0,1],[90,1],[100,2],[190,2],[290,3],[400,5],[590,6],[690,7],[700,8],[890,9],[900,10]];
  for(const [lv,cap] of cases) assert.equal(S._shadowLayerCap(lv), cap, `itemLv ${lv} → cap ${cap}`);
  assert.equal(S._shadowLayerCap(99999), 10, 'clamp 상한 10');
  assert.equal(S._shadowLayerCap(0), 1, 'clamp 하한 1');
});

test('§2 결정론 — reset(seed) 후 동일 draw sequence 재현', () => {
  S._shadowReset(0x1234);
  const seqA = Array.from({length:500}, () => S._shadowObserve({itemLv:900}) || S._shadowHist.byLayer.slice());
  const histA = S._shadowHist.byLayer.slice();
  S._shadowReset(0x1234);
  for(let i=0;i<500;i++) S._shadowObserve({itemLv:900});
  const histB = S._shadowHist.byLayer.slice();
  assert.deepEqual(histA, histB, '동일 seed → 동일 histogram');
  S._shadowReset(0x1234); const r1 = S._shadowRollLayer(900, mulberry(7), 'A2');
  const r2 = S._shadowRollLayer(900, mulberry(7), 'A2');
  assert.equal(r1, r2, '동일 rng seed → 동일 roll');
});

test('§3 sampler 정확도 — MC(100k) vs analytic weight 일치(±1.2%p)', () => {
  for(const cap of [1,3,5,8,10]){
    const itemLv = cap===10 ? 900 : (cap-1)*100;
    const an = analyticP(cap, 'A2');
    const rng = mulberry(0xBEEF ^ cap);
    const cnt = new Array(cap).fill(0), N = 100000;
    for(let i=0;i<N;i++) cnt[S._shadowRollLayer(itemLv, rng, 'A2')-1]++;
    for(let L=1;L<=cap;L++){
      const mc = cnt[L-1]/N;
      assert.ok(Math.abs(mc-an[L-1]) < 0.012, `cap${cap} L${L}: MC ${(mc*100).toFixed(1)}% vs an ${(an[L-1]*100).toFixed(1)}%`);
    }
  }
});

test('§4 MODEL_A2 shape (cap10) — T10 희소·저층 잔존·mode=L7 (LOCK-34 §4/§7/§8)', () => {
  const p = analyticP(10, 'A2');
  const L10 = p[9]*100, L8_10 = bucket(p,8,10)*100, L1_4 = bucket(p,1,4)*100;
  assert.ok(L10 >= 3 && L10 <= 6, `L10 jackpot ${L10.toFixed(1)}% ∈[3,6]`);
  assert.ok(L8_10 >= 30 && L8_10 <= 38, `L8-10 ${L8_10.toFixed(1)}% ∈[30,38]`);
  assert.ok(L1_4 >= 13 && L1_4 <= 18, `L1-4 저층 잔존 ${L1_4.toFixed(1)}% ∈[13,18]`);
  const mode = p.indexOf(Math.max(...p)) + 1;
  assert.equal(mode, 7, `mode = cap-3 = L7 (got L${mode})`);
  assert.ok(p[0] > 0, 'L1 reachable');
  assert.ok(p[9] > 0, 'L10(cap) reachable');
});

test('§5 관찰 purity — item 미변경 · Math.random 미호출', () => {
  // Math.random 호출 시 실패하는 spy 주입
  let mathRandomCalls = 0;
  const spyMath = Object.create(Math); spyMath.random = () => { mathRandomCalls++; return 0.5; };
  const Sp = buildShadow(spyMath);
  Sp._shadowReset(0x9);
  const item = { itemLv: 850, layerLv: undefined, slot:'weapon', affixes:[{id:'x',value:1}], socketCount:2, crystals:[null,null] };
  const before = JSON.stringify(item);
  for(let i=0;i<2000;i++) Sp._shadowObserve(item);
  assert.equal(JSON.stringify(item), before, 'observe가 item 필드 미변경(layerLv/affixes/socket 불변)');
  assert.equal(mathRandomCalls, 0, 'observe 중 Math.random 0회(독립 RNG만)');
  assert.equal(Sp._shadowHist.draws, 2000, 'draws 누적');
});

test('§6 A1/A2/A3 불변식 — L>cap=0 · L1&cap reachable', () => {
  for(const model of ['A1','A2','A3']){
    for(let cap=1;cap<=10;cap++){
      const p = analyticP(cap, model);
      assert.equal(p.length, cap, `${model} cap${cap}: L>cap 미정의(=0)`);
      assert.ok(p[0] > 0, `${model} cap${cap}: L1 reachable`);
      assert.ok(p[cap-1] > 0, `${model} cap${cap}: cap reachable`);
      const sum = p.reduce((a,b)=>a+b,0);
      assert.ok(Math.abs(sum-1) < 1e-9, `${model} cap${cap}: 정규화`);
    }
  }
});
