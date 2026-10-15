import { createWorldProjection, WORLD_CAMERA_DEFAULTS } from './world-camera.js';

const IDENTITY = Object.freeze([1, 0, 0, 1, 0, 0]);
const TAU = Math.PI * 2;
const ACTOR_CUTAWAY_MARGIN = 8;
const ACTOR_CUTAWAY_ALPHA = 0.2;
const ACTOR_CUTAWAY_SEGMENTS = 16;
const ACTOR_CUTAWAY_BANDS = Object.freeze([2, 4, 6, 8].map((padding, index) => Object.freeze({ padding, alpha: (index + 1) / 5 })));
const BILLBOARD_STYLE_KEYS = Object.freeze(['globalAlpha', 'globalCompositeOperation', 'filter', 'fillStyle', 'strokeStyle',
  'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'font', 'textAlign', 'textBaseline', 'direction', 'imageSmoothingEnabled',
  'imageSmoothingQuality', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'lineDashOffset', 'fontKerning',
  'fontStretch', 'fontVariantCaps', 'letterSpacing', 'wordSpacing', 'textRendering']);
const finite = (...v) => v.every(Number.isFinite);
const multiply = (a, b) => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
];
const transform = (m, x, y) => ({ x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] });
const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

function clipHalfPlane(points, evaluate) {
  if (!points.length) return [];
  const output = []; let previous = points.at(-1), from = evaluate(previous);
  for (const current of points) {
    const to = evaluate(current);
    if ((from >= 0) !== (to >= 0)) {
      const t = from / (from - to);
      output.push({ x: previous.x + (current.x - previous.x) * t, y: previous.y + (current.y - previous.y) * t });
    }
    if (to >= 0) output.push(current);
    previous = current; from = to;
  }
  return output;
}

const polygonArea = points => Math.abs(points.reduce((sum, p, i) => {
  const next = points[(i + 1) % points.length]; return sum + p.x * next.y - next.x * p.y;
}, 0)) / 2;
function screenTextureIntersection(a, b, t) {
  const vertex = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  if (a.w !== undefined || b.w !== undefined) {
    const from = 1 / (a.w ?? 1), to = 1 / (b.w ?? 1), inverseW = from * (1 - t) + to * t;
    vertex.w = 1 / inverseW;
    vertex.u = (a.u * from * (1 - t) + b.u * to * t) / inverseW;
    vertex.v = (a.v * from * (1 - t) + b.v * to * t) / inverseW;
  } else {
    vertex.u = a.u + (b.u - a.u) * t; vertex.v = a.v + (b.v - a.v) * t;
  }
  return vertex;
}
function splitTexturePlane(points, evaluate) {
  const inside = [], outside = [];
  if (!points.length) return { inside, outside };
  let previous = points.at(-1), from = evaluate(previous);
  for (const point of points) {
    const to = evaluate(point);
    if ((from >= 0) !== (to >= 0)) {
      const intersection = screenTextureIntersection(previous, point, from / (from - to));
      inside.push(intersection); outside.push(intersection);
    }
    (to >= 0 ? inside : outside).push(point);
    previous = point; from = to;
  }
  return { inside, outside };
}
function convexTriangles(points) {
  const triangles = [];
  for (let i = 1; i + 1 < points.length; i++) {
    const triangle = [points[0], points[i], points[i + 1]];
    if (polygonArea(triangle) > 1e-8) triangles.push(triangle.map(p => ({ ...p })));
  }
  return triangles;
}

/** Screen-space partition; source-pixel UV and positive clip W remain perspective correct. */
export function partitionProjectedTextureTriangle(vertices, rectangle) {
  let inside = vertices.map(vertex => ({ ...vertex }));
  const outside = [];
  for (const evaluate of [p => p.x - rectangle.left, p => rectangle.right - p.x,
    p => p.y - rectangle.top, p => rectangle.bottom - p.y]) {
    const split = splitTexturePlane(inside, evaluate);
    outside.push(...convexTriangles(split.outside)); inside = split.inside;
  }
  return { outside, inside: convexTriangles(inside) };
}

function partitionTexturePolygon(vertices, contour) {
  let inside = vertices;
  const outside = [];
  const signedArea = contour.reduce((sum, p, i) => {
    const next = contour[(i + 1) % contour.length]; return sum + p.x * next.y - next.x * p.y;
  }, 0);
  const direction = signedArea >= 0 ? 1 : -1;
  for (let i = 0; i < contour.length && inside.length; i++) {
    const a = contour[i], b = contour[(i + 1) % contour.length];
    const split = splitTexturePlane(inside, point => cross(a, b, point) * direction);
    if (split.outside.length >= 3 && polygonArea(split.outside) > 1e-8) outside.push(split.outside);
    inside = split.inside;
  }
  return { outside, inside };
}

/** Convex screen contour partition using the same UV/W intersections as the rectangle oracle. */
export function partitionProjectedTextureContour(vertices, contour) {
  const split = partitionTexturePolygon(vertices.map(vertex => ({ ...vertex })), contour);
  return { outside: split.outside.flatMap(convexTriangles), inside: convexTriangles(split.inside) };
}

function actorContour(ellipse, padding) {
  return Array.from({ length: ACTOR_CUTAWAY_SEGMENTS }, (_, index) => {
    const angle = TAU * index / ACTOR_CUTAWAY_SEGMENTS;
    return { x: ellipse.centerX + (ellipse.radiusX + padding) * Math.cos(angle),
      y: ellipse.centerY + (ellipse.radiusY + padding) * Math.sin(angle) };
  });
}

