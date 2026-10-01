export function intersects(first, second, gap = 0) {
  return first.x < second.x + second.w + gap && second.x < first.x + first.w + gap && first.y < second.y + second.h + gap && second.y < first.y + first.h + gap;
}

export function layoutReadings(readings, viewport, obstacles = [], gap = 4) {
  const ids = new Set();
  const validBox = box => [box.x, box.y, box.w, box.h].every(Number.isFinite) && box.w > 0 && box.h > 0;
  if (!validBox(viewport) || !Number.isFinite(gap) || gap < 0 || !obstacles.every(validBox)) throw new TypeError('invalid geometry');
  for (const reading of readings) {
    if (typeof reading.id !== 'string' || ids.has(reading.id) || !validBox(reading) || !['charge', 'damage'].includes(reading.kind)) throw new TypeError('invalid reading');
    ids.add(reading.id);
  }
  const accepted = obstacles.map(box => ({ ...box }));
  const ordered = readings.map((reading, index) => ({ ...reading, index })).sort((first, second) => Number(second.kind === 'charge') - Number(first.kind === 'charge') || first.index - second.index);
  const output = ordered.map(reading => {
    const step = reading.h + gap;
    const offsets = reading.kind === 'charge' ? [0, -step, step, -2 * step, 2 * step] : [0, step, -step];
    const inside = box => box.x >= viewport.x && box.y >= viewport.y && box.x + box.w <= viewport.x + viewport.w && box.y + box.h <= viewport.y + viewport.h;
    let selected = null;
    for (const offset of offsets) {
      const box = { x: reading.x, y: reading.y + offset, w: reading.w, h: reading.h };
      if (inside(box) && !accepted.some(other => intersects(box, other, gap))) {
        selected = box;
        break;
      }
    }
    const box = selected || { x: reading.x, y: reading.y, w: reading.w, h: reading.h };
    accepted.push(box);
    return { id: reading.id, kind: reading.kind, index: reading.index, box, deltaY: box.y - reading.y, unresolved: selected === null, leader: selected !== null && box.y !== reading.y ? { from: [reading.x + reading.w / 2, reading.y + reading.h / 2], to: [box.x + box.w / 2, box.y + box.h / 2] } : null };
  });
  return output.sort((first, second) => first.index - second.index);
}
