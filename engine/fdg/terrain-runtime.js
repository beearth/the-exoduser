import { validateTerrainScene, buildTerrainMeshes, sampleTerrain, canMoveTerrain } from './terrain-scene.js';
import { createWorldProjection } from './world-camera.js';

// Optional height laboratory. It consumes the owner's input, time and Canvas.
export class TerrainSceneRuntime {
  constructor(scene) {
    const result = validateTerrainScene(scene);
    if (!result.ok) throw new TypeError(result.errors.join('\n'));
    this.scene = structuredClone(scene);
    this.meshes = buildTerrainMeshes(this.scene, { validated: true });
    this.blockedReason = null;
    this.surfaceId = 'ground';
    this.triangles = 0;
    this.nearClippedFaces = 0;
    this.nearCulledFaces = 0;
    this.raster = null;
  }

  ground(x, y) { return sampleTerrain(this.scene, x, y, { validated: true }); }
  move(player, x, y) {
    const result = canMoveTerrain(this.scene, player, { x, y }, player.radius, { validated: true });
    this.blockedReason = result.reason;
    if (!result.ok) return false;
    player.x = x; player.y = y; player.z = result.height;
    this.surfaceId = result.surfaceId;
    return true;
  }

  projection(owner) {
    const camera = this.scene.camera;
    const settings = { ...camera, projection: camera.projection ?? 'orthographic',
      distance: camera.distance ?? 1400, near: camera.near ?? 32 };
    const key = [settings.projection, settings.yaw, settings.pitch, settings.zoom, settings.distance,
      settings.near, owner.camera.x, owner.camera.y, owner.width, owner.height];
    if (!this.projectionKey || key.some((value, index) => value !== this.projectionKey[index])) {
      this.worldProjection = createWorldProjection(settings, owner.camera, { width: owner.width, height: owner.height });
      this.projectionKey = key;
    }
    return this.worldProjection;
  }

  project(x, y, z, owner) { return this.projection(owner).project(x, y, z); }

  capture(player) {
    const next = structuredClone(this.scene);
    next.actor ||= {};
    next.actor.position = [player.x, player.y, player.z];
    return next;
  }

  unprojectGround(x, y, owner) {
    return this.projection(owner).unprojectGround(x, y);
  }

  snapshot(player) {
    return { position: [player.x, player.y, player.z], surfaceId: this.surfaceId,
      blockedReason: this.blockedReason, camera: { ...this.scene.camera },
      triangles: this.triangles, nearClippedFaces: this.nearClippedFaces, nearCulledFaces: this.nearCulledFaces,
      depthTest: true, renderer: 'CPU triangles', actorGeometry: 'test-body/test-head boxes', gameCharacterModel: false,
      ownedRaf: 0, ownedListeners: 0 };
  }

  actorMeshes(player) {
    const box = (id, width, depth, height, base, color) => {
      const x = player.x, y = player.y, w = width / 2, d = depth / 2;
      return { nodeId: id, color, vertices: [[x-w,y-d,base],[x+w,y-d,base],[x+w,y+d,base],[x-w,y+d,base],
        [x-w,y-d,base+height],[x+w,y-d,base+height],[x+w,y+d,base+height],[x-w,y+d,base+height]],
      faces: [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]] };
    };
    return [box('test-body', player.radius * 1.5, player.radius * 1.5, 36, player.z, '#d8d8bd'),
      box('test-head', 18, 18, 18, player.z + 36, '#f2c989')];
  }

  draw(context, owner) {
    // Per-pixel depth resolves intersecting steps, rotated solids and the actor.
    // This is a CPU reference renderer, not a GPU/PBR implementation.
    const scale = Math.min(1, 900 / owner.width, 900 / owner.height);
    const width = Math.max(1, Math.round(owner.width * scale));
    const height = Math.max(1, Math.round(owner.height * scale));
    if (!this.raster) this.raster = owner.canvas.ownerDocument.createElement('canvas');
    if (!this.image || this.raster.width !== width || this.raster.height !== height) {
      this.raster.width = width; this.raster.height = height;
      this.rasterContext = this.raster.getContext('2d');
      this.image = this.rasterContext.createImageData(width, height);
      this.depth = new Float32Array(width * height);
    }
    const pixels = this.image.data;
    this.depth.fill(-Infinity);
    for (let p = 0; p < pixels.length; p += 4) {
      pixels[p] = 14; pixels[p+1] = 19; pixels[p+2] = 25; pixels[p+3] = 255;
    }
    this.triangles = 0;
    this.nearClippedFaces = 0;
    this.nearCulledFaces = 0;
    const projection = this.projection(owner);
    for (const mesh of [...this.meshes, ...this.actorMeshes(owner.player)]) {
      const cameraVertices = mesh.vertices.map(v => projection.toCamera(v[0], v[1], v[2]));
      const rgb = [1,3,5].map(i => parseInt(mesh.color.slice(i,i+2),16));
      for (const face of mesh.faces) {
        const a = mesh.vertices[face[0]], b = mesh.vertices[face[1]], c = mesh.vertices[face[2]];
        const u = b.map((v,i) => v-a[i]), v = c.map((n,i) => n-a[i]);
        const n = [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
        const length = Math.hypot(...n) || 1;
        const shade = .38 + .62 * Math.abs((n[0]*-.4+n[1]*-.3+n[2]*.8)/length);
        const color = rgb.map(channel => Math.min(255, Math.round(channel*shade)));
        const polygon = face.map(index => cameraVertices[index]);
        const clipped = projection.clipPolygon(polygon);
        if (clipped.length < 3) { this.nearCulledFaces++; continue; }
        if (clipped.length !== polygon.length || clipped.some((point, index) => point.depth !== polygon[index]?.depth)) this.nearClippedFaces++;
        const projected = clipped.map(vertex => {
          const p = projection.projectCamera(vertex);
          return { x: p.x * scale, y: p.y * scale, depth: p.depth };
        });
        // In perspective mode depth is 1/d, affine in screen barycentrics.
        for (let i = 1; i < projected.length-1; i++) {
          this.triangle(projected[0],projected[i],projected[i+1],color,width,height);
          this.triangles++;
        }
      }
    }
    this.rasterContext.putImageData(this.image,0,0);
    context.drawImage(this.raster,0,0,owner.width,owner.height);
    return 1;
  }

  triangle(a,b,c,color,width,height) {
    if (![a,b,c].every(point => [point.x, point.y, point.depth].every(Number.isFinite))) return;
    const area = (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    if (!Number.isFinite(area) || Math.abs(area) < 1e-8) return;
    const left = Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))), right = Math.min(width-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    const top = Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))), bottom = Math.min(height-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    for (let y=top;y<=bottom;y++) for (let x=left;x<=right;x++) {
      const px=x+.5,py=y+.5;
      const u=((b.x-px)*(c.y-py)-(b.y-py)*(c.x-px))/area;
      const v=((c.x-px)*(a.y-py)-(c.y-py)*(a.x-px))/area;
      const w=1-u-v;
      if (u < -1e-8 || v < -1e-8 || w < -1e-8) continue;
      const depth=u*a.depth+v*b.depth+w*c.depth,index=y*width+x;
      if (depth <= this.depth[index]) continue;
      this.depth[index]=depth;
      const p=index*4;
      this.image.data[p]=color[0]; this.image.data[p+1]=color[1]; this.image.data[p+2]=color[2];
    }
  }

  dispose() { this.meshes=[]; this.scene=null; this.raster=null; this.rasterContext=null; this.image=null; this.depth=null; this.worldProjection=null; this.projectionKey=null; }
}
