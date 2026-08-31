import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function readStageOneCompose(source) {
  const match = source.match(/0:\{hand:1,([\s\S]*?)\n\s*\},\n\s*1:\{/);
  assert.ok(match, 'CH1 1-1 compose entry must exist');
  return match[1];
}

function readHandProps(source) {
  const block = source.match(/\/\/ CH1-1 HAND PROPS START([\s\S]*?)\/\/ CH1-1 HAND PROPS END/);
  assert.ok(block, 'CH1 1-1 hand-prop block must exist');
  return [...block[1].matchAll(/\{id:'([^']+)',x:(\d+),y:(\d+)(?:,scale:([\d.]+))?\}/g)].map(([, id, x, y, scale]) => ({
    id,
    x: Number(x),
    y: Number(y),
    scale: scale ? Number(scale) : 1,
  }));
}

const compose = readStageOneCompose(gameHtml);
const props = readHandProps(gameHtml);
const byId = (id) => props.filter((prop) => prop.id === id);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const isStructural = (prop) => /^m_c1b|^m_c1c[nsew]/.test(prop.id);
const isGround = (prop) => /^m_c1g/.test(prop.id);
const authoredSupport = props.filter((prop) => !isStructural(prop) && !isGround(prop));

function assertAnchor(id, target, tolerance) {
  assert.equal(byId(id).length, 1, `${id} must appear exactly once`);
  const [prop] = byId(id);
  assert.ok(distance(prop, target) <= tolerance,
    `${id} must remain near (${target.x},${target.y}), got (${prop.x},${prop.y})`);
}

