import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

// ── AFFIX_POOL 추출 (Phase1 테스트와 동일 방식) ──
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');
  const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3)
    .split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const DEF={};for(const a of POOL)DEF[a.id]=a; // 마지막 승자(중복 id는 동일 layer/sub 검증됨)

// ── Phase2 Roll 엔진 소스 추출 후 샌드박스 구성 ──
const afslotSrc = gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
const fTier = gameHtml.match(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/)[0];
const fCand = gameHtml.match(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/)[0];
const fRoll = gameHtml.match(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/)[0];
assert.ok(fTier&&fCand&&fRoll,'Phase2 함수 추출 실패');

// 샌드박스: AFFIX_POOL/P/_DEMO_MODE/_DEMO_AFFIX_BANNED 주입, _AFSLOT은 소스 그대로
function makeApi(P,demoMode,demoBanned){
  const factory=new Function('AFFIX_POOL','P','_DEMO_MODE','_DEMO_AFFIX_BANNED',
    `${afslotSrc}\n${fTier}\n${fCand}\n${fRoll}\nreturn {rollAffixesLayered,_affixTierRoll,_affixLayerCandidates};`);
  return factory(POOL,P,demoMode,demoBanned);
}
// 시드 RNG (probe와 동일 LCG)
function seed(n){let s=n>>>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};}

const SLOTS=['weapon','armor','ring1','necklace','boots','shield','bow','gloves','pants','cape','helmet','headband','belt','bracelet'];

