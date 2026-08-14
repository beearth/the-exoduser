import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 7C / LOCK-43] AFFIX ABSORPTION CORE — validate/plan/atomic transfer ═══
// affixStone을 target equipment(unequipped·V2) 동일 Layer/Sub에 INSERT|REPLACE. A=universal·B=compat·family 비-gate.
// exact tier/value, RNG 0, 비용 0, keystone 보존, dup/C1 안전, atomic. UI 미구현. game.html 실제 함수 실행.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
// balanced-brace 함수 추출(중첩 브레이스 안전)
function grabFn(name){const sig='function '+name+'(';const i=gameHtml.indexOf(sig);assert.ok(i>=0,'추출 실패 '+name);
  let d=0,st=gameHtml.indexOf('{',i),j=st;for(;j<gameHtml.length;j++){if(gameHtml[j]==='{')d++;else if(gameHtml[j]==='}'){d--;if(d===0){j++;break;}}}return gameHtml.slice(i,j);}
function grabConst(re,n){const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0];}
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const CANON=grabFn('_itemLayerCap')+'\n'+grabFn('_itemLayerWeightsA2')+'\n'+grabFn('_rollItemLayerA2');
const P={
  afslot:grabConst(/const _AFSLOT=\{[^}]*\};/,'afslot'),
  isStone:grabFn('_isAffixStone'), slotc:grabFn('_getSlotCompatGroups'), sv:grabFn('_getStoneValidity'),
  tv:grabFn('_getTargetValidity'), plan:grabFn('planAbsorption'), absorb:grabFn('absorbStone'),
  tier:grabFn('_affixTierRoll'), cand:grabFn('_affixLayerCandidates'), roll:grabFn('rollAffixesLayered'),
};
function build(injectMath){
  const body=`const AFFIX_POOL=arguments[2];\n${P.afslot}\nlet _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n`+
    `let INV={bag:[],equipped:{}};let _saveN=0;function _invFindSpace(){return {x:0,y:0}}function dbSaveForce(){_saveN++}\n`+
    `let _EQ={};function _eqAffix(id){return _EQ[id]||0}function _equip(it){_EQ={};if(it&&it.affixes)for(const a of it.affixes)_EQ[a.id]=(a.value!=null?a.value:0);}\n`+
    `let _slotCompatCache=null;\n`+
    `${CANON}\n${P.isStone}\n${P.slotc}\n${P.sv}\n${P.tv}\n${P.plan}\n${P.absorb}\n${P.tier}\n${P.cand}\n${P.roll}\n`+
    `function _mkItem(slot,rarity,pLv){var lv=_rollItemLayerA2(Math.min(900,Math.floor((pLv||900)/10)*10),Math.random);return {id:'i'+(Math.random()),slot,rarity,layerLv:lv,affixes:rollAffixesLayered(rarity,slot,slot==='bracelet'?'demon':undefined,lv)};}\n`+
    `return {_getSlotCompatGroups,_getStoneValidity,_getTargetValidity,planAbsorption,absorbStone,_mkItem,_equip,_eqAffix,`+
    `getBag:()=>INV.bag,setBag:(b)=>{INV.bag=b},setEquip:(sl,it)=>{INV.equipped[sl]=it},saveN:()=>_saveN};`;
  return new Function('Math','console','p',body).call(null,injectMath||Math,{log(){}},AFFIX_POOL);
}
const API=build();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function seededMath(s){const m=Object.create(Math);m.random=mul(s);return m}
const stone=(affixId,tier,value)=>({type:'affixStone',affixId,tier,value});
const aff=(id,tier,value)=>({id,tier,value:value==null?0.3:value});
// [P7C.1] backbone: uni:1 A per layer(L1~9). 정상 V2 item은 A가 각 layer 충전(C1). A 흡수=REPLACE, B=INSERT/REPLACE.
const BB={1:'strFlat',2:'cooldownRed',3:'defFlat',4:'elemFocus',5:'atkSpeed',6:'skillBoost',7:'atkPctAll',8:'critDmgW',9:'rageMaxFlat'};
const target=(over={})=>{const lv=over.layerLv==null?10:over.layerLv;const extra=over.affixes||[];
  const exA=new Set(extra.map(a=>DEF[a.id]).filter(d=>d&&d.sub==='A').map(d=>d.layer));
  const bb=[];for(let L=1;L<=Math.min(lv,9);L++)if(!exA.has(L))bb.push(aff(BB[L],2,0.1));
  return {id:over.id||'t1',slot:over.slot||'weapon',rarity:over.rarity==null?4:over.rarity,layerLv:lv,brType:over.brType,affixes:bb.concat(extra)};};
