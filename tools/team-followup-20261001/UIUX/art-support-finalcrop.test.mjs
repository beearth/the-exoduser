import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import art from '../ART/wa24-delta-probe.cjs';
import { predictFinalCrop, correctedSampler } from './art-support-finalcrop.mjs';
import { actualDraw, line, sourceEvidence } from './art-support-source-fixture.mjs';

const rows = [];
const before = process.env.ART_SUPPORT_BASE_ONLY === '1';
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-11, `${actual} != ${expected}`);
for (const [fullW, fullH] of [[1920, 1080], [2560, 1080], [1920, 1200], [1024, 768]]) {
  for (const elapsed of [400, 1200, 2399]) test(`${fullW}x${fullH} ${elapsed}ms actual clip/zoom/shake crop`, () => {
    const actual = actualDraw(fullW, fullH, elapsed);
    const final = predictFinalCrop({ fullW, fullH, lines: [line], lineIdx: 0, lineStartMs: 0, now: elapsed });
    const original = art.predictWa24Crop(fullW, fullH);
    rows.push({ fullW, fullH, elapsed, baseVerdict: original.verdict, actual, final });
    assert.ok(actual.fractions.top > 0 && actual.fractions.bottom > 0);
    if (before) {
      near(original.cover.cutFracY, actual.fractions.top + actual.fractions.bottom);
      return;
    }
    for (const side of ['left', 'right', 'top', 'bottom']) near(final.fractions[side], actual.fractions[side]);
    for (const [index, value] of final.matrix.entries()) near(value, actual.matrix[index]);
    for (const key of ['x', 'y', 'w', 'h']) {
      near(final.drawRect[key], actual.drawRect[key]);
      near(final.clip[key], actual.clip[key]);
    }
    assert.deepEqual(actual.operations, ['save', 'beginPath', 'rect', 'clip', 'translate', 'translate', 'scale', 'translate', 'drawImage']);
    assert.equal(final.geometryVerdict, 'CROPPED');
    assert.equal(final.visibilityEvidence, 'GEOMETRY_ONLY');
    assert.equal(final.eyeVerdict, 'UNKNOWN');
    assert.equal(final.footVerdict, 'UNKNOWN');
    assert.equal(final.subtitleVerdict, 'UNKNOWN');
    near(final.visibleSourceRect.w + final.sourceLossPixels.left + final.sourceLossPixels.right, 2560);
    near(final.visibleSourceRect.h + final.sourceLossPixels.top + final.sourceLossPixels.bottom, 1440);
  });
}

test('16:9 root percentages reproduce with unrounded transforms, and letterbox offsets are retained', () => {
  for (const [elapsed, percent] of [[400, 6.347554630593131], [1200, 4.76190476190477], [2399, 3.846154488227231]]) {
    const actual = actualDraw(1920, 1080, elapsed);
    assert.ok(Math.abs((actual.fractions.top + actual.fractions.bottom) * 100 - percent) < 0.00001);
  }
  const wide = predictFinalCrop({ fullW: 2560, fullH: 1080, lines: [line], lineIdx: 0, lineStartMs: 0, now: 400 });
  assert.equal(wide.clip.x, 320);
  assert.equal(wide.clip.w, 1920);
});

test('line-index timing correction remains and shake uses absolute now rather than lineElapsed', () => {
  const state = { lines: [line], lineIdx: 0, lineStartMs: 80000, now: 81200 };
  assert.equal(correctedSampler, art.correctedSampler);
  assert.equal(correctedSampler(state).lineElapsed, 1200);
  const final = predictFinalCrop({ fullW: 1920, fullH: 1080, ...state });
  const actual = actualDraw(1920, 1080, 1200, 81200);
  near(final.verticalFraction, actual.fractions.top + actual.fractions.bottom);
  near(final.fractions.top, actual.fractions.top);
  assert.equal(final.lineElapsed, 1200);
});

test('fade zero is never a visibility verdict; pan is outside scale and no-crop remains geometric only', () => {
  const hidden = predictFinalCrop({ fullW: 1920, fullH: 1080, lines: [line], lineIdx: 0, lineStartMs: 0, now: 0 });
  assert.equal(hidden.fadeAlpha, 0);
  assert.equal(hidden.visibilityEvidence, 'HIDDEN_FADE_NO_VISIBILITY_EVIDENCE');
  assert.equal(hidden.eyeVerdict, 'UNKNOWN');
  const still = { ...line, cam: { zs: 1.2, ze: 1.2, px: 10, py: -5 }, vfx: { shake: 0 } };
  const panned = predictFinalCrop({ fullW: 1920, fullH: 1080, lines: [still], lineIdx: 0, lineStartMs: 0, now: 1200 });
  near(panned.matrix[4], 960 * (1 - 1.2) + 5);
  near(panned.matrix[5], 540 * (1 - 1.2) - 2.5);
  const full = predictFinalCrop({ fullW: 1920, fullH: 1080, lines: [{ ...still, cam: { zs: 1, ze: 1 } }], lineIdx: 0, lineStartMs: 0, now: 400 });
  assert.equal(full.geometryVerdict, 'FULLFRAME_GEOMETRY');
  assert.equal(full.eyeVerdict, 'UNKNOWN');
});

test('source and 12-row evidence stay within UIUX support ownership', () => {
  assert.equal(rows.length, 12);
  fs.writeFileSync(new URL(before ? './art-support-before-evidence.json' : './art-support-final-evidence.json', import.meta.url), JSON.stringify({ mode: before ? 'original-base-cover' : 'corrected-final-transform', sourceEvidence, rows, visualVerdict: 'UNKNOWN' }, null, 2) + '\n');
});
