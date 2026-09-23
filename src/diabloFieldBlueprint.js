const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function encodeRle(cells) {
  const rle = [];
  let value = cells[0];
  let count = 0;
  for (const cell of cells) {
    if (cell === value) count++;
    else { rle.push(value, count); value = cell; count = 1; }
  }
  rle.push(value, count);
  return rle;
}

export function decodeFieldRle(rle, size) {
  const cells = [];
  for (let i = 0; i < rle.length; i += 2) {
    for (let count = 0; count < rle[i + 1]; count++) cells.push(rle[i]);
  }
  if (cells.length !== size) throw new Error(`RLE size mismatch: ${cells.length}/${size}`);
  return cells;
}

export function buildDiabloFieldBlueprint(stageIndex, width = 200, height = 200) {
  const variant = ((stageIndex | 0) * 37) % 17;
  const sway = (index, amount) => Math.sin((index + 1) * (variant + 11) * 0.173) * amount;
  const regions = [
    { role: 'start', cx: 100 + sway(1, 5), cy: 181, rx: 40, ry: 22 },
    { role: 'combat', cx: 76 + sway(2, 7), cy: 145, rx: 42, ry: 30 },
    { role: 'travel', cx: 112 + sway(3, 8), cy: 108, rx: 35, ry: 26 },
    { role: 'combat', cx: 86 + sway(4, 9), cy: 70, rx: 46, ry: 32 },
    { role: 'pocket', cx: 151 + sway(5, 7), cy: 82, rx: 30, ry: 24 },
    { role: 'boss', cx: 100 + sway(6, 4), cy: 24, rx: 40, ry: 24 }
  ];
  const cells = new Uint8Array(width * height);
  const markEllipse = (cx, cy, rx, ry, roughness = 0) => {
    const minX = clamp(Math.floor(cx - rx - 2), 2, width - 3);
    const maxX = clamp(Math.ceil(cx + rx + 2), 2, width - 3);
    const minY = clamp(Math.floor(cy - ry - 2), 2, height - 3);
    const maxY = clamp(Math.ceil(cy + ry + 2), 2, height - 3);
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const edge = 1 + roughness * (Math.sin(x * 0.37 + variant) + Math.cos(y * 0.29 - variant)) * 0.5;
      if (dx * dx + dy * dy <= edge * edge) cells[y * width + x] = 1;
    }
  };
  const bridge = (from, to, radius) => {
    const dx = to.cx - from.cx;
    const dy = to.cy - from.cy;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 3));
    for (let index = 0; index <= steps; index++) {
      const progress = index / steps;
      markEllipse(from.cx + dx * progress, from.cy + dy * progress, radius, radius * 0.76, 0.08);
    }
  };

  for (const region of regions) markEllipse(region.cx, region.cy, region.rx, region.ry, 0.09);
  bridge(regions[0], regions[1], 15);
  bridge(regions[1], regions[2], 14);
  bridge(regions[2], regions[3], 15);
  bridge(regions[3], regions[5], 16);
  bridge(regions[3], regions[4], 13);

  const rooms = regions
    .filter(({ role }) => role !== 'travel' && role !== 'pocket')
    .map((region, index) => ({
      id: region.role === 'start' ? 's' : region.role === 'boss' ? 'b' : `c${index}`,
      type: region.role === 'start' ? 'start' : region.role === 'boss' ? 'boss' : 'combat',
      cx: Math.round(region.cx), cy: Math.round(region.cy), shape: 'ellipse',
      rx: Math.max(10, Math.round(region.rx * 0.48)), ry: Math.max(8, Math.round(region.ry * 0.48))
    }));
  const spawnHoles = [regions[1], regions[2], regions[3], regions[4]].map((region, index) => ({
    x: Math.round(region.cx + (index % 2 ? -region.rx * 0.28 : region.rx * 0.22)),
    y: Math.round(region.cy + (index < 2 ? region.ry * 0.2 : -region.ry * 0.22)),
    type: index === 3 ? 'L' : 'M'
  }));
  return {
    width, height, route: 'south_to_north', regions, rooms, spawnHoles,
    start: { x: regions[0].cx, y: regions[0].cy },
    bossGate: { x: 100, y: 12 },
    tileRLE: encodeRle(cells)
  };
}
