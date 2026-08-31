import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function readHellWinterProps(source) {
  const match = source.match(/const _HELLWINTER10=(\(function\(\)\{[\s\S]*?\}\)\(\));\s*\/\/ si11/);
  assert.ok(match, 'CH3-1 HELL WINTER authored placement block must exist');
  return vm.runInNewContext(match[1]);
}

function readNamedFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const bodyStart = source.indexOf('{', start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index++) {
    if (source[index] === '{') depth++;
    else if (source[index] === '}') {
      depth--;
      if (depth === 0) return vm.runInNewContext(`(${source.slice(start, index + 1)})`);
    }
  }
  assert.fail(`${name} must have a complete function body`);
}

test('CH3 public identity is HELL WINTER rather than an ice cave', () => {
  assert.match(gameHtml, /\{hell:2, name:'지옥의 겨울',\s*stages:4,\s*startSi:10\}/);
  assert.match(gameHtml, /\{n:'HELL WINTER',kr:'지옥의 겨울'/);
  assert.doesNotMatch(gameHtml, /\{n:'FROZEN CAVERN',kr:'얼음굴'/);
});

test('CH3-1 uses the authored open-air hell-winter battlefield', () => {
  const props = readHellWinterProps(gameHtml);
  assert.ok(props.length >= 260 && props.length <= 360, `authored visual layers must stay inside the 360-object technical budget, got ${props.length}`);

  const ids = new Set(props.map((prop) => prop.id));
  for (const id of [
    'm_c3hellritual', 'm_c3wall_i', 'm_c3wall_l', 'm_c3wall_gate', 'm_hang_cage',
    'm_c3hellcarcass', 'm_c3helldormant', 'm_c3hellexecution', 'm_c3hellprison',
    'm_c3hellcorpsefield',
  ]) {
    assert.ok(ids.has(id), `${id} must appear in the 3-1 battlefield`);
  }
  for (const id of [
    'm_c3cavwall', 'm_c3cliff', 'm_c3ridge', 'm_c3crystals', 'm_c3sealshrine',
    'm_c3sealbeast', 'm_mega_ribs', 'm_c3corpse', 'm_c3p1', 'm_c3p1b', 'm_c3p2',
    'm_c3tree', 'm_c3stalag', 'm_c3cage', 'm_c3cagef',
  ]) {
    assert.ok(!ids.has(id), `${id} contradicts the open-air, non-fantasy battlefield direction`);
  }

  const compose = gameHtml.match(/10:\{hand:1,dense:1,lm:\[\],mega:\[\],[\s\S]*?handProps:_HELLWINTER10\}/);
  assert.ok(compose, 'stage 10 must use authored HELL WINTER props without automatic landmark fallback');
  assert.match(compose[0], /basin:\{cx:100,cy:100,rx:90,ry:88,gateX:100,gateY:5,gateW:12\}/,
    'stage 10 must carve the model-image oval arena with a guaranteed north gate corridor');
});

test('CH3-1 matches the model image with a central ritual focus and fortified arena perimeter', () => {
  const props = readHellWinterProps(gameHtml);
  const rituals = props.filter((prop) => prop.id === 'm_c3hellritual');
  assert.equal(rituals.length, 1, 'the model-image ritual circle must appear exactly once');
  assert.deepEqual([rituals[0].x, rituals[0].y], [100, 100], 'the ritual circle must anchor the exact arena center');
  assert.ok(rituals[0].scale >= 4.2 && rituals[0].scale <= 5.2, `the ritual circle must match the model-image central diameter without becoming collision, got ${rituals[0].scale}`);

  const straightWalls = props.filter((prop) => prop.id === 'm_c3wall_i');
  assert.equal(straightWalls.length, 36, `the diamond fortress ring needs exactly four nine-span straight runs, got ${straightWalls.length}`);
  assert.ok(straightWalls.every((prop) => (prop.scale ?? 1) === 1), 'all WALL_I spans must use the locked 1.0 scale');
  assert.deepEqual([...new Set(straightWalls.map((prop) => prop.rot))].sort((a, b) => a - b), [0, 90, 180, 270],
    'WALL_I must reuse one asset through the four locked quarter-turn rotations');
  const corners = props.filter((prop) => prop.id === 'm_c3wall_l');
  assert.equal(JSON.stringify(corners.map((prop) => [prop.x, prop.y, prop.rot])), JSON.stringify([[16, 100, 0], [184, 100, 180]]),
    'east and west turns must be true WALL_L modules rather than overlapped straight walls');
  const wallGates = props.filter((prop) => prop.id === 'm_c3wall_gate');
  assert.equal(JSON.stringify(wallGates.map((prop) => [prop.x, prop.y, prop.rot])), JSON.stringify([[100, 21, 0], [100, 179, 180]]),
    'START and EXIT must use the same WALL_GATE asset rotated 180 degrees');
  const crimsonNodes = props.filter((prop) => prop.id === 'm_obelisk');
  assert.ok(crimsonNodes.length >= 8, `the fortress ring needs at least eight restrained crimson ritual nodes, got ${crimsonNodes.length}`);

  const frameIds = new Set(['m_c3wall_i', 'm_c3wall_l', 'm_c3wall_gate', 'm_c3cage', 'm_c3cagef', 'm_cage_gate', 'm_hang_cage', 'm_bone_arch']);
  const sectors = Array.from({ length: 8 }, () => 0);
  for (const prop of props.filter((entry) => frameIds.has(entry.id))) {
    const dx = prop.x - 100;
    const dy = prop.y - 100;
    if (Math.hypot(dx, dy) < 58) continue;
    const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
    sectors[Math.floor(angle / (Math.PI / 4)) % 8]++;
  }
  sectors.forEach((count, index) => assert.ok(count >= 2, `fortress-ring sector ${index + 1} needs at least two readable structures, got ${count}`));
});

test('CH3 modular wall kit locks one connector grid, quarter-turn rendering, and silhouette collision', () => {
  for (const id of ['m_c3wall_i', 'm_c3wall_l', 'm_c3wall_end', 'm_c3wall_gate']) {
    const file = 'prop_hellwinter_wall_atlas.png';
    const meta = gameHtml.match(new RegExp(`\\{id:'${id}',file:'${file.replace('.', '\\.')}[^\\n]+`));
    assert.ok(meta, `${id} modular asset metadata must exist`);
    assert.match(meta[0], /wallKit:'CH3_HELLWINTER_V1'/, `${id} must belong to the locked CH3 kit`);
    assert.match(meta[0], /wallUnit:8/, `${id} must use the same eight-tile connector grid`);
    assert.match(meta[0], /colParts:/, `${id} collision must be authored from module-local silhouette parts`);
    assert.match(meta[0], /srcRect:\[[0-9,]+\]/, `${id} must be extracted from the shared runtime atlas`);
    assert.match(meta[0], /sourceSize:\[[0-9,]+\]/, `${id} must preserve its pre-trim source canvas size`);
    assert.match(meta[0], /trimOffset:\[[0-9,]+\]/, `${id} must preserve its tight-crop pivot offset`);
    assert.match(meta[0], /assetOrigin:'crop-atlas'/, `${id} must declare crop provenance rather than a new standalone runtime PNG`);
  }
  assert.match(gameHtml, /if\(H\.rot!==undefined\)_handObj\.rot=\(\(H\.rot%360\)\+360\)%360/,
    'authored placement must preserve one per-instance rotation value');
  assert.match(gameHtml, /const _moRot=\(\(mo\.rot\|\|0\)%360\+360\)%360/,
    'map-object rendering must consume the per-instance quarter-turn');
  assert.match(gameHtml, /_appendRotatedColParts\(_co,_cm,A\)/,
    'collision rebuild must rotate the same module-local silhouette parts as rendering');
  assert.match(gameHtml, /if\(_po\._colRect\)\{const _cr=Math\.cos\(_po\._colRot\)/,
    'wall collision must test oriented module rectangles instead of an unrotated ellipse');
  assert.match(gameHtml, /colParts:d\.colParts\|\|_prev\.colParts/,
    'asset loading must preserve authored module-local collision parts instead of falling back to a circle');
  assert.match(gameHtml, /pivotX:d\.pivotX!==undefined\?d\.pivotX:_prev\.pivotX/,
    'asset loading must preserve the locked render pivot used by rotated wall modules');
  assert.match(gameHtml, /squareDraw:d\.squareDraw\|\|_prev\.squareDraw\|\|0/,
    'asset loading must preserve the WALL_GATE square draw contract');
  assert.match(gameHtml, /srcRect:d\.srcRect\|\|_prev\.srcRect/,
    'asset loading must preserve runtime source rectangles');
  assert.match(gameHtml, /sourceSize:d\.sourceSize\|\|_prev\.sourceSize/,
    'asset loading must preserve the untrimmed source canvas dimensions');
  assert.match(gameHtml, /trimOffset:d\.trimOffset\|\|_prev\.trimOffset/,
    'asset loading must preserve tight-crop pivot offsets');
  assert.match(gameHtml, /const _objImageByPath=Object\.create\(null\)/,
    'the shared atlas path must instantiate one runtime Image object');
  assert.match(gameHtml, /_drawMapObjectCrop\(X,_spr,_meta/,
    'map rendering must use the atlas source rectangle helper');
});

test('CH3 modular perimeter has constant connector spacing and no legacy block-wall overlaps', () => {
  const props = readHellWinterProps(gameHtml);
  assert.equal(props.filter((prop) => prop.id === 'm_c3hellrampart').length, 0,
    'the legacy two-block rampart must not remain in the si10 perimeter');
  assert.equal(props.filter((prop) => prop.id === 'm_c3helltower').length, 0,
    'separate tower blocks must not cover or double the modular wall connections');

  const straightWalls = props.filter((prop) => prop.id === 'm_c3wall_i');
  for (const rot of [0, 90, 180, 270]) {
    const run = straightWalls.filter((prop) => prop.rot === rot);
    assert.equal(run.length, 9, `rotation ${rot} must form one nine-span straight run`);
    const ordered = [...run].sort((a, b) => a.y - b.y || a.x - b.x);
    for (let index = 1; index < ordered.length; index++) {
      const dx = Math.abs(ordered[index].x - ordered[index - 1].x);
      const dy = Math.abs(ordered[index].y - ordered[index - 1].y);
      assert.deepEqual([dx, dy], [8, 8], `rotation ${rot} connector step ${index} must remain locked at 8×8 tiles`);
    }
  }
});

test('full-map editor zoom expands map-object culling to the visible world bounds', () => {
  const helper = gameHtml.match(/function _mapObjectCullBounds\(camX,camY,vw,vh,zoom\)\{[\s\S]*?\n\}/);
  assert.ok(helper, 'map-object culling must expose a zoom-aware bounds helper');
  const getBounds = vm.runInNewContext(`(${helper[0]})`);
  const overview = getBounds(4000, 4000, 2000, 2000, 0.244);
  assert.ok(overview.left <= 0 && overview.right >= 8000, `overview must include the complete 8000px-wide map: ${JSON.stringify(overview)}`);
  assert.ok(overview.top <= 0 && overview.bottom >= 8000, `overview must include the complete 8000px-tall map: ${JSON.stringify(overview)}`);

  const gameplay = getBounds(4000, 4000, 1600, 900, 1);
  assert.deepEqual([gameplay.left, gameplay.right, gameplay.top, gameplay.bottom], [3160, 4840, 3510, 4490]);
  assert.match(gameHtml, /const _moCull=_mapObjectCullBounds\(G\.cam\.x,G\.cam\.y,VW,VH,_EDITOR_MODE\?G\._edZoom:1\)/,
    'the renderer must consume the zoom-aware map-object culling bounds');
});

test('CH3-1 keeps a huge central combat field and the north-south route open', () => {
  const props = readHellWinterProps(gameHtml);
  const collidableIds = new Set([
    'm_c3p1', 'm_c3p1b', 'm_c3p2', 'm_c3shrine', 'm_c3cage', 'm_c3cagef', 'm_c3pit',
    'm_c3tree', 'm_c3corpse', 'm_c3stalag', 'm_c3sealbeast', 'm_c3rampart', 'm_c3wall_i', 'm_c3wall_l', 'm_c3wall_end', 'm_c3bridge',
    'm_cage_gate', 'm_hang_cage', 'm_sword_pile', 'm_skull_altar', 'm_bone_arch', 'm_obelisk',
    'm_mega_ribs', 'm_mega_head', 'm_c3hellcarcass', 'm_c3helldormant',
    'm_c3hellexecution', 'm_c3hellprison',
  ]);
  const collidable = props.filter((prop) => collidableIds.has(prop.id));

  const centerBlockers = collidable.filter((p) => p.x >= 68 && p.x <= 132 && p.y >= 68 && p.y <= 132);
  assert.equal(centerBlockers.length, 0, `central 64x64-tile combat field must stay open: ${JSON.stringify(centerBlockers)}`);

  const startBlockers = collidable.filter((p) => p.x >= 92 && p.x <= 108 && p.y >= 170);
  assert.equal(startBlockers.length, 0, '6 o’clock START approach must stay open');

  const exitBlockers = collidable.filter((p) => p.x >= 92 && p.x <= 108 && p.y <= 22);
  assert.equal(exitBlockers.length, 0, '12 o’clock EXIT approach must stay open');

  const routeBlockers = collidable.filter((p) => p.x >= 92 && p.x <= 108 && p.y >= 23 && p.y <= 169);
  assert.equal(routeBlockers.length, 0, 'main north-south traversal spine must stay open');
});

test('CH3-1 gives each canonical landmark its own authored silhouette', () => {
  const props = readHellWinterProps(gameHtml);
  const one = (id) => props.filter((prop) => prop.id === id);

  const carcass = one('m_c3hellcarcass');
  assert.equal(carcass.length, 1, 'southwest must have one giant frozen carcass landmark');
  assert.ok(carcass[0].x <= 58 && carcass[0].y >= 128, `carcass must anchor the southwest: ${JSON.stringify(carcass[0])}`);

  const dormant = one('m_c3helldormant');
  assert.equal(dormant.length, 1, 'outer edge must have one motionless living-dead monster');
  assert.ok(dormant[0].x >= 142 && dormant[0].y <= 68, `dormant monster must anchor the northeast: ${JSON.stringify(dormant[0])}`);

  const execution = one('m_c3hellexecution');
  assert.equal(execution.length, 1, 'west must have one execution-and-chain landmark');
  assert.ok(execution[0].x <= 48 && execution[0].y >= 72 && execution[0].y <= 124,
    `execution landmark must anchor the west: ${JSON.stringify(execution[0])}`);

  const prisons = one('m_c3hellprison');
  assert.ok(prisons.length >= 2, `east must have a composed iron-prison cluster, got ${prisons.length}`);
  assert.ok(prisons.every((prop) => prop.x >= 145), `prison cluster must stay east: ${JSON.stringify(prisons)}`);
  assert.ok(Math.max(...prisons.map((prop) => prop.y)) - Math.min(...prisons.map((prop) => prop.y)) <= 16,
    `prison pieces must overlap into one landmark rather than read as two distant icons: ${JSON.stringify(prisons)}`);

  const gates = one('m_c3wall_gate');
  assert.equal(gates.length, 2, 'START and EXIT each need a modular hell-gate silhouette');
  assert.ok(gates.some((prop) => prop.x >= 90 && prop.x <= 110 && prop.y <= 24), '12 o’clock EXIT gate is missing');
  assert.ok(gates.some((prop) => prop.x >= 90 && prop.x <= 110 && prop.y >= 176), '6 o’clock START gate is missing');
});

test('CH3-1 tells the frozen battlefield story without filling the combat core', () => {
  const props = readHellWinterProps(gameHtml);
  const corpseFields = props.filter((prop) => prop.id.startsWith('m_c3hellcorpsefield'));
  assert.ok(corpseFields.length >= 14, `the battlefield needs at least 14 entangled frozen-corpse groups, got ${corpseFields.length}`);
  assert.ok(corpseFields.every((prop) => !(prop.x >= 68 && prop.x <= 132 && prop.y >= 68 && prop.y <= 132)),
    'corpse storytelling must not obstruct or visually clutter the central combat core');

  const center = props.filter((prop) => Math.hypot(prop.x - 100, prop.y - 100) < 34);
  const mid = props.filter((prop) => {
    const radius = Math.abs(prop.x - 100) + Math.abs(prop.y - 100);
    return radius >= 48 && radius < 72;
  });
  const outer = props.filter((prop) => Math.abs(prop.x - 100) + Math.abs(prop.y - 100) >= 72);
  assert.ok(center.length <= 12, `CENTER density must remain LOW after the six floor-only detail accents, got ${center.length}`);
  assert.ok(mid.length >= 12, `MID RING density must read MEDIUM, got ${mid.length}`);
  assert.ok(outer.length >= 70, `OUTER EDGE density must read HIGH around the diamond fortress perimeter, got ${outer.length}`);
});

test('CH3-1 adds a restrained non-colliding inner detail ring from existing floor sources', () => {
  const props = readHellWinterProps(gameHtml);
  const detailIds = new Set(['m_c3hellcenter_stain', 'm_c3hellcenter_plate', 'm_c3hellcenter_vein']);
  const details = props.filter((prop) => detailIds.has(prop.id));

  assert.equal(details.length, 6, `the ritual needs exactly six authored floor-detail accents, got ${details.length}`);
  assert.deepEqual([...new Set(details.map((prop) => prop.id))].sort(), [...detailIds].sort(),
    'the inner ring must combine stain, dead-ice plate, and restrained blood-vein reuse');
  assert.ok(details.every((prop) => {
    const radius = Math.hypot(prop.x - 100, prop.y - 100);
    return radius >= 10 && radius <= 22;
  }), 'inner detail must sit inside the readable ritual edge without filling the player core or leaking into the mid ring');
  assert.ok(details.filter((prop) => prop.id === 'm_c3hellcenter_vein').every((prop) => Math.hypot(prop.x - 100, prop.y - 100) <= 13),
    'the two faint blood veins must be readable inside the gameplay camera while staying outside the route');
  assert.ok(details.every((prop) => prop.x < 92 || prop.x > 108),
    'the locked north-south combat/readability route must remain visually clear');

  assert.match(gameHtml, /\{id:'m_c3hellcenter_stain',file:'prop_ice_gdark\.png',[^}]*renderLayer:1[^}]*\}/,
    'central stain must reuse the existing dark-ground source above the ritual texture');
  assert.match(gameHtml, /\{id:'m_c3hellcenter_plate',file:'prop_ice_gplates\.png',[^}]*renderLayer:1[^}]*\}/,
    'central plate must reuse the existing ice-plate source above the ritual texture');
  assert.match(gameHtml, /\{id:'m_c3hellcenter_vein',file:'prop_ice_gcrack\.png',[^}]*renderLayer:1[^}]*blend:'screen'[^}]*\}/,
    'central vein must reuse and recolor the existing crack source at runtime');
  for (const id of detailIds) {
    const meta = gameHtml.match(new RegExp(`\\{id:'${id}'[^\\n]+`));
    assert.ok(meta, `${id} metadata must exist`);
    assert.doesNotMatch(meta[0], /(?:^|,)col(?::|W|H|Sz|Parts)/,
      `${id} is floor-only authored detail and must never add collision`);
  }
});

