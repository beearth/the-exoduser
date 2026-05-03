const fs = require('fs');
const path = require('path');
const BASE = 'G:/hell';

// 언어별 번역
const TRANS = {
  it: { ghost: 'Fantasma', bone: "Tomba d\\'Ossa" },
  tr: { ghost: 'Hayalet',   bone: 'Kemik Mezar' },
  vi: { ghost: 'Ma',        bone: 'Mộ Xương' },
  th: { ghost: 'ผี',         bone: 'สุสานกระดูก' },
  id: { ghost: 'Hantu',     bone: 'Makam Tulang' },
  ar: { ghost: 'شبح',       bone: 'قبر العظام' },
  fi: { ghost: 'Haamu',     bone: 'Luuhauta' },
  hu: { ghost: 'Szellem',   bone: 'Csont Sírbolt' },
  ro: { ghost: 'Fantomă',   bone: 'Mormânt de Oase' },
  el: { ghost: 'Φαντ.',     bone: 'Οστέινος Τάφος' },
};

for (const [lang, t] of Object.entries(TRANS)) {
  const file = path.join(BASE, `lang_${lang}.js`);
  let src = fs.readFileSync(file, 'utf8');

  // '해골무덤':'...' 줄 뒤에 삽입
  const boneLine = `'해골무덤':`;
  const boneIdx = src.indexOf(boneLine);
  if (boneIdx === -1) { console.log(`${lang}: '해골무덤' 못 찾음`); continue; }

  // 해당 줄 끝 찾기
  const lineEnd = src.indexOf('\n', boneIdx);
  if (lineEnd === -1) { console.log(`${lang}: 줄 끝 못 찾음`); continue; }

  const insert = `\n'\\u{1F47B} 유령!':'\\u{1F47B} ${t.ghost}!',\n'\\u{1F9B4} 해골무덤!':'\\u{1F9B4} ${t.bone}!',`;
  src = src.slice(0, lineEnd) + insert + src.slice(lineEnd);

  fs.writeFileSync(file, src, 'utf8');
  console.log(`✅ ${lang}: 2개 추가`);
}
