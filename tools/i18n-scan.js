// tools/i18n-scan.js — 번역 선행 감사: game.html 한글 문자열 리터럴 추출 + 치환 가능성 리포트
// game.html 읽기 전용. i18n/ 산출물만 생성 (en.json 미생성, 훅 미삽입).
// package.json "type":"module" → ESM.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GAME = path.join(ROOT, 'game.html');
const OUTDIR = path.join(ROOT, 'i18n');

const HANGUL = /[가-힣]/;
function sha1(s) { return crypto.createHash('sha1').update(s, 'utf8').digest('hex'); }
function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
function keyOf(s) { return sha1(norm(s)).slice(0, 10); }

// ─────────────────────────────────────────────────────────────
// 1) 스캔 대상 <script> 범위 (외부/importmap/json 제외)
// ─────────────────────────────────────────────────────────────
function scriptRanges(text) {
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const ranges = []; let m;
  while ((m = re.exec(text))) {
    const attrs = m[1] || '', body = m[2] || '';
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["']?importmap/i.test(attrs)) continue;
    if (/type\s*=\s*["']?application\/json/i.test(attrs)) continue;
    const openLen = m[0].length - body.length - '</script>'.length;
    const start = m.index + openLen;
    ranges.push({ start, end: start + body.length });
  }
  return ranges;
}

// CIN_LINES 배열 범위 (있으면 CIN 분류용). 현재 game.html엔 부재 예상.
function cinRange(text) {
  const m = text.match(/(?:const|let|var)\s+CIN_LINES\s*=\s*\[[\s\S]*?\];/);
  if (!m) return null;
  return { start: m.index, end: m.index + m[0].length };
}

// ─────────────────────────────────────────────────────────────
// 2) 상태머신 토크나이저 — 한글 포함 문자열 리터럴 추출
//    주석/정규식 내부 제외. ' " ` 리터럴만.
// ─────────────────────────────────────────────────────────────
function extractLiterals(text) {
  const ranges = scriptRanges(text);
  let ri = 0;
  const literals = [];

  let line = 1, lineStart = 0;
  let mode = 'normal'; // normal|line|block|sq|dq|tpl|regex
  let litStart = -1, litStartLine = 1, litStartCol = 0, litBuf = '';
  let lastSig = ''; // 정규식 판별용 마지막 유의미 문자
  let regexClass = false; // 정규식 [ ] 내부

  const n = text.length;
  for (let i = 0; i < n; i++) {
    const c = text[i];
    // 라인/오프셋 추적
    if (c === '\n') { line++; lineStart = i + 1; }

    // 현재 스캔 범위 판정
    while (ri < ranges.length && i >= ranges[ri].end) { ri++; mode = 'normal'; }
    const inJs = ri < ranges.length && i >= ranges[ri].start && i < ranges[ri].end;
    if (!inJs) continue;

    const c2 = i + 1 < n ? text[i + 1] : '';

    switch (mode) {
      case 'normal': {
        if (c === '/' && c2 === '/') { mode = 'line'; i++; break; }
        if (c === '/' && c2 === '*') { mode = 'block'; i++; break; }
        if (c === "'") { mode = 'sq'; litStart = i; litStartLine = line; litStartCol = i - lineStart; litBuf = ''; break; }
        if (c === '"') { mode = 'dq'; litStart = i; litStartLine = line; litStartCol = i - lineStart; litBuf = ''; break; }
        if (c === '`') { mode = 'tpl'; litStart = i; litStartLine = line; litStartCol = i - lineStart; litBuf = ''; break; }
        if (c === '/') {
          // 정규식 vs 나눗셈: lastSig가 값-위치가 아니면 정규식
          if (/[A-Za-z0-9_)\]}]/.test(lastSig)) { lastSig = c; break; } // 나눗셈
          mode = 'regex'; regexClass = false; break;
        }
        if (!/\s/.test(c)) lastSig = c;
        break;
      }
      case 'line': { if (c === '\n') mode = 'normal'; break; }
      case 'block': { if (c === '*' && c2 === '/') { mode = 'normal'; i++; } break; }
      case 'sq': case 'dq': {
        const q = mode === 'sq' ? "'" : '"';
        if (c === '\\') { litBuf += c + c2; i++; break; }
        if (c === q) { finishLit(); lastSig = q; break; }
        if (c === '\n') { mode = 'normal'; break; } // 비정상(줄바꿈) — 방어
        litBuf += c;
        break;
      }
      case 'tpl': {
        // 나이브: 이스케이프 처리하며 다음 백틱까지 (중첩 템플릿은 드물어 미대응)
        if (c === '\\') { litBuf += c + c2; i++; break; }
        if (c === '`') { finishLit(); lastSig = '`'; break; }
        litBuf += c;
        break;
      }
      case 'regex': {
        if (c === '\\') { i++; break; }
        if (c === '[') { regexClass = true; break; }
        if (c === ']') { regexClass = false; break; }
        if (c === '/' && !regexClass) { mode = 'normal'; lastSig = '/'; break; }
        if (c === '\n') { mode = 'normal'; break; } // 방어
        break;
      }
    }
  }

  function finishLit() {
    const raw = litBuf;
    mode = 'normal';
    if (HANGUL.test(raw)) {
      literals.push({ raw, line: litStartLine, startCol: litStartCol, startOffset: litStart });
    }
    litBuf = '';
  }

  return literals;
}

