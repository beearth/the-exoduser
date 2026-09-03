import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';


const capturePath = new URL('../tmp/trailer_capture_remake.py', import.meta.url);
const builderPath = new URL('../tmp/build_steam_trailer_remake.py', import.meta.url);
const titleArtPath = new URL('../output/imagegen/trailer/steam_title_card_api_v2.png', import.meta.url);
const endArtPath = new URL('../output/imagegen/trailer/steam_end_card_api_v2.png', import.meta.url);
const bossFixCapturePath = new URL('../tmp/trailer_capture_bossfix.py', import.meta.url);
const bossFixBuilderPath = new URL('../tmp/build_steam_trailer_bossfix.py', import.meta.url);
const lavaBossArtPath = new URL('../output/imagegen/trailer/boss_lava_warbringer_chroma_v1.png', import.meta.url);
const wormQueenArtPath = new URL('../output/imagegen/trailer/boss_worm_queen_chroma_v1.png', import.meta.url);

test('Steam remake records a new current-runtime source set with controlled Kraken impact and parry beats', () => {
  assert.ok(fs.existsSync(capturePath), 'the remake capture entry point must exist');
  const source = fs.readFileSync(capturePath, 'utf8');

  assert.match(source, /source_steam_remake_20260902/,
    'the remake must never overwrite or consume the prior Steam source directory');
  for (const name of [
    'skill_montage', 'parry', 'ancestor_summon', 'kraken_impact',
    'kraken_parry', 'firedevil_skill', 'ch3_skill', 'druid_intro',
    'druid_combat', 'boss1_pattern', 'boss2_pattern', 'boss2_climax',
  ]) {
    assert.match(source, new RegExp(`['\"]${name}['\"]`), `${name} must be freshly captured`);
  }
  assert.match(source, /_fbFireEnergy\(/,
    'the Kraken shots must invoke the real runtime large-projectile skill');
  assert.match(source, /def kraken_impact_events/,
    'the remake must include a readable contact-and-explosion take');
  assert.match(source, /def kraken_parry_events[\s\S]*KeyQ/,
    'the remake must include a separate Q-parry ten-way split take');
  assert.match(source, /_hitFlash\.a=0[\s\S]*scrFlashA=0/,
    'capture-only red screen wash must be suppressed without removing world impact VFX');
  assert.doesNotMatch(source, /holyBlast/i,
    'the remake capture entry point must not reference the removed Holy Blast skill');
});

test('Steam remake builder uses only v2 API cards and newly captured landscape footage', () => {
  assert.ok(fs.existsSync(titleArtPath), 'the newly generated v2 title art must exist');
  assert.ok(fs.existsSync(endArtPath), 'the newly generated v2 end art must exist');
  assert.ok(fs.existsSync(builderPath), 'the remake builder must exist');
  const source = fs.readFileSync(builderPath, 'utf8');

  assert.match(source, /source_steam_remake_20260902/);
  assert.match(source, /trailer_steam_remake_20260902/);
  assert.match(source, /EXODUSER_STEAM_TRAILER_REMAKE_20260902\.mp4/);
  assert.match(source, /steam_trailer_remake_poster_clean_1920x1080\.jpg/);
  assert.match(source, /poster_timestamp_seconds\s*=\s*2\.5/,
    'the reproducible poster frame must avoid the full-screen hit-flash frame');
  assert.match(source, /steam_title_card_api_v2\.png/);
  assert.match(source, /steam_end_card_api_v2\.png/);
  assert.match(source, /W\s*,\s*H\s*,\s*FPS\s*=\s*1920\s*,\s*1080\s*,\s*60/);
  assert.match(source, /TARGET_MIN_SECONDS\s*=\s*60/);
  assert.match(source, /gameplay_before_title\s*=\s*7\.7/,
    'the delivery report must state the actual pre-title gameplay duration');
  assert.match(source, /gameplayBeforeTitleSeconds/,
    'the wrapper must correct the inherited report metadata after rendering');
  assert.match(source, /data\["poster"\]/,
    'the delivery report must point at the clean replacement poster');
  assert.match(source, /EDL\s*=\s*\[\s*\(\s*['\"]shot['\"]\s*,\s*SKILL_MONTAGE/s,
    'gameplay must remain the first frame of the remake');
  for (const name of ['kraken_impact.mp4', 'kraken_parry.mp4', 'ancestor_summon.mp4']) {
    assert.match(source, new RegExp(name.replace('.', '\\.')), `${name} must appear in the remake EDL`);
  }
  assert.doesNotMatch(source,
    /source_steam(?!_remake)|source_vertical|trailer_v3_final_candidate|holyBlast/i,
    'the remake edit must not use superseded sources or Holy Blast');
});

test('boss-fix capture keeps each boss body in the camera safe area without a minion pile', () => {
  assert.ok(fs.existsSync(bossFixCapturePath), 'the dedicated boss-visibility capture entry point must exist');
  assert.ok(fs.existsSync(lavaBossArtPath), 'the new API lava-boss art must exist');
  assert.ok(fs.existsSync(wormQueenArtPath), 'the new API Worm Queen art must exist');
  const source = fs.readFileSync(bossFixCapturePath, 'utf8');

  assert.match(source, /source_steam_bossfix_20260902/);
  assert.match(source, /BOSS_SAFE_X\s*=\s*0\.50/,
    'the boss must be horizontally centered');
  assert.match(source, /BOSS_SAFE_Y\s*=\s*0\.39/,
    'the boss anchor must sit above the player and clear the bottom HUD');
  assert.match(source, /G\.cam\.x\s*=\s*b\.x\s*-\s*\(BOSS_SAFE_X\s*-\s*0\.5\)\s*\*\s*VW/);
  assert.match(source, /G\.cam\.y\s*=\s*b\.y\s*-\s*\(BOSS_SAFE_Y\s*-\s*0\.5\)\s*\*\s*VH/);
  assert.match(source, /window\.__trailerBossVisible/,
    'the capture must emit a runtime boss screen-position contract');
  assert.match(source, /window\._b3Active\s*=\s*false[\s\S]*draw\(\)/,
    'the deterministic capture must composite the 2D boss fallback into the recorded frame');
  assert.match(source, /boss3dCvs[\s\S]*display[\s\S]*none/,
    'the opaque-background GLB overlay must be hidden in the trailer capture');
  for (const asset of [
    'boss_lava_warbringer_chroma_v1.png',
    'boss_dark_druid_walk.png',
    'boss_worm_queen_chroma_v1.png',
  ]) assert.match(source, new RegExp(asset.replace('.', '\\.')));
  assert.doesNotMatch(source, /boss_dark_druid_f0\.png/,
    'the trailer must not substitute the obsolete single-frame Druid cutout');
  assert.match(source, /G\.stage===3[\s\S]*_druidDir\(b\)[\s\S]*bossArt\.width\/4[\s\S]*bossArt\.height\/8/,
    'the Druid overlay must crop the same 4x8 directional walk sheet used by the game');
  assert.match(source, /drawImage\(bossArt,srcX,srcY,srcW,srcH,-targetW\/2,-targetH\/2,targetW,targetH\)/,
    'the overlay must draw one Druid cell rather than the entire sprite sheet');
  assert.match(source, /g>180&&g>r\*1\.35&&g>b\*1\.35[\s\S]*data\[i\+3\]=0/,
    'the two API assets must be converted from chroma green to actual alpha in-browser');
  assert.match(source, /targetH\s*=\s*G\.stage===9\?500:\(G\.stage===3\?560:620\)/,
    'each boss must have an authored trailer-scale body height');
  assert.match(source, /shadowBlur\s*=\s*35[\s\S]*drawImage\(bossArt/,
    'the boss artwork must be composited over the live fight with alpha-shaped rim light');
  assert.match(source, /trailerBossOverlay[\s\S]*zIndex\s*=\s*'10'/,
    'the boss overlay must sit above world canvases and below the z20-22 HUD');
  assert.match(source, /overlayX\.clearRect[\s\S]*overlayX\.drawImage\(bossArt/,
    'the persistent overlay, not the game canvas, must receive every boss frame');
  assert.match(source, /pixelSize\s*=\s*\{w:targetW,h:targetH\}/,
    'the runtime visibility report must retain the composited boss pixel dimensions');
  assert.match(source, /const bossArtImage=new Image\(\)[\s\S]*await new Promise[\s\S]*bossArtImage\.src=bossArtPaths\[G\.stage\]/,
    'capture setup must explicitly await the stage-specific boss art');
  assert.match(source, /renderer='persistent-overlay-canvas'/,
    'the visibility report must identify the persistent overlay renderer');
  assert.doesNotMatch(source, /_atlasExtB_frames|runtime-2d-composite/,
    'a second atlas fallback must not overwrite the verified overlay or its report');
  assert.match(source, /_hitFlash\.a\s*=\s*0[\s\S]*scrFlashA\s*=\s*0/,
    'full-screen damage washes must not hide the boss silhouette');
  assert.match(source, /G\.stage\s*===\s*3\s*\?\s*1\.8\s*:\s*4\.0/,
    'small atlas bosses must be enlarged while the naturally tall Druid remains framed');
  assert.match(source, /G\._fireDevils\s*=\s*\[\][\s\S]*G\._fieldBosses\s*=\s*\[\][\s\S]*G\.pets\s*=\s*null/,
    'warm-up field bosses and pets must be removed from boss-readability takes');
  assert.match(source, /P\.x=o\.x\+4\.0\*o\.T/,
    'the player must strafe at the boss flank instead of covering its body');
  assert.doesNotMatch(source, /for\s*\(let i\s*=\s*0\s*;\s*i\s*<\s*8/,
    'boss readability takes must not bury the boss under eight spawned minions');
  assert.doesNotMatch(source, /KeyZ|blackStar/,
    'boss visibility takes must not cover the body with a full-screen ultimate');
  assert.match(source, /def boss_reveal_events[\s\S]*_btFrozen=true[\s\S]*b\.s='idle'/,
    'the reveal take must hold the Druid above ground in a readable idle pose');
});

test('boss-fix builder replaces every boss segment while retaining current-remake non-boss footage', () => {
  assert.ok(fs.existsSync(bossFixBuilderPath), 'the boss-fix Steam builder must exist');
  const source = fs.readFileSync(bossFixBuilderPath, 'utf8');

  assert.match(source, /EXODUSER_STEAM_TRAILER_BOSSFIX_20260902\.mp4/);
  assert.match(source, /source_steam_remake_20260902/,
    'non-boss shots remain the fresh current-runtime remake footage');
  assert.match(source, /source_steam_bossfix_20260902/,
    'all boss shots must come from the dedicated visibility captures');
  for (const name of ['druid_intro', 'druid_combat', 'boss1_pattern', 'boss2_pattern', 'boss2_climax']) {
    assert.match(source, new RegExp(`BOSS_SOURCE\\s*\\/\\s*['\"]${name}\\.mp4['\"]`),
      `${name} must be replaced by a boss-safe capture`);
  }
});
