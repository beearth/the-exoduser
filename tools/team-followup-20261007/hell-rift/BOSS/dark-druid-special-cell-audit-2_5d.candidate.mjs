// dark-druid-special-cell-audit-2_5d.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-RIFT-QUALITY-NEXT-20261007-SPECIAL-CELL-AUDIT / ROLE BOSS / UUID 72ba2963-…
// GOAL CH1-RIFT-QUALITY-NEXT-20261007
// OFFICIAL-COMPLETION-ID CH1-RIFT-QUALITY-NEXT-20261007-SPECIAL-CELL-AUDIT-CANDIDATE
//
// root-adopted tools/2_5d/baked-special-motion.mjs의 BAKED_SPECIAL_SOURCE(fullSHA)·셀 규격을
// 소비해, baked PNG의 **실제 디코드 픽셀**로 셀8별 alpha occupied bbox·상/하 edge 점유·
// erupt 상단 잔여띠를 **측정**하는 API. 측정만 — 보행 foot/IK는 UNKNOWN(occupied bbox를 해부학
// foot으로 격상 0). sourcePNG/셀 crop 강제수정 0, 없는 bitmap은 PENDING. 최소 retouch는 제안만.
//
// 보존: 신규 pixel/PNG/catalog/combat/save/state 변경 0. dive/emerge 동일 SHA(1 decode 공유).
// 원 frame 경계는 Math.round 규격(root bakedSpecialFrame:52-53와 동일).
//
// source:line 근거 — root tools/2_5d/baked-special-motion.mjs:16-21(SOURCE fullSHA/dims),
//   :33-40(LIMITS: rendererOriginY .86=렌더 계수, footAnchor/referenceHeight UNKNOWN),
//   :50-53(cols/rows·정수경계 cell). PNG=RGBA/8bit/non-interlaced(IHDR 확인). Node 디코드는
//   built-in zlib(inflate)+PNG unfilter — 외부 설치 0. AGENTS.md §6: 맵 geometry/collision/
//   outer-mass/painted-env/object/landmark/camera-combat QA가 아니므로 맵가이드 전체 read 비적용;
//   본 유닛은 캐릭터 sprite 원본 픽셀 측정(VISUAL VERDICT: NOT ASSESSED).
// ─────────────────────────────────────────────────────────────────────────────

import { BAKED_SPECIAL_SOURCE, BAKED_SPECIAL_MOTIONS, BAKED_SPECIAL_LIMITS } from '../../../2_5d/baked-special-motion.mjs';
import zlib from 'node:zlib';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';

export const UNKNOWN = 'UNKNOWN';
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');

function colsRows(sheetId) { return sheetId === 'transform' ? { cols: 8, rows: 1 } : { cols: 4, rows: 2 }; }

// root bakedSpecialFrame:52-53와 동일한 정수경계 cell. frame 범위 밖 → throw.
export function cellRect(sheetId, frame) {
  const info = BAKED_SPECIAL_SOURCE[sheetId];
  if (!info) throw new Error(`UNKNOWN sheet: ${sheetId}`);
  const { cols, rows } = colsRows(sheetId);
  if (!Number.isInteger(frame) || frame < 0 || frame >= cols * rows) throw new Error(`frame 범위 오류 ${sheetId}#${frame}`);
  const col = frame % cols, row = Math.floor(frame / cols);
  const x = Math.round(col * info.width / cols), y = Math.round(row * info.height / rows);
  const w = Math.round((col + 1) * info.width / cols) - x, h = Math.round((row + 1) * info.height / rows) - y;
  return { frame, col, row, x, y, w, h };
}

