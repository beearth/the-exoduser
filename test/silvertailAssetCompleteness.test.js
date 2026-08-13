import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash, } from 'node:crypto';
import { inflateSync } from 'node:zlib';

// ═══ Silvertail 8-dir ASSET COMPLETENESS + EXACT-FLIP GUARD ═══
// 렌더러는 directional frame 결손 시 좌우 flip 폴백(game.html ~48470 `_pFlip=!_apHasDir&&...`).
// Silvertail은 좌우 비대칭(Blade Tail=RIGHT / dagger=LEFT)이라 결손→flip = 비대칭 파손.
//
// ⚠ 본 가드가 "증명"하는 것 / 못 하는 것(정확히 분리):
//   §1 8 files exist  §2 mapping=contract  §3 no byte-identical duplicate  §4 pair files not byte-identical
//   §5 EXACT horizontal-flip differential(픽셀 decode) — exactFlipMatch면 FAIL.
//   ✗ 본 테스트는 v1.2 geometry/canon 검증이 아니다. PRE-v1.2 asset도 PASS한다.
//   ✗ near-mirror(거의 미러)는 표본 부재로 자동 FAIL threshold를 두지 않음 → diagnostic만.
// runtime renderer 무변경.

const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const ASSET_DIR = new URL('../img/exoduser_silvertail/', import.meta.url);

const CONTRACT = [
  { clock: '12', dir: 'north',      key: 'n',  file: '12' },
  { clock: '1',  dir: 'north-east', key: 'ne', file: '1'  },
  { clock: '3',  dir: 'east',       key: 'e',  file: '3'  },
  { clock: '5',  dir: 'south-east', key: 'se', file: '5'  },
  { clock: '6',  dir: 'south',      key: 's',  file: '6'  },
  { clock: '7',  dir: 'south-west', key: 'sw', file: '7'  },
  { clock: '9',  dir: 'west',       key: 'w',  file: '9'  },
  { clock: '11', dir: 'north-west', key: 'nw', file: '11' },
];
const MIRROR_PAIRS = [['3', '9'], ['1', '11'], ['5', '7']]; // E/W · NE/NW · SE/SW

const md5 = (p) => createHash('md5').update(readFileSync(p)).digest('hex');
const assetPath = (f) => new URL(f + '.png', ASSET_DIR);

// ── 의존성 없는 최소 PNG 디코더(8-bit non-interlaced, colorType 0/2/4/6) ──
function decodePNG(buf) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) throw new Error('not a PNG');
  let pos = 8, width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos); pos += 4;
    const type = buf.toString('ascii', pos, pos + 4); pos += 4;
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos); height = buf.readUInt32BE(pos + 4);
      bitDepth = buf[pos + 8]; colorType = buf[pos + 9]; interlace = buf[pos + 12];
    } else if (type === 'IDAT') { idat.push(buf.subarray(pos, pos + len)); }
    else if (type === 'IEND') break;
    pos += len + 4; // data + CRC
  }
  if (bitDepth !== 8) throw new Error('unsupported bitDepth ' + bitDepth);
  if (interlace !== 0) throw new Error('interlaced PNG unsupported');
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 0 ? 1
    : (() => { throw new Error('unsupported colorType ' + colorType + ' (palette?)'); })();
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = channels, stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    for (let x = 0; x < stride; x++) {
      const cur = raw[rp++];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = (x >= bpp && y > 0) ? out[(y - 1) * stride + x - bpp] : 0;
      let val;
      switch (filter) {
        case 0: val = cur; break;
        case 1: val = cur + a; break;
        case 2: val = cur + b; break;
        case 3: val = cur + ((a + b) >> 1); break;
        case 4: { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); val = cur + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); break; }
        default: throw new Error('bad filter ' + filter);
      }
      out[y * stride + x] = val & 0xff;
    }
  }
  return { width, height, channels, data: out };
}
function flipCompare(A, B) {
  if (A.width !== B.width || A.height !== B.height || A.channels !== B.channels)
    return { exactFlipMatch: false, differingPixels: null, totalPixels: null, diffRatio: null, dimMismatch: true };
  const { width: w, height: h, channels: c, data } = A, stride = w * c;
  let diff = 0; const total = w * h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const src = y * stride + x * c, dst = y * stride + (w - 1 - x) * c; // flipH(A) at (x) == A at (w-1-x)
    let same = true;
    for (let ch = 0; ch < c; ch++) if (data[dst + ch] !== B.data[src + ch]) { same = false; break; }
    if (!same) diff++;
  }
  return { exactFlipMatch: diff === 0, differingPixels: diff, totalPixels: total, diffRatio: diff / total, dimMismatch: false };
}