const rawTarget=(over={})=>Object.assign({id:'t1',slot:'weapon',rarity:4,layerLv:10,affixes:[]},over); // malformed/backbone-없음 fixture
const KS_IDS=['ksDullConviction','ksGlassGreatsword','ksBloodOath','ksRootedGiant','ksBloodPact'];

// ══════════════════════════════════════════════════════════════════════
test('§2 canonical slot→compat mapping (B affix 공존 파생)', () => {
  assert.deepEqual(API._getSlotCompatGroups('weapon').sort(),['OFFENSE']);
  assert.deepEqual(API._getSlotCompatGroups('boots').sort(),['DEFENSE']);
  assert.deepEqual(API._getSlotCompatGroups('ring1').sort(),['ACCESSORY']);
  assert.deepEqual(API._getSlotCompatGroups('armor').sort(),['DEFENSE','OFFENSE']);
  assert.deepEqual(API._getSlotCompatGroups('shield').sort(),['ACCESSORY','DEFENSE']);
});

test('§29-1/2 A absorption = REPLACE (backbone A 교체, INSERT 불가) · old 소멸', () => {
  // 정상 target은 각 layer A 충전(backbone) → staggerBns(L5-A) 흡수 = atkSpeed(L5-A backbone) REPLACE
  const A=build(); const t=target({affixes:[]}); const s0=stone('staggerBns',2,0.5); A.setBag([t,s0]);
  let r=A.absorbStone(s0,'t1'); assert.ok(r.ok); assert.equal(r.action,'REPLACE','A는 backbone 점유로 항상 REPLACE');
  assert.ok(t.affixes.some(a=>a.id==='staggerBns'&&a.value===0.5),'new A 반영');
  assert.ok(!t.affixes.some(a=>a.id==='atkSpeed'),'backbone L5-A(atkSpeed) 소멸');
  assert.equal(t.affixes.filter(a=>DEF[a.id]&&DEF[a.id].layer===5&&DEF[a.id].sub==='A').length,1,'L5-A 정확히 1');
  // 명시 occupant replace
  const B=build(); const t2=target({affixes:[aff('staggerBns',1,0.1)]}); B.setBag([t2,stone('staggerBns',3,0.9)]);
  const s=B.getBag()[1]; r=B.absorbStone(s,'t1'); assert.ok(r.ok); assert.equal(r.action,'REPLACE');
  const occ=t2.affixes.filter(a=>a.id==='staggerBns'); assert.equal(occ.length,1,'중복 없음'); assert.equal(occ[0].value,0.9,'old 소멸·new 값');
});

test('§29-3/§23 A cross-slot — 원본 slots 무시(weapon-origin A → armor target)', () => {
  const A=build(); const t=target({slot:'armor',affixes:[]}); const s0=stone('staggerBns',2,0.4); A.setBag([t,s0]); // staggerBns.slots=[wpn]
  const r=A.absorbStone(s0,'t1'); assert.ok(r.ok,'A universal cross-slot 허용(armor에 wpn-origin A)'); assert.equal(r.action,'REPLACE');
  assert.ok(t.affixes.some(a=>a.id==='staggerBns'),'armor에 wpn-origin A 이식됨');
  // A universal sweep: 모든 V2-active A가 15 slot에서 slots/compat 때문에 reject=0(backbone target)
  const A2=API; let rejectBySlots=0;
  const Aaffs=AFFIX_POOL.filter(a=>a.sub==='A'&&!a.keystone&&!a.v2skip&&a.layer>=1&&a.layer<=9); // L10 A 없음
  const SLOTS=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband'];
  for(const d of Aaffs)for(const sl of SLOTS){const pr=A2.planAbsorption(target({slot:sl,layerLv:10,affixes:[]}),stone(d.id,2,0.3));
    if(!pr.ok&&(pr.reason==='INCOMPATIBLE_SLOT'||pr.reason==='WRONG_SUB'))rejectBySlots++;}
  assert.equal(rejectBySlots,0,'A는 slots/compat 때문에 reject 0(universal)');
});