// ─────────────────────────────────────────────────────────────
// 3) 분류 + ctx
// ─────────────────────────────────────────────────────────────
function classify(ctx, offset, cin) {
  if (cin && offset >= cin.start && offset < cin.end) return 'CIN';
  if (/fillText|strokeText/.test(ctx)) return 'CANVAS';
  if (/innerHTML|textContent|innerText|setAttribute/.test(ctx)) return 'DOM';
  // DATA: 객체 프로퍼티 값(이름/설명/라벨 등) 또는 배열 요소
  if (/(?:name|desc|nm|label|title|tip|txt|hint|ko|sub|cat|grade|rar|affix|skill|item|msg|line)\s*:\s*$/i.test(ctx)) return 'DATA';
  if (/[:[,(]\s*$/.test(ctx)) return 'DATA'; // 프로퍼티값/배열요소/인자 시작
  return 'OTHER';
}

// ─────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(GAME)) { console.error('game.html 없음'); process.exit(1); }
  const text = fs.readFileSync(GAME, 'utf8');
  const lines = text.split('\n');
  const cin = cinRange(text);

  const rawLits = extractLiterals(text);

  const items = rawLits.map(L => {
    const lineText = lines[L.line - 1] || '';
    const ctx = lineText.slice(Math.max(0, L.startCol - 40), L.startCol);
    const cls = classify(ctx, L.startOffset, cin);
    return { key: keyOf(L.raw), ko: L.raw, line: L.line, ctx, cls };
  });

  // ko.json (key→ko, 중복 제거)
  const dict = {};
  for (const it of items) if (!(it.key in dict)) dict[it.key] = it.ko;
  const uniqueCount = Object.keys(dict).length;

  // 분류별 카운트 (전체 항목 기준)
  const byCls = { CANVAS: 0, DOM: 0, CIN: 0, DATA: 0, OTHER: 0 };
  for (const it of items) byCls[it.cls]++;

  // ── report.md ──
  const otherList = items.filter(it => it.cls === 'OTHER').slice(0, 50);
  const longest = [...new Map(items.map(it => [it.key, it])).values()]
    .sort((a, b) => b.ko.length - a.ko.length).slice(0, 20);

  let rep = '';
  rep += '# i18n 선행 감사 리포트 (game.html)\n\n';
  rep += '> 읽기 전용 스캔. en.json 미생성, 훅 미삽입.\n\n';
  rep += '## 통계\n\n';
  rep += '| 항목 | 값 |\n|---|---|\n';
  rep += '| 총 한글 리터럴 수 | ' + items.length + ' |\n';
  rep += '| 중복 제거 유니크 수 | ' + uniqueCount + ' |\n';
  rep += '\n### 분류별 개수 (전체 항목 기준)\n\n';
  rep += '| 분류 | 개수 | 설명 |\n|---|---|---|\n';
  rep += '| CANVAS | ' + byCls.CANVAS + ' | fillText/strokeText |\n';
  rep += '| DOM | ' + byCls.DOM + ' | innerHTML/textContent/innerText/setAttribute |\n';
  rep += '| CIN | ' + byCls.CIN + ' | CIN_LINES 배열 내부' + (cin ? '' : ' (배열 부재)') + ' |\n';
  rep += '| DATA | ' + byCls.DATA + ' | 아이템/스킬/어픽스명 등 데이터 테이블 |\n';
  rep += '| OTHER | ' + byCls.OTHER + ' | 미분류 |\n';
  rep += '\n## OTHER 목록 (최대 50, 라인 + ctx)\n\n';
  if (!otherList.length) rep += '_없음_\n';
  else {
    rep += '| line | ctx (앞 40자) | ko |\n|---|---|---|\n';
    for (const it of otherList) {
      rep += '| ' + it.line + ' | `' + it.ctx.replace(/\|/g, '\\|').replace(/`/g, "'") + '` | ' +
        it.ko.replace(/\|/g, '\\|').replace(/\n/g, '⏎').slice(0, 60) + ' |\n';
    }
  }
  rep += '\n## 최장 문자열 상위 20 (유니크, 길이 + 원문)\n\n';
  rep += '| 길이 | ko |\n|---|---|\n';
  for (const it of longest) {
    rep += '| ' + it.ko.length + ' | ' + it.ko.replace(/\|/g, '\\|').replace(/\n/g, '⏎').slice(0, 120) + ' |\n';
  }

  // ── hookpoints.md ──
  // 함수 위치 목록 (enclosing 추정용)
  const fnRe = /^\s*(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/;
  const fnRe2 = /\b([A-Za-z0-9_$]+)\s*=\s*function\s*\(/;
  const fns = [];
  for (let i = 0; i < lines.length; i++) {
    let mm = lines[i].match(fnRe) || lines[i].match(fnRe2);
    if (mm) fns.push({ line: i + 1, name: mm[1] });
  }
  function enclosingFn(ln) {
    let best = null;
    for (const f of fns) { if (f.line <= ln) best = f; else break; }
    return best ? best.name : '(top-level)';
  }
  // 라인별 CANVAS/DOM 리터럴 카운트
  const canvasByLine = {}, domByLine = {};
  for (const it of items) {
    if (it.cls === 'CANVAS') canvasByLine[it.line] = (canvasByLine[it.line] || 0) + 1;
    if (it.cls === 'DOM') domByLine[it.line] = (domByLine[it.line] || 0) + 1;
  }
  // fillText/strokeText 호출 지점 전부
  const canvasSites = [];
  for (let i = 0; i < lines.length; i++) {
    if (/fillText\s*\(|strokeText\s*\(/.test(lines[i])) {
      const ln = i + 1;
      canvasSites.push({ line: ln, fn: enclosingFn(ln), lits: canvasByLine[ln] || 0 });
    }
  }
  // DOM 텍스트 세팅 지점 전부
  const domSites = [];
  for (let i = 0; i < lines.length; i++) {
    if (/\.(innerHTML|textContent|innerText)\s*=|\.setAttribute\s*\(/.test(lines[i])) {
      const ln = i + 1;
      domSites.push({ line: ln, fn: enclosingFn(ln), lits: domByLine[ln] || 0 });
    }
  }
  const canvasFns = [...new Set(canvasSites.map(s => s.fn))];

  let hp = '';
  hp += '# i18n 치환 훅 후보 지점 (game.html)\n\n';
  hp += '> 리포트 전용. 실제 훅 삽입 안 함.\n\n';
  hp += '## 요약\n\n';
  hp += '| 항목 | 값 |\n|---|---|\n';
  hp += '| fillText/strokeText 호출 지점 | ' + canvasSites.length + ' |\n';
  hp += '| ↑ 포함 함수(유니크) | ' + canvasFns.length + ' |\n';
  hp += '| CANVAS 리터럴 커버 | ' + canvasSites.reduce((a, s) => a + s.lits, 0) + ' / ' + byCls.CANVAS + ' |\n';
  hp += '| DOM 텍스트 세팅 지점 | ' + domSites.length + ' |\n';
  hp += '| DOM 리터럴 커버 | ' + domSites.reduce((a, s) => a + s.lits, 0) + ' / ' + byCls.DOM + ' |\n';
  hp += '\n## CANVAS 훅 후보 (fillText/strokeText 호출 전부)\n\n';
  hp += '| line | 함수 | #CANVAS리터럴 |\n|---|---|---|\n';
  for (const s of canvasSites) hp += '| ' + s.line + ' | ' + s.fn + ' | ' + s.lits + ' |\n';
  hp += '\n## CANVAS 함수 목록 (유니크)\n\n';
  hp += canvasFns.map(f => '- ' + f).join('\n') + '\n';
  hp += '\n## DOM 훅 후보 (텍스트 세팅 전부)\n\n';
  hp += '| line | 함수 | #DOM리터럴 |\n|---|---|---|\n';
  for (const s of domSites) hp += '| ' + s.line + ' | ' + s.fn + ' | ' + s.lits + ' |\n';

  // ── 쓰기 ──
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, 'ko.json'), JSON.stringify(dict, null, 2) + '\n');
  fs.writeFileSync(path.join(OUTDIR, 'report.md'), rep);
  fs.writeFileSync(path.join(OUTDIR, 'hookpoints.md'), hp);

  console.log('스캔 완료: 총 ' + items.length + ' / 유니크 ' + uniqueCount);
  console.log('분류 CANVAS=' + byCls.CANVAS + ' DOM=' + byCls.DOM + ' CIN=' + byCls.CIN + ' DATA=' + byCls.DATA + ' OTHER=' + byCls.OTHER);
  console.log('산출물: i18n/ko.json, i18n/report.md, i18n/hookpoints.md');
}

main();
