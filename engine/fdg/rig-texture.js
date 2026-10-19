/** CPU-only UV triangle mapping. Image ownership and time belong to the caller. */
export const RIG_TEXTURE_AREA_EPSILON = 1e-9;
const finitePoint = point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);
const area = ([a, b, c]) => (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);

/** Canvas [a,b,c,d,e,f] mapping all three source pixel points to screen points. */
export function rigTextureAffine(source, target) {
  if (![source, target].every(points => Array.isArray(points) && points.length === 3 && points.every(finitePoint))) return null;
  const determinant = area(source);
  if (Math.abs(determinant) <= RIG_TEXTURE_AREA_EPSILON || Math.abs(area(target)) <= RIG_TEXTURE_AREA_EPSILON) return null;
  const [[u0, v0], [u1, v1], [u2, v2]] = source, [[x0, y0], [x1, y1], [x2, y2]] = target;
  const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / determinant;
  const c = ((u1 - u0) * (x2 - x0) - (u2 - u0) * (x1 - x0)) / determinant;
  const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / determinant;
  const d = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / determinant;
  const result = [a, b, c, d, x0 - a * u0 - c * v0, y0 - b * u0 - d * v0];
  return result.every(Number.isFinite) ? result : null;
}

/** Authored layers first; equal layers retain existing projected depth and stable index. */
export function sortRigFaces(triangles, projected, drawOrder) {
  return triangles.map((triangle, index) => ({ triangle, index, layer: drawOrder?.[index] ?? 0,
    depth: triangle.reduce((sum, vertex) => sum + projected[vertex].z, 0) / 3,
  })).sort((a, b) => a.layer - b.layer || a.depth - b.depth || a.index - b.index);
}

/** One clipped original-image draw. Returns actual drawImage count, or0 when unavailable. */
export function drawRigTextureTriangle(context, image, { texture, uvs, triangle, projected }) {
  if (!image || !texture || image.naturalWidth !== texture.width || image.naturalHeight !== texture.height
    || !Array.isArray(triangle) || triangle.length !== 3 || !Array.isArray(uvs) || !Array.isArray(projected)) return 0;
  const source = [], target = [];
  for (const index of triangle) {
    const uv = uvs[index], point = projected[index];
    if (!Number.isInteger(index) || !finitePoint(uv) || !uv.every(value => value >= 0 && value <= 1)
      || !point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return 0;
    source.push([uv[0] * texture.width, uv[1] * texture.height]); target.push([point.x, point.y]);
  }
  const transform = rigTextureAffine(source, target);
  if (!transform) return 0;
  context.save();
  try {
    context.beginPath(); context.moveTo(...target[0]); context.lineTo(...target[1]); context.lineTo(...target[2]);
    context.closePath(); context.clip();
    // Compose onto the owner's current DPR transform rather than replacing it.
    context.transform(...transform); context.drawImage(image, 0, 0, texture.width, texture.height);
    return 1;
  } catch { return 0; } finally { context.restore(); }
}

/** Explicit untextured authoring surface. Never derives hidden pixels from the front image. */
export function drawRigAuthoringTriangle(context, { color, triangle, projected }) {
  if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)
    || !Array.isArray(triangle) || triangle.length !== 3 || !Array.isArray(projected)) return 0;
  const target = triangle.map(index => Number.isInteger(index) && projected[index] ? [projected[index].x, projected[index].y] : null);
  if (!target.every(finitePoint) || Math.abs(area(target)) <= RIG_TEXTURE_AREA_EPSILON) return 0;
  context.save();
  try {
    context.fillStyle = color; context.beginPath(); context.moveTo(...target[0]);
    context.lineTo(...target[1]); context.lineTo(...target[2]); context.closePath(); context.fill();
    return 1;
  } catch { return 0; } finally { context.restore(); }
}
