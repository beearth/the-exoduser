import { planReadings as referencePlanReadings } from './coordinate-adapter.mjs';
export { createWorkspaceV2, numberBoxV2, createSnapshotV2, paintReadingsV2 } from './coordinate-hotpath-v2.mjs';

const boundedCoordinateKeys = ['width', 'height', 'cameraX', 'cameraY', 'shakeX', 'shakeY', 'zoom', 'ssaa', 'backingWidth', 'backingHeight', 'cssWidth', 'cssHeight', 'cssLeft', 'cssTop', 'dpr'];
const boundedPositiveKeys = ['width', 'height', 'zoom', 'ssaa', 'backingWidth', 'backingHeight', 'cssWidth', 'cssHeight', 'dpr'];
const boundedKinds = ['charge', 'damage'];
const maximumBucketBands = 64;

export function planReadingsV2(readings, frame, workspace, obstacles = [], gapCSS = 4) {
  const stats = workspace.stats;
  stats.intersectionTests = 0; stats.binVisits = 0; stats.candidateAttempts = 0;
  stats.sortCalls = 0; stats.mapConstructions = 0; stats.freshRecords = 0;
  stats.linearFallbacks = 0; stats.wideRegistrations = 0; stats.validationFallbacks = 0;
  stats.registeredBands = 0;
  const reference = () => { stats.validationFallbacks++; return referencePlanReadings(readings, frame, obstacles, gapCSS); };
  for (const key of boundedCoordinateKeys) if (!frame || !Number.isFinite(frame[key])) return reference();
  for (const key of boundedPositiveKeys) if (frame[key] <= 0) return reference();
  const translateX = Math.round(frame.width / 2 - frame.cameraX + frame.shakeX);
  const translateY = Math.round(frame.height / 2 - frame.cameraY + frame.shakeY);
  const viewportWidth = frame.backingWidth / frame.ssaa;
  const viewportHeight = frame.backingHeight / frame.ssaa;
  const gap = gapCSS * Math.max(frame.backingWidth / frame.cssWidth, frame.backingHeight / frame.cssHeight) / frame.ssaa;
  if (!Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight) || viewportWidth <= 0 || viewportHeight <= 0 || !Number.isFinite(gap) || gap < 0) return reference();
  const validBox = box => box && Number.isFinite(box.x) && Number.isFinite(box.y) && Number.isFinite(box.w) && Number.isFinite(box.h) && box.w > 0 && box.h > 0;
  for (const obstacle of obstacles) if (!validBox(obstacle)) return reference();
  workspace.ids.clear();
  for (let index = 0; index < readings.length; index++) {
    const reading = readings[index];
    if (!reading || typeof reading.id !== 'string' || workspace.ids.has(reading.id) || !validBox(reading.box) || (reading.kind !== 'charge' && reading.kind !== 'damage')) return reference();
    workspace.ids.add(reading.id);
    let logical = workspace.logical[index];
    if (!logical) { logical = {}; workspace.logical[index] = logical; stats.freshRecords++; }
    logical.x = frame.width / 2 + frame.zoom * (reading.box.x + translateX - frame.width / 2);
    logical.y = frame.height / 2 + frame.zoom * (reading.box.y + translateY - frame.height / 2);
    logical.w = reading.box.w * frame.zoom; logical.h = reading.box.h * frame.zoom;
    if (!validBox(logical)) return reference();
  }
  const output = workspace.output;
  if (readings.length === 0) { output.length = 0; return output; }
  const binHeight = 32;
  const accepted = workspace.accepted;
  const wide = workspace.wide || (workspace.wide = []);
  accepted.length = 0; wide.length = 0; workspace.bins.clear(); workspace.usedBins = 0;
  const boundedRange = (start, end) => Number.isSafeInteger(start) && Number.isSafeInteger(end) && end >= start && end - start + 1 <= maximumBucketBands;
  const insert = box => {
    const acceptedIndex = accepted.length;
    accepted.push(box);
    const start = Math.floor(box.y / binHeight);
    const end = Math.floor((box.y + box.h) / binHeight);
    if (!boundedRange(start, end)) { wide.push(acceptedIndex); stats.wideRegistrations++; return; }
    for (let offset = 0; offset <= end - start; offset++) {
      stats.registeredBands++;
      const band = start + offset;
      let bucket = workspace.bins.get(band);
      if (!bucket) {
        bucket = workspace.binPool[workspace.usedBins];
        if (!bucket) { bucket = []; workspace.binPool[workspace.usedBins] = bucket; stats.freshRecords++; }
        workspace.usedBins++; bucket.length = 0; workspace.bins.set(band, bucket);
      }
      bucket.push(acceptedIndex);
    }
  };
  for (const obstacle of obstacles) insert(obstacle);
  const intersects = (horizontal, vertical, width, height, acceptedIndex) => {
    stats.intersectionTests++;
    const other = accepted[acceptedIndex];
    return horizontal < other.x + other.w + gap && other.x < horizontal + width + gap && vertical < other.y + other.h + gap && other.y < vertical + height + gap;
  };
  const collides = (horizontal, vertical, width, height) => {
    const start = Math.floor((vertical - gap) / binHeight);
    const end = Math.floor((vertical + height + gap) / binHeight);
    if (!boundedRange(start, end)) {
      stats.linearFallbacks++;
      for (let index = 0; index < accepted.length; index++) if (intersects(horizontal, vertical, width, height, index)) return true;
      return false;
    }
    workspace.token++;
    if (workspace.token >= Number.MAX_SAFE_INTEGER) { workspace.seen.length = 0; workspace.token = 1; }
    for (let offset = 0; offset <= end - start; offset++) {
      stats.binVisits++;
      const bucket = workspace.bins.get(start + offset);
      if (!bucket) continue;
      for (const acceptedIndex of bucket) {
        if (workspace.seen[acceptedIndex] === workspace.token) continue;
        workspace.seen[acceptedIndex] = workspace.token;
        if (intersects(horizontal, vertical, width, height, acceptedIndex)) return true;
      }
    }
    for (const acceptedIndex of wide) if (intersects(horizontal, vertical, width, height, acceptedIndex)) return true;
    return false;
  };
  for (const kind of boundedKinds) for (let index = 0; index < readings.length; index++) {
    const reading = readings[index];
    if (reading.kind !== kind) continue;
    const logical = workspace.logical[index];
    let result = workspace.records[index];
    if (!result) { result = { box: {}, worldDelta: {}, leader: null }; workspace.records[index] = result; stats.freshRecords += 3; }
    output[index] = result;
    const step = logical.h + gap;
    let vertical = logical.y;
    let resolved = false;
    const attempts = kind === 'charge' ? 5 : 3;
    for (let attempt = 0; attempt < attempts; attempt++) {
      stats.candidateAttempts++;
      const offset = kind === 'charge' ? (attempt === 0 ? 0 : (attempt % 2 === 1 ? -1 : 1) * Math.ceil(attempt / 2) * step) : (attempt === 0 ? 0 : attempt === 1 ? step : -step);
      const proposed = logical.y + offset;
      if (logical.x >= 0 && proposed >= 0 && logical.x + logical.w <= viewportWidth && proposed + logical.h <= viewportHeight && !collides(logical.x, proposed, logical.w, logical.h)) { vertical = proposed; resolved = true; break; }
    }
    const box = result.box;
    box.x = logical.x; box.y = vertical; box.w = logical.w; box.h = logical.h;
    result.id = reading.id; result.kind = kind; result.index = index; result.deltaY = box.y - logical.y; result.unresolved = !resolved;
    result.worldDelta.x = 0; result.worldDelta.y = result.deltaY / frame.zoom;
    if (resolved && box.y !== logical.y) {
      let leader = result.cachedLeader;
      if (!leader) { leader = { from: [0, 0], to: [0, 0] }; Object.defineProperty(result, 'cachedLeader', { value: leader }); stats.freshRecords += 3; }
      leader.from[0] = logical.x + logical.w / 2; leader.from[1] = logical.y + logical.h / 2;
      leader.to[0] = box.x + box.w / 2; leader.to[1] = box.y + box.h / 2; result.leader = leader;
    } else result.leader = null;
    insert(box);
  }
  output.length = readings.length;
  return output;
}
