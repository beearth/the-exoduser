export const ALL_DIRECTIONS = [
  'south',
  'south-east',
  'east',
  'north-east',
  'north',
  'north-west',
  'west',
  'south-west',
];

export const DIAGONAL_SOURCE_DIRS = {
  'south-east': ['south', 'east'],
  'north-east': ['north', 'east'],
  'north-west': ['north', 'west'],
  'south-west': ['south', 'west'],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function resolveSourceFrameIndex(targetIndex, targetCount, sourceCount) {
  if (sourceCount <= 1 || targetCount <= 1) {
    return 0;
  }
  return Math.round((targetIndex * (sourceCount - 1)) / (targetCount - 1));
}

export function buildBlendPlan(leftFrames = [], rightFrames = []) {
  const targetCount = Math.max(leftFrames.length, rightFrames.length);
  return Array.from({ length: targetCount }, (_, index) => ({
    left: leftFrames[resolveSourceFrameIndex(index, targetCount, leftFrames.length)],
    right: rightFrames[resolveSourceFrameIndex(index, targetCount, rightFrames.length)],
  }));
}

export function mixRgbaPixels(left, right) {
  const [lr, lg, lb, la] = left;
  const [rr, rg, rb, ra] = right;
  if (!la) return [rr, rg, rb, ra];
  if (!ra) return [lr, lg, lb, la];

  const leftAlpha = la / 255;
  const rightAlpha = ra / 255;
  const outAlpha = Math.max(la, ra);

  const weightLeft = leftAlpha / (leftAlpha + rightAlpha);
  const weightRight = rightAlpha / (leftAlpha + rightAlpha);

  return [
    Math.round((lr * weightLeft) + (rr * weightRight)),
    Math.round((lg * weightLeft) + (rg * weightRight)),
    Math.round((lb * weightLeft) + (rb * weightRight)),
    outAlpha,
  ];
}

function buildDiagonalFramePaths(animName, frameCount, dirName) {
  return Array.from({ length: frameCount }, (_, index) =>
    `animations/${animName}/${dirName}/frame_${String(index).padStart(3, '0')}.png`);
}

export function expandMetadataTo8Directions(metadata) {
  const next = clone(metadata);
  next.character ||= {};
  next.frames ||= {};
  next.frames.rotations ||= {};
  next.frames.animations ||= {};
  next.character.directions = 8;

  for (const dirName of Object.keys(DIAGONAL_SOURCE_DIRS)) {
    next.frames.rotations[dirName] ||= `rotations/${dirName}.png`;
  }

  for (const [animName, animDirs] of Object.entries(next.frames.animations)) {
    for (const [dirName, [leftDir, rightDir]] of Object.entries(DIAGONAL_SOURCE_DIRS)) {
      if (animDirs[dirName]?.length) {
        continue;
      }
      const leftFrames = animDirs[leftDir] || [];
      const rightFrames = animDirs[rightDir] || [];
      const frameCount = Math.max(leftFrames.length, rightFrames.length);
      if (!frameCount) {
        continue;
      }
      animDirs[dirName] = buildDiagonalFramePaths(animName, frameCount, dirName);
    }
  }

  return next;
}
