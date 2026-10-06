// dark-druid-special-cell-audit-2_5d.v2.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-RIFT-QUALITY-FIX-20261007-CELL-AUDIT-GUARDS-V2 / ROLE BOSS / UUID 72ba2963-…
// GOAL CH1-RIFT-QUALITY-FIX-20261007
// OFFICIAL-COMPLETION-ID CH1-RIFT-QUALITY-FIX-20261007-CELL-AUDIT-GUARDS-V2-CANDIDATE
//
// v1(…cell-audit-2_5d.candidate.mjs, sha 19a5ab52…) 결함 수정판. v1 불변(별도 파일).
// 수정 결함:
//   · auditEruptTopBand bandRatio=NaN → status 'ok' + topBandOccupancy NaN (가드 없음, 확인됨).
//   · bandRatio=Infinity → band=Math.round(rect.h*Inf)=Infinity → for(yy<Infinity) **무한 루프/hang**
//     + out-of-bounds 픽셀 접근. (코드경로상 확인; hang 방지 위해 미실행)
// 수정: 모든 alphaThreshold/bandRatio/flagRatio/frame(+내부 dim/col/row/band)을 **루프 이전**에
//   finite Number·정수/비율 범위로 선가드. NaN/Infinity/비정수/범위밖 → throw(fail-closed, hang 0).
//
// 측정 전용: anatomy foot/referenceHeight UNKNOWN(occupied bbox 격상 0), sourcePNG/픽셀 삭제·추정 0,
//   node:zlib/fs 오프라인 디코드(browser import 0). erupt frame0 상단 band은 머리/잔여띠 판별불가(PENDING).
//   **빈 셀 / 가시성(render) / 측정한계**를 분리 표기.
//
// source:line — root tools/2_5d/baked-special-motion.mjs:16-21(SOURCE fullSHA/dims), :22-32(MOTIONS,
//   under.hidden=render 계약), :33-40(LIMITS foot/refHeight UNKNOWN, .86 렌더 계수), :50-53(cell 정수경계).
//   AGENTS.md §6: 맵 geometry/collision/outer-mass/painted-env/object/landmark/camera-combat QA가
//   아니므로 맵가이드 전체 read 비적용(본 유닛=캐릭터 sprite 원본 픽셀 측정). VISUAL VERDICT: NOT ASSESSED.
// ─────────────────────────────────────────────────────────────────────────────

import { BAKED_SPECIAL_SOURCE, BAKED_SPECIAL_MOTIONS, BAKED_SPECIAL_LIMITS } from '../../../2_5d/baked-special-motion.mjs';
import zlib from 'node:zlib';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';

export const UNKNOWN = 'UNKNOWN';
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');

// ── 선가드 헬퍼(루프/산술 이전 호출). NaN/Infinity/비정수/범위밖 → throw ──
const isNum = v => typeof v === 'number' && Number.isFinite(v); // NaN·±Infinity 모두 false
function reqIntInRange(v, lo, hi, name) { if (typeof v !== 'number' || !Number.isInteger(v) || v < lo || v > hi) throw new Error(`${name} 정수범위 오류(${lo}..${hi}): ${v}`); }
function reqRatio01(v, name) { if (!isNum(v) || v < 0 || v > 1) throw new Error(`${name} 비율범위 오류(0..1 finite): ${v}`); }
function reqPosIntDim(v, name) { if (typeof v !== 'number' || !Number.isInteger(v) || v <= 0) throw new Error(`${name} 양의정수 아님: ${v}`); }

function colsRows(sheetId) { return sheetId === 'transform' ? { cols: 8, rows: 1 } : { cols: 4, rows: 2 }; }

export function cellRect(sheetId, frame) {
  const info = BAKED_SPECIAL_SOURCE[sheetId];
  if (!info) throw new Error(`UNKNOWN sheet: ${sheetId}`);
  reqPosIntDim(info.width, 'sheet.width'); reqPosIntDim(info.height, 'sheet.height');
  const { cols, rows } = colsRows(sheetId);
  reqIntInRange(frame, 0, cols * rows - 1, 'frame');
  const col = frame % cols, row = Math.floor(frame / cols);
  const x = Math.round(col * info.width / cols), y = Math.round(row * info.height / rows);
  const w = Math.round((col + 1) * info.width / cols) - x, h = Math.round((row + 1) * info.height / rows) - y;
  reqPosIntDim(w, 'cell.w'); reqPosIntDim(h, 'cell.h'); // 내부 산출도 선가드
  return { frame, col, row, x, y, w, h };
}