test('§29-4/5/6/7/§22 B compat matrix — insert/replace/incompatible/multi-group', () => {
  const go=(slot,affixes,affId,t,v)=>{const A=build();const s=stone(affId,t,v);A.setBag([target({slot,affixes}),s]);return A.absorbStone(s,'t1');};
  assert.ok(go('weapon',[],'poisonDot',2,0.3).ok,'B OFFENSE → weapon INSERT');
  assert.equal(go('ring1',[],'poisonDot',2,0.3).reason,'INCOMPATIBLE_SLOT','B OFFENSE → ring INCOMPATIBLE');
  const rp=go('weapon',[aff('poisonDot',1,0.1)],'poisonDot',4,0.99); assert.ok(rp.ok&&rp.action==='REPLACE','B replace');
  assert.ok(go('weapon',[],'thorns',2,0.3).ok,'multi-group → OFFENSE weapon');
  assert.ok(go('boots',[],'thorns',2,0.3).ok,'multi-group → DEFENSE boots');
});

test('§29-8/§9 family는 gate 아님 — family affix도 compat만으로 판정', () => {
  const go=(slot,affId)=>{const A=build();const s=stone(affId,2,0.3);A.setBag([target({slot,affixes:[]}),s]);return A.absorbStone(s,'t1');};
  assert.ok(go('weapon','projSpeedPct').ok,'family affix(PROJECTILE)도 compat OFFENSE면 허용');
  assert.ok(go('helmet','beamWidth').ok,'BEAM family도 compat OFFENSE면 허용');
  // family 때문에 reject 되는 branch 없음: 소스에 family gate 부재
  assert.ok(!/def\.family|\.fam\b.*reject|family.*INCOMPATIBLE/.test(P.plan),'planAbsorption에 family gate 없음');
});

test('§29-9 target too low — L stone > target.layerLv', () => {
  const A=build(); const sA=stone('staggerBns',2,0.3); A.setBag([target({slot:'weapon',layerLv:4,affixes:[]}),sA]);
  assert.equal(A.absorbStone(sA,'t1').reason,'TARGET_TOO_LOW'); // staggerBns L5 > layerLv 4
  const B=build(); const sB=stone('staggerBns',2,0.3); B.setBag([target({slot:'weapon',layerLv:5,affixes:[]}),sB]);
  assert.ok(B.absorbStone(sB,'t1').ok);
});

test('§29-11/12 duplicate ID / group', () => {
  // DUPLICATE_ID: target에 staggerBns 2개(corrupt) → occupant 1개 제거 후 survivor에 남음
  let A=build(); A.setBag([target({slot:'weapon',affixes:[aff('staggerBns',1,0.1),aff('staggerBns',2,0.2)]}),stone('staggerBns',3,0.5)]);
  assert.equal(A.absorbStone(A.getBag()[1],'t1').reason,'DUPLICATE_ID');
  // DUPLICATE_GROUP: spellDmgPct(L5-A,g:spDm) survivor + splashDmg(L5-B,g:spDm) stone → 그룹충돌(sub 다름=occupant 아님)
  A=build(); A.setBag([target({slot:'weapon',layerLv:10,affixes:[aff('spellDmgPct',2,0.3)]}),stone('splashDmg',2,0.4)]);
  assert.equal(A.absorbStone(A.getBag()[1],'t1').reason,'DUPLICATE_GROUP');
});

test('§29-13/14/17 exact tier/value · old 소멸 · exact transfer', () => {
  for(const [t,v] of [[0,0.12],[4,999],[2,-0.5]]){ const A=build();
    A.setBag([target({slot:'weapon',affixes:[aff('staggerBns',1,0.01)]}),stone('staggerBns',t,v)]);
    const r=A.absorbStone(A.getBag()[1],'t1'); assert.ok(r.ok);
    const na=A.getBag()[0].affixes.find(a=>a.id==='staggerBns');
    assert.strictEqual(na.tier,t); assert.strictEqual(na.value,v); assert.equal(A.getBag()[0].affixes.filter(a=>a.id==='staggerBns').length,1,'old 소멸');
  }
});

test('§29-15/16/18 stone 정확히 1개 소비 · 실패 시 유지 · 다른 stone 불변', () => {
  const A=build(); const s1=stone('staggerBns',2,0.5),s2=stone('staggerBns',2,0.5),s3=stone('poisonDot',1,0.1);
  A.setBag([target({slot:'weapon',affixes:[]}),s1,s2,s3]);
  const r=A.absorbStone(s1,'t1'); assert.ok(r.ok);
  const stones=A.getBag().filter(i=>i.type==='affixStone');
  assert.equal(stones.length,2,'정확히 1개 소비'); assert.ok(stones.includes(s2)&&stones.includes(s3),'다른 stone 불변(s1만 소비)');
  // 실패 시 stone 유지
  const B=build(); const bad=stone('staggerBns',2,0.5); B.setBag([target({slot:'weapon',layerLv:4}),bad]);
  assert.equal(B.absorbStone(bad,'t1').reason,'TARGET_TOO_LOW'); assert.ok(B.getBag().includes(bad),'실패 시 stone 유지');
});