/** Ear clipping keeps native GPU fills at three vertices, including concave paths. */
function triangulate(points) {
  const p = points.filter((v, i) => !i || Math.hypot(v.x - points[i - 1].x, v.y - points[i - 1].y) > 1e-8);
  if (p.length > 2 && Math.hypot(p[0].x - p.at(-1).x, p[0].y - p.at(-1).y) < 1e-8) p.pop();
  if (p.length < 3) return [];
  const area = p.reduce((sum, v, i) => sum + v.x * p[(i + 1) % p.length].y - p[(i + 1) % p.length].x * v.y, 0);
  const direction = area >= 0 ? 1 : -1;
  const indices = p.map((_, i) => i), output = [];
  let guard = p.length * p.length;
  while (indices.length > 3 && guard-- > 0) {
    let ear = false;
    for (let i = 0; i < indices.length; i++) {
      const before = indices[(i + indices.length - 1) % indices.length], at = indices[i], after = indices[(i + 1) % indices.length];
      const a = p[before], b = p[at], c = p[after];
      if (cross(a, b, c) * direction <= 1e-10) continue;
      const contains = indices.some(j => j !== before && j !== at && j !== after
        && cross(a, b, p[j]) * direction >= -1e-9 && cross(b, c, p[j]) * direction >= -1e-9 && cross(c, a, p[j]) * direction >= -1e-9);
      if (contains) continue;
      output.push([a, b, c]); indices.splice(i, 1); ear = true; break;
    }
    if (!ear) break; // Self intersections are not silently filled as a convex fan.
  }
  if (indices.length === 3) output.push(indices.map(i => p[i]));
  return output;
}

/** Canvas sink. GPU callers supply an equivalent native command-buffer sink. */
export function drawCanvasTexturedTriangle(raw, image, vertices, alpha = raw.globalAlpha) {
  const [a, b, c] = vertices;
  const determinant = (b.u - a.u) * (c.v - a.v) - (c.u - a.u) * (b.v - a.v);
  if (!finite(determinant) || Math.abs(determinant) < 1e-10) return;
  const A = ((b.x - a.x) * (c.v - a.v) - (c.x - a.x) * (b.v - a.v)) / determinant;
  const B = ((b.y - a.y) * (c.v - a.v) - (c.y - a.y) * (b.v - a.v)) / determinant;
  const C = ((c.x - a.x) * (b.u - a.u) - (b.x - a.x) * (c.u - a.u)) / determinant;
  const D = ((c.y - a.y) * (b.u - a.u) - (b.y - a.y) * (c.u - a.u)) / determinant;
  const E = a.x - A * a.u - C * a.v, F = a.y - B * a.u - D * a.v;
  if (!finite(A, B, C, D, E, F)) return;
  raw.save();
  try {
    raw.globalAlpha = alpha;
    raw.beginPath(); raw.moveTo(a.x, a.y); raw.lineTo(b.x, b.y); raw.lineTo(c.x, c.y); raw.closePath(); raw.clip();
    raw.transform(A, B, C, D, E, F); raw.drawImage(image, 0, 0);
  } finally { raw.restore(); }
}

/**
 * Scoped native renderer consumer. Camera/world positions stay in logical pixels;
 * raw is held at pixelScale only. No clocks, globals, gameplay, DOM or persistence.
 */
