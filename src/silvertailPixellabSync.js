export const SILVERTAIL_DIRECTIONS = [
  'south', 'south-east', 'east', 'north-east',
  'north', 'north-west', 'west', 'south-west',
];

const CLOCK_FILE_BY_GAME_DIRECTION = {
  south: '6',
  'south-east': '5',
  east: '3',
  'north-east': '1',
  north: '12',
  'north-west': '11',
  west: '9',
  'south-west': '7',
};

export function clockFileForGameDirection(gameDirection) {
  const clock = CLOCK_FILE_BY_GAME_DIRECTION[gameDirection];
  if (!clock) throw new Error(`Unknown Silvertail direction: ${gameDirection}`);
  return clock;
}

const PIXELLAB_DIRECTION_BY_GAME_DIRECTION = {
  'south-east': 'south-west',
  'south-west': 'south-east',
};

export function pixelLabDirectionForGame(gameDirection) {
  if (!SILVERTAIL_DIRECTIONS.includes(gameDirection)) {
    throw new Error(`Unknown Silvertail direction: ${gameDirection}`);
  }
  return PIXELLAB_DIRECTION_BY_GAME_DIRECTION[gameDirection] || gameDirection;
}

export function buildSilvertailFramePlan(gameDirection, walkFrameCount) {
  if (!Number.isInteger(walkFrameCount) || walkFrameCount < 1) {
    throw new Error('walkFrameCount must be a positive integer');
  }
  const direction = pixelLabDirectionForGame(gameDirection);
  return [
    { type: 'walk', direction, frame: 0 },
    { type: 'walk', direction, frame: 0 },
    ...Array.from({ length: walkFrameCount }, (_, frame) => ({ type: 'walk', direction, frame })),
  ];
}
