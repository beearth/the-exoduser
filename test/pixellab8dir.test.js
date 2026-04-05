import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALL_DIRECTIONS,
  buildBlendPlan,
  expandMetadataTo8Directions,
  mixRgbaPixels,
} from '../src/pixellab8dir.js';

test('expandMetadataTo8Directions adds diagonal rotations and animations', () => {
  const metadata = {
    character: {
      directions: 4,
    },
    frames: {
      rotations: {
        south: 'rotations/south.png',
        west: 'rotations/west.png',
        north: 'rotations/north.png',
        east: 'rotations/east.png',
      },
      animations: {
        'walking-4-frames': {
          south: [
            'animations/walking-4-frames/south/frame_000.png',
            'animations/walking-4-frames/south/frame_001.png',
          ],
          east: [
            'animations/walking-4-frames/east/frame_000.png',
            'animations/walking-4-frames/east/frame_001.png',
          ],
          north: [
            'animations/walking-4-frames/north/frame_000.png',
            'animations/walking-4-frames/north/frame_001.png',
          ],
          west: [
            'animations/walking-4-frames/west/frame_000.png',
            'animations/walking-4-frames/west/frame_001.png',
          ],
        },
      },
    },
  };

  const expanded = expandMetadataTo8Directions(metadata);

  assert.equal(expanded.character.directions, 8);
  assert.deepEqual(Object.keys(expanded.frames.rotations).sort(), [...ALL_DIRECTIONS].sort());
  assert.equal(expanded.frames.rotations['south-east'], 'rotations/south-east.png');
  assert.deepEqual(expanded.frames.animations['walking-4-frames']['north-west'], [
    'animations/walking-4-frames/north-west/frame_000.png',
    'animations/walking-4-frames/north-west/frame_001.png',
  ]);
});

test('buildBlendPlan maps uneven source frame counts across the longer sequence', () => {
  const plan = buildBlendPlan(
    ['south_0', 'south_1'],
    ['east_0', 'east_1', 'east_2', 'east_3'],
  );

  assert.deepEqual(plan, [
    { left: 'south_0', right: 'east_0' },
    { left: 'south_0', right: 'east_1' },
    { left: 'south_1', right: 'east_2' },
    { left: 'south_1', right: 'east_3' },
  ]);
});

test('mixRgbaPixels preserves opaque source and averages two opaque colors', () => {
  assert.deepEqual(
    mixRgbaPixels([0, 0, 0, 0], [20, 40, 60, 255]),
    [20, 40, 60, 255],
  );
  assert.deepEqual(
    mixRgbaPixels([255, 0, 0, 255], [0, 0, 255, 255]),
    [128, 0, 128, 255],
  );
});
