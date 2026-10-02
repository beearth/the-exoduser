// ART-cutscene-asset-reference-closure-hb1014
// 목적: 양판(game.html/game-easy-test.html)의 _getCutsceneImg 로더와
//       INTRO_CUTSCENE_LINES/PROLOGUE_LINES가 실제로 쓰는 이미지 참조를 추출하여,
//       current loader의 filename→assets/cutscene 경로 매핑을 그대로 적용하고
//       실파일 존재/header 치수/LFS pointer/0바이트/suffix 불일치를 검사한다.
// 성격: 읽기 전용. 이미지 생성/교체/원화변경 0, Git 0, production 0.
//       파일 존재는 LOCK 미술 품질 PASS가 아니다(asset→loader closure만).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const readB = p => fs.readFileSync(path.join(ROOT, p));
const exists = p => fs.existsSync(path.join(ROOT, p));

// ── 소스에서 const NAME={...} 블록을 brace-match로 추출 ──
function extractBlock(src, name) {
  const start = src.indexOf('const ' + name + '={');
  assert.ok(start >= 0, `block not found: ${name}`);
  let i = src.indexOf('{', start), depth = 0, inStr = false, q = '', esc = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === q) inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = true; q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(start, i);
}

// 블록 내 img:'...' 참조 추출(순서 보존 + dedupe)
function imgRefs(block) {
  const re = /img:'([^']+)'/g; const seen = new Set(); const out = [];
  let m; while ((m = re.exec(block))) { if (!seen.has(m[1])) { seen.add(m[1]); out.push(m[1]); } }
  return out;
}

// ── current loader 매핑 원문 추출 + 독립 구현 ──
// 원문: img.src=filename.indexOf('/')>=0?'assets/cutscene/'+filename+'?v=A':'assets/cutscene/images/'+filename+'?v=B';
function extractLoader(src) {
  const line = src.split('\n').find(l => l.includes('img.src=filename.indexOf('));
  assert.ok(line, 'loader mapping line not found');
  const mm = line.match(/\?'assets\/cutscene\/'\+filename\+'\?v=([^']+)':'assets\/cutscene\/images\/'\+filename\+'\?v=([^']+)'/);
  assert.ok(mm, 'loader mapping pattern changed: ' + line.trim());
  return { raw: line.trim(), verSlash: mm[1], verNoSlash: mm[2] };
}
// 독립 매핑식(원문 변수 재사용 없음). 실제 FS 경로(쿼리 제거)와 src(쿼리 포함) 반환.
function mapLoader(filename, loader) {
  if (filename.indexOf('/') >= 0) {
    return { fsPath: 'assets/cutscene/' + filename, src: 'assets/cutscene/' + filename + '?v=' + loader.verSlash };
  }
  return { fsPath: 'assets/cutscene/images/' + filename, src: 'assets/cutscene/images/' + filename + '?v=' + loader.verNoSlash };
}

// ── header 치수 파서 (디코드 없이 마커만) ──
function pngSize(buf) {
  if (!(buf[0] === 0x89 && buf[1] === 0x50)) return null; // \x89PNG
  // IHDR: width/height at offset 16/20 (big-endian)
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), fmt: 'png' };
}
function jpegSize(buf) {
  if (!(buf[0] === 0xff && buf[1] === 0xd8)) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), fmt: 'jpeg' };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
function isLfsPointer(buf) {
  const head = buf.slice(0, 120).toString('utf8');
  return head.startsWith('version https://git-lfs');
}

// ── 한 참조에 대한 실파일 결손 검사 ──
function inspect(fsPath) {
  const r = { fsPath, exists: false, bytes: 0, lfsPointer: false, dims: null, ext: path.extname(fsPath).toLowerCase(), extMatchesFormat: null, defects: [] };
  if (!exists(fsPath)) { r.defects.push('MISSING'); return r; }
  r.exists = true;
  const buf = readB(fsPath);
  r.bytes = buf.length; r.sha256 = sha(buf);
  if (buf.length === 0) { r.defects.push('ZERO_BYTES'); return r; }
  if (isLfsPointer(buf)) { r.lfsPointer = true; r.defects.push('LFS_POINTER'); return r; }
  const dims = pngSize(buf) || jpegSize(buf);
  r.dims = dims;
  if (!dims) { r.defects.push('UNREADABLE_HEADER'); return r; }
  // suffix(확장자)↔실제 포맷 일치
  const extFmt = (r.ext === '.png') ? 'png' : (r.ext === '.jpg' || r.ext === '.jpeg') ? 'jpeg' : r.ext;
  r.extMatchesFormat = (extFmt === dims.fmt);
  if (!r.extMatchesFormat) r.defects.push('SUFFIX_FORMAT_MISMATCH(' + r.ext + '→' + dims.fmt + ')');
  return r;
}

