// add_translations_it_id.cjs
// IT(Italiano) / ID(Bahasa Indonesia) 누락 항목 추가
//
// DE/FR에는 있지만 IT/ID에 없는 항목들:
//   1. '✟ 신성한 결계!'           — holy barrier notification
//   2. '기절!  '                   — stun with trailing spaces variant
//   3. '👻 공성유령!'              — siege ghost notification
//   4. '\u{1F47B} 유령총!' (텍스트 이스케이프 형태) — ghost pistol (emoji-escape variant)
//
// 위 항목들이 이미 추가된 경우 스크립트는 건너뜁니다(idempotent).

'use strict';
const fs = require('fs');
const BASE = 'G:/hell';

// ---------------------------------------------------------------------------
// Translation dictionaries (key = Korean, value = translated)
// Note: JS string '\u{1F47B}' expands to the ghost emoji character at runtime,
// but the lang files store the literal text  \u{1F47B}  (backslash-u form).
// We handle this separately via raw string insertion.
// ---------------------------------------------------------------------------

const TRANS_IT = [
  ['✟ 신성한 결계!',  '✟ Barriera Sacra!'],
  ['기절!  ',         'Stordito!  '],
  ['👻 공성유령!',    "👻 Fantasma d'Assedio!"],
];

const TRANS_ID = [
  ['✟ 신성한 결계!',  '✟ Penghalang Suci!'],
  ['기절!  ',         'Terkejut!  '],
  ['👻 공성유령!',    '👻 Hantu Pengepungan!'],
];

// The '\u{1F47B} 유령총!' key is stored literally as \u{1F47B} in the file
// (not as an emoji character), so we must search/insert the raw text form.
const GHOST_PISTOL_RAW_KEY = "\\u{1F47B} \uC720\uB839\uCD1D!"; // 유령총 in unicode escapes for safety
const GHOST_PISTOL_IT_RAW  = "'\\u{1F47B} \uC720\uB839\uCD1D!':'\\u{1F47B} Pistola Fantasma!',";
const GHOST_PISTOL_ID_RAW  = "'\\u{1F47B} \uC720\uB839\uCD1D!':'\\u{1F47B} Pistol Hantu!',";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeForLiteral(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function insertMissingEntries(code, pairs, ghostPistolRaw) {
  const file = `${BASE}/lang_${code}.js`;
  let src = fs.readFileSync(file, 'utf8');
  let inserted = 0;

  // Anchor: insert new entries after the '💥 공성허수아비 폭발!' line
  const anchor = "'💥 공성허수아비 폭발!':";

  for (const [ko, translated] of pairs) {
    if (src.includes(`'${ko}'`)) {
      console.log(`${code}: skip (already present) — ${ko}`);
      continue;
    }

    const anchorIdx = src.indexOf(anchor);
    if (anchorIdx === -1) {
      console.warn(`${code}: anchor not found, skipping — ${ko}`);
      continue;
    }
    const lineEnd = src.indexOf('\n', anchorIdx);
    if (lineEnd === -1) {
      console.warn(`${code}: lineEnd not found, skipping — ${ko}`);
      continue;
    }

    const newEntry = `\n  '${escapeForLiteral(ko)}':'${escapeForLiteral(translated)}',`;
    src = src.slice(0, lineEnd) + newEntry + src.slice(lineEnd);
    inserted++;
    console.log(`${code}: inserted '${ko}' -> '${translated}'`);
  }

  // Handle the raw \u{1F47B} 유령총! key (literal backslash-u form)
  if (!src.includes(GHOST_PISTOL_RAW_KEY)) {
    const anchorIdx = src.indexOf(anchor);
    if (anchorIdx !== -1) {
      const lineEnd = src.indexOf('\n', anchorIdx);
      if (lineEnd !== -1) {
        src = src.slice(0, lineEnd) + '\n  ' + ghostPistolRaw + src.slice(lineEnd);
        inserted++;
        console.log(`${code}: inserted \\u{1F47B} 유령총! (raw form)`);
      }
    }
  } else {
    console.log(`${code}: skip (already present) — \\u{1F47B} 유령총!`);
  }

  fs.writeFileSync(file, src, 'utf8');
  console.log(`${code}: ${inserted}개 항목 추가 완료\n`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
insertMissingEntries('it', TRANS_IT, GHOST_PISTOL_IT_RAW);
insertMissingEntries('id', TRANS_ID, GHOST_PISTOL_ID_RAW);
