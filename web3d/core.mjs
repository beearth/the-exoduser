export const CORE_UNITS_PER_METRE = 100;
export function trialEnabled(search) { return new URLSearchParams(search).get('r3d') === '1'; }
export function coreToWorld(point) { return {x:point.x/100,y:0,z:point.y/100}; }
export function worldToCore(point) { return {x:point.x*100,y:point.z*100}; }
// Same orthographic basis as the Three camera; y is Core's south direction.
export function projectGround(point, camera) {
  const dx=point.x-camera.x,dy=point.y-camera.y,s=Math.sin(camera.yaw),c=Math.cos(camera.yaw);
  return {x:camera.width/2+(dx*c-dy*s)*camera.zoom,
    y:camera.height/2+(dx*s+dy*c)*Math.sin(camera.angle)*camera.zoom};
}
export function unprojectGround(point, camera) {
  const u=(point.x-camera.width/2)/camera.zoom,v=(point.y-camera.height/2)/(camera.zoom*Math.sin(camera.angle));
  const s=Math.sin(camera.yaw),c=Math.cos(camera.yaw);
  return {x:camera.x+u*c+v*s,y:camera.y-u*s+v*c};
}
