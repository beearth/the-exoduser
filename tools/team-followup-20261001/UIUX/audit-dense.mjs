import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const evidencePath = 'docs/0마스터플랜/mac-resume-20261001/ui03-evidence';
const manifest = JSON.parse(fs.readFileSync(`${evidencePath}/manifest.json`, 'utf8'));
const filenames = ['before-dense.png', 'after-dense.png', 'final-dense.png', 'final-dense-live.json'];
const assets = filenames.map(filename => {
  const bytes = fs.readFileSync(`${evidencePath}/${filename}`);
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha256, manifest[filename].sha256);
  assert.equal(bytes.length, manifest[filename].bytes);
  return { filename, bytes: bytes.length, sha256 };
});
const frames = JSON.parse(fs.readFileSync(`${evidencePath}/final-dense-live.json`, 'utf8'));
assert.equal(frames.length, 20);
const visible = frames.filter(frame => frame.box.w > 0 && frame.box.h > 0);
const intersects = (first, second) => first.x < second.x + second.w && second.x < first.x + first.w && first.y < second.y + second.h && second.y < first.y + first.h;
const gaps = visible.map(frame => {
  const clock = frame.neighbors.find(neighbor => neighbor.id === 'stageClock').box;
  for (const neighbor of frame.neighbors) assert.equal(intersects(frame.box, neighbor.box), false);
  for (const item of frame.items.filter(item => item.display !== 'none')) {
    assert.equal(item.pointer, 'none');
    assert.ok(parseFloat(item.font) * Number(frame.scale) >= 10.99);
  }
  return frame.box.y - clock.y - clock.h;
});
assert.ok(visible.length > 0);
for (const frame of frames) {
  assert.equal(frame.overflow, 0);
  assert.deepEqual(frame.errors, []);
  assert.equal(frame.focus, true);
  assert.equal(frame.paused, false);
}
const sourcePaths = ['game.html', 'game-easy-test.html', 'ui-refinement.css'];
const sourceHashes = Object.fromEntries(sourcePaths.map(filename => [filename, crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex')]));
for (const filename of sourcePaths.slice(0, 2)) {
  const source = fs.readFileSync(filename, 'utf8');
  assert.ok(source.includes('48px * var(--ui-scale)'));
  assert.ok(source.includes('ui-refinement.css?v=20261001-combat-status22'));
}
console.log(JSON.stringify({ scope: '기존 증거 정합성·현 소스 계약 검사; 새 실화면 PASS 아님', assets, sourceHashes, samples: frames.length, visibleSamples: visible.length, hiddenSamples: frames.length - visible.length, minimumClockGap: Math.min(...gaps), maximumClockGap: Math.max(...gaps), enemies: { minimum: Math.min(...frames.map(frame => frame.enemies)), maximum: Math.max(...frames.map(frame => frame.enemies)) }, zeroOverflow: true, capturedErrors: 0 }, null, 2));
