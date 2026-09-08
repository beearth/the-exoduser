import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const bodyStart = gameHtml.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') depth++;
    else if (gameHtml[i] === '}' && --depth === 0) return gameHtml.slice(start, i + 1);
  }
  assert.fail(`${name} must have a complete body`);
}

test('planted ancestor sword absorbs only nearby hostile ordinary projectiles up to its capacity', () => {
  const radiusSource = extractFunction('_ancestorSwordAbsorbRadius');
  const absorbSource = extractFunction('_ancestorSwordAbsorbProjectiles');
  const projs = [
    { x: 40, y: 0, life: 10, dmg: 20, el: 1 },
    { x: 80, y: 0, life: 10, dmg: 35, el: 2 },
    { x: 190, y: 0, life: 10, dmg: 50, el: 3 },
    { x: 30, y: 0, life: 10, dmg: 90, blackBean: true },
    { x: 20, y: 0, life: 10, dmg: 70, friendly: true },
    { x: 20, y: 0, life: 10, dmg: 70, mine: true },
  ];
  const absorb = Function('projs', 'dst', 'addParts', 'ELC',
    `${radiusSource};${absorbSource};return _ancestorSwordAbsorbProjectiles`)(
      projs, (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1), () => {}, {});
  const ancestor = { x: 0, y: 0, _swordX: 0, _swordY: 0, _swordT: 50, _swordMaxT: 100, _swordMax: 2, _swordAbsorbed: 0, _swordDmgPool: 0 };

  assert.deepEqual(absorb(ancestor), { count: 2, damage: 55 });
  assert.equal(ancestor._swordAbsorbed, 2);
  assert.equal(ancestor._swordDmgPool, 55);
  assert.equal(projs[0].life, -999);
  assert.equal(projs[1].life, -999);
  assert.equal(projs[2].life, 10, 'outside the sword field remains hostile');
  assert.equal(projs[3].life, 10, 'rainbow bullets retain their Q-only special rule');
  assert.equal(projs[4].life, 10, 'friendly shots remain');
  assert.equal(projs[5].life, 10, 'mine zones remain');
});

