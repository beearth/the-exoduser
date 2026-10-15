import test from 'node:test';
import assert from 'node:assert/strict';
import { placeCombatLabel, COMBAT_LABEL_LAYOUT_LIMITS } from '../engine/fdg/druid-combat-readability.js';

const viewport = { left: 0, top: 0, right: 1000, bottom: 1000 };
const overlaps = (a, b, gap) => a.right + gap > b.left && a.left - gap < b.right
  && a.bottom + gap > b.top && a.top - gap < b.bottom;
const freeze = value => {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};

test('clear native anchor and input records remain exact and immutable', () => {
  const input = freeze({ anchor: { x: 220, y: 190 }, width: 100, height: 36,
    viewport: { ...viewport }, obstacles: [{ left: 400, top: 300, right: 700, bottom: 800 }],
    occupied: [], gap: 12 });
  const before = JSON.stringify(input);
  assert.deepEqual(placeCombatLabel(input), { x: 220, y: 190,
    rect: { left: 170, top: 172, right: 270, bottom: 208 },
    moved: false, overflow: false, reason: 'clear' });
  assert.equal(JSON.stringify(input), before);
});

test('nearest candidate avoids full boss, player weapon, and earlier label together', () => {
  const input = freeze({ anchor: { x: 500, y: 500 }, width: 80, height: 40, viewport: { ...viewport },
    obstacles: [{ left: 450, top: 300, right: 550, bottom: 700 },
      { left: 350, top: 450, right: 440, bottom: 560 }],
    occupied: [{ left: 582, top: 460, right: 682, bottom: 540 }], gap: 12 });
  const before = JSON.stringify(input);
  const result = placeCombatLabel(input);
  // The closest valid point is the intersection of boss-right and label-top.
  // The mirrored left solution must also clear the weapon and is farther away.
  assert.equal(result.x, 602);
  assert.equal(result.y, 428);
  assert.equal(result.overflow, false);
  assert.equal(result.moved, true);
  for (const blocker of [...input.obstacles, ...input.occupied]) {
    assert.equal(overlaps(result.rect, blocker, input.gap), false);
  }
  assert.ok(result.rect.left >= viewport.left && result.rect.right <= viewport.right);
  assert.ok(result.rect.top >= viewport.top && result.rect.bottom <= viewport.bottom);
  assert.equal(JSON.stringify(input), before);
});

test('offscreen anchor moves to nearest viewport edge without moving native record', () => {
  const anchor = freeze({ x: -20, y: 500 });
  const result = placeCombatLabel({ anchor, width: 80, height: 40, viewport, obstacles: [], occupied: [] });
  assert.deepEqual(result.rect, { left: 0, top: 480, right: 80, bottom: 520 });
  assert.equal(result.x, 40);
  assert.equal(result.y, 500);
  assert.equal(result.overflow, false);
  assert.deepEqual(anchor, { x: -20, y: 500 });
});

test('unplaceable, oversized, and zero-area labels remain visible fallback records', () => {
  const common = { anchor: { x: 500, y: 500 }, width: 80, height: 40, viewport, occupied: [] };
  const blocked = placeCombatLabel({ ...common, obstacles: [{ ...viewport }] });
  assert.equal(blocked.reason, 'bounded-search-exhausted');
  assert.equal(blocked.overflow, true);
  assert.equal(blocked.x, 500); assert.equal(blocked.y, 500);
  assert.deepEqual(blocked.rect, { left: 460, top: 480, right: 540, bottom: 520 });
  assert.equal(blocked.moved, false);
  const oversized = placeCombatLabel({ ...common, width: 1001, obstacles: [] });
  assert.equal(oversized.reason, 'label-exceeds-viewport');
  assert.equal(oversized.x, common.anchor.x);
  assert.equal(placeCombatLabel({ ...common, width: 0 }).reason, 'zero-area-label');
  assert.equal(placeCombatLabel({ ...common, viewport: { ...viewport, right: 0 } }).reason, 'zero-area-viewport');
});

test('nonfinite, malformed rectangles, and bounded input overflow fail without mutation', () => {
  const common = freeze({ anchor: { x: 500, y: 500 }, width: 80, height: 40, viewport: { ...viewport } });
  const before = JSON.stringify(common);
  for (const changes of [{ gap: NaN }, { width: Infinity }, { height: -1 },
    { obstacles: [{ left: 1, top: 1, right: Infinity, bottom: 2 }] },
    { occupied: [{ left: 1, top: 1, right: 1, bottom: 2 }] },
    { viewport: { left: 100, top: 0, right: 0, bottom: 100 } }]) {
    const result = placeCombatLabel({ ...common, ...changes });
    assert.equal(result.overflow, true);
    assert.equal(result.moved, false);
    assert.equal(result.x, 500); assert.equal(result.y, 500);
  }
  const invalidAnchor = placeCombatLabel({ ...common, anchor: { x: NaN, y: 500 } });
  assert.equal(invalidAnchor.x, null);
  assert.equal(invalidAnchor.rect, null);
  const tooMany = placeCombatLabel({ ...common,
    occupied: Array.from({ length: COMBAT_LABEL_LAYOUT_LIMITS.rectangles + 1 },
      () => ({ left: 1, top: 1, right: 2, bottom: 2 })) });
  assert.equal(tooMany.reason, 'rectangle-limit');
  assert.equal(JSON.stringify(common), before);
  assert.equal(COMBAT_LABEL_LAYOUT_LIMITS.candidates, 128);
});
