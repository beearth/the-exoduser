'use strict';
const fs = require('fs');

// Truly missing keys (verified via byte-level search):
// RU: '✟ 신성한 결계!', '👻 유령총!', '기절!  ', '🦴 해골무덤!'
// SV: '🦴 해골무덤!'
// UK: '🦴 해골무덤!'
// All exist in sub-objects (_XX_BASE) but are absent from the MAIN _XX object.

const fixes = {
  ru: {
    file: 'G:/hell/lang_ru.js',
    // Insertions before the first '};' (main _RU object closing)
    entries: [
      // ✟ 신성한 결계! = Holy Barrier (shout)
      `'✟ 신성한 결계!':'✟ Священный барьер!'`,
      // 👻 유령총! = Ghost Gun (shout)
      `'👻 유령총!':'👻 Призрачное ружьё!'`,
      // 기절!   (2 trailing spaces) = Stun! (shout with trailing spaces)
      `'기절!  ':'Оглушён!  '`,
      // 🦴 해골무덤! = Skeleton Tomb (shout with 🦴 emoji)
      `'🦴 해골무덤!':'🦴 Костяная гробница!'`,
    ],
  },
  sv: {
    file: 'G:/hell/lang_sv.js',
    entries: [
      // 🦴 해골무덤! = Skeleton Tomb (shout with 🦴 emoji)
      `'🦴 해골무덤!':'🦴 Bengrav!'`,
    ],
  },
  uk: {
    file: 'G:/hell/lang_uk.js',
    entries: [
      // 🦴 해골무덤! = Skeleton Tomb (shout with 🦴 emoji)
      `'🦴 해골무덤!':'🦴 Кісткова гробниця!'`,
    ],
  },
};

let allOk = true;

for (const [lang, { file, entries }] of Object.entries(fixes)) {
  console.log(`\n=== ${lang.toUpperCase()} ===`);
  let txt = fs.readFileSync(file, 'utf8');

  // Find the FIRST '};' which closes the main object
  const closingIdx = txt.indexOf('};');
  if (closingIdx === -1) {
    console.error(`ERROR: No '}; found in ${file}`);
    allOk = false;
    continue;
  }
  console.log(`  Main object closes at byte ${closingIdx}`);

  // Verify keys are truly missing before inserting
  const toInsert = [];
  for (const entry of entries) {
    // Extract the key (between first two single-quotes)
    const keyMatch = entry.match(/^'([^']+)'/);
    if (!keyMatch) { console.error('  Bad entry format:', entry); allOk = false; continue; }
    const key = keyMatch[1];
    const keyBuf = Buffer.from(`'${key}'`, 'utf8').toString('hex');
    const fileBuf = Buffer.from(txt, 'utf8').toString('hex');
    if (fileBuf.includes(keyBuf)) {
      console.log(`  SKIP (already present): ${JSON.stringify(key)}`);
    } else {
      console.log(`  WILL INSERT: ${JSON.stringify(key)}`);
      toInsert.push(entry);
    }
  }

  if (toInsert.length === 0) {
    console.log('  Nothing to insert.');
    continue;
  }

  // Insert before the closing '};'
  // Find the last non-whitespace character before '};' to determine line ending style
  const before = txt.substring(0, closingIdx);
  const after = txt.substring(closingIdx);

  // Build insertion block: one entry per line, indented like existing entries
  const insertBlock = toInsert.map(e => `'${e.replace(/^'/, '').replace(/'$/, '')}`).join(',\n') + ',\n';
  // Actually just insert the entries as-is joined by comma+newline
  const insertStr = toInsert.join(',\n') + ',\n';

  const newTxt = before + insertStr + after;

  // Backup
  const backupPath = file + '.bak5';
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, txt, 'utf8');
    console.log(`  Backup: ${backupPath}`);
  }

  fs.writeFileSync(file, newTxt, 'utf8');
  console.log(`  Written: ${file}`);

  // Verify
  const verifyTxt = fs.readFileSync(file, 'utf8');
  for (const entry of toInsert) {
    const keyMatch = entry.match(/^'([^']+)'/);
    const key = keyMatch[1];
    const keyBuf = Buffer.from(`'${key}'`, 'utf8').toString('hex');
    const fileBuf = Buffer.from(verifyTxt, 'utf8').toString('hex');
    if (fileBuf.includes(keyBuf)) {
      console.log(`  VERIFIED: '${key}' found`);
    } else {
      console.error(`  VERIFY FAIL: '${key}' NOT found after write!`);
      allOk = false;
    }
  }

  // Quick syntax check: count { and } (rough balance for top-level)
  const openBraces = (verifyTxt.match(/\{/g) || []).length;
  const closeBraces = (verifyTxt.match(/\}/g) || []).length;
  console.log(`  Brace balance: { ${openBraces}  } ${closeBraces} (should match)`);
}

console.log('\n=== DONE ===', allOk ? 'ALL OK' : 'SOME ERRORS');
process.exit(allOk ? 0 : 1);
