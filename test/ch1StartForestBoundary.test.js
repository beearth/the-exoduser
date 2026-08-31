import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const GAME = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function readHandProps(source) {
  const block = source.match(/\/\/ CH1-1 HAND PROPS START([\s\S]*?)\/\/ CH1-1 HAND PROPS END/);
  assert.ok(block, 'CH1-1 hand-prop block must exist');
  return [...block[1].matchAll(/\{id:'([^']+)',x:(\d+),y:(\d+)(?:,scale:([\d.]+))?\}/g)].map(([, id, x, y, scale]) => ({
    id,
    x: Number(x),
    y: Number(y),
    scale: scale ? Number(scale) : 1,
  }));
}

function decodeRLE(rle, width, height) {
  const out = new Uint8Array(width * height);
  let pos = 0;
  for (let i = 0; i < rle.length; i += 2) {
    const value = rle[i];
    const count = rle[i + 1];
    out.fill(value, pos, pos + count);
    pos += count;
  }
  assert.equal(pos, width * height, 'forest boundary RLE must cover the complete map');
  return out;
}

test('CH1-1 removes modular dash and L-shaped vines from the baked forest boundary', () => {
  const props = readHandProps(GAME);
  const modularVines = props.filter((prop) => /^m_c1b|^m_c1c[nsew]/.test(prop.id));
  assert.deepEqual(modularVines, [],
    'dash/L modules must not remain over the continuous baked forest');
  assert.match(GAME, /0:\{hand:1,dense:1,lm:\[\],mega:\[\],forestBoundary:1,/,
    'CH1-1 compose must explicitly own its forest boundary');
  assert.match(GAME, /var MAP_ALL_FLOOR=false;/,
    'the obsolete all-floor override must not erase the authored forest collision');
  assert.match(GAME, /!\(G\.stage===0&&_ch1StartOuterEnabled\(\)\)/,
    'default baked forest must suppress the procedural repeated wall-edge sprites');
  assert.doesNotMatch(GAME, /else if\(_pillarCvs\)/,
    'the full-map renderer must not fall through to repeated pillar sprites for the baked forest');
  assert.doesNotMatch(GAME, /else if\(!_vista&&_pillarCvs\)/,
    'the stream renderer must not fall through to repeated pillar sprites for the baked forest');
});

test('CH1-1 forest geometry blocks side mass while preserving START, landmarks, center, and EXIT', () => {
  const start = GAME.indexOf('function _rleEncodeGrid');
  const end = GAME.indexOf('function _paintPathDisk', start);
  assert.notEqual(start, -1, 'RLE encoder must exist');
  assert.notEqual(end, -1, 'path painter marker must exist');
  const block = GAME.slice(start, end);
  assert.match(block, /function _buildCh1StartForestRLE\(mw,mh\)/,
    'stage0 needs one canonical tile boundary builder instead of prop colliders');
  const build = new Function(`${block}\nreturn _buildCh1StartForestRLE;`)();
  const width = 200;
  const height = 200;
  const grid = decodeRLE(build(width, height), width, height);
  const at = (x, y) => grid[y * width + x];

  for (const [label, x, y] of [
    ['START', 100, 190],
    ['south field', 100, 165],
    ['camp approach', 45, 100],
    ['cocoon approach', 47, 50],
    ['center', 100, 100],
    ['corpse tree bypass west', 82, 90],
    ['corpse tree bypass east', 122, 90],
    ['altar approach', 147, 97],
    ['toxic approach', 162, 139],
    ['EXIT', 100, 18],
  ]) assert.equal(at(x, y), 1, `${label} must remain walkable`);

  for (const [label, x, y] of [
    ['west forest', 8, 100],
    ['east forest', 192, 100],
    ['north-west forest', 30, 15],
    ['north-east forest', 170, 15],
    ['south-west forest', 30, 185],
    ['south-east forest', 170, 185],
    ['west cocoon back mass', 24, 50],
    ['east pool back mass', 182, 50],
  ]) assert.equal(at(x, y), 0, `${label} must be non-walkable`);

  const leftEdges = [];
  const rightEdges = [];
  for (const y of [35, 50, 75, 100, 125, 150, 165]) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < width; x++) if (at(x, y) === 1) { left = x; break; }
    for (let x = width - 1; x >= 0; x--) if (at(x, y) === 1) { right = x; break; }
    leftEdges.push(left);
    rightEdges.push(right);
  }
  assert.ok(new Set(leftEdges).size >= 4, `west forest edge must undulate, got ${leftEdges}`);
  assert.ok(new Set(rightEdges).size >= 4, `east forest edge must undulate, got ${rightEdges}`);
});

test('CH1-1 keeps the established north gate and exit after applying forest geometry', () => {
  const start = GAME.indexOf('function _applyCh1StartNorthGate');
  const end = GAME.indexOf('function _applyHellWinterNorthGate', start);
  assert.notEqual(start, -1, 'CH1-1 north-gate override must exist');
  assert.notEqual(end, -1, 'hell-winter gate marker must exist after it');
  const block = GAME.slice(start, end);
  const applyGate = new Function(`${block}\nreturn _applyCh1StartNorthGate;`)();
  const width = 200;
  const height = 200;
  const map = Array.from({ length: height }, () => Array(width).fill(1));
  const result = applyGate(map, width, height);

  assert.equal(result.bossCx, 100);
  assert.equal(result.gateY, 5);
  assert.deepEqual(result.gateTiles, [{ x: 99, y: 5 }, { x: 100, y: 5 }, { x: 101, y: 5 }]);
  assert.deepEqual(result.exits, [{ x: 99, y: 7 }, { x: 100, y: 7 }, { x: 101, y: 7 }]);
  assert.equal(map[20][100], 0, 'boss approach must remain open up to the fixed north gate');
  assert.match(GAME, /if\(si===0&&_MAP_COMPOSE\[0\]\.forestBoundary\)\{const _ch1Gate=_applyCh1StartNorthGate/,
    'generation must apply the CH1-1 gate override after generic boss-room carving');
});