// ── 메인 ──
const FILES = ['game.html', 'game-easy-test.html'];
const report = { task: 'ART-cutscene-asset-reference-closure-hb1014', executedAtUTC: new Date().toISOString(), node: process.version, verificationKind: 'ASSET→LOADER CLOSURE (read-only). 파일존재는 LOCK 미술 PASS 아님', perFile: [], controls: {}, aggregate: {} };
const checks = []; function ck(id, fn) { try { fn(); checks.push({ id, status: 'PASS' }); } catch (e) { checks.push({ id, status: 'FAIL', error: e.message }); } }

let loaderRef = null;
const allDefective = [];
for (const file of FILES) {
  const buf = readB(file); const src = buf.toString('utf8');
  const loader = extractLoader(src);
  if (!loaderRef) loaderRef = loader;
  const pro = imgRefs(extractBlock(src, 'PROLOGUE_LINES'));
  const intro = imgRefs(extractBlock(src, 'INTRO_CUTSCENE_LINES'));
  const refs = Array.from(new Set([...pro, ...intro]));
  const rows = refs.map(fn => {
    const { fsPath, src: srcUrl } = mapLoader(fn, loader);
    const insp = inspect(fsPath);
    if (insp.defects.length) allDefective.push({ file, filename: fn, ...insp });
    return { filename: fn, srcUrl, ...insp };
  });
  report.perFile.push({
    file, wholeSha256: sha(buf), loader: loader.raw,
    loaderVersions: { slash: loader.verSlash, noSlash: loader.verNoSlash },
    proCount: pro.length, introCount: intro.length, uniqueRefs: refs.length,
    rows,
    defectCount: rows.filter(r => r.defects.length).length,
  });
  // 양판 로더/버전 동일성
  ck(`loader-parity:${file}`, () => {
    assert.equal(loader.verSlash, loaderRef.verSlash);
    assert.equal(loader.verNoSlash, loaderRef.verNoSlash);
  });
}

// 양판 참조 집합 동일성
ck('refset-parity', () => {
  const a = report.perFile[0].rows.map(r => r.filename).sort().join(',');
  const b = report.perFile[1].rows.map(r => r.filename).sort().join(',');
  assert.equal(a, b);
});

// ── memory candidate + control (가짜 counter 금지: 통제군으로 검출력 증명) ──
// 통제1(정상참조): 실제 approved 에셋은 defect 0이어야 PASS.
// 통제2(누락참조): 존재하지 않는 filename은 반드시 MISSING으로 검출되어야 함.
const NORMAL_CTRL = 'warintro/emg1.jpg';          // 승인·연결된 원본
const MISSING_CTRL = 'warintro/__hb1014_absent__.jpg'; // 고의 누락 변이
const normalRes = inspect(mapLoader(NORMAL_CTRL, loaderRef).fsPath);
const missingRes = inspect(mapLoader(MISSING_CTRL, loaderRef).fsPath);
report.controls = {
  normalReference: { filename: NORMAL_CTRL, ...normalRes },
  missingReference: { filename: MISSING_CTRL, ...missingRes },
};
ck('control-normal-PASS', () => assert.equal(normalRes.defects.length, 0, 'normal ctrl should have 0 defect'));
ck('control-missing-DETECTED', () => assert.ok(missingRes.defects.includes('MISSING'), 'missing ctrl must be detected'));

// content defect 발견 시: 승인 에셋만 연결하는 최소 memory 후보를 in-memory로 검증
// (defect가 없으면 후보는 비어있고, 통제군이 검출력 자체를 보증한다)
const memoryCandidates = [];
for (const d of allDefective) {
  // 최소 후보: 깨진 참조 filename을 "승인·존재하는 대체 에셋"으로 리맵(메모리에서만)
  const fallback = NORMAL_CTRL; // 승인·존재 확인된 에셋
  const remapped = inspect(mapLoader(fallback, loaderRef).fsPath);
  memoryCandidates.push({ brokenFilename: d.filename, brokenDefects: d.defects, proposedRemap: fallback, remapResolves: remapped.defects.length === 0 });
}
report.memoryCandidates = memoryCandidates;
// 후보가 있으면 전부 해소되어야(= 승인 에셋으로 연결) PASS; 없으면 trivially PASS
ck('memory-candidate-resolves', () => { for (const c of memoryCandidates) assert.ok(c.remapResolves, c.brokenFilename); });

const failCount = checks.filter(c => c.status === 'FAIL').length;
const totalDefects = report.perFile.reduce((a, f) => a + f.defectCount, 0);
report.aggregate = {
  totalUniqueRefsPerFile: report.perFile.map(f => f.uniqueRefs),
  totalRealFileDefects: totalDefects,
  checkCount: checks.length, pass: checks.length - failCount, fail: failCount,
  checks,
  verdict: totalDefects === 0 ? 'NO-FIX (모든 참조가 승인 경로에 실존·정상)' : 'DEFECTS FOUND (memoryCandidates 참조)',
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = failCount ? 1 : 0;