test('CH3-1 pins the runtime gate and exit to the model-image north opening', () => {
  const applyNorthGate = readNamedFunction(gameHtml, '_applyHellWinterNorthGate');
  const map = Array.from({ length: 200 }, () => Array(200).fill(1));
  const result = applyNorthGate(map, 200, 200);

  assert.equal(result.bossCx, 100);
  assert.equal(result.gateY, 5);
  assert.equal(JSON.stringify(result.gateTiles.map((tile) => [tile.x, tile.y])), JSON.stringify([[99, 5], [100, 5], [101, 5]]));
  assert.equal(JSON.stringify(result.exits.map((tile) => [tile.x, tile.y])), JSON.stringify([[99, 7], [100, 7], [101, 7]]));
  for (let y = 8; y <= 35; y++) {
    for (let x = 88; x <= 112; x++) assert.equal(map[y][x], 0, `north approach must be open at ${x},${y}`);
  }
  assert.match(gameHtml, /if\(si===10\)\{const _hwGate=_applyHellWinterNorthGate\(map,mw,mh\)/,
    'genFromTemplate must apply the fixed north-gate contract to stage 10');
});

test('CH3-1 frames the arena with four secondary perimeter combat pockets', () => {
  const props = readHellWinterProps(gameHtml);
  const pockets = [
    props.filter((p) => p.x <= 60 && p.y >= 120),
    props.filter((p) => p.x >= 140 && p.y >= 120),
    props.filter((p) => p.x <= 60 && p.y <= 70),
    props.filter((p) => p.x >= 140 && p.y <= 70),
  ];
  pockets.forEach((pocket, index) => assert.ok(pocket.length >= 5, `perimeter pocket ${index + 1} needs at least five composed props`));
});

test('CH3 environment palette removes bright cyan fantasy accents', () => {
  assert.match(gameHtml, /\{w:'#20262b',f:'#080b0e',ac:'#7a201b'\},\s*\/\/ 2 지옥의 겨울/);
  const floorMarks = gameHtml.match(/else if\(hell===2\)\{[\s\S]*?\}else if\(hell===3\)/);
  assert.ok(floorMarks, 'CH3 floor-mark palette branch must exist');
  assert.doesNotMatch(floorMarks[0], /190,235,255|90,210,240/);
  assert.match(floorMarks[0], /frozen blood|ash/i);
  assert.match(floorMarks[0], /rgba\(132,28,22,\.46\)/,
    'frozen-blood fissures must remain legible in the full-map model comparison');
  assert.match(floorMarks[0], /lineWidth=2\.4/,
    'fissures need enough weight to survive full-map downscaling');
  assert.match(floorMarks[0], /hell===2&&\(h&63\)>3/,
    'HELL WINTER fissures must be sparse enough to avoid a repeated chevron carpet');
  assert.match(floorMarks[0], /c\.rotate\(\(\(h>>>16\)&255\)\/255\*Math\.PI\*2\)/,
    'frozen-blood fissures must vary direction rather than repeat horizontally');
  assert.match(gameHtml, /brightness\(\.46\) contrast\(1\.34\) saturate\(\.18\)/,
    'stage 10 reused ice props must be restrained to a near-monochrome material response');
  assert.doesNotMatch(readHellWinterProps(gameHtml).map((prop) => prop.id).join(','), /m_c3sealbeast|m_mega_ribs/,
    'cyan shrine beasts and green-magenta legacy ribs must not appear in HELL WINTER');
});

test('CH3 floor caches apply one restrained black-earth tone pass', () => {
  const tone = gameHtml.match(/function _paintHellFloorBaseTone[\s\S]*?\n\}/);
  assert.ok(tone, 'shared CH3 floor-tone cache pass must exist');
  assert.match(tone[0], /if\(hell!==2\)return/);
  assert.match(tone[0], /rgba\(6,8,10,\.49\)/,
    'black-earth atmosphere must suppress the stretched source frost web without erasing blood fissures');
  assert.match(tone[0], /fillRect\(0,0,w,h\)/);
  assert.ok((gameHtml.match(/_paintHellFloorBaseTone\(/g) || []).length >= 4,
    'full, fallback, and streaming map-cache paths must all apply the tone pass');
});

test('CH3 floor is composed from black soil, frozen blood, and restrained ice', () => {
  const composite = gameHtml.match(/function _hellWinterFloorImg\(\)[\s\S]*?\n\}/);
  assert.ok(composite, 'HELL WINTER cached floor compositor must exist');
  assert.match(gameHtml, /'gt_hellwinter':'assets\/map\/ch3\/ground_hellwinter\.png\?v=20260829-canonical'/);
  assert.match(composite[0], /_GROUND_TILES\['gt_hellwinter'\]/);
  assert.match(composite[0], /out\.width=2048;out\.height=2048/,
    'the dedicated ground must use the 2K mirrored macro tile rather than expose the former 256/1024px texture carpet');
  assert.doesNotMatch(composite[0], /_GROUND_TILES\['gt_ch3'\]|globalCompositeOperation='screen'/,
    'the bright clear-ice lattice must not be blended into HELL WINTER');
  assert.match(gameHtml, /if\(\(hell\|0\)===2\)\{const hw=_hellWinterFloorImg\(\);if\(hw\)return hw\}/);
});

