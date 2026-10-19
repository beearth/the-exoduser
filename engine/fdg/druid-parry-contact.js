const COLUMNS = 6;
const ROWS = 4;
const CELL_SIZE = 128;
const FRAME_COUNT = 24;
const FPS = 24;
const NATIVE_FPS = 60;
const WORLD_SIZE = 96;

export const DRUID_PARRY_CONTACT_ATLAS = Object.freeze({
  columns: COLUMNS,
  rows: ROWS,
  cellSize: CELL_SIZE,
  frameCount: FRAME_COUNT,
  fps: FPS,
  nativeFps: NATIVE_FPS,
  worldSize: WORLD_SIZE,
  width: COLUMNS * CELL_SIZE,
  height: ROWS * CELL_SIZE,
  visualDurationSeconds: FRAME_COUNT / FPS,
  transparentFrame: FRAME_COUNT - 1,
});

// Author one immutable texture. Native effect age and lifetime remain caller-owned.
function makeAtlas(canvasFactory) {
  const canvas = canvasFactory();
  if (!canvas || typeof canvas.getContext !== 'function') return null;
  canvas.width = DRUID_PARRY_CONTACT_ATLAS.width;
  canvas.height = DRUID_PARRY_CONTACT_ATLAS.height;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.clearRect(0, 0, canvas.width, canvas.height);
  const angles = [-0.42, -0.18, 0.06, 0.30, Math.PI - 0.26, Math.PI + 0.18];
  const lengths = [46, 38, 50, 35, 27, 30];

  for (let frame = 0; frame < FRAME_COUNT - 1; frame++) {
    const phase = frame / (FRAME_COUNT - 1);
    const expansion = 1 - (1 - phase) ** 3;
    const fade = (1 - phase) ** 1.6;
    context.save();
    try {
      context.translate((frame % COLUMNS + 0.5) * CELL_SIZE,
        (Math.floor(frame / COLUMNS) + 0.5) * CELL_SIZE);
      context.beginPath();
      context.rect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
      context.clip();
      context.globalCompositeOperation = 'source-over';
      context.lineCap = 'butt';
      context.lineJoin = 'miter';

      // Narrow cyan bloom follows the rays; no surrounding disk or ring.
      for (let layer = 0; layer < 2; layer++) {
        context.globalAlpha = fade * (layer === 0 ? 0.16 : 0.95);
        context.strokeStyle = layer === 0 ? '#68dfff' : '#f5ffff';
        context.lineWidth = (layer === 0 ? 6 : 1.8) * (1 - phase * 0.5);
        context.beginPath();
        for (let ray = 0; ray < angles.length; ray++) {
          const angle = angles[ray] + phase * (ray % 2 ? 0.035 : -0.035);
          const reach = lengths[ray] * (0.38 + 0.62 * expansion) * (0.98 - 0.16 * phase);
          const inner = phase * reach * 0.34;
          context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
          context.lineTo(Math.cos(angle) * reach, Math.sin(angle) * reach);
        }
        context.stroke();
      }

      // Small pointed shards spread from the contact and taper during recovery.
      context.globalAlpha = fade * 0.82;
      context.fillStyle = '#8cecff';
      for (let shard = 0; shard < 5; shard++) {
        const angle = -0.82 + shard * 0.41 + phase * 0.08;
        const distance = (11 + shard * 2.5) + expansion * (12 + shard * 1.5);
        const cx = Math.cos(angle) * distance;
        const cy = Math.sin(angle) * distance;
        const reach = (6 - shard * 0.5) * (1 - phase * 0.7);
        const width = 1.7 * (1 - phase * 0.5);
        context.beginPath();
        context.moveTo(cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach);
        context.lineTo(cx - Math.sin(angle) * width, cy + Math.cos(angle) * width);
        context.lineTo(cx - Math.cos(angle) * reach, cy - Math.sin(angle) * reach);
        context.closePath();
        context.fill();
      }
    } finally {
      context.restore();
    }
  }
  // Cell 23 stays clear. It is also the transparent tail while native mt72 lives.
  return canvas;
}

export function createDruidParryContactRenderer({ canvasFactory } = {}) {
  const factory = canvasFactory ?? (() => globalThis.document?.createElement('canvas'));
  let atlas = null;
  try {
    if (typeof factory === 'function') atlas = makeAtlas(factory);
  } catch {
    // An unavailable authoring texture leaves the native renderer responsible.
  }

  return Object.freeze({
    metadata: DRUID_PARRY_CONTACT_ATLAS,
    get ready() { return atlas !== null; },
    draw(context, options = {}) {
      const { kind, x, y, ageFrames, active } = options ?? {};
      if (!atlas || active !== true || kind !== 'dark02'
        || !Number.isFinite(x) || !Number.isFinite(y)
        || !Number.isFinite(ageFrames) || ageFrames < 0
        || typeof context?.save !== 'function' || typeof context?.restore !== 'function'
        || typeof context?.drawImage !== 'function') return false;

      const frame = Math.min(FRAME_COUNT - 1, Math.floor((ageFrames / NATIVE_FPS) * FPS));
      context.save();
      try {
        context.globalCompositeOperation = 'source-over';
        context.globalAlpha = 1;
        context.drawImage(atlas, (frame % COLUMNS) * CELL_SIZE,
          Math.floor(frame / COLUMNS) * CELL_SIZE, CELL_SIZE, CELL_SIZE,
          x - WORLD_SIZE / 2, y - WORLD_SIZE / 2, WORLD_SIZE, WORLD_SIZE);
      } finally {
        context.restore();
      }
      return true;
    },
  });
}
