import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const { chromium } = await import(process.env.FDG_PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.env.FDG_RIG_SCENE_QA_OUTPUT || 'tmp/fdg-rig-scene-20261010/qa'); await mkdir(output, { recursive: true });
const report = { checks: [], errors: [], scope: 'new-fdg-scene-rig-consumer', renderer: 'cpu-canvas-3d' };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true });
await context.addInitScript(() => {
  const NativeObserver = window.ResizeObserver, active = new Set();
  window.ResizeObserver = class extends NativeObserver {
    observe(...args) { active.add(this); return super.observe(...args); }
    disconnect() { active.delete(this); return super.disconnect(); }
  };
  window.fdgQaObserverCount = () => active.size;
});
const page = await context.newPage(); page.setDefaultTimeout(15000); page.on('pageerror', error => report.errors.push(error.message)); page.on('dialog', dialog => dialog.accept());
const project = () => page.evaluate(() => window.FDGStudio.sceneProject);
const rig = () => page.evaluate(() => window.FDGStudio.rigScene.nodes[0]);
const ready = () => page.waitForFunction(() => window.FDGStudio && !document.getElementById('play').disabled);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} should equal ${b}`);
const input = async (id, value) => { await page.locator(`#${id}`).fill(String(value)); await page.locator(`#${id}`).dispatchEvent('change'); await ready(); };
const importProject = async data => { await page.locator('#file-input').setInputFiles({ name: 'rig-scene.fdg.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) }); await page.waitForFunction(id => window.FDGStudio.project.id === id, data.id); await ready(); };
const pixels = () => page.locator('#runtime-canvas').evaluate(async canvas => {
  const bytes = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
});
const check = async (name, fn) => { await fn(); assert.deepEqual(report.errors, []); report.checks.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); };
try {
  await page.goto(process.env.FDG_RIG_SCENE_URL || 'http://localhost:3333/tools/fdg-studio/index.html?v=0.5', { waitUntil: 'networkidle' }); await ready();
  const original = await project();
  await check('The existing FDG scene runtime consumes an actual 3D rig node in the editor viewport', async () => {
    await page.locator('[data-tab="rigScene"]').click(); await page.locator('#rig-scene-add').click(); await ready();
    await page.waitForFunction(() => window.FDGStudio.rigScene.activeNodes === 1);
    const node = await rig(), data = await project(), diagnostics = await page.evaluate(() => window.FDGStudio.rigScene);
    assert.equal(diagnostics.ownedRaf, 0); assert.equal(diagnostics.ownedListeners, 0);
    assert.equal(data.rigScene.nodes[0].resourceId, data.rigScene.resources[0].id); assert.equal(node.vertices.length, 16);
    assert.deepEqual(data.map, original.map); assert.deepEqual(data.skills, original.skills); assert.deepEqual(data.preview, original.preview);
    assert.equal(await page.locator('#runtime-canvas').isVisible(), true); report.nodeId = node.id;
    const authored = structuredClone(data.rigScene.resources[0].project); authored.name = '저장 리그 소비 QA';
    await page.evaluate(rig => localStorage.setItem('fdg.studio.rig.v1', JSON.stringify(rig)), authored);
    await page.locator('#rig-scene-saved').click(); await ready();
    const withSaved = await project(); assert.equal(withSaved.rigScene.nodes.length, 2);
    assert.equal((await page.evaluate(() => window.FDGStudio.rigScene)).resourceCount, 2);
    assert.deepEqual(withSaved.rigScene.resources[1].project, authored);
    await page.locator('#rig-scene-delete').click(); await ready(); await page.locator('[data-tab="rigScene"]').click();
    assert.equal((await rig()).id, node.id);
  });
  await check('Node placement, shared bone pose and camera edits use the same runtime projection while paused', async () => {
    await page.locator('#rig-scene-clip').selectOption(''); const before = await rig();
    await input('rig-scene-position-0', before.position[0] + 45); let after = await rig(); near(after.anchor.x - before.anchor.x, 45);
    await input('rig-scene-position-2', 18); after = await rig(); assert.equal(after.position[2], 18);
    await input('rig-scene-scale', 64); await input('rig-scene-pose-translation-0', .35); await input('rig-scene-pose-rotation-0', 25);
    await input('rig-scene-camera-yaw', 20); await input('rig-scene-camera-pitch', 30);
    const data = await project(); after = await rig(); assert.notDeepEqual(after.vertices, before.vertices);
    assert.equal(after.scale, data.rigScene.nodes[0].scale); assert.deepEqual(after.position, data.rigScene.nodes[0].position);
    const projected = await page.evaluate(position => window.FDGStudio.runtime.worldToScreen(position[0], position[1]), after.position);
    near(after.anchor.x, projected.x); near(after.anchor.y, projected.y);
    assert.ok(after.screenVertices.length === after.vertices.length); await page.waitForTimeout(120); assert.deepEqual((await rig()).vertices, after.vertices);
    await page.screenshot({ path: path.join(output, 'scene-editor.png'), fullPage: true }); report.editorNode = after;
  });
  await check('A compatible material changes pixels without resetting the scene clock or rig pose', async () => {
    const before = await rig(), hash = await pixels(); await page.locator('#rig-scene-material').selectOption('ember'); const after = await rig();
    near(after.time, before.time); assert.equal(after.clipId, before.clipId); assert.deepEqual(after.vertices, before.vertices); assert.notEqual(await pixels(), hash);
  });
  await check('Play, pause, single scene step and clip crossfade are driven by the existing 60Hz scene clock', async () => {
    await page.locator('#rig-scene-clip').selectOption('sway'); await page.locator('#play').click(); await page.waitForTimeout(150);
    const before = await rig(); assert.ok(before.time > 0); await page.locator('#rig-scene-clip').selectOption('bow');
    const switching = await rig(); assert.ok(switching.transition); assert.equal(switching.transition.fromClipId, 'sway');
    await page.locator('#play').click(); const paused = await rig(); const stats = await page.evaluate(() => window.FDGStudio.runtime.stats);
    await page.waitForTimeout(140); assert.deepEqual(await rig(), paused);
    await page.locator('#step').click(); const stepped = await rig(), nextStats = await page.evaluate(() => window.FDGStudio.runtime.stats);
    near(stepped.time - paused.time, 1 / 60); near(nextStats.time - stats.time, 1 / 60); assert.equal(nextStats.updateSteps - stats.updateSteps, 1);
    report.clock = { step: nextStats.time - stats.time, ownedRigRaf: 0, capturedTransition: stepped.transition };
  });
  let saved;
  await check('Scene save and reopen preserve collision/combat metadata, rig resources, placement and paused crossfade pose', async () => {
    const candidate = await project(); candidate.id = 'fdg-rig-scene-consumer-qa'; candidate.map.collisionContract = { scope: 'qa-roundtrip-sentinel', unchanged: true };
    candidate.combat = { scope: 'qa-roundtrip-sentinel', dispatch: 'preserve-only', balanceApplied: false };
    await importProject(candidate); await page.locator('[data-tab="rigScene"]').click(); await page.locator('#save').click(); saved = await project(); const visible = await rig();
    await page.reload({ waitUntil: 'networkidle' }); await ready(); assert.deepEqual(await project(), saved);
    assert.deepEqual((await rig()).vertices, visible.vertices); assert.deepEqual((await rig()).screenVertices, visible.screenVertices);
    assert.deepEqual((await rig()).transition, visible.transition); assert.equal(await page.evaluate(() => window.FDGStudio.runtime.state), 'paused');
    report.reopenedNode = await rig();
    await page.screenshot({ path: path.join(output, 'scene-reopened.png'), fullPage: true }); report.savedProject = saved;
  });
  await check('Scene export/import round-trip and switching to another scene retire only the previous rig consumer', async () => {
    const downloadPromise = page.waitForEvent('download'); await page.locator('#export').click(); const download = await downloadPromise;
    const file = path.join(output, download.suggestedFilename()); await download.saveAs(file); assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), saved);
    const listeners = await page.evaluate(() => window.FDGStudio.runtime._listeners.length);
    const other = structuredClone(saved); other.id = 'fdg-rig-scene-empty-qa'; other.name = '리그 소비자 교체 검수'; other.rigScene.resources = []; other.rigScene.nodes = [];
    await importProject(other); assert.equal((await page.evaluate(() => window.FDGStudio.rigScene)).activeNodes, 0);
    assert.equal((await page.evaluate(() => window.FDGStudio.rigScene)).resourceCount, 0); assert.equal(await page.evaluate(() => window.FDGStudio.runtime._listeners.length), listeners);
    assert.deepEqual((await project()).map, saved.map); assert.deepEqual((await project()).combat, saved.combat);
    await importProject(saved); await page.locator('[data-tab="rigScene"]').click(); assert.deepEqual((await rig()).vertices, report.reopenedNode.vertices);
  });
  await check('Deleting a node retires its unreferenced rig resource; undo restores the same authored consumer', async () => {
    const before = await project(); await page.locator('#rig-scene-delete').click(); await ready();
    assert.equal((await page.evaluate(() => window.FDGStudio.rigScene)).activeNodes, 0); assert.equal((await project()).rigScene.resources.length, 0);
    await page.locator('#undo').click(); await ready(); await page.locator('[data-tab="rigScene"]').click();
    assert.deepEqual((await project()).rigScene, before.rigScene);
  });
  await check('Page disposal releases scene-owned RAF, listeners, observer, rig resources and new panel listeners', async () => {
    await page.locator('#play').click(); await page.waitForTimeout(90);
    const retained = await page.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); return { node: window.FDGStudio.rigScene.nodes[0], listeners: window.FDGStudio.runtime._listeners.length }; });
    await page.waitForTimeout(100); assert.deepEqual(await rig(), retained.node);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    assert.equal(await page.locator('#rig-scene-position-0').isEnabled(), true);
    assert.equal(await page.evaluate(() => window.FDGStudio.runtime._listeners.length), retained.listeners);
    assert.equal(await page.evaluate(() => window.fdgQaObserverCount()), 1);
    await page.locator('#play').click(); await page.waitForTimeout(90);
    const disposed = await page.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })); return { scene: window.FDGStudio.rigScene, stats: window.FDGStudio.runtime.stats, listeners: window.FDGStudio.runtime._listeners.length, raf: window.FDGStudio.runtime._raf, lifecycle: window.FDGStudio.lifecycle, observers: window.fdgQaObserverCount() }; });
    assert.equal(disposed.stats.state, 'disposed'); assert.equal(disposed.scene.activeNodes, 0); assert.equal(disposed.scene.resourceCount, 0);
    assert.equal(disposed.observers, 0); assert.equal(disposed.listeners, 0); assert.equal(disposed.raf, null); assert.deepEqual(disposed.lifecycle, { editorRaf: false, panelListeners: 0 });
    await page.waitForTimeout(120); assert.equal(await page.evaluate(() => window.FDGStudio.runtime.stats.time), disposed.stats.time);
    report.disposal = disposed;
  });
  report.status = 'PASS';
} catch (error) { report.status = 'FAIL'; report.failure = error.stack; process.exitCode = 1; console.error(error.stack); await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {}); }
finally { await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2)); await context.close(); await browser.close(); }
console.log(`${report.status}: ${report.checks.length} new consumer checks; page errors ${report.errors.length}`);
