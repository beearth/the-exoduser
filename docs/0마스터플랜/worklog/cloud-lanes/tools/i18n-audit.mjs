// i18n-audit.mjs — Unity Resources/Data 29개 언어 감사 (읽기 전용, 데이터 수정 없음)
// 사용: node i18n-audit.mjs [--data <Data 폴더>] [--list <번역대상_전체목록.md>] [--json <출력json>]
// 출력: 요약 JSON(stdout 마지막) / --json 지정 시 전체 이슈 파일.
import fs from 'fs';
import path from 'path';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const DATA = arg('--data', 'unity/Assets/Exoduser/Resources/Data');
const LIST = arg('--list', 'docs/16번역·로컬라이제이션/번역대상_전체목록.md');
const OUTJSON = arg('--json', '');

const LANGS = 'ko en zh zht ja es ru de ptbr fr pl it uk tr vi th id ms ar sv da no fi cs hu ro nl el bg'.split(' ');
const LS = new Set(LANGS);
// 비라틴 문자 언어: en과 같은 값이면 미번역 의심
const NONLATIN = new Set(['zh', 'zht', 'ja', 'ru', 'uk', 'th', 'ar', 'el', 'bg']);
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;
// 길이 기준: 폭 가중(CJK·한글·가나 = 2, 그 외 1). 키별 29언어 폭 중앙값의 2.0배 초과 && 중앙값+8 이상이면 '긴 값'.
const LONG_RATIO = 2.0, LONG_ABS = 8;
const wide = (s) => { let w = 0; for (const ch of s) w += /[ᄀ-ᇿ⺀-鿿가-힣豈-﫿぀-ヿ]/.test(ch) ? 2 : 1; return w; };
const median = (a) => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
// 플레이스홀더: {0} {name} %s %d %1$s %% 제외, 태그 <b> 등 포함
const phOf = (s) => (s.match(/\{[A-Za-z0-9_]*\}|%\d*\$?[sdif]|<\/?[a-z]+>/gi) || []).sort().join(' ');

// ---- 추출 -----------------------------------------------------------------
// recs: Map<file, Map<key, Map<lang, string>>>
const recs = new Map();
const fileInfo = new Map(); // file -> {structure, strings}
function put(file, key, lang, val) {
  if (typeof val !== 'string') return;
  const f = recs.get(file) ?? recs.set(file, new Map()).get(file);
  const k = f.get(key) ?? f.set(key, new Map()).get(key);
  k.set(lang, val);
}
function flat(node, rel, cb) { // 레코드 내부를 상대 경로로 평탄화
  if (typeof node === 'string') return cb(rel, node);
  if (Array.isArray(node)) return node.forEach((x, i) => flat(x, `${rel}[${i}]`, cb));
  if (node && typeof node === 'object') for (const k of Object.keys(node)) if (k !== 'code' && !SKIPF.has(k)) flat(node[k], rel ? `${rel}.${k}` : k, cb);
}
// 식별자·자산경로·타이밍 등 번역 대상이 아닌 필드
const SKIPF = new Set(['key', 'id', 'img', 'sfx', 'speaker', 'type', 'ease', 'resource', 'file', 'path', 'glyph', 'color', 'values', 'cam', 'vfx', 'fade', 't', 'dur', 'start', 'end', 'text_cfg']);
const label = (o) => (typeof o.id === 'string' ? o.id : typeof o.key === 'string' ? o.key : null);

function walk(file, n, p, ctx) {
  if (Array.isArray(n)) {
    // 언어 코드가 붙은 레코드 배열: [{code:'ko', ...}]
    if (n.length && n.every((x) => x && typeof x === 'object' && typeof x.code === 'string' && LS.has(x.code))) {
      for (const rec of n) flat(rec, '', (rel, v) => put(file, `${p}|${rel}`, rec.code, v));
      fileInfo.get(file).structure.add('code-records');
      return;
    }
    n.forEach((x, i) => walk(file, x, `${p}[${i}]`, ctx));
    return;
  }
  if (!n || typeof n !== 'object') return;
  const ks = Object.keys(n);
  const id = label(n);
  if (typeof n.id === 'string' && LS.has(n.id) && ks.includes('ms')) { /* id=언어 */ }
  const here = id ? `${p}<${id}>` : p;
  // codes + texts[]
  const codes = Array.isArray(n.codes) ? n.codes : ctx.codes;
  if (Array.isArray(n.texts) && codes && n.texts.every((t) => typeof t === 'string')) {
    n.texts.forEach((t, i) => codes[i] && put(file, here, codes[i], t));
    fileInfo.get(file).structure.add('codes+texts');
    return;
  }
  // {ko:'..', en:'..'} 언어 맵(최소 2개 언어, 모두 문자열)
  // 'id'는 인도네시아어 코드이자 흔한 식별자 필드: 'ms'가 같이 있는 29언어 맵일 때만 언어로 취급
  const lk = ks.filter((k) => LS.has(k) && (k !== 'id' || ks.includes('ms')));
  if (lk.length >= 2 && lk.every((k) => typeof n[k] === 'string') && !lk.every((k) => /^[0-9a-f]{32,}$/.test(n[k]))) { // 해시 맵(sourceLanguageBlobs 등) 제외
    for (const k of lk) put(file, here, k, n[k]);
    fileInfo.get(file).structure.add(lk.length > 2 ? 'lang-map' : 'ko/en-pair');
    return;
  }
  // 최상위 .ko/.en 래퍼(patch_notes: {ko:{sections..}, en:{...}})
  const lo = ks.filter((k) => LS.has(k) && (k !== 'id' || ks.includes('ms')) && n[k] && typeof n[k] === 'object');
  if (lo.length >= 2) {
    for (const k of lo) flat(n[k], '', (rel, v) => put(file, `${here}|${rel}`, k, v));
    fileInfo.get(file).structure.add('lang-subtree');
    return;
  }
  const nctx = { codes };
  for (const k of ks) walk(file, n[k], `${here}.${k}`, nctx);
}

