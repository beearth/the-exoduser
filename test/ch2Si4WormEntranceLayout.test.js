import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function readSi4Props(source) {
  const match = source.match(/const _CH2S4=(\(function\(\)\{[\s\S]*?\}\)\(\));\s*const _MAP_COMPOSE=/);
  assert.ok(match, 'CH2 si4 authored placement block must exist');
  return vm.runInNewContext(match[1]);
}

const props = readSi4Props(gameHtml);
const byId = (id) => props.filter((prop) => prop.id === id);
const collidableIds = new Set([
  'm_c2p1', 'm_c2p1b', 'm_c2p2', 'm_c2hive', 'm_c2webp', 'm_c2webpf', 'm_c2pit', 'm_c2edge', 'm_c2edgef',
  'm_c2edgeS', 'm_c2edgeSf', 'm_c2edgeL', 'm_c2edgeLf',
]);
const megaBoundaryIds = new Set([
  'm_c2curveL', 'm_c2curveR', 'm_c2brokenMega', 'm_c2hiveWall', 'm_c2slimeCliff',
  'm_c2chitinArch', 'm_c2deepHive', 'm_c2exitFrame', 'm_c2ridgeL', 'm_c2ridgeR',
]);
const wallBeltFillerIds = new Set([
  'm_c2midRidgeL', 'm_c2midRidgeR', 'm_c2midJaw', 'm_c2midRib', 'm_c2midHive',
]);
const wallBeltBackfillIds = new Set([
  'm_c2backRidgeL', 'm_c2backRidgeR', 'm_c2backJaw', 'm_c2backHive',
  'm_c2skinHookL', 'm_c2skinHookR', 'm_c2skinRibArc',
  'm_c2skinWebArc', 'm_c2skinJawArc', 'm_c2skinDepthArch',
]);
const newWallSkinIds = new Set([
  'm_c2skinHookL', 'm_c2skinHookR', 'm_c2skinRibArc',
  'm_c2skinWebArc', 'm_c2skinJawArc', 'm_c2skinDepthArch',
]);
const wallBeltSeamIds = new Set(['m_c2seamWeb', 'm_c2seamChitin', 'm_c2seamEgg']);
const structuralIds = new Set([...collidableIds, ...megaBoundaryIds]);
const collidable = props.filter((prop) => collidableIds.has(prop.id));

function readPathBuilder(source) {
  const match = source.match(/function _rleEncodeGrid[\s\S]*?(?=function _buildBasinRLE)/);
  assert.ok(match, 'production walk-path builder block must exist');
  return vm.runInNewContext(`(()=>{${match[0]};return _buildWalkPathRLE})()`);
}

function decodeRle(rle, size) {
  const grid = new Uint8Array(size);
  let cursor = 0;
  for (let i = 0; i < rle.length; i += 2) {
    grid.fill(rle[i], cursor, cursor + rle[i + 1]);
    cursor += rle[i + 1];
  }
  assert.equal(cursor, size, 'walk-path RLE must cover the complete map');
  return grid;
}

function readSoilEdgeAlpha(source, stage) {
  const match = source.match(/function _soilEdgeA[\s\S]*?(?=function _fillVoidWithFloor)/);
  assert.ok(match, 'production soil-edge alpha function must exist');
  return vm.runInNewContext(`(()=>{const G={stage:${stage}};const MAP_ALL_FLOOR=true;${match[0]};return _soilEdgeA})()`);
}

