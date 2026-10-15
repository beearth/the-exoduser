/** Maps share authored world XY geometry and live consumer poses; graph layout is UI only. */
export function fitWorldMap(bounds, width, height, padding = 12) {
  const scale = Math.max(0, Math.min((width - 2 * padding) / bounds.width, (height - 2 * padding) / bounds.depth));
  const left = (width - bounds.width * scale) / 2, top = (height - bounds.depth * scale) / 2;
  return { scale, left, top, project: ([x, y]) => [left + (x - bounds.x) * scale, top + (y - bounds.y) * scale] };
}
export function terrainFootprints(scene) {
  const resources = new Map(scene.resources.map(value => [value.id, value]));
  return scene.nodes.map(node => {
    const resource = resources.get(node.resourceId), [width, depth] = resource.size, c = Math.cos(node.yaw), s = Math.sin(node.yaw);
    return { id: node.id, color: resource.color, walkable: resource.walkable,
      points: [[-width / 2, -depth / 2], [width / 2, -depth / 2], [width / 2, depth / 2], [-width / 2, depth / 2]]
        .map(([x, y]) => [node.position[0] + c * x - s * y, node.position[1] + s * x + c * y]) };
  });
}
export function cameraGroundFootprint(camera, terrainCamera, width, height) {
  const { yaw, pitch, zoom } = terrainCamera, c = Math.cos(yaw), s = Math.sin(yaw);
  return [[0, 0], [width, 0], [width, height], [0, height]].map(([x, y]) => {
    const rx = (x - width / 2) / zoom, ry = (y - height / 2) / (zoom * Math.sin(pitch));
    return [camera.x + rx * c + ry * s, camera.y - rx * s + ry * c];
  });
}
export function worldGraph(world) {
  const columns = Math.max(1, Math.ceil(Math.sqrt(world.areas.length))), rows = Math.ceil(world.areas.length / columns);
  const nodes = world.areas.map((area, index) => ({ areaKey: area.areaKey, name: area.name,
    x: (index % columns + .5) / columns, y: (Math.floor(index / columns) + .5) / rows,
    active: area.areaKey === world.state.activeAreaKey, sceneId: area.sceneId }));
  const edges = world.transitions.map(edge => ({ id: edge.id, from: edge.from.areaKey, to: edge.to.areaKey,
    enabled: edge.enabled, gateKey: edge.gateKey, open: edge.enabled && (edge.gateKey === null || world.progress[edge.gateKey] === true) }));
  return { nodes, edges };
}