// ── Node PNG 디코더(node:zlib, 오프라인). RGBA/8bit/non-interlaced만; 아니면 measure-limit ──
function paeth(a, b, c) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
const _decodeCache = new Map();
export function decodeSheet(sheetId) {
  if (_decodeCache.has(sheetId)) return _decodeCache.get(sheetId);
  const info = BAKED_SPECIAL_SOURCE[sheetId];
  if (!info) throw new Error(`UNKNOWN sheet: ${sheetId}`); // 미지 시트 = 잘못된 입력(fail-closed throw), measure-limit 아님
  const abs = path.join(PROJECT_ROOT, info.path);
  if (!fs.existsSync(abs)) { const r = { supported: false, limit: 'missing-bitmap', status: 'measure-limit', reason: `bitmap 없음: ${info.path}` }; _decodeCache.set(sheetId, r); return r; }
  const buf = fs.readFileSync(abs);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  if (sha !== info.sha256) return { supported: false, limit: 'sha-mismatch', status: 'measure-limit', reason: `fullSHA 불일치: ${info.path}` };
  if (![137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => buf[i] === n)) return { supported: false, limit: 'not-png', status: 'measure-limit', reason: 'PNG 서명 아님' };
  let off = 8, width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0; const idat = [];
  while (off + 12 <= buf.length) {
    const len = buf.readUInt32BE(off); const type = buf.toString('ascii', off + 4, off + 8); const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 8 || !(colorType === 6 || colorType === 2) || interlace !== 0) return { supported: false, limit: 'unsupported-png', status: 'measure-limit', reason: `미지원 PNG(bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace})` };
  const ch = colorType === 6 ? 4 : 3, stride = width * ch;
  let raw; try { raw = zlib.inflateSync(Buffer.concat(idat)); } catch { return { supported: false, limit: 'inflate-fail', status: 'measure-limit', reason: 'inflate 실패' }; }
  if (raw.length < height * (stride + 1)) return { supported: false, limit: 'idat-short', status: 'measure-limit', reason: 'IDAT 길이 부족' };
  const recon = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const ft = raw[y * (stride + 1)], rowOff = y * (stride + 1) + 1, outOff = y * stride, prevOff = outOff - stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[rowOff + i];
      const a = i >= ch ? recon[outOff + i - ch] : 0, b = y > 0 ? recon[prevOff + i] : 0, c = (y > 0 && i >= ch) ? recon[prevOff + i - ch] : 0;
      let v; switch (ft) { case 0: v = x; break; case 1: v = x + a; break; case 2: v = x + b; break; case 3: v = x + ((a + b) >> 1); break; case 4: v = x + paeth(a, b, c); break; default: return { supported: false, limit: 'unsupported-filter', status: 'measure-limit', reason: `미지원 filter ${ft}` }; }
      recon[outOff + i] = v & 255;
    }
  }
  let rgba; const hasAlpha = colorType === 6;
  if (hasAlpha) rgba = recon; else { rgba = Buffer.alloc(width * height * 4); for (let p = 0; p < width * height; p++) { rgba[p * 4] = recon[p * 3]; rgba[p * 4 + 1] = recon[p * 3 + 1]; rgba[p * 4 + 2] = recon[p * 3 + 2]; rgba[p * 4 + 3] = 255; } }
  const r = { supported: true, status: 'ok', width, height, channels: 4, hasAlpha, rgba, sha256: sha };
  _decodeCache.set(sheetId, r); return r;
}

