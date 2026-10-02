// ART-charvisuals-asset-closure-cv1135  (epoch capacity-after-8c317a73-1134)
// 목적: index.html CHAR_VISUALS[]의 캐릭터 비주얼 소비 필드
//       (portrait/bust/emblemImg/scene/sceneVid/idleVid/poster)를 추출해
//       ?v= 쿼리 제거 후 실파일 존재·header 치수·suffix 일치·LFS/0바이트를 검사한다.
// 성격: 읽기 전용 asset→consumer closure. 이미지 생성/교체 0, Git 0, production 0.
//       파일 존재는 미술 LOCK/캐릭터 정체성 PASS가 아니다.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const readB = p => fs.readFileSync(path.join(ROOT, p));
const exists = p => fs.existsSync(path.join(ROOT, p));

// ── CHAR_VISUALS 블록 brace-match 추출 ──
function extractArray(src, name) {
  const start = src.indexOf('const ' + name + '=[');
  assert.ok(start >= 0, `array not found: ${name}`);
  let i = src.indexOf('[', start), depth = 0, inStr = false, q = '', esc = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) { if (esc) { esc = false; continue; } if (c === '\\') { esc = true; continue; } if (c === q) inStr = false; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = true; q = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(start, i);
}

// 각 캐릭터 객체(id:'exoduser_...') 단위로 분할해 비주얼 필드 추출
const VISUAL_FIELDS = ['portrait', 'bust', 'emblemImg', 'scene', 'sceneVid', 'idleVid', 'poster'];
function parseChars(block) {
  const idRe = /id:'(exoduser_[a-z]+)'/g;
  const idxs = []; let m;
  while ((m = idRe.exec(block))) idxs.push({ id: m[1], at: m.index });
  const chars = [];
  for (let k = 0; k < idxs.length; k++) {
    const seg = block.slice(idxs[k].at, k + 1 < idxs.length ? idxs[k + 1].at : block.length);
    const comingSoon = /comingSoon:true/.test(seg);
    const fields = {};
    for (const f of VISUAL_FIELDS) {
      const fm = seg.match(new RegExp('(?:^|[,{\\s])' + f + ":'([^']+)'"));
      if (fm) fields[f] = fm[1];
    }
    chars.push({ id: idxs[k].id, comingSoon, fields });
  }
  return chars;
}

const stripQuery = s => s.split('?')[0];

// ── header 파서 ──
function pngSize(b) { return (b[0] === 0x89 && b[1] === 0x50) ? { w: b.readUInt32BE(16), h: b.readUInt32BE(20), fmt: 'png' } : null; }
function jpegSize(b) {
  if (!(b[0] === 0xff && b[1] === 0xd8)) return null;
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const mk = b[i + 1];
    if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7), fmt: 'jpeg' };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
function mp4Check(b) { return (b.length > 12 && b.toString('ascii', 4, 8) === 'ftyp') ? { fmt: 'mp4', ftyp: b.toString('ascii', 8, 12) } : null; }
function isLfs(b) { return b.slice(0, 120).toString('utf8').startsWith('version https://git-lfs'); }

function inspect(ref) {
  const fsPath = stripQuery(ref);
  const r = { ref, fsPath, exists: false, bytes: 0, header: null, ext: path.extname(fsPath).toLowerCase(), extOk: null, defects: [] };
  if (!exists(fsPath)) { r.defects.push('MISSING'); return r; }
  r.exists = true;
  const b = readB(fsPath); r.bytes = b.length; r.sha256 = sha(b).slice(0, 16);
  if (b.length === 0) { r.defects.push('ZERO_BYTES'); return r; }
  if (isLfs(b)) { r.defects.push('LFS_POINTER'); return r; }
  const h = pngSize(b) || jpegSize(b) || mp4Check(b);
  r.header = h;
  if (!h) { r.defects.push('UNREADABLE_HEADER'); return r; }
  const extFmt = r.ext === '.png' ? 'png' : (r.ext === '.jpg' || r.ext === '.jpeg') ? 'jpeg' : r.ext === '.mp4' ? 'mp4' : r.ext === '.webp' ? 'webp' : r.ext;
  r.extOk = (extFmt === h.fmt);
  if (!r.extOk) r.defects.push('SUFFIX_FORMAT_MISMATCH(' + r.ext + '→' + h.fmt + ')');
  return r;
}

// ── 메인 ──
const buf = readB('index.html'); const src = buf.toString('utf8');
const chars = parseChars(extractArray(src, 'CHAR_VISUALS'));
const checks = []; const ck = (id, fn) => { try { fn(); checks.push({ id, status: 'PASS' }); } catch (e) { checks.push({ id, status: 'FAIL', error: e.message }); } };

const perChar = chars.map(c => {
  const rows = {};
  for (const [f, ref] of Object.entries(c.fields)) rows[f] = inspect(ref);
  const defects = Object.entries(rows).filter(([, r]) => r.defects.length).map(([f, r]) => ({ field: f, ref: r.ref, defects: r.defects }));
  return { id: c.id, comingSoon: c.comingSoon, fieldCount: Object.keys(rows).length, rows, defectCount: defects.length, defects };
});

// 통제군(검출력 증명): 정상 1 + 누락 1
const normalCtrl = inspect('assets/charselect/warrior_cut.png?v=3');
const missingCtrl = inspect('assets/charselect/__cv1135_absent__.png');
ck('control-normal-PASS', () => assert.equal(normalCtrl.defects.length, 0));
ck('control-missing-DETECTED', () => assert.ok(missingCtrl.defects.includes('MISSING')));
ck('char-roster-nonempty', () => assert.ok(chars.length >= 5, 'expected >=5 chars, got ' + chars.length));

const totalRefs = perChar.reduce((a, c) => a + c.fieldCount, 0);
const totalDefects = perChar.reduce((a, c) => a + c.defectCount, 0);
const fail = checks.filter(c => c.status === 'FAIL').length;

const report = {
  task: 'ART-charvisuals-asset-closure-cv1135', epoch: 'capacity-after-8c317a73-1134',
  executedAtUTC: new Date().toISOString(), node: process.version,
  verificationKind: 'CHAR_VISUALS asset→consumer closure (read-only). 파일존재는 미술/정체성 PASS 아님',
  indexHtmlSha256: sha(buf),
  charCount: chars.length, totalVisualRefs: totalRefs, totalDefects,
  controls: { normal: normalCtrl, missing: missingCtrl },
  perChar,
  checks, checkPass: checks.length - fail, checkFail: fail,
  verdict: totalDefects === 0 ? 'NO-FIX (전 참조 실존·header 정상)' : 'DEFECTS FOUND',
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = fail ? 1 : 0;
