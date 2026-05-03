// Phase 32b — 남은 24개 OPT.lang!=='ko' 처리
const fs = require('fs');
const BASE = 'G:/hell';

let src = fs.readFileSync(`${BASE}/game.html`, 'utf8');

function rep(from, to, tag) {
  if (!src.includes(from)) {
    console.warn('NOT FOUND:', tag || from.slice(0, 70));
    return;
  }
  src = src.replace(from, to);
  console.log('OK:', tag || from.slice(0, 50));
}

// ═══ 1. Hit 텍스트 (lines 22136, 22587) ════════════════════════════════════
// regex로 두 곳 동시 처리
src = src.replace(
  /_cresStep\+\(OPT\.lang!=='ko'\?' Hit':'타'\)/g,
  "_cresStep+_L('타',' Hit')"
);
console.log('hit text replacement done');

// ═══ 2. 사망 화면 (line 31711) ══════════════════════════════════════════════
rep(
  "const _eL=OPT.lang!=='ko';\n  const _hn=_T(HELL_NAMES[STG[G.stage].hell]);\n  const infoTxt=_eL?`\uD83D\uDC80 ${G.kills} kills | ${_hn} | EXP -${expLoss} | \uD83D\uDD25 Max Combo ${G.comboMax}`:`\uD83D\uDC80 ${G.kills} 처치 | ${_hn} ${STG[G.stage].kr} | 경험치 -${expLoss} | \uD83D\uDD25 최대콤보 ${G.comboMax}`;",
  "const _hn=_T(HELL_NAMES[STG[G.stage].hell]);\n  const infoTxt=`\uD83D\uDC80 ${G.kills} `+_L('처치','kills')+` | ${_hn} | EXP -${expLoss} | \uD83D\uDD25 `+_L('최대콤보','Max Combo')+` ${G.comboMax}`;",
  'death screen _eL'
);

// ═══ 3. 스킬 상세 팝업 함수 _skDetailHTML (line 32315) ═══════════════════════
// const _e 제거 후 _e? → _L()로 전환 (전체 함수 내 단순 문자열 패턴)
rep("  const _e=OPT.lang!=='ko';\n  const lv=Math.max(1,slv);\n  const learned=slv>=1;",
    "  const lv=Math.max(1,slv);\n  const learned=slv>=1;",
    'skDetailHTML _e remove');

// _e?'str1':'str2' 패턴 in 함수 (only simple quoted string pairs)
// We do targeted replacements for all known patterns in this function
const skDetailRepl = [
  ["_e?'None':'없음'", "_L('없음','None')"],
  ["_e?'Skill Info':'스킬 정보'", "_L('스킬 정보','Skill Info')"],
  ["_e?'Type':'타입'", "_L('타입','Type')"],
  ["_e?'Passive':'패시브'", "_L('패시브','Passive')"],
  ["_e?'Physical':'물리'", "_L('물리','Physical')"],
  ["_e?'Bow':'활'", "_L('활','Bow')"],
  ["_e?'Magic':'마법'", "_L('마법','Magic')"],
  ["_e?'Level':'레벨'", "_L('레벨','Level')"],
  ["_e?'Not Learned':'미습득'", "_L('미습득','Not Learned')"],
  ["_e?'SP Cost':'SP 비용'", "_L('SP 비용','SP Cost')"],
  ["_e?'Malice Cost':'악의 비용'", "_L('악의 비용','Malice Cost')"],
  ["_e?'Cooldown':'쿨다운'", "_L('쿨다운','Cooldown')"],
  ["_e?'Req. Lv':'요구 레벨'", "_L('요구 레벨','Req. Lv')"],
  ["_e?'Damage':'데미지'", "_L('데미지','Damage')"],
  ["_e?'Base Reference':'기본 참조뎀'", "_L('기본 참조뎀','Base Reference')"],
  ["_e?'Stat Mult':'스탯 배율'", "_L('스탯 배율','Stat Mult')"],
  ["_e?'Passive Mult':'패시브 배율'", "_L('패시브 배율','Passive Mult')"],
  ["_e?'Skill Lv Mult':'레벨 배율'", "_L('레벨 배율','Skill Lv Mult')"],
  ["_e?'Estimated Avg DMG':'예상 평균 뎀'", "_L('예상 평균 뎀','Estimated Avg DMG')"],
  ["_e?'Critical':'치명타'", "_L('치명타','Critical')"],
  ["_e?'Crit Rate':'치명타 확률'", "_L('치명타 확률','Crit Rate')"],
  ["_e?'Crit Dmg':'치명타 배율'", "_L('치명타 배율','Crit Dmg')"],
  ["_e?'Effective Mult':'유효 배율'", "_L('유효 배율','Effective Mult')"],
  ["_e?'Skill Specific':'스킬 고유'", "_L('스킬 고유','Skill Specific')"],
  ["_e?(sk.descEn||sk.desc):sk.desc", "_L(sk.desc,sk.descEn||sk.desc)"],
];
for (const [from, to] of skDetailRepl) {
  if (!src.includes(from)) { console.warn('NOT FOUND (skDetail):', from.slice(0,50)); continue; }
  // 중복 있을 수 있으므로 replaceAll
  src = src.split(from).join(to);
  console.log('OK skDetail:', from.slice(0,40));
}