test('CH3-1 model-map silhouette is framed by a tall reused fortress shell', () => {
  const props = readHellWinterProps(gameHtml);
  const towers = props.filter((prop) => prop.id === 'm_c3helltower_shell');
  const ramparts = props.filter((prop) => prop.id === 'm_c3hellrampart_shell');
  const northGate = props.filter((prop) => prop.id === 'm_c3hellgate_shell');

  assert.ok(towers.length >= 16, `model-map perimeter needs at least sixteen tall tower anchors, got ${towers.length}`);
  assert.ok(ramparts.length >= 8, `model-map perimeter needs at least eight tall rampart masses, got ${ramparts.length}`);
  assert.equal(northGate.length, 1, `the 12 o'clock skyline needs one canonical fortress gate, got ${northGate.length}`);

  const shell = [...towers, ...ramparts];
  assert.ok(shell.every((prop) => {
    const radius = Math.hypot((prop.x - 100) / 84, (prop.y - 100) / 84);
    return radius >= .88 && radius <= 1.08;
  }), `visual shell must describe the model's circular perimeter around the proven collision ring: ${JSON.stringify(shell)}`);
  const quadrants = [0, 0, 0, 0];
  for (const prop of towers) {
    const east = prop.x >= 100 ? 1 : 0;
    const south = prop.y >= 100 ? 1 : 0;
    quadrants[south * 2 + east]++;
  }
  quadrants.forEach((count, index) => assert.ok(count >= 2, `tower silhouette quadrant ${index + 1} needs at least two anchors, got ${count}`));

  assert.match(gameHtml, /\{id:'m_c3helltower_shell',file:'prop_hellwinter_tower\.png',[^}]*keepAR:1[^}]*\}/,
    'tower shell must reuse the existing tower image without collision metadata');
  assert.match(gameHtml, /\{id:'m_c3hellrampart_shell',file:'prop_hellwinter_rampart\.png',[^}]*keepAR:1[^}]*\}/,
    'rampart shell must reuse the existing rampart image without collision metadata');
  assert.match(gameHtml, /\{id:'m_c3helltower_shell',file:'prop_hellwinter_tower\.png',[^}]*dir:'collision'/,
    'tower shell must load the reused source from the CH3 collision asset directory');
  assert.match(gameHtml, /\{id:'m_c3hellrampart_shell',file:'prop_hellwinter_rampart\.png',[^}]*dir:'collision'/,
    'rampart shell must load the reused source from the CH3 collision asset directory');
});