test('the iron warlord has an autonomous sword-plant state followed by a stored-bullet detonation', () => {
  const update = extractFunction('_updateAncestors');
  const detonate = extractFunction('_detonateAncestorSword');
  assert.match(update, /a\._swordT>0/, 'the planted state must pause normal movement and attacks');
  assert.match(update, /_ancestorSwordAbsorbProjectiles\(a\)/, 'the planted sword must consume bullets every update');
  assert.match(update, /_detonateAncestorSword\(a\)/, 'the planted state must end in an explosion');
  assert.match(detonate, /a\._swordDmgPool/, 'stored projectile damage contributes to the blast');
  assert.match(detonate, /hurtE\(/, 'the blast damages nearby enemies');
});

test('the planted warlord sword creates a visible world explosion instead of only clearing its ring', () => {
  const detonateSource = extractFunction('_detonateAncestorSword');
  const booms = [];
  const detonate = Function('shQuery', 'dst', 'hurtE', 'EL', 'addParts', 'addTxt', '_T', 'shake', 'playSample', '_r', '_addBoom',
    `${detonateSource};return _detonateAncestorSword`)(
      () => [], () => 9999, () => {}, { D: 3 }, () => {}, () => {}, value => value, () => {}, () => {}, () => 1,
      (...args) => booms.push(args));
  const warlord = { x: 10, y: 20, dmg: 80, _swordX: 100, _swordY: 200, _swordAbsorbed: 0, _swordDmgPool: 0 };

  detonate(warlord);
  assert.deepEqual(booms, [[100, 200, 240, 96, 'dark']], 'the detonation must publish a large, long-lived world impact');
  assert.equal(warlord._swordBlastT, 72, 'the custom ground shockwave remains visible for 1.2 seconds');
  assert.equal(warlord._swordBlastMaxT, 72);
});

test('ancestor summon has one iron warlord and no legacy multi-summon modifier', () => {
  assert.match(gameHtml, /const ANC_ROSTER=\[\{id:'iron_warlord',ko:'철갑 전대',en:'Iron Warlord'\}\];/);
  assert.match(gameHtml, /const _ANC_SPRITE_POOL=\['img\/vfx_ancestor\/ancestor_iron_warlord_v2\.png'\];/);
  assert.doesNotMatch(gameHtml, /ancCount/, 'the former multi-summon affix must not survive a fixed single-summon design');
});

test('iron warlord stops pursuing at his full 142px strike radius instead of residual moving nearby', () => {
  assert.match(gameHtml, /const _ANC_KIT=\[\{reach:142,atkCd:46,radius:142,dmgMult:1\.25,kb:1\.3,hits:1\}\];/,
    'the pursuit stop distance must equal the actual 142px melee hit radius');
  const update = extractFunction('_updateAncestors');
  assert.match(update, /const K=a\.kit\|\|\{reach:142,atkCd:42,radius:110,dmgMult:1,kb:\.5,hits:1\};/,
    'legacy/fallback instances must not reintroduce the short pursuit threshold');
  assert.match(update, /if\(bd>\(K\.reach\|\|142\)\)/,
    'only targets outside the full strike radius may switch the warlord into moving state');
});

test('stationary iron warlord stays ground-anchored instead of receiving a perpetual floating bob', () => {
  assert.match(gameHtml, /const _aF=0;\s*\/\/ authored walk\/swing sheets supply their own motion; idle armor remains ground-anchored\./,
    'the renderer must not add an unconditional vertical sine wave while the AI is stationary');
  assert.match(gameHtml, /const _breath=1;\s*\/\/ scale pulsing moves the feet, so the grounded idle does not use it\./,
    'the renderer must not use vertical scale breathing that makes fixed feet visibly hop');
  assert.doesNotMatch(gameHtml, /const _aF=_planting\?0:Math\.sin\(_at\*2\.6\)\*3/,
    'the old three-pixel idle float must stay retired');
});

test('iron warlord has no timer lifetime and only falls when hostile damage exhausts his HP', () => {
  const stats = extractFunction('_calcAncestorStats');
  const activate = extractFunction('activateAncestorSummon');
  const update = extractFunction('_updateAncestors');
  const hurtSource = extractFunction('_hurtAncestor');

  assert.doesNotMatch(stats, /\bdur\b/, 'duration must not be calculated as a summon stat');
  assert.doesNotMatch(activate, /maxT:/, 'a summon instance must not receive an expiry timer');
  assert.doesNotMatch(update, /a\.t>=a\.maxT/, 'the update loop must never expire an alive warlord by time');
  assert.match(update, /if\(a\._dead\|\|a\.hp<=0\)/, 'only depleted HP may remove the warlord');
  assert.match(gameHtml, /function _ancestorTargetForEnemy\(/, 'hostile projectiles must be able to choose the warlord');
  assert.match(gameHtml, /_hurtAncestor\(_ancHit/, 'a hostile projectile collision must damage the warlord');

  const hurt = Function('addParts', 'addTxt', '_T', `${hurtSource};return _hurtAncestor`)(() => {}, () => {}, value => value);
  const warlord = { x: 10, y: 20, hp: 100, mhp: 100 };
  assert.equal(hurt(warlord, 4), true);
  assert.equal(warlord.hp, 99, 'one hostile contact removes one durability hit regardless of raw damage');
  assert.equal(hurt(warlord, 9999), true);
  assert.equal(warlord.hp, 98, 'boss-scale raw damage is still one hit to the summon');
  for (let i = 0; i < 98; i++) hurt(warlord, 1);
  assert.equal(warlord.hp, 0);
  assert.equal(warlord._dead, true, 'zero HP marks the summon for removal');
});

test('iron warlord endures 100 hostile contacts before falling', () => {
  const hurtSource = extractFunction('_hurtAncestor');
  const hurt = Function('addParts', 'addTxt', '_T', `${hurtSource};return _hurtAncestor`)(() => {}, () => {}, value => value);
  const warlord = { x: 10, y: 20, hp: 100, mhp: 100 };

  for (let i = 0; i < 99; i++) hurt(warlord, i % 2 ? 1 : 100000);
  assert.equal(warlord.hp, 1, 'the 99th hostile contact must not kill the warlord');
  assert.equal(warlord._dead, undefined);
  hurt(warlord, 50000);
  assert.equal(warlord.hp, 0, 'the 100th hostile contact depletes the base endurance meter');
  assert.equal(warlord._dead, true);
});

test('planted ancestor sword glows for five seconds before detonating', () => {
  const begin = extractFunction('_beginAncestorSword');
  const update = extractFunction('_updateAncestors');
  assert.match(begin, /a\._swordMaxT=300;a\._swordT=300/, 'the planted sword must hold for 300 frames (5 seconds)');
  assert.match(gameHtml, /_swordGlow=\.35\+\.65/, 'the full hold state must visibly pulse with stored light');
  assert.match(update, /if\(a\._swordT<=0\)_detonateAncestorSword\(a\)/, 'only the completed five-second hold may detonate');
});

test('the retired duration affix is a maximum-HP affix with legacy-save compatibility', () => {
  const stats = extractFunction('_calcAncestorStats');
  assert.match(gameHtml, /\{id:'ancHP',type:1,tiers:\[\.30,\.60,\.90,1\.20,1\.50\],unit:'pct',slots:\['ossuary'\],group:'ancT',weight:70\}/,
    'new ossuaries must roll a survival affix instead of a duration affix');
  assert.match(stats, /_eqAffix\('ancHP'\)/, 'new maximum-HP rolls must feed the summon HP formula');
  assert.match(stats, /_eqAffix\('ancDur'\)/, 'existing saves with the retired duration id remain useful');
  assert.match(gameHtml, /item\.affixes=\[\{id:'ancHP',tier:3,value:\.9\}\]/,
    'the guaranteed ossuary converts its former +3 second roll into +90% maximum HP');
  const skill = gameHtml.match(/\{id:'ancestorSummon'[^\n]+/);
  assert.ok(skill, 'ancestor summon skill definition must exist');
  assert.doesNotMatch(skill[0], /지속 12초|Duration 12s/, 'the skill card must not advertise an obsolete timer');
});

test('iron warlord portrait cache preserves its vertical source proportions', () => {
  const boxSource = extractFunction('_ancestorPortraitBox');
  const portraitBox = Function(`${boxSource};return _ancestorPortraitBox`)();
  const box = portraitBox(1172, 1340, 1);

  assert.equal(box.cacheH, 320);
  assert.equal(box.cacheW, 280, 'the cache must retain the source 1172:1340 portrait ratio');
  assert.equal(box.drawH, 240, 'the in-game warlord must be taller than the former 180px square');
  assert.equal(box.drawW, 210);
  assert.ok(box.drawH > box.drawW, 'the character must remain a vertical silhouette');
});

test('animation sheets preserve standing body height and the same ground anchor across state changes', () => {
  const drawBox = Function(`${extractFunction('_ancestorDrawBox')};return _ancestorDrawBox`)();
  const profiles = [
    ['idle', 1172, 1340, .958, .973],
    ['walk', 384, 800, .46, .726],
    ['swing', 512, 800, .31, .738],
    ['plant', 384, 800, .55, .87],
    ['emerge', 362, 724, .65, .86],
  ];
  for (const big of [1, 1.35, 2]) {
    for (const [kind, fw, fh, body, foot] of profiles) {
      const box = drawBox(kind, fw, fh, big);
      assert.ok(Math.abs(box.h * body - 230 * big) < 1e-9, `${kind}: body size must survive the transition`);
      assert.ok(Math.abs(box.centerY + box.h * (foot - .5) - 56 * big) < 1e-9, `${kind}: feet must not jump`);
      assert.ok(Math.abs(box.w / box.h - fw / fh) < 1e-9, `${kind}: preserve aspect ratio`);
    }
  }
});

test('iron warlord preserves his black iron and worn gold palette without a forced blue spectral tint', () => {
  assert.doesNotMatch(gameHtml, /rgba\(120,160,255,\.13\)/,
    'the summon is physical ancient armor, not a blue ghost overlay');
});

test('iron warlord does not paste a full crypt illustration over the playable world', () => {
  assert.doesNotMatch(gameHtml, /const _ANC_STAGE_SRC=/,
    'summon depth must come from world-space structures, not one giant background panel');
  assert.doesNotMatch(gameHtml, /window\._ancStageImg/,
    'the retired full-scene stage must not load during normal combat');
  assert.doesNotMatch(gameHtml, /X\.drawImage\(_stage,/,
    'a full crypt painting must never be composited behind or in front of the warlord');
});

test('iron warlord rises through six authored joint-motion frames before autonomous combat', () => {
  assert.match(gameHtml, /const _ANC_EMERGE_SHEET='img\/vfx_ancestor\/ancestor_iron_warlord_emerge_v1\.png';/);
  assert.match(gameHtml, /_emergeT:96,_emergeMaxT:96/,
    'a new summon must spend 1.6 seconds emerging instead of instantly floating in');
  const update = extractFunction('_updateAncestors');
  assert.match(update, /a\._emergeT>0/, 'the emerging warrior must not path or attack until it has stood up');
  assert.match(gameHtml, /window\._ancEmergeImg=new Image\(\);window\._ancEmergeImg\.src=_ANC_EMERGE_SHEET;/);
  assert.match(gameHtml, /X\.drawImage\(_emergeImg,_emergeFrame\*_emergeFW,0,_emergeFW,_emergeFH/,
    'the render path must draw a frame from the authored six-cell sheet, not translate one static portrait');
});

test('iron warlord renders authored plant, walk, and swing sheets without reusing the cropped legacy walk strip', () => {
  assert.match(gameHtml, /const _ANC_PLANT_SHEET='img\/vfx_ancestor\/ancestor_iron_warlord_plant_v2\.png';/);
  assert.match(gameHtml, /const _ANC_WALK_SHEET='img\/vfx_ancestor\/ancestor_iron_warlord_walk_v2\.png';/);
  assert.match(gameHtml, /const _ANC_SWING_SHEET='img\/vfx_ancestor\/ancestor_iron_warlord_swing_v4\.png';/);
  assert.match(gameHtml, /window\._ancPlantImg=new Image\(\);window\._ancPlantImg\.src=_ANC_PLANT_SHEET;/);
  assert.match(gameHtml, /window\._ancWalkImg=new Image\(\);window\._ancWalkImg\.src=_ANC_WALK_SHEET;/);
  assert.match(gameHtml, /window\._ancSwingImg=new Image\(\);window\._ancSwingImg\.src=_ANC_SWING_SHEET;/);
  assert.match(gameHtml, /X\.drawImage\(_plantImg,_plantFrame\*_plantFW,0,_plantFW,_plantFH/,
    'the five-second sword state must visibly play and then hold the planted-sword sheet');
  assert.match(gameHtml, /X\.drawImage\(_walkImg,_walkFrame\*_walkFW,0,_walkFW,_walkFH/,
    'moving warlord must use the authored safe six-cell walk sheet');
  assert.match(gameHtml, /X\.drawImage\(_swingImg,_swingFrame\*_swingFW,0,_swingFW,_swingFH/,
    'melee attack must use the authored safe six-cell greatsword swing sheet');
  assert.doesNotMatch(gameHtml, /ancestor_iron_warlord_walk_v1\.png/,
    'the malformed legacy strip must remain out of the runtime load path');
});

test('iron warlord greatsword swing uses an eight-frame weight-up, impact, and recovery cadence', () => {
  const update = extractFunction('_updateAncestors');
  const frameSource = extractFunction('_ancestorSwingFrame');
  const swingFrame = Function(`${frameSource};return _ancestorSwingFrame`)();

  assert.match(update, /a\._atkT=Math\.max\(0,a\._atkT-sp\*\.026\)/,
    'the attack pose must last roughly 38 simulation frames rather than disappearing in eleven');
  assert.deepEqual(
    [swingFrame(1), swingFrame(.87), swingFrame(.70), swingFrame(.50), swingFrame(.36), swingFrame(.28), swingFrame(.18), swingFrame(.05)],
    [0, 1, 2, 3, 4, 5, 6, 7],
    'the eight phases must cover guard, deep wind-up, lift, apex, impact, trail, and recovery in order',
  );
  assert.match(gameHtml, /const _swingFW=_swingImg\.naturalWidth\/8/,
    'the runtime must use all eight equal-width cells of the new swing strip');
  assert.equal(existsSync(new URL('../img/vfx_ancestor/ancestor_iron_warlord_swing_v4.png', import.meta.url)), true,
    'the authored heavy-swing sheet must ship with the runtime path');
});

test('iron warlord runtime artwork is genuinely RGBA, never a checkerboard preview baked into RGB', () => {
  for (const asset of [
    'img/vfx_ancestor/ancestor_iron_warlord_v2.png',
    'img/vfx_ancestor/ancestor_iron_warlord_emerge_v1.png',
    'img/vfx_ancestor/ancestor_iron_warlord_plant_v2.png',
    'img/vfx_ancestor/ancestor_iron_warlord_walk_v2.png',
    'img/vfx_ancestor/ancestor_iron_warlord_swing_v4.png',
  ]) {
    const format = execFileSync('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=pix_fmt',
      '-of', 'default=noprint_wrappers=1:nokey=1', asset,
    ], { encoding: 'utf8' }).trim();
    assert.match(format, /rgba|ya/, `${asset} must have a real alpha channel`);
  }
});
