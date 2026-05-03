const fs = require('fs');
const BASE = 'G:/hell';

// These 5 langs have a non-const _PFX block before const _PFX
// Items ended up inside the non-const block. Need to move them into the main table.
const PROBLEM_LANGS = ['pl','uk','sv','da','nl'];

const NEW_KEYS_PARTIAL = [
  '블룸 효과','잔상 트레일','슬래시 이펙트','후처리 효과','사망 이펙트',
  '동적 조명','횃불 조명 (어둠)','앰비언트 파티클','안개 효과','필름 그레인',
  '캐릭터 외곽선','리롤','물약','으로 탈출!','Shift 작살',
  '더블탭 전격이동','Ctrl 유령걸음','Ctrl 얼음보주',
  '🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭',
];

for (const code of PROBLEM_LANGS) {
  const file = `${BASE}/lang_${code}.js`;
  let src = fs.readFileSync(file, 'utf8');
  const up = code.toUpperCase();

  // 1. Extract lines with our new keys from wherever they are
  const lines = src.split('\n');
  const extractedLines = [];
  const remainingLines = [];

  for (const line of lines) {
    const t = line.trim();
    const isNewKey = NEW_KEYS_PARTIAL.some(k => t.startsWith(`'${k}':`));
    if (isNewKey) {
      extractedLines.push(line.endsWith(',') ? line : line + ',');
    } else {
      remainingLines.push(line);
    }
  }

  if (extractedLines.length === 0) {
    console.log(`${code}: 추출할 항목 없음`);
    continue;
  }

  src = remainingLines.join('\n');

  // 2. Find the main table closing }; using brace depth tracking
  const mainStart = src.indexOf(`const _${up}={`);
  if (mainStart === -1) { console.log(`${code}: main table 못 찾음`); continue; }

  let depth = 0;
  let mainClose = -1;
  for (let i = mainStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) { mainClose = i; break; }
    }
  }

  if (mainClose === -1) { console.log(`${code}: main table 닫힘 못 찾음`); continue; }

  // 3. Insert extracted lines before the closing }
  const insertStr = '\n' + extractedLines.join('\n');
  src = src.slice(0, mainClose) + insertStr + '\n' + src.slice(mainClose);

  fs.writeFileSync(file, src, 'utf8');
  console.log(`✅ ${code}: ${extractedLines.length}개 메인 테이블로 이동`);
}
console.log('완료');
