import { validateSourcePreview, canMoveSourcePreview, attachSourcePreviewGround, sampleSourcePreviewHeight } from './source-preview.js?v=0.17.1';
import { SourcePreviewHeightGround } from './source-preview-height-ground.js?v=0.17.1';

const emptyDraw = () => ({ drawCalls: 0, visibleObjects: 0, imageMissing: 0, groundDrawCalls: 0, groundWallDrawCalls: 0, visibleGroundWalls: 0, foregroundCutawayObjects: 0, cutawayDrawCalls: 0, terrainCutawayObjects:0,terrainCutawayDrawCalls:0,terrainCutawayScratchDrawCalls:0 });

function imageFailure(layer, record) {
  const image = record?.image;
  return record?.status !== 'ready' || !image ||
    image.naturalWidth !== layer.sourceRect[2] || image.naturalHeight !== layer.sourceRect[3];
}

/** UNADOPTED visuals with optional exact height and object subset; full native assembly stays pending. */
export class SourcePreviewRuntime {
  constructor(scene, map, { canvasFactory } = {}) {
    const result = validateSourcePreview(scene);
    if (!result.ok) throw new TypeError(result.errors.join('\n'));
    if (map && (map.width !== scene.grid.width || map.height !== scene.grid.height || map.tileSize !== scene.grid.tileSize)) {
      throw new TypeError('Source preview requires the original native grid.');
    }
    this.scene = structuredClone(scene);
    this.disposed = false;
    this.blockedReason = null;
    this._sources = new Set(this.scene.imageLayers.map(layer => layer.src));
    this._ground = this.scene.groundLayers?.[0] || null;
    if (this._ground) this._sources.add(this._ground.src);
    this._heightGround = this.scene.heightPreview ? new SourcePreviewHeightGround(this.scene,
      (x,y) => sampleSourcePreviewHeight(this.scene,x,y,{validated:true}), canvasFactory) : null;
    this._layers = this.scene.imageLayers.map((layer, index) => {
      const x = layer.worldRect[0] + layer.worldRect[2] / 2, y = layer.depthY;
      const z = this._heightGround ? sampleSourcePreviewHeight(this.scene,Math.max(0,Math.min(8000,x)),Math.max(0,Math.min(8000,y)),{validated:true}).engineFootZ : 0;
      return { layer, index, z, depth: y - z };
    }).sort((a, b) => a.depth - b.depth || a.index - b.index);
    this._lastDraw = emptyDraw();
  }

  requiredSources() { return new Set(this._sources); }

  validateReady(assetsMap) {
    if (this.disposed) return { ok: false, errors: ['The source preview consumer is disposed.'] };
    if (!(assetsMap instanceof Map)) return { ok: false, errors: ['Source preview assets must be an owner Map.'] };
    const errors = [];
    for (const layer of this.scene.imageLayers) if (imageFailure(layer, assetsMap.get(layer.src))) {
      errors.push(`Source preview image must decode to the observed full source size: ${layer.src}`);
    }
    if (this._ground) {
      const record = assetsMap.get(this._ground.src), image = record?.image;
      if (record?.status !== 'ready' || ![image?.naturalWidth, image?.naturalHeight].every(value => Number.isSafeInteger(value) && value > 0 && value <= 32768) ||
        this._ground.sourceRect && (image.naturalWidth !== this._ground.sourceRect[2] || image.naturalHeight !== this._ground.sourceRect[3])) {
        errors.push(`Approved ground must decode to its full original image: ${this._ground.src}`);
      } else if (!errors.length) {
        const authored = this.scene.provenance.groundEngineAuthoredInputSnapshot;
        const observed = { canonicalAbsolutePath: this._ground.canonicalAbsolutePath, src: this._ground.src,
          intrinsicWidth: image.naturalWidth, intrinsicHeight: image.naturalHeight, status: 'ready', observedBy: 'runtime-image-decode' };
        const result = attachSourcePreviewGround(this.scene, { ...authored, groundObservations: [observed] });
        if (!result.ok) errors.push(...result.errors);
        else { this.scene = structuredClone(result.sourcePreview); this._ground = this.scene.groundLayers[0]; }
      }
    }
    return { ok: errors.length === 0, errors };
  }

