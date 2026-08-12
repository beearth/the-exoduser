import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [PHASE 4B-4 / LOCK-21] SKILL SYNERGY CANONICALIZATION ═══
// canonical family(6) = family 全 skill 강화 / legacy sk*(20) = 지정 skill 1개만 강화 (cross-boost 없음).
// _SK_MUL 전체 damaging skill 35종 family 100% 커버. V2=canonical only, legacy 롤 byte-identical.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);

const FAMILIES=['MELEE','PROJECTILE','ORB','BEAM','BOMBARDMENT','AREA_GROUND'];
const CANON=['skFamMelee','skFamProjectile','skFamOrb','skFamBeam','skFamBombard','skFamAura'];
const LEGACY20=['skWhirlDmg','skBeamDmg','skFireballDmg','skMissileDmg','skBlueShotDmg','skBlastShotDmg','skHellRayDmg','skMaliceStormDmg','skChainSlashDmg','skGiantSlamDmg','skGhostWalkDmg','skMaliceMortarDmg','skFireAuraDmg','skIceOrbDmg','skFireBeamDmg','skMaliceHuntDmg','skDarkPillarDmg','skPlagueDmg','skSpikeAuraDmg','skChainAssaultDmg'];

// ── 소비자 STRICT NODE 추출 (실 소스) ──
function buildConsumer(equip){
  const skmul=gameHtml.match(/const _SK_MUL=\{[\s\S]*?\n\};/)[0];
  const fam=gameHtml.match(/const _SK_FAM=\{[\s\S]*?function _skMul\(skId\)\{[^\n]*\}/)[0];
  const P={skills:{}};
  const _eqAffix=id=>equip[id]||0;
  return new Function('_eqAffix','P',`${skmul}\n${fam}\nreturn {_skMul,_skSynBonus,_canonFamBonus,_legacySkBonus,_SK_FAM,_FAM_CANON,_SK_LEGACY,_SK_MUL};`)(_eqAffix,P);
}
function skMulKeys(){ // _SK_MUL 전체 키
  const blk=gameHtml.match(/const _SK_MUL=\{[\s\S]*?\n\};/)[0];
  return [...blk.matchAll(/\n\s{2}([a-zA-Z0-9]+):\{/g)].map(m=>m[1]);
}

// ── 롤러 추출 ──
function buildRoller(pool){
  const afslot=gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
  const fTier=gameHtml.match(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/)[0];
  const fCand=gameHtml.match(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/)[0];
  const fRoll=gameHtml.match(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/)[0];
  const fLeg=gameHtml.match(/function rollAffixes\(grade,slot,brType\)\{[\s\S]*?\n  return result;\n\}/)[0];
  const P={lv:300};
  return new Function('AFFIX_POOL','P','_DEMO_MODE','_DEMO_AFFIX_BANNED',`${afslot}\n${fTier}\n${fCand}\n${fRoll}\n${fLeg}\nreturn {rollAffixesLayered,rollAffixes};`)(pool,P,false,new Set());
}
function seed(n){let s=n>>>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};}
const SLOTS=['weapon','armor','ring1','necklace','boots','shield','bow','gloves','pants','cape','helmet','headband','belt','bracelet'];
const APPROX=(a,b,m)=>assert.ok(Math.abs(a-b)<1e-9,`${m} (got ${a}, want ${b})`);

// ══════════════════════════════════════════════════════════════
test('§1 SSOT — 6 family, canonical 6, legacy 20 (지정 skill 매핑)', () => {
  const {_FAM_CANON,_SK_LEGACY}=buildConsumer({});
  assert.deepEqual(Object.keys(_FAM_CANON).sort(),FAMILIES.slice().sort(),'family 6종 (AREA_GROUND)');
  assert.deepEqual(Object.values(_FAM_CANON).sort(),CANON.slice().sort(),'canonical affix 6종');
  // legacy specific: 20 affix가 전부 매핑에 등장 (maliceHunt/Burst는 동일 affix 공유)
  const legAffixes=[...new Set(Object.values(_SK_LEGACY))].sort();
  assert.deepEqual(legAffixes,LEGACY20.slice().sort(),'legacy 20 affix 전부 지정 매핑');
});

test('§2 전체 damaging skill family coverage — _SK_MUL 35종 미분류 0', () => {
  const {_SK_FAM}=buildConsumer({});
  const keys=skMulKeys();
  assert.ok(keys.length>=35,'_SK_MUL 최소 35종 (got '+keys.length+')');
  const unclassified=keys.filter(k=>!_SK_FAM[k]);
  assert.deepEqual(unclassified,[],'미분류 damaging skill 0: '+unclassified.join(','));
  for(const k in _SK_FAM) assert.ok(FAMILIES.includes(_SK_FAM[k]),k+' → 유효 family');
});

test('§3 애매/sibling 재판정 (이름 아닌 구현)', () => {
  const {_SK_FAM}=buildConsumer({});
  assert.equal(_SK_FAM.maliceHunt,'PROJECTILE');assert.equal(_SK_FAM.maliceHuntBurst,'PROJECTILE');
  assert.equal(_SK_FAM.ghostWalk,'AREA_GROUND');assert.equal(_SK_FAM.chainAssault,'AREA_GROUND');
  assert.equal(_SK_FAM.darkPillar,'AREA_GROUND');assert.equal(_SK_FAM.fireAura,'AREA_GROUND');
  assert.equal(_SK_FAM.hellRay,'BEAM');assert.equal(_SK_FAM.arcLaser,'BEAM','sibling 편입');
  assert.equal(_SK_FAM.chargeBoost,'MELEE');assert.equal(_SK_FAM.kiSlash,'MELEE','sibling 편입');
  assert.equal(_SK_FAM.thunderStake,'BOMBARDMENT');assert.equal(_SK_FAM.boneWall,'BOMBARDMENT');
  assert.equal(_SK_FAM.bladeDash,'AREA_GROUND');assert.equal(_SK_FAM.magicBlink,'AREA_GROUND');assert.equal(_SK_FAM.burstLoop,'AREA_GROUND');
  assert.match(gameHtml,/_hrDmg=~~\(magicRef\(\)\*statInt\(\)\*pMagicMul\(\)\*pBeamMul\(\)\*_skMul\('hellRay'\)/,'hellRay pBeamMul 근거');
});

test('§4 canonical 6 구조 (L6-B STRICT, canon/v2only/compat) + legacy 20 미삭제', () => {
  for(const id of CANON){const a=by(id);
    assert.ok(a,id);assert.equal(a.layer,6);assert.equal(a.sub,'B');assert.equal(a.canon,1);assert.equal(a.v2only,1);
    assert.ok(a.compat&&a.compat.includes('OFFENSE'));assert.ok(!('uni'in a));assert.equal(a.tiers.length,5);}
  for(const id of LEGACY20){const a=by(id);
    assert.ok(a,id+' 미삭제');assert.equal(a.sub,'FLEX');assert.equal(a.v2skip,1);assert.equal(a.layer,6);}
  assert.deepEqual(POOL.filter(a=>a.canon===1).map(a=>a.id).sort(),CANON.slice().sort(),'신규 canon = 정확히 6');
});

test('§5 legacy roll BYTE-IDENTICAL (ITEM_LAYER_ROLL_V2=false) — canonical 유무 결과 동일', () => {
  const full=buildRoller(POOL),noCanon=buildRoller(POOL.filter(a=>!a.canon));
  let a='',b='';
  for(const s of SLOTS)for(let g=0;g<=5;g++){seed(g*7+s.length);a+=JSON.stringify(full.rollAffixes(g,s));seed(g*7+s.length);b+=JSON.stringify(noCanon.rollAffixes(g,s));}
  assert.equal(a,b,'legacy byte-identical');
});

test('§6 V2 canonical-only — legacy sk*20 V2 미등장, canonical 등장', () => {
  const roller=buildRoller(POOL);const seen=new Set();
  for(const s of SLOTS)for(const N of [4,6,8,10])for(let g=1;g<=5;g++)for(let rep=0;rep<6;rep++){seed(rep*31+g*13+N*7+s.length);for(const r of roller.rollAffixesLayered(g,s,undefined,N))seen.add(r.id);}
  for(const id of LEGACY20) assert.ok(!seen.has(id),id+' V2 제외');
  assert.ok(CANON.some(id=>seen.has(id)),'canonical V2 등장');
});

// ══════════════════════════════════════════════════════════════
// §7 STACKING A/B/C/D — 6 family 전부 (canonical=family全 / legacy=지정1개, cross-boost 0)
test('§7 canonical/legacy stacking — 6 family A/B/C/D 전수', () => {
  // 각 family: [own=legacy affix 보유 skill, sibling=같은 family 다른 skill, otherFam skill]
  const CASES={
    MELEE:      {own:'whirlwind',   leg:'skWhirlDmg',      sib:'chainSlash', other:'omniBeam'},
    PROJECTILE: {own:'elemMissile', leg:'skMissileDmg',    sib:'needleShot', other:'whirlwind'},
    ORB:        {own:'fireball',    leg:'skFireballDmg',   sib:'iceOrb',     other:'omniBeam'},
    BEAM:       {own:'omniBeam',    leg:'skBeamDmg',       sib:'arcLaser',   other:'whirlwind'},
    BOMBARDMENT:{own:'maliceStorm', leg:'skMaliceStormDmg',sib:'boneWall',   other:'whirlwind'},
    AREA_GROUND:{own:'giantSlam',   leg:'skGiantSlamDmg',  sib:'detonate',   other:'omniBeam'},
  };
  const baseC=buildConsumer({});
  for(const fam of FAMILIES){
    const {own,leg,sib,other}=CASES[fam];
    const canonId=baseC._FAM_CANON[fam];
    const bOwn=baseC._skMul(own),bSib=baseC._skMul(sib),bOther=baseC._skMul(other);
    // A. canonical +0.3 → own & sibling 둘 다 +30%
    const A=buildConsumer({[canonId]:0.3});
    APPROX(A._skMul(own),bOwn*1.3,fam+' A own canonical');
    APPROX(A._skMul(sib),bSib*1.3,fam+' A sibling canonical (family 全)');
    // B. legacy +0.2 → own만 +20%, sibling 0 (cross-boost 없음)
    const B=buildConsumer({[leg]:0.2});
    APPROX(B._skMul(own),bOwn*1.2,fam+' B own legacy');
    APPROX(B._skMul(sib),bSib,fam+' B sibling 불변 (legacy cross-boost 제거)');
    // C. 둘 다 → own +50%, sibling +30%
    const C=buildConsumer({[canonId]:0.3,[leg]:0.2});
    APPROX(C._skMul(own),bOwn*1.5,fam+' C own +50%');
    APPROX(C._skMul(sib),bSib*1.3,fam+' C sibling +30%');
    // D. 타 family skill은 영향 0
    APPROX(C._skMul(other),bOther,fam+' D 타 family 불변');
  }
});

test('§8 legacy specific — 20 affix 각자 지정 skill 1개만 부스트, 타 skill 0', () => {
  const {_SK_LEGACY,_SK_FAM}=buildConsumer({});
  for(const skId in _SK_LEGACY){
    const leg=_SK_LEGACY[skId];
    const c=buildConsumer({[leg]:0.25});
    const b=buildConsumer({});
    APPROX(c._skMul(skId),b._skMul(skId)*1.25,leg+'→'+skId+' 부스트');
    // 같은 family의 다른(legacy 미지정) skill은 이 legacy affix에 불변
    const fam=_SK_FAM[skId];
    const sibling=Object.keys(_SK_FAM).find(k=>_SK_FAM[k]===fam&&_SK_LEGACY[k]!==leg);
    if(sibling) APPROX(c._skMul(sibling),b._skMul(sibling),leg+' → sibling '+sibling+' 불변');
  }
});

test('§9 base 전투 불변 — 미장착 시 _skMul = 순수 (b+(lv-1)*g*0.5)', () => {
  const c=buildConsumer({});
  assert.equal(c._skMul('whirlwind'),25,'whirlwind lv1 = b(25)');
  assert.equal(c._skMul('kiSlash'),4.0,'kiSlash lv1 = b(4.0)');
  assert.equal(c._skMul('__none__'),1,'미매핑 폴백 1');
  // _skSynBonus 미장착=0
  for(const k of skMulKeys()) assert.equal(c._skSynBonus(k),0,k+' 미장착 synergy 0');
});