test('CH1 1-1 is authored-only and disables every automatic filler path', () => {
  assert.match(compose, /dense:1/, 'authored placements must not be skipped by the proximity grid');
  assert.match(compose, /lm:\[\]/, 'the center fallback landmark must be disabled');
  assert.match(compose, /mega:\[\]/, 'legacy mega silhouettes must not be injected');
  assert.match(gameHtml, /if\(G\.stage===0&&\!\(_cmp&&_cmp\.hand\)\)\{/,
    'the stage-zero 20x20 floor-deco carpet must be gated off for hand-authored composition');
  assert.doesNotMatch(gameHtml, /DECO_FORCE_AUTO=true/);
  assert.match(gameHtml, /\(G\.stage===0\|\|\(G\.stage>=10&&G\.stage<=13\)\).*H\.scale/,
    'stage-zero authored props must forward per-instance scale without changing other stages');
});

test('CH1 1-1 reproduces the miniature landmark and side-region anchors', () => {
  assertAnchor('m_c1tree', { x: 102, y: 90 }, 5);
  assertAnchor('m_cage_gate', { x: 100, y: 188 }, 9);
  assertAnchor('m_c1cocoon', { x: 47, y: 50 }, 7);
  assertAnchor('m_c1camp', { x: 45, y: 100 }, 7);
  assertAnchor('m_bone_arch', { x: 35, y: 150 }, 8);
  assertAnchor('m_c1altar', { x: 147, y: 97 }, 7);
  assertAnchor('m_c1pool', { x: 167, y: 43 }, 1);
  assertAnchor('pit_poison', { x: 162, y: 139 }, 7);

  for (const [id, minScale, maxScale] of [
    ['m_cage_gate', 1.15, 1.25],
    ['m_c1cocoon', 1.45, 1.65],
    ['m_c1camp', 1.45, 1.65],
    ['m_c1altar', 1.35, 1.55],
    ['m_c1pool', 1.45, 1.65],
  ]) {
    const [prop] = byId(id);
    assert.ok(prop.scale >= minScale && prop.scale <= maxScale,
      `${id} must carry secondary-landmark weight (${minScale}-${maxScale}), got ${prop.scale}`);
  }
  const [gate] = byId('m_cage_gate');
  const spawnDistancePx = Math.hypot((100.5 - (gate.x + 0.5)) * 40, (185.5 - (gate.y + 0.5)) * 40);
  const gateCollisionRadiusPx = 300 * 0.4 * gate.scale;
  assert.ok(spawnDistancePx > gateCollisionRadiusPx + 12,
    `START must clear the scaled gate collision by a player radius (${spawnDistancePx.toFixed(1)} <= ${(gateCollisionRadiusPx + 12).toFixed(1)})`);
  assert.ok(gate.y <= 188, 'START gate must remain in the last reliably rendered south culling row');
});

test('CH1 1-1 keeps the central combat clearing and START-to-EXIT axis open', () => {
  const groundIds = /^m_c1g/;
  const structuralIds = /^m_c1b|^m_c1c[nsew]/;
  const hero = byId('m_c1tree')[0];
  assert.ok(hero, 'central corpse tree is required');

  const centralIntruders = props.filter((prop) => {
    if (prop === hero || groundIds.test(prop.id)) return false;
    return distance(prop, hero) < 28;
  });
  assert.deepEqual(centralIntruders, [], 'the central corpse tree must read alone inside a broad combat clearing');

  const southAxisBlockers = props.filter((prop) => (
    !groundIds.test(prop.id) && !structuralIds.test(prop.id) &&
    prop.id !== 'm_c1tree' && prop.id !== 'm_cage_gate' &&
    prop.x >= 82 && prop.x <= 122 && prop.y >= 118 && prop.y <= 184
  ));
  assert.deepEqual(southAxisBlockers, [], 'START-to-center approach must remain open');

  const northAxisBlockers = props.filter((prop) => (
    !groundIds.test(prop.id) && !structuralIds.test(prop.id) &&
    prop.x >= 82 && prop.x <= 122 && prop.y >= 8 && prop.y <= 58
  ));
  assert.deepEqual(northAxisBlockers, [], 'center-to-EXIT wasteland must remain open');
});

test('CH1 1-1 uses the baked forest silhouette without modular boundary rows', () => {
  const boundary = props.filter((prop) => /^m_c1b|^m_c1c[nsew]/.test(prop.id));
  assert.deepEqual(boundary, [], 'the continuous baked forest and tile mask replace all modular vine rows');

  const boundaryCounts = new Map();
  for (const prop of boundary) boundaryCounts.set(prop.id, (boundaryCounts.get(prop.id) || 0) + 1);
  for (const [id, count] of boundaryCounts) {
    assert.ok(count <= 12, `${id} repeats ${count} times; use irregular mixed silhouettes instead`);
  }
  const falseGateWalls = boundary.filter((prop) => /^m_c1bs/.test(prop.id) && prop.y >= 180);
  assert.deepEqual(falseGateWalls, [], 'south-bound modules contain doors and must not create duplicate START gates');
  assert.equal(byId('m_c1cse').length, 0, 'corner_se has an opaque backing and must not contaminate the overview');

  const heroIds = [
    'm_c1tree', 'm_c1camp', 'm_c1altar', 'm_c1pool', 'm_c1cocoon',
    'm_cage_gate', 'm_bone_arch', 'm_hang_cage', 'm_sword_pile',
    'm_rotten_tree', 'm_skull_altar', 'm_obelisk', 'm_penta_circle',
    'm_eye_tree', 'm_vine_pillar', 'm_skull_totem',
  ];
  for (const id of heroIds) assert.ok(byId(id).length <= 1, `${id} large silhouette is repeated`);
  assert.ok(props.length <= 126, `reference composition is overcrowded: ${props.length} authored props`);
});

test('CH1 1-1 keeps the route as negative space instead of oversized or dotted floor patches', () => {
  const routeMasses = props.filter((prop) => /^m_c1gbattle/.test(prop.id));
  assert.equal(routeMasses.length, 0, `grey battle-floor islands must not cover the main route, got ${routeMasses.length}`);
  assert.equal(byId('m_c1gpath').length + byId('m_c1gpathf').length, 0,
    'small floor patches create a dotted path and must not return');
  assert.equal(byId('m_c1gpock').length, 0, 'isolated grey POI disks must not return');
  const oversizedGround = props.filter((prop) => /^m_c1g/.test(prop.id) && prop.scale > 1.25);
  assert.deepEqual(oversizedGround, [], 'ground overlays must remain local and must not become low-resolution plates');
  assertAnchor('m_penta_circle', { x: 147, y: 96 }, 3);
});

test('CH1 1-1 keeps the reference density contrast between center and outer thirds', () => {
  const center = props.filter((prop) => prop.x >= 67 && prop.x <= 133 && prop.y >= 55 && prop.y <= 150);
  const outer = props.filter((prop) => prop.x < 45 || prop.x > 155 || prop.y < 35 || prop.y > 170);
  assert.ok(center.length <= 16, `central negative space is too dense: ${center.length}`);
  assert.ok(outer.length >= center.length * 2, `outer silhouette must be visibly denser than the center (${outer.length}/${center.length})`);
});

test('CH1 1-1 keeps authored scenes after absorbing modular vines into forest geometry', () => {
  assert.equal(props.length, 63, 'the 59 obsolete modular boundary props and buried east eye-tree are absorbed into baked forest plus tile geometry');
  assert.equal(props.filter(isStructural).length, 0, 'no modular vine collider may remain');
  assert.deepEqual(byId('m_eye_tree'), [], 'the east eye-tree must not remain as a dead authored prop behind the forest wall');
  assert.deepEqual(byId('m_c1tree')[0], { id: 'm_c1tree', x: 102, y: 90, scale: 1 });
  assert.deepEqual(byId('m_cage_gate')[0], { id: 'm_cage_gate', x: 103, y: 188, scale: 1.2 });
  assert.deepEqual(byId('corpse').find((prop) => prop.y >= 170), { id: 'corpse', x: 124, y: 179, scale: 1 });
  assert.deepEqual(byId('m_vine_pillar')[0], { id: 'm_vine_pillar', x: 29, y: 158, scale: 1 });
  assert.deepEqual(byId('m_c1gtoxic')[0], { id: 'm_c1gtoxic', x: 168, y: 40, scale: 1 });
  assert.deepEqual(byId('m_c1pool')[0], { id: 'm_c1pool', x: 167, y: 43, scale: 1.55 });
  assert.deepEqual(byId('m_meat')[0], { id: 'm_meat', x: 164, y: 47, scale: 1 });
  assert.deepEqual(byId('m_puddle').find((prop) => prop.x > 150 && prop.y < 80), { id: 'm_puddle', x: 164, y: 53, scale: 1 });

  const sceneSupport = (x1, x2, y1, y2) => authoredSupport.filter((prop) => (
    prop.x >= x1 && prop.x <= x2 && prop.y >= y1 && prop.y <= y2
  ));
  const startEdges = [
    ...sceneSupport(68, 81, 170, 187),
    ...sceneSupport(124, 136, 170, 187),
  ];
  const lowerEdges = [
    ...sceneSupport(68, 81, 140, 165),
    ...sceneSupport(124, 136, 140, 165),
  ];
  const northFrames = [
    ...sceneSupport(68, 81, 24, 46),
    ...sceneSupport(124, 136, 24, 46),
  ];
  assert.ok(startEdges.length >= 4 && startEdges.length <= 7,
    `START forecourt needs a restrained 4-7 prop edge scene, got ${startEdges.length}`);
  assert.ok(lowerEdges.length >= 4 && lowerEdges.length <= 7,
    `LOWER transition needs a restrained 4-7 prop edge scene, got ${lowerEdges.length}`);
  assert.ok(northFrames.length >= 4 && northFrames.length <= 7,
    `NORTH approach needs a restrained 4-7 prop frame, got ${northFrames.length}`);

  const hero = byId('m_c1tree')[0];
  const heroRing = authoredSupport.filter((prop) => {
    const d = distance(prop, hero);
    return d >= 28 && d <= 39 && prop.y >= 72 && prop.y <= 116;
  });
  assert.ok(heroRing.length >= 4 && heroRing.length <= 8,
    `CENTER clearing needs a sparse asymmetric 4-8 prop outer ring, got ${heroRing.length}`);

  for (const [id, anchor, min, max] of [
    ['m_c1camp', { x: 45, y: 100 }, 3, 7],
    ['m_c1altar', { x: 147, y: 97 }, 3, 7],
    ['m_c1cocoon', { x: 47, y: 50 }, 3, 7],
    ['m_c1pool', { x: 167, y: 43 }, 3, 7],
    ['pit_poison', { x: 162, y: 139 }, 3, 7],
  ]) {
    const cluster = authoredSupport.filter((prop) => distance(prop, anchor) <= 13);
    assert.ok(cluster.length >= min && cluster.length <= max,
      `${id} must read as one ${min}-${max} prop event cluster, got ${cluster.length}`);
  }

  const treeScales = new Set(props.filter((prop) => /^m_ctree/.test(prop.id)).map((prop) => prop.scale));
  assert.ok(treeScales.size >= 6, `outer tree silhouettes need at least six scale variants, got ${treeScales.size}`);
});
