#!/usr/bin/env node
/** Browser integration QA. Uses a fresh context and only the FDG studio save key. */
import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = await import(process.env.FDG_PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.FDG_STUDIO_URL || 'http://localhost:3333/tools/fdg-studio/';
const outputDirectory = path.resolve(process.env.FDG_QA_OUTPUT || 'tmp/fdg-engine-20261010/qa');
await mkdir(outputDirectory, { recursive: true });
const report = { url: baseURL, checks: [], pageErrors: [], asset404: [], screenshots: [] };
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.FDG_CHROME_EXECUTABLE
    ? { executablePath: process.env.FDG_CHROME_EXECUTABLE } : { channel: 'chrome' }) });
} catch (error) {
  if (process.env.FDG_CHROME_EXECUTABLE) throw error;
  browser = await chromium.launch({ headless: true });
}
const context = await browser.newContext({ viewport: { width: 1600, height: 1050 }, acceptDownloads: true });
const page = await context.newPage();
page.setDefaultTimeout(15_000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('response', response => {
  if (response.status() === 404 && /\.(png|jpe?g|webp)(?:\?|$)|\/assets\//i.test(response.url())) report.asset404.push(response.url());
});
page.on('dialog', dialog => dialog.accept());

const snapshot = () => page.evaluate(() => window.FDGStudio.project);
const runtimeState = () => page.evaluate(() => ({
  running: window.FDGStudio.running, state: window.FDGStudio.runtime.state,
  player: { ...window.FDGStudio.runtime.player }, stats: { ...window.FDGStudio.runtime.stats },
  particles: window.FDGStudio.runtime.particles.active.map(index => {
    const particle = window.FDGStudio.runtime.particles.pool[index];
    return { index, age: particle.age, x: particle.x, y: particle.y };
  }),
}));
const settled = () => page.waitForFunction(() => window.FDGStudio && !document.getElementById('play').disabled);
// Drafts deliberately cannot enter Play. Wait for their actual pixel inspection instead.
const draftSettled = id => page.waitForFunction(id => {
  const studio = window.FDGStudio, inspection = studio?.characterInspection;
  return studio?.selected.group === 'characterDrafts' && studio.selected.id === id
    && inspection?.declaredFrames === 24 && inspection.summary.fps === 24
    && document.getElementById('frame').max === '23';
}, id);
// Compare actual RGBA pixels. PNG encoder bytes are not the rendered image contract.
// The short digest also keeps assertion failures from printing megabytes of base64.
const canvasImage = () => page.locator('#character-canvas').evaluate(async canvas => {
  const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', pixels));
  return `${canvas.width}x${canvas.height}:${[...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
});
const decodeImage = src => page.evaluate(src => new Promise((resolve, reject) => {
  const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
  image.onerror = () => reject(new Error(`PNG decode failed: ${src}`)); image.src = new URL(`/${src}`, location.origin).href;
}), src);
const select = async (group, id) => {
  await page.locator(`.resource-row[data-group="${group}"][data-id="${id}"]`).click();
  await page.waitForFunction(({ group, id }) => window.FDGStudio.selected.group === group && window.FDGStudio.selected.id === id, { group, id });
};
const check = async (name, run) => {
  await run();
  assert.deepEqual(report.pageErrors, [], `Browser JavaScript error during ${name}`);
  assert.deepEqual(report.asset404, [], `Missing PNG during ${name}`);
  report.checks.push({ name, status: 'PASS' });
  console.log(`PASS ${name}`);
};
const screenshot = async tab => {
  const filename = path.join(outputDirectory, `${tab}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  report.screenshots.push(filename);
};
const importProject = data => page.locator('#file-input').setInputFiles({
  name: 'smoke.fdg.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)),
});

try {
  await check('Studio boots with valid project and all PNG assets', async () => {
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await settled();
    assert.equal(await page.evaluate(() => window.FDGStudio.validation.ok), true);
    assert.equal((await runtimeState()).stats.assetErrors, 0);
    assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  });
  const original = await snapshot();

  await check('One map drag creates one reversible brush transaction', async () => {
    await select('map', 'map');
    await page.locator('#brush-size').selectOption('1');
    const point = original.map.tiles.findIndex((tile, index) => tile === 0 && index % 200 < 190 && index > 400 && index < 1000);
    assert.ok(point >= 0, 'Default map has a safe outer-wall patch for the brush test');
    const x = point % 200, y = Math.floor(point / 200);
    await page.locator('#brush').selectOption('1');
    const bounds = await page.locator('#map-canvas').boundingBox();
    const pixel = (tx, ty) => ({ x: bounds.x + (tx + .5) * bounds.width / 200, y: bounds.y + (ty + .5) * bounds.height / 200 });
    const from = pixel(x, y), to = pixel(x + 4, y);
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 4 });
    assert.deepEqual(await snapshot(), original, 'Uncommitted drag does not change the project');
    await page.mouse.up(); await settled();
    const painted = await snapshot();
    assert.notDeepEqual(painted.map.tiles, original.map.tiles);
    for (let i = 0; i <= 4; i += 1) assert.equal(painted.map.tiles[y * 200 + x + i], 1);
    await page.locator('#undo').click(); await settled();
    assert.deepEqual(await snapshot(), original, 'One undo restores the complete drag');
    assert.equal(await page.locator('#undo').isDisabled(), true);
    await page.locator('#redo').click(); await settled();
    assert.deepEqual(await snapshot(), painted);
    await page.locator('#undo').click(); await settled();
    await screenshot('map');
  });

  const skillId = original.preview.skillId;
  await check('Inspector cooldown saves and restores without gameplay save keys', async () => {
    await select('skills', skillId);
    await page.getByLabel(/^재사용 대기/).fill('2.8');
    await page.getByLabel(/^재사용 대기/).press('Tab');
    await page.waitForFunction(id => window.FDGStudio.project.skills.find(skill => skill.id === id).cooldown === 2.8, skillId);
    await settled(); await page.locator('#save').click();
    const storage = await page.evaluate(() => ({ keys: Object.keys(localStorage), key: window.FDGStudio.storageKey, saved: JSON.parse(localStorage.getItem(window.FDGStudio.storageKey)) }));
    assert.deepEqual(storage.keys, [storage.key]);
    assert.equal(storage.saved.skills.find(skill => skill.id === skillId).cooldown, 2.8);
    await page.reload({ waitUntil: 'networkidle' }); await settled();
    assert.equal((await snapshot()).skills.find(skill => skill.id === skillId).cooldown, 2.8);
    await select('skills', skillId);
    const cooldown = original.skills.find(skill => skill.id === skillId).cooldown;
    await page.getByLabel(/^재사용 대기/).fill(String(cooldown));
    await page.getByLabel(/^재사용 대기/).press('Tab'); await settled();
    assert.deepEqual(await snapshot(), original);
  });

  await check('Broken-reference file import preserves the project; downloaded JSON round-trips', async () => {
    const before = await snapshot(), invalid = structuredClone(before);
    invalid.skills[0].vfx = 'missing-smoke-vfx';
    await importProject(invalid);
    await page.waitForFunction(() => document.getElementById('status').textContent.includes('불러오기 실패'));
    assert.deepEqual(await snapshot(), before);
    const downloadEvent = page.waitForEvent('download'); await page.locator('#export').click();
    const download = await downloadEvent, downloadedFile = path.join(outputDirectory, download.suggestedFilename());
    await download.saveAs(downloadedFile);
    const exported = JSON.parse(await readFile(downloadedFile, 'utf8'));
    assert.deepEqual(exported, before);
    await importProject(exported);
    await page.waitForFunction(() => document.getElementById('status').textContent.includes('불러오기 완료')); await settled();
    assert.deepEqual(await snapshot(), before);
  });

  await check('Duplicated resource gets a unique stable ID through undo and redo', async () => {
    await select('skills', skillId);
    const before = await snapshot(); await page.locator('#duplicate').click(); await settled();
    const duplicate = await page.evaluate(() => window.FDGStudio.selected.id);
    assert.notEqual(duplicate, skillId);
    const after = await snapshot();
    assert.equal(after.skills.length, before.skills.length + 1);
    assert.equal(new Set(after.skills.map(skill => skill.id)).size, after.skills.length);
    assert.deepEqual(after.skills.find(skill => skill.id === skillId), before.skills.find(skill => skill.id === skillId));
    assert.equal(after.skills.find(skill => skill.id === duplicate).vfx, before.skills.find(skill => skill.id === skillId).vfx);
    await page.locator('#undo').click(); await settled(); assert.deepEqual(await snapshot(), before);
    await page.locator('#redo').click(); await settled(); assert.deepEqual(await snapshot(), after);
    assert.equal((await snapshot()).skills.at(-1).id, duplicate);
    await page.locator('#undo').click(); await settled();
    await select('skills', skillId);
    await page.locator('#cast').click(); await page.locator('#step').click();
    const state = await runtimeState();
    assert.equal(state.stats.casts, 1); assert.ok(state.stats.resource < state.stats.resourceMax);
    assert.ok(state.stats.cooldownRemaining > 0);
    await screenshot('skills');
  });

  await check('Both characters decode all eight direction PNGs and scrub actual animation frames', async () => {
    const decoded = [];
    for (const character of original.characters) {
      await select('characters', character.id);
      for (const [direction, src] of Object.entries(character.sprite.directions)) {
        await page.locator('#direction').selectOption(direction);
        const dimensions = await decodeImage(src);
        assert.equal(dimensions.width, character.sprite.frameWidth * character.sprite.columns);
        assert.equal(dimensions.height, character.sprite.frameHeight * character.sprite.rows);
        decoded.push(src);
      }
    }
    assert.equal(decoded.length, 16);
    await select('characters', original.characters[0].id);
    await page.locator('#direction').selectOption('south');
    await page.locator('#animation').selectOption('walk');
    await page.waitForFunction(() => Number(document.getElementById('frame').max) === window.FDGStudio.project.characters[0].animations.walk.frames - 1);
    await page.locator('#frame').focus(); await page.keyboard.press('Home');
    const first = await canvasImage();
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#frame-value').textContent(), `4 / ${original.characters[0].animations.walk.frames}`);
    const scrubbed = await canvasImage();
    assert.notEqual(scrubbed, first, 'Frame scrub updates the rendered character canvas');
    await screenshot('characters');
  });

  await check('VFX pause freezes particles and manual step advances exactly one 60Hz tick', async () => {
    const vfxId = original.vfx.find(vfx => vfx.life >= 1)?.id || original.preview.vfxId;
    await select('vfx', vfxId); await page.locator('#emit').click(); await page.locator('#step').click();
    const paused = await runtimeState();
    assert.equal(paused.state, 'paused'); assert.ok(paused.particles.length > 0);
    await page.waitForTimeout(220);
    const waiting = await runtimeState();
    assert.equal(waiting.stats.time, paused.stats.time); assert.deepEqual(waiting.particles, paused.particles);
    await page.locator('#step').click(); const stepped = await runtimeState();
    assert.ok(Math.abs(stepped.stats.time - paused.stats.time - 1 / 60) < 1e-8);
    assert.equal(stepped.particles.length, paused.particles.length);
    stepped.particles.forEach((particle, index) => assert.ok(Math.abs(particle.age - paused.particles[index].age - 1 / 60) < 1e-8));
    assert.equal(stepped.state, 'paused'); await screenshot('vfx');
  });

  await check('Focused WASD and Space work; Escape and canvas blur release movement', async () => {
    await page.locator('#play').click(); await page.locator('#runtime-canvas').focus();
    assert.equal((await runtimeState()).running, true);
    for (const key of ['w', 's', 'a', 'd']) {
      const before = (await runtimeState()).player;
      await page.keyboard.down(key); await page.waitForTimeout(120); await page.keyboard.up(key);
      const after = (await runtimeState()).player;
      assert.ok(Math.hypot(after.x - before.x, after.y - before.y) > .1, `Focused ${key.toUpperCase()} moves the character`);
    }
    await page.waitForFunction(() => window.FDGStudio.runtime.stats.cooldownRemaining === 0);
    const casts = (await runtimeState()).stats.casts;
    await page.keyboard.press('Space');
    assert.equal((await runtimeState()).stats.casts, casts + 1);
    await page.keyboard.down('w'); await page.waitForTimeout(80); await page.keyboard.press('Escape');
    const stopped = await runtimeState();
    assert.equal(stopped.running, false); assert.equal(stopped.state, 'paused');
    await page.waitForTimeout(180); assert.deepEqual((await runtimeState()).player, stopped.player);
    await page.keyboard.up('w');
    await page.locator('#play').click(); await page.locator('#runtime-canvas').focus();
    await page.keyboard.down('d'); await page.waitForTimeout(80); await page.locator('#search').focus();
    const blurred = (await runtimeState()).player;
    await page.waitForTimeout(180); const afterBlur = (await runtimeState()).player;
    // Blur releases movement while the running attack animation may finish normally.
    assert.deepEqual({ x: afterBlur.x, y: afterBlur.y }, { x: blurred.x, y: blurred.y });
    await page.keyboard.up('d'); await page.keyboard.press('Escape');
    assert.equal((await runtimeState()).state, 'paused');
    assert.deepEqual(await snapshot(), original, 'Play does not mutate authoring resources');
    await page.locator('#save').click();
  });

  await check('Three reference drafts decode 24 distinct cells and support frame 23, original/compare views and 1×/2×/4× inspection', async () => {
    assert.deepEqual(original.characterDrafts.map(draft => draft.id), ['transmuter', 'hell_hunter', 'arcane_lancer']);
    report.characterQuality = [];
    for (const draft of original.characterDrafts) {
      await select('characterDrafts', draft.id); await draftSettled(draft.id);
      assert.deepEqual(await decodeImage(draft.clip.src), { width: 4608, height: 1728 });
      const reference = await decodeImage(draft.referenceSrc);
      assert.ok(reference.width > 0 && reference.height > 0);
      const inspection = await page.evaluate(() => window.FDGStudio.characterInspection);
      assert.equal(inspection.distinctFrameCount, 24);
      assert.equal(inspection.technical.status, 'review');
      assert.equal(inspection.subjectiveStatus, 'unreviewed');
      assert.equal(inspection.summary.duration, 1); assert.equal(inspection.summary.hasTransparency, false);
      assert.ok(inspection.technical.warnings.some(warning => warning.code === 'opaque-background'));
      assert.match(await page.locator('#quality-badge').textContent(), /24장.*24FPS.*TECH REVIEW/);
      assert.match(await page.locator('#quality-summary').textContent(), /24\/24.*참고 모션.*배경 포함.*제작 대기/);
      assert.equal(await page.getByLabel('모델·리깅', { exact: true }).inputValue(), '게임용 모델 미확보');
      assert.match(await page.getByLabel('방향별 본체', { exact: true }).inputValue(), /8방향.*24장.*대기/);
      assert.equal(await page.locator('#direction').isDisabled(), true);
      assert.equal(await page.locator('#animation').isDisabled(), true);
      assert.equal(await page.locator('#play').isDisabled(), true);
      assert.equal(await page.evaluate(() => window.FDGStudio.validation.ok), true);
      assert.equal(await page.locator('#play').isDisabled(), true, 'A valid project cannot enable reference-draft gameplay');
      await page.locator('#character-view').selectOption('motion');
      await page.locator('#character-zoom').selectOption('1');
      await page.locator('#frame').focus(); await page.keyboard.press('Home');
      assert.equal(await page.locator('#frame-value').textContent(), '1 / 24');
      const first = await canvasImage();
      await page.keyboard.press('End');
      assert.equal(await page.locator('#frame').inputValue(), '23');
      assert.equal(await page.locator('#frame-value').textContent(), '24 / 24');
      const last = await canvasImage(); assert.notEqual(last, first, 'Last material frame renders when scrubbed');
      await page.locator('#character-view').selectOption('reference');
      const originalView = await canvasImage(); assert.notEqual(originalView, last);
      await page.locator('#character-view').selectOption('compare');
      const compared = await canvasImage(); assert.notEqual(compared, originalView); assert.notEqual(compared, last);
      await page.locator('#character-zoom').selectOption('2');
      const zoom2 = await canvasImage(); assert.notEqual(zoom2, compared);
      await page.locator('#character-zoom').selectOption('4');
      const zoom4 = await canvasImage(); assert.notEqual(zoom4, zoom2);
      await page.locator('#character-zoom').selectOption('1');
      assert.ok(await canvasImage() === compared, '1× restores identical RGBA pixels for the same paused frame and comparison');
      const bounds = await page.locator('#character-canvas').boundingBox();
      // The second contact-sheet row must select its real row-major cell (index 13).
      await page.locator('#character-canvas').click({ position: { x: 142 * bounds.width / 960, y: 562 * bounds.height / 600 } });
      assert.equal(await page.locator('#frame').inputValue(), '13');
      assert.equal(await page.locator('#frame-value').textContent(), '14 / 24');
      await page.locator('#frame').focus(); await page.keyboard.press('Home');
      await page.locator('#animate').click();
      await page.waitForFunction(() => Number(document.getElementById('frame').value) > 0);
      await page.waitForFunction(() => document.getElementById('frame').value === '23'
        && document.getElementById('animate').textContent.includes('▶'));
      const ended = await canvasImage();
      await page.waitForTimeout(220);
      assert.equal(await page.locator('#frame').inputValue(), '23', 'Non-looping draft playback holds its final source frame');
      assert.ok(await canvasImage() === ended, 'Completed playback remains paused without wrapping to frame 0');
      report.characterQuality.push({ id: draft.id, frames: inspection.declaredFrames, distinctFrames: inspection.distinctFrameCount,
        fps: inspection.summary.fps, technical: inspection.technical.status, sourceReview: draft.provenance.reviewStatus,
        gameplayApplied: draft.provenance.gameplayApplied, modelAvailable: draft.provenance.modelAvailable });
    }
    assert.deepEqual(await snapshot(), original, 'Viewing and pixel inspection cannot alter authoring resources');
    await screenshot('character-quality');
  });

  await check('Manual character quality review is undoable and preserves reference-only source classification', async () => {
    const id = original.characterDrafts[0].id;
    await select('characterDrafts', id); await draftSettled(id);
    const before = await snapshot();
    await page.getByLabel('무기 구조', { exact: true }).selectOption('retouch');
    await page.waitForFunction(id => window.FDGStudio.project.characterDrafts.find(draft => draft.id === id).review?.weapon === 'retouch', id);
    await draftSettled(id);
    const reviewed = await snapshot(), reviewedDraft = reviewed.characterDrafts.find(draft => draft.id === id);
    assert.deepEqual(reviewedDraft.review, { weapon: 'retouch' });
    assert.deepEqual(reviewedDraft.provenance, before.characterDrafts.find(draft => draft.id === id).provenance);
    assert.equal(await page.locator('#play').isDisabled(), true);
    await page.locator('#undo').click(); await draftSettled(id);
    assert.deepEqual(await snapshot(), before, 'One undo removes the manual review record');
    assert.equal(await page.getByLabel('무기 구조', { exact: true }).inputValue(), 'pending');
    await page.locator('#redo').click(); await draftSettled(id); assert.deepEqual(await snapshot(), reviewed);
    assert.equal(await page.getByLabel('무기 구조', { exact: true }).inputValue(), 'retouch');
    await page.locator('#undo').click(); await draftSettled(id); assert.deepEqual(await snapshot(), original);
  });

  await check('Legacy project import restores 24FPS and all three reference drafts with one undo per button', async () => {
    const legacy = structuredClone(original); delete legacy.characterDrafts; delete legacy.characterQuality;
    for (const character of legacy.characters) {
      character.sprite.fps = 12;
      for (const [index, animation] of Object.values(character.animations).entries()) animation.fps = 6 + index * 4;
    }
    // Import while a now-missing draft is selected exercises the backward-compatible selection fallback.
    await importProject(legacy);
    await page.waitForFunction(() => document.getElementById('status').textContent.includes('불러오기 완료')
      && window.FDGStudio.project.characterDrafts === undefined);
    await settled(); assert.deepEqual(await snapshot(), legacy);
    assert.equal(await page.locator('.resource-row[data-group="characterDrafts"]').count(), 0);
    await select('characters', legacy.characters[0].id); await settled();
    await page.locator('#apply-24fps').click();
    await page.waitForFunction(() => window.FDGStudio.project.characters.every(character => character.sprite.fps === 24
      && Object.values(character.animations).every(animation => animation.fps === 24)));
    await settled();
    const applied = await snapshot(), expected = structuredClone(legacy);
    expected.characterQuality = { frames: 24, fps: 24 };
    for (const character of expected.characters) {
      character.sprite.fps = 24; for (const animation of Object.values(character.animations)) animation.fps = 24;
    }
    assert.deepEqual(applied, expected, '24FPS adjusts speed and target without inventing missing source frames');
    await page.locator('#undo').click(); await settled(); assert.deepEqual(await snapshot(), legacy);
    await page.locator('#redo').click(); await settled(); assert.deepEqual(await snapshot(), applied);
    await page.locator('#undo').click(); await settled();
    await page.locator('#sync-character-drafts').click(); await draftSettled(original.characterDrafts[0].id);
    const linked = await snapshot(), expectedLinked = structuredClone(legacy);
    expectedLinked.characterDrafts = structuredClone(original.characterDrafts); expectedLinked.characterQuality = { frames: 24, fps: 24 };
    assert.deepEqual(linked, expectedLinked);
    assert.equal(await page.locator('.resource-row[data-group="characterDrafts"]').count(), 3);
    assert.equal(await page.locator('#play').isDisabled(), true);
    await page.locator('#undo').click(); await settled(); assert.deepEqual(await snapshot(), legacy);
    assert.equal(await page.locator('.resource-row[data-group="characterDrafts"]').count(), 0);
    await page.locator('#redo').click();
    await page.waitForFunction(() => window.FDGStudio.project.characterDrafts?.length === 3);
    assert.deepEqual(await snapshot(), linked);
    await select('characterDrafts', original.characterDrafts[0].id); await draftSettled(original.characterDrafts[0].id);
    await page.locator('#sync-character-drafts').click(); await draftSettled(original.characterDrafts[0].id);
    assert.deepEqual(await snapshot(), linked, 'Connecting twice cannot duplicate IDs or add a no-op undo entry');
    await page.locator('#undo').click(); await settled(); assert.deepEqual(await snapshot(), legacy);
    await importProject(original);
    await page.waitForFunction(expected => JSON.stringify(window.FDGStudio.project) === JSON.stringify(expected), original);
    await settled(); assert.deepEqual(await snapshot(), original);
    await page.locator('#save').click();
    const storage = await page.evaluate(() => ({ keys: Object.keys(localStorage), key: window.FDGStudio.storageKey }));
    assert.deepEqual(storage.keys, [storage.key], 'All new QA stays in the FDG save namespace');
  });

  await check('Failed reference decoding retries after review edits and recovers when the original project is restored', async () => {
    const draftId = original.characterDrafts[0].id, invalid = structuredClone(original);
    const invalidSrc = 'assets/fdg/character-reference/qa-invalid-reference.png';
    invalid.characterDrafts.find(draft => draft.id === draftId).referenceSrc = invalidSrc;
    const routeURL = new URL(`/${invalidSrc}`, baseURL).href;
    let requests = 0;
    const invalidPng = async route => {
      requests += 1;
      await route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('FDG QA: intentionally invalid PNG bytes') });
    };
    await page.route(routeURL, invalidPng);
    let requestsBeforeEdit;
    try {
      await importProject(invalid);
      await page.waitForFunction(expected => JSON.stringify(window.FDGStudio.project) === JSON.stringify(expected), invalid);
      await select('characterDrafts', draftId); await draftSettled(draftId);
      await page.waitForFunction(src => document.getElementById('diagnostic-list').textContent.includes(`이미지 로드 실패: ${src}`), invalidSrc);
      assert.ok(requests >= 1, 'Invalid PNG bytes exercise the real Image.onerror path without a 404');
      assert.equal(await page.evaluate(() => window.FDGStudio.validation.ok), true);
      assert.equal(await page.locator('#play').isDisabled(), true);
      requestsBeforeEdit = requests;
      await page.getByLabel('무기 구조', { exact: true }).selectOption('retouch');
      await page.waitForFunction(id => window.FDGStudio.project.characterDrafts.find(draft => draft.id === id).review?.weapon === 'retouch', draftId);
      await draftSettled(draftId);
      await page.waitForFunction(src => document.getElementById('diagnostic-list').textContent.includes(`이미지 로드 실패: ${src}`), invalidSrc);
      assert.ok(requests > requestsBeforeEdit, 'An edit retries a failed decode instead of reusing a cached null');
      const failedDraft = (await snapshot()).characterDrafts.find(draft => draft.id === draftId);
      assert.equal(failedDraft.provenance.gameplayApplied, false); assert.equal(failedDraft.provenance.modelAvailable, false);
    } finally {
      await page.unroute(routeURL, invalidPng);
      await importProject(original);
      await page.waitForFunction(expected => JSON.stringify(window.FDGStudio.project) === JSON.stringify(expected), original);
      await select('characterDrafts', draftId); await draftSettled(draftId);
    }
    assert.deepEqual(await snapshot(), original);
    assert.ok(!(await page.locator('#diagnostic-list').textContent()).includes(invalidSrc), 'Restoration clears the failed reference diagnostic');
    assert.equal((await page.evaluate(() => window.FDGStudio.characterInspection)).distinctFrameCount, 24);
    const reference = original.characterDrafts.find(draft => draft.id === draftId).referenceSrc;
    const dimensions = await decodeImage(reference); assert.ok(dimensions.width > 0 && dimensions.height > 0);
    report.imageRecovery = { injectedSrc: invalidSrc, requestsBeforeEdit, requests, referenceRestored: true };
  });

  await check('Optimization separates decoded runtime images from reference drafts and applies one reversible recommendation', async () => {
    await select('vfx', original.vfx[0].id); await settled();
    await page.locator('#optimization-panel > summary').click();
    const analysis = await page.evaluate(() => window.FDGStudio.optimizationReport.analysis);
    assert.equal(analysis.settings.concurrentBursts, 4); assert.equal(analysis.settings.particleBudget, 80);
    assert.equal(new Set(analysis.assets.map(asset => asset.src)).size, analysis.assets.length);
    for (const draft of original.characterDrafts) assert.equal(analysis.assets.find(asset => asset.src === draft.clip.src).scope, 'reference');
    const decoded = analysis.assets.filter(asset => asset.scope === 'runtime' && asset.dimensionSource === 'decoded');
    assert.ok(decoded.length >= 19); assert.ok(analysis.memory.referenceBytes > 0);
    assert.equal(analysis.memory.runtimeBytes, analysis.assets.filter(asset => asset.scope === 'runtime').reduce((sum, asset) => sum + (asset.rgbaBytes || 0), 0));
    const tip = analysis.recommendations.find(tip => tip.vfxId === original.vfx[0].id);
    assert.equal(tip.from, 32); assert.equal(tip.to, 20);
    await page.locator(`#optimization-recommendations button[data-vfx-id="${tip.vfxId}"]`).click(); await settled();
    const edited = await snapshot(); assert.equal(edited.vfx[0].count, 20);
    const expected = structuredClone(original); expected.vfx[0].count = 20; assert.deepEqual(edited, expected);
    await page.locator('#undo').click(); await settled(); assert.deepEqual(await snapshot(), original);
  });

  await check('Actual frame profiling ignores manual render calls, stops safely and never mutates authoring data', async () => {
    await page.locator('#optimization-scenario').selectOption('burst');
    await page.locator('#optimization-start').click();
    await page.waitForFunction(() => window.FDGStudio.optimizationReport.measurement?.sampleCount >= 20);
    const duplicate = await page.evaluate(() => {
      const before = window.FDGStudio.optimizationReport.measurement.sampleCount;
      for (let index = 0; index < 20; index++) window.FDGStudio.runtime.renderOnce();
      return { before, after: window.FDGStudio.optimizationReport.measurement.sampleCount };
    });
    assert.equal(duplicate.before, duplicate.after);
    await page.locator('#optimization-stop').click();
    const profile = await page.evaluate(() => window.FDGStudio.optimizationReport);
    assert.equal(profile.measuring, false); assert.equal(profile.measurement.active, false);
    assert.equal(profile.environment.scenario, 'burst'); assert.equal(profile.environment.settings.concurrentBursts, 4);
    assert.ok(profile.measurement.metrics.frameDeltaMs.p95 > 0); assert.equal(profile.measurement.metrics.peakParticles, 128);
    assert.equal((await runtimeState()).state, 'paused'); assert.deepEqual(await snapshot(), original);
    report.optimizationBefore = profile; await screenshot('optimization');
  });

  await check('Recommended particle density is measured again, six-second completion and exported report preserve before/after evidence', async () => {
    await page.locator(`#optimization-recommendations button[data-vfx-id="${original.vfx[0].id}"]`).click(); await settled();
    await page.locator('#optimization-start').click();
    await page.waitForFunction(() => !window.FDGStudio.optimizationReport.measuring && window.FDGStudio.optimizationReport.environment?.stopReason === '6초 측정 완료');
    const profile = await page.evaluate(() => window.FDGStudio.optimizationReport);
    assert.ok(profile.measurement.sampleCount >= 20); assert.equal(profile.measurement.metrics.peakParticles, 80);
    assert.equal(profile.previousMeasurement.metrics.peakParticles, 128);
    assert.equal((await runtimeState()).state, 'paused');
    const downloadPromise = page.waitForEvent('download'); await page.locator('#optimization-export').click();
    const artifact = await downloadPromise; const artifactPath = path.join(outputDirectory, artifact.suggestedFilename()); await artifact.saveAs(artifactPath);
    const exported = JSON.parse(await readFile(artifactPath, 'utf8'));
    assert.equal(exported.scope, 'fdg-authoring-preview'); assert.equal(exported.measurement.metrics.peakParticles, 80);
    assert.equal(exported.previousMeasurement.metrics.peakParticles, 128);
    await page.locator('#undo').click(); await settled(); assert.deepEqual(await snapshot(), original);
    report.optimizationAfter = profile;
  });

  await check('Switching resources cancels a running measurement and restores editing controls', async () => {
    await page.locator('#optimization-start').click();
    await page.waitForFunction(() => window.FDGStudio.optimizationReport.measurement?.active);
    await select('characters', original.characters[0].id);
    const profile = await page.evaluate(() => window.FDGStudio.optimizationReport);
    assert.equal(profile.measuring, false); assert.equal((await runtimeState()).state, 'paused');
    assert.equal(await page.locator('#optimization-stop').isDisabled(), true);
    assert.equal(await page.locator('#apply-24fps').isDisabled(), false); assert.deepEqual(await snapshot(), original);
    await page.locator('#save').click();
  });

  await check('Profiling an existing Play session stops measurement while preserving that Play session', async () => {
    await select('vfx', original.vfx[0].id); await page.locator('#optimization-scenario').selectOption('live');
    await page.locator('#play').click(); await page.locator('#optimization-start').click();
    await page.waitForFunction(() => window.FDGStudio.optimizationReport.measurement?.sampleCount >= 10);
    await page.locator('#optimization-stop').click();
    assert.equal((await runtimeState()).running, true); assert.equal((await runtimeState()).state, 'running');
    assert.equal((await page.evaluate(() => window.FDGStudio.optimizationReport)).measuring, false);
    await page.locator('#play').click(); assert.equal((await runtimeState()).state, 'paused');
    assert.deepEqual(await snapshot(), original);
  });

  await check('Cancellation during asynchronous preparation cannot restart a late preview or leave controls locked', async () => {
    await page.locator('#optimization-scenario').selectOption('burst');
    const cancelled = await page.evaluate(async () => {
      const runtime = window.FDGStudio.runtime, originalSetProject = runtime.setProject.bind(runtime);
      runtime.setProject = async (...args) => { await new Promise(resolve => setTimeout(resolve, 150)); return originalSetProject(...args); };
      document.getElementById('optimization-start').click(); document.getElementById('optimization-stop').click();
      await new Promise(resolve => setTimeout(resolve, 300)); runtime.setProject = originalSetProject;
      return { report: window.FDGStudio.optimizationReport, running: window.FDGStudio.running, state: runtime.state,
        startDisabled: document.getElementById('optimization-start').disabled };
    });
    assert.equal(cancelled.report.measuring, false); assert.equal(cancelled.running, false); assert.equal(cancelled.state, 'paused');
    assert.equal(cancelled.startDisabled, false); assert.deepEqual(await snapshot(), original);
  });

  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.asset404, []);
  await rm(path.join(outputDirectory, 'failure.png'), { force: true });
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL'; report.failure = error.stack || String(error);
  await page.screenshot({ path: path.join(outputDirectory, 'failure.png'), fullPage: true }).catch(() => {});
  console.error(report.failure); process.exitCode = 1;
} finally {
  await writeFile(path.join(outputDirectory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await context.close(); await browser.close();
}
console.log(`${report.status}: ${report.checks.length} browser checks; page errors ${report.pageErrors.length}; PNG 404 ${report.asset404.length}`);
