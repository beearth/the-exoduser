import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const geometrySource = readFileSync(new URL('../assets/map/ch1/geometry/ch1_si1_geometry.js', import.meta.url), 'utf8');

function readSi1Props(source) {
  const match = source.match(/const _CH1S1=(\(function\(\)\{[\s\S]*?\}\)\(\));\s*const _MAP_COMPOSE=/);
  assert.ok(match, 'CH1 si1 authored placement block must exist');
  return vm.runInNewContext(match[1]);
}

const props = readSi1Props(gameHtml);
const byId = (id) => props.filter((prop) => prop.id === id);
const geometryContext = {};
vm.createContext(geometryContext);
vm.runInContext(geometrySource, geometryContext);
const geometry = geometryContext.CH1_SI1_GEOMETRY;
const mask = geometry.buildMask();

test('CH1 si1 authored layout is reduced to the 12 geometry-aware placements', () => {
  assert.equal(props.length, 12, 'legacy 75-prop rectangle and sticker-like ground decals must not survive the geometry redesign');
});

test('CH1 si1 classifies every authored object and leaves the large boundary to map geometry', () => {
  const allowedRoles = new Set(['LANDMARK', 'GAMEPLAY', 'COLLISION', 'OCCLUDER', 'VISUAL_ONLY']);
  const allowedRegions = new Set(geometry.regions.map((region) => region.id));
  for (const prop of props) {
    assert.ok(allowedRoles.has(prop.role), `${prop.id} has invalid or missing role ${prop.role}`);
    assert.ok(allowedRegions.has(prop.region), `${prop.id} has invalid or missing region ${prop.region}`);
  }
  const counts = Object.fromEntries([...allowedRoles].map((role) => [role, props.filter((p) => p.role === role).length]));
  assert.deepEqual(counts, { LANDMARK:5, GAMEPLAY:7, COLLISION:0, OCCLUDER:0, VISUAL_ONLY:0 });
  assert.equal(props.filter((prop) => /^m_c1b|^m_c1c[nsew]/.test(prop.id)).length, 0,
    'large forest boundary must not be rebuilt as rows of collidable props');
});

test('CH1 si1 landmark hierarchy matches the final-pass composition', () => {
  for (const id of ['m_c1tree', 'm_c1camp', 'm_c1altar', 'm_c1pool', 'm_c1cocoon']) {
    assert.equal(byId(id).length, 1, `${id} must be authored exactly once`);
  }

  const [tree] = byId('m_c1tree');
  const expected = {
    m_c1tree:geometry.landmarks.tree,
    m_c1camp:geometry.landmarks.camp,
    m_c1altar:geometry.landmarks.altar,
    m_c1pool:geometry.landmarks.toxic,
    m_c1cocoon:geometry.landmarks.cocoon,
  };
  for (const [id, [x, y]] of Object.entries(expected)) {
    assert.deepEqual([byId(id)[0].x, byId(id)[0].y], [x, y], `${id} must match canonical geometry`);
  }
});

test('CH1 si1 authored coordinates already lie on the canonical walkable shape', () => {
  for (const prop of props) {
    assert.equal(mask[prop.y * 200 + prop.x], 1,
      `${prop.role}/${prop.region}/${prop.id} at (${prop.x},${prop.y}) would be snapped by _nearFloor`);
  }
});

test('CH1 si1 keeps the arena cores and the tree bypasses free of authored clutter', () => {
  const intrusive = props.filter((prop) => (
    Math.hypot(prop.x - 115, prop.y - 158) < 13 ||
    geometry.bypassPaths.left.some(([x, y]) => Math.hypot(prop.x - x, prop.y - y) < 5) ||
    geometry.bypassPaths.right.some(([x, y]) => Math.hypot(prop.x - x, prop.y - y) < 5)
  ));
  assert.equal(intrusive.length, 0, `combat/bypass lanes are obstructed by ${intrusive.map((p) => p.id).join(', ')}`);
});

test('CH1 si1 uses only the existing 21 modular source assets', () => {
  const allowedFiles = new Set([
    'bound_n.png', 'bound_s.png', 'bound_w.png', 'bound_e.png',
    'corner_nw.png', 'corner_ne.png', 'corner_sw.png', 'corner_se.png',
    'prop_corpsetree.png',
    'prop_g_battle.png', 'prop_g_root.png', 'prop_g_toxic.png', 'prop_g_corpse.png', 'prop_g_edge.png',
    'prop_camp.png', 'prop_altar.png', 'prop_pool.png', 'prop_cocoon.png',
    'prop_s_pod.png', 'prop_s_root.png', 'prop_s_bone.png',
  ]);
  const decoBlock = gameHtml.match(/const _CH_DECO=\{[\s\S]*?\n\s*1:\[ \/\/ CH2/);
  assert.ok(decoBlock, 'CH1 deco registration block must exist');
  const registrations = [...decoBlock[0].matchAll(/\{id:'(m_c1[^']+)',file:'([^']+)'/g)];
  assert.ok(registrations.length > 0, 'CH1 modular assets must be registered');
  for (const [, id, file] of registrations) {
    assert.ok(allowedFiles.has(file), `${id} introduces non-approved source asset ${file}`);
  }
});

test('CH1 si1 disables the automatic center landmark fallback', () => {
  const compose = gameHtml.match(/const _MAP_COMPOSE=\{[\s\S]*?\n\s*1:\{([\s\S]*?)\n\s*\},\n\s*2:\{/);
  assert.ok(compose, 'CH1 si1 compose entry must exist');
  assert.match(compose[1], /lm:\[\]/, 'authored si1 must not add m_eye_tree at map center');
});
