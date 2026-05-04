// Phase 32c — 남은 11개 CRLF 패턴 처리
const fs = require('fs');
const BASE = 'G:/hell';
const src0 = fs.readFileSync(`${BASE}/game.html`, 'utf8');
let src = src0;
const N = '\r\n'; // CRLF

function rep(from, to, tag) {
  if (!src.includes(from)) { console.warn('NOT FOUND:', tag || from.slice(0,60)); return; }
  src = src.replace(from, to);
  console.log('OK:', tag || from.slice(0,50));
}

// ─── 1. 사망 화면 _eL ──────────────────────────────────────────────────────
rep(
  `const _eL=OPT.lang!=='ko';${N}  const _hn=_T(HELL_NAMES[STG[G.stage].hell]);${N}  const infoTxt=_eL?\`💀 \${G.kills} kills | \${_hn} | EXP -\${expLoss} | 🔥 Max Combo \${G.comboMax}\`:\`💀 \${G.kills} 처치 | \${_hn} \${STG[G.stage].kr} | 경험치 -\${expLoss} | 🔥 최대콤보 \${G.comboMax}\`;`,
  `const _hn=_T(HELL_NAMES[STG[G.stage].hell]);${N}  const infoTxt=\`💀 \${G.kills} \`+_L('처치','kills')+\` | \${_hn} | EXP -\${expLoss} | 🔥 \`+_L('최대콤보','Max Combo')+\` \${G.comboMax}\`;`,
  'death _eL'
);

// ─── 2. _skDetailHTML const _e 제거 ────────────────────────────────────────
rep(
  `  const _e=OPT.lang!=='ko';${N}  const lv=Math.max(1,slv);${N}  const learned=slv>=1;`,
  `  const lv=Math.max(1,slv);${N}  const learned=slv>=1;`,
  'skDetailHTML _e remove'
);

// ─── 3. _skSpecificDetails const _e 제거 ────────────────────────────────────
rep(
  `  const _e=OPT.lang!=='ko';${N}  const lv=Math.max(1,slv);${N}  const id=sk.id;`,
  `  const lv=Math.max(1,slv);${N}  const id=sk.id;`,
  'skSpecificDetails _e remove'
);

// ─── 4. SKILL_HIER _e2 ───────────────────────────────────────────────────────
rep(
  `  const _e2=OPT.lang!=='ko';${N}  SKILL_HIER.forEach(h=>{${N}    const _act=_skHierTab===h.id;${N}    const tb=document.createElement('div');${N}    tb.style.cssText='padding:6px 18px;font-size:1rem;font-weight:800;cursor:pointer;border:2px solid '+(_act?h.col:'#332211')+';border-radius:8px;color:'+(_act?h.col:'#776655')+';background:'+(_act?h.col+'18':'rgba(0,0,0,.3)')+';letter-spacing:.1em;transition:all .15s';${N}    tb.textContent=_e2?(h.nameEn||h.name):h.name;`,
  `  SKILL_HIER.forEach(h=>{${N}    const _act=_skHierTab===h.id;${N}    const tb=document.createElement('div');${N}    tb.style.cssText='padding:6px 18px;font-size:1rem;font-weight:800;cursor:pointer;border:2px solid '+(_act?h.col:'#332211')+';border-radius:8px;color:'+(_act?h.col:'#776655')+';background:'+(_act?h.col+'18':'rgba(0,0,0,.3)')+';letter-spacing:.1em;transition:all .15s';${N}    tb.textContent=_L(h.name,h.nameEn||h.name);`,
  'SKILL_HIER _e2 remove'
);

// ─── 5. 스킬 그리드 렌더 _e + fixedKey ──────────────────────────────────────
rep(
  `    const _e=OPT.lang!=='ko';${N}    const _fixedKey=_e?_fixedKeyMapEn[sk.id]:_fixedKeyMap[sk.id];`,
  `    const _fixedKey=_L(_fixedKeyMap[sk.id]||'',_fixedKeyMapEn[sk.id]||'')||undefined;`,
  'skGrid _e remove'
);

// ─── 6. fuse dispDesc ────────────────────────────────────────────────────────
rep(
  `let _dispDesc=_fuseNameKey?(_e?_FUSE_DESC_EN[_fuseNameKey]:_FUSE_DESC_KO[_fuseNameKey]):(_e?(sk.descEn||sk.desc):sk.desc);`,
  `let _dispDesc=_fuseNameKey?_L(_FUSE_DESC_KO[_fuseNameKey],_FUSE_DESC_EN[_fuseNameKey]):_L(sk.desc,sk.descEn||sk.desc);`,
  'fuse dispDesc'
);

// ─── 7. _invRenderDetail _e 제거 ────────────────────────────────────────────
rep(
  `  const _e=OPT.lang!=='ko';${N}  const it=source==='eq'?INV.equipped[idx]`,
  `  const it=source==='eq'?INV.equipped[idx]`,
  'invRenderDetail _e remove'
);

// ─── 8. _invCardFields _e 제거 + 남은 _e? 패턴 ───────────────────────────────
rep(
  `function _invCardFields(it){${N}  const _e=OPT.lang!=='ko';${N}  let stats='';`,
  `function _invCardFields(it){${N}  let stats='';`,
  'invCardFields _e remove'
);
// invCardFields 내 _e? 패턴 (실제로 어떤 것이 있는지 확인 후 처리)
// 런타임에 grep으로 확인
const cfMatches = src.match(/_e\?'[^']*':'[^']*'/g) || [];
console.log('Remaining _e? patterns:', cfMatches.length, cfMatches.slice(0,5));

// ─── 9. _invBuildCompare _e 제거 + label ────────────────────────────────────
rep(
  `function _invBuildCompare(item,curEq){${N}  const _e=OPT.lang!=='ko';`,
  `function _invBuildCompare(item,curEq){`,
  'invBuildCompare _e remove'
);
rep(
  `const label=_e?(_cmpEN[ck[1]]||ck[1]):ck[1]`,
  `const label=_L(ck[1],_cmpEN[ck[1]]||ck[1])`,
  'invBuildCompare label'
);

// ─── 10. C창 local _L/_e 제거 ────────────────────────────────────────────────
// 정확한 패턴 확인
const cpIdx = src.indexOf("  const _e=OPT.lang!=='ko';\r\n  const _L=(ko,en)=>");
console.log('C창 local _L found at:', cpIdx);
if (cpIdx >= 0) {
  // 해당 블록 찾기
  const cpEnd = src.indexOf('\r\n', src.indexOf('\r\n', cpIdx) + 2) + 2; // 2줄 끝
  const cpBlock = src.substring(cpIdx, cpEnd);
  console.log('C창 block:', JSON.stringify(cpBlock.slice(0,120)));
  rep(cpBlock, '  // global _L() used\r\n', 'C창 _L/_e block');
}

// ─── 11. HUD _eqE 제거 ────────────────────────────────────────────────────────
rep(
  `  const _eqE=OPT.lang!=='ko';${N}  $('eq0')`,
  `  $('eq0')`,
  'HUD _eqE remove'
);

// ─── 저장 ────────────────────────────────────────────────────────────────────
fs.writeFileSync(`${BASE}/game.html`, src);
const remaining = (src.match(/OPT\.lang!=='ko'/g)||[]).length;
console.log('\nPhase 32c done. Remaining:', remaining);
if (remaining > 0) {
  const lines = src.split('\n');
  lines.forEach((l,i)=>{if(l.includes("OPT.lang!=='ko'"))console.log('  L'+(i+1)+': '+l.trim().slice(0,80))});
}