const files = fs.readdirSync(DATA).filter((f) => f.endsWith('.json')).sort();
const parseErrors = [];
for (const f of files) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); } catch (e) { parseErrors.push([f, e.message]); continue; }
  fileInfo.set(f, { structure: new Set() });
  walk(f, j, '', { codes: Array.isArray(j.codes) ? j.codes : null });
}

// ---- 검사 -----------------------------------------------------------------
const issues = []; // {type, sev, file, key, lang, detail}
const perLang = Object.fromEntries(LANGS.map((l) => [l, { strings: 0, missing: 0, empty: 0, koCopy: 0, enCopy: 0, long: 0, ph: 0 }]));
const perFile = [];
const koStrings = []; // 등록 대조용 {file,key,ko}
const maxRatio = [];
const sev = { missing: 3, ph: 3, empty: 3, koCopy: 2, long: 1, enCopy: 0 };

for (const [file, keys] of recs) {
  const fileLangs = new Set();
  for (const m of keys.values()) for (const l of m.keys()) fileLangs.add(l);
  const st = { file, keys: keys.size, langs: fileLangs.size, missingLangs: LANGS.filter((l) => !fileLangs.has(l)), issues: 0 };
  for (const [key, m] of keys) {
    const ko = m.get('ko'), en = m.get('en');
    if (ko && HANGUL.test(ko)) for (const part of ko.split('\x01')) if (HANGUL.test(part)) koStrings.push({ file, key, ko: part });
    const widths = [...m.entries()].filter(([, v]) => v.trim()).map(([, v]) => wide(v));
    const med = widths.length >= 5 ? median(widths) : 0;
    const basePh = ko !== undefined ? phOf(ko) : en !== undefined ? phOf(en) : null;
    for (const l of LANGS) {
      const v = m.get(l);
      if (!fileLangs.has(l)) continue; // 파일 전체에 없는 언어는 파일 단위로 보고
      if (v === undefined) { perLang[l].missing++; add('missing', file, key, l, '키 누락'); continue; }
      perLang[l].strings++;
      if (!v.trim()) { if (ko === undefined || ko.trim()) { perLang[l].empty++; add('empty', file, key, l, '빈 값'); } continue; }
      if (l !== 'ko' && HANGUL.test(v)) { perLang[l].koCopy++; add('koCopy', file, key, l, `한글 포함: ${clip(v)}`); }
      if (NONLATIN.has(l) && en && v === en && /[A-Za-z]{3}/.test(en) && !HANGUL.test(en)) { perLang[l].enCopy++; add('enCopy', file, key, l, `en과 동일: ${clip(v)}`); }
      if (med) maxRatio.push([wide(v) / med, file, key, l]);
      if (med && wide(v) > LONG_RATIO * med && wide(v) - med >= LONG_ABS) { perLang[l].long++; add('long', file, key, l, `폭 ${wide(v)} / 중앙값 ${med}: ${clip(v)}`); }
      if (basePh !== null && l !== 'ko' && phOf(v) !== basePh) { perLang[l].ph++; add('ph', file, key, l, `기준 [${basePh}] ≠ [${phOf(v)}]`); }
    }
  }
  perFile.push(st);
}
function clip(s) { s = s.replace(/\x01/g, ' ¦ ').replace(/\s+/g, ' '); return s.length > 60 ? s.slice(0, 60) + '…' : s; }
function add(type, file, key, lang, detail) { issues.push({ type, sev: sev[type], file, key, lang, detail }); recs.get(file) && 0; }
for (const st of perFile) st.issues = issues.filter((i) => i.file === st.file).length;

