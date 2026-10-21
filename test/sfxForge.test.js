import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';

import {
  CATEGORY_PRESETS, MAX_PROMPT_CHARS, MODEL_ID,
  buildSoundSpec, generateSpec, loadCatalog, parseArgs, promote, resolvePromoteTarget, variantPath, writeReviewPage,
} from '../tools/sfx_forge.mjs';

test('category preset appends the house style tail and its defaults', () => {
  const spec = buildSoundSpec({ category: 'hit', key: 'blade_flesh', text: 'A heavy sword cutting flesh.' });
  assert.equal(spec.request.text, `A heavy sword cutting flesh. ${CATEGORY_PRESETS.hit.tail}`);
  assert.equal(spec.request.modelId, MODEL_ID);
  assert.equal(spec.request.durationSeconds, CATEGORY_PRESETS.hit.duration);
  assert.equal(spec.request.promptInfluence, CATEGORY_PRESETS.hit.promptInfluence);
  assert.equal(spec.request.loop, false);
  assert.equal(buildSoundSpec({ category: 'ambient', key: 'bed', text: 'wind' }).request.loop, true);
});

test('explicit options override presets and raw skips the tail', () => {
  const spec = buildSoundSpec({ category: 'skill', key: 'x', text: 'boom', duration: 2, promptInfluence: 0.5, loop: true, raw: true, variants: 3 });
  assert.deepEqual(spec.request, { text: 'boom', modelId: MODEL_ID, durationSeconds: 2, promptInfluence: 0.5, loop: true, outputFormat: 'mp3_44100_128' });
  assert.equal(spec.variants, 3);
});

test('invalid requests are rejected before any API call', () => {
  assert.throws(() => buildSoundSpec({ category: 'music', key: 'a', text: 't' }), /Unknown category/);
  assert.throws(() => buildSoundSpec({ category: 'hit', key: 'Bad Key', text: 't' }), /Invalid key/);
  assert.throws(() => buildSoundSpec({ category: 'hit', key: 'a', text: ' ' }), /Missing --text/);
  assert.throws(() => buildSoundSpec({ category: 'hit', key: 'a', text: 'x'.repeat(MAX_PROMPT_CHARS) }), /chars/);
  assert.throws(() => buildSoundSpec({ category: 'hit', key: 'a', text: 't', duration: 0.2 }), /out of range/);
  assert.throws(() => buildSoundSpec({ category: 'hit', key: 'a', text: 't', promptInfluence: 2 }), /out of range/);
  assert.throws(() => buildSoundSpec({ category: 'hit', key: 'a', text: 't', variants: 5 }), /Variants/);
});

test('argument parsing covers every command', () => {
  assert.deepEqual(parseArgs(['gen', '--category', 'ui', '--key', 'k', '--text', 'tick', '--variants', '2', '--loop', '--dry-run']),
    { command: 'gen', variants: 2, dryRun: true, raw: false, force: false, category: 'ui', key: 'k', text: 'tick', loop: true });
  assert.deepEqual(parseArgs(['batch', '--catalog', 'c.json', '--only', 'a, b']).only, ['a', 'b']);
  assert.throws(() => parseArgs(['speak']), /Usage/);
  assert.throws(() => parseArgs(['gen', '--key']), /requires a value/);
  assert.throws(() => parseArgs(['gen', '--bogus']), /Unknown argument/);
});

test('promote only writes inside the game sfx folder', () => {
  const root = path.resolve('G:/exoduser');
  assert.equal(resolvePromoteTarget(root, 'sfx/hit/a.mp3'), path.join(root, 'sfx', 'hit', 'a.mp3'));
  assert.throws(() => resolvePromoteTarget(root, 'game.html'), /inside sfx/);
  assert.throws(() => resolvePromoteTarget(root, 'sfx/../game.html'), /inside sfx/);
  assert.throws(() => resolvePromoteTarget(root, undefined), /requires --to/);
});

test('bundled catalog entries are all valid', async () => {
  const sounds = await loadCatalog(path.resolve('tools/sfx_forge_catalog.json'));
  const keys = new Set();
  for (const s of sounds) {
    buildSoundSpec(s);
    assert.ok(!keys.has(s.key), `duplicate key ${s.key}`);
    keys.add(s.key);
  }
  assert.ok(['skill', 'hit', 'ui'].every((c) => sounds.some((s) => s.category === c)));
});

test('generate keeps existing variants, records the manifest, and promotes with a stub client', async () => {
  const staging = await mkdtemp(path.join(os.tmpdir(), 'sfx-forge-'));
  const root = await mkdtemp(path.join(os.tmpdir(), 'sfx-root-'));
  const calls = [];
  const client = { textToSoundEffects: { convert: async (req) => { calls.push(req); return new Blob([new Uint8Array(1024).fill(7)]).stream(); } } };
  const spec = buildSoundSpec({ category: 'hit', key: 'blade_bone', text: 'bone crack', variants: 2 });
  await mkdir(path.dirname(variantPath(staging, 'hit', 'blade_bone', 1)), { recursive: true });
  await writeFile(variantPath(staging, 'hit', 'blade_bone', 1), Buffer.alloc(900));
  const results = await generateSpec(spec, { stagingDir: staging, client, log: () => {} });
  assert.deepEqual(results.map((r) => r.status), ['kept', 'generated']);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].text, spec.request.text);
  const manifest = JSON.parse(await readFile(path.join(staging, 'hit', 'blade_bone', 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.entries.map((e) => e.variant), [2]);
  const page = await readFile(await writeReviewPage(staging), 'utf8');
  assert.match(page, /hit\/blade_bone\/v2\.mp3/);
  const moved = await promote({ rootDir: root, stagingDir: staging, category: 'hit', key: 'blade_bone', variant: 2, to: 'sfx/hit/blade_bone.mp3' });
  assert.equal(moved.to, path.join('sfx', 'hit', 'blade_bone.mp3'));
  assert.equal((await readFile(path.join(root, 'sfx', 'hit', 'blade_bone.mp3'))).length, 1024);
  await assert.rejects(promote({ rootDir: root, stagingDir: staging, category: 'hit', key: 'blade_bone', variant: 2, to: 'sfx/hit/blade_bone.mp3' }), /already exists/);
  await assert.rejects(promote({ rootDir: root, stagingDir: staging, category: 'hit', key: 'blade_bone', variant: 1, to: 'sfx/hit/x.mp3' }), /No generated v1/);
});

test('tiny responses are treated as failures', async () => {
  const staging = await mkdtemp(path.join(os.tmpdir(), 'sfx-forge-'));
  const client = { textToSoundEffects: { convert: async () => new Blob([new Uint8Array(10)]).stream() } };
  await assert.rejects(generateSpec(buildSoundSpec({ category: 'ui', key: 'tick', text: 'tick' }), { stagingDir: staging, client, log: () => {} }), /too small/);
});