// ═══ 4. _skSpecificDetails 함수 (line 32392) ════════════════════════════════
rep("  const _e=OPT.lang!=='ko';\n  const lv=Math.max(1,slv);\n  const id=sk.id;",
    "  const lv=Math.max(1,slv);\n  const id=sk.id;",
    'skSpecificDetails _e remove');

const skSpecificRepl = [
  ["_e?'1-Hit Mult':'1타 배율'", "_L('1타 배율','1-Hit Mult')"],
  ["_e?'2-Hit Mult':'2타 배율'", "_L('2타 배율','2-Hit Mult')"],
  ["_e?'3-Hit Mult':'3타 배율'", "_L('3타 배율','3-Hit Mult')"],
  ["_e?'Per Lv DMG':'레벨당 뎀'", "_L('레벨당 뎀','Per Lv DMG')"],
  ["_e?'Crescent Range':'검기 거리'", "_L('검기 거리','Crescent Range')"],
  ["_e?'Lv Range Bonus':'레벨당 거리'", "_L('레벨당 거리','Lv Range Bonus')"],
  ["_e?'ST/Tick':'ST/틱'", "_L('ST/틱','ST/Tick')"],
  ["_e?'AoE Range':'범위'", "_L('범위','AoE Range')"],
  ["_e?'Per Lv Size':'레벨당 크기'", "_L('레벨당 크기','Per Lv Size')"],
  ["_e?'Knockback':'넉백'", "_L('넉백','Knockback')"],
  ["_e?'Charge Time':'충전 시간'", "_L('충전 시간','Charge Time')"],
  ["_e?'Range':'범위'", "_L('범위','Range')"],
  ["_e?'Per Lv Range':'레벨당 범위'", "_L('레벨당 범위','Per Lv Range')"],
  ["_e?'Pierce Rate':'관통률'", "_L('관통률','Pierce Rate')"],
  ["_e?'Projectile Pierce Bonus':'투사체 관통 보정'", "_L('투사체 관통 보정','Projectile Pierce Bonus')"],
  ["_e?'DOT Duration':'지속뎀'", "_L('지속뎀','DOT Duration')"],
  ["_e?'Range':'사거리'", "_L('사거리','Range')"],
  ["_e?'Infinite':'무한'", "_L('무한','Infinite')"],
  ["_e?'AoE Type':'타격 형식'", "_L('타격 형식','AoE Type')"],
  ["_e?'Shockwave':'진동파'", "_L('진동파','Shockwave')"],
  ["_e?'Stagger':'스태거'", "_L('스태거','Stagger')"],
  ["_e?'High':'높음'", "_L('높음','High')"],
  ["_e?'CD':'쿨다운'", "_L('쿨다운','CD')"],
  ["_e?'Stocks':'스톡'", "_L('스톡','Stocks')"],
  ["_e?'Pillars':'기둥 수'", "_L('기둥 수','Pillars')"],
  ["_e?'Duration':'지속'", "_L('지속','Duration')"],
  ["_e?'Radius':'반경'", "_L('반경','Radius')"],
];
for (const [from, to] of skSpecificRepl) {
  if (!src.includes(from)) { console.warn('NOT FOUND (skSpec):', from.slice(0,50)); continue; }
  src = src.split(from).join(to);
  console.log('OK skSpec:', from.slice(0,40));
}

