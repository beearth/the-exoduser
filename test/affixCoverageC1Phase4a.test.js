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
const DEF={};for(const a of POOL)DEF[a.id]=a;

// sandbox roller
const afslot=gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
const fTier=gameHtml.match(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/)[0];
const fCand=gameHtml.match(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/)[0];
const fRoll=gameHtml.match(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/)[0];
function makeApi(P){return new Function('AFFIX_POOL','P','_DEMO_MODE','_DEMO_AFFIX_BANNED',
  `${afslot}\n${fTier}\n${fCand}\n${fRoll}\nreturn {rollAffixesLayered,_affixLayerCandidates};`)(POOL,P,false,new Set());}
function seed(n){let s=n>>>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};}

// P4A 18종 + P4B-1 L7-A backbone 3종 = 21 (universal-A 누적 현재 상태)
const UNI_IDS=['strFlat','dexFlat','intFlat','vitFlat','maxSTFlat','maxMPFlat','cooldownRed','maxHPFlat','defFlat','shieldFlat','elemFocus','atkSpeed','skillBoost','bossSlayer','critDmgW','critRate','rageMaxFlat','rageDmg','atkPctAll','neckAllDmg','endAllDmg'];
const UNI_BY_LAYER={1:['strFlat','dexFlat','intFlat','vitFlat'],2:['maxSTFlat','maxMPFlat','cooldownRed'],3:['maxHPFlat','defFlat','shieldFlat'],4:['elemFocus'],5:['atkSpeed'],6:['skillBoost','bossSlayer'],7:['atkPctAll','neckAllDmg','endAllDmg'],8:['critDmgW','critRate'],9:['rageMaxFlat','rageDmg']};
const SLOTS=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband'];

test('§7 uni:1 메타 — 18 designated id 태깅, 값/효과 무변경', () => {
  for(const id of UNI_IDS){
    const es=POOL.filter(a=>a.id===id);
    assert.ok(es.length>0,id+' 존재');
    assert.ok(es.every(e=>e.uni===1),id+' 모든 엔트리 uni:1');
    assert.equal(es[0].tiers.length,5,id+' tiers 5칸 불변');
  }
  // uni는 designated에만
  const uniAll=[...new Set(POOL.filter(a=>a.uni===1).map(a=>a.id))].sort();
  assert.deepEqual(uniAll,[...UNI_IDS].sort(),'uni:1은 designated 18종에만');
});

test('§2 각 uni는 universally-meaningful A backbone (WORKING·sub A/기존값)', () => {
  for(const L in UNI_BY_LAYER){
    for(const id of UNI_BY_LAYER[L]){
      const a=DEF[id];
      assert.equal(a.layer,+L,id+` layer=${L}`);
      assert.notEqual(a.sub,'B',id+' A/FLEX backbone (B 아님)');
    }
  }
});

test('§9 universal-A 병합 — 비-네이티브 슬롯에도 해당 layer A 후보 제공', () => {
  const api=makeApi({lv:300});
  // weapon은 원래 L3 후보 없음(방어) → uni maxHPFlat/defFlat/shieldFlat 제공돼야
  const wpL3A=api._affixLayerCandidates('wpn',undefined,3,'A').map(a=>a.id);
  for(const id of UNI_BY_LAYER[3]) assert.ok(wpL3A.includes(id),`weapon L3-A에 universal ${id} 제공`);
  // armor는 원래 L8 크리 후보 없음 → uni critDmgW/critRate 제공
  const arL8A=api._affixLayerCandidates('armor',undefined,8,'A').map(a=>a.id);
  for(const id of UNI_BY_LAYER[8]) assert.ok(arL8A.includes(id),`armor L8-A에 universal ${id} 제공`);
  // 중복 없음(id-dedupe)
  assert.equal(new Set(wpL3A).size,wpL3A.length,'weapon L3-A id 중복 없음');
});

test('§9 A-FILL 보장 — layerLv N에서 L1~L6·L8·L9 A는 전 슬롯 100% (L7은 gap, 문서화)', () => {
  const api=makeApi({lv:300});
  const gapLayers=new Set([7,10]); // L7=weapon전용 flat, L10=0
  for(const s of SLOTS){
    const br=s==='bracelet'?'demon':undefined;
    for(const N of [1,3,5,6]){ // N<=6: L7 없음 → 완전 보장 구간
      let minFilled=99;
      for(let rep=0;rep<120;rep++){seed(4000+rep);const r=api.rollAffixesLayered(3,s,br,N);
        const aLayers=new Set(r.filter(x=>DEF[x.id].sub!=='B').map(x=>DEF[x.id].layer));
        let c=0;for(let L=1;L<=N;L++)if(!gapLayers.has(L)&&aLayers.has(L))c++;
        minFilled=Math.min(minFilled,c);
      }
      // N<=6에서 gap layer 없으므로 L1~LN A 전부 채워져야
      assert.equal(minFilled,N,`${s} lv${N}: L1~L${N} A 전부 채움(min=${minFilled})`);
    }
  }
});

test('§9 min affix ≥ N (N≤6, universal backbone 보장) — "N단 최소 N"', () => {
  const api=makeApi({lv:300});
  for(const s of SLOTS){const br=s==='bracelet'?'demon':undefined;
    for(const N of [1,3,5,6]){let mn=99;for(let rep=0;rep<120;rep++){seed(5000+rep);mn=Math.min(mn,api.rollAffixesLayered(4,s,br,N).length)}
      assert.ok(mn>=N,`${s} lv${N}: 최소 ${mn} ≥ ${N}`);
    }
  }
});

test('§9 A/B ≤1·layer≤N·group/id 무중복 불변 (universal 병합 후에도)', () => {
  const api=makeApi({lv:300});
  for(const s of SLOTS){const br=s==='bracelet'?'demon':undefined;
    for(let rep=0;rep<60;rep++){seed(6000+rep);const r=api.rollAffixesLayered(4,s,br,10);
      const perLayer={},grp={},ids={};
      for(const a of r){const d=DEF[a.id];
        perLayer[d.layer]=(perLayer[d.layer]||0)+1;
        assert.ok(d.layer>=1&&d.layer<=10,`${a.id} layer 범위`);
        assert.ok(!grp[d.group],`group 중복 ${d.group}`);grp[d.group]=1;
        assert.ok(!ids[a.id],`id 중복 ${a.id}`);ids[a.id]=1;
      }
      for(const L in perLayer)assert.ok(perLayer[L]<=2,`layer ${L} ≤2`);
    }
  }
});

test('§15 legacy rollAffixes 함수 원형 보존 (universal 미참조)', () => {
  const leg=gameHtml.match(/function rollAffixes\(grade,slot,brType\)\{[\s\S]*?\n  return result;\n\}/)[0];
  assert.ok(!/uni/.test(leg),'레거시 롤러는 uni 미참조(무영향)');
  assert.match(gameHtml,/const ITEM_LAYER_ROLL_V2=true;/,'[P6J/LOCK-38] flag production 활성(true)');
});
