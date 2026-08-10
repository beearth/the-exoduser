import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('character-selection idle video uses a head-safe wide crop on ultrawide displays', async () => {
  const lobby = await readFile(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(
    lobby,
    /@media\s*\(min-aspect-ratio:\s*21\s*\/\s*9\)\s*\{\s*#charVisualPop\s+\.cs-idle-vid\s*\{[^}]*object-fit:\s*contain\s*;?[^}]*object-position:\s*center\s+top\s*;?[^}]*transform-origin:\s*center\s+top\s*;?[^}]*transform:\s*scale\(1\.15\)\s+scaleX\(1\.1\)\s*;?/s,
  );
});

test('character selection overlays the supplied metal texture only on ultrawide side space', async () => {
  const lobby = await readFile(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(lobby, /<div class="cs-side-texture" aria-hidden="true"><\/div>/);
  assert.match(lobby, /\.cs-side-texture\s*\{\s*display\s*:\s*none\s*;?\s*\}/);
  assert.match(
    lobby,
    /#charVisualPop\s+\.cs-side-texture::before,#charVisualPop\s+\.cs-side-texture::after\s*\{[^}]*opacity:\s*\.94\s*;?[^}]*background-image:\s*url\('output\/fdg_reference_1280x720\.png'\)[^}]*background-size:\s*auto\s+150%/s,
  );
  assert.match(lobby, /\.cs-side-texture::before\s*\{[^}]*background-position:\s*left\s+center/s);
  assert.match(lobby, /\.cs-side-texture::after\s*\{[^}]*background-position:\s*right\s+center/s);
});