// ── Node PNG 디코더(built-in zlib). RGBA/8bit/non-interlaced만 지원; 아니면 PENDING ──
function paeth(a, b, c) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
const _decodeCache = new Map();
export function decodeSheet(sheetId) {
  if (_decodeCache.has(sheetId)) return _decodeCache.get(sheetId);
  const info = BAKED_SPECIAL_SOURCE[sheetId];
  if (!info) return { supported: false, status: 'PENDING', reason: 'UNKNOWN sheet' };
  const abs = path.join(PROJECT_ROOT, info.path);
  if (!fs.existsSync(abs)) { const r = { supported: false, status: 'PENDING', reason: `bitmap 없음: ${info.path}` }; _decodeCache.set(sheetId, r); return r; }
  const buf = fs.readFileSync(abs);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== info.sha256) return { supported: false, status: 'PENDING', reason: `fullSHA 불일치: ${info.path}` };
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!sig.every((n, i) => buf[i] === n)) return { supported: false, status: 'PENDING', reason: 'PNG 서명 아님' };
  let off = 8, width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0; const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off); const type = buf.toString('ascii', off + 4, off + 8); const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 8 || !(colorType === 6 || colorType === 2) || interlace !== 0) return { supported: false, status: 'PENDING', reason: `미지원 PNG(bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace})` };
  const ch = colorType === 6 ? 4 : 3, stride = width * ch;
  let raw; try { raw = zlib.inflateSync(Buffer.concat(idat)); } catch (e) { return { supported: false, status: 'PENDING', reason: 'inflate 실패' }; }
  if (raw.length < height * (stride + 1)) return { supported: false, status: 'PENDING', reason: 'IDAT 길이 부족' };
  const recon = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const ft = raw[y * (stride + 1)], rowOff = y * (stride + 1) + 1, outOff = y * stride, prevOff = outOff - stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[rowOff + i];
      const a = i >= ch ? recon[outOff + i - ch] : 0, b = y > 0 ? recon[prevOff + i] : 0, c = (y > 0 && i >= ch) ? recon[prevOff + i - ch] : 0;
      let v; switch (ft) { case 0: v = x; break; case 1: v = x + a; break; case 2: v = x + b; break; case 3: v = x + ((a + b) >> 1); break; case 4: v = x + paeth(a, b, c); break; default: return { supported: false, status: 'PENDING', reason: `미지원 filter ${ft}` }; }
      recon[outOff + i] = v & 255;
    }
  }
  // RGBA 평탄화(colorType 2는 alpha=255 — 알파 측정 불가 표기)
  let rgba, hasAlpha = colorType === 6;
  if (hasAlpha) rgba = recon; else { rgba = Buffer.alloc(width * height * 4); for (let p = 0; p < width * height; p++) { rgba[p * 4] = recon[p * 3]; rgba[p * 4 + 1] = recon[p * 3 + 1]; rgba[p * 4 + 2] = recon[p * 3 + 2]; rgba[p * 4 + 3] = 255; } }
  const r = { supported: true, status: 'ok', width, height, channels: 4, hasAlpha, rgba, sha256: sha };
  _decodeCache.set(sheetId, r); return r;
}

// ── 셀 측정: occupied bbox / 상·하 edge 점유 / 채움비 (foot/IK는 UNKNOWN, 격상 금지) ──
export function measureCell(sheetId, frame, { alpha = 16 } = {}) {
  if (!Number.isInteger(alpha) || alpha < 0 || alpha > 255) throw new Error('alpha threshold 범위 오류');
  const dec = decodeSheet(sheetId);
  const rect = cellRect(sheetId, frame);
  if (!dec.supported) return { sheet: sheetId, frame, status: dec.status, reason: dec.reason, cell: rect, occupied: UNKNOWN, footAnchor: UNKNOWN, referenceHeight: UNKNOWN };
  if (!dec.hasAlpha) return { sheet: sheetId, frame, status: 'PENDING', reason: 'alpha 채널 없음(colorType2)', cell: rect, occupied: UNKNOWN };
  const { width, rgba } = dec; let minX = rect.w, minY = rect.h, maxX = -1, maxY = -1, filled = 0;
  for (let yy = 0; yy < rect.h; yy++) for (let xx = 0; xx < rect.w; xx++) {
    const a = rgba[((rect.y + yy) * width + (rect.x + xx)) * 4 + 3];
    if (a > alpha) { filled++; if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (yy < minY) minY = yy; if (yy > maxY) maxY = yy; }
  }
  const empty = maxX < 0;
  let topRow = 0, botRow = 0;
  for (let xx = 0; xx < rect.w; xx++) { if (rgba[((rect.y) * width + rect.x + xx) * 4 + 3] > alpha) topRow++; if (rgba[((rect.y + rect.h - 1) * width + rect.x + xx) * 4 + 3] > alpha) botRow++; }
  return Object.freeze({
    sheet: sheetId, frame, status: 'ok', cell: rect, alphaThreshold: alpha,
    occupied: empty ? null : Object.freeze({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }),
    fillRatio: +(filled / (rect.w * rect.h)).toFixed(5),
    topEdgeOccupancy: +(topRow / rect.w).toFixed(5),    // 셀 최상단 1행 alpha 점유(잘림/잔여 지표)
    bottomEdgeOccupancy: +(botRow / rect.w).toFixed(5), // 셀 최하단 1행 alpha 점유
    footAnchor: UNKNOWN, referenceHeight: UNKNOWN,       // 측정 bbox를 foot/IK로 격상 안 함
    note: 'occupied=원본 알파 bbox(픽셀). 해부학 foot/IK 아님(UNKNOWN). sourcePNG 미변경.',
  });
}