export function createNativeWorldProjection({ drawTexturedTriangle = drawCanvasTexturedTriangle, cellSize,
  maxCellSize = cellSize ?? 512, textureTolerance = 0.75, maxTextureDepth = 7 } = {}) {
  if (cellSize !== undefined && (!Number.isFinite(cellSize) || cellSize <= 0 || cellSize > 64)) throw new TypeError('Legacy ground texture cellSize must be 0..64.');
  if (!finite(maxCellSize, textureTolerance) || maxCellSize <= 0 || maxCellSize > 512 || textureTolerance <= 0
    || !Number.isInteger(maxTextureDepth) || maxTextureDepth < 0 || maxTextureDepth > 7) throw new TypeError('Adaptive texture limits require maxCellSize 0..512, positive tolerance, depth 0..7.');
  let raw = null, active = false, projection = null, model = [...IDENTITY], screen = false, role = null;
  let pixelScale = 1, shake = { x: 0, y: 0 }, viewport = null, bounds = null;
  const states = [], roles = [];
  let deferBillboards = false, actorOcclusionCutaway = false, batchSequence = 0;
  const billboardQueue = [];
  const actorOcclusionBounds = [];
  let contours = [], contour = null, pathRole = null;
  const metrics = { groundTriangles: 0, textureTriangles: 0, billboardTriangles: 0, rejectedNonFinite: 0, clippedPolygons: 0, unsupportedClip: 0,
    textureCells: 0, textureSplits: 0, maxTextureError: 0, textureLimitCells: 0,
    deferredBillboardBatches: 0, deferredBillboardCommands: 0, flushedBillboardBatches: 0, flushedBillboardCommands: 0,
    cutawayActorBounds: 0, cutawayOccluderBatches: 0, cutawaySourceTriangles: 0, cutawayReducedTriangles: 0,
    cutawayExtraTriangles: 0, cutawayReducedArea: 0, cutawayFeatherTriangles: 0, cutawayFeatherArea: 0 };
  const reject = (...v) => { if (finite(...v)) return false; metrics.rejectedNonFinite++; return true; };
  const setModel = value => { if (!reject(...value)) model = value; };
  const call = (key, args) => raw[key](...args);
  const bypass = () => !active || screen;
  const baseTransform = () => raw.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  function captureStyles() {
    const style = {};
    for (const key of BILLBOARD_STYLE_KEYS) if (raw[key] !== undefined) style[key] = raw[key];
    if (typeof raw.getLineDash === 'function') style.lineDash = [...raw.getLineDash()];
    return style;
  }
  function applyStyles(style) {
    for (const [key, value] of Object.entries(style)) {
      if (key === 'lineDash') {
        if (typeof raw.setLineDash !== 'function') continue;
        const current = typeof raw.getLineDash === 'function' ? raw.getLineDash() : null;
        if (!current || current.length !== value.length || current.some((item, index) => item !== value[index])) raw.setLineDash(value);
      } else if (raw[key] !== value) raw[key] = value;
    }
  }
  function replay(command) {
    if (command.kind === 'fill') {
      const [a, b, c] = command.vertices;
      raw.beginPath(); raw.moveTo(a.x, a.y); raw.lineTo(b.x, b.y); raw.lineTo(c.x, c.y); raw.closePath(); raw.fill();
    } else if (command.kind === 'texture') drawTexturedTriangle(raw, command.image, command.vertices, command.alpha);
    else if (command.kind === 'text') { raw.setTransform(...command.matrix); raw[command.method](command.text, 0, 0, ...command.rest); }
  }
  function submit(command, commandRole) {
    if (deferBillboards && commandRole?.batch) {
      const batch = commandRole.batch;
      if (!batch.submitted) { batch.submitted = true; metrics.deferredBillboardBatches++; }
      batch.commands.push({ ...command, style: captureStyles() }); metrics.deferredBillboardCommands++;
    } else replay(command);
  }
  function pendingBatches() {
    return [...new Set([...billboardQueue, ...roles.map(frame => frame.current.batch)].filter(batch => batch?.commands.length))];
  }
  function actorBounds(batches) {
    const anchors = new Map();
    for (const batch of batches) {
      if (batch.kind !== 'actor') continue;
      const key = `${batch.x}/${batch.y}`;
      let box = anchors.get(key);
      if (!box) {
        box = { x: batch.x, y: batch.y, depth: batch.depth, left: batch.anchor.x, right: batch.anchor.x,
          top: batch.anchor.y, bottom: batch.anchor.y }; anchors.set(key, box);
      }
      for (const command of batch.commands) {
        const points = command.vertices || command.bounds || [];
        for (const point of points) {
          box.left = Math.min(box.left, point.x); box.right = Math.max(box.right, point.x);
          box.top = Math.min(box.top, point.y); box.bottom = Math.max(box.bottom, point.y);
        }
      }
    }
    return [...anchors.values()].map(box => {
      const bodyBounds = { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      // sqrt(2) circumscribes the full body/foot AABB. With 16 vertices its four
      // AABB corners occur at contour vertices, so feathering never clips the body.
      const ellipse = { centerX: (box.left + box.right) / 2, centerY: (box.top + box.bottom) / 2,
        radiusX: (box.right - box.left) / 2 * Math.SQRT2, radiusY: (box.bottom - box.top) / 2 * Math.SQRT2 };
      return { x: box.x, y: box.y, depth: box.depth, bodyBounds, ellipse,
        left: ellipse.centerX - ellipse.radiusX - ACTOR_CUTAWAY_MARGIN,
        right: ellipse.centerX + ellipse.radiusX + ACTOR_CUTAWAY_MARGIN,
        top: ellipse.centerY - ellipse.radiusY - ACTOR_CUTAWAY_MARGIN,
        bottom: ellipse.centerY + ellipse.radiusY + ACTOR_CUTAWAY_MARGIN };
    });
  }
  function cutawayTexture(command, batch, actors) {
    if (batch.kind !== 'occluder' || command.kind !== 'texture' || command.alpha <= ACTOR_CUTAWAY_ALPHA) return [command];
    let pieces = [{ vertices: command.vertices, alpha: command.alpha }];
    for (const actor of actors) {
      if (batch.depth <= actor.depth) continue;
      const next = [];
      for (const piece of pieces) {
        if (piece.alpha <= ACTOR_CUTAWAY_ALPHA || piece.vertices.every(p => p.x <= actor.left) || piece.vertices.every(p => p.x >= actor.right)
          || piece.vertices.every(p => p.y <= actor.top) || piece.vertices.every(p => p.y >= actor.bottom)) { next.push(piece); continue; }
        let remaining = piece.vertices, alpha = piece.alpha;
        // Keep the convex inside polygon for the next smaller band/actor. A fan
        // at every intermediate contour creates avoidable triangle fragmentation.
        for (const band of actor.bands) {
          if (alpha <= band.alpha) continue;
          const split = partitionTexturePolygon(remaining, band.contour);
          if (split.inside.length < 3 || polygonArea(split.inside) <= 1e-8) break;
          next.push(...split.outside.map(vertices => ({ vertices, alpha })));
          remaining = split.inside; alpha = band.alpha;
        }
        next.push({ vertices: remaining, alpha });
      }
      pieces = next;
    }
    pieces = pieces.flatMap(piece => convexTriangles(piece.vertices).map(vertices => ({ vertices, alpha: piece.alpha })));
    const reduced = pieces.filter(piece => piece.alpha < command.alpha);
    const reducedArea = reduced.reduce((sum, piece) => sum + polygonArea(piece.vertices), 0);
    if (reducedArea <= 1e-8) return [command];
    metrics.cutawaySourceTriangles++; metrics.cutawayReducedArea += reducedArea;
    metrics.cutawayExtraTriangles += pieces.length - 1;
    metrics.cutawayReducedTriangles += reduced.length;
    const feather = reduced.filter(piece => piece.alpha > ACTOR_CUTAWAY_ALPHA);
    metrics.cutawayFeatherTriangles += feather.length;
    metrics.cutawayFeatherArea += feather.reduce((sum, piece) => sum + polygonArea(piece.vertices), 0);
    return pieces.map(piece => ({ ...command, vertices: piece.vertices,
      ...(piece.alpha < command.alpha ? { alpha: piece.alpha, style: { ...command.style, globalAlpha: piece.alpha } } : {}) }));
  }
  function flushBillboards() {
    if (!active || !deferBillboards) return;
    const batches = pendingBatches().sort((a, b) => a.depth - b.depth || a.sequence - b.sequence);
    const actors = actorOcclusionCutaway ? actorBounds(batches) : [];
    const masks = actors.map(actor => ({ ...actor, bands: [...ACTOR_CUTAWAY_BANDS].reverse()
      .map(band => ({ ...band, contour: actorContour(actor.ellipse, band.padding) })) }));
    metrics.cutawayActorBounds += actors.length; actorOcclusionBounds.push(...actors);
    billboardQueue.length = 0;
    for (const batch of batches) {
      const commands = batch.commands.splice(0); metrics.flushedBillboardBatches++;
      const previousCutTriangles = metrics.cutawaySourceTriangles;
      const originalStyles = captureStyles();
      raw.save();
      try {
        for (const command of commands) {
          const parts = actorOcclusionCutaway ? cutawayTexture(command, batch, masks) : [command];
          for (const part of parts) { baseTransform(); applyStyles(part.style); replay(part); }
          metrics.flushedBillboardCommands++;
        }
      } finally { raw.restore(); applyStyles(originalStyles); }
      if (metrics.cutawaySourceTriangles > previousCutTriangles) metrics.cutawayOccluderBatches++;
    }
  }
  const ground = (x, y, z = 0) => {
    const p = projection.project(x, y, z);
    return p.visible ? { ...p, x: p.x + shake.x, y: p.y + shake.y } : p;
  };
  function projectPoint(p, pointRole = role) {
    if (pointRole) return { x: pointRole.projected.x + (p.x - pointRole.x) * pointRole.projected.scale,
      y: pointRole.projected.y + (p.y - pointRole.y) * pointRole.projected.scale,
      visible: pointRole.projected.visible, scale: pointRole.projected.scale };
    return ground(p.x, p.y);
  }
  function projectedPolygon(points, polygonRole = role) {
    if (polygonRole) return polygonRole.projected.visible ? points.map(p => ({ ...p, ...projectPoint(p, polygonRole) })) : [];
    const camera = points.map(p => ({ ...projection.toCamera(p.x, p.y, p.z || 0), ...('u' in p ? { u: p.u, v: p.v } : {}) }));
    const clipped = projection.clipPolygon(camera);
    // Clipping two outside corners from a quad can still return four vertices.
    // Count geometry changes, rather than merely changes to polygon cardinality.
    if (clipped.length !== camera.length || clipped.some((p, i) => p.x !== camera[i]?.x
      || p.y !== camera[i]?.y || p.depth !== camera[i]?.depth)) metrics.clippedPolygons++;
    return clipped.map(p => ({ ...p, ...projection.projectCamera(p) })).filter(p => p.visible)
      .map(p => ({ ...p, x: p.x + shake.x, y: p.y + shake.y }));
  }
  const onscreen = points => points.length && !(points.every(p => p.x < -2) || points.every(p => p.x > viewport.width + 2)
    || points.every(p => p.y < -2) || points.every(p => p.y > viewport.height + 2));
  function fillPolygon(points, polygonRole = role) {
    for (const triangle of triangulate(points)) {
      const clipped = projectedPolygon(triangle, polygonRole);
      if (!onscreen(clipped)) continue;
      for (let i = 1; i + 1 < clipped.length; i++) {
        const [a, b, c] = [clipped[0], clipped[i], clipped[i + 1]];
        submit({ kind: 'fill', vertices: [a, b, c].map(p => ({ x: p.x, y: p.y })) }, polygonRole);
        metrics[polygonRole ? 'billboardTriangles' : 'groundTriangles']++;
      }
    }
  }
  function texturedPolygon(image, points, polygonRole = role, prepared = null) {
    const clipped = prepared || projectedPolygon(points, polygonRole);
    if (!onscreen(clipped)) return;
    for (let i = 1; i + 1 < clipped.length; i++) {
      submit({ kind: 'texture', image, vertices: [clipped[0], clipped[i], clipped[i + 1]].map(p => ({ x: p.x, y: p.y, u: p.u, v: p.v,
        ...(raw.projectiveTextureProjection === true ? { w: 1 / p.scale } : {}) })), alpha: raw.globalAlpha }, polygonRole);
      metrics.textureTriangles++;
    }
  }
  function addPoint(x, y, start = false) {
    if (reject(x, y)) return;
    if (!contour || start) { contour = { points: [], closed: false }; contours.push(contour); }
    contour.points.push(transform(model, x, y));
  }
  function strokeContour(item) {
    const points = item.points, count = points.length - (item.closed ? 0 : 1);
    const scale = Math.max(Math.hypot(model[0], model[1]), Math.hypot(model[2], model[3]));
    const half = Math.max(0, Number(raw.lineWidth) || 1) * scale / 2;
    for (let i = 0; i < count; i++) {
      const a = points[i], b = points[(i + 1) % points.length], length = Math.hypot(b.x - a.x, b.y - a.y);
      if (length <= 1e-9) continue;
      const nx = -(b.y - a.y) / length * half, ny = (b.x - a.x) / length * half;
      fillPolygon([{ x: a.x + nx, y: a.y + ny }, { x: b.x + nx, y: b.y + ny },
        { x: b.x - nx, y: b.y - ny }, { x: a.x - nx, y: a.y - ny }], pathRole);
    }
  }
  function drawImage(image, args) {
    let sx = 0, sy = 0, sw = image?.naturalWidth || image?.videoWidth || image?.width,
      sh = image?.naturalHeight || image?.videoHeight || image?.height, dx, dy, dw, dh;
    if (args.length === 2) { [dx, dy] = args; dw = sw; dh = sh; }
    else if (args.length === 4) [dx, dy, dw, dh] = args;
    else if (args.length === 8) [sx, sy, sw, sh, dx, dy, dw, dh] = args;
    else throw new TypeError('drawImage requires 3, 5 or 9 arguments.');
    if (reject(sx, sy, sw, sh, dx, dy, dw, dh) || sw === 0 || sh === 0 || dw === 0 || dh === 0) return;
    if (sw < 0) { sx += sw; sw = -sw; } if (sh < 0) { sy += sh; sh = -sh; }
    if (dw < 0) { dx += dw; dw = -dw; } if (dh < 0) { dy += dh; dh = -dh; }
    const worldWidth = dw * Math.hypot(model[0], model[1]), worldHeight = dh * Math.hypot(model[2], model[3]);
    if (reject(worldWidth, worldHeight)) return;
    const vertex = (u, v) => ({ ...transform(model, dx + dw * u, dy + dh * v), u: sx + sw * u, v: sy + sh * v });
    // An explicitly capable native GPU sink interpolates UV / W itself. The complete planar
    // image is exact with one clipped quad, including constant-W actor billboards.
    if (role || raw.projectiveTextureProjection === true) {
      texturedPolygon(image, [vertex(0, 0), vertex(1, 0), vertex(1, 1), vertex(0, 1)]); return;
    }
    let uStart = 0, uEnd = 1, vStart = 0, vEnd = 1;
    // Intersect the visible-world rectangle before seeding, preserving the original source UV domain.
    if (bounds) {
      if (bounds.empty) return;
      const determinant = model[0] * model[3] - model[1] * model[2];
      if (Math.abs(determinant) > 1e-12) {
        const local = [[bounds.minX, bounds.minY], [bounds.maxX, bounds.minY], [bounds.maxX, bounds.maxY], [bounds.minX, bounds.maxY]]
          .map(([x, y]) => ({ x: (model[3] * (x - model[4]) - model[2] * (y - model[5])) / determinant,
            y: (-model[1] * (x - model[4]) + model[0] * (y - model[5])) / determinant }));
        uStart = Math.max(0, (Math.min(...local.map(p => p.x)) - dx) / dw); uEnd = Math.min(1, (Math.max(...local.map(p => p.x)) - dx) / dw);
        vStart = Math.max(0, (Math.min(...local.map(p => p.y)) - dy) / dh); vEnd = Math.min(1, (Math.max(...local.map(p => p.y)) - dy) / dh);
      }
    }
    if (uStart >= uEnd || vStart >= vEnd) return;
    const columns = Math.max(1, Math.ceil(worldWidth * (uEnd - uStart) / maxCellSize));
    const rows = Math.max(1, Math.ceil(worldHeight * (vEnd - vStart) / maxCellSize));
    const drawCell = (u0, v0, u1, v1, depth) => {
      const points = [vertex(u0, v0), vertex(u1, v0), vertex(u1, v1), vertex(u0, v1)];
      const prepared = projectedPolygon(points, null);
      if (!onscreen(prepared)) return;
      const corners = points.map(p => ground(p.x, p.y)), middleU = (u0 + u1) / 2, middleV = (v0 + v1) / 2;
      const mixedVisibility = corners.some(p => !p.visible);
      let error = Infinity;
      if (!mixedVisibility) {
        const samples = [[middleU, v0, 0, 1], [u1, middleV, 1, 2], [middleU, v1, 2, 3], [u0, middleV, 3, 0], [middleU, middleV, 0, 2]];
        error = Math.max(...samples.map(([u, v, a, b]) => {
          const point = vertex(u, v), projected = ground(point.x, point.y);
          return projected.visible ? Math.hypot(projected.x - (corners[a].x + corners[b].x) / 2,
            projected.y - (corners[a].y + corners[b].y) / 2) : Infinity;
        }));
      }
      const canSplit = depth < maxTextureDepth && Math.max(worldWidth * (u1 - u0), worldHeight * (v1 - v0)) > 4;
      if (error > textureTolerance && canSplit) {
        metrics.textureSplits++;
        drawCell(u0, v0, middleU, middleV, depth + 1); drawCell(middleU, v0, u1, middleV, depth + 1);
        drawCell(u0, middleV, middleU, v1, depth + 1); drawCell(middleU, middleV, u1, v1, depth + 1);
        return;
      }
      metrics.textureCells++;
      if (error > textureTolerance) metrics.textureLimitCells++;
      if (Number.isFinite(error)) metrics.maxTextureError = Math.max(metrics.maxTextureError, error);
      texturedPolygon(image, points, null, prepared);
    };
    for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
      drawCell(uStart + (uEnd - uStart) * column / columns, vStart + (vEnd - vStart) * row / rows,
        uStart + (uEnd - uStart) * (column + 1) / columns, vStart + (vEnd - vStart) * (row + 1) / rows, 0);
    }
  }
  const methods = {
    save() { if (!active) return raw.save(); states.push({ model: [...model], screen, role }); raw.save(); },
    restore() { if (!active) return raw.restore(); const state = states.pop(); if (!state) return; ({ model, screen, role } = state); raw.restore(); },
    translate(x, y) { if (bypass()) return call('translate', [x, y]); if (!reject(x, y)) setModel(multiply(model, [1, 0, 0, 1, x, y])); },
    scale(x, y) { if (bypass()) return call('scale', [x, y]); if (!reject(x, y)) setModel(multiply(model, [x, 0, 0, y, 0, 0])); },
    rotate(angle) { if (bypass()) return call('rotate', [angle]); if (!reject(angle)) { const c = Math.cos(angle), s = Math.sin(angle); setModel(multiply(model, [c, s, -s, c, 0, 0])); } },
    transform(...m) { if (bypass()) return call('transform', m); if (m.length === 6 && !reject(...m)) setModel(multiply(model, m)); },
    setTransform(...m) {
      if (!active) return call('setTransform', m);
      if (m.length === 1 && m[0] && typeof m[0] === 'object') { const v = m[0]; m = [v.a, v.b, v.c, v.d, v.e, v.f]; }
      if (m.length !== 6 || reject(...m)) return;
      // Explicit native identity resets identify HUD/screen scopes. resetWorld is the world reset API.
      screen = true; model = [...IDENTITY]; raw.setTransform(...m);
    },
    resetTransform() { if (!active) return raw.resetTransform ? raw.resetTransform() : raw.setTransform(...IDENTITY); screen = true; model = [...IDENTITY]; raw.setTransform(...IDENTITY); },
    getTransform() { if (bypass() && raw.getTransform) return raw.getTransform(); const [a, b, c, d, e, f] = model; return { a, b, c, d, e, f }; },
    beginPath() { if (bypass()) return raw.beginPath(); contours = []; contour = null; pathRole = role; },
    moveTo(x, y) { if (bypass()) return raw.moveTo(x, y); addPoint(x, y, true); },
    lineTo(x, y) { if (bypass()) return raw.lineTo(x, y); addPoint(x, y); },
    closePath() { if (bypass()) return raw.closePath(); if (contour) contour.closed = true; },
    rect(x, y, w, h) { if (bypass()) return raw.rect(x, y, w, h); if (reject(x, y, w, h)) return; addPoint(x, y, true); addPoint(x + w, y); addPoint(x + w, y + h); addPoint(x, y + h); contour.closed = true; },
    roundRect(x, y, w, h, radii) { if (bypass() && raw.roundRect) return raw.roundRect(x, y, w, h, radii); methods.rect(x, y, w, h); },
    arc(x, y, radius, start, end, anticlockwise = false) { if (bypass()) return raw.arc(x, y, radius, start, end, anticlockwise); methods.ellipse(x, y, radius, radius, 0, start, end, anticlockwise); },
    ellipse(x, y, rx, ry, rotation, start, end, anticlockwise = false) {
      if (bypass()) return raw.ellipse(x, y, rx, ry, rotation, start, end, anticlockwise);
      if (reject(x, y, rx, ry, rotation, start, end) || rx < 0 || ry < 0) return;
      let sweep = end - start;
      if (!anticlockwise && sweep >= TAU) sweep = TAU;
      else if (anticlockwise && -sweep >= TAU) sweep = -TAU;
      else if (!anticlockwise) sweep = ((sweep % TAU) + TAU) % TAU;
      else sweep = -(((-sweep % TAU) + TAU) % TAU);
      const count = Math.max(1, Math.min(128, Math.ceil(Math.abs(sweep) * Math.max(rx, ry) / 12)));
      const cr = Math.cos(rotation), sr = Math.sin(rotation);
      for (let i = 0; i <= count; i++) { const a = start + sweep * i / count, px = rx * Math.cos(a), py = ry * Math.sin(a); addPoint(x + px * cr - py * sr, y + px * sr + py * cr); }
    },
    quadraticCurveTo(cx, cy, x, y) {
      if (bypass()) return raw.quadraticCurveTo(cx, cy, x, y);
      if (reject(cx, cy, x, y)) return; if (!contour?.points.length) addPoint(cx, cy);
      const from = contour.points.at(-1), control = transform(model, cx, cy), to = transform(model, x, y);
      for (let i = 1; i <= 16; i++) { const t = i / 16, a = 1 - t; contour.points.push({ x: a * a * from.x + 2 * a * t * control.x + t * t * to.x, y: a * a * from.y + 2 * a * t * control.y + t * t * to.y }); }
    },
    bezierCurveTo(cx1, cy1, cx2, cy2, x, y) {
      if (bypass()) return raw.bezierCurveTo(cx1, cy1, cx2, cy2, x, y);
      if (reject(cx1, cy1, cx2, cy2, x, y)) return; if (!contour?.points.length) addPoint(cx1, cy1);
      const from = contour.points.at(-1), a = transform(model, cx1, cy1), b = transform(model, cx2, cy2), to = transform(model, x, y);
      for (let i = 1; i <= 24; i++) { const t = i / 24, n = 1 - t; contour.points.push({ x: n ** 3 * from.x + 3 * n * n * t * a.x + 3 * n * t * t * b.x + t ** 3 * to.x, y: n ** 3 * from.y + 3 * n * n * t * a.y + 3 * n * t * t * b.y + t ** 3 * to.y }); }
    },
    fill(...args) { if (bypass()) return call('fill', args); for (const item of contours) fillPolygon(item.points, pathRole); },
    stroke(...args) {
      if (bypass()) return call('stroke', args); raw.save();
      try { raw.fillStyle = raw.strokeStyle; for (const item of contours) strokeContour(item); } finally { raw.restore(); }
    },
    clip(...args) {
      if (bypass()) return call('clip', args);
      raw.beginPath(); for (const item of contours) { const p = projectedPolygon(item.points, pathRole); if (!p.length) continue; raw.moveTo(p[0].x, p[0].y); for (const v of p.slice(1)) raw.lineTo(v.x, v.y); if (item.closed) raw.closePath(); } raw.clip(...args);
      metrics.unsupportedClip++; // Native GPU clip is a pre-existing no-op; exposed for honest consumer reports.
    },
    fillRect(x, y, w, h) { if (bypass()) return raw.fillRect(x, y, w, h); if (!reject(x, y, w, h)) fillPolygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(p => transform(model, ...p))); },
    strokeRect(x, y, w, h) {
      if (bypass()) return raw.strokeRect(x, y, w, h); if (reject(x, y, w, h)) return;
      const previousRole = pathRole; pathRole = role; raw.save();
      try { raw.fillStyle = raw.strokeStyle; strokeContour({ points: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(p => transform(model, ...p)), closed: true }); }
      finally { raw.restore(); pathRole = previousRole; }
    },
    drawImage(image, ...args) { if (bypass()) return raw.drawImage(image, ...args); drawImage(image, args); },
    fillText(text, x, y, ...rest) { textAt('fillText', text, x, y, rest); },
    strokeText(text, x, y, ...rest) { textAt('strokeText', text, x, y, rest); },
    createLinearGradient(x0, y0, x1, y1) {
      if (bypass()) return raw.createLinearGradient(x0, y0, x1, y1);
      const a = projectPoint(transform(model, x0, y0)), b = projectPoint(transform(model, x1, y1));
      return raw.createLinearGradient(a.x, a.y, b.x, b.y);
    },
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
      if (bypass()) return raw.createRadialGradient(x0, y0, r0, x1, y1, r1);
      const a = projectPoint(transform(model, x0, y0)), b = projectPoint(transform(model, x1, y1));
      return raw.createRadialGradient(a.x, a.y, Math.max(0, r0 * a.scale), b.x, b.y, Math.max(0, r1 * b.scale));
    },
  };
  function textAt(method, text, x, y, rest) {
    if (bypass()) return raw[method](text, x, y, ...rest);
    if (reject(x, y)) return; const world = transform(model, x, y), p = projectPoint(world);
    if (!p.visible) return;
    const command = { kind: 'text', method, text, rest: [...rest], matrix: [pixelScale * model[0] * p.scale, pixelScale * model[1] * p.scale,
      pixelScale * model[2] * p.scale, pixelScale * model[3] * p.scale, pixelScale * p.x, pixelScale * p.y] };
    if (actorOcclusionCutaway && role?.batch?.kind === 'actor') {
      const fontSize = Number(/(\d+(?:\.\d+)?)px/u.exec(raw.font || '')?.[1]) || 12;
      const measured = typeof raw.measureText === 'function' ? raw.measureText(text) : {};
      const width = Number.isFinite(measured.width) ? measured.width : String(text).length * fontSize * .6;
      const squeeze = Number.isFinite(rest[0]) && rest[0] > 0 && rest[0] < width ? rest[0] / width : 1;
      const align = ['center'].includes(raw.textAlign) ? -.5 : ['right', 'end'].includes(raw.textAlign) ? -1 : 0;
      const left = Number.isFinite(measured.actualBoundingBoxLeft) ? -measured.actualBoundingBoxLeft : width * align;
      const right = Number.isFinite(measured.actualBoundingBoxRight) ? measured.actualBoundingBoxRight : width * (align + 1);
      const baseline = raw.textBaseline;
      const top = Number.isFinite(measured.actualBoundingBoxAscent) ? -measured.actualBoundingBoxAscent
        : ['top', 'hanging'].includes(baseline) ? 0 : baseline === 'middle' ? -fontSize / 2 : ['bottom', 'ideographic'].includes(baseline) ? -fontSize : -fontSize * .8;
      const bottom = Number.isFinite(measured.actualBoundingBoxDescent) ? measured.actualBoundingBoxDescent : top + fontSize;
      command.bounds = [[left * squeeze, top], [right * squeeze, top], [right * squeeze, bottom], [left * squeeze, bottom]]
        .map(([tx, ty]) => transform(command.matrix.map(value => value / pixelScale), tx, ty));
    }
    if (deferBillboards && role?.batch) submit(command, role);
    else { raw.save(); try { replay(command); } finally { raw.restore(); } }
  }
  const context = new Proxy({}, {
    get(_target, key) { if (key in methods) return methods[key]; const value = raw?.[key]; return typeof value === 'function' ? value.bind(raw) : value; },
    set(_target, key, value) { raw[key] = value; return true; },
    has(_target, key) { return key in methods || (raw && key in raw); },
  });
  function visibleBounds() { return bounds ? { ...bounds } : null; }
  function resetWorld() { if (!active) return; model = [...IDENTITY]; screen = false; role = null; baseTransform(); }
  function pushBillboard(x, y, metadata = {}) {
    if (!active || reject(x, y)) return false;
    const previous = role, projected = ground(x, y);
    const kind = ['actor', 'occluder'].includes(metadata?.kind) ? metadata.kind : null;
    role = { x, y, projected, batch: deferBillboards ? { x, y, anchor: { x: projected.x, y: projected.y }, kind,
      depth: projected.depth, sequence: batchSequence++, commands: [], submitted: false } : null };
    roles.push({ previous, current: role }); return role.projected.visible;
  }
  function popBillboard() {
    if (active && roles.length) {
      const frame = roles.pop(); if (frame.current.batch?.commands.length) billboardQueue.push(frame.current.batch);
      role = frame.previous;
    }
  }
  function withGround(fn) {
    if (!active) return fn();
    const previousRole = role, previousModel = model; role = null; model = [...IDENTITY];
    try { return fn(); } finally { role = previousRole; model = previousModel; }
  }
  function billboard(x, y, fn) { if (!active) return fn(); const depth = roles.length; pushBillboard(x, y); try { return fn(); } finally { if (roles.length > depth) popBillboard(); } }
  function begin(rawContext, options) {
    if (active) throw new Error('Native world projection frame already active.');
    const { camera = WORLD_CAMERA_DEFAULTS, center, viewport: view, pixelScale: pixels = 1,
      shake: movement = { x: 0, y: 0 }, mapBounds, deferBillboards: deferred = false, actorOcclusionCutaway: cutaway = false } = options;
    if (!finite(pixels, movement.x, movement.y) || pixels <= 0) throw new TypeError('Pixel scale and shake must be finite.');
    projection = createWorldProjection(camera, center, view); raw = rawContext; viewport = { ...view }; pixelScale = pixels; shake = { ...movement };
    deferBillboards = deferred === true; actorOcclusionCutaway = cutaway === true && deferBillboards;
    billboardQueue.length = 0; actorOcclusionBounds.length = 0; batchSequence = 0;
    states.length = 0; roles.length = 0; contours = []; contour = null; pathRole = null;
    for (const key of Object.keys(metrics)) metrics[key] = 0;
    const corners = [[0, 0], [view.width, 0], [view.width, view.height], [0, view.height]].map(([x, y]) => projection.unprojectGround(x - shake.x, y - shake.y));
    bounds = corners.every(Boolean) ? { minX: Math.min(...corners.map(p => p.x)), minY: Math.min(...corners.map(p => p.y)), maxX: Math.max(...corners.map(p => p.x)), maxY: Math.max(...corners.map(p => p.y)) } : null;
    if (mapBounds) {
      const { left, top, right, bottom } = mapBounds;
      if (!finite(left, top, right, bottom) || left > right || top > bottom) throw new TypeError('mapBounds must be a finite ordered world rectangle.');
      let polygon = [{ x: left, y: top }, { x: right, y: top }, { x: right, y: bottom }, { x: left, y: bottom }];
      const cameraVertex = p => projection.toCamera(p.x, p.y);
      if (camera.projection === 'perspective') {
        const k = camera.zoom * camera.distance;
        const functions = [
          c => camera.distance - c.depth - camera.near,
          c => c.x * k + (view.width / 2 + movement.x) * (camera.distance - c.depth),
          c => -c.x * k + (view.width / 2 - movement.x) * (camera.distance - c.depth),
          c => c.y * k + (view.height / 2 + movement.y) * (camera.distance - c.depth),
          c => -c.y * k + (view.height / 2 - movement.y) * (camera.distance - c.depth),
        ];
        for (const fn of functions) polygon = clipHalfPlane(polygon, p => fn(cameraVertex(p)));
      } else {
        const functions = [c => view.width / 2 + movement.x + c.x * camera.zoom,
          c => view.width / 2 - movement.x - c.x * camera.zoom,
          c => view.height / 2 + movement.y + c.y * camera.zoom,
          c => view.height / 2 - movement.y - c.y * camera.zoom];
        for (const fn of functions) polygon = clipHalfPlane(polygon, p => fn(cameraVertex(p)));
      }
      bounds = polygon.length ? { minX: Math.min(...polygon.map(p => p.x)), minY: Math.min(...polygon.map(p => p.y)),
        maxX: Math.max(...polygon.map(p => p.x)), maxY: Math.max(...polygon.map(p => p.y)) }
        : { minX: 1, minY: 1, maxX: 0, maxY: 0, empty: true };
    }
    raw.save(); active = true; resetWorld(); return context;
  }
  function end() {
    if (!active) return;
    flushBillboards();
    while (states.length) { states.pop(); raw.restore(); }
    raw.restore(); active = false; screen = false; role = null; roles.length = 0;
  }
  return {
    get active() { return active; },
    context, begin, end, resetWorld, pushBillboard, popBillboard, billboard, withGround, flushBillboards,
    project: (x, y, z = 0) => projection ? ground(x, y, z) : null,
    unproject: (x, y) => projection ? projection.unprojectGround(x - shake.x, y - shake.y) : null,
    visibleBounds,
    snapshot: () => ({ active, screen, pixelScale, deferBillboards, actorOcclusionCutaway, actorCutawayMargin: ACTOR_CUTAWAY_MARGIN,
      actorCutawayAlpha: ACTOR_CUTAWAY_ALPHA, actorCutawaySegments: ACTOR_CUTAWAY_SEGMENTS,
      actorCutawayBands: ACTOR_CUTAWAY_BANDS.map(band => ({ ...band })),
      actorOcclusionBounds: actorOcclusionBounds.map(box => ({ ...box, bodyBounds: { ...box.bodyBounds }, ellipse: { ...box.ellipse } })),
      model: [...model], billboard: role ? { x: role.x, y: role.y, visible: role.projected.visible } : null,
      saveDepth: states.length, billboardDepth: roles.length, pendingBillboardBatches: pendingBatches().length,
      pendingBillboardCommands: pendingBatches().reduce((sum, batch) => sum + batch.commands.length, 0), bounds: visibleBounds(), ...metrics }),
  };
}
