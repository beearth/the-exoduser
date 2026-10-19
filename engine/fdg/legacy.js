/** Read-only adapters for the game's editor RLE and FIXED_MAP template format. */
const FIELD_SIZE = 200;
const TILE_SIZE = 40;

function dimensions(width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 || width * height > 1_000_000) {
    throw new RangeError('맵 크기는 양의 정수이며 총 1,000,000셀 이하여야 합니다.');
  }
  return width * height;
}

function sequence(value) {
  return Array.isArray(value) || (ArrayBuffer.isView(value) && !(value instanceof DataView));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** FDG preserves editor values: only 1 is traversable; 0/2/3 are blocked. */
export function decodeTileRLE(rle, width = FIELD_SIZE, height = FIELD_SIZE) {
  const count = dimensions(width, height);
  if (!sequence(rle) || rle.length === 0 || rle.length % 2 !== 0) {
    throw new TypeError('tileRLE에는 [값, 개수] 쌍이 필요합니다.');
  }
  let total = 0;
  for (let i = 0; i < rle.length; i += 2) {
    if (!Number.isInteger(rle[i]) || rle[i] < 0 || rle[i] > 3) throw new RangeError('에디터 타일 값은 0~3입니다.');
    if (!Number.isSafeInteger(rle[i + 1]) || rle[i + 1] < 1) throw new RangeError('RLE 길이는 양의 정수여야 합니다.');
    total += rle[i + 1];
    if (total > count) throw new RangeError('tileRLE가 맵 크기를 초과합니다.');
  }
  if (total !== count) throw new RangeError('tileRLE가 맵 전체를 정확히 채워야 합니다.');
  const tiles = new Array(count);
  let position = 0;
  for (let i = 0; i < rle.length; i += 2) {
    tiles.fill(rle[i], position, position + rle[i + 1]);
    position += rle[i + 1];
  }
  return tiles;
}

/** Encode raw editor/FDG values without losing wall, void, or high-wall types. */
export function encodeTileRLE(tiles) {
  if (!sequence(tiles) || tiles.length === 0 || tiles.length > 1_000_000) throw new RangeError('1~1,000,000개의 타일이 필요합니다.');
  const output = [];
  let previous = -1;
  let count = 0;
  for (const tile of tiles) {
    if (!Number.isInteger(tile) || tile < 0 || tile > 3) throw new RangeError('FDG 타일 값은 0~3입니다.');
    const value = tile;
    if (value === previous) count += 1;
    else {
      if (count) output.push(previous, count);
      previous = value;
      count = 1;
    }
  }
  output.push(previous, count);
  return output;
}

function point(point, width, height, label) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new TypeError(`${label} 좌표가 필요합니다.`);
  const result = { x: Math.floor(point.x), y: Math.floor(point.y) };
  if (result.x < 0 || result.y < 0 || result.x >= width || result.y >= height) throw new RangeError(`${label} 좌표가 맵 밖입니다.`);
  return result;
}

function fixedDimensions(template) {
  if (!template || template.mw !== FIELD_SIZE || template.mh !== FIELD_SIZE) throw new RangeError('본편 FIXED_MAP adapter는 200×200맵만 지원합니다.');
}

/** Does not load or mutate game.html, FIXED_MAPS, or _MAP_COMPOSE. */
export function importFixedMap(template, { id = 'legacy-map', name = 'FIXED_MAP 미리보기' } = {}) {
  fixedDimensions(template);
  if (!Array.isArray(template.rooms)) throw new TypeError('FIXED_MAP rooms 배열이 필요합니다.');
  const startRoom = template.rooms.find(room => room.type === 'start');
  const bossRoom = template.rooms.find(room => room.type === 'boss');
  if (!startRoom || !bossRoom) throw new TypeError('start와 boss 방이 필요합니다.');
  const tiles = decodeTileRLE(template.tileRLE, template.mw, template.mh);
  const start = point({ x: startRoom.cx, y: startRoom.cy }, FIELD_SIZE, FIELD_SIZE, '시작');
  const exit = point(template.fdgDraft?.previewExit ?? { x: bossRoom.cx, y: bossRoom.cy }, FIELD_SIZE, FIELD_SIZE, '미리보기 출구');
  const objects = Array.isArray(template.fdgDraft?.visualInstances) ? clone(template.fdgDraft.visualInstances) : [];
  return {
    id, name, width: FIELD_SIZE, height: FIELD_SIZE, tileSize: TILE_SIZE,
    tiles, start, exit, objects, sourceTemplate: clone(template),
    provenance: {
      kind: 'fixed-map-template-preview',
      note: 'FDG draft의 출구·장식 또는 원본 보스방 중심을 미리보기로 사용합니다. 본편 게이트·출구 재카빙 및 _MAP_COMPOSE 연동은 별도입니다.',
    },
  };
}

export function exportFixedMap(map, sourceTemplate = map?.sourceTemplate) {
  if (!map || map.width !== FIELD_SIZE || map.height !== FIELD_SIZE || map.tileSize !== TILE_SIZE) throw new RangeError('본편 FIXED_MAP adapter는 200×200 / 40px맵만 지원합니다.');
  if (!sequence(map.tiles) || map.tiles.length !== FIELD_SIZE * FIELD_SIZE) throw new RangeError('정확히 40,000개의 타일이 필요합니다.');
  if (map.objects != null && !Array.isArray(map.objects)) throw new TypeError('FDG 장식 objects는 배열이어야 합니다.');
  const start = point(map.start, FIELD_SIZE, FIELD_SIZE, '시작');
  const exit = point(map.exit, FIELD_SIZE, FIELD_SIZE, '출구');
  if (map.tiles[start.y * FIELD_SIZE + start.x] !== 1 || map.tiles[exit.y * FIELD_SIZE + exit.x] !== 1) throw new RangeError('시작과 출구는 걸을 수 있는 타일이어야 합니다.');
  const output = sourceTemplate ? clone(sourceTemplate) : {
    mw: FIELD_SIZE, mh: FIELD_SIZE, rooms: [], corridors: [], features: [], corridorSpawns: [], spawnHoles: [], objs: [],
  };
  if (sourceTemplate) fixedDimensions(sourceTemplate);
  output.mw = FIELD_SIZE;
  output.mh = FIELD_SIZE;
  output.tileRLE = encodeTileRLE(map.tiles);
  if (!Array.isArray(output.rooms)) throw new TypeError('원본 rooms는 배열이어야 합니다.');
  for (const [type, target, fallbackId] of [['start', start, 's'], ['boss', exit, 'b']]) {
    let room = output.rooms.find(entry => entry.type === type);
    if (!room) {
      room = { id: fallbackId, type, shape: 'ellipse', rx: 8, ry: 8 };
      output.rooms.push(room);
    }
    room.cx = target.x;
    room.cy = target.y;
  }
  if (Array.isArray(output.objs)) {
    for (const object of output.objs) {
      if (object.id === 'player_start') Object.assign(object, start);
      else if (object.id === 'boss_pos') Object.assign(object, exit);
    }
  }
  output.fdgDraft = {
    schemaVersion: 1, gameplayApplied: false, previewExit: { ...exit },
    visualInstances: clone(map.objects || []),
    note: 'FDG 미리보기 장식입니다. 본편 MAP_OBJS 또는 충돌 데이터에 적용되지 않습니다.',
  };
  return output;
}