// 측정 결과의 occupancy 분류: 'measured'(내용 있음) / 'empty'(투명 셀) / 'measure-limit'(디코드/알파 한계).
export function measureCell(sheetId, frame, { alpha = 16 } = {}) {
  reqIntInRange(alpha, 0, 255, 'alphaThreshold'); // 선가드(NaN/비정수/범위밖 throw)
  const rect = cellRect(sheetId, frame);
  const dec = decodeSheet(sheetId);
  if (!dec.supported) return Object.freeze({ sheet: sheetId, frame, occupancy: 'measure-limit', limit: dec.limit, reason: dec.reason, cell: rect, occupied: UNKNOWN, footAnchor: UNKNOWN, referenceHeight: UNKNOWN });
  if (!dec.hasAlpha) return Object.freeze({ sheet: sheetId, frame, occupancy: 'measure-limit', limit: 'no-alpha-channel', cell: rect, occupied: UNKNOWN });
  const { width, rgba } = dec; let minX = rect.w, minY = rect.h, maxX = -1, maxY = -1, filled = 0;
  for (let yy = 0; yy < rect.h; yy++) for (let xx = 0; xx < rect.w; xx++) {
    const a = rgba[((rect.y + yy) * width + (rect.x + xx)) * 4 + 3];
    if (a > alpha) { filled++; if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (yy < minY) minY = yy; if (yy > maxY) maxY = yy; }
  }
  const empty = maxX < 0;
  let topRow = 0, botRow = 0;
  for (let xx = 0; xx < rect.w; xx++) { if (rgba[(rect.y * width + rect.x + xx) * 4 + 3] > alpha) topRow++; if (rgba[((rect.y + rect.h - 1) * width + rect.x + xx) * 4 + 3] > alpha) botRow++; }
  const motion = Object.values(BAKED_SPECIAL_MOTIONS).find(m => m.sheet === sheetId && (sheetId !== 'dive' || true)); // render hidden은 motion별(under) — 측정과 분리
  return Object.freeze({
    sheet: sheetId, frame, occupancy: empty ? 'empty' : 'measured', cell: rect, alphaThreshold: alpha,
    occupied: empty ? null : Object.freeze({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }),
    fillRatio: +(filled / (rect.w * rect.h)).toFixed(5),
    topEdgeOccupancy: +(topRow / rect.w).toFixed(5), bottomEdgeOccupancy: +(botRow / rect.w).toFixed(5),
    footAnchor: UNKNOWN, referenceHeight: UNKNOWN,
    renderHiddenContract: !!(BAKED_SPECIAL_MOTIONS.under && BAKED_SPECIAL_MOTIONS.under.sheet === sheetId && frame === 7), // under(frame7)=렌더 숨김 계약; 측정값은 유효(가시성≠측정)
    note: 'occupied=원본 알파 bbox(픽셀). foot/IK 아님(UNKNOWN). empty=투명 셀. renderHidden=렌더 계약(측정과 분리). sourcePNG 미변경.',
  });
}

export function auditSheet(sheetId, opts) {
  const { cols, rows } = colsRows(sheetId); const cells = [];
  for (let f = 0; f < cols * rows; f++) cells.push(measureCell(sheetId, f, opts));
  return { sheet: sheetId, cells };
}

// erupt 상단 band 측정. **모든 비율/알파를 루프 이전 선가드** → NaN/Infinity/범위밖 throw(hang 0).
export function auditEruptTopBand(sheetId = 'dive', { bandRatio = 0.08, alpha = 16, flagRatio = 0.02 } = {}) {
  reqRatio01(bandRatio, 'bandRatio');     // NaN/Infinity/범위밖 → throw (v1 결함 수정)
  reqRatio01(flagRatio, 'flagRatio');
  reqIntInRange(alpha, 0, 255, 'alphaThreshold');
  const dec = decodeSheet(sheetId);
  if (!dec.supported) return Object.freeze({ sheet: sheetId, status: 'measure-limit', limit: dec.limit, reason: dec.reason, bands: UNKNOWN });
  const { width, rgba } = dec; const { cols, rows } = colsRows(sheetId); const bands = [];
  for (let f = 0; f < cols * rows; f++) {
    const rect = cellRect(sheetId, f);
    let band = Math.round(rect.h * bandRatio); if (band < 1) band = 1; if (band > rect.h) band = rect.h;
    reqPosIntDim(band, 'band'); if (band > rect.h) throw new Error('band>cell.h'); // 루프 이전 최종 가드
    let on = 0;
    for (let yy = 0; yy < band; yy++) for (let xx = 0; xx < rect.w; xx++) if (rgba[((rect.y + yy) * width + rect.x + xx) * 4 + 3] > alpha) on++;
    const occ = +(on / (band * rect.w)).toFixed(5);
    bands.push({ frame: f, bandRows: band, topBandOccupancy: occ, overFlag: occ > flagRatio });
  }
  const emerged = bands[0];
  return Object.freeze({
    sheet: sheetId, status: 'ok', bandRatio, flagRatio, bands: Object.freeze(bands),
    proposal: emerged.overFlag
      ? `관측(PENDING·미적용): erupt 완전부상(native frame0) 상단 ${Math.round(bandRatio * 100)}% band 점유 ${(emerged.topBandOccupancy * 100).toFixed(2)}% > ${(flagRatio * 100).toFixed(1)}%. 머리/상체(서 있는 형상) 또는 분출 잔여띠 — 측정만으로 결함 단정 0. root/ART 실화면 disambiguation 필요(sourcePNG 강제수정 0).`
      : `관측: 상단 band 점유 ${(emerged.topBandOccupancy * 100).toFixed(2)}% ≤ ${(flagRatio * 100).toFixed(1)}% (실화면 미관측, PENDING).`,
    footAnchor: UNKNOWN,
  });
}

export default { UNKNOWN, cellRect, decodeSheet, measureCell, auditSheet, auditEruptTopBand };