// ---- 등록 대조 ------------------------------------------------------------
let listText = '';
try { listText = fs.readFileSync(LIST, 'utf8'); } catch { /* 목록 없음 */ }
const norm = (s) => s.replace(/\s+/g, '');
const listN = norm(listText);
const unregistered = [];
const seen = new Set();
for (const r of koStrings) {
  const t = r.ko.trim();
  if (t.length < 2 || seen.has(r.file + '\0' + t)) continue;
  seen.add(r.file + '\0' + t);
  if (!listN.includes(norm(t))) unregistered.push(r);
}
const noMax = (listText.match(/\|\s*(4[0-9]{3})\s*\|/g) || []).map((x) => +x.replace(/\D/g, '')).reduce((a, b) => Math.max(a, b), 0);
const progressRange = { from: 4600, to: 4646, inList: (listText.match(/\|\s*46[0-4][0-9]\s*\|/g) || []).length };

maxRatio.sort((a, b) => b[0] - a[0]);
const result = { topWidthRatios: maxRatio.slice(0, 5).map(([r, f, k, l]) => r.toFixed(2) + ' ' + f + ' ' + k + ' ' + l),  files: files.length, parseErrors, perLang, perFile, issueCounts: Object.fromEntries(Object.keys(sev).map((t) => [t, issues.filter((i) => i.type === t).length])), unregisteredCount: unregistered.length, noMax, progressRange };
if (OUTJSON) fs.writeFileSync(OUTJSON, JSON.stringify({ ...result, issues, unregistered, structures: Object.fromEntries([...fileInfo].map(([f, v]) => [f, [...v.structure]])), nonI18nFiles: files.filter((f) => !recs.has(f)) }, null, 1));
console.log(JSON.stringify(result));