test('CH3-1 model-map density rises from an open combat core to authored outer war clusters', () => {
  const props = readHellWinterProps(gameHtml);
  const corpseFields = props.filter((prop) => prop.id.startsWith('m_c3hellcorpsefield'));
  const macroFloor = props.filter((prop) => prop.id === 'm_c3hellground_dark' || prop.id === 'm_c3hellground_plate');
  const center = props.filter((prop) => Math.hypot(prop.x - 100, prop.y - 100) < 32);
  const mid = props.filter((prop) => {
    const radius = Math.abs(prop.x - 100) + Math.abs(prop.y - 100);
    return radius >= 48 && radius < 78;
  });
  const outer = props.filter((prop) => Math.abs(prop.x - 100) + Math.abs(prop.y - 100) >= 78);

  assert.ok(corpseFields.length >= 44, `model battlefield needs at least 44 frozen-corpse groups, got ${corpseFields.length}`);
  assert.ok(macroFloor.length >= 18, `ground repetition needs at least 18 low-alpha authored macro patches, got ${macroFloor.length}`);
  assert.ok(center.length <= 12, `combat core must remain low density, got ${center.length}`);
  assert.ok(mid.length >= 32, `mid ring must read as medium density, got ${mid.length}`);
  assert.ok(outer.length >= 150, `outer fortress edge must read as high density, got ${outer.length}`);
});

