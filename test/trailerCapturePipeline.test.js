import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';


const scriptPath = new URL('../tmp/record_ch3_trailer_takes.py', import.meta.url);
const proofRendererPath = new URL('../tmp/render_ch3_trailer_proof.py', import.meta.url);
const expansionPath = new URL('../tmp/record_ch3_trailer_expansion.py', import.meta.url);
const roughV2Path = new URL('../tmp/render_ch3_trailer_rough_v2.py', import.meta.url);
const gameplayCapturePath = new URL('../tmp/trailer_capture.py', import.meta.url);
const finalShowcaseBuilderPath = new URL('../tmp/build_final_showcase_trailer.py', import.meta.url);
const verticalBuilderPath = new URL('../tmp/build_vertical_trailer.py', import.meta.url);
const steamBuilderPath = new URL('../tmp/build_steam_trailer.py', import.meta.url);
const steamTitleArtPath = new URL('../output/imagegen/trailer/steam_title_card_api.png', import.meta.url);
const steamEndArtPath = new URL('../output/imagegen/trailer/steam_end_card_api.png', import.meta.url);

test('CH3 trailer recorder defines three reviewable 1080p WebM takes', () => {
  assert.ok(fs.existsSync(scriptPath), 'the repeatable CH3 trailer recorder must exist');
  const source = fs.readFileSync(scriptPath, 'utf8');

  assert.match(source, /record_video_size=\{"width": 1920, "height": 1080\}/,
    'all source takes must be recorded at 1920x1080');
  for (const name of ['01_establishing', '02_combat', '03_landmarks']) {
    assert.match(source, new RegExp(`${name}\\.webm`), `${name} output must be declared`);
  }
  assert.match(source, /playwright\.chromium\.launch\(headless=True\)/,
    'capture must use the reproducible headless Chromium path');
});

test('CH3 trailer recorder uses the real stage and preserves a silent edit-friendly report', () => {
  assert.ok(fs.existsSync(scriptPath), 'the repeatable CH3 trailer recorder must exist');
  const source = fs.readFileSync(scriptPath, 'utf8');

  assert.match(source, /game\.html\?testchar=1&stage=10&classic=1/,
    'the trailer must record the actual CH3-1 runtime rather than a static mock');
  assert.match(source, /-an/,
    'proof takes must be explicitly silent so licensed music can be added during final editing');
  assert.match(source, /trailer_capture_report\.json/,
    'the recorder must emit deterministic take timing and browser-error evidence');
});

test('cinematic takes suppress the real runtime overlays and canvas pets', () => {
  assert.ok(fs.existsSync(scriptPath), 'the repeatable CH3 trailer recorder must exist');
  const source = fs.readFileSync(scriptPath, 'utf8');

  for (const selector of ['#mmLvl', '#mmWrap', '#petSubtitle', '#skBar', '#skBarTip', '#globeHP', '#globeMP']) {
    assert.match(source, new RegExp(selector.replace('#', '#')),
      `${selector} must be explicitly suppressed for cinematic takes`);
  }
  assert.match(source, /G\.pets=null/,
    'clean pans must suspend canvas-rendered pets instead of leaving them frozen in frame');
  assert.match(source, /_petBubble\.t=0/,
    'all takes must clear pet subtitles before recording starts');
});

test('capture report probes the encoded file duration', () => {
  assert.ok(fs.existsSync(scriptPath), 'the repeatable CH3 trailer recorder must exist');
  const source = fs.readFileSync(scriptPath, 'utf8');

  assert.match(source, /actualDuration/,
    'the report must contain encoded duration rather than only requested trim duration');
});

test('combat take cannot be obscured by test-character low-health grading', () => {
  assert.ok(fs.existsSync(scriptPath), 'the repeatable CH3 trailer recorder must exist');
  const source = fs.readFileSync(scriptPath, 'utf8');

  assert.match(source, /P\._trailerGod=setInterval/,
    'the promo combat take must hold the current health at maximum during the shot');
  assert.match(source, /P\.iframes=99999/,
    'the promo combat take must use the runtime invulnerability-frame field checked by low-HP grading');
  assert.doesNotMatch(source, /P\.inv=Math\.max/,
    'the recorder must not write the unrelated P.inv field');
  assert.doesNotMatch(source, /P\.mhp=Math\.max\(P\.mhp\|\|1,999999\)/,
    'the take must not expose a fake 999999 QA health cap in the HUD');
});

