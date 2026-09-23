import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const previewUrl = new URL('../map-field-preview.html', import.meta.url);

test('field rebuild preview is a self-contained, legacy-safe visual test map', () => {
  assert.equal(existsSync(previewUrl), true, 'map-field-preview.html must exist');
  const html = readFileSync(previewUrl, 'utf8');
  assert.match(html, /buildDiabloFieldStagePlan/);
  assert.match(html, /diablo_field_torch_v1\.png/);
  assert.match(html, /diablo_hell_corpse_tree_v1\.png/);
  assert.match(html, /boundaryMass/);
  assert.doesNotMatch(html, /_CH_DECO|floor_objects/,
    'the rebuild must not inherit the legacy chapter prop registry');
});