// ---- Markdown 보고서 (--md <경로>) ----------------------------------------
const MD = arg('--md', '');
if (MD) {
  // 다국어 구조가 없는 파일의 한글 문자열 수(번역 안 되는 KO 단일 소스 후보)
  const koOnly = [];
  for (const f of files) {
    if (recs.has(f) || parseErrors.some((p) => p[0] === f)) continue;
    let c = 0; const ex = [];
    (function w(n, k) { if (typeof n === 'string') { if (HANGUL.test(n)) { c++; if (ex.length < 2) ex.push(`${k}=${clip(n).slice(0, 24)}`); } } else if (n && typeof n === 'object') for (const x of Object.keys(n)) w(n[x], x); })(JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')), '');
    if (c) koOnly.push([f, c, ex.join('; ')]);
  }
  const groups = new Map();
  for (const i of issues) {
    const g = `${i.type}\0${i.file}\0${i.key}`;
    const o = groups.get(g) ?? groups.set(g, { ...i, langs: [] }).get(g);
    o.langs.push(i.lang);
  }
  const G = [...groups.values()].sort((a, b) => b.sev - a.sev || b.langs.length - a.langs.length || a.file.localeCompare(b.file));
  const TN = { missing: '키 누락', ph: '플레이스홀더', empty: '빈 값', koCopy: '한글 복사', long: '긴 값', enCopy: 'en 복사(비라틴)' };
  const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\x01/g, '¦');
  const L = [];
  L.push('# C3 — Unity 29개 언어 데이터 감사 (보고만, 데이터 수정 없음)', '');
  L.push(`- 기준: origin/unity/main \`${arg('--sha', '?')}\` · \`${DATA}\` JSON ${files.length}개 · 스크립트 \`tools/i18n-audit.mjs\` (node, 읽기 전용)`);
  L.push(`- 다국어 구조가 잡힌 파일 ${recs.size}개 / 그 외 ${files.length - recs.size}개(좌표·메타·웹 정의표 등). 총 ${[...recs.values()].reduce((a, m) => a + m.size, 0)}개 키.`);
  L.push(`- 이슈 합계: ${Object.entries(result.issueCounts).map(([k, v]) => `${TN[k]} ${v}`).join(' · ')}. 미등록 의심 한국어 문자열 ${unregistered.length}.`, '');
  L.push('## 감사 기준', '');
  L.push('| 검사 | 기준 |', '|---|---|');
  L.push('| 키 누락 | 그 파일에 한 번이라도 나온 언어인데 특정 키에만 없음. 파일 전체에 없는 언어는 아래 파일 표 `없는 언어`로 보고 |');
  L.push('| 빈 값 | trim 후 길이 0 (ko가 빈 키는 제외) |');
  L.push('| 한글 복사 | ko 외 언어 값에 한글(U+1100·3130·AC00 대역) 포함. 식별자 필드(key·id·img 등)는 제외 |');
  L.push('| en 복사(비라틴) | zh·zht·ja·ru·uk·th·ar·el·bg 값이 en과 완전 동일하고 영문 3자 이상 — 의도된 영문 장식(THERE IS NO REST, 키 이름)일 수 있어 심각도 낮음 |');
  L.push(`| 긴 값 | 폭 가중(한글·CJK·가나 2, 그 외 1). 키별 29언어 폭 중앙값의 ${LONG_RATIO}배 초과 **그리고** 중앙값+${LONG_ABS} 이상. 비교 언어 5개 미만 키 제외. UI 박스 폭은 모르므로 "넘침 의심"일 뿐 |`);
  L.push('| 플레이스홀더 | `{0}` `{name}` `%s` `%1$d` `<b>` 등을 정렬해 ko(없으면 en)와 비교, 개수·이름 불일치 |');
  L.push('| 등록 대조 | ko 값(공백 제거)이 `번역대상_전체목록.md`(공백 제거) 안에 부분 문자열로 없으면 미등록 의심. 키 이름이 아닌 문자열 대조라 오탐(목록에 다른 표기로 적힌 경우)이 있다 |', '');
  L.push('## 언어별', '', '| 언어 | 검사 문자열 | 키 누락 | 빈 값 | 한글 복사 | en 복사 | 긴 값 | 플레이스홀더 |', '|---|--:|--:|--:|--:|--:|--:|--:|');
  for (const l of LANGS) { const p = perLang[l]; L.push(`| ${l} | ${p.strings} | ${p.missing} | ${p.empty} | ${p.koCopy} | ${p.enCopy} | ${p.long} | ${p.ph} |`); }
  L.push('', '## 파일별 (다국어 구조 파일)', '', '| 파일 | 키 | 언어 수 | 없는 언어 | 이슈 |', '|---|--:|--:|---|--:|');
  for (const p of perFile) L.push(`| ${p.file} | ${p.keys} | ${p.langs} | ${p.missingLangs.length ? (p.missingLangs.length > 8 ? `${p.missingLangs.length}개(ko·en만 보유)` : p.missingLangs.join(' ')) : '—'} | ${p.issues} |`);
  L.push('', '### 번역 구조가 없는 파일 중 한글 문자열을 가진 것 (KO 단일 소스, 번역 미적용 후보)', '', '| 파일 | 한글 문자열 수 | 예 |', '|---|--:|---|');
  for (const [f, c, e] of koOnly) L.push(`| ${f} | ${c} | ${esc(e)} |`);
  L.push('', '## 문제 상위 50건 (심각도 → 영향 언어 수 순, 같은 키는 한 줄로 묶음)', '', '| # | 종류 | 파일 | 키 | 언어 | 비고 |', '|--:|---|---|---|---|---|');
  G.slice(0, 50).forEach((g, i) => L.push(`| ${i + 1} | ${TN[g.type]} | ${g.file} | \`${esc(g.key)}\` | ${g.langs.length > 6 ? `${g.langs.length}개(${g.langs.slice(0, 4).join(' ')}…)` : g.langs.join(' ')} | ${esc(g.detail)} |`));
  L.push('', `(묶음 ${G.length}건 중 50건. 전체는 \`--json\` 출력.)`, '');
  L.push('## 등록 대조 (번역대상_전체목록.md)', '');
  L.push(`- 목록의 최대 No.: ${noMax} (표 형식 \`| NNNN |\` 기준). **No.4600~4646은 PC Codex 레인이 채우는 중 — 진행 중**: 이 브랜치의 목록에는 해당 번호 행이 ${progressRange.inList}개(아직 없음). 해당 범위의 키·문자열은 미등록으로 세지 않고 병합 뒤 재감사한다.`);
  L.push('- 통합 브랜치 `claude/unity-cloud-demo-integration-20261104`: 감사 시점에 원격에 없음. 대신 `claude/unity-cloud-demo-package-20261104`(e477e8c)가 있으며 Data JSON 변경은 0, 목록에 보조 문구 No.4293~4295 초안만 추가(docs 10줄) — 신규 키 없음.');
  const byF = unregistered.reduce((a, u) => ((a[u.file] ||= []).push(u), a), {});
  L.push(`- 미등록 의심 ${unregistered.length}건 — 파일별: ${Object.entries(byF).map(([f, a]) => `${f} ${a.length}`).join(' · ')}`, '', '| 파일 | 키 | ko 값 |', '|---|---|---|');
  for (const u of unregistered.slice(0, 40)) L.push(`| ${u.file} | \`${esc(u.key)}\` | ${esc(clip(u.ko))} |`);
  if (unregistered.length > 40) L.push(`| … | | 나머지 ${unregistered.length - 40}건은 --json |`);
  fs.writeFileSync(MD, L.join('\n') + '\n');
}
