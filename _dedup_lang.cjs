#!/usr/bin/env node
// _dedup_lang.cjs — deduplicate entries in lang_ja/zh/zht.js
// Strategy: for each file, parse the _XX dict, keep only LAST occurrence of each key
// (the newest injected translation wins), then rewrite the file cleanly.
'use strict';
const fs = require('fs');

// These are the correct translations from batch3 (authoritative)
const CORRECT = {
  ja: {
    '얼음굴': '氷の洞窟',
    '얼음보주': '氷晶球',
    '얼음보주 안에선 사용 불가!': '氷晶球中は使用不可！',
    '업화선': '業火扇',
    '연사석궁': '連射石弓',
    '마력석궁': '魔力石弓',
    '악의구': '悪意球',
    '회전참': '回転斬',
    '기폭팔': '起爆腕',
    '만화방창': '万華放創',
    '멸살광선': '滅殺光線',
    '해골무덤': '骸骨の墓',
    '용암소환': '溶岩召喚',
    '처형': '処刑',
    '악마화 부활': '悪魔化復活',
    '뇌전걸음': '雷電歩',
    '마력연사': '魔力連射',
    '마력광선': '魔力光線',
    '폭독칼날': '爆毒刃',
    '악의폭풍': '悪意の嵐',
    '참회': '懺悔',
  },
  zh: {
    '얼음굴': '冰窟',
    '얼음보주': '冰珠',
    '얼음보주 안에선 사용 불가!': '在冰珠中无法使用！',
    '업화선': '业火扇',
    '연사석궁': '连射弩',
    '마력석궁': '魔力弩',
    '악의구': '悪意球',
    '회전참': '回转斩',
    '기폭팔': '起爆臂',
    '만화방창': '万华放创',
    '멸살광선': '灭杀光线',
    '해골무덤': '骸骨墓',
    '용암소환': '熔岩召唤',
    '처형': '处决',
    '악마화 부활': '恶魔化复活',
    '뇌전걸음': '雷电步',
    '마력연사': '魔力连射',
    '마력광선': '魔力光线',
    '폭독칼날': '爆毒刃',
    '악의폭풍': '恶意风暴',
    '참회': '忏悔',
  },
  zht: {
    '얼음굴': '冰窟',
    '얼음보주': '冰珠',
    '얼음보주 안에선 사용 불가!': '在冰珠中無法使用！',
    '업화선': '業火扇',
    '연사석궁': '連射弩',
    '마력석궁': '魔力弩',
    '악의구': '惡意球',
    '회전참': '回轉斬',
    '기폭팔': '起爆臂',
    '만화방창': '萬華放創',
    '멸살광선': '滅殺光線',
    '해골무덤': '骸骨墓',
    '용암소환': '熔岩召喚',
    '처형': '處決',
    '악마화 부활': '惡魔化復活',
    '뇌전걸음': '雷電步',
    '마력연사': '魔力連射',
    '마력광선': '魔力光線',
    '폭독칼날': '爆毒刃',
    '악의폭풍': '惡意風暴',
    '참회': '懺悔',
  },
};

function processFile(filePath, lang) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Find the main dict start (const _XX={) and end (};)
  // We look for the first `};` which closes the main dict
  let dictStart = -1;
  let dictEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    if (dictStart === -1 && /^const _[A-Z]+\s*=\s*\{/.test(lines[i])) {
      dictStart = i;
    }
    if (dictStart !== -1 && dictEnd === -1 && /^\};/.test(lines[i])) {
      dictEnd = i;
      break;
    }
  }

  if (dictStart === -1 || dictEnd === -1) {
    console.error(`Could not find dict bounds in ${filePath}`);
    return;
  }

  console.log(`[${lang.toUpperCase()}] Dict runs lines ${dictStart+1}–${dictEnd+1}`);

  // Extract lines inside the dict
  const beforeDict = lines.slice(0, dictStart + 1); // includes the `const _XX={` line
  const insideDict = lines.slice(dictStart + 1, dictEnd);
  const afterDict  = lines.slice(dictEnd); // includes `};` and everything after

  // Parse all key-value pairs from insideDict
  // Both inline ('k':'v', 'k':'v') and block (  'k': 'v',) formats
  const KV_RE = /'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)',?/g;

  // Map: key -> last seen value (later occurrences win)
  const kvMap = new Map();
  const kvOrder = []; // track first-seen order

  for (const line of insideDict) {
    // Skip comment lines
    if (/^\s*\/\//.test(line)) continue;

    let m;
    KV_RE.lastIndex = 0;
    while ((m = KV_RE.exec(line)) !== null) {
      const k = m[1];
      const v = m[2];
      if (!kvMap.has(k)) kvOrder.push(k);
      kvMap.set(k, v);
    }
  }

  // Apply correct translations for known-bad entries
  const correct = CORRECT[lang] || {};
  for (const [k, v] of Object.entries(correct)) {
    if (kvMap.has(k)) {
      kvMap.set(k, v);
    }
  }

  console.log(`[${lang.toUpperCase()}] Unique keys: ${kvMap.size}`);

  // Rebuild the dict body: group by comment sections
  // We'll keep comment lines from the original insideDict but deduplicate entries
  // Simpler: just emit all unique KV pairs as block entries
  const kvLines = kvOrder.map(k => {
    const v = kvMap.get(k);
    const ek = k.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const ev = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `  '${ek}': '${ev}',`;
  });

  // Reconstruct: preserve comment header from beforeDict, then entries, then afterDict
  // Extract comment lines from insideDict to preserve structure
  const commentLines = insideDict.filter(l => /^\s*\/\//.test(l));

  // We'll put comments at the top of the dict body, then all KV pairs
  // Actually let's keep it simple: just put all comments first, then sorted KV
  const newContent = [
    ...beforeDict,
    ...commentLines,
    ...kvLines,
    ...afterDict,
  ].join('\n');

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`[${lang.toUpperCase()}] Rewrote ${filePath}`);
}

processFile('G:/hell/lang_ja.js',  'ja');
processFile('G:/hell/lang_zh.js',  'zh');
processFile('G:/hell/lang_zht.js', 'zht');

console.log('\nDedup done.');