// ═══ 5. dNone.onclick 슬롯 해제 (line 32615) ════════════════════════════════
rep(
  "const _e=OPT.lang!=='ko';const _slL=slotIdx<4?(_e?'Slot ':'슬롯')+(slotIdx+1):slotIdx===4?(_e?'SP Slot':'SP슬롯'):(_e?'F Slot':'F슬롯');addTxt(P.x,P.y-20,_slL+(_e?' Unset':' 해제'),'#888',30)};",
  "const _slL=(slotIdx<4?_L('슬롯','Slot ')+(slotIdx+1):slotIdx===4?_L('SP슬롯','SP Slot'):_L('F슬롯','F Slot'));addTxt(P.x,P.y-20,_slL+_L(' 해제',' Unset'),'#888',30)};",
  'slot unset onclick'
);

// ═══ 6. SKILL_HIER 탭 (line 33694) ══════════════════════════════════════════
rep(
  "const _e2=OPT.lang!=='ko';\n  SKILL_HIER.forEach(h=>{\n    const _act=_skHierTab===h.id;\n    const tb=document.createElement('div');\n    tb.style.cssText='padding:6px 18px;font-size:1rem;font-weight:800;cursor:pointer;border:2px solid '+(_act?h.col:'#332211')+';border-radius:8px;color:'+(_act?h.col:'#776655')+';background:'+(_act?h.col+'18':'rgba(0,0,0,.3)')+';letter-spacing:.1em;transition:all .15s';\n    tb.textContent=_e2?(h.nameEn||h.name):h.name;",
  "SKILL_HIER.forEach(h=>{\n    const _act=_skHierTab===h.id;\n    const tb=document.createElement('div');\n    tb.style.cssText='padding:6px 18px;font-size:1rem;font-weight:800;cursor:pointer;border:2px solid '+(_act?h.col:'#332211')+';border-radius:8px;color:'+(_act?h.col:'#776655')+';background:'+(_act?h.col+'18':'rgba(0,0,0,.3)')+';letter-spacing:.1em;transition:all .15s';\n    tb.textContent=_L(h.name,h.nameEn||h.name);",
  'SKILL_HIER _e2'
);

// ═══ 7. 스킬 그리드 렌더 함수 (line 34081) ══════════════════════════════════
// const _e 제거
rep(
  "    const _e=OPT.lang!=='ko';\n    const _fixedKey=_e?_fixedKeyMapEn[sk.id]:_fixedKeyMap[sk.id];",
  "    const _fixedKey=_L(_fixedKeyMap[sk.id]||'',_fixedKeyMapEn[sk.id]||'')||undefined;",
  'skGrid _e remove + fixedKey'
);

// fuse name display
rep(
  "const _dispName=_starTxt+(_fuseNameKey?(_e?_FUSE_NAME_EN[_fuseNameKey]:_FUSE_NAME_KO[_fuseNameKey]):_T(sk.name));",
  "const _dispName=_starTxt+(_fuseNameKey?_L(_FUSE_NAME_KO[_fuseNameKey],_FUSE_NAME_EN[_fuseNameKey]):_T(sk.name));",
  'fuse dispName'
);
rep(
  "let _dispDesc=_fuseNameKey?(_e?_FUSE_DESC_EN[_fuseNameKey]:_FUSE_DESC_KO[_fuseNameKey]):(_e?(sk.descEn||sk.desc):sk.desc);",
  "let _dispDesc=_fuseNameKey?_L(_FUSE_DESC_KO[_fuseNameKey],_FUSE_DESC_EN[_fuseNameKey]):_L(sk.desc,sk.descEn||sk.desc);",
  'fuse dispDesc'
);