test('CH3 floor and ritual reuse reduce repetition and preserve combat readability', () => {
  const props = readHellWinterProps(gameHtml);
  const ritual = props.find((prop) => prop.id === 'm_c3hellritual');
  assert.ok(ritual, 'central hell ritual must remain the composition focus');
  assert.ok(ritual.scale >= 4.2 && ritual.scale <= 4.8, `ritual composition scale must remain canonical, got ${ritual.scale}`);

  const composite = gameHtml.match(/function _hellWinterFloorImg\(\)[\s\S]*?\n\}/);
  assert.ok(composite, 'HELL WINTER cached floor compositor must exist');
  assert.match(composite[0], /out\.width=2048;out\.height=2048/,
    'one ground source must become a 2x2 macro tile before world repetition');
  assert.match(composite[0], /c\.scale\(-1,1\)/, 'macro tile must reuse the source through horizontal mirror');
  assert.match(composite[0], /c\.scale\(1,-1\)/, 'macro tile must reuse the source through vertical mirror');
  const tileSizeHelper = gameHtml.match(/function _gtTileSz\(img\)\{[\s\S]*?\n\}/);
  assert.ok(tileSizeHelper, 'ground tile sizing helper must exist');
  const getTileSize = vm.runInNewContext(`(${tileSizeHelper[0]})`);
  assert.equal(getTileSize({ naturalWidth: 0, width: 2048 }), 2048,
    'the compositor canvas width must be honored instead of collapsing back to a 256px repeat');
  assert.match(gameHtml, /alpha:d\.alpha!==undefined\?d\.alpha:_prev\.alpha/,
    'asset metadata loader must preserve restrained per-asset alpha');
  assert.match(gameHtml, /const _moAlpha=\(_meta&&_meta\.alpha!==undefined\?_meta\.alpha:1\)\*_ch1StartOuterPropAlpha\(mo\)/,
    'map-object rendering must apply per-asset alpha without baking duplicate PNGs');
  assert.match(gameHtml, /\{id:'m_c3hellritual',file:'prop_hellwinter_ritual\.png',[^}]*alpha:\.56/,
    'the reused ritual texture must be restrained below full opacity');
});

