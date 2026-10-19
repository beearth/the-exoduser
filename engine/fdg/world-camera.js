/** Shared pure world XY / height Z camera. No DOM, clocks or renderer ownership. */
export const WORLD_CAMERA_DEFAULTS = Object.freeze({
  projection: 'perspective', yaw: 0, pitch: 0.85, zoom: 1, distance: 1400, near: 32,
});
const ranges = Object.freeze({ yaw: [-Math.PI, Math.PI], pitch: [0.35, 1.1], zoom: [0.25, 2],
  distance: [600, 6000], near: [8, 128] });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const requireFinite = (...values) => { if (!values.every(finite)) throw new TypeError('Camera coordinates must be finite numbers.'); };

export function validateWorldCamera(settings, path = 'viewCamera') {
  const errors = [];
  if (!plain(settings)) return { ok: false, errors: [`${path}: camera object required`] };
  const value = key => {
    const descriptor = Object.getOwnPropertyDescriptor(settings, key);
    return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
  };
  if (!['perspective', 'orthographic'].includes(value('projection'))) errors.push(`${path}.projection: perspective or orthographic required`);
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const number = value(key);
    if (!finite(number) || number < min || number > max) errors.push(`${path}.${key}: finite ${min}..${max} required`);
  }
  return { ok: errors.length === 0, errors };
}

/** Clipping takes camera-space {x,y,depth,...attributes}, not world-space vertices. */
export function createWorldProjection(settings = WORLD_CAMERA_DEFAULTS, center, viewport) {
  const validation = validateWorldCamera(settings);
  if (!validation.ok) throw new TypeError(validation.errors.join('\n'));
  if (!center || !viewport) throw new TypeError('Camera center and viewport required.');
  requireFinite(center.x, center.y, viewport.width, viewport.height);
  if (viewport.width <= 0 || viewport.height <= 0) throw new TypeError('Camera viewport dimensions must be positive.');
  // Capture scalar values, so subsequent authored edits do not alter this projection.
  const { projection, yaw, pitch, zoom, distance, near } = settings;
  const centerX = center.x, centerY = center.y, screenX = viewport.width / 2, screenY = viewport.height / 2;
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw), cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
  const nearDepth = distance - near;
  const invisible = d => ({ x: 0, y: 0, depth: 0, scale: 0, visible: false, distance: finite(d) ? d : 0 });
  const checkVertex = vertex => {
    if (!plain(vertex)) throw new TypeError('Camera vertex object required.');
    requireFinite(vertex.x, vertex.y, vertex.depth);
    for (const key of Reflect.ownKeys(vertex)) {
      const descriptor = Object.getOwnPropertyDescriptor(vertex, key);
      if (!Object.hasOwn(descriptor, 'value')) throw new TypeError('Camera vertex attributes must be plain values.');
      if (typeof descriptor.value === 'number' && !finite(descriptor.value)) throw new TypeError('Camera vertex numeric attributes must be finite.');
    }
  };
  const copyVertex = vertex => Object.fromEntries(Reflect.ownKeys(vertex).map(key => [key, vertex[key]]));

  function toCamera(x, y, z = 0) {
    requireFinite(x, y, z);
    const dx = x - centerX, dy = y - centerY;
    const rx = dx * cosYaw - dy * sinYaw, ry = dx * sinYaw + dy * cosYaw;
    const vertex = { x: rx, y: ry * sinPitch - z * cosPitch, depth: ry * cosPitch + z * sinPitch };
    requireFinite(vertex.x, vertex.y, vertex.depth);
    return vertex;
  }
  function projectCamera(vertex) {
    checkVertex(vertex);
    const d = distance - vertex.depth;
    if (projection === 'perspective' && vertex.depth > nearDepth) return invisible(d);
    // Use the plane comparison above to avoid cancellation hiding a clipped vertex on the plane.
    const safeDistance = projection === 'perspective' ? Math.max(near, d) : d;
    const scale = projection === 'perspective' ? zoom * distance / safeDistance : zoom;
    const x = screenX + vertex.x * scale, y = screenY + vertex.y * scale;
    if (![x, y, scale, safeDistance].every(finite)) return invisible(d);
    return { x, y, depth: projection === 'perspective' ? 1 / safeDistance : vertex.depth,
      scale, visible: true, distance: safeDistance };
  }
  function project(x, y, z = 0) { return projectCamera(toCamera(x, y, z)); }
  function unprojectGround(sx, sy) {
    requireFinite(sx, sy);
    let rx, ry;
    if (projection === 'orthographic') {
      rx = (sx - screenX) / zoom; ry = (sy - screenY) / (zoom * sinPitch);
    } else {
      const u = (sx - screenX) / (zoom * distance), v = (sy - screenY) / (zoom * distance);
      const denominator = sinPitch + v * cosPitch;
      if (!finite(denominator) || denominator <= 1e-12) return null;
      const d = distance * sinPitch / denominator;
      if (!finite(d) || d < near) return null;
      ry = v * d / sinPitch; rx = u * d;
    }
    const x = centerX + rx * cosYaw + ry * sinYaw, y = centerY - rx * sinYaw + ry * cosYaw;
    return finite(x) && finite(y) ? { x, y, z: 0 } : null;
  }
  function clipPolygon(vertices) {
    if (!Array.isArray(vertices)) throw new TypeError('Camera polygon array required.');
    vertices.forEach(checkVertex);
    if (projection === 'orthographic' || vertices.length === 0) return vertices.map(copyVertex);
    const clipped = [];
    const intersection = (a, b) => {
      const t = (nearDepth - a.depth) / (b.depth - a.depth), output = {};
      for (const key of new Set([...Reflect.ownKeys(a), ...Reflect.ownKeys(b)])) {
        const av = a[key], bv = b[key];
        // An attribute present on one endpoint is constant; shared numeric attributes interpolate.
        output[key] = finite(av) && finite(bv) ? av * (1 - t) + bv * t : av === undefined ? bv : av;
      }
      output.depth = nearDepth;
      checkVertex(output);
      return output;
    };
    let previous = vertices[vertices.length - 1], previousInside = previous.depth <= nearDepth;
    for (const current of vertices) {
      const currentInside = current.depth <= nearDepth;
      if (currentInside !== previousInside) clipped.push(intersection(previous, current));
      if (currentInside) clipped.push(copyVertex(current));
      previous = current; previousInside = currentInside;
    }
    return clipped;
  }
  return { toCamera, projectCamera, project, unprojectGround, clipPolygon };
}