// skill grid _e? string patterns
const skGridRepl = [
  ["_e?'Select':'선택'", "_L('선택','Select')"],
  ["_e?'Requires ['+_reqSkName+']':'선행스킬 ['+_reqSkName+'] 필요'", "_L('선행스킬 ['+_reqSkName+'] 필요','Requires ['+_reqSkName+']')"],
  ["_e?'👻 Scarecrow needed':'👻 허수아비 필요'", "_L('👻 허수아비 필요','👻 Scarecrow needed')"],
  ["_e?'Req. Lv.'+sk.reqLv+' (Current Lv.'+P.lv+')':'Lv.'+sk.reqLv+' 필요 (현재 Lv.'+P.lv+')'", "_L('Lv.'+sk.reqLv+' 필요 (현재 Lv.'+P.lv+')','Req. Lv.'+sk.reqLv+' (Current Lv.'+P.lv+')')"],
  ["_e?'Can Learn':'습득 가능'", "_L('습득 가능','Can Learn')"],
  ["_e?'Learned':'습득'", "_L('습득','Learned')"],
  ["_e?'SP needed: ':'SP 부족: '", "_L('SP 부족: ','SP needed: ')"],
  ["_e?'Upgrade: ':'강화 가능: '", "_L('강화 가능: ','Upgrade: ')"],
  ["_e?' unlock':'해금'", "_L('해금',' unlock')"],
  ["_e?'✅ Learned':'✅ 습득 완료'", "_L('✅ 습득 완료','✅ Learned')"],
  ["_e?'Mastery':'숙련'", "_L('숙련','Mastery')"],
  ["_e?'Mastery MAX ✦':'숙련 MAX ✦'", "_L('숙련 MAX ✦','Mastery MAX ✦')"],
];
for (const [from, to] of skGridRepl) {
  if (!src.includes(from)) { console.warn('NOT FOUND (skGrid):', from.slice(0,60)); continue; }
  src = src.split(from).join(to);
  console.log('OK skGrid:', from.slice(0,50));
}

// upLabel long fuse label patterns (use replaceAll for regex-unsafe chars)
// These are complex multi-line ternary strings - just replace _e? with OPT.lang!=='ko'?
// to avoid regex complexity
src = src.replace(/\b_e\?([\s\S]*?):([\s\S]*?)(?=\n|;|\))/g, (m, en, ko) => {
  // Only apply to simple cases that are still unhandled
  return m; // skip - handled individually above
});

// ═══ 8. optMinLvVal (lines 35137, 35668) ════════════════════════════════════
src = src.replace(
  /t\+\(OPT\.lang!=='ko'\?'T \(('\+l\+'\)Lv\+\))':'단 \(('\+l\+'\)Lv\+\))'\)/g,
  "t+_L(`단 (${l}Lv+)`,`T (${l}Lv+)`)"
);
// Try literal string match instead
rep(
  "t+(OPT.lang!=='ko'?'T ('+l+'Lv+)':'단 ('+l+'Lv+)')",
  "t+_L('단 ('+l+'Lv+)','T ('+l+'Lv+)')",
  'optMinLv label (2 occurrences via replaceAll)'
);
if (src.includes("t+(OPT.lang!=='ko'?'T ('+l+'Lv+)':'단 ('+l+'Lv+)')")) {
  src = src.split("t+(OPT.lang!=='ko'?'T ('+l+'Lv+)':'단 ('+l+'Lv+)')").join("t+_L('단 ('+l+'Lv+)','T ('+l+'Lv+)')");
  console.log('OK optMinLv 2nd occurrence');
}

// ═══ 9. _invRenderDetail 함수 (line 35795) ══════════════════════════════════
rep("  const _e=OPT.lang!=='ko';\n  const it=source==='eq'?INV.equipped[idx]",
    "  const it=source==='eq'?INV.equipped[idx]",
    'invRenderDetail _e remove');