test('CH3 compositing renders floor variation, fortress shell, and gameplay objects in fixed depth order', () => {
  assert.match(gameHtml, /renderLayer:d\.renderLayer!==undefined\?d\.renderLayer:_prev\.renderLayer/,
    'asset metadata loader must preserve authored render layers');
  assert.match(gameHtml, /MAP_OBJS\.sort\(function\(a,b\)\{const la=_OBJ_META\[a\.type\]\?\._renderLayer\|\|0,lb=_OBJ_META\[b\.type\]\?\._renderLayer\|\|0;return la-lb\|\|a\.y-b\.y\}\)/,
    'map objects must sort once by render layer and then by y');
  assert.match(gameHtml, /\{id:'m_c3hellground_dark',file:'prop_ice_gdark\.png',[^}]*renderLayer:-10/,
    'macro ground variation must render below every structure');
  assert.match(gameHtml, /\{id:'m_c3helltower_shell',file:'prop_hellwinter_tower\.png',[^}]*renderLayer:-2/,
    'fortress skyline must render behind the proven modular wall and gameplay landmarks');
});

test('CH3 model-map landmark hierarchy survives full-map downscaling', () => {
  const props = readHellWinterProps(gameHtml);
  const one = (id) => props.filter((prop) => prop.id === id);
  assert.ok(one('m_c3hellcarcass')[0].scale >= 2.0, 'southwest carcass must remain the dominant foreground landmark');
  assert.ok(one('m_c3hellexecution')[0].scale >= 1.55, 'west execution structure must survive full-map downscaling');
  assert.ok(Math.max(...one('m_c3hellprison').map((prop) => prop.scale || 1)) >= 1.4,
    'east prison cluster needs one primary model-scale piece');
  assert.ok(one('m_c3helldormant')[0].scale >= 1.35, 'northeast dormant monster must remain readable as a canonical anchor');
  assert.match(gameHtml, /\{id:'m_c3helltower_shell',file:'prop_hellwinter_tower\.png',[^}]*sz:1300/,
    'reused skyline tower source must retain model-map scale in the full overview');
});

test('CH3-1 reuses the ice-crack source as restrained frozen-blood heat veins', () => {
  const props = readHellWinterProps(gameHtml);
  const fissures = props.filter((prop) => prop.id === 'm_c3hellfissure');
  assert.ok(fissures.length >= 16, `the model-map needs at least sixteen readable red heat veins, got ${fissures.length}`);
  assert.ok(fissures.every((prop) => Math.hypot(prop.x - 100, prop.y - 100) >= 38),
    'heat veins must reinforce the mid/outer density gradient without flooding the ritual core');
  assert.match(gameHtml, /\{id:'m_c3hellfissure',file:'prop_ice_gcrack\.png',[^}]*filter:'grayscale\(1\) sepia\(1\) saturate\(7\) hue-rotate\(315deg\) brightness\(\.72\)'[^}]*blend:'screen'/,
    'the existing CH3 crack source must be recolored at runtime instead of baking a new PNG');
  assert.match(gameHtml, /\{id:'m_c3hellfissure',file:'prop_ice_gcrack\.png',sz:430,keepAR:1,alpha:\.24/,
    'heat veins must remain subordinate to the ritual and fortress silhouettes at full-map scale');
  assert.match(gameHtml, /filter:d\.filter!==undefined\?d\.filter:_prev\.filter/,
    'map-object metadata loading must preserve the reusable per-source color filter');
  assert.match(gameHtml, /if\(_meta&&_meta\.blend\)X\.globalCompositeOperation=_meta\.blend/,
    'frozen-blood fissures must use restrained screen compositing over black earth');
  assert.match(gameHtml, /function _filterMapSprite\(img,filter\)\{[\s\S]*?c\._glVer=1;return c;?\s*\}/,
    'GPU rendering must receive a one-time filtered runtime canvas texture');
  assert.match(gameHtml, /c\.complete=true;c\.naturalWidth=c\.width;c\.naturalHeight=c\.height;c\._glVer=1/,
    'the filtered runtime canvas must preserve the Image-like readiness contract used by map rendering');
  assert.match(gameHtml, /if\(d\.filter\)im\.onload=function\(\)\{_OBJ_SPR\[d\.id\]=_filterMapSprite\(this,d\.filter\);if\(_OBJ_META\[d\.id\]\)_OBJ_META\[d\.id\]\._filterBaked=1\}/,
    'filtered CH3 sources must be cached before the WebGL proxy uploads them');
  assert.match(gameHtml, /const _metaFilter=_meta&&_meta\.filter&&!_meta\._filterBaked\?_meta\.filter:''/,
    'Canvas2D fallback must retain only filters that were not already baked into the runtime canvas');
  assert.match(gameHtml, /if\(_drawFilter\)X\.filter=_drawFilter/,
    'the composed draw filter must reach Canvas2D without double-filtering the GPU texture');
});

