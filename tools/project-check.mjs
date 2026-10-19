// Read-only project readiness checks; no dependency install or game server startup.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
let checks = 0;
const verify = (label, action) => {
  checks++;
  try { action(); } catch (error) { failures.push(`${label}: ${error.message}`); }
};
const read = path => readFileSync(resolve(root, path), 'utf8');
const requireFile = path => {
  if (!existsSync(resolve(root, path))) throw new Error(`Missing ${path}`);
};
const syntaxFiles = new Set([
  'server.cjs', 'node-main.js', 'build-nwjs.mjs', 'tools/build-web.mjs',
  'tools/docs-sync-check.mjs', 'tools/project-check.mjs',
  'engine/fdg/project.js', 'engine/fdg/runtime.js', 'engine/fdg/catalog.js',
  'engine/fdg/legacy.js', 'engine/fdg/source-map.js', 'tools/fdg-catalog.mjs',
  'tools/fdg-studio-smoke.mjs', 'engine/fdg/character-quality.js',
  'engine/fdg/character-drafts.js', 'tools/fdg-character-build.mjs',
  'engine/fdg/profiler.js', 'engine/fdg/optimization.js', 'tools/fdg-studio/optimization-panel.js',
  'engine/fdg/rig.js', 'engine/fdg/rig-project.js', 'tools/fdg-studio/rig-preview.js',
  'tools/fdg-studio/rig-studio.js', 'tools/fdg-rig-smoke.mjs',
  'engine/fdg/rig-scene-project.js', 'engine/fdg/rig-scene-runtime.js',
  'tools/fdg-studio/rig-scene-panel.js', 'tools/fdg-rig-scene-smoke.mjs',
]);
const pages = ['index.html', 'game.html', 'game-easy-test.html', 'game-guide.html', 'tools/fdg-studio/index.html', 'tools/fdg-studio/rig.html'];

verify('package.json', () => JSON.parse(read('package.json')));
for (const page of pages) {
  verify(page, () => {
    const html = read(page);
    for (const match of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi)) {
      const ref = match[1].split(/[?#]/)[0];
      if (!ref || /^(?:[a-z]+:|\/\/)/i.test(ref)) continue;
      const path = ref.startsWith('/') ? decodeURIComponent(ref.slice(1)) : resolve(dirname(resolve(root, page)), decodeURIComponent(ref));
      requireFile(path);
      if (/\.m?js$/i.test(path)) syntaxFiles.add(path);
    }
    let index = 0;
    for (const [, attrs, source] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      index++;
      if (/\bsrc\s*=/.test(attrs) || /type\s*=\s*["']?(?:importmap|application\/json)/i.test(attrs)) continue;
      if (/type\s*=\s*["']?module/i.test(attrs)) {
        const result = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: source, encoding: 'utf8' });
        if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr.trim());
      } else {
        new vm.Script(source, { filename: `${page}:inline-${index}` });
      }
    }
  });
}
for (const file of syntaxFiles) {
  verify(file, () => {
    requireFile(file);
    const result = spawnSync(process.execPath, ['--check', resolve(root, file)], { encoding: 'utf8' });
    if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr.trim());
  });
}
verify('NW.js media codec', () => {
  const build = read('build-nwjs.mjs');
  const path = build.match(/const CODEC_DLL = '([^']+)'/)[1];
  const expected = build.match(/const CODEC_SHA256 = '([^']+)'/)[1];
  const actual = createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
  if (actual !== expected) throw new Error('SHA-256 mismatch');
});

console.log(`[project-check] ${checks - failures.length}/${checks} checks passed (${process.version}, ${process.platform}/${process.arch}).`);
for (const failure of failures) console.error(`[project-check] ${failure}`);
console.log(`[project-check] NW.js builder dependency: ${existsSync(resolve(root, 'node_modules/nw-builder/package.json')) ? 'installed' : 'not installed; needed for build:nwjs'}.`);
console.log('[project-check] These checks cover source readiness. Gameplay, FPS, audio and native execution need separate QA.');
process.exitCode = failures.length ? 1 : 0;