test('Phase2 구조 — flag/함수/라우팅 존재, flag production 활성(P6J)', () => {
  assert.match(gameHtml,/const ITEM_LAYER_ROLL_V2=true;/,'[P6J/LOCK-38] flag production 활성(true)');
  assert.match(gameHtml,/function rollAffixesLayered\(grade,slot,brType,layerLv\)/);
  assert.match(gameHtml,/function _affixTierRoll\(a,maxTier\)/);
  assert.match(gameHtml,/function _affixLayerCandidates\(aSlot,brType,layer,sub\)/);
  // mkItem 라우팅: flag&&layerLv → layered, else 레거시
  assert.match(gameHtml,/item\.affixes=\(ITEM_LAYER_ROLL_V2&&layerLv>=1\)\?rollAffixesLayered\(rarity,slot,item\.brType,layerLv\):rollAffixes\(rarity,slot,item\.brType\);/);
  // 레거시 rollAffixes 보존 (여전히 존재)
  assert.match(gameHtml,/function rollAffixes\(grade,slot,brType\)\{/);
});

test('레거시 rollAffixes는 공통 helper만 사용하도록 리팩터 (tiers 값 무변경 전제)', () => {
  // 레거시 tier 블록이 _affixTierRoll 호출로 대체됐는지 (수치 로직 단일화)
  assert.match(gameHtml,/const _tv=_affixTierRoll\(a,maxTier\);.*레거시·레이어 공용/);
});

test('§17-A/B/C L1~LN 범위 — layerLv=1/3/5/8/9/10, 초과 Layer 0건', () => {
  const api=makeApi({lv:300},false,new Set());
  for(const lv of [1,3,5,8,9,10]){
    seed(1000+lv);
    for(const s of SLOTS){
      for(const br of (s==='bracelet'?['demon','life']:[undefined])){
        for(let rep=0;rep<25;rep++){
          const r=api.rollAffixesLayered(1+(rep%5),s,br,lv);
          for(const a of r){
            const L=DEF[a.id].layer;
            assert.ok(L>=1&&L<=lv,`layerLv=${lv} ${s}: L${L} id=${a.id} 범위이탈`);
          }
        }
      }
    }
  }
});

test('§6/§17-E,G,H 각 Layer A/B 각 최대 1 · group 중복 0 · id 중복 0', () => {
  const api=makeApi({lv:250},false,new Set());
  let items=0;
  for(const lv of [1,3,5,8,9,10]){
    seed(2000+lv);
    for(const s of SLOTS){
      for(let rep=0;rep<30;rep++){
        const r=api.rollAffixesLayered(1+(rep%5),s,undefined,lv);items++;
        const perLayer={},grp={},ids={};
        for(const a of r){
          const d=DEF[a.id];
          perLayer[d.layer]=(perLayer[d.layer]||0)+1;
          if(d.group){assert.ok(!grp[d.group],`group 중복 ${d.group} in ${s} lv${lv}`);grp[d.group]=1;}
          assert.ok(!ids[a.id],`id 중복 ${a.id} in ${s} lv${lv}`);ids[a.id]=1;
        }
        for(const L in perLayer)assert.ok(perLayer[L]<=2,`Layer ${L} 슬롯 초과(${perLayer[L]}) in ${s} lv${lv}`);
      }
    }
  }
  assert.ok(items>1000,'표본 충분');
});

test('§5/§17-I,J,K slots·brType·DEMO banned 필터 준수', () => {
  const banned=new Set(['sharpAtk','brutalAtk','ruinAtk','overkilDmg','staggerExplosion','parryExplosion','elemConvert']);
  const apiDemo=makeApi({lv:400},true,banned);
  seed(3030);
  for(const s of SLOTS){
    const aSlot={weapon:'wpn',shield:'shield',boots:'boots',armor:'armor',helmet:'helm',bow:'xbow',gloves:'gloves',pants:'pants',belt:'belt',necklace:'neck',ring1:'ring',ring2:'ring',cape:'cloak',bracelet:'bracelet',headband:'headband'}[s];
    for(const br of (s==='bracelet'?['demon','life']:[undefined])){
      for(let rep=0;rep<40;rep++){
        const r=apiDemo.rollAffixesLayered(5,s,br,10);
        for(const a of r){
          // 중복 id(critDmgW 등)는 slots가 다른 두 엔트리 존재 → 해당 슬롯·brType을 만족하는 엔트리가 하나라도 있으면 통과
          // [P4A C1] universal-A(uni:1)는 전 슬롯 backbone이므로 slot 제한 면제 (설계상 의도)
          const isUni=POOL.some(e=>e.id===a.id&&e.uni===1);
          const match=isUni||POOL.some(e=>e.id===a.id&&e.slots.indexOf(aSlot)>=0&&(!e.brType||e.brType===br));
          assert.ok(match,`slots/brType 위반 ${a.id} @${s}(${br||'-'})`);
          assert.ok(!banned.has(a.id),`DEMO banned 유출 ${a.id}`);
        }
      }
    }
  }
});

test('§14 L10-A(ultDmg) 활성 — layerLv=10 roll은 L10-A 생성, layerLv<10은 0', () => {
  // [P8B/LOCK-47] L10 Pool = ultDmg 1종(uni:1 sole A backbone). cap10 roll은 매번 L10-A 충전.
  const l10=POOL.filter(a=>a.layer===10);
  assert.equal(l10.length,1,'L10 Pool = ultDmg 1종'); assert.equal(l10[0].id,'ultDmg');
  const api=makeApi({lv:500},false,new Set());
  seed(4040);
  let with10=0,count=0;
  for(let i=0;i<400;i++){
    const r=api.rollAffixesLayered(5,'weapon',undefined,10);count++;
    if(r.some(a=>DEF[a.id].layer===10))with10++;
  }
  assert.equal(with10,400,'cap10 roll은 매번 L10-A(ultDmg) 생성(sole A backbone)');
  assert.ok(count===400,'무한루프 없이 정상 종료');
  // layerLv<10 → L10 어픽스 0(L=10 iteration 미실행)
  let below=0;
  for(let i=0;i<200;i++){const r=api.rollAffixesLayered(5,'weapon',undefined,9);for(const a of r)if(DEF[a.id].layer===10)below++;}
  assert.equal(below,0,'layerLv<10 → L10-A 미출현');
});

test('§12 후보 0/부족 안전 — 빈 결과 허용, 예외 없음', () => {
  const api=makeApi({lv:1},false,new Set());
  seed(5050);
  // layerLv=1은 층 하나뿐 — 슬롯에 따라 0~2개. 예외 없이 배열 반환.
  for(const s of SLOTS){
    const r=api.rollAffixesLayered(1,s,undefined,1);
    assert.ok(Array.isArray(r),`${s}: 배열 반환`);
    assert.ok(r.length<=2,`${s}: layerLv1 최대 2`);
  }
});

test('§17-L save/load — affix instance {id,tier,value} 3키 구조 왕복 보존', () => {
  const api=makeApi({lv:300},false,new Set());
  seed(6060);
  const af=api.rollAffixesLayered(4,'armor',undefined,6);
  assert.ok(af.length>0,'표본 생성');
  const rt=JSON.parse(JSON.stringify(af));
  assert.equal(JSON.stringify(af),JSON.stringify(rt),'왕복 동일');
  for(const a of rt){
    assert.deepEqual(Object.keys(a).sort(),['id','tier','value'],'정확히 3키');
    assert.equal(typeof a.id,'string');
    assert.equal(typeof a.tier,'number');
    assert.ok(typeof a.value==='number');
  }
});

test('§7/§8 수치품질은 기존 tiers/tierW 기반 — value가 해당 tiers 범위 내', () => {
  const api=makeApi({lv:600},false,new Set());
  seed(7070);
  for(let i=0;i<300;i++){
    const r=api.rollAffixesLayered(5,['weapon','armor','necklace'][i%3],undefined,8);
    for(const a of r){
      const d=DEF[a.id];
      const lo=Math.min(...d.tiers.filter(v=>v!=null)),hi=Math.max(...d.tiers.filter(v=>v!=null));
      assert.ok(a.value>=lo-1e-6&&a.value<=hi+1e-6,`${a.id} value ${a.value} ∉ [${lo},${hi}]`);
      assert.ok(a.tier>=0&&a.tier<d.tiers.length,`${a.id} tier idx 범위`);
    }
  }
});

test('§18 distribution — weight 높을수록 자주, 저weight 희소, 독점 없음(단일 sub 버킷 검증)', () => {
  const api=makeApi({lv:300},false,new Set());
  // armor L3-A 버킷만 분리 검증(동일 sub 내 weight 단조성)
  seed(8080);
  const tally={};let n=0;
  for(let i=0;i<8000;i++){
    const r=api.rollAffixesLayered(5,'armor',undefined,3);
    for(const a of r){if(DEF[a.id].layer===3&&DEF[a.id].sub==='A'){tally[a.id]=(tally[a.id]||0)+1;n++;}}
  }
  const distinct=Object.keys(tally).length;
  assert.ok(distinct>=4,'여러 후보 등장(독점 아님)');
  // 최고 weight 후보가 최저 weight 후보보다 많이 등장
  const cands=POOL.filter(a=>a.slots.indexOf('armor')>=0&&a.layer===3&&a.sub==='A'&&a.tiers[0]!=null);
  const wSorted=[...cands].sort((x,y)=>y.weight-x.weight);
  const hi=wSorted[0],lo=wSorted[wSorted.length-1];
  if(hi.weight>lo.weight*1.5){
    assert.ok((tally[hi.id]||0)>=(tally[lo.id]||0),`weight 단조 위반: ${hi.id}(w${hi.weight})=${tally[hi.id]||0} < ${lo.id}(w${lo.weight})=${tally[lo.id]||0}`);
  }
});
