import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('NW.js package includes all root scripts and styles used by shipped entry pages', () => {
  const build = fs.readFileSync('build-nwjs.mjs', 'utf8');
  const files = new Set(vm.runInNewContext(build.match(/const FILES = (\[[\s\S]*?\]);/)[1]));
  const missing = [];
  for (const entry of ['index.html', 'game.html']) {
    const html = fs.readFileSync(entry, 'utf8');
    for (const match of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)) {
      const path = match[1].split('?')[0];
      if (/^(https?:|\/\/)/.test(path) || path.includes('/') || !/\.(js|css)$/.test(path)) continue;
      if (/^lang_.*\.js$/.test(path)) continue; // copied by the language glob
      if (!files.has(path)) missing.push(`${entry}: ${path}`);
      assert.ok(fs.existsSync(path), `Runtime dependency does not exist: ${path}`);
    }
  }
  assert.deepEqual(missing, [], 'Runtime dependencies missing from NW.js staging');
});

test('NW.js includes runtime art referenced from output without shipping the whole output tree', () => {
  const build = fs.readFileSync('build-nwjs.mjs', 'utf8');
  const files = new Set(vm.runInNewContext(build.match(/const FILES = (\[[\s\S]*?\]);/)[1]));
  const dirs = vm.runInNewContext(build.match(/const DIRS = (\[[\s\S]*?\]);/)[1]);
  const missing = new Set();
  for (const entry of ['index.html', 'game.html']) {
    for (const match of fs.readFileSync(entry, 'utf8').matchAll(/output\/[\w./-]+/g)) {
      const path = match[0];
      if (!files.has(path) && !dirs.some(dir => path.startsWith(dir + '/'))) missing.add(path);
    }
  }
  assert.deepEqual([...missing], [], 'Runtime output art missing from staging');
  assert.ok(!dirs.includes('output'), 'Do not package unrelated production output');
});