  move(player, x, y) {
    if (this.disposed) return false;
    const result = canMoveSourcePreview(this.scene, player, { x, y }, player?.radius, { validated: true });
    this.blockedReason = result.ok ? null : result.reason || null;
    if (!result.ok) return false;
    player.x = x; player.y = y;
    if (this.scene.heightPreview) player.z = result.engineFootZ;
    return true;
  }

  capture(player, camera) {
    if (this.disposed) return null;
    if (![player?.x, player?.y].every(value => Number.isFinite(value) && value >= 0 && value < 8000)) {
      throw new TypeError('Source preview capture requires finite world XY.');
    }
    if (camera !== undefined && (![camera?.x, camera?.y].every(value => Number.isFinite(value) && value >= 0 && value <= 8000) ||
      typeof camera.follow !== 'boolean')) throw new TypeError('Source preview capture requires finite camera XY/follow.');
    const captured = structuredClone(this.scene);
    captured.actor.position = [player.x, player.y];
    if (camera !== undefined) Object.assign(captured.camera, { x: camera.x, y: camera.y, follow: camera.follow });
    if (captured.heightPreview) {
      const sampled = sampleSourcePreviewHeight(captured,player.x,player.y,{validated:true});
      captured.provenance.heightRuntimeObservation = { worldPx: [player.x,player.y], logicalHeight: sampled.logicalHeight,
        engineFootZ: sampled.engineFootZ, ramp: sampled.ramp, bandBlocks: sampled.bandBlocks,
        observedBy: 'fdg-source-preview-height-v1', sourcePhysicalZClaim: false };
    }
    return captured;
  }

  snapshot(player, camera = this.scene?.camera) {
    if (this.disposed) return null;
    const height = this.scene.heightPreview ? sampleSourcePreviewHeight(this.scene,player.x,player.y,{validated:true}) : null;
    const collision = this.scene.collisionPreview;
    return {
      mode: 'UNADOPTED_VISUAL_PREVIEW', adoption: 'UNADOPTED', navScope: collision ? 'polygon+exact-native-hill-band+source-object-subset' : height ? 'polygon+exact-native-hill-band' : 'polygon-only',
      sourcePending: collision ? ['collision-assembly'] : height ? ['collision'] : ['collision', 'cliff', 'logicalHeight'], status: structuredClone(this.scene.status),
      ...(collision ? { collisionCoverage:'PARTIAL',supportedSourceObjectColliderCount:collision.engineDerived.colliderCount,
        collisionScope:structuredClone(collision.scope),fullObjectColliderCount:null } : {}),
      position: [player.x, player.y], actorPosition: [player.x, player.y], height: null,
      ...(height ? { logicalHeight:height.logicalHeight,engineFootZ:height.engineFootZ,ramp:height.ramp,
        bandBlocks:height.bandBlocks,sourcePhysicalZClaim:false,...this._heightGround.snapshot() } : {}),
      camera: { x: camera.x, y: camera.y, follow: camera.follow }, blockedReason: this.blockedReason,
      imageLayers: this.scene.imageLayers.length, requiredSources: this._sources.size,
      groundLayers: this._ground ? 1 : 0, groundRuntimeStatus: this.scene.provenance.groundRuntimeStatus || 'UNCONNECTED',
      ...this._lastDraw, renderer: 'Canvas source visual preview', disposed: false,
      ownedRaf: 0, ownedListeners: 0, ownedTimers: 0, ownedImages: 0, ownedGpu: 0,
    };
  }