test('CH3-1 outer fortress follows the production guide four-layer mass contract', () => {
  const props = readHellWinterProps(gameHtml);
  const back = props.filter((prop) => prop.id === 'm_c3hellback_mass');
  const mid = props.filter((prop) => prop.id === 'm_c3hellrampart_shell' || prop.id === 'm_c3hellrampart_mid_a' || prop.id === 'm_c3hellrampart_mid_b');
  const front = props.filter((prop) => prop.id === 'm_c3hellrubble_front_a' || prop.id === 'm_c3hellrubble_front_b');
  const ground = props.filter((prop) => prop.id === 'm_c3hellground_shadow');

  assert.ok(back.length >= 16, `BACK needs a continuous dark recess belt, got ${back.length}`);
  assert.ok(mid.length >= 18, `MID needs overlapping rampart mass instead of isolated blocks, got ${mid.length}`);
  assert.ok(front.length >= 12, `FRONT needs irregular cropped rubble edges, got ${front.length}`);
  assert.ok(ground.length >= 16, `GROUND TRANSITION needs structure-foot shadows, got ${ground.length}`);

  const angles = mid.map((prop) => Math.atan2(prop.y - 100, prop.x - 100)).sort((a, b) => a - b);
  const gaps = angles.map((angle, index) => {
    const next = index + 1 < angles.length ? angles[index + 1] : angles[0] + Math.PI * 2;
    return next - angle;
  });
  assert.ok(Math.max(...gaps) <= .42, `MID angular gap must stay within an overlapping 18-segment belt, got ${Math.max(...gaps)}`);
  assert.ok(new Set(mid.map((prop) => prop.scale)).size >= 6,
    'MID scale bands must break the countable identical-rampart silhouette');
  assert.ok(new Set(mid.map((prop) => Math.round(Math.hypot(prop.x - 100, prop.y - 100)))).size >= 4,
    'MID radial staggering must avoid a mechanically perfect ring');

  const backRegistry = gameHtml.match(/\{id:'m_c3hellback_mass',file:'prop_hellwinter_rampart\.png'[^}]*\}/);
  assert.ok(backRegistry, 'BACK registry must reuse the existing rampart source');
  assert.match(backRegistry[0], /alpha:\.52[^}]*renderLayer:-4/,
    'BACK must survive full-map downscaling as a continuous low-alpha recess');
  assert.doesNotMatch(backRegistry[0], /filter:/,
    'already near-black rampart material must keep its native detail instead of disappearing through a second dark filter');
  assert.match(gameHtml, /\{id:'m_c3hellground_shadow',file:'prop_ice_gdark\.png',[^}]*alpha:\.22[^}]*renderLayer:-11[^}]*filter:'grayscale\(1\) brightness\(\.26\) contrast\(1\.25\)'/,
    'GROUND TRANSITION must reuse a baked dark source instead of adding a new shadow asset');
});

test('CH3-1 runtime crops rampart rubble into a non-collision irregular playable edge', () => {
  const props = readHellWinterProps(gameHtml);
  const front = props.filter((prop) => prop.id === 'm_c3hellrubble_front_a' || prop.id === 'm_c3hellrubble_front_b');
  assert.ok(front.length >= 12, 'cropped rubble must connect the fortress mass to the playable floor');
  assert.ok(front.every((prop) => Math.hypot(prop.x - 100, prop.y - 100) >= 74),
    'visual-only rubble belongs on the outer edge, not in the combat arena');
  assert.ok(front.every((prop) => prop.rot === undefined || prop.rot === 0),
    'directional 3/4 rampart crops must not be force-rotated');

  assert.match(gameHtml, /\{id:'m_c3hellrubble_front_a',file:'prop_hellwinter_rampart\.png',srcRect:\[0,540,900,430\],sourceSize:\[1632,970\],trimOffset:\[0,540\],[^}]*sharedAtlas:1[^}]*assetOrigin:'runtime-crop'[^}]*renderLayer:-1/,
    'FRONT A must be a runtime source rectangle from the existing rampart image');
  assert.match(gameHtml, /\{id:'m_c3hellrubble_front_b',file:'prop_hellwinter_rampart\.png',srcRect:\[720,470,912,500\],sourceSize:\[1632,970\],trimOffset:\[720,470\],[^}]*sharedAtlas:1[^}]*assetOrigin:'runtime-crop'[^}]*renderLayer:-1/,
    'FRONT B must provide a second irregular crop without a new PNG');
  assert.doesNotMatch(gameHtml, /\{id:'m_c3hellrubble_front_[ab]'[^}]*\bcol(?::|W|H|Sz)/,
    'visual crop modules must not duplicate or enlarge collision');
});

test('CH3-1 breaks the countable rampart silhouette with two medium runtime crops', () => {
  const props = readHellWinterProps(gameHtml);
  const full = props.filter((prop) => prop.id === 'm_c3hellrampart_shell');
  const left = props.filter((prop) => prop.id === 'm_c3hellrampart_mid_a');
  const right = props.filter((prop) => prop.id === 'm_c3hellrampart_mid_b');
  assert.ok(full.length >= 8 && full.length <= 10, `only major anchors should expose the full rampart silhouette, got ${full.length}`);
  assert.ok(left.length >= 5, `left structural crop must break repeated full blocks, got ${left.length}`);
  assert.ok(right.length >= 5, `right structural crop must break repeated full blocks, got ${right.length}`);

  assert.match(gameHtml, /\{id:'m_c3hellrampart_mid_a',file:'prop_hellwinter_rampart\.png',srcRect:\[0,180,900,790\],sourceSize:\[1632,970\],trimOffset:\[0,180\],[^}]*assetOrigin:'runtime-crop'[^}]*renderLayer:-2/,
    'MID A must crop the lower left rampart mass from the existing source');
  assert.match(gameHtml, /\{id:'m_c3hellrampart_mid_b',file:'prop_hellwinter_rampart\.png',srcRect:\[780,0,852,850\],sourceSize:\[1632,970\],trimOffset:\[780,0\],[^}]*assetOrigin:'runtime-crop'[^}]*renderLayer:-2/,
    'MID B must crop the taller right rampart mass from the existing source');
});

