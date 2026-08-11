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
const afslot=gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
const fTier=gameHtml.match(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/)[0];
const fCand=gameHtml.match(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/)[0];
const fRoll=gameHtml.match(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/)[0];
function makeApi(P){return new Function('AFFIX_POOL','P','_DEMO_MODE','_DEMO_AFFIX_BANNED',
  `${afslot}\n${fTier}\n${fCand}\n${fRoll}\nreturn {rollAffixesLayered,_affixLayerCandidates};`)(POOL,P,false,new Set());}
function seed(n){let s=n>>>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};}
const SLOTS=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband'];
const L7A=['atkPctAll','neckAllDmg','endAllDmg'];

test('§2 L7-A backbone — atkPctAll·neckAllDmg·endAllDmg는 L7-A·uni:1 (값 무변경)', () => {
  for(const id of L7A){
    const a=DEF[id];
    assert.equal(a.layer,7,id+' layer 7');
    assert.equal(a.sub,'A',id+' sub A(재지정)');
    assert.equal(a.uni,1,id+' uni:1');
    assert.equal(a.unit,'pct',id+' pct 불변');
    assert.equal(a.tiers.length,5,id+' tiers 5칸');
  }
  // 최소 3~5 후보(§5) — 획일화 방지
  assert.ok(L7A.length>=3,'L7-A universal 후보 3+');
});

test('§4 global 공격력% consumer 배선 — meleeRef/bowRef/magicRef ×(1+_globalAtkPct())', () => {
  assert.match(gameHtml,/function _globalAtkPct\(\)\{return _eqAffix\('atkPctAll'\)\+_eqAffix\('neckAllDmg'\)\+_eqAffix\('endAllDmg'\)\}/,'_globalAtkPct 3종 합산');
  for(const fn of ['meleeRef','bowRef','magicRef']){
    const m=gameHtml.match(new RegExp('function '+fn+'\\(\\)\\{return[^\\n]*'));
    assert.ok(m,fn+' 존재');
    assert.ok(/\*\(1\+_globalAtkPct\(\)\)/.test(m[0]),fn+' ×(1+_globalAtkPct()) 적용');
  }
  // 무기 implicit _iAtkPct는 미연결(전 무기 상시값 → base 변동 방지)
  assert.ok(!/_globalAtkPct\(\)\{[^}]*_iAtkPct/.test(gameHtml),'_iAtkPct 미포함(도먼트 유지)');
});

test('§7 L7-A universal coverage 15/15 — 전 슬롯에서 L7-A 후보 제공', () => {
  const api=makeApi({lv:300});
  const _AFSLOT={weapon:'wpn',shield:'shield',boots:'boots',armor:'armor',helmet:'helm',bow:'xbow',gloves:'gloves',pants:'pants',belt:'belt',necklace:'neck',ring1:'ring',ring2:'ring',cape:'cloak',bracelet:'bracelet',headband:'headband'};
  let cov=0;
  for(const s of SLOTS){const br=s==='bracelet'?'demon':undefined;
    const c=api._affixLayerCandidates(_AFSLOT[s],br,7,'A');
    if(c.some(a=>L7A.includes(a.id)))cov++;
  }
  assert.equal(cov,15,`L7-A universal 전 슬롯 제공 (${cov}/15)`);
});

test('§7 STRICT C1 INVARIANT — 모든 N≤9 아이템에서 L1-A..LN-A 존재 (violation 0, L10 예외)', () => {
  const api=makeApi({lv:300});
  let items=0,viol=0,first='';
  for(const s of SLOTS){const br=s==='bracelet'?'demon':undefined;
    for(const N of [1,2,3,4,5,6,7,8,9]){
      for(let rep=0;rep<150;rep++){seed(rep*17+N*101+s.length*7);const r=api.rollAffixesLayered(3,s,br,N);items++;
        const aLayers=new Set(r.filter(x=>DEF[x.id].sub!=='B').map(x=>DEF[x.id].layer));
        for(let L=1;L<=N;L++){if(L===10)continue;if(!aLayers.has(L)){viol++;if(!first)first=`${s} lv${N} L${L}-A 결손`;break}}
      }
    }
  }
  assert.equal(viol,0,`invariant violation 0 (items ${items})${first?' — '+first:''}`);
});

test('§8 dedup으로 A backbone 소실 없음 — L7-A는 확정적(확률 아님)', () => {
  const api=makeApi({lv:300});
  // weapon/armor/necklace 각 200회 — L7 있으면(N>=7) L7-A 항상 존재
  for(const s of ['weapon','armor','necklace','boots','cape']){const br=undefined;
    for(let rep=0;rep<200;rep++){seed(rep*13+9);const r=api.rollAffixesLayered(4,s,br,8);
      const hasL7A=r.some(a=>DEF[a.id].layer===7&&DEF[a.id].sub==='A');
      assert.ok(hasL7A,`${s} lv8: L7-A 확정 존재`);
    }
  }
});

test('§9 B 구조 불변 — L7-A 이동 후에도 A/B≤1·group/id 무중복', () => {
  const api=makeApi({lv:300});
  for(const s of SLOTS){const br=s==='bracelet'?'demon':undefined;
    for(let rep=0;rep<60;rep++){seed(rep*5+3);const r=api.rollAffixesLayered(4,s,br,9);
      const perLayer={},grp={},ids={};
      for(const a of r){const d=DEF[a.id];perLayer[d.layer]=(perLayer[d.layer]||0)+1;
        assert.ok(!grp[d.group],'group 중복 '+d.group);grp[d.group]=1;
        assert.ok(!ids[a.id],'id 중복 '+a.id);ids[a.id]=1;}
      for(const L in perLayer)assert.ok(perLayer[L]<=2,'layer '+L+' ≤2');
    }
  }
});
