// Phase 32d — 남은 _e? 패턴 전부 처리
const fs = require('fs');
const BASE = 'G:/hell';
let src = fs.readFileSync(`${BASE}/game.html`, 'utf8');

// 1. 단순 문자열 쌍 _e?'English':'Korean' → _L('Korean','English')
const before1 = (src.match(/\b_e\?/g)||[]).length;
src = src.replace(/_e\?('(?:[^'\\]|\\.)*'):('(?:[^'\\]|\\.)*')/g, (m, en, ko) => {
  return `_L(${ko},${en})`;
});
const after1 = (src.match(/\b_e\?/g)||[]).length;
console.log(`Simple _e? string pairs: ${before1-after1} replaced, ${after1} remain`);

// 2. 남은 복잡한 _e? → (OPT.lang!=='ko')? (명시적으로 변환, 기능 보존)
// fuse desc 남은 것
src = src.replace(
  `_fuseNameKey?(_e?_FUSE_DESC_EN[_fuseNameKey]:_FUSE_DESC_KO[_fuseNameKey]):(_L(sk.desc,sk.descEn||sk.desc))`,
  `_fuseNameKey?_L(_FUSE_DESC_KO[_fuseNameKey],_FUSE_DESC_EN[_fuseNameKey]):_L(sk.desc,sk.descEn||sk.desc)`
);
console.log('fuse dispDesc fixed');

// reqSkName in skill grid
src = src.replace(
  `const _reqSkName=_e?((SKILL_LIST.find(s=>s.id===sk.requires)||{}).nameEn||(SKILL_LIST.find(s=>s.id===sk.requires)||{}).name||sk.requires):((SKILL_LIST.find(s=>s.id===sk.requires)||{}).name||sk.requires);`,
  `const _reqSkName=_L((SKILL_LIST.find(s=>s.id===sk.requires)||{}).name||sk.requires,(SKILL_LIST.find(s=>s.id===sk.requires)||{}).nameEn||(SKILL_LIST.find(s=>s.id===sk.requires)||{}).name||sk.requires);`
);
console.log('reqSkName fixed');

// invBuildCompare label (CRLF 이슈 이미 없으므로 직접)
src = src.replace(
  `for(const ck of cmpKeys){const k=ck[0],label=_e?(_cmpEN[ck[1]]||ck[1]):ck[1]`,
  `for(const ck of cmpKeys){const k=ck[0],label=_L(ck[1],_cmpEN[ck[1]]||ck[1])`
);
console.log('invBuildCompare label fixed');

// 3. 남은 모든 _e? → (OPT.lang!=='ko')? (기능 동일한 명시 폼)
const remain2 = (src.match(/\b_e\?/g)||[]).length;
src = src.replace(/\b_e\?/g, "(OPT.lang!=='ko')?");
console.log(`Remaining _e? converted to OPT.lang!=='ko'?: ${remain2}`);

// 4. 검증
const finalCount = (src.match(/OPT\.lang!=='ko'/g)||[]).length;
console.log('\n=== 최종 OPT.lang!==ko 수:', finalCount);
src.split('\n').forEach((l,i)=>{
  if(l.includes("OPT.lang!=='ko'"))console.log('  L'+(i+1)+': '+l.trim().slice(0,80));
});

fs.writeFileSync(`${BASE}/game.html`, src);
console.log('\nPhase 32d 완료');