  draw(context, owner, { drawActor, actorFrame } = {}) {
    const counts = emptyDraw();
    if (this.disposed) return counts;
    if (!owner || !(owner.assets instanceof Map) ||
      ![owner.camera?.x, owner.camera?.y, owner.width, owner.height].every(Number.isFinite) || owner.width < 0 || owner.height < 0) {
      throw new TypeError('Source preview drawing requires finite owner camera/CSS dimensions and assets.');
    }
    if (!context || ['save', 'restore', 'beginPath', 'rect', 'clip', 'drawImage'].some(key => typeof context[key] !== 'function')) {
      throw new TypeError('Source preview drawing requires Canvas2D.');
    }
    if (this._ground && ['moveTo', 'lineTo', 'closePath'].some(key => typeof context[key] !== 'function')) throw new TypeError('Ground drawing requires the original polygon clip.');
    if (this._heightGround && ['translate','transform'].some(key=>typeof context[key]!=='function')) throw new TypeError('Height drawing requires Canvas2D texture projection.');
    if (drawActor !== undefined && typeof drawActor !== 'function') throw new TypeError('Source preview actor callback must be a function.');
    if (drawActor && !Number.isFinite(owner.player?.y)) throw new TypeError('Source preview actor requires world Y.');
    if (drawActor && this._heightGround && (!Number.isFinite(owner.player?.z) || typeof context.translate !== 'function')) throw new TypeError('Height preview actor requires derived foot Z and Canvas translation.');
    if (!owner.width || !owner.height) return counts;
    const left = owner.camera.x - owner.width / 2, top = owner.camera.y - owner.height / 2;
    const alpha = context.globalAlpha, filter = context.filter;
    let groundImage = null, groundPoints = null;
    const clipGround = () => {
      if (!groundPoints) {
        const tile=this.scene.groundClip.tileSize;
        groundPoints=this.scene.groundClip.polygon.map(point=>{const x=point[0]*tile,y=point[1]*tile;
          const z=this._heightGround?sampleSourcePreviewHeight(this.scene,x,y,{validated:true}).engineFootZ:0;return [x-left,y-top-z];});
      }
      context.beginPath();context.moveTo(...groundPoints[0]);
      for(let i=1;i<groundPoints.length;i++)context.lineTo(...groundPoints[i]);
      context.closePath();context.clip();
    };
    const cutaway = drawActor && this.scene.appearancePreview?.actorCutaway;
    let actorRect = null;
    if (cutaway) {
      if (!actorFrame || ![actorFrame.width,actorFrame.height,actorFrame.anchorX,actorFrame.anchorY].every(Number.isFinite)
        || actorFrame.width<=0 || actorFrame.height<=0 || actorFrame.width>40960 || actorFrame.height>40960
        || actorFrame.anchorX<0 || actorFrame.anchorX>1 || actorFrame.anchorY<0 || actorFrame.anchorY>1
        || typeof context.ellipse!=='function' || typeof context.moveTo!=='function')
        throw new TypeError('Readability preview requires the current authored sprite frame and Canvas ellipse clip.');
      const z=this._heightGround?owner.player.z:0;
      actorRect={x:owner.player.x-left-actorFrame.width*actorFrame.anchorX,y:owner.player.y-top-z-actorFrame.height*actorFrame.anchorY,
        width:actorFrame.width,height:actorFrame.height};
    }
    const paint = (entry,foreground=false) => {
      const layer = entry.layer;
      const [worldX, worldY, width, height] = layer.worldRect;
      const x = worldX - left, y = worldY - top - entry.z;
      if (!layer.opacity || x + width <= 0 || y + height <= 0 || x >= owner.width || y >= owner.height) return;
      const record = owner.assets.get(layer.src);
      if (imageFailure(layer, record)) { counts.imageMissing++; return; }
      context.globalAlpha = alpha * layer.opacity;
      context.filter = `brightness(${layer.brightness}) saturate(${layer.saturation})`;
      const exposure=this._heightGround?.prepareExposedLayer(entry,record.image,owner)||false;
      if(exposure){counts.terrainCutawayObjects++;counts.terrainCutawayScratchDrawCalls+=2;counts.drawCalls+=2;}
      const fade=foreground&&actorRect&&x<actorRect.x+actorRect.width&&x+width>actorRect.x&&y<actorRect.y+actorRect.height&&y+height>actorRect.y;
      const draw=()=>{
        if(exposure){const calls=this._heightGround.drawExposedLayer(context,owner,entry,record.image,left,top);counts.drawCalls+=calls;counts.terrainCutawayDrawCalls+=calls;return calls;}
        context.drawImage(record.image,...layer.sourceRect,x,y,width,height);counts.drawCalls++;return 1;
      };
      if(!fade)draw();
      else {
        const cx=actorRect.x+actorRect.width/2,cy=actorRect.y+actorRect.height/2,rx=actorRect.width/2,ry=actorRect.height/2,f=cutaway.featherPx;
        const ellipse=(grow)=>{context.moveTo(cx+rx+grow,cy);context.ellipse(cx,cy,rx+grow,ry+grow,0,0,Math.PI*2);};
        const pass=(opacity,region)=>{context.save();try{context.globalAlpha=alpha*layer.opacity*opacity;context.beginPath();region();context.clip('evenodd');counts.cutawayDrawCalls+=draw();}finally{context.restore();}};
        pass(1,()=>{context.rect(0,0,owner.width,owner.height);ellipse(f);});
        pass(cutaway.outerOpacity,()=>{ellipse(f);ellipse(0);});
        pass(cutaway.innerOpacity,()=>ellipse(0));
        counts.foregroundCutawayObjects++;
      }
      counts.visibleObjects++;
    };
    context.save();
    try {
      context.beginPath(); context.rect(0, 0, owner.width, owner.height); context.clip();
      if (this._ground) {
        const ground = this._ground, record = owner.assets.get(ground.src);
        if (this.scene.provenance.groundRuntimeStatus !== 'READY' || !ground.sourceRect || imageFailure(ground, record)) counts.imageMissing++;
        else {
          context.save();
          try {
            clipGround();
            context.globalAlpha = alpha * ground.opacity;
            context.filter = `brightness(${ground.brightness}) saturate(${ground.saturation})`;
            const [w, h] = ground.tileWorldSize, [ox, oy] = ground.origin;
            const offset = this.scene.heightPreview?.heightMapping.offsetPx || 0;
            const minX = Math.max(0, Math.floor((left - ox) / w)), maxX = Math.min(Math.ceil(8000 / w) - 1, Math.floor((left + owner.width - ox) / w));
            const minY = Math.max(0, Math.floor((top + offset - oy) / h)), maxY = Math.min(Math.ceil(8000 / h) - 1, Math.floor((top + owner.height + offset - oy) / h));
            context.save();
            try {
            this._heightGround?.excludeFlatPatch(context,owner,left,top);
            for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
              context.drawImage(record.image, ...ground.sourceRect, ox + x * w - left, oy + y * h - top - offset, w, h);
              counts.drawCalls++; counts.groundDrawCalls++;
            }
            } finally { context.restore(); }
            const cached = this._heightGround?.draw(context,owner,record.image,left,top) || 0;
            counts.drawCalls+=cached;counts.groundDrawCalls+=cached;
            groundImage=record.image;
          } finally { context.restore(); context.globalAlpha = alpha; context.filter = filter; }
        }
      }
      const walls=groundImage?this._heightGround?.visibleWalls(owner,left,top)||[]:[];
      let split = 0, wallIndex = 0;
      const nextDepth=()=>Math.min(this._layers[split]?.depth??Infinity,walls[wallIndex]?.depth??Infinity);
      const paintNext=foreground=>{
        if((this._layers[split]?.depth??Infinity)<=(walls[wallIndex]?.depth??Infinity)) paint(this._layers[split++],foreground);
        else {
          context.save();
          try {
            clipGround();
            const calls=this._heightGround.drawWall(context,walls[wallIndex++],groundImage,left,top,
              {alpha:alpha*this._ground.opacity,brightness:this._ground.brightness,saturation:this._ground.saturation});
            counts.drawCalls+=calls;counts.groundDrawCalls+=calls;counts.groundWallDrawCalls+=calls;counts.visibleGroundWalls++;
          } finally {context.restore();context.globalAlpha=alpha;context.filter=filter;}
        }
      };
      if (drawActor) {
        const actorDepth = owner.player.y - (this._heightGround ? owner.player.z : 0);
        while (nextDepth() <= actorDepth) paintNext(false);
        context.globalAlpha = alpha; context.filter = filter;
        if(this._heightGround){context.save();try{context.translate(0,-owner.player.z);drawActor(context,owner);}finally{context.restore();}}
        else drawActor(context, owner);
      }
      while (split < this._layers.length || wallIndex < walls.length) paintNext(true);
    } finally {
      context.restore(); context.globalAlpha = alpha; context.filter = filter;
    }
    this._lastDraw = { ...counts };
    return counts;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true; this.scene = null;
    this._layers.length = 0; this._sources.clear();
    this._ground = null;
    this._heightGround?.dispose(); this._heightGround=null;
    this._lastDraw = emptyDraw(); this.blockedReason = null;
  }
}