export function auditSheet(sheetId, opts) {
  const { cols, rows } = colsRows(sheetId);
  const cells = []; for (let f = 0; f < cols * rows; f++) cells.push(measureCell(sheetId, f, opts));
  return { sheet: sheetId, cells };
}

// ── erupt 상단 잔여띠: dive 시트(erupt=reverse). 각 셀 상단 band의 alpha 점유 측정 + 제안 ──
// erupt 완전부상 프레임(native frame0, root:47-48 reverse)에서 상단띠 잔여가 크면 retouch 후보(제안만).
export function auditEruptTopBand(sheetId = 'dive', { bandRatio = 0.08, alpha = 16, flagRatio = 0.02 } = {}) {
  const dec = decodeSheet(sheetId);
  if (!dec.supported) return { sheet: sheetId, status: dec.status, reason: dec.reason, bands: UNKNOWN };
  const { width, rgba } = dec; const { cols, rows } = colsRows(sheetId); const bands = [];
  for (let f = 0; f < cols * rows; f++) {
    const rect = cellRect(sheetId, f); const band = Math.max(1, Math.round(rect.h * bandRatio)); let on = 0;
    for (let yy = 0; yy < band; yy++) for (let xx = 0; xx < rect.w; xx++) if (rgba[((rect.y + yy) * width + rect.x + xx) * 4 + 3] > alpha) on++;
    const occ = +(on / (band * rect.w)).toFixed(5);
    bands.push({ frame: f, bandRows: band, topBandOccupancy: occ, retouchCandidate: occ > flagRatio });
  }
  // erupt는 reverse(root:26): native frame0 = 완전 부상(=서 있는 모습). frame0의 상단 band 점유는
  // **머리/상체(서 있는 형상)**일 수도, 분출 soil/dust **잔여띠**일 수도 있어 측정만으로 구분 불가.
  const emerged = bands[0];
  return Object.freeze({
    sheet: sheetId, status: 'ok', bandRatio, flagRatio, bands: Object.freeze(bands),
    // retouchCandidate는 임계 초과 **측정 플래그**일 뿐 확정 결함이 아님. 제안은 '실화면 disambiguation' 요청.
    proposal: emerged.retouchCandidate
      ? `관측(PENDING·미적용): erupt 완전부상(native frame0) 셀 상단 ${Math.round(bandRatio * 100)}% band alpha 점유 ${(emerged.topBandOccupancy * 100).toFixed(2)}% > ${(flagRatio * 100).toFixed(1)}%. 이 점유는 **머리/상체(서 있는 형상)** 또는 분출 잔여띠일 수 있어 측정만으로 결함 단정 0. → root/ART 실화면 disambiguation 필요; 잔여로 확인될 때만 source retouch 후보(sourcePNG 강제수정 0).`
      : `관측: erupt 완전부상 상단 band 점유 ${(emerged.topBandOccupancy * 100).toFixed(2)}% ≤ ${(flagRatio * 100).toFixed(1)}% → 유의 상단 점유 낮음(실화면 미관측, PENDING).`,
    footAnchor: UNKNOWN,
  });
}