test('§29-17-equipped/§20 target equipped blocked · legacy/v2skip stone blocked', () => {
  let A=build(); A.setEquip('weapon',target({id:'eqW',slot:'weapon'})); A.setBag([stone('staggerBns',2,0.3)]);
  assert.equal(A.absorbStone(A.getBag()[0],'eqW').reason,'TARGET_EQUIPPED','equipped target 차단');
  // legacy stone(armorPen L0 LEGACY)
  A=build(); A.setBag([target({slot:'weapon'}),stone('armorPen',0,0.2)]);
  assert.equal(A.absorbStone(A.getBag()[1],'t1').reason,'LEGACY_BLOCKED');
  // v2skip stone(skWhirlDmg)
  A=build(); A.setBag([target({slot:'weapon'}),stone('skWhirlDmg',2,0.3)]);
  assert.equal(A.absorbStone(A.getBag()[1],'t1').reason,'V2SKIP_BLOCKED');
  // keystone stone
  A=build(); A.setBag([target({slot:'weapon'}),stone('ksDullConviction',0,1)]);
  assert.equal(A.absorbStone(A.getBag()[1],'t1').reason,'KEYSTONE_BLOCKED');
  // FLEX stone(parryBonus) → FLEX_BLOCKED [P7C.1] (A/B destination 없음)
  A=build(); A.setBag([target({slot:'weapon'}),stone('parryBonus',2,0.3)]);
  assert.equal(A.absorbStone(A.getBag()[1],'t1').reason,'FLEX_BLOCKED');
  // old-gen target(무 layerLv) → TARGET_NOT_V2
  A=build(); A.setBag([{id:'old',slot:'weapon',rarity:2,affixes:[]},stone('staggerBns',2,0.3)]);
  assert.equal(A.absorbStone(A.getBag()[1],'old').reason,'TARGET_NOT_V2');
});

test('§29-19 Keystone preservation — absorb가 target keystone 미변경', () => {
  const A=build(); const t=target({slot:'weapon',layerLv:10,affixes:[aff('ksDullConviction',0,1),aff('poisonDot',1,0.1)]});
  A.setBag([t,stone('staggerBns',2,0.5)]);
  const ksBefore=JSON.stringify(t.affixes.find(a=>a.id==='ksDullConviction'));
  const r=A.absorbStone(A.getBag()[1],'t1'); assert.ok(r.ok);
  const ksAfter=t.affixes.find(a=>a.id==='ksDullConviction');
  assert.ok(ksAfter,'keystone 존속'); assert.equal(JSON.stringify(ksAfter),ksBefore,'keystone instance 불변');
  assert.equal(t.affixes.filter(a=>a.id==='ksDullConviction').length,1,'keystone 중복/위치변경 없음');
});

test('§29-21/22 atomic 실패 시 bag/target/stone deep-equal 불변', () => {
  const cases=[
    ['too_low', A=>{A.setBag([target({slot:'weapon',layerLv:4}),stone('staggerBns',2,.3)]);return [1,'t1']}],
    ['incompat', A=>{A.setBag([target({slot:'ring1'}),stone('poisonDot',2,.3)]);return [1,'t1']}],
    ['dup_group', A=>{A.setBag([target({slot:'weapon',affixes:[aff('spellDmgPct',2,.3)]}),stone('splashDmg',2,.4)]);return [1,'t1']}],
    ['keystone_stone', A=>{A.setBag([target({slot:'weapon'}),stone('ksDullConviction',0,1)]);return [1,'t1']}],
    ['stone_not_bag', A=>{A.setBag([target({slot:'weapon'})]);return ['EXT','t1']}],
    ['target_missing', A=>{A.setBag([stone('staggerBns',2,.3)]);return [0,'nope']}],
  ];
  for(const [name,setup] of cases){ const A=build(); const sel=setup(A);
    const before=JSON.stringify(A.getBag()); const sn=A.saveN();
    const st=sel[0]==='EXT'?stone('staggerBns',2,.3):A.getBag()[sel[0]];
    const r=A.absorbStone(st,sel[1]); assert.equal(r.ok,false,name+' fail');
    assert.equal(JSON.stringify(A.getBag()),before,name+' bag 불변(부분 mutation 0)'); assert.equal(A.saveN(),sn,name+' save 미호출');
  }
});

