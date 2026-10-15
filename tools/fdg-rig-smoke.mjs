import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const { chromium } = await import(process.env.FDG_PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.env.FDG_RIG_QA_OUTPUT || 'tmp/fdg-rig-20261010/qa'); await mkdir(output, { recursive: true });
const report = { checks: [], errors: [], renderer: 'cpu-canvas-3d', scope: 'engine-test-mesh' };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1050 }, acceptDownloads: true });
const page = await context.newPage(); page.setDefaultTimeout(15000); page.on('pageerror', error => report.errors.push(error.message)); page.on('dialog', dialog => dialog.accept());
const scene = () => page.evaluate(() => window.FDGRig.project);
const snapshot = () => page.evaluate(() => window.FDGRig.snapshot);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} should equal ${b}`);
const input = async (id, value) => { await page.locator(`#${id}`).fill(String(value)); await page.locator(`#${id}`).dispatchEvent('change'); };
const pixels = () => page.locator('#rig-canvas').evaluate(async canvas => {
  const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map(byte => byte.toString(16).padStart(2, '0')).join('');
});
const check = async (name, fn) => { await fn(); assert.deepEqual(report.errors, []); report.checks.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); };
try {
  await page.goto(process.env.FDG_RIG_URL || 'http://localhost:3333/tools/fdg-studio/rig.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.FDGRig);
  await check('Actual 3D mesh, bones, depth and bind-pose identity are rendered without sprite assets', async () => {
    await page.locator('#rig-clip').selectOption(''); const project = await scene(); const state = await snapshot();
    assert.equal(project.skeleton.bones.length, 3); assert.equal(project.mesh.vertices.length, 16); assert.equal(project.mesh.triangles.length, 28);
    assert.ok(project.mesh.vertices.some(vertex => vertex[2] > 0) && project.mesh.vertices.some(vertex => vertex[2] < 0));
    project.mesh.vertices.forEach((vertex, index) => vertex.forEach((value, axis) => near(state.vertices[index][axis], value)));
    assert.equal(state.renderer, 'cpu-canvas-3d'); assert.equal(state.state, 'paused');
  });
  await check('Moving a parent bone deforms weighted vertices; manual weight editing changes the deformation', async () => {
    const base = (await scene()).mesh.vertices;
    await input('rig-pose-position-0', .5); let state = await snapshot();
    near(state.bonePositions.find(bone => bone.id === 'spine').position[0], .5);
    near(state.vertices[5][0] - base[5][0], .3); near(state.vertices[0][0], base[0][0]);
    await page.locator('#rig-vertex').selectOption('5'); await input('rig-weight', 1); state = await snapshot();
    near(state.vertices[5][0] - base[5][0], .5);
    assert.deepEqual((await scene()).mesh.weights[5], [{ boneId: 'spine', weight: 1 }]);
    await input('rig-pose-rotation-0', 30); state = await snapshot();
    assert.ok(Math.abs(state.vertices[12][2] - base[12][2]) > .2, 'X rotation changes actual Z coordinates');
    report.deformation = { rootUnchanged: state.vertices[0], weightedVertex: state.vertices[5], rotatedVertex: state.vertices[12] };
    await page.screenshot({ path: path.join(output, 'deformation.png'), fullPage: true });
  });
  await check('Bone addition, naming, bind editing and rejected cyclic parenting preserve a valid hierarchy', async () => {
    await page.locator('#rig-add-bone').click(); const added = (await scene()).skeleton.bones.at(-1);
    await page.locator(`#rig-bones button[data-bone-id="${added.id}"]`).click(); await input('rig-bone-name', '시험 관절');
    await input('rig-bind-position-1', .7); const valid = await scene();
    near(valid.skeleton.bones.at(-1).translation[1], .7);
    await page.locator('#rig-bones button[data-bone-id="spine"]').click();
    await page.locator('#rig-bone-parent').selectOption('head'); assert.deepEqual(await scene(), valid);
    assert.match(await page.locator('#rig-status').textContent(), /cycle|순환|사이클/i);
  });
  await check('Compatible material skins change pixels while preserving the same clip, time and deformed mesh', async () => {
    await page.locator('#rig-clip').selectOption('sway'); await page.locator('#rig-step').click(); const before = await snapshot(), image = await pixels();
    await page.locator('#rig-material').selectOption('ember'); const after = await snapshot();
    assert.equal(after.clipId, before.clipId); near(after.time, before.time); assert.deepEqual(after.vertices, before.vertices);
    assert.notEqual(await pixels(), image); assert.equal(after.materialId, 'ember');
    report.skinSwap = { sameClip: after.clipId, sameTime: after.time, changedPixels: true };
  });
  await check('Two clips interpolate and crossfade in the actual runtime; variable FPS controls paused stepping', async () => {
    await page.locator('#rig-play').click(); await page.waitForTimeout(120); await page.locator('#rig-clip').selectOption('bow');
    const switching = await snapshot(); assert.ok(switching.transition); assert.equal(switching.transition.fromClipId, 'sway');
    await page.waitForTimeout(380); await page.locator('#rig-play').click(); assert.equal((await snapshot()).transition, null);
    assert.equal(await page.evaluate(() => { const preview = window.FDGRig.preview; preview.transitionFrom('sway', 0); for (let tick = 0; tick < 15; tick++) preview.advance(1 / 60); preview.render(); return preview.snapshot().transition; }), null);
    await input('rig-clip-fps', 48); await input('rig-clip-duration', 1.75);
    await page.locator('#rig-key').selectOption('1'); await input('rig-key-rotation-2', 22);
    await page.locator('#rig-time').evaluate(node => { node.value = '.5'; node.dispatchEvent(new Event('input', { bubbles: true })); });
    const before = await snapshot(); await page.locator('#rig-step').click(); const after = await snapshot(); near(after.time - before.time, 1 / 48);
    assert.notDeepEqual(after.vertices, before.vertices); assert.equal(after.state, 'paused');
    await page.waitForTimeout(160); assert.deepEqual((await snapshot()).vertices, after.vertices);
    report.transition = { from: switching.transition.fromClipId, to: switching.clipId, variableFps: 48, stepSeconds: after.time - before.time };
  });
  let saved;
  await check('Save and reopen preserve mesh, bones, weights, materials, clip keys, pose, camera and visible deformation', async () => {
    await input('rig-yaw', 44); await input('rig-pitch', 25); await page.locator('#rig-save').click(); saved = await scene(); const vertices = (await snapshot()).vertices;
    assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ['fdg.studio.rig.v1']);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => window.FDGRig);
    assert.deepEqual(await scene(), saved); assert.deepEqual((await snapshot()).vertices, vertices); assert.equal((await snapshot()).state, 'paused');
    await page.screenshot({ path: path.join(output, 'saved-rig.png'), fullPage: true }); report.savedProject = saved;
  });
  await check('Export/import round-trip and incompatible skin rejection leave current rig data intact', async () => {
    const downloadPromise = page.waitForEvent('download'); await page.locator('#rig-export').click(); const download = await downloadPromise;
    const file = path.join(output, download.suggestedFilename()); await download.saveAs(file); assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), saved);
    const invalid = structuredClone(saved); invalid.materials[0].skeletonId = 'incompatible';
    await page.locator('#rig-file').setInputFiles({ name: 'invalid-rig.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalid)) });
    await page.waitForFunction(() => document.getElementById('rig-status').textContent.includes('불러오기 거부')); assert.deepEqual(await scene(), saved);
    await page.locator('#rig-file').setInputFiles({ name: 'valid-rig.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(saved)) });
    assert.deepEqual(await scene(), saved);
  });
  await check('Repeated loop duration edits preserve exact endpoints and undo restores the authored clip', async () => {
    await page.locator('#rig-clip').selectOption('sway');
    await input('rig-clip-duration', .05); await input('rig-clip-duration', .11);
    let clip = (await scene()).clips.find(clip => clip.id === 'sway'); assert.equal(clip.duration, .11);
    for (const track of clip.tracks) assert.equal(track.keys.at(-1).time, .11);
    await page.locator('#rig-undo').click(); clip = (await scene()).clips.find(clip => clip.id === 'sway');
    assert.equal(clip.duration, .05); for (const track of clip.tracks) assert.equal(track.keys.at(-1).time, .05);
    await page.locator('#rig-redo').click(); assert.equal((await scene()).clips.find(clip => clip.id === 'sway').duration, .11);
  });
  await check('A minimal saved mesh restores safely and prototype method bone IDs accept their own manual pose', async () => {
    const small = structuredClone(saved), rename = id => id === 'spine' ? 'toString' : id;
    small.mesh.vertices = small.mesh.vertices.slice(0, 3); small.mesh.triangles = [[0, 1, 2]];
    small.mesh.weights = small.mesh.weights.slice(0, 3).map(weights => weights.map(weight => ({ ...weight, boneId: rename(weight.boneId) })));
    for (const bone of small.skeleton.bones) { bone.id = rename(bone.id); bone.parent = rename(bone.parent); }
    for (const clip of small.clips) for (const track of clip.tracks) track.boneId = rename(track.boneId);
    small.preview.pose = {}; small.preview.clipId = null; small.preview.time = 0;
    await page.evaluate(project => localStorage.setItem('fdg.studio.rig.v1', JSON.stringify(project)), small);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => window.FDGRig);
    assert.deepEqual(await scene(), small); assert.equal(await page.locator('#rig-vertex').inputValue(), '2');
    assert.equal(await page.locator('#rig-pose-position-0').inputValue(), '0');
    await input('rig-pose-position-0', .4); const edited = await scene();
    assert.ok(Object.hasOwn(edited.preview.pose, 'toString')); near(edited.preview.pose.toString.translation[0], .4);
    near((await snapshot()).bonePositions.find(bone => bone.id === 'toString').position[0], .4);
  });
  await check('A near-limit valid rig export remains within the raw import byte limit and round-trips', async () => {
    const small = await scene(), large = structuredClone(small); large.notes = '';
    large.notes = 'x'.repeat(2 * 1048576 - Buffer.byteLength(JSON.stringify(large)) - 10);
    assert.ok(Buffer.byteLength(JSON.stringify(large, null, 2)) > 2 * 1048576);
    await page.locator('#rig-file').setInputFiles({ name: 'large-rig.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(large)) });
    await page.waitForFunction(() => window.FDGRig.project.notes?.length > 1048576);
    const downloadPromise = page.waitForEvent('download'); await page.locator('#rig-export').click(); const download = await downloadPromise;
    const file = path.join(output, 'near-limit-rig.json'); await download.saveAs(file); const bytes = await readFile(file);
    assert.ok(bytes.length <= 2 * 1048576); assert.deepEqual(JSON.parse(bytes.toString('utf8')), large);
    await page.locator('#rig-file').setInputFiles(file); assert.deepEqual(await scene(), large);
    await page.locator('#rig-file').setInputFiles({ name: 'small-rig.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(small)) });
    await page.waitForFunction(() => !window.FDGRig.project.notes);
  });
  await check('Persisted page transitions pause without disposing and restored editor playback remains usable', async () => {
    await page.locator('#rig-play').click();
    const paused = await page.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); return window.FDGRig.snapshot; });
    assert.equal(paused.state, 'paused'); assert.equal(paused.rafPending, false); assert.equal(paused.observers, 1);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await input('rig-bone-name', '캐시 복원 관절'); assert.equal((await scene()).skeleton.bones.find(bone => bone.id === 'toString').name, '캐시 복원 관절');
    await page.locator('#rig-step').click(); near((await snapshot()).time - paused.time, 1 / 24);
  });
  await check('Disposal releases its RAF and ResizeObserver and prevents further deformation updates', async () => {
    await page.locator('#rig-play').click(); await page.waitForTimeout(80);
    const disposed = await page.evaluate(() => { window.FDGRig.preview.dispose(); return window.FDGRig.snapshot; });
    assert.equal(disposed.state, 'disposed'); assert.equal(disposed.rafPending, false); assert.equal(disposed.observers, 0);
    await page.evaluate(() => { const preview = window.FDGRig.preview; preview.step(); preview.advance(1); preview.play(); preview.transitionFrom(null, 0); });
    await page.waitForTimeout(180); const after = await snapshot(); assert.equal(after.frames, disposed.frames); assert.equal(after.time, disposed.time);
    assert.deepEqual(after.vertices, []);
  });
  report.status = 'PASS';
} catch (error) { report.status = 'FAIL'; report.failure = error.stack; process.exitCode = 1; console.error(error.stack); await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
finally { await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2)); await context.close(); await browser.close(); }
console.log(`${report.status}: ${report.checks.length} new rig checks; page errors ${report.errors.length}`);