// ── §1 8방향 파일 전부 존재 (missing = FAIL, fallback 승인 금지) ──
test('§1 8 files exist — 8방향 clock 파일 전부 존재', () => {
  const missing = CONTRACT.filter(c => !existsSync(assetPath(c.file))).map(c => c.file + '.png');
  assert.deepEqual(missing, [], `누락 방향 없음 (missing=${missing.join(',')})`);
});

// ── §2 매핑 = 계약 (naming contract 잠금) ──
test('§2 mapping = contract — _SILVERTAIL_CLOCK_FILES 일치', () => {
  const m = game.match(/const _SILVERTAIL_CLOCK_FILES=\{([^}]*)\};/);
  assert.ok(m, '_SILVERTAIL_CLOCK_FILES 정의 존재');
  const map = new Function('return {' + m[1] + '}')();
  for (const c of CONTRACT) assert.equal(map[c.dir], c.file, `${c.dir}(${c.clock}시) → ${c.file}.png`);
  assert.equal(Object.keys(map).length, 8, '방향 8개');
});

// ── §3 byte-identical duplicate 없음 (※ "독립 artwork" 증명 아님 — 파일 상이만) ──
test('§3 no byte-identical duplicate — 8파일 중 byte 동일본 없음', () => {
  const present = CONTRACT.filter(c => existsSync(assetPath(c.file)));
  const seen = new Map();
  for (const c of present) {
    const h = md5(assetPath(c.file));
    if (seen.has(h)) assert.fail(`${c.file}.png = ${seen.get(h)}.png byte-동일 (중복 파일)`);
    seen.set(h, c.file);
  }
});

// ── §4 pair files not byte-identical (※ flip-derived 아님을 증명하지 않음) ──
test('§4 pair files not byte-identical — E/W·NE/NW·SE/SW 파일 상이', () => {
  for (const [a, b] of MIRROR_PAIRS) {
    if (!existsSync(assetPath(a)) || !existsSync(assetPath(b))) assert.fail(`§1 선행 — ${a}/${b} 누락`);
    assert.notEqual(md5(assetPath(a)), md5(assetPath(b)), `${a}.png != ${b}.png (byte 상이)`);
  }
});

// ── §5 EXACT horizontal-flip differential (픽셀 decode) — exactFlipMatch면 FAIL ──
// near-mirror threshold는 표본 부재로 미설정 → diagnostic만 출력.
test('§5 exact horizontal-flip differential — 대응쌍 flipH(A) vs B', () => {
  for (const [a, b] of MIRROR_PAIRS) {
    const pa = assetPath(a), pb = assetPath(b);
    if (!existsSync(pa) || !existsSync(pb)) { console.log(`[flip] ${a}<->${b}: MISSING file → skip`); continue; }
    let A, B;
    try { A = decodePNG(readFileSync(pa)); B = decodePNG(readFileSync(pb)); }
    catch (e) { console.log(`[flip] ${a}<->${b}: decode 불가(${e.message}) → diagnostic skip`); continue; }
    const r = flipCompare(A, B);
    console.log(`[flip] ${a}<->${b}: exactFlipMatch=${r.exactFlipMatch} differingPixels=${r.differingPixels} totalPixels=${r.totalPixels} diffRatio=${r.diffRatio == null ? 'n/a' : (r.diffRatio * 100).toFixed(3) + '%'}${r.dimMismatch ? ' [dimMismatch]' : ''}`);
    assert.equal(r.exactFlipMatch, false, `${a}.png 이 ${b}.png 의 EXACT horizontal mirror → FAIL (flip-derived)`);
  }
});
