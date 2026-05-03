const fs = require('fs');
const BASE = 'G:/hell';

const NEW_KEYS = [
  '🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭',
  '블룸 효과','잔상 트레일','슬래시 이펙트','후처리 효과','사망 이펙트',
  '동적 조명','횃불 조명 (어둠)','앰비언트 파티클','안개 효과','필름 그레인',
  '캐릭터 외곽선','리롤','물약','기절!','으로 탈출!','Shift 작살',
  '더블탭 전격이동','Ctrl 유령걸음','Ctrl 얼음보주',
  'Ctrl 유령걸음으로 탈출하라.','더블탭 전격이동으로 탈출하라.',
  'Ctrl 얼음보주로 탈출하라.','스킬 없으면 방향키 연타뿐이야.',
];

const LANGS = ['zh','ja','es','zht','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg'];

for (const code of LANGS) {
  const file = `${BASE}/lang_${code}.js`;
  let src = fs.readFileSync(file, 'utf8');
  const up = code==='ptbr'?'PTBR':code==='zht'?'ZHT':code.toUpperCase();

  // Find lines that are outside the main table (between "};\n" and "const _UP_PFX={")
  // Strategy: extract the misplaced lines, remove them, insert before closing };
  const pfxMarker = `const _${up}_PFX={`;
  const pfxIdx = src.indexOf(pfxMarker);
  if (pfxIdx === -1) { console.log(`${code}: PFX 못 찾음`); continue; }

  // Find the last "};" before pfxMarker (this closes the main table)
  let closeIdx = src.lastIndexOf('\n};', pfxIdx);
  if (closeIdx === -1) { console.log(`${code}: }; 못 찾음`); continue; }

  // Extract the section between "};" and pfxMarker
  const outside = src.slice(closeIdx + 3, pfxIdx); // between };\n and pfxMarker

  // Find key-value lines in outside section
  const movedLines = [];
  const lineRe = /^'[^']+':'[^']*',?\s*$/gm;
  const emojLineRe = /^'[^']*':'[^']*',?\s*$/gm;

  // Just collect all non-empty, non-const lines in the outside section
  const outsideLines = outside.split('\n').filter(l => {
    const t = l.trim();
    return t && !t.startsWith('const ') && !t.startsWith('//') && (t.startsWith("'") || t.startsWith('"'));
  });

  if (outsideLines.length === 0) { console.log(`✅ ${code}: 이미 올바른 위치`); continue; }

  // Remove these lines from the outside section
  let newSrc = src;
  for (const line of outsideLines) {
    // Remove line from outside section
    newSrc = newSrc.replace('\n'+line, '');
    newSrc = newSrc.replace(line+'\n', '');
  }

  // Now find the closing }; again (position may have shifted)
  const pfxIdx2 = newSrc.indexOf(pfxMarker);
  let closeIdx2 = newSrc.lastIndexOf('\n};', pfxIdx2);
  if (closeIdx2 === -1) { console.log(`${code}: 재조정 후 }; 못 찾음`); continue; }

  // Insert the moved lines before "};"
  const insertStr = '\n' + outsideLines.map(l => l.endsWith(',') ? l : l+',').join('\n');
  newSrc = newSrc.slice(0, closeIdx2) + insertStr + newSrc.slice(closeIdx2);

  fs.writeFileSync(file, newSrc, 'utf8');
  console.log(`✅ ${code}: ${outsideLines.length}개 이동`);
}
console.log('완료');
