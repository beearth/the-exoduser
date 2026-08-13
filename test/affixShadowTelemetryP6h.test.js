import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6H / LOCK-36] REAL-PLAY LAYER ECONOMY TELEMETRY ═══
// 확장 telemetry(itemLvBand/slot/rarity/capSlot/keystone eligible+expected/session/affix) 검증.
// production 무변경(관찰 전용). A2 파라미터 FREEZE. Keystone RNG 미실행(기대값만).
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

// shadow 블록 + keystone 의존(_AFSLOT/_keystoneCandidates/KEYSTONE_ROLL_RATE/AFFIX_POOL) + P/G 주입 샌드박스
function buildTel(injectMath){
  const start = gameHtml.indexOf('let _SHADOW_LAYER_LOG=false;');
  const end   = gameHtml.indexOf('if(typeof window!==', start);
  const shadowBlk = gameHtml.slice(start, end);
  // deps 추출
  const poolStart = gameHtml.indexOf('const AFFIX_POOL=[');
  const poolEnd = gameHtml.indexOf('\n];', poolStart);
  const pool = gameHtml.slice(poolStart, poolEnd+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  const afslot = gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
  const rate = gameHtml.match(/const KEYSTONE_ROLL_RATE=[^;]*;/)[0];
  const fCand = gameHtml.match(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/)[0];
  const canon = gameHtml.match(/function _itemLayerCap\(itemLv\)\{[^}]*\}/)[0]+'\n'+gameHtml.match(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/)[0];
  const body =
    `${pool}\n${afslot}\n${rate}\n${fCand}\n` +
    `let P=null,G=null;\n` + canon + '\n' +
    shadowBlk +
    `\nreturn {_shadowObserve,_shadowReset,_shadowStats,_shadowReport,_shadowLayerCap,_shadowRollLayer,_keystoneCandidates,` +
    `get hist(){return _shadowHist},get KRATE(){return KEYSTONE_ROLL_RATE},setP(v){P=v},setG(v){G=v},` +
    `get model(){return _SHADOW_LAYER_MODEL},set model(v){_SHADOW_LAYER_MODEL=v}};`;
  return new Function('Math','console',body)(injectMath||Math,{log(){}});
}
const T = buildTel();
const RATE = T.KRATE;
const mk = (over) => Object.assign({itemLv:900,slot:'weapon',rarity:2,affixes:[],socketCount:1,crystals:[null]}, over);

// ══════════════════════════════════════════════════════════════════════
test('§1 telemetry 필드 정합 — 합계=draws · slot/rarity/band/capSlot 정확', () => {
  T._shadowReset(0x11);
  const items = [mk({itemLv:900,slot:'weapon',rarity:5}), mk({itemLv:850,slot:'armor',rarity:3}),
                 mk({itemLv:120,slot:'ring1',rarity:0}), mk({itemLv:0,slot:'boots',rarity:1})];
  for(let i=0;i<1000;i++) T._shadowObserve(items[i%items.length]); // 4종 × 250
  const H = T.hist, st = T._shadowStats();
  assert.equal(H.draws, 1000, 'draws');
  const sumLayer = H.byLayer.reduce((a,b)=>a+b,0);
  assert.equal(sumLayer, H.draws, 'byLayer 합 = draws');
  let capSum=0; for(const k in H.byCap) capSum+=H.byCap[k].draws; assert.equal(capSum, H.draws, 'byCap 합');
  let bandSum=0; for(const k in H.byBand) bandSum+=H.byBand[k].draws; assert.equal(bandSum, H.draws, 'byBand 합');
  let slotSum=0; for(const k in H.bySlot) slotSum+=H.bySlot[k].draws; assert.equal(slotSum, H.draws, 'bySlot 합');
  assert.equal(H.bySlot.weapon.draws, 250, 'weapon slot count');
  assert.equal(H.byRarity['5'], 250, 'rarity5 count');
  assert.equal(H.byBand[9].draws, 250, 'band9(itemLv900) count'); // weapon itemLv900
  assert.equal(H.byBand[8].draws, 250, 'band8(itemLv850=armor)');
  assert.equal(H.byBand[1].draws, 250, 'band1(itemLv120=ring)');
  assert.equal(H.byBand[0].draws, 250, 'band0(itemLv0=boots)');
  assert.equal(H.byCapSlot[10].weapon, 250, 'cap10 weapon capSlot');
});

