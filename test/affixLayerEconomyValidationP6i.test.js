import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 6I / LOCK-37] AUTOMATED LAYER ECONOMY VALIDATION ═══
// REAL_PLAY 요구 제거 → production-path 재사용 자동 검증. 실제 함수 verbatim 실행(가짜 item 구조 금지).
// 재사용: itemLv공식·slot·rarity테이블·shadow A2 sampler·V2 roller(rollAffixesLayered)·keystone·socket.
// production 파일 미변경. ITEM_LAYER_ROLL_V2=false·KEYSTONE_ROLL_ENABLED=false 유지. A2 파라미터 FREEZE.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const grab=(re,n)=>{const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0]};
const SLOT_NAMES=new Function('return '+grab(/const SLOT_NAMES=\[[^\]]*\]/,'SLOT').replace('const SLOT_NAMES=',''))();
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const parts={
  shadow: gameHtml.slice(gameHtml.indexOf('let _SHADOW_LAYER_LOG=false;'), gameHtml.indexOf('if(typeof window!==', gameHtml.indexOf('let _SHADOW_LAYER_LOG=false;'))),
  afslot: grab(/const _AFSLOT=\{[^}]*\};/,'afslot'),
  krate:  grab(/const KEYSTONE_ROLL_RATE=[^;]*;/,'krate'),
  rw:     grab(/const _RW_normal=\[[^;]*\];/,'rw'),
  tier:   grab(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/,'tier'),
  cand:   grab(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/,'cand'),
  roll:   grab(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/,'roll'),
  kcand:  grab(/function _keystoneCandidates\(aSlot,layerLv\)\{[\s\S]*?\n\}/,'kcand'),
  kcnt:   grab(/function _itemKeystoneCount\(item\)\{.*\}/,'kcnt'),
  kroll:  grab(/function _rollKeystoneOnItem\(item,forced\)\{[\s\S]*?\n\}/,'kroll'),
};
const CANON = gameHtml.match(/function _itemLayerCap\(itemLv\)\{[^}]*\}/)[0]+'\n'+gameHtml.match(/function _itemLayerWeightsA2\(cap\)\{[\s\S]*?return w\}/)[0]+'\n'+gameHtml.match(/function _rollItemLayerA2\(itemLv,rng\)\{[\s\S]*?return cap\}/)[0];
function build(injectMath,ksEnabled){
  const body=`const AFFIX_POOL=arguments[2];const SLOT_NAMES=${JSON.stringify(SLOT_NAMES)};\n${parts.afslot}\n${parts.krate}\n`+
    `let KEYSTONE_ROLL_ENABLED=${!!ksEnabled};let ITEM_LAYER_ROLL_V2=false;let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1},G=null;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n${parts.rw}\n${CANON}\n`+
    `${parts.shadow}\n${parts.tier}\n${parts.cand}\n${parts.roll}\n${parts.kcand}\n${parts.kcnt}\n${parts.kroll}\n`+
    `function itemLvOf(pLv){return Math.min(900,Math.floor(pLv/10)*10)}function rollSocket(rng){const _scR=rng();return _scR<.50?1:_scR<.80?2:_scR<.95?3:4}function setP(v){P=v}\n`+
    `return {SLOT_NAMES,_shadowObserve,_shadowReset,_shadowStats,_shadowRollLayer,_shadowLayerCap,_shadowLayerWeights,_itemLayerCap,_rollItemLayerA2,rollAffixesLayered,_keystoneCandidates,_itemKeystoneCount,_rollKeystoneOnItem,itemLvOf,rollSocket,setP,get KRATE(){return KEYSTONE_ROLL_RATE}};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build(); const RATE=API.KRATE;
const AFSLOT=new Function(parts.afslot+'return _AFSLOT;')();
function mul(seed){let a=seed>>>0;return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(s){const m=Object.create(Math);m.random=mul(s);return m}
function analyticP(cap){const w=API._shadowLayerWeights(cap,'A2');const s=w.reduce((a,b)=>a+b,0);return w.map(x=>x/s)}

// ══════════════════════════════════════════════════════════════════════
test('§1 production-path 재사용 진위 — 실제 함수 추출 확인 + flag off', () => {
  assert.match(gameHtml,/const ITEM_LAYER_ROLL_V2=true;/,'V2 ON(P6J)');
  assert.match(gameHtml,/const KEYSTONE_ROLL_ENABLED=true;/);
  assert.match(gameHtml,/const itemLv=Math\.min\(900,Math\.floor\(_pLv\/10\)\*10\);/,'실제 itemLv 공식');
  assert.match(gameHtml,/const slot=SLOT_NAMES\[~~\(Math\.random\(\)\*SLOT_NAMES\.length\)\];/,'실제 slot 선택');
  assert.match(gameHtml,/item\.socketCount=_scR<\.50\?1:_scR<\.80\?2:_scR<\.95\?3:4;/,'실제 socket(layer 무관)');
  assert.equal(typeof API.rollAffixesLayered,'function','실제 V2 roller 로드');
});

test('§5 A2 analytic parity — cap4/7/10 (100k, ≤0.5%p)', () => {
  for(const cap of [4,7,10]){ const lv=cap===10?900:(cap-1)*100; const rng=mul(0xA200+cap); const cnt=new Array(11).fill(0),N=100000;
    for(let i=0;i<N;i++)cnt[API._shadowRollLayer(lv,rng,'A2')]++;
    const an=analyticP(cap); for(let L=1;L<=cap;L++)assert.ok(Math.abs(cnt[L]/N-an[L-1])<=0.005,`cap${cap} L${L} err`);
  }
});

test('§6 cap10 분포 — L10~4.7% L8+~34% L1-4~15% mode L7', () => {
  const p=analyticP(10); const b=(lo,hi)=>{let s=0;for(let L=lo;L<=hi;L++)s+=p[L-1];return s};
  assert.ok(p[9]*100>=3&&p[9]*100<=6,'L10'); assert.ok(b(8,10)*100>=30&&b(8,10)*100<=38,'L8+'); assert.ok(b(1,4)*100>=13&&b(1,4)*100<=18,'L1-4');
  assert.equal(p.indexOf(Math.max(...p))+1,7,'mode L7');
});

test('§8/§9 V2 dry-run massive invariants (100k, 실제 roller) — 전부 0', () => {
  const rng=mul(0xC1FE); const N=100000; let viol=0,badLayer=0,badSub=0,dup=0,illegalKs=0,nan=0,undef=0,legacyLeak=0; let maxAffix=0;
  for(let i=0;i<N;i++){ const pLv=~~(rng()*1000); const itemLv=API.itemLvOf(pLv); const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];
    const L=API._shadowRollLayer(itemLv,rng,'A2'); const grade=1+~~(rng()*5); const br=slot==='bracelet'?(rng()<.5?'demon':'life'):undefined;
    const res=API.rollAffixesLayered(grade,slot,br,L); assert.ok(Array.isArray(res)); maxAffix=Math.max(maxAffix,res.length);
    const seen=new Set(),aBy={},bBy={};
    for(const a of res){ const d=DEF[a.id]; if(!d){undef++;continue}
      if(!(d.layer>=1&&d.layer<=L&&d.layer<=10))badLayer++;
      if(d.sub==='LEGACY')legacyLeak++; else if(d.sub!=='A'&&d.sub!=='B'&&d.sub!=='FLEX')badSub++;
      if(seen.has(a.id))dup++; seen.add(a.id);
      if(d.keystone)illegalKs++; if(typeof a.value!=='number'||Number.isNaN(a.value))nan++;
      if(d.sub==='A'){aBy[d.layer]=(aBy[d.layer]||0)+1;if(aBy[d.layer]>1)viol++} else if(d.sub==='B'){bBy[d.layer]=(bBy[d.layer]||0)+1;if(bBy[d.layer]>1)viol++}
    }
  }
  assert.equal(viol,0,'C1'); assert.equal(badLayer,0); assert.equal(badSub,0); assert.equal(dup,0);
  assert.equal(illegalKs,0,'정상롤 keystone 0'); assert.equal(nan,0); assert.equal(undef,0); assert.equal(legacyLeak,0,'layer0 leak');
  assert.ok(maxAffix<=15,'max affix ≤15');
});

test('§10 slot coverage — 모든 slot L1~L10 reachable · L≥8 affix>0', () => {
  for(const slot of SLOT_NAMES){ const reach=new Set(); let ge8=null;
    for(let cap=1;cap<=10;cap++){ const rng=mul(0x5100+cap*17+slot.length); const lv=cap===10?900:(cap-1)*100;
      for(let i=0;i<2000;i++){ const L=API._shadowRollLayer(lv,rng,'A2'); reach.add(L);
        if(L>=8){const c=API.rollAffixesLayered(4,slot,slot==='bracelet'?'demon':undefined,L).length; ge8=Math.max(ge8||0,c);} } }
    assert.ok(reach.has(1)&&reach.has(10),`${slot} L1&L10 reachable`);
    assert.ok(ge8===null||ge8>0,`${slot} L≥8 affix>0`);
  }
});

test('§11 Keystone forced-RNG(sandbox flag=true) — observed≈2% · max1 · layer<8 zero · invalid slot zero', () => {
  // eligible 표본 극대화: weapon/armor(유효 slot) + ring(invalid slot 검증)을 cap10(itemLv900)로 → L≥8 ~34%가 eligible
  const K=build(seededMath(0x6B0B),true); const rng=mul(0x1B0B); const mix=['weapon','armor','ring1'];
  let attempts=0,got=0,badLayer=0,badSlot=0,over1=0;
  for(let i=0;i<150000;i++){ const slot=mix[i%3]; const L=K._shadowRollLayer(900,rng,'A2'); const aslot=AFSLOT[slot];
    if(L>=8&&aslot&&K._keystoneCandidates(aslot,L).length)attempts++;
    const item={slot,layerLv:L,affixes:[]}; const ks=K._rollKeystoneOnItem(item,false);
    if(ks){ if(L<8)badLayer++; if(aslot!=='wpn'&&aslot!=='armor')badSlot++; item.affixes.push(ks); got++; if(K._itemKeystoneCount(item)>1)over1++; }
  }
  const obs=100*got/attempts;
  assert.ok(attempts>20000,`eligible 표본 충분(${attempts})`);
  assert.ok(obs>=1.8&&obs<=2.2,`observed≈2% (got ${obs.toFixed(2)}%, n=${attempts})`);
  assert.equal(badLayer,0,'layer<8 roll 0'); assert.equal(badSlot,0,'invalid slot roll 0'); assert.equal(over1,0,'item당 max1');
});

test('§12 Keystone expected — production-path, weapon/armor만 eligible, 5종 share', () => {
  const rng=mul(0x6B00); const N=200000; let elig=0,expTot=0; const expBy={},slots=new Set();
  for(let i=0;i<N;i++){ const pLv=~~(rng()*1000); const itemLv=API.itemLvOf(pLv); const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];
    const L=API._shadowRollLayer(itemLv,rng,'A2'); if(L<8)continue; const cand=API._keystoneCandidates(AFSLOT[slot],L);
    if(cand.length){elig++;slots.add(slot);expTot+=RATE;for(const c of cand)expBy[c.id]=(expBy[c.id]||0)+RATE/cand.length;} }
  assert.deepEqual([...slots].sort(),['armor','weapon'],'eligible slot = weapon/armor만');
  assert.ok(Math.abs(expTot-elig*RATE)<1e-9,'expectedK=eligible×rate');
  assert.deepEqual(Object.keys(expBy).sort(),['ksBloodOath','ksBloodPact','ksDullConviction','ksGlassGreatsword','ksRootedGiant'],'5종 전부');
});

test('§13 rarity independence — sampler에 rarity 입력 부재(코드+통계)', () => {
  assert.match(parts.roll,/function rollAffixesLayered\(grade,slot,brType,layerLv\)/,'roller 서명에 rarity 없음(grade=수치tier)');
  assert.ok(!/rarity/.test(parts.shadow.match(/function _shadowRollLayer[\s\S]*?return cap\}/)[0]),'_shadowRollLayer에 rarity 참조 없음');
  const base=analyticP(10); let maxDiff=0;
  for(let r=0;r<6;r++){ const rng=mul(0xD00+r); const cnt=new Array(11).fill(0),N=60000; for(let i=0;i<N;i++)cnt[API._shadowRollLayer(900,rng,'A2')]++;
    for(let L=1;L<=10;L++)maxDiff=Math.max(maxDiff,Math.abs(cnt[L]/N-base[L-1])); }
  assert.ok(maxDiff<0.01,`rarity별 편차 sampling noise(${(maxDiff*100).toFixed(2)}%p)`);
});

test('§14 CORE/socket independence — socket 식에 layer 인자 없음(코드+통계)', () => {
  assert.match(gameHtml,/const _scR=Math\.random\(\);\n\s*item\.socketCount=_scR<\.50\?1:_scR<\.80\?2:_scR<\.95\?3:4;/,'socket=layer 무관 식');
  const rng=mul(0xC0FE); const byLayer={}; const N=200000;
  for(let i=0;i<N;i++){ const L=API._shadowRollLayer(900,rng,'A2'); const sc=API.rollSocket(rng); (byLayer[L]=byLayer[L]||[0,0,0,0,0])[sc]++; }
  let maxDev=0; for(const L in byLayer){ const a=byLayer[L],t=a[1]+a[2]+a[3]+a[4]; if(t<500)continue; const base=[.5,.3,.15,.05];
    for(let k=0;k<4;k++)maxDev=Math.max(maxDev,Math.abs(a[k+1]/t-base[k])); }
  assert.ok(maxDev<0.03,`layer별 socket 분포 baseline 수렴(${(maxDev*100).toFixed(2)}%p)`);
});

test('§15 RNG purity — shadowObserve가 production Math.random sequence 미변경', () => {
  // spy: production Math.random 호출 기록. observe는 독립 _shadowRNG만 사용 → production seq 불변.
  let calls=0; const spy=Object.create(Math); spy.random=()=>{calls++;return 0.4242};
  const S=build(spy,true); S._shadowReset(0x9);
  const item={slot:'weapon',itemLv:900,rarity:3,affixes:[{id:'x',value:1}]}; const snap=JSON.stringify(item);
  for(let i=0;i<20000;i++) S._shadowObserve(item); // 다수 L≥8 keystone 스캔 경로
  assert.equal(calls,0,'observe 중 production Math.random 0회');
  assert.equal(JSON.stringify(item),snap,'item 불변');
  // sequence 동일성: 동일 seed production draw stream이 observe 유무와 무관하게 동일
  const draw=(withObs)=>{const a=build(Math,false);a._shadowReset(1);const pr=mul(77);const out=[];for(let i=0;i<3000;i++){out.push(pr());if(withObs)a._shadowObserve({itemLv:900,slot:'armor',rarity:2});}return out};
  assert.deepEqual(draw(false),draw(true),'production RNG sequence: observe 유무 동일');
});

test('§16 determinism — 동일 seed 2회 checksum 동일', () => {
  function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h>>>0}
  const run=(seed)=>{const a=build(Math,false);a._shadowReset(seed);const rng=mul(seed);
    for(let i=0;i<30000;i++){const pLv=~~(rng()*1000);a.setP({lv:pLv});a._shadowObserve({itemLv:a.itemLvOf(pLv),slot:SLOT_NAMES[~~(rng()*SLOT_NAMES.length)],rarity:~~(rng()*6)});}
    const st=a._shadowStats();return fnv(JSON.stringify({P:st.P,b:st.buckets,k:st.expectedByKeystone,h:st.highLayerItems}));};
  assert.equal(run(0xABCD),run(0xABCD),'동일 seed 동일'); assert.notEqual(run(0xABCD),run(0x1111),'다른 seed 다름');
});

test('§18/§19 producer dry-run lifecycle + save roundtrip (실제 item 미변경)', () => {
  // 다음 Phase producer 가정: layerLv=shadowRollLayer(itemLv) → V2 roll → serialize → reload
  const rng=mul(0x1234); let checked=0;
  for(let i=0;i<3000;i++){ const pLv=200+~~(rng()*700); const itemLv=API.itemLvOf(pLv); const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];
    const L=API._shadowRollLayer(itemLv,rng,'A2');
    const affixes=API.rollAffixesLayered(4,slot,slot==='bracelet'?'demon':undefined,L);
    const item={slot,itemLv,layerLv:L,affixes}; // test-only 구조(실제 mkItem 미호출)
    const round=JSON.parse(JSON.stringify(item));
    assert.equal(round.layerLv,L); assert.equal(round.affixes.length,affixes.length);
    for(let k=0;k<affixes.length;k++){assert.equal(round.affixes[k].id,affixes[k].id);assert.equal(round.affixes[k].value,affixes[k].value);}
    checked++;
  }
  // 강제 keystone roundtrip
  const K=build(Math,true); const it={slot:'weapon',layerLv:9,affixes:[]}; const ks=K._rollKeystoneOnItem(it,true);
  assert.ok(ks&&ks.id,'forced keystone'); it.affixes.push(ks);
  const r=JSON.parse(JSON.stringify(it)); assert.equal(r.affixes[0].id,ks.id,'keystone id save 유지');
  assert.ok(checked>0);
});