test('proof renderer assembles the approved takes into one 1080p review cut', () => {
  assert.ok(fs.existsSync(proofRendererPath), 'the repeatable proof-cut renderer must exist');
  const source = fs.readFileSync(proofRendererPath, 'utf8');

  assert.match(source, /record_video_size=\{"width": 1920, "height": 1080\}/);
  assert.match(source, /edit_01_establishing\.webm[\s\S]*edit_02_landmarks\.webm[\s\S]*edit_03_combat\.webm/,
    'the proof cut must progress from atmosphere to landmark to combat');
  assert.match(source, /CH3_trailer_proof_cut\.webm/);
  assert.ok(source.indexOf('generated = Path(video.path())') < source.indexOf('browser.close()'),
    'Playwright video.path() must be resolved before the browser event loop closes');
});

test('CH3 trailer expansion records five distinct authored beats', () => {
  assert.ok(fs.existsSync(expansionPath), 'the CH3 trailer expansion recorder must exist');
  const source = fs.readFileSync(expansionPath, 'utf8');

  for (const name of ['04_north_gate', '05_execution', '06_prison', '07_south_route', '08_finisher']) {
    assert.match(source, new RegExp(`${name}\\.webm`), `${name} must be an authored expansion take`);
  }
  assert.match(source, /G\.cam\.x=\(100/,
    'the north-gate take must hold the authored vertical fortress axis');
  assert.match(source, /P\.x=100\.5\*T;P\.y=168\.5\*T/,
    'the route take must start on the canonical south-to-center axis');
  assert.match(source, /page\.keyboard\.down\("KeyW"\)/,
    'the route take must contain real player traversal input');
  assert.match(source, /--take/,
    'the expansion recorder must support replacing one rejected take without rerecording all five');
  assert.match(source, /page\.mouse\.move\(1880, 40\)/,
    'the finisher must clear the enemy-hover tooltip after the aimed right-click');
});

test('rough V2 renderer builds a titled long-form review cut', () => {
  assert.ok(fs.existsSync(roughV2Path), 'the long-form CH3 rough-cut renderer must exist');
  const source = fs.readFileSync(roughV2Path, 'utf8');

  assert.match(source, /record_video_size=\{"width": 1920, "height": 1080\}/);
  assert.match(source, /지옥의 길[\s\S]*MAP 01 — 핏빛 황폐지[\s\S]*COMING SOON/,
    'the rough cut must carry opening, chapter, and end cards');
  assert.match(source, /CH3_trailer_rough_cut_v2\.webm/);
  for (const name of ['04_north_gate', '05_execution', '06_prison', '07_south_route', '08_finisher']) {
    assert.match(source, new RegExp(name), `${name} must appear in the V2 edit sequence`);
  }
});

test('final showcase capture adds ancestor, Kraken parry, and Flame Devil beats', () => {
  assert.ok(fs.existsSync(gameplayCapturePath), 'the deterministic gameplay capture engine must exist');
  const source = fs.readFileSync(gameplayCapturePath, 'utf8');

  for (const name of ['ancestor_summon', 'kraken_parry', 'firedevil_skill']) {
    assert.match(source, new RegExp(`"${name}"\\s*:`), `${name} must be a selectable capture clip`);
  }
  assert.match(source, /activateAncestorSummon\(\)/,
    'the ancestor beat must invoke the real runtime summon skill');
  assert.match(source, /_fbMk\(/,
    'the Kraken beat must use the real field-boss constructor');
  assert.match(source, /_fdMk\(/,
    'the Flame Devil beat must use the real large-monster constructor');
  assert.match(source, /KeyQ/,
    'the Kraken beat must show the playable Q-parry interaction');
  assert.match(source, /"kraken_parry"\s*:\s*\("testchar=1&stage=0&classic=1"/,
    'the Kraken beat must load internal stage index 0 where _fbTick keeps field bosses alive');
  assert.match(source, /"firedevil_skill"\s*:\s*\("testchar=1&stage=0&classic=1"/,
    'the Flame Devil beat must load internal stage index 0 where _fdTick keeps large monsters alive');
  assert.match(source, /winget_ffmpeg/,
    'capture must fall back to the installed full FFmpeg build for H.264 output');
});

test('final showcase builder produces a one-minute 1080p60 H.264/AAC master', () => {
  assert.ok(fs.existsSync(finalShowcaseBuilderPath), 'the final showcase builder must exist');
  const source = fs.readFileSync(finalShowcaseBuilderPath, 'utf8');

  assert.match(source, /trailer_v3_final_candidate\.mp4/,
    'the approved V3 candidate must remain the edit backbone');
  for (const name of ['ancestor_summon.mp4', 'kraken_parry.mp4', 'firedevil_skill.mp4']) {
    assert.match(source, new RegExp(name.replace('.', '\\.')), `${name} must appear in the final EDL`);
  }
  assert.match(source, /EXODUSER_FINAL_TRAILER_20260902\.mp4/);
  assert.match(source, /W\s*,\s*H\s*,\s*FPS\s*=\s*1920\s*,\s*1080\s*,\s*60/);
  assert.match(source, /libx264/);
  assert.match(source, /"aac"/);
  assert.match(source, /TARGET_MIN_SECONDS\s*=\s*60/);
  assert.match(source, /TARGET_MAX_SECONDS\s*=\s*120/);
  assert.match(source, /"-reinit_filter",\s*"0"/,
    'segment filtering must preserve timestamps across V3 color-metadata changes');
  assert.match(source, /abs\(video_duration\s*-\s*audio_duration\)\s*>\s*0\.1/,
    'the builder must reject masters whose video and audio stream lengths diverge');
  assert.match(source, /video_duration\s*<\s*TARGET_MIN_SECONDS/,
    'the builder must reject a video stream shorter than the one-minute target');
  assert.match(source, /WISHLIST NOW/,
    'the final end card must include a clear Steam call to action');
});

test('ancestor showcase keeps the combat ring sparse enough to read the summon silhouette', () => {
  const source = fs.readFileSync(gameplayCapturePath, 'utf8');
  const setup = source.match(/ANCESTOR_SETUP\s*=\s*"""([\s\S]*?)"""/)?.[1] ?? '';
  assert.match(setup, /for\(let i=0;i<10;i\+\+\)/,
    'the summon showcase should use ten targets rather than a dense horde');
  assert.match(setup, /7\.0\+\(i%3\)\*1\.15/,
    'targets should leave a clear inner stage around the summoned ancestor');
});

test('current-runtime capture supports native 9:16 recording', () => {
  const source = fs.readFileSync(gameplayCapturePath, 'utf8');

  assert.match(source, /VERTICAL\s*=\s*"--vertical"\s+in\s+sys\.argv\[1:\]/,
    'capture must expose an explicit native-vertical mode');
  assert.match(source, /FRAME_W\s*,\s*FRAME_H\s*=\s*\(1080\s*,\s*1920\)\s+if\s+VERTICAL/,
    'vertical capture must use a native 1080x1920 viewport');
  assert.match(source, /"source_vertical"\s+if\s+VERTICAL/,
    'fresh vertical sources must be isolated from prior horizontal footage');
  assert.match(source, /CX\s*,\s*CY\s*=\s*FRAME_W\s*\/\/\s*2\s*,\s*FRAME_H\s*\/\/\s*2/,
    'gameplay aim must follow the actual portrait-frame center');
  assert.match(source, /viewport=\{"width":\s*FRAME_W,\s*"height":\s*FRAME_H\}/,
    'Chromium must render the game natively in the portrait viewport');
});

test('vertical final builder uses only newly recorded current-runtime footage', () => {
  assert.ok(fs.existsSync(verticalBuilderPath), 'the native vertical final builder must exist');
  const source = fs.readFileSync(verticalBuilderPath, 'utf8');

  assert.doesNotMatch(source, /trailer_v3_final_candidate|trailer_v1_20260831|EXODUSER_FINAL_TRAILER_20260902/,
    'the rejected old and horizontal masters must never enter the portrait edit');
  assert.match(source, /source_vertical/,
    'all gameplay sources must come from the fresh native-vertical capture directory');
  for (const name of [
    'skill_montage', 'parry', 'ancestor_summon', 'kraken_parry',
    'firedevil_skill', 'ch3_combat', 'druid_pattern', 'druid_combat',
    'boss2_pattern', 'boss2_climax',
  ]) {
    assert.match(source, new RegExp(`${name}\\.mp4`), `${name} must appear in the vertical EDL`);
  }
  assert.match(source, /W\s*,\s*H\s*,\s*FPS\s*=\s*1080\s*,\s*1920\s*,\s*60/);
  assert.match(source, /EXODUSER_VERTICAL_TRAILER_20260902\.mp4/);
  assert.match(source, /TARGET_MIN_SECONDS\s*=\s*60/);
  assert.match(source, /libx264/);
  assert.match(source, /"aac"/);
  assert.match(source, /abs\(video_duration\s*-\s*audio_duration\)\s*>\s*0\.1/,
    'portrait master must reject A/V stream drift');
  assert.match(source, /WISHLIST NOW/,
    'the portrait end card must retain the campaign call to action');
});

test('Steam capture isolates fresh native 16:9 footage and removes Holy Blast', () => {
  const source = fs.readFileSync(gameplayCapturePath, 'utf8');

  assert.match(source, /STEAM\s*=\s*"--steam"\s+in\s+sys\.argv\[1:\]/,
    'capture must expose a dedicated Steam recording mode');
  assert.match(source, /if\s+VERTICAL\s+and\s+STEAM:/,
    'portrait and Steam capture modes must be mutually exclusive');
  assert.match(source, /"source_steam"\s+if\s+STEAM/,
    'Steam sources must not share a directory with old or portrait footage');
  assert.match(source, /"boss2_pattern"\s*:[^\n]+,"C"\)/,
    'late-boss pattern must use the dark loadout instead of Holy Blast');
  assert.match(source, /"boss2_climax"\s*:[^\n]+,"C"\)/,
    'late-boss climax must use the dark loadout instead of Holy Blast');
});

test('Steam final is a fresh 1080p60 gameplay-first upload master', () => {
  assert.ok(fs.existsSync(steamTitleArtPath), 'the API-generated Steam title artwork must exist');
  assert.ok(fs.existsSync(steamEndArtPath), 'the API-generated Steam end-card artwork must exist');
  assert.ok(fs.existsSync(steamBuilderPath), 'the Steam-specific final builder must exist');
  const source = fs.readFileSync(steamBuilderPath, 'utf8');

  assert.doesNotMatch(source,
    /trailer_v3_final_candidate|trailer_v1_20260831|source_vertical|EXODUSER_FINAL_TRAILER_20260902|holyBlast/,
    'Steam edit must contain no old, portrait, rejected, or Holy Blast source');
  assert.match(source, /source_steam/,
    'all gameplay must come from fresh Steam-mode captures');
  assert.match(source, /W\s*,\s*H\s*,\s*FPS\s*=\s*1920\s*,\s*1080\s*,\s*60/);
  assert.match(source, /EXODUSER_STEAM_TRAILER_20260902\.mp4/);
  assert.match(source, /TARGET_VIDEO_BITRATE\s*=\s*"20M"/,
    'Steam master must use the official recommended 20 Mbps encode target');
  assert.match(source, /EDL\s*=\s*\[\s*\(\s*"shot"\s*,\s*SKILL_MONTAGE/s,
    'the first trailer beat must be gameplay, not a title card');
  assert.match(source, /steam_title_card_api\.png/,
    'title design must use the generated API artwork');
  assert.match(source, /steam_trailer_poster_1920x1080\.jpg/,
    'the delivery package must include a Steam-compatible poster candidate');
  assert.match(source, /TARGET_MIN_SECONDS\s*=\s*60/);
  assert.match(source, /"aac"/);
});
