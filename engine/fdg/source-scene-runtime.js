import { validateSourceScene, sampleSourceHeight, canMoveSourceScene } from './source-scene.js';
import { collectSourceImagePaths, validateReadySourceImages, drawSourceImageLayers } from './source-image-layers.js';

const emptyDraw = () => ({ drawCalls: 0, visibleObjects: 0, imageMissing: 0 });
const worldXY = (x, y) => Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 8000 && y >= 0 && y <= 8000;

// The FDGRuntime owner supplies images, input, time, camera and the native actor.
// Painted source images retain their authored topdown XY; mapped Z is query data.
export class SourceSceneRuntime {
  constructor(scene, map) {
    const result = validateSourceScene(scene);
    if (!result.ok) throw new TypeError(result.errors.join('\n'));
    if (map !== undefined && (!map || map.width !== 200 || map.height !== 200 || map.tileSize !== 40)) {
      throw new TypeError('Source scenes require the native 200×200 / T40 map.');
    }
    this.scene = structuredClone(scene);
    this.disposed = false;
    this.blockedReason = null;
    this.surfaceId = null;
    this.logicalHeight = null;
    this._sources = collectSourceImagePaths(this.scene.imageLayers);
    this._groundLayers = this.scene.imageLayers.filter(layer => layer.layer === 'ground');
    this._frontLayers = this.scene.imageLayers.filter(layer => layer.layer === 'front');
    this._worldLayers = this.scene.imageLayers.filter(layer => layer.layer === 'world')
      .map((layer, index) => ({ layer, index, depth: Number.isFinite(layer.depthY) ? layer.depthY : layer.worldRect[1] + layer.worldRect[3] }))
      .sort((a, b) => a.depth - b.depth || a.index - b.index);
    this._lastDraw = emptyDraw();
  }

  ground(x, y) {
    if (this.disposed) throw new Error('The source scene consumer is disposed.');
    return sampleSourceHeight(this.scene, x, y, { validated: true });
  }

  move(player, x, y) {
    if (this.disposed) return false;
    const result = canMoveSourceScene(this.scene, player, { x, y }, player?.radius, { validated: true });
    this.blockedReason = result.reason;
    if (!result.ok) return false;
    player.x = x; player.y = y; player.z = result.height;
    this.logicalHeight = result.logicalHeight;
    this.surfaceId = result.surfaceId;
    return true;
  }

  requiredSources() { return new Set(this._sources); }

  validateReady(ownerAssets) {
    if (this.disposed) return { ok: false, errors: ['The source scene consumer is disposed.'] };
    return validateReadySourceImages(this.scene.imageLayers, ownerAssets);
  }

  capture(player, camera) {
    if (this.disposed) return undefined;
    if (!player || !worldXY(player.x, player.y) || !Number.isFinite(player.z) || player.z < 0 || player.z > 1024) {
      throw new TypeError('Source capture requires finite native world XYZ.');
    }
    if (camera !== undefined && (!camera || !worldXY(camera.x, camera.y) || typeof camera.follow !== 'boolean')) {
      throw new TypeError('Source capture requires camera world XY and follow.');
    }
    const next = structuredClone(this.scene);
    next.actor.position = [player.x, player.y, player.z];
    if (camera !== undefined) Object.assign(next.camera, { x: camera.x, y: camera.y, follow: camera.follow });
    return next;
  }

  snapshot(player) {
    if (this.disposed) return null;
    const ground = this.ground(player.x, player.y);
    return {
      position: [player.x, player.y, player.z], groundHeight: ground.height,
      logicalHeight: ground.logicalHeight, surfaceId: ground.surfaceId, slope: ground.slope,
      blockedReason: this.blockedReason, camera: structuredClone(this.scene.camera),
      heightMapping: structuredClone(this.scene.height.heightMapping),
      imageLayers: this.scene.imageLayers.length, requiredSources: this._sources.size,
      ...this._lastDraw, renderer: 'Canvas source images', disposed: false,
      ownedRaf: 0, ownedListeners: 0, ownedTimers: 0, ownedImages: 0, ownedGpu: 0,
    };
  }

  draw(context, owner, { drawActor } = {}) {
    const counts = emptyDraw();
    if (this.disposed) return counts;
    if (drawActor !== undefined && typeof drawActor !== 'function') throw new TypeError('drawActor must be a function.');
    if (drawActor && !Number.isFinite(owner?.player?.y)) throw new TypeError('Actor depth requires the owner player world Y.');
    const submit = layers => {
      const result = drawSourceImageLayers(context, layers, owner, { layersValidated: true });
      counts.drawCalls += result.drawCalls;
      counts.visibleObjects += result.drawn;
      counts.imageMissing += result.missing;
    };
    submit(this._groundLayers);
    if (owner.width > 0 && owner.height > 0) {
      let split = 0;
      if (drawActor) {
        while (split < this._worldLayers.length && this._worldLayers[split].depth <= owner.player.y) {
          submit([this._worldLayers[split++].layer]);
        }
        // Native sprite callback owns its Canvas statistics; image counts exclude it.
        drawActor(context, owner);
      }
      while (split < this._worldLayers.length) submit([this._worldLayers[split++].layer]);
      submit(this._frontLayers);
    }
    this._lastDraw = { ...counts };
    return counts;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.scene = null;
    this._groundLayers.length = 0;
    this._worldLayers.length = 0;
    this._frontLayers.length = 0;
    this._sources.clear();
    this._lastDraw = emptyDraw();
    this.blockedReason = null; this.surfaceId = null; this.logicalHeight = null;
  }
}