rep(
  "let ch='<div style=\"color:#bb88ff;font-size:.8rem;font-weight:700;margin-bottom:4px\">'+(_e?'Crystal Slot':'결정 슬롯')+' ('+it.socketCount+') — '+(_e?'click to equip/detach':'클릭하여 장착/탈착')+'</div>';",
  "let ch='<div style=\"color:#bb88ff;font-size:.8rem;font-weight:700;margin-bottom:4px\">'+_L('결정 슬롯','Crystal Slot')+' ('+it.socketCount+') — '+_L('클릭하여 장착/탈착','click to equip/detach')+'</div>';",
  'invRenderDetail crystal slot label'
);
rep(
  "◇ '+(_e?'Empty Slot':'빈 슬롯')",
  "◇ '+_L('빈 슬롯','Empty Slot')",
  'invRenderDetail empty slot'
);
rep(
  "(_selectedCrystal>=0?' — '+(_e?'Click to equip selected crystal':'클릭하여 선택결정 장착'):' — '+(_e?'Select crystal then click':'결정 선택 후 클릭'))",
  "(_selectedCrystal>=0?' — '+_L('클릭하여 선택결정 장착','Click to equip selected crystal'):' — '+_L('결정 선택 후 클릭','Select crystal then click'))",
  'invRenderDetail crystal pick hint'
);

// ═══ 10. LMB/RMB 도움말 (line 35821) ════════════════════════════════════════
rep(
  "${OPT.lang!=='ko'?'LMB: Select | RMB: Equip | Space: Junk | F: Lock':'좌클릭: 선택 | 우클릭: 장착 | Space: 쓰레기 | F: 잠금'}",
  "${_L('좌클릭: 선택 | 우클릭: 장착 | Space: 쓰레기 | F: 잠금','LMB: Select | RMB: Equip | Space: Junk | F: Lock')}",
  'LMB hint template literal'
);

// ═══ 11. _invCardFields 함수 (line 35877) ════════════════════════════════════
rep("function _invCardFields(it){\n  const _e=OPT.lang!=='ko';\n  let stats='';",
    "function _invCardFields(it){\n  let stats='';",
    'invCardFields _e remove');

// _e patterns in _invCardFields (DPS labels etc.)
const cardFieldRepl = [
  ["_e?'ATK':'공격력'", "_L('공격력','ATK')"],
  ["_e?'DEF':'방어력'", "_L('방어력','DEF')"],
  ["_e?'SPD':'이동속도'", "_L('이동속도','SPD')"],
  ["_e?'DPS (est)':'DPS(추정)'", "_L('DPS(추정)','DPS (est)')"],
  ["_e?'vs current':'현재 장착 대비'", "_L('현재 장착 대비','vs current')"],
  ["_e?'+DPS':'DPS↑'", "_L('DPS↑','+DPS')"],
  ["_e?'-DPS':'DPS↓'", "_L('DPS↓','-DPS')"],
  ["_e?'Affixes':'어픽스'", "_L('어픽스','Affixes')"],
  ["_e?'Socket':'소켓'", "_L('소켓','Socket')"],
  ["_e?'Crystal: ':'결정: '", "_L('결정: ','Crystal: ')"],
  ["_e?'Durability: ':'내구도: '", "_L('내구도: ','Durability: ')"],
];
for (const [from, to] of cardFieldRepl) {
  if (!src.includes(from)) { console.warn('NOT FOUND (cardField):', from.slice(0,50)); continue; }
  src = src.split(from).join(to);
  console.log('OK cardField:', from.slice(0,40));
}

// ═══ 12. _invBuildCompare 함수 (line 35978) ══════════════════════════════════
rep("function _invBuildCompare(item,curEq){\n  const _e=OPT.lang!=='ko';",
    "function _invBuildCompare(item,curEq){",
    'invBuildCompare _e remove');

rep(
  "const label=_e?(_cmpEN[ck[1]]||ck[1]):ck[1]",
  "const label=_L(ck[1],_cmpEN[ck[1]]||ck[1])",
  'invBuildCompare label'
);