test('§2 Keystone expected — eligible×rate · slot별 후보 균등 share · RNG 미실행', () => {
  // weapon cap10 대량 → L≥8 일부 eligible(wpn 후보 3종: DullConviction/GlassGreatsword/BloodPact)
  T._shadowReset(0x22);
  for(let i=0;i<20000;i++) T._shadowObserve(mk({slot:'weapon',itemLv:900}));
  const st = T._shadowStats();
  assert.ok(st.eligibleKeystoneItems > 0, 'weapon eligible 존재');
  assert.ok(Math.abs(st.expectedKeystones - st.eligibleKeystoneItems*RATE) < 1e-9, 'expectedK = eligible×rate');
  const ids = Object.keys(st.expectedByKeystone).sort();
  assert.deepEqual(ids, ['ksBloodPact','ksDullConviction','ksGlassGreatsword'], 'wpn 후보 3종만');
  const vals = ids.map(k=>st.expectedByKeystone[k]);
  assert.ok(Math.abs(vals[0]-vals[1])<1e-9 && Math.abs(vals[1]-vals[2])<1e-9, '3종 균등 share(rate/3)');
  assert.ok(Math.abs(vals.reduce((a,b)=>a+b,0) - st.expectedKeystones) < 1e-9, 'share 합 = expectedK');
  // armor cap10 → 후보 2종(BloodOath/RootedGiant)
  T._shadowReset(0x23);
  for(let i=0;i<20000;i++) T._shadowObserve(mk({slot:'armor',itemLv:900}));
  const sa = T._shadowStats();
  assert.deepEqual(Object.keys(sa.expectedByKeystone).sort(), ['ksBloodOath','ksRootedGiant'], 'armor 후보 2종');
  const av = Object.values(sa.expectedByKeystone);
  assert.ok(Math.abs(av[0]-av[1])<1e-9, 'armor 2종 균등(rate/2)');
  // 비-eligible slot(ring)은 L≥8여도 eligible 0
  T._shadowReset(0x24);
  for(let i=0;i<5000;i++) T._shadowObserve(mk({slot:'ring1',itemLv:900}));
  const sr = T._shadowStats();
  assert.equal(sr.eligibleKeystoneItems, 0, 'ring = keystone 후보 없음 → eligible 0');
  assert.ok(sr.highLayerItems > 0, 'ring도 L≥8 자체는 발생(highLayer>0)');
});

test('§3 cap-conditioned parity — observed vs LOCK-34 analytic 일치', () => {
  T._shadowReset(0x33);
  for(const cap of [4,7,10]){ const lv = cap===10?900:(cap-1)*100; for(let i=0;i<40000;i++) T._shadowObserve(mk({slot:'necklace',itemLv:lv})); }
  const st = T._shadowStats();
  for(const cap of [4,7,10]){ const c = st.capParity[cap]; assert.ok(c && c.maxErr < 0.01, `cap${cap} parity maxErr=${(c.maxErr*100).toFixed(2)}%p`); }
});

test('§4 reset & accumulation', () => {
  T._shadowReset(0x44); for(let i=0;i<300;i++) T._shadowObserve(mk({})); assert.equal(T.hist.draws,300);
  for(let i=0;i<200;i++) T._shadowObserve(mk({})); assert.equal(T.hist.draws,500,'누적');
  T._shadowReset(0x44); assert.equal(T.hist.draws,0,'reset 후 0');
});

test('§5 deterministic seed — reset(seed) 반복 동일 분포', () => {
  T._shadowReset(0x55); for(let i=0;i<2000;i++) T._shadowObserve(mk({itemLv:900})); const a=T._shadowStats().P.slice();
  T._shadowReset(0x55); for(let i=0;i<2000;i++) T._shadowObserve(mk({itemLv:900})); const b=T._shadowStats().P.slice();
  assert.deepEqual(a,b,'동일 seed → 동일 P');
});

test('§6 purity(확장) — item 미변경 · Math.random 0 (keystone 경로 포함)', () => {
  let calls=0; const spy=Object.create(Math); spy.random=()=>{calls++;return 0.5};
  const Ts=buildTel(spy); Ts._shadowReset(0x66);
  const item=mk({slot:'weapon',itemLv:900,affixes:[{id:'x',value:1}]}); const snap=JSON.stringify(item);
  for(let i=0;i<10000;i++) Ts._shadowObserve(item); // 다수가 L≥8 keystone 경로 진입
  assert.equal(JSON.stringify(item), snap, 'item 불변');
  assert.equal(calls, 0, 'Math.random 0회(keystone eligible 경로 포함)');
  assert.ok(Ts._shadowStats().eligibleKeystoneItems>0,'keystone 경로 실제 실행됨');
});

test('§7 sample adequacy 임계', () => {
  const ad=(n)=>{T._shadowReset(1);for(let i=0;i<n;i++)T._shadowObserve(mk({}));return T._shadowStats().adequacy};
  assert.equal(ad(50),'INSUFFICIENT');
  assert.equal(ad(200),'PRELIMINARY');
  assert.equal(ad(600),'CALIBRATION_USABLE');
});

test('§8 session metadata — lv/stage 범위 측정', () => {
  T._shadowReset(0x88);
  T.setP({lv:40}); T.setG({stage:2}); T._shadowObserve(mk({itemLv:40}));
  T.setP({lv:55}); T.setG({stage:5}); T._shadowObserve(mk({itemLv:50}));
  T.setP({lv:48}); T.setG({stage:1}); T._shadowObserve(mk({itemLv:40}));
  const s=T._shadowStats().session;
  assert.equal(s.startLv,40,'startLv'); assert.equal(s.endLv,48,'endLv(마지막)');
  assert.equal(s.minStage,1,'minStage'); assert.equal(s.maxStage,5,'maxStage');
});