// ── 신규 핵심 counterexample 검증(stdin 1회, FAIL→nonzero, 실제 raw/API 소비) ──
export function verify() {
  const R = []; const ok = (n, c, d) => R.push({ name: n, ok: !!c, detail: d || '' });
  const throws = fn => { try { fn(); return false; } catch { return true; } };

  // root 소비: SOURCE fullSHA/dims 존재
  ok('root BAKED_SPECIAL_SOURCE 소비', !!BAKED_SPECIAL_SOURCE.dive && BAKED_SPECIAL_SOURCE.dive.width === 1774 && BAKED_SPECIAL_LIMITS.footAnchor === 'UNKNOWN');
  // 실제 디코드: dive RGBA, 길이 w*h*4, SHA 일치
  const d = decodeSheet('dive');
  ok('dive 디코드 지원 & RGBA 길이', d.supported && d.hasAlpha && d.rgba.length === d.width * d.height * 4, d.supported ? `${d.width}x${d.height}` : d.reason);
  ok('dive fullSHA 일치', d.supported && d.sha256 === BAKED_SPECIAL_SOURCE.dive.sha256);
  // 측정: dive frame0 occupied bbox가 셀 안
  const m0 = measureCell('dive', 0);
  ok('dive#0 occupied bbox ⊂ cell', m0.status === 'ok' && m0.occupied && m0.occupied.w <= m0.cell.w && m0.occupied.h <= m0.cell.h && m0.occupied.x >= 0 && m0.occupied.y >= 0, m0.occupied ? `${m0.occupied.w}x${m0.occupied.h}` : 'empty/UNKNOWN');
  // foot/referenceHeight UNKNOWN(격상 금지)
  ok('occupied를 foot으로 격상 안 함(UNKNOWN)', m0.footAnchor === UNKNOWN && m0.referenceHeight === UNKNOWN);
  // under 셀(frame7) 측정은 가능하나 표시 hidden은 root 계약(측정과 분리)
  ok('under frame(7) 측정 가능', measureCell('dive', 7).status === 'ok');
  // erupt 상단 잔여띠 측정이 수치 반환(관측값 기록, 실화면 PENDING)
  const band = auditEruptTopBand('dive');
  ok('erupt top-band 측정 수치 반환', band.status === 'ok' && Array.isArray(band.bands) && typeof band.bands[0].topBandOccupancy === 'number', band.bands ? `f0=${band.bands[0].topBandOccupancy}` : band.reason);
  // 반례: 없는 시트/범위밖 frame/잘못된 alpha
  ok('UNKNOWN sheet → PENDING(decode)', decodeSheet('nope').status === 'PENDING');
  ok('frame 범위밖 → throw', throws(() => cellRect('dive', 8)) && throws(() => measureCell('dive', -1)));
  ok('alpha threshold 범위밖 → throw', throws(() => measureCell('dive', 0, { alpha: 999 })));
  // transform 8x1 셀 수치(실 draw): frame7 x=2100 w=300
  const t7 = cellRect('transform', 7);
  ok('transform#7 x=2100 w=300', t7.x === 2100 && t7.w === 300);

  return { ok: R.every(r => r.ok), results: R };
}

export default { UNKNOWN, cellRect, decodeSheet, measureCell, auditSheet, auditEruptTopBand, verify };

const _isMain = (() => { try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; } })();
if (_isMain) {
  const r = verify();
  for (const c of r.results) console.log(`  ${c.ok ? 'OK' : 'FAIL'} ${c.name}${c.detail ? ' :: ' + c.detail : ''}`);
  // 관측 요약(디코드 성공 시): dive 셀별 occupied/edge + erupt top-band
  const d = decodeSheet('dive');
  if (d.supported) {
    const a = auditSheet('dive'); for (const c of a.cells) if (c.occupied) console.log(`  obs dive#${c.frame} occ=${c.occupied.w}x${c.occupied.h}@(${c.occupied.x},${c.occupied.y}) top=${c.topEdgeOccupancy} bot=${c.bottomEdgeOccupancy} fill=${c.fillRatio}`);
    const band = auditEruptTopBand('dive'); console.log('  ' + band.proposal);
  } else console.log('  dive decode PENDING:', d.reason);
  console.log(`verify: ${r.ok ? 'PASS' : 'FAIL'}`);
  try { process.exitCode = r.ok ? 0 : 1; } catch { /* ignore */ }
}
