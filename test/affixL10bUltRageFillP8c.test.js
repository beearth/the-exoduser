import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 8C / LOCK-48] L10-B ULTIMATE MECHANICS — SAFE BATCH 1 : onUltRageFill ═══
// ultRageGain = Z Ultimate(holyBlast/blackStar/lavaSummon) 시전 시 분노 게이지 단방향 충전.
// layer10·sub B(compat OFFENSE·non-uni)·v2only. 소비자 _ultRageFill()=fire* 3곳(Z-only).
// execution(X) 격리·rageMax/parry gain/rageDmg/giantSlam 불변·clamp 상한강제(피드백 0)·A optional(cap10 max1).
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function grabFn(name){const sig='function '+name+'(';const i=gameHtml.indexOf(sig);assert.ok(i>=0,'추출 실패 '+name);
  let d=0,st=gameHtml.indexOf('{',i),j=st;for(;j<gameHtml.length;j++){if(gameHtml[j]==='{')d++;else if(gameHtml[j]==='}'){d--;if(d===0){j++;break;}}}return gameHtml.slice(i,j);}
function grabConst(re,n){const m=gameHtml.match(re);assert.ok(m,'추출 실패 '+n);return m[0];}
const AFFIX_POOL=(()=>{const s=gameHtml.indexOf('const AFFIX_POOL=[');const e=gameHtml.indexOf('\n];',s);
  return new Function('return '+gameHtml.slice(s+'const AFFIX_POOL='.length,e+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n'))();})();
const DEF={};for(const a of AFFIX_POOL)DEF[a.id]=a;
const SLOT_NAMES=new Function('return '+grabConst(/const SLOT_NAMES=\[[^\]]*\]/,'SLOT').replace('const SLOT_NAMES=',''))();
const CANON=grabFn('_itemLayerCap')+'\n'+grabFn('_itemLayerWeightsA2')+'\n'+grabFn('_rollItemLayerA2');
const G={
  afslot:grabConst(/const _AFSLOT=\{[^}]*\};/,'afslot'), krate:grabConst(/const KEYSTONE_ROLL_RATE=[^;]*;/,'krate'),
  tier:grabFn('_affixTierRoll'), cand:grabFn('_affixLayerCandidates'), roll:grabFn('rollAffixesLayered'),
  slotc:grabFn('_getSlotCompatGroups'), sv:grabFn('_getStoneValidity'), tv:grabFn('_getTargetValidity'),
  plan:grabFn('planAbsorption'), absorb:grabFn('absorbStone'), isStone:grabFn('_isAffixStone'), stMeta:grabFn('_affixStoneMeta'),
  exStat:grabFn('_getAffixExtractionStatus'), getEx:grabFn('getExtractableAffixes'), crEx:grabFn('_createExtractedAffix'), extract:grabFn('extractAffix'),
  kcand:grabFn('_keystoneCandidates'), iskey:grabFn('_isKeystone'), ultmul:grabFn('_ultDmgMul'), ragefill:grabFn('_ultRageFill'),
};
function build(){
  const body=`const AFFIX_POOL=arguments[2];const SLOT_NAMES=${JSON.stringify(SLOT_NAMES)};\n${G.afslot}\n${G.krate}\n`+
    `let _DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();let P={lv:1};let ITEM_LAYER_ROLL_V2=true;let _slotCompatCache=null;\n`+
    `function _getAffixDef(id){return AFFIX_POOL.find(a=>a.id===id)||null}\n`+
    `let INV={bag:[],equipped:{}};let _saveN=0;function _invFindSpace(){return {x:0,y:0}}function dbSaveForce(){_saveN++}\n`+
    `let _EQ={};function _eqAffix(id){return _EQ[id]||0}function _equip(it){_EQ={};if(it&&it.affixes)for(const a of it.affixes)_EQ[a.id]=(_EQ[a.id]||0)+(a.value!=null?a.value:0);}function _equipMany(items){_EQ={};for(const it of items)if(it&&it.affixes)for(const a of it.affixes)_EQ[a.id]=(_EQ[a.id]||0)+(a.value!=null?a.value:0);}function _unequip(){_EQ={};}\n`+
    `${CANON}\n${G.tier}\n${G.cand}\n${G.roll}\n${G.slotc}\n${G.sv}\n${G.tv}\n${G.plan}\n${G.absorb}\n${G.isStone}\n${G.stMeta}\n${G.exStat}\n${G.getEx}\n${G.crEx}\n${G.extract}\n${G.kcand}\n${G.iskey}\n${G.ultmul}\n`+
    `return {AFFIX_POOL,SLOT_NAMES,planAbsorption,absorbStone,extractAffix,getExtractableAffixes,rollAffixesLayered,_affixLayerCandidates,_keystoneCandidates,_isKeystone,_ultDmgMul,_eqAffix,_equip,_equipMany,_unequip,`+
    `getBag:()=>INV.bag,setBag:(b)=>{INV.bag=b},setEquip:(sl,it)=>{INV.equipped[sl]=it},saveN:()=>_saveN,get KRATE(){return KEYSTONE_ROLL_RATE}};`;
  return new Function('Math','console','p',body).call(null,Math,{log(){}},AFFIX_POOL);
}
// 런타임 소비자 격리 샌드박스: 실제 _ultRageFill 소스 + 목킹된 의존성(P/_rageMax/_eqAffix/addTxt/_T)
function buildRuntime(rageMaxVal){
  const body=`let _EQ={};function _eqAffix(id){return _EQ[id]||0}
    let RMAX=${rageMaxVal};function _rageMax(){return RMAX}
    let P={x:0,y:0,rage:0};let _txt=[];function addTxt(x,y,t,c,s){_txt.push(t)}function _T(s){return s}
    ${G.ragefill}
    return {call:_ultRageFill,setEq:(o)=>{_EQ=o},getRage:()=>P.rage,setRage:(v)=>{P.rage=v},setMax:(v)=>{RMAX=v},txt:()=>_txt};`;
  return new Function(body)();
}
const API=build();
const AFSLOT=new Function(G.afslot+'return _AFSLOT;')();
function mul(s){let a=s>>>0;return()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const aff=(id,tier,value)=>({id,tier,value});
const BB={1:'strFlat',2:'cooldownRed',3:'defFlat',4:'elemFocus',5:'atkSpeed',6:'skillBoost',7:'atkPctAll',8:'critDmgW',9:'rageMaxFlat',10:'ultDmg'};
const capTarget=(slot='weapon',lv=10,skip=null,extra=[])=>({id:'t1',slot,rarity:4,layerLv:lv,affixes:(()=>{const o=[];for(let L=1;L<=Math.min(lv,10);L++)if(L!==skip)o.push(aff(BB[L],2,0.1));return o.concat(extra);})()});

// ══════════════════════════════════════════════════════════════════════
test('§1 ultRageGain pool 정의 — layer10·sub B·v2only·type1·group ultRg·compat OFFENSE·unit val·5tier', () => {
  const d=DEF.ultRageGain; assert.ok(d,'ultRageGain 존재');
  assert.equal(d.layer,10,'layer 10'); assert.equal(d.sub,'B','sub B(optional·compat-gated)');
  assert.ok(d.uni!==1,'non-uni(A universal 아님)'); assert.equal(d.v2only,1,'v2only');
  assert.equal(d.type,1,'type 1(suffix/proc)'); assert.equal(d.group,'ultRg','group ultRg');
  assert.equal(d.unit,'val','val(분노 포인트)'); assert.deepEqual(d.compat,['OFFENSE'],'compat OFFENSE만');
  assert.deepEqual(d.slots,['wpn'],'wpn 슬롯(근접무기 rage 계열)'); assert.ok(d.weight>0,'weight>0');
  assert.equal(d.tiers.length,5,'5 tiers');
  // L10 pool = ultDmg(A) + ultRageGain(B) 정확히 2종
  assert.deepEqual(AFFIX_POOL.filter(a=>a.layer===10).map(a=>a.id).sort(),['ultDmg','ultRageGain'],'L10 pool = A+B 2종');
  assert.equal(AFFIX_POOL.filter(a=>a.id==='ultRageGain').length,1,'id 유일');
  assert.equal(AFFIX_POOL.filter(a=>a.group==='ultRg').length,1,'group 유일');
  // L10 sub 분포: A 1(ultDmg) / B 1(ultRageGain)
  assert.equal(AFFIX_POOL.filter(a=>a.layer===10&&a.sub==='A').length,1,'L10-A 1종');
  assert.equal(AFFIX_POOL.filter(a=>a.layer===10&&a.sub==='B').length,1,'L10-B 1종');
});

test('§2 tier curve = onKillMana/onKillHeal 참조(이벤트-프록 자원부여) — 인플레 없음', () => {
  // REFERENCE_AFFIX = onKillMana/onKillHeal([5,10,18,28,40]·type1·val·event-proc resource grant). NEW=[10,15,20,30,40].
  assert.deepEqual(DEF.ultRageGain.tiers,[10,15,20,30,40],'NEW_TIERS 확정');
  assert.equal(DEF.ultRageGain.tiers[4],DEF.onKillMana.tiers[4],'상단(40) = onKillMana 상단 매칭');
  assert.equal(DEF.ultRageGain.tiers[4],DEF.onKillHeal.tiers[4],'상단(40) = onKillHeal 상단 매칭');
  // 하단만 상향(궁극 120s cd로 on-kill보다 희소) — 여전히 rageMaxFlat 영구최대치(80) 미만
  assert.ok(DEF.ultRageGain.tiers[0]>=DEF.onKillMana.tiers[0],'하단 상향(희소성 반영)');
  assert.ok(DEF.ultRageGain.tiers[4]<DEF.rageMaxFlat.tiers[4],'상단(40) < rageMaxFlat 영구최대치(80)');
  // 단조증가
  for(let i=1;i<5;i++)assert.ok(DEF.ultRageGain.tiers[i]>DEF.ultRageGain.tiers[i-1],'tier 단조증가');
});

test('§3 i18n name/desc — 분출의 / 궁극시전 분노+ (기존 KO-only 규약)', () => {
  assert.match(gameHtml,/ultRageGain:'분출의'/,'AFFIX_NAMES.ultRageGain 등록');
  assert.match(gameHtml,/ultRageGain:'궁극시전 분노\+'/,'_AFFIX_DESC.ultRageGain 등록');
});

test('§4 소비자 배선 — _ultRageFill 정의 + Z Ultimate fire* 3곳(Z-only) 호출', () => {
  assert.match(gameHtml,/function _ultRageFill\(\)\{const _urg=_eqAffix\('ultRageGain'\);if\(_urg>0\)\{P\.rage=Math\.min\(_rageMax\(\),\(P\.rage\|\|0\)\+_urg\);/,'_ultRageFill 정의(clamp)');
  // fire* 3곳 모두 _ultRageFill() 호출
  assert.ok(/_ultRageFill\(\);/.test(grabFn('fireHolyBlast')),'fireHolyBlast에 _ultRageFill 호출');
  assert.ok(/_ultRageFill\(\);/.test(grabFn('fireBlackStar')),'fireBlackStar에 _ultRageFill 호출');
  assert.ok(/_ultRageFill\(\);/.test(grabFn('fireLavaSummon')),'fireLavaSummon에 _ultRageFill 호출');
  // 정확히 3 call-site (fire* 외 호출 없음)
  assert.equal((gameHtml.match(/_ultRageFill\(\);/g)||[]).length,3,'call-site 정확히 3(fire* 전용)');
});

test('§5 execution hard exclusion — execution(KeyX) 블록에 _ultRageFill 미개입', () => {
  const exi=gameHtml.indexOf("_chkJust('KeyX')");
  assert.ok(exi>=0,'execution 블록 존재');
  const execBlock=gameHtml.slice(exi,exi+2500);
  assert.ok(!/_ultRageFill/.test(execBlock),'execution 블록에 _ultRageFill 없음(Z-only)');
});

test('§6 _ultRageFill 런타임 semantic — clamp _rageMax·단방향·Σ 합산·0 무효·미착용 무효', () => {
  const R=buildRuntime(100);
  // 미착용 → 변화 없음
  R.call(); assert.equal(R.getRage(),0,'ultRageGain 미착용 → rage 불변(0)');
  // 단일 40 → +40
  R.setEq({ultRageGain:40}); R.setRage(0); R.call(); assert.equal(R.getRage(),40,'단일 40 → +40');
  // 단방향 증가 + clamp: 80에서 +40 → max 100 clamp(120 아님)
  R.setRage(80); R.call(); assert.equal(R.getRage(),100,'80+40 → clamp _rageMax(100), 초과 금지');
  // 이미 max → 그대로(단방향, 감소 없음)
  R.setRage(100); R.call(); assert.equal(R.getRage(),100,'max에서 재호출 → 불변(단방향)');
  // Σ 합산(다중 장착)
  R.setEq({ultRageGain:70}); R.setRage(0); R.call(); assert.equal(R.getRage(),70,'Σ=70 → +70');
  // rageMax 증가 시 그만큼 더 참(rageMaxFlat 존중)
  R.setMax(150); R.setEq({ultRageGain:40}); R.setRage(120); R.call(); assert.equal(R.getRage(),150,'max150에서 120+40→clamp150');
  // 무관 affix는 영향 0
  R.setEq({skillBoost:0.5}); R.setRage(10); R.call(); assert.equal(R.getRage(),10,'ultRageGain 0 → rage 불변');
});

test('§7 rage 시스템 불변 — _rageMax 공식·rageDmg·rageMaxFlat pool 미변경', () => {
  // _rageMax 공식 원형 유지(100 + _uRageMax + rageMaxFlat 어픽스, ×분노폭주 패시브)
  const rm=grabFn('_rageMax');
  assert.match(rm,/100\+\(_uEq\('_uRageMax'\)\|\|0\)\+\(_eqAffix\('rageMaxFlat'\)\|\|0\)/,'_rageMax 공식 불변');
  // L9 rage 어픽스 정의 불변
  assert.deepEqual(DEF.rageMaxFlat.tiers,[10,20,35,55,80],'rageMaxFlat tiers 불변');
  assert.deepEqual(DEF.rageDmg.tiers,[.08,.14,.22,.32,.44],'rageDmg tiers 불변');
  assert.equal(DEF.rageMaxFlat.layer,9,'rageMaxFlat L9 불변'); assert.equal(DEF.rageDmg.layer,9,'rageDmg L9 불변');
  // giantSlam 분노 소비: _ultRageFill은 rage 감소/소비 경로 없음(단방향 증가만)
  assert.ok(!/rage\s*=\s*0/.test(G.ragefill),'_ultRageFill에 rage 소비(=0) 없음');
  assert.ok(!/Cd|cooldown|_hbCd|_bsCd|_lvCd/.test(G.ragefill),'_ultRageFill에 ult 쿨다운 조작 없음(피드백 루프 차단)');
});

test('§8 C1 roller — cap10 weapon L10-B 도달·cap<10 zero·per-item L10-B ≤1', () => {
  const A=build();
  let wpn10_B=0,below_B=0,dupB=0;
  for(let i=0;i<800;i++){const r=A.rollAffixesLayered(4,'weapon',undefined,10);
    const bCnt=r.filter(a=>DEF[a.id].layer===10&&DEF[a.id].sub==='B').length;
    if(bCnt>0)wpn10_B++; if(bCnt>1)dupB++;}
  assert.ok(wpn10_B>0,'cap10 weapon L10-B(ultRageGain) reachable>0');
  assert.equal(dupB,0,'per-item L10-B ≤1(중복 없음)');
  for(let cap=1;cap<=9;cap++)for(let i=0;i<200;i++){const r=A.rollAffixesLayered(4,'weapon',undefined,cap);
    for(const a of r)if(DEF[a.id].layer===10&&DEF[a.id].sub==='B')below_B++;}
  assert.equal(below_B,0,'cap<10 → L10-B 0');
});

test('§9 reachability — weapon만 L10-B 후보에 ultRageGain, 그 외 슬롯 0', () => {
  const A=build();
  for(const slot of SLOT_NAMES){
    const bCand=A._affixLayerCandidates(AFSLOT[slot],slot==='bracelet'?'demon':undefined,10,'B');
    const has=bCand.some(c=>c.id==='ultRageGain');
    if(slot==='weapon')assert.ok(has,'weapon L10-B 후보에 ultRageGain 포함');
    else assert.ok(!has,`${slot} L10-B 후보에 ultRageGain 미포함(slot-gated)`);
  }
});

test('§10 A+B 공존 — cap10 weapon = ultDmg(A)+ultRageGain(B), C1 per-layer×sub ≤1', () => {
  const A=build();
  let coexist=0,c1viol=0;
  for(let i=0;i<600;i++){const r=A.rollAffixesLayered(4,'weapon',undefined,10);
    const hasA=r.some(a=>a.id==='ultDmg'), hasB=r.some(a=>a.id==='ultRageGain');
    if(hasA&&hasB)coexist++;
    // per-layer×sub cardinality ≤1
    const cnt={};for(const a of r){const d=DEF[a.id];const k=d.layer+'|'+d.sub;cnt[k]=(cnt[k]||0)+1;if(cnt[k]>1)c1viol++;}
  }
  assert.ok(coexist>0,'cap10 weapon에서 A(ultDmg)+B(ultRageGain) 공존 가능');
  assert.equal(c1viol,0,'per-layer×sub cardinality ≤1(A+B 각 1 허용)');
});

test('§11 Keystone independence — ultRageGain 비-keystone·후보/rate 불변', () => {
  const A=build();
  assert.equal(A._isKeystone('ultRageGain'),false,'ultRageGain은 keystone 아님');
  assert.equal(A._keystoneCandidates('wpn',8).length,3,'weapon L8 keystone 후보 3(불변)');
  assert.equal(A._keystoneCandidates('armor',8).length,2,'armor L8 keystone 후보 2(불변)');
  assert.ok(!A._keystoneCandidates('wpn',10).some(c=>c.id==='ultRageGain'),'ultRageGain은 keystone 후보 아님');
  assert.equal(A.KRATE,0.02,'KEYSTONE_ROLL_RATE 0.02 FREEZE');
});

test('§12 Transfer — extract→stone→OFFENSE L10 absorb·TARGET_TOO_LOW·DEFENSE 거부', () => {
  const A=build();
  // cap10 weapon에 ultRageGain 강제 부착 후 추출
  const src=capTarget('weapon',10,null,[aff('ultRageGain',4,40)]); src.id='src'; A.setBag([src]);
  const exCands=A.getExtractableAffixes(src); assert.ok(exCands.find(c=>c.affixId==='ultRageGain'),'ultRageGain 추출 가능');
  const rEx=A.extractAffix('src','ultRageGain'); assert.ok(rEx.ok,'추출 성공');
  const stone=A.getBag().find(i=>i.type==='affixStone'&&i.affixId==='ultRageGain'); assert.ok(stone,'affixStone 생성');
  assert.equal(stone.value,40,'exact value 보존');
  // OFFENSE cap10 target(weapon) 흡수 — INSERT (target에 L10-B 없음)
  const tgt=capTarget('weapon',10); tgt.id='tgtO'; A.setBag([tgt,stone]);
  const st=A.getBag().find(i=>i.type==='affixStone');
  const plan=A.planAbsorption(tgt,st); assert.ok(plan.ok,'OFFENSE cap10 L10-B absorb plan ok');
  const rAb=A.absorbStone(st,'tgtO'); assert.ok(rAb.ok,'흡수 성공');
  assert.equal(tgt.affixes.filter(a=>a.id==='ultRageGain').length,1,'L10-B 정확히 1');
  // TARGET_TOO_LOW: cap9
  const A2=build(); const low=capTarget('weapon',9); low.id='low';
  const s2={type:'affixStone',affixId:'ultRageGain',tier:4,value:40}; A2.setBag([low,s2]);
  const r2=A2.absorbStone(s2,'low'); assert.equal(r2.ok,false); assert.equal(r2.reason,'TARGET_TOO_LOW','cap9 target 거부');
  // DEFENSE-only 슬롯 target(boots) 거부 — B compat 불일치(armor는 DEF+OFF라 통과하므로 순수 DEFENSE 슬롯 사용)
  const A3=build(); const dtgt=capTarget('boots',10); dtgt.id='dt';
  const s3={type:'affixStone',affixId:'ultRageGain',tier:4,value:40}; A3.setBag([dtgt,s3]);
  const r3=A3.absorbStone(s3,'dt'); assert.equal(r3.ok,false,'DEFENSE-only(boots) target은 OFFENSE-only L10-B 거부');
});

test('§13 save/load roundtrip — ultRageGain {id,tier,value} 직렬화 무손실', () => {
  const it=capTarget('weapon',10,null,[aff('ultRageGain',4,40)]);
  const rg=it.affixes.find(a=>a.id==='ultRageGain');
  const round=JSON.parse(JSON.stringify(it));
  assert.deepEqual(round.affixes.find(a=>a.id==='ultRageGain'),rg,'ultRageGain 직렬화 동일');
});

test('§14 massive V2 invariants — 200k: L10-A mandatory·L10-B reachable·dup/C1/keystone 0·cap<10 L10 zero', () => {
  const A=build(); const rng=mul(0xC0DE);
  let noL10Aat10=0,l10below=0,dupG=0,ks=0,c1sub=0,wpnB=0,wpn10=0,maxAff=0,maxWpn=0;
  for(let i=0;i<200000;i++){
    const cap=1+(~~(rng()*10)); const slot=SLOT_NAMES[~~(rng()*SLOT_NAMES.length)];
    const r=A.rollAffixesLayered(4,slot,slot==='bracelet'?'demon':undefined,cap);
    if(r.length>maxAff)maxAff=r.length; if(slot==='weapon'&&r.length>maxWpn)maxWpn=r.length;
    const hasA10=r.some(a=>DEF[a.id].layer===10&&DEF[a.id].sub==='A');
    if(cap>=10&&!hasA10)noL10Aat10++; if(cap<10&&r.some(a=>DEF[a.id].layer===10))l10below++;
    if(slot==='weapon'&&cap>=10){wpn10++; if(r.some(a=>a.id==='ultRageGain'))wpnB++;}
    const gseen={},subCnt={};
    for(const a of r){const d=DEF[a.id]; if(d.keystone)ks++; if(gseen[d.group])dupG++; gseen[d.group]=1;
      const k=d.layer+'|'+d.sub; subCnt[k]=(subCnt[k]||0)+1; if(subCnt[k]>1)c1sub++;}
  }
  assert.equal(noL10Aat10,0,'cap10 전부 L10-A 보유(mandatory 불변)');
  assert.equal(l10below,0,'cap<10 L10(A/B) 0');
  assert.equal(dupG,0,'group dup 0'); assert.equal(ks,0,'정상롤 keystone 0'); assert.equal(c1sub,0,'per-layer×sub cardinality C1 0');
  assert.ok(wpnB>0,'cap10 weapon L10-B(ultRageGain) reachable>0 ('+wpnB+'/'+wpn10+')');
  // affix-count impact 리포트(참고): structural max
  console.error('    [§14] structural max affix (any slot)='+maxAff+' / weapon='+maxWpn+' / cap10 weapon L10-B rate='+(wpnB/wpn10*100).toFixed(1)+'%');
});