test('§21/§24 equip E2E + save/load roundtrip', () => {
  const A=build(); A.setBag([target({slot:'weapon',layerLv:10,affixes:[aff('ksDullConviction',0,1)]}),stone('poisonDot',3,0.42)]);
  const r=A.absorbStone(A.getBag()[1],'t1'); assert.ok(r.ok);
  const t=A.getBag()[0];
  A._equip(t); assert.equal(A._eqAffix('poisonDot'),0.42,'equip 후 consumer 값 반영'); assert.equal(A._eqAffix('ksDullConviction'),1,'keystone 효과 유지');
  // save/load
  const round=JSON.parse(JSON.stringify(t));
  assert.equal(round.layerLv,10,'layerLv 불변'); assert.ok(round.affixes.some(a=>a.id==='poisonDot'&&a.value===0.42),'new affix 보존');
  assert.ok(round.affixes.some(a=>a.id==='ksDullConviction'),'keystone 보존');
  assert.equal(A.getBag().filter(i=>i.type==='affixStone').length,0,'stone 소멸');
});

test('§25 no RNG — absorbStone 중 Math.random 0회', () => {
  let calls=0; const spy=Object.create(Math); spy.random=()=>{calls++;return 0.5}; const A=build(spy);
  A.setBag([target({slot:'weapon',affixes:[]}),stone('staggerBns',2,0.3)]);
  assert.ok(A.absorbStone(A.getBag()[1],'t1').ok); assert.equal(calls,0,'absorption RNG 0');
});

test('§26 massive transfer sim — accepted 결과 invariants(dup/C1/keystone/layer/exact) 0 위반', () => {
  const A=build(seededMath(0x7C)); const rng=mul(0xABC); const SLOTS=['weapon','armor','ring1','helmet','boots','necklace','gloves','shield'];
  const AB=AFFIX_POOL.filter(a=>(a.sub==='A'||a.sub==='B')&&!a.keystone&&!a.v2skip&&a.layer>=1&&a.layer<=10);
  let accepted=0,dupId=0,dupGrp=0,c1=0,ksMut=0,layerMut=0,tvMis=0,coreMut=0;
  for(let n=0;n<30000;n++){ const B=build(seededMath((n*2654435761)>>>0));
    const tgt=B._mkItem(SLOTS[n%SLOTS.length],4,900); const layBefore=tgt.layerLv; const ksBefore=JSON.stringify((tgt.affixes||[]).filter(a=>DEF[a.id]&&DEF[a.id].keystone));
    const d=AB[~~(rng()*AB.length)]; const s=stone(d.id, ~~(rng()*5), +(rng().toFixed(4)));
    B.setBag([tgt,s]); const r=B.absorbStone(s,tgt.id);
    if(!r.ok)continue; accepted++;
    // invariants
    const seen={},grp={}; for(const a of tgt.affixes){const ad=DEF[a.id];if(!ad)continue;
      if(ad.keystone)continue; if(ad.sub!=='A'&&ad.sub!=='B')continue;
      if(seen[a.id])dupId++; seen[a.id]=1;
      const gk=ad.layer+'|'+ad.sub; if(grp['LS'+gk])c1++; grp['LS'+gk]=1;
      if(ad.group){if(grp['G'+ad.group])dupGrp++; grp['G'+ad.group]=1;}
    }
    if(tgt.layerLv!==layBefore)layerMut++;
    if(JSON.stringify((tgt.affixes||[]).filter(a=>DEF[a.id]&&DEF[a.id].keystone))!==ksBefore)ksMut++;
    const na=tgt.affixes.find(a=>a.id===d.id); if(!na||na.tier!==s.tier||na.value!==s.value)tvMis++;
    if('crystals'in tgt || 'socketCount'in tgt){/* mkItem 미생성이라 없음 */}
  }
  assert.ok(accepted>1000,'accepted 다수('+accepted+')');
  assert.equal(dupId,0,'dup ID 0'); assert.equal(dupGrp,0,'dup group 0'); assert.equal(c1,0,'C1 위반 0');
  assert.equal(ksMut,0,'keystone mutation 0'); assert.equal(layerMut,0,'target layer mutation 0'); assert.equal(tvMis,0,'tier/value mismatch 0');
});
