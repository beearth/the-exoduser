import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

// ═══ Silvertail 8-dir ASSET COMPLETENESS GUARD ═══
// 렌더러는 directional frame 결손 시 좌우 flip 폴백을 함(game.html ~48470 `_pFlip=!_apHasDir&&...`).
// Silvertail은 좌우 비대칭(Blade Tail=RIGHT / dagger=LEFT)이라 flip 폴백 = 비대칭 파손.
// → 8방향 파일이 (a) 전부 존재하고 (b) 서로 독립 asset이어야 한다. 특히 E≠W·NE≠NW·SE≠SW.
// 본 가드가 누락/중복(flip-derived 동일본)을 CI에서 차단한다. runtime renderer 무변경.

const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const ASSET_DIR = new URL('../img/exoduser_silvertail/', import.meta.url);

// ── LOCKED NAMING CONTRACT (clock ↔ dir ↔ key ↔ file) ──
// clock: 12/1/3/5/6/7/9/11 · _CHAR_DIRS ↔ _SILVERTAIL_CLOCK_FILES(game.html 8922)
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
// flip 금지 대응쌍(좌우 mirror로 파생하면 안 되는 asset 쌍)
const MIRROR_PAIRS = [['3', '9'], ['1', '11'], ['5', '7']]; // E/W · NE/NW · SE/SW

const md5 = (p) => createHash('md5').update(readFileSync(p)).digest('hex');
const assetPath = (f) => new URL(f + '.png', ASSET_DIR);

// ── §1 game.html _SILVERTAIL_CLOCK_FILES 매핑이 계약과 일치(계약 잠금) ──
test('§1 _SILVERTAIL_CLOCK_FILES 매핑 = LOCKED contract', () => {
  const m = game.match(/const _SILVERTAIL_CLOCK_FILES=\{([^}]*)\};/);
  assert.ok(m, '_SILVERTAIL_CLOCK_FILES 정의 존재');
  const map = new Function('return {' + m[1] + '}')();
  for (const c of CONTRACT) {
    assert.equal(map[c.dir], c.file, `${c.dir}(${c.clock}시) → ${c.file}.png 매핑`);
  }
  assert.equal(Object.keys(map).length, 8, '방향 8개 정확');
});

// ── §2 8방향 파일 전부 존재 (missing = FAIL, fallback 승인 금지) ──
test('§2 8방향 clock 파일 전부 존재', () => {
  const missing = CONTRACT.filter(c => !existsSync(assetPath(c.file))).map(c => c.file + '.png');
  assert.deepEqual(missing, [], `누락 방향 없음 (missing=${missing.join(',')})`);
});

// ── §3 각 방향 key가 독립 asset (8개 전부 상이) ──
test('§3 8방향 asset 전부 독립(중복 0)', () => {
  const present = CONTRACT.filter(c => existsSync(assetPath(c.file)));
  if (present.length < 8) { assert.fail('§2 선행 실패 — 파일 누락으로 독립성 검증 불가'); }
  const hashes = present.map(c => ({ f: c.file, h: md5(assetPath(c.file)) }));
  const seen = new Map();
  for (const { f, h } of hashes) {
    if (seen.has(h)) assert.fail(`${f}.png = ${seen.get(h)}.png 동일본(중복 asset) → flip-derived 의심`);
    seen.set(h, f);
  }
});

// ── §4 mirror-risk 쌍 독립: E≠W · NE≠NW · SE≠SW (flip-derived 차단) ──
test('§4 좌우 대응쌍 독립 — E≠W · NE≠NW · SE≠SW', () => {
  for (const [a, b] of MIRROR_PAIRS) {
    const pa = assetPath(a), pb = assetPath(b);
    if (!existsSync(pa) || !existsSync(pb)) { assert.fail(`§2 선행 실패 — ${a}.png/${b}.png 누락`); }
    assert.notEqual(md5(pa), md5(pb), `${a}.png != ${b}.png (좌우 flip 파생 금지)`);
  }
});

// note(한계): 본 가드는 byte-동일(복사/flip 후 동일저장) 중복을 차단한다.
// 실제 "좌우 mirror 여부"의 시각 판정은 48×48 다운스케일 human gate(SPEC [J] 224→48)에서 수행.