test('CH2 si4 floor cleanup never turns a valid walkable edge tile into a black square', () => {
  const map = [
    [1, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ];
  assert.equal(readSoilEdgeAlpha(gameHtml, 4)(1, 1, 3, 3, map), 1,
    'CH2-1 walkable floor must stay opaque at the visual edge; collision remains in the unchanged map grid');
  assert.equal(readSoilEdgeAlpha(gameHtml, 5)(1, 1, 3, 3, map), 0,
    'the cleanup must not silently change shared floor-edge rendering for other stages');
});

test('CH2 si4 renders one continuous organic floor mask without changing collision tiles', () => {
  const trace = gameHtml.match(/function _traceCh2AuthoredFloor[\s\S]*?(?=function _paintCh2OrganicFloorDetail)/);
  assert.ok(trace, 'CH2-1 needs a render-only vector floor silhouette');
  assert.match(trace[0], /lineCap='round'/);
  assert.match(trace[0], /lineJoin='round'/);
  assert.match(trace[0], /lineWidth=\(spec\.w\+4\)\*T/,
    'visual floor may overscan the collision path by two tiles per side to hide transparent mega-wall seams');
  assert.match(trace[0], /steps=Math\.max/,
    'the floor mask must sample each authored segment without opposite-winding strip polygons');
  assert.match(trace[0], /const organicRadius=radius\+T\*/,
    'the visual rim must vary smoothly at sub-tile scale instead of exposing a mathematical diagonal');
  assert.match(trace[0], /c\.arc\(x,y,organicRadius,0,Math\.PI\*2\)/,
    'same-direction variable-radius circle subpaths must form a hole-free organic floor union');
  assert.doesNotMatch(trace[0], /c\.lineTo\(/,
    'mixed-winding strip polygons create triangular void holes where the S-curve overlaps');
  assert.equal((gameHtml.match(/_traceCh2AuthoredFloor\(c,/g) || []).length, 4,
    'the helper definition plus deferred, synchronous, and streamed floor caches must share the same visual mask');
  assert.equal((gameHtml.match(/v===1&&G\.stage!==4/g) || []).length, 2,
    'both deferred and streamed wall fallbacks must not repaint black squares over the CH2-1 floor mask');
  assert.match(gameHtml, /else if\(G\.stage!==4\)\{c\.fillStyle='#000000';c\.fillRect\(px,py,T,T\)\}/,
    'the synchronous wall autotile pass must not repaint black collision squares over the CH2-1 visual floor');
  assert.match(gameHtml, /if\(G\.stage===4\)continue;\/\/ CH2-1 boundary is authored by mega walls/,
    'CH2-1 must skip the per-cell wall decoration pass that reveals the collision grid as a staircase');
  const pathBg = gameHtml.match(/function _fillPathBg[\s\S]*?(?=let _skullWallPat)/);
  assert.ok(pathBg, 'shared void background renderer must exist');
  assert.match(pathBg[0], /if\(G\.stage===4\)\{[\s\S]*?_gtFloorImg\(1\)[\s\S]*?fillRect\(ox,oy,dw,dh\);[\s\S]*?return/,
    'CH2-1 void must be one continuous darkened CH2 floor field, never a per-cell wall mask');
  assert.match(gameHtml, /if\(G\.stage===4\)_fillPathBg\(c,map,0,0,mw,mh,false\);/,
    'the synchronous 8000px cache must paint the continuous CH2 void base before the organic floor');
  assert.doesNotMatch(trace[0], /map\[[^\]]+\][^=]*=/,
    'floor cleanup must never mutate gameplay collision or routing');
});

test('CH2 si4 adds only deterministic render-only organic floor variation', () => {
  const detail = gameHtml.match(/function _paintCh2OrganicFloorDetail[\s\S]*?(?=function _fillVoidWithFloor)/);
  assert.ok(detail, 'CH2-1 needs a dedicated render-only floor-detail pass');
  assert.match(detail[0], /G\.stage!==4/, 'the extra floor variation must stay isolated to CH2-1');
  assert.match(detail[0], /c\.ellipse\(/, 'broad organic stains must use curved marks rather than square tiles');
  assert.match(detail[0], /c\.quadraticCurveTo\(/, 'subtle veins must break up the uniform green field');
  assert.doesNotMatch(detail[0], /fillRect\(/, 'organic floor detail must never introduce another rectangular patch');
  assert.doesNotMatch(detail[0], /MAP_OBJS|G\.map[^;]*=/,
    'floor variation must not add authored objects or mutate collision');
  assert.equal((gameHtml.match(/_paintCh2OrganicFloorDetail\(c,/g) || []).length, 4,
    'the helper definition plus deferred, synchronous, and streamed floor caches must share the same detail pass');
  const halo = gameHtml.match(/function _paintCh2OrganicFloorHalo[\s\S]*?(?=function _fillVoidWithFloor)/);
  assert.ok(halo, 'the already-collidable path rim needs a soft organic depth band');
  assert.match(halo[0], /lineCap='round'/);
  assert.match(halo[0], /shadowBlur=T\*2\.4/, 'the collision rim must feather into the dark void rather than expose a hard diagonal');
  assert.doesNotMatch(halo[0], /fillRect\(|MAP_OBJS|G\.map[^;]*=/,
    'the rim treatment must stay render-only and non-rectangular');
  assert.match(gameHtml, /_paintCh2OrganicFloorHalo\(c,local\?-tx0\*T:0,local\?-ty0\*T:0\)/,
    'all CH2 cache paths must receive the same world-aligned halo through the shared void renderer');
});

test('CH2 si4 renders a continuous curved collision rim over long floor cutoffs', () => {
  const block = gameHtml.match(/function _traceCh2OrganicFloorSide[\s\S]*?(?=function _fillVoidWithFloor)/);
  assert.ok(block, 'CH2-1 needs a dedicated curved collision-rim renderer');

  const calls = [];
  const context = {
    save() {}, restore() {}, beginPath() { calls.push(['beginPath']); },
    moveTo(x, y) { calls.push(['moveTo', x, y]); },
    quadraticCurveTo(cx, cy, x, y) { calls.push(['quadraticCurveTo', cx, cy, x, y]); },
    stroke() { calls.push(['stroke', this.strokeStyle, this.lineWidth]); },
    setLineDash(value) { calls.push(['setLineDash', ...value]); },
  };
  const renderRim = vm.runInNewContext(`(()=>{
    const G={stage:4};
    const T=40;
    const _MAP_COMPOSE={4:{path:{w:30,pts:[[76,68],[72,56],[88,46]]}}};
    ${block[0]}
    return _paintCh2OrganicCollisionRim;
  })()`);

  assert.equal(renderRim(context, 0, 0), true);
  assert.ok(calls.filter((call) => call[0] === 'quadraticCurveTo').length >= 12,
    'both collision shoulders must be sampled into smooth curves instead of one mathematical diagonal');
  assert.ok(calls.filter((call) => call[0] === 'stroke').length >= 6,
    'the rim needs layered shadow, shell body, and highlight strokes on both sides');
  assert.equal(calls.some((call) => call[0] === 'rect' || call[0] === 'fillRect'), false,
    'collision-rim rendering must never expose tile rectangles');
  assert.match(gameHtml, /_paintCh2OrganicCollisionRim\(c,local\?-tx0\*T:0,local\?-ty0\*T:0\)/,
    'the continuous rim must be painted in the shared CH2 void pass before the bright floor mask');
  assert.doesNotMatch(block[0], /MAP_OBJS|G\.map[^;]*=/,
    'the visual rim must not add authored objects or mutate collision');
});

test('CH2 si4 authored-only floor masks and vertical supports never leak into off-path auto scatter', () => {
  const decoBlock = gameHtml.match(/\n\s*1:\[ \/\/ CH2 벌레굴[\s\S]*?\n\s*\],\n\s*2:\[ \/\/ CH3/);
  assert.ok(decoBlock);
  assert.match(decoBlock[0], /id:'m_c2floorpatch'[^\n]*authoredOnly:1/,
    'ground.png mask is a boss-gate repair tool, never a square automatic floor object');
  assert.match(gameHtml, /const _baseDeco=_chDeco\.filter\(d=>!d\.userProvided&&!d\.authoredOnly\)/,
    'all generic automatic pools must exclude authored-only repair masks');
  assert.match(gameHtml, /if\(_cmp&&_cmp\.path&&!_cmp\.path\.paint&&!\(_cmp\.hand&&_cmp\.dense\)\)\{/,
    'a dense hand-authored path must not receive hidden off-path large or small objects');
  assert.match(gameHtml, /const _eyeCompose=_MAP_COMPOSE\[G\.stage\]\|\|null;[\s\S]*?!\(_eyeCompose&&_eyeCompose\.hand&&_eyeCompose\.dense\)/,
    'a dense hand-authored path must not receive random wall eyes, including HUD-sized scale outliers');
});

test('CH2 si4 reduces the actually visible repeated medium vertical set by 20 to 30 percent', () => {
  const verticalIds = new Set(['m_c2p1', 'm_c2p1b', 'm_c2p2', 'm_c2webp', 'm_c2webpf']);
  const authoredVertical = props.filter((prop) => verticalIds.has(prop.id));
  const runtimeBeforeCleanup = 57;
  assert.equal(authoredVertical.length, 42,
    'reviewed authored clusters must contain 42 medium vertical supports after automatic leakage is disabled');
  const reduction = 1 - authoredVertical.length / runtimeBeforeCleanup;
  assert.ok(reduction >= 0.20 && reduction <= 0.30,
    `runtime-visible vertical reduction must be 20..30%, got ${(reduction * 100).toFixed(1)}%`);
  assert.equal(props.filter((prop) => megaBoundaryIds.has(prop.id)).length, 17,
    'the vertical cleanup must not remove or add any locked MEGA mass');
});

test('CH2 si4 worm entrance is rebuilt from mega silhouettes instead of authored-count inflation', () => {
  assert.equal(props.length, 109, 'the locked 78-entry layout plus 9 BACK/MID underlays, 12 front fillers, and 10 seam decals must total 109 deliberate placements');

  const roleCounts = Object.fromEntries(['backfill', 'boundary', 'landmark', 'detail', 'mask', 'filler', 'seam'].map((role) => [role, props.filter((prop) => prop.role === role).length]));
  assert.deepEqual(roleCounts, { backfill: 9, boundary: 50, landmark: 18, detail: 6, mask: 4, filler: 12, seam: 10 });
  assert.equal(Object.values(roleCounts).reduce((sum, count) => sum + count, 0), props.length, 'every placement must declare its visual or technical role');
  const lockedVisualCount = roleCounts.boundary + roleCounts.landmark + roleCounts.detail;
  assert.ok(roleCounts.boundary / lockedVisualCount >= 0.60 && roleCounts.boundary / lockedVisualCount <= 0.70,
    `locked boundary/environment share must remain 60..70%, got ${roleCounts.boundary}/${lockedVisualCount}`);
  assert.ok(roleCounts.landmark / lockedVisualCount >= 0.20 && roleCounts.landmark / lockedVisualCount <= 0.30,
    `locked landmark share must remain 20..30%, got ${roleCounts.landmark}/${lockedVisualCount}`);
  assert.ok(roleCounts.detail / lockedVisualCount <= 0.10,
    `locked small-detail share must remain at or below 10%, got ${roleCounts.detail}/${lockedVisualCount}`);

  for (const prop of props.filter((entry) => entry.role === 'boundary')) {
    assert.ok(structuralIds.has(prop.id), `boundary entry must use a structural CH2 asset: ${JSON.stringify(prop)}`);
  }
  for (const prop of props.filter((entry) => entry.role === 'detail')) {
    assert.ok(!collidableIds.has(prop.id), `detail entry must not narrow combat space: ${JSON.stringify(prop)}`);
  }
});

test('CH2 si4 forms one authored wall belt with MID connectors and seam-only decals', () => {
  const backfills = props.filter((prop) => prop.role === 'backfill');
  const fillers = props.filter((prop) => prop.role === 'filler');
  const seams = props.filter((prop) => prop.role === 'seam');
  assert.equal(backfills.length, 9, 'the four priority belts need eight underlays plus one reported collision-recess repair');
  assert.equal(fillers.length, 12, 'wall density pass must stay a controlled 12-piece MID kit, not another MEGA scatter');
  assert.equal(seams.length, 10, 'every priority belt section needs a small number of seam finishers');
  assert.ok(backfills.every((prop) => wallBeltBackfillIds.has(prop.id)), 'backfills must use broad shell/hive/jaw underlay art only');
  assert.ok(fillers.every((prop) => wallBeltFillerIds.has(prop.id)), 'fillers must use curved shell/rib/hive/jaw connector art only');
  assert.ok(seams.every((prop) => wallBeltSeamIds.has(prop.id)), 'seams must use web/chitin/egg surface decals only');
  assert.ok([...backfills, ...fillers, ...seams].every((prop) => Number.isFinite(prop.rot)), 'wall-belt pieces must declare asymmetrical authored rotation');
  assert.equal([...backfills, ...fillers, ...seams].filter((prop) => ['m_c2p1', 'm_c2p1b', 'm_c2p2', 'm_c2webp', 'm_c2webpf'].includes(prop.id)).length, 0,
    'the wall belt must not reintroduce the repeated vertical-pillar vocabulary');

  const firstLockedMega = props.findIndex((prop) => megaBoundaryIds.has(prop.id));
  const lastBackfill = props.reduce((last, prop, index) => prop.role === 'backfill' ? index : last, -1);
  assert.ok(lastBackfill >= 0 && lastBackfill < firstLockedMega,
    'subdued BACK/MID underlays must render before the locked MEGA layer instead of covering the approved giant structures');

  const expectedZones = {
    top_chamber: { backfill: 2, filler: 3, seam: 2 },
    central_bridge: { backfill: 2, filler: 3, seam: 3 },
    east_pocket_belt: { backfill: 2, filler: 3, seam: 2 },
    lower_chamber_belt: { backfill: 2, filler: 3, seam: 3 },
  };
  for (const [zone, expected] of Object.entries(expectedZones)) {
    assert.equal(backfills.filter((prop) => prop.zone === zone).length, expected.backfill, `${zone} BACK/MID underlay count`);
    assert.equal(fillers.filter((prop) => prop.zone === zone).length, expected.filler, `${zone} MID filler count`);
    assert.equal(seams.filter((prop) => prop.zone === zone).length, expected.seam, `${zone} seam decal count`);
  }

  const mega = props.filter((prop) => megaBoundaryIds.has(prop.id));
  const connectors = [...backfills, ...fillers];
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  for (const prop of backfills) {
    assert.ok(mega.some((anchor) => distance(prop, anchor) <= 24),
      `BACK/MID underlay must overlap a locked MEGA shoulder instead of becoming an asset island: ${JSON.stringify(prop)}`);
    assert.ok(connectors.some((other) => other !== prop && distance(prop, other) <= 24),
      `BACK/MID underlay must continue into another connector: ${JSON.stringify(prop)}`);
  }
  for (const prop of seams) {
    const junctions = [...mega, ...connectors].filter((structure) => distance(prop, structure) <= 18);
    assert.ok(junctions.length >= 2,
      `seam decal must finish a real two-structure junction, not float on the floor: ${JSON.stringify(prop)}`);
  }

  const protectedCores = [
    ['START', (p) => p.x >= 88 && p.x <= 112 && p.y >= 174],
    ['lower route', (p) => p.x >= 68 && p.x <= 100 && p.y >= 145 && p.y <= 168],
    ['egg arena', (p) => p.x >= 74 && p.x <= 98 && p.y >= 136 && p.y <= 156],
    ['east pocket', (p) => p.x >= 116 && p.x <= 138 && p.y >= 124 && p.y <= 134],
    ['slime bypass', (p) => p.x >= 82 && p.x <= 104 && p.y >= 80 && p.y <= 96],
    ['bent route', (p) => p.x >= 74 && p.x <= 100 && p.y >= 62 && p.y <= 80],
    ['deep arena', (p) => p.x >= 86 && p.x <= 114 && p.y >= 34 && p.y <= 56],
    ['EXIT', (p) => p.x >= 94 && p.x <= 108 && p.y <= 34],
  ];
  for (const [name, inside] of protectedCores) {
    assert.equal([...backfills, ...fillers].filter(inside).length, 0, `${name} must remain free of BACK/MID wall centers`);
  }

  const decoBlock = gameHtml.match(/\n\s*1:\[ \/\/ CH2 벌레굴[\s\S]*?\n\s*\],\n\s*2:\[ \/\/ CH3/);
  assert.ok(decoBlock);
  for (const id of [...wallBeltBackfillIds, ...wallBeltFillerIds, ...wallBeltSeamIds]) {
    const line = decoBlock[0].match(new RegExp(`\\{id:'${id}'[^\\n]+`));
    assert.ok(line, `${id} must be registered in the CH2-owned asset kit`);
    assert.match(line[0], /authoredOnly:1/, `${id} must never enter automatic scatter`);
    assert.doesNotMatch(line[0], /(?:^|,)col:1|collision:1/, `${id} must stay visual-only so collision semantics do not change`);
  }
  for (const id of wallBeltBackfillIds) {
    const line = decoBlock[0].match(new RegExp(`\\{id:'${id}'[^\\n]+`));
    assert.match(line[0], /alpha:\.(?:6[5-9]|7[0-5])/, `${id} must stay subdued behind the locked MEGA layer`);
    assert.doesNotMatch(line[0], /large:1|mega:1/, `${id} is connector underlay, never a new MEGA structure`);
  }
});

test('CH2 si4 closes the reported right collision recess without widening the route', () => {
  const recess = props.filter((prop) => prop.zone === 'central_right_recess');
  assert.equal(recess.length, 1,
    'the depth-arch/chitin-arch junction needs one deliberate BACK mass, not a scatter cluster');
  assert.equal(JSON.stringify(recess[0]), JSON.stringify({
    id: 'm_c2backHive', x: 112, y: 70, rot: 8, overlap: 0.16,
    role: 'backfill', zone: 'central_right_recess',
  }));
  assert.ok(!collidableIds.has(recess[0].id),
    'the repair must only clarify the existing tile boundary, never add a prop collider');
  assert.ok(Math.hypot(recess[0].x - 108, recess[0].y - 82) <= 14,
    'the BACK mass must overlap the supplied depth arch instead of becoming a new island');
  assert.ok(Math.hypot(recess[0].x - 104, recess[0].y - 74) <= 10,
    'the BACK mass must bridge into the existing chitin arch at the reported seam');
});

test('CH2 si4 replaces six BACK slots with the supplied RGBA wall-connection kit', () => {
  const backfills = props.filter((prop) => prop.role === 'backfill');
  const supplied = backfills.filter((prop) => newWallSkinIds.has(prop.id));
  assert.equal(backfills.length, 9, 'the supplied kit keeps its six replacement slots; the ninth BACK is the reported recess repair');
  assert.equal(supplied.length, 6, 'all six supplied wall skins must be used exactly once');
  assert.equal(new Set(supplied.map((prop) => prop.id)).size, 6, 'the wall kit must vary silhouette instead of repeating one image');
  assert.ok(supplied.every((prop) => prop.overlap >= 0.10 && prop.overlap <= 0.20),
    'every supplied wall skin must declare a 10..20% interlocking overlap instead of tile-edge snapping');
  assert.ok(props.find((prop) => prop.id === 'm_c2skinWebArc').x >= 158,
    'the east wall skin anchor must stay outside the playable pocket instead of visually swallowing its center');
  for (const zone of new Set(supplied.map((prop) => prop.zone))) {
    assert.ok(props.some((prop) => prop.zone === zone && prop.role === 'filler'), `${zone} supplied skin needs a MID filler bridge`);
    assert.ok(props.some((prop) => prop.zone === zone && prop.role === 'seam'), `${zone} supplied skin needs web/slime/egg seam finishing`);
  }

  const expectedFiles = {
    m_c2skinHookL: 'wall_skin_hook_l.png',
    m_c2skinHookR: 'wall_skin_hook_r.png',
    m_c2skinRibArc: 'wall_skin_rib_arc.png',
    m_c2skinWebArc: 'wall_skin_web_arc.png',
    m_c2skinJawArc: 'wall_skin_jaw_arc.png',
    m_c2skinDepthArch: 'wall_skin_depth_arch.png',
  };
  for (const [id, file] of Object.entries(expectedFiles)) {
    assert.match(gameHtml, new RegExp(`\\{id:'${id}',file:'${file}'[^\\n]+authoredOnly:1`), `${id} must be a CH2-owned authored-only asset`);
    const png = readFileSync(new URL(`../assets/map/ch2/mega/${file}`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG', `${file} must be a valid PNG`);
    assert.equal(png.readUInt32BE(16), 1254, `${file} width must preserve the supplied source`);
    assert.equal(png.readUInt32BE(20), 1254, `${file} height must preserve the supplied source`);
    assert.equal(png[25], 6, `${file} must retain RGBA rather than bake a black rectangle`);
  }
  assert.equal(props.length, 109, 'the six supplied replacements plus one explicit recess repair must total 109 authored entries');
});

test('CH2 si4 preserves the six-stage landmark flow from the refined reference', () => {
  const zoneCounts = Object.fromEntries([
    'entrance', 'lower_tunnel', 'egg_plaza', 'east_dead_end', 'slime_hollow', 'bent_tunnel', 'deep_cave', 'boss_gate',
  ].map((zone) => [zone, props.filter((prop) => prop.zone === zone).length]));
  assert.deepEqual(zoneCounts, {
    entrance: 10,
    lower_tunnel: 7,
    egg_plaza: 12,
    east_dead_end: 8,
    slime_hollow: 12,
    bent_tunnel: 7,
    deep_cave: 8,
    boss_gate: 14,
  });

  assert.ok(byId('m_c2ridgeL').some((p) => p.x === 77 && p.y === 182), 'collapsed entrance west mega wall is missing');
  assert.ok(byId('m_c2ridgeR').some((p) => p.x === 123 && p.y === 182), 'collapsed entrance east mega wall is missing');
  assert.ok(byId('m_c2p2').some((p) => p.zone === 'entrance' && p.x === 84 && p.y === 188), 'START west egg shoulder must enter the runtime camera');
  assert.ok(byId('m_c2p2').some((p) => p.zone === 'entrance' && p.x === 116 && p.y === 188), 'START east egg shoulder must enter the runtime camera');

  const eggPlaza = byId('m_c2p2').filter((p) => p.zone === 'egg_plaza');
  assert.equal(eggPlaza.length, 4, 'egg plaza must keep one concentrated brood cluster without repeated outer singles');
  assert.ok(eggPlaza.filter((p) => p.x >= 60 && p.x <= 73).length >= 4,
    'dominant egg cluster must be visible from the open combat core instead of sitting outside the camera');
  assert.ok(eggPlaza.filter((p) => p.x >= 64 && p.x <= 72 && p.y >= 132 && p.y <= 154).length >= 4,
    'four dominant egg silhouettes must sit fully inside the runtime camera while staying west of the combat core');
  assert.ok(byId('m_c2hive').some((p) => p.zone === 'egg_plaza' && p.x === 114 && p.y === 154),
    'the smaller eastern brood must read as one hive landmark instead of repeated vertical eggs');

  const blockedRoad = props.filter((p) => p.zone === 'east_dead_end' && collidableIds.has(p.id));
  assert.ok(blockedRoad.length >= 6, 'east blocked-road must retain one compact collidable edge cluster');

  const slimePits = byId('m_c2pit').filter((p) => p.zone === 'slime_hollow');
  assert.equal(slimePits.length, 3, 'slime hollow must be a broad irregular three-pit contamination cluster');
  assert.equal(slimePits.map(({ x, y }) => `${x},${y}`).join('|'), '64,90|72,82|78,92',
    'three slime pits must form one broad irregular west-to-center contamination mass visible from the east bypass');
  const deepHives = byId('m_c2hive').filter((p) => p.zone === 'deep_cave');
  assert.equal(deepHives.length, 2, 'deep cave must retain a paired hive landmark on the mega-wall rim');
  assert.ok(deepHives.every((p) => p.x >= 82 && p.x <= 118), 'paired deep-cave hives must visibly enter the combat-camera shoulders');

  const gateHives = byId('m_c2hive').filter((p) => p.zone === 'boss_gate');
  assert.equal(gateHives.length, 2, 'boss gate must keep its paired organic hive frame');
  assert.ok(gateHives.every((p) => p.x >= 82 && p.x <= 118), 'boss-gate hives must visibly frame the actual approach camera');

  for (const zone of ['entrance', 'lower_tunnel', 'egg_plaza', 'east_dead_end', 'slime_hollow', 'bent_tunnel']) {
    assert.ok(props.some((p) => p.zone === zone && p.role === 'detail'), `${zone} needs one clustered non-collision micro-detail`);
  }

  assert.ok(byId('m_c2webp').some((p) => p.x === 91 && p.y === 24), 'boss-gate west inherited-pillar mask is missing');
  assert.ok(byId('m_c2webpf').some((p) => p.x === 111 && p.y === 24), 'boss-gate east inherited-pillar mask is missing');
  assert.ok(byId('m_c2p1').some((p) => p.x === 83 && p.y === 24), 'boss-gate outer west rib is missing');
  assert.ok(byId('m_c2p1b').some((p) => p.x === 130 && p.y === 24), 'boss-gate outer east rib is missing');
});

test('every traversal camera intersects a deliberate mega-first CH2 cluster', () => {
  const visibleAt = (x, y) => props.filter((prop) => prop.id !== 'm_c2floorpatch'
    && (megaBoundaryIds.has(prop.id)
      ? Math.abs(prop.x - x) <= 42 && Math.abs(prop.y - y) <= 28
      : Math.abs(prop.x - x) <= 20 && Math.abs(prop.y - y) <= 11.25));
  const expectations = [
    ['START', 100, 185, 4],
    ['collapsed entrance', 95, 176, 4],
    ['egg plaza', 82, 148, 5],
    ['east dead end', 132, 129, 3],
    ['slime hollow', 92, 90, 4],
    ['bent tunnel', 68, 65, 3],
    ['deep cave', 102, 48, 4],
    ['boss gate', 100, 24, 6],
  ];
  for (const [name, x, y, minimum] of expectations) {
    const visible = visibleAt(x, y);
    assert.ok(visible.length >= minimum, `${name} camera needs >=${minimum} visible authored props, got ${visible.length}`);
    assert.ok(visible.filter((prop) => prop.role === 'boundary' || prop.role === 'landmark').length >= minimum - 2,
      `${name} must read from structural/landmark clusters rather than tiny detail`);
  }
});

test('CH2 si4 keeps START, EXIT, and the authored route cores free of collision props', () => {
  const startBlockers = collidable.filter((p) => p.x >= 88 && p.x <= 112 && p.y >= 174);
  assert.equal(startBlockers.length, 0, 'START core must remain clear');

  const exitBlockers = collidable.filter((p) => p.x >= 94 && p.x <= 108 && p.y <= 34);
  assert.equal(exitBlockers.length, 0, 'EXIT core must remain clear');

  const eggArenaCore = collidable.filter((p) => p.x >= 74 && p.x <= 98 && p.y >= 136 && p.y <= 156);
  assert.equal(eggArenaCore.length, 0, 'egg plaza combat core must remain open');

  const eastPocketCore = collidable.filter((p) => p.x >= 116 && p.x <= 138 && p.y >= 124 && p.y <= 134);
  assert.equal(eastPocketCore.length, 0, 'east dead-end approach must remain wide enough for WASD movement');

  const eastPocketMouth = collidable.filter((p) => p.x >= 108 && p.x <= 114 && p.y >= 119 && p.y <= 136);
  assert.equal(eastPocketMouth.length, 0, 'east dead-end mouth must not form a collidable vertical choke');

  const slimeCenterRoute = collidable.filter((p) => p.y >= 80 && p.y <= 96 && p.x >= 82 && p.x <= 94);
  assert.equal(slimeCenterRoute.length, 0, 'slime hollow center bypass must remain open');
  const slimeEastRoute = collidable.filter((p) => p.y >= 80 && p.y <= 96 && p.x >= 96 && p.x <= 104);
  assert.equal(slimeEastRoute.length, 0, 'slime hollow east bypass must remain open');

  const slimeSouthMouth = collidable.filter((p) => p.y >= 97 && p.y <= 100 && p.x >= 78 && p.x <= 106);
  assert.equal(slimeSouthMouth.length, 0, 'slime hollow south mouth must not become a horizontal collision wall');

  const slimeNorthMouth = collidable.filter((p) => p.y >= 77 && p.y <= 80 && p.x >= 78 && p.x <= 106);
  assert.ok(slimeNorthMouth.length <= 1,
    `slime hollow north mouth must preserve the bent-tunnel transition: ${JSON.stringify(slimeNorthMouth)}`);

  const bentSouthApproach = collidable.filter((p) => p.y >= 72 && p.y <= 82 && p.x >= 74 && p.x <= 88);
  assert.equal(bentSouthApproach.length, 0, 'slime-to-bent diagonal dodge lane must remain open');

  const deepApproach = collidable.filter((p) => p.x >= 74 && p.x <= 90 && p.y >= 48 && p.y <= 64);
  assert.equal(deepApproach.length, 0, 'bent tunnel to deep cave diagonal approach must remain open');

  const deepCore = collidable.filter((p) => p.x >= 86 && p.x <= 114 && p.y >= 34 && p.y <= 56);
  assert.equal(deepCore.length, 0, 'deep-cave combat core must remain open');
});

test('CH2 si4 masks inherited boss-room pillar tiles inside its authored gate block', () => {
  const covers = [
    ['m_c2webpf', 91, 14],
    ['m_c2webp', 111, 14],
    ['m_c2webp', 91, 24],
    ['m_c2webpf', 111, 24],
  ];
  for (const [id, x, y] of covers) {
    assert.ok(props.some((prop) => prop.id === id && prop.x === x && prop.y === y && prop.zone === 'boss_gate'),
      `boss-room pillar tile block at (${x},${y}) must be hidden by ${id}`);
  }
  const floorPatches = props.filter((prop) => prop.id === 'm_c2floorpatch');
  assert.equal(floorPatches.map(({ x, y }) => `${x},${y}`).join('|'), '89,14|109,14|89,22|109,22',
    'patches must anchor on adjacent walkable floor so the authored loader does not relocate them away from the pillars');
  assert.ok(floorPatches.every((prop) => prop.role === 'mask' && prop.zone === 'boss_gate'));
  const compose = gameHtml.slice(gameHtml.indexOf('  4:{hand:1,dense:1,lm:[],mega:[]'), gameHtml.indexOf('  10:{'));
  assert.doesNotMatch(compose, /stripBossPillars/, 'CH2 must solve the gate inside its authored block without shared template behavior');
  assert.doesNotMatch(gameHtml, /if\(_pc&&_pc\.stripBossPillars\)/,
    'shared template clone logic must remain unchanged');
});

test('CH2 si4 registers and uses only CH2-owned art, including the new mega silhouette set', () => {
  const allowed = new Set([
    'm_c2p1', 'm_c2p1b', 'm_c2p2', 'm_c2hive', 'm_c2webp', 'm_c2webpf', 'm_c2pit',
    'm_c2chitin', 'm_c2larva', 'm_c2mini', 'm_c2web', 'm_c2mush', 'm_c2glow', 'm_c2eye', 'm_c2floorpatch',
    'm_c2edge', 'm_c2edgef', 'm_c2edgeS', 'm_c2edgeSf', 'm_c2edgeL', 'm_c2edgeLf',
    'm_c2curveL', 'm_c2curveR', 'm_c2brokenMega',
    'm_c2hiveWall', 'm_c2slimeCliff', 'm_c2chitinArch', 'm_c2deepHive', 'm_c2exitFrame',
    'm_c2ridgeL', 'm_c2ridgeR',
    ...wallBeltBackfillIds, ...wallBeltFillerIds, ...wallBeltSeamIds,
  ]);
  for (const prop of props) assert.ok(allowed.has(prop.id), `unapproved CH2 asset id: ${prop.id}`);

  const decoBlock = gameHtml.match(/\n\s*1:\[ \/\/ CH2 벌레굴[\s\S]*?\n\s*\],\n\s*2:\[ \/\/ CH3/);
  assert.ok(decoBlock, 'CH2 deco registration block must exist');
  for (const id of new Set(props.map((prop) => prop.id))) {
    assert.match(decoBlock[0], new RegExp(`id:'${id}'`), `${id} must resolve through the production CH2 registry`);
  }
  assert.match(decoBlock[0], /id:'m_c2curveL',file:'wall_curve_l\.png',sz:1500,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2curveR',file:'wall_curve_r\.png',sz:1500,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2brokenMega',file:'wall_broken_mega\.png',sz:1250,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2hiveWall',file:'hive_wall_mega\.png',sz:1480,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2slimeCliff',file:'slime_cliff\.png',sz:1350,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2chitinArch',file:'chitin_arch\.png',sz:1400,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2deepHive',file:'deep_hive\.png',sz:1450,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2exitFrame',file:'exit_organic_frame\.png',sz:1500,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2ridgeL',file:'wall_ridge_l\.png',sz:1600,large:1,mega:1,dir:'mega',keepAR:1/);
  assert.match(decoBlock[0], /id:'m_c2ridgeR',file:'wall_ridge_r\.png',sz:1600,large:1,mega:1,dir:'mega',keepAR:1/);
});

test('CH2 si4 removes repeated wall-edge tiles and builds the cave from a small number of mega masses', () => {
  const edgeIds = new Set(['m_c2edge', 'm_c2edgef', 'm_c2edgeS', 'm_c2edgeSf', 'm_c2edgeL', 'm_c2edgeLf']);
  const edgeProps = props.filter((prop) => edgeIds.has(prop.id));
  assert.equal(edgeProps.length, 0,
    'the former wall_edge_tile variants must not participate in CH2-1 silhouette construction');

  const megaProps = props.filter((prop) => megaBoundaryIds.has(prop.id));
  assert.equal(megaProps.length, 17, 'seventeen mega masses must define the complete 200×200 S-curve before small support props');
  assert.ok(megaProps.every((prop) => prop.role === 'boundary'), 'mega masses are terrain silhouette, never floor detail');
  for (const zone of ['entrance', 'lower_tunnel', 'egg_plaza', 'east_dead_end', 'slime_hollow', 'bent_tunnel', 'deep_cave', 'boss_gate']) {
    assert.ok(megaProps.some((prop) => prop.zone === zone), `${zone} needs at least one mega silhouette anchor`);
  }
  assert.ok(byId('m_c2curveL').length + byId('m_c2curveR').length <= 5,
    'the first-pass C-wall repetition must be cut by at least half');
  assert.ok(byId('m_c2hiveWall').some((prop) => prop.zone === 'egg_plaza'), 'egg plaza needs its fused hive-wall silhouette');
  assert.ok(byId('m_c2slimeCliff').some((prop) => prop.zone === 'slime_hollow'), 'slime hollow needs its colored slime-cliff silhouette');
  assert.equal(byId('m_c2chitinArch').length, 1, 'the broad arch must be a one-off bent-tunnel landmark, not a repeated module');
  assert.equal(byId('m_c2ridgeL').length, 3, 'the asymmetric left ridge must bridge two S-curve seams and form the START wall');
  assert.equal(byId('m_c2ridgeR').length, 3, 'the asymmetric right ridge must bridge two S-curve seams and form the START wall');
  assert.ok(byId('m_c2brokenMega').length <= 3, 'cavity wall repetition must be reduced after adding solid ridge silhouettes');
  assert.ok(byId('m_c2chitinArch').some((prop) => prop.zone === 'bent_tunnel'), 'bent tunnel needs its broad chitin arch');
  assert.ok(byId('m_c2deepHive').some((prop) => prop.zone === 'deep_cave'), 'deep cave needs its unique oppressive hive mass');
  assert.ok(byId('m_c2exitFrame').some((prop) => prop.zone === 'boss_gate'), 'boss gate needs its non-architectural organic exit frame');

  const picketIds = new Set(['m_c2p1', 'm_c2p1b', 'm_c2webp', 'm_c2webpf']);
  const pickets = props.filter((prop) => picketIds.has(prop.id));
  assert.ok(pickets.length <= 31,
    `tall skull/web pillars must be secondary cluster supports only; got ${pickets.length}`);

  const handLoader = gameHtml.match(/if\(\(G\.stage===0\|\|\(G\.stage>=10&&G\.stage<=13\)\)\&\&H\.scale[\s\S]*?_handObj\.scale=H\.scale;/);
  assert.ok(handLoader, 'shared authored scale behavior must stay limited to its existing CH1/CH3 stages');
});

test('CH2 si4 structural props hug each local cave shoulder instead of scattering through combat floors', () => {
  const shoulderRules = {
    entrance: (p) => p.x <= 82 || p.x >= 108,
    lower_tunnel: (p) => p.x <= 60 || p.x >= 100,
    egg_plaza: (p) => p.x <= 70 || p.x >= 108 || p.y <= 130,
    east_dead_end: (p) => p.y <= 116 || p.y >= 141 || p.x >= 164,
    slime_hollow: (p) => p.x <= 68 || p.x >= 112,
    bent_tunnel: (p) => p.x <= 52 || p.x >= 102,
    deep_cave: (p) => p.x <= 88 || p.x >= 120,
  };

  for (const [zone, isShoulder] of Object.entries(shoulderRules)) {
    const boundary = props.filter((prop) => prop.zone === zone && prop.role === 'boundary');
    const interior = boundary.filter((prop) => !isShoulder(prop));
    assert.equal(interior.length, 0,
      `${zone} boundary props must form an outer cave wall, not a combat-floor scatter: ${JSON.stringify(interior)}`);
  }

  const gateBoundary = props.filter((prop) => prop.zone === 'boss_gate' && prop.role === 'boundary');
  const inheritedPillarMasks = new Set(['91,14', '111,14', '91,24', '111,24']);
  const gateInterior = gateBoundary.filter((prop) => prop.x > 88 && prop.x < 120
    && prop.id !== 'm_c2exitFrame' && !inheritedPillarMasks.has(`${prop.x},${prop.y}`));
  assert.equal(gateInterior.length, 0,
    `boss gate structural props must frame the approach from its outer shoulders: ${JSON.stringify(gateInterior)}`);
  assert.ok(gateBoundary.some((prop) => prop.id === 'm_c2exitFrame' && prop.x === 100 && prop.y === 20),
    'the transparent-center organic frame is the only boundary art allowed on the EXIT axis');
});

test('CH2 si4 compose uses a narrow organic south-to-north authored path without automatic fallback', () => {
  const start = gameHtml.indexOf('  4:{hand:1,dense:1,lm:[],mega:[]');
  const end = gameHtml.indexOf('  10:{', start);
  assert.ok(start >= 0 && end > start, 'CH2 si4 compose entry must exist before CH3 authored maps');
  const compose = gameHtml.slice(start, end);
  assert.match(compose, /hand:1/);
  assert.match(compose, /dense:1/);
  assert.match(compose, /lm:\[\]/);
  assert.match(compose, /mega:\[\]/);
  assert.match(compose, /handProps:_CH2S4/);
  assert.match(compose, /pts:\[\[100,190\],[\s\S]*\[100,18\]\]/, 'path must connect 6시 START to 12시 EXIT');
  assert.match(compose, /path:\{w:30,authoredWidth:1,pts:/,
    'CH2 authored data must explicitly opt into its 30-tile worm-tunnel width');
  assert.match(compose, /\[118,132\],\[150,128\],\[118,132\]/,
    'east blocked road must be a short walkable pocket returning to the northbound route');
  assert.match(compose, /\[68,148\]/, 'egg plaza must push the lower S bend west');
  assert.match(compose, /\[112,88\]/, 'slime hollow must widen back toward the east');
  assert.doesNotMatch(compose, /minW:|rooms:/, 'CH2 width opt-in must stay a single narrow contract, not add room carving');
});

test('CH2 si4 production path builder keeps the main route and east dead-end pocket walkable', () => {
  const composeSource = gameHtml.slice(
    gameHtml.indexOf('  4:{hand:1,dense:1,lm:[],mega:[]'),
    gameHtml.indexOf('  10:{', gameHtml.indexOf('  4:{hand:1,dense:1,lm:[],mega:[]')),
  );
  const pathLiteral = composeSource.match(/path:(\{[\s\S]*?\}),\s*empty:/);
  assert.ok(pathLiteral, 'CH2 si4 path spec must be evaluable from production compose');
  const spec = vm.runInNewContext(`(${pathLiteral[1]})`);
  const buildPath = readPathBuilder(gameHtml);
  const grid = decodeRle(buildPath(200, 200, spec, 4), 200 * 200);
  const tile = (x, y) => grid[y * 200 + x];

  for (const [x, y] of spec.pts) assert.equal(tile(x, y), 1, `main route point (${x},${y}) must be walkable`);
  assert.equal(tile(150, 128), 1, 'east dead-end pocket must be walkable up to its blocker cluster');
  assert.equal(tile(118, 132), 1, 'east pocket mouth must reconnect to the main route');
  assert.equal(tile(78, 146), 1, 'egg plaza center must remain walkable');
  assert.equal(tile(90, 88), 1, 'slime hollow bypass must remain walkable');
});

test('CH2 si4 width opt-in preserves the shared builder default for every other stage', () => {
  const builder = gameHtml.match(/function _buildWalkPathRLE[\s\S]*?(?=function _buildBasinRLE)/);
  assert.ok(builder, 'shared walk-path builder must exist');
  assert.match(builder[0], /const w=spec\.authoredWidth\?Math\.max\(18,spec\.w\|\|30\):Math\.max\(70,spec\.w\|\|80\)/);
  assert.doesNotMatch(builder[0], /minW|spec\.rooms/);
  const buildPath = readPathBuilder(gameHtml);
  const authoredGrid = decodeRle(buildPath(200, 200, { w: 30, authoredWidth: 1, pts: [[100, 190], [100, 18]] }, 4), 200 * 200);
  const defaultGrid = decodeRle(buildPath(200, 200, { w: 30, pts: [[100, 190], [100, 18]] }, 5), 200 * 200);
  assert.equal(authoredGrid[100 * 200 + 116], 0, 'CH2 opt-in must stop outside its 30-tile lane');
  assert.equal(defaultGrid[100 * 200 + 130], 1, 'non-opted stages must retain the original minimum-70 lane');
});

test('every CH2 si4 authored placement resolves to walkable floor within the runtime search radius', () => {
  const composeSource = gameHtml.slice(
    gameHtml.indexOf('  4:{hand:1,dense:1,lm:[],mega:[]'),
    gameHtml.indexOf('  10:{', gameHtml.indexOf('  4:{hand:1,dense:1,lm:[],mega:[]')),
  );
  const pathLiteral = composeSource.match(/path:(\{[\s\S]*?\}),\s*empty:/);
  assert.ok(pathLiteral, 'CH2 si4 path spec must be evaluable from production compose');
  const spec = vm.runInNewContext(`(${pathLiteral[1]})`);
  const grid = decodeRle(readPathBuilder(gameHtml)(200, 200, spec, 4), 200 * 200);
  const floorAt = (x, y) => x >= 0 && y >= 0 && x < 200 && y < 200 && grid[y * 200 + x] === 1;
  const resolves = ({ x, y }) => {
    if (floorAt(x, y)) return true;
    for (let radius = 1; radius < 10; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) if (floorAt(x + dx, y + dy)) return true;
      }
    }
    return false;
  };

  const unresolved = props.filter((prop) => !resolves(prop));
  assert.equal(unresolved.length, 0, `authored props outside runtime placement radius: ${JSON.stringify(unresolved)}`);
});
