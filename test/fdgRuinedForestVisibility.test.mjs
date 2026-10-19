import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, open } from 'node:fs/promises';
import vm from 'node:vm';
import { createRuinedForestTemplate, RUINED_FOREST_SCENE } from '../engine/fdg/ruined-forest-scene.js';

const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const template = createRuinedForestTemplate(), scene = RUINED_FOREST_SCENE;
const tiles = [];
for (let i = 0; i < template.tileRLE.length; i += 2) tiles.push(...Array(template.tileRLE[i + 1]).fill(template.tileRLE[i]));

function bodyEnd(start) {
  const brace = game.indexOf('{', start);
  let depth = 0, quote = '', comment = '';
  for (let i = brace; i < game.length; i++) {
    const c = game[i], n = game[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && n === '/') { comment = ''; i++; } continue; }
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '/' && n === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return i + 1;
  }
  assert.fail('Unterminated native keepAR consumer');
}

const cropStart = game.indexOf('function _drawMapObjectCrop(');
const cropSource = game.slice(cropStart, bodyEnd(cropStart));
const aspectStart = game.indexOf('}else if(_meta&&_meta.keepAR){'), aspectBrace = game.indexOf('{', aspectStart);
const aspectSource = game.slice(aspectBrace + 1, bodyEnd(aspectStart) - 1);
const sizeStart = game.indexOf('const sz=(_meta?_meta.sz||32:32)*(mo.scale||1);', game.indexOf('// ── 스프라이트 장식 오브젝트'));
const sizeSource = game.slice(sizeStart, game.indexOf('\n', sizeStart));
const metaStart = game.indexOf('_OBJ_META[d.id]=Object.assign(_prev,');
const metaSource = game.slice(metaStart, game.indexOf('\n', metaStart));
const pathStart = game.indexOf("const p='assets/map/ch'+(+ch+1)+'/'+(d.dir||'floor_objects')+'/'+d.file;");
const pathSource = game.slice(pathStart, game.indexOf('\n', pathStart));
assert.ok(cropStart >= 0 && aspectStart >= 0 && sizeStart >= 0 && metaStart >= 0 && pathStart >= 0);

async function nativeSource(id) {
  const definition = game.match(new RegExp(`\\{id:'${id}',[^\\n]+?\\}`))?.[0];
  assert.ok(definition, `Missing native _CH_DECO definition ${id}`);
  const d = vm.runInNewContext(`(${definition})`);
  const context = { d, ch: '0', _prev: {}, _OBJ_META: {} };
  const relative = vm.runInNewContext(`${metaSource}\n${pathSource}\np;`, context);
  const meta = context._OBJ_META[id]; assert.equal(meta.keepAR, 1);
  // Read only PNG signature + IHDR width/height. No alpha, decoding, atlas or artwork oracle.
  const file = await open(new URL('../' + relative, import.meta.url), 'r'), header = Buffer.alloc(24);
  try { const { bytesRead } = await file.read(header, 0, header.length, 0); assert.equal(bytesRead, 24); }
  finally { await file.close(); }
  assert.deepEqual([...header.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(header.toString('ascii', 12, 16), 'IHDR');
  const image = { naturalWidth: header.readUInt32BE(16), naturalHeight: header.readUInt32BE(20) };
  assert.ok(image.naturalWidth > 0 && image.naturalHeight > 0);
  return { meta, image };
}

function spriteExtent(prop, native) {
  const calls = [], T = scene.tileSize;
  const context = { _meta: native.meta, _spr: native.image, mo: { ...prop, x: prop.x * T, y: prop.y * T },
    X: { drawImage(...args) { calls.push(args); } } };
  // Execute the actual native size, keepAR, and crop consumers to obtain the draw rectangle.
  vm.runInNewContext(`${cropSource}\n${sizeSource}\n${aspectSource}`, context);
  assert.equal(calls.length, 1); assert.equal(calls[0].length, 5, 'These two existing sources use the full PNG crop');
  const [, x, y, width, height] = calls[0];
  assert.ok([x, y, width, height].every(Number.isFinite) && width > 0 && height > 0);
  return { left: x, right: x + width, top: y, bottom: y + height, width, height };
}

function rightFloorBoundary(rect) {
  const T = scene.tileSize;
  let right = -Infinity, intersectingRows = 0;
  for (let y = 0; y < template.mh; y++) {
    if ((y + 1) * T <= rect.top || y * T >= rect.bottom) continue;
    let rowHasFloor = false;
    for (let x = 0; x < template.mw; x++) if (tiles[y * template.mw + x] === 1) {
      right = Math.max(right, (x + 1) * T); rowHasFloor = true;
    }
    if (rowHasFloor) intersectingRows++;
  }
  assert.ok(intersectingRows > 0 && Number.isFinite(right), 'Visibility guard must encounter real playable floor');
  return right;
}
function onFloor(point) {
  return tiles[Math.floor(point.y / scene.tileSize) * template.mw + Math.floor(point.x / scene.tileSize)] === 1;
}
function contains(rect, point) {
  return rect.left <= point.x && point.x <= rect.right && rect.top <= point.y && point.y <= rect.bottom;
}

test('east boundary full-PNG native keepAR width clears the RLE combat pocket and rejects the recorded occluding placement', async () => {
  const source = await nativeSource('m_c1be');
  const prop = template.objs.filter(o => o.id === 'm_c1be').sort((a, b) => b.scale - a.scale)[0];
  assert.ok(prop && prop.fdgUpright);
  const current = spriteExtent(prop, source);
  // Historical negative control from the observed east-route failure, not an expectation of the new coordinate.
  const previous = spriteExtent({ ...prop, x: 54 }, source), observedPlayer = { x: 2031, y: 1578 };
  assert.ok(onFloor(observedPlayer)); assert.ok(contains(previous, observedPlayer)); assert.equal(contains(current, observedPlayer), false);
  assert.ok(previous.left < rightFloorBoundary(previous), 'Old sprite width must reproduce playable-floor intrusion');
  assert.ok(current.left >= rightFloorBoundary(current), 'Current sprite rectangle must stay east of every floor cell in its vertical band');
});

test('north boundary full-PNG native keepAR width clears the RLE exit connection and rejects the old obscured exit marker', async () => {
  const source = await nativeSource('m_c1bn'), prop = template.objs.find(o => o.id === 'm_c1bn');
  assert.ok(prop && prop.fdgUpright);
  const current = spriteExtent(prop, source), previous = spriteExtent({ ...prop, x: 48 }, source);
  const exit = { x: (scene.exit.x + .5) * scene.tileSize, y: (scene.exit.y + .5) * scene.tileSize };
  assert.ok(onFloor(exit)); assert.ok(contains(previous, exit)); assert.equal(contains(current, exit), false);
  assert.ok(previous.left < rightFloorBoundary(previous), 'Old north sprite must overlap the authored exit floor');
  assert.ok(current.left >= rightFloorBoundary(current), 'Current north sprite must clear the whole exit floor band, not just the marker center');
});