// ═══ 13. C창 stat-name/stat-desc (lines 37189, 37190) ═════════════════════
// 이 패턴들은 template literal 안에 있음 — 직접 타겟
rep(
  "${OPT.lang!=='ko'?sd.nameEn:sd.name}",
  "${_L(sd.name,sd.nameEn)}",
  'stat-name nameEn'
);
rep(
  "${OPT.lang!=='ko'?sd.descEn:sd.desc}",
  "${_L(sd.desc,sd.descEn||sd.desc)}",
  'stat-desc descEn'
);

// ═══ 14. GRIT stat (lines 37217, 37218) ══════════════════════════════════════
rep(
  "${OPT.lang!=='ko'?'GRIT':'근성 (GRIT)'}",
  "${_L('근성 (GRIT)','GRIT')}",
  'GRIT stat-name'
);
rep(
  "${OPT.lang!=='ko'?'HP/MP/ST +1, DEF/eDEF +0.5':'HP/MP/ST +1, 방어력/속성방어 +0.5'}",
  "${_L('HP/MP/ST +1, 방어력/속성방어 +0.5','HP/MP/ST +1, DEF/eDEF +0.5')}",
  'GRIT stat-desc'
);

// ═══ 15. passive-name/passive-desc (line 37262) ════════════════════════════
rep(
  "${OPT.lang!=='ko'?(pd.nameEn||pd.name):pd.name}",
  "${_L(pd.name,pd.nameEn||pd.name)}",
  'passive-name nameEn'
);
rep(
  "${OPT.lang!=='ko'?(pd.descEn||pd.desc):pd.desc}",
  "${_L(pd.desc,pd.descEn||pd.desc)}",
  'passive-desc descEn'
);

// ═══ 16. C창 로컬 _L/_e 제거 (line 37322) ════════════════════════════════════
rep(
  "  const _e=OPT.lang!=='ko';\n  const _L=(ko,en)=>{if(OPT.lang==='ko')return ko;const _lt=_T(ko);return _lt===ko?en:_lt};",
  "  // global _L() used",
  'C창 local _L/_e remove'
);
// fallback: just the _e line if both already split
rep(
  "  const _e=OPT.lang!=='ko';\n  const _L=(ko,en)=>{if(OPT.lang==='ko')return ko;const _lt=_T(ko);return _lt===ko?en:_lt}\n",
  "  // global _L() used\n",
  'C창 local _L/_e remove (alt)'
);

// ═══ 17. HUD eq 라벨 (line 44855) ════════════════════════════════════════════
rep("  const _eqE=OPT.lang!=='ko';\n  $('eq0')",
    "  $('eq0')",
    'HUD _eqE remove');
// Replace _eqE? patterns
const eqERepl = [
  ["_eqE?'Weapon':'무기'", "_L('무기','Weapon')"],
  ["_eqE?'Bare':'맨손'", "_L('맨손','Bare')"],
  ["_eqE?'Shield':'견갑'", "_L('견갑','Shield')"],
  ["_eqE?'None':'없음'", "_L('없음','None')"],
  ["_eqE?'Boots':'부츠'", "_L('부츠','Boots')"],
  ["_eqE?'Armor':'갑옷'", "_L('갑옷','Armor')"],
  ["_eqE?'Helmet':'투구'", "_L('투구','Helmet')"],
  ["_eqE?'Bow':'활'", "_L('활','Bow')"],
  ["_eqE?'Gloves':'장갑'", "_L('장갑','Gloves')"],
];
for (const [from, to] of eqERepl) {
  if (!src.includes(from)) { console.warn('NOT FOUND (eqE):', from.slice(0,50)); continue; }
  src = src.split(from).join(to);
  console.log('OK eqE:', from.slice(0,40));
}

// ═══ 18. 인트로 키 단계 (line 45806) ════════════════════════════════════════
rep(
  "const _li=OPT.lang!=='ko'?1:0;",
  "const _li=OPT.lang==='ko'?0:1;",
  'introKeys _li'
);

// ═══ 저장 ════════════════════════════════════════════════════════════════════
fs.writeFileSync(`${BASE}/game.html`, src);
console.log('\nPhase 32b 완료');
const remaining = (src.match(/OPT\.lang!=='ko'/g)||[]).length;
console.log(`남은 OPT.lang!=='ko': ${remaining}`);