test('CH3-1 cleanup pass 1 preserves the two bright-landmark edge treatments and collision', () => {
  const carcass = gameHtml.match(/\{id:'m_c3hellcarcass',file:'prop_hellwinter_carcass\.png'[^}]*\}/)?.[0] || '';
  const dormant = gameHtml.match(/\{id:'m_c3helldormant',file:'prop_hellwinter_dormant\.png'[^}]*\}/)?.[0] || '';

  assert.match(carcass, /edgeErase:\.08/);
  assert.match(carcass, /colW:220,colH:88/);
  assert.match(dormant, /edgeErase:\.10/);
  assert.match(dormant, /colW:170,colH:96/);
  assert.match(gameHtml, /function _edgeEraseMapSprite\(img,amount\)/);
  assert.match(gameHtml, /if\(d\.edgeErase\)im\.onload=function\(\)\{_OBJ_SPR\[d\.id\]=_edgeEraseMapSprite\(this,d\.edgeErase\)/);
});

test('CH3-1 cleanup pass 2 minimally feathers only the west execution and east prison junctions', () => {
  const execution = gameHtml.match(/\{id:'m_c3hellexecution',file:'prop_hellwinter_execution\.png'[^}]*\}/)?.[0] || '';
  const prison = gameHtml.match(/\{id:'m_c3hellprison',file:'prop_hellwinter_prison\.png'[^}]*\}/)?.[0] || '';
  const ritual = gameHtml.match(/\{id:'m_c3hellritual',file:'prop_hellwinter_ritual\.png'[^}]*\}/)?.[0] || '';
  const props = readHellWinterProps(gameHtml);

  assert.match(execution, /edgeErase:\.03/);
  assert.match(execution, /colW:165,colH:76/);
  assert.match(prison, /edgeErase:\.03/);
  assert.match(prison, /colW:145,colH:88/);
  assert.doesNotMatch(ritual, /edgeErase:/);
  assert.equal(
    JSON.stringify(props.filter((prop) => prop.id === 'm_c3hellexecution').map((prop) => [prop.x, prop.y, prop.scale])),
    JSON.stringify([[29, 99, 1.62]]),
  );
  assert.equal(
    JSON.stringify(props.filter((prop) => prop.id === 'm_c3hellprison').map((prop) => [prop.x, prop.y, prop.scale])),
    JSON.stringify([[166, 101, 1.48], [174, 112, .96]]),
  );
});

test('CH3-1 final macro retouch builds four asymmetric outer silhouette families from runtime crops', () => {
  const ids = [
    'm_c3hellsil_spire_a', 'm_c3hellsil_spire_b', 'm_c3hellsil_pillar',
    'm_c3hellsil_rubble_a', 'm_c3hellsil_rubble_b',
  ];
  for (const id of ids) {
    const meta = gameHtml.match(new RegExp(`\\{id:'${id}',file:'prop_hellwinter_rampart\\.png'[^}]*\\}`))?.[0] || '';
    assert.match(meta, /srcRect:\[[0-9,]+\]/, `${id} must be a rampart source rectangle`);
    assert.match(meta, /assetOrigin:'runtime-crop'/, `${id} must declare crop reuse`);
    assert.match(meta, /dir:'collision'/, `${id} must load the reused source from assets/map/ch3/collision`);
    assert.match(meta, /renderLayer:-1/, `${id} must sit above MID and behind collision walls`);
    const baseSize = Number(meta.match(/,sz:([0-9.]+)/)?.[1] || 0);
    assert.ok(baseSize >= 360 && baseSize <= 520, `${id} must remain a crest-sized overlay, got ${baseSize}`);
    assert.doesNotMatch(meta, /\b(?:col|collision|edgeErase)(?::|W|H|Sz)/, `${id} must remain visual-only`);
  }
  const breakers = readHellWinterProps(gameHtml).filter((prop) => ids.includes(prop.id));
  assert.equal(breakers.length, 16, `four 4-piece silhouette families are required, got ${breakers.length}`);
  assert.ok(breakers.every((prop) => (prop.scale ?? 1) >= .9 && (prop.scale ?? 1) <= 1.1),
    'macro breaker scale must stay inside the restrained .90~1.10 band');
  assert.ok(breakers.every((prop) => Math.hypot(prop.x - 100, prop.y - 100) >= 72),
    'silhouette breakers must remain on the outer edge');
  const families = [
    breakers.filter((prop) => prop.y <= 44 && prop.x > 44 && prop.x < 156),
    breakers.filter((prop) => prop.x >= 156 && prop.y > 44 && prop.y < 156),
    breakers.filter((prop) => prop.y >= 156 && prop.x > 44 && prop.x < 156),
    breakers.filter((prop) => prop.x <= 44 && prop.y > 44 && prop.y < 156),
  ];
  families.forEach((family, index) => assert.equal(family.length, 4, `outer family ${index + 1} must have four authored pieces`));
  assert.notEqual(
    JSON.stringify(families[0].map((prop) => [prop.id, prop.x, prop.y, prop.scale])),
    JSON.stringify(families[2].map((prop) => [prop.id, 200 - prop.x, 200 - prop.y, prop.scale])),
    'TOP and SOUTH silhouette families must not be rotational mirrors',
  );
});

test('CH3-1 final macro tone keeps light dead, blue-gray muted, and the ritual subordinate', () => {
  assert.match(gameHtml, /if\(_hellWinterTone\)\{X\.save\(\);X\.filter='brightness\(\.46\) contrast\(1\.34\) saturate\(\.18\)'\}/);
  assert.match(gameHtml, /if\(hell!==2\)return;[\s\S]*?rgba\(6,8,10,\.49\)/);
  const ritual = gameHtml.match(/\{id:'m_c3hellritual',file:'prop_hellwinter_ritual\.png'[^}]*\}/)?.[0] || '';
  assert.match(ritual, /alpha:\.56/);
  assert.doesNotMatch(ritual, /edgeErase:/);
});
