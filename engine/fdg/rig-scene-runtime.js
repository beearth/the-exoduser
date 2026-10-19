import { evaluateRig } from './rig.js?v=torso-depth-r7';
import { validateRigScene, RIG_SCENE_LIMITS } from './rig-scene-project.js?v=torso-depth-r7';
import { drawRigTextureTriangle, drawRigAuthoringTriangle, sortRigFaces } from './rig-texture.js?v=torso-depth-r7';

export const RIG_SCENE_TRANSITION_SECONDS = 0.25;
export const RIG_SCENE_TRANSITION_EPSILON = 1e-9;
const clone = value => structuredClone(value);
const finiteTime = value => Number.isFinite(value) && value >= 0;
const normalizedTime = (clip, time) => clip ? clip.loop ? time % clip.duration : Math.min(time, clip.duration) : time;

export class RigSceneValidationError extends TypeError {
  constructor(errors) {
    super(`Invalid FDG rig scene: ${errors.join('; ')}`);
    this.name = 'RigSceneValidationError'; this.errors = [...errors];
  }
}

/** A visual scene consumer. Its owner supplies both fixed updates and screen coordinates. */
export class RigSceneRuntime {
  constructor(scene, { worldToScreen = (x, y) => ({ x, y }), getImage = () => null, getProjection = () => null, getViewport = () => null } = {}) {
    const validation = validateRigScene(scene);
    if (!validation.ok) throw new RigSceneValidationError(validation.errors);
    if (typeof worldToScreen !== 'function') throw new TypeError('worldToScreen must be a function.');
    if (typeof getImage !== 'function') throw new TypeError('getImage must be a function.');
    if (typeof getProjection !== 'function') throw new TypeError('getProjection must be a function.');
    if (typeof getViewport !== 'function') throw new TypeError('getViewport must be a function.');
    this.disposed = false; this._scene = clone(scene); this._worldToScreen = worldToScreen;
    this._getImage = getImage;
    this._getProjection = getProjection;
    this._getViewport = getViewport;
    this.view = { yaw: scene.camera.yaw, pitch: scene.camera.pitch };
    this._resources = new Map(this._scene.resources.map(resource => [resource.id, resource.project]));
    this._nodes = new Map(this._scene.nodes.map(node => [node.id, {
      id: node.id, resourceId: node.resourceId, position: [...node.position], scale: node.scale,
      visible: node.visible, materialId: node.materialId, clipId: node.clipId, time: node.time,
      transition: clone(node.transition ?? null), evaluation: null, screenVertices: [], anchor: null,
      returnTo: clone(node.returnTo ?? null),
      depth: node.position[1], textureDraws: 0, authoringDraws: 0,
    }]));
    this._heldNodes = new Set();
    this._sequence = this._scene.sequence ?? null;
    this._sequenceState = { status: this._sequence ? 'ready' : 'unavailable', activationId: 0, eventCount: 0, emittedCount: 0 };
    this._sequenceEvent = null;
    this._sequenceElapsed = 0;
    this._sequenceDefinition = this._sequence ? {
      id: this._sequence.id, kind: 'burst', count: 1, speed: 0, size: 1, spread: 0,
      life: this._sequence.atlas.frames / this._sequence.atlas.fps, sprite: this._sequence.atlas,
    } : null;
  }

  requiredSources() {
    if (this.disposed) return [];
    return [...new Set([...this._resources.values()].flatMap(project => project.materials.flatMap(material => material.texture ? [material.texture.src] : []))
      .concat(this._sequence ? [this._sequence.atlas.src] : []))];
  }

  validateReady(images) {
    const errors = [];
    if (this.disposed) return { ok: false, errors: ['Rig scene is disposed.'] };
    for (const project of this._resources.values()) for (const material of project.materials) {
      const texture = material.texture;
      if (!texture) continue;
      const image = images.get(texture.src)?.image;
      if (!image || image.naturalWidth !== texture.width || image.naturalHeight !== texture.height) errors.push(`Rig texture must decode exactly ${texture.width}×${texture.height}: ${texture.src}`);
    }
    if (this._sequence && !this.sequenceImageReady(images)) errors.push(`Rig sequence atlas must decode exactly ${this._sequence.atlas.columns * this._sequence.atlas.frameWidth}×${this._sequence.atlas.rows * this._sequence.atlas.frameHeight}: ${this._sequence.atlas.src}`);
    return { ok: errors.length === 0, errors: [...new Set(errors)] };
  }

  _clip(node, id = node.clipId) { return id === null ? null : this._resources.get(node.resourceId).clips.find(clip => clip.id === id); }

  update(dt) {
    if (this.disposed || !Number.isFinite(dt) || dt < 0 || dt === 0) return false;
    for (const node of this._nodes.values()) {
      if (this._heldNodes.has(node.id)) continue;
      const previousTime = node.time;
      node.time = normalizedTime(this._clip(node), Math.min(Number.MAX_VALUE, node.time + dt));
      if (node.transition) {
        const transition = node.transition;
        transition.fromTime = normalizedTime(this._clip(node, transition.fromClipId), Math.min(Number.MAX_VALUE, transition.fromTime + dt));
        transition.elapsed = Math.min(transition.duration, transition.elapsed + dt);
        if (transition.elapsed + RIG_SCENE_TRANSITION_EPSILON >= transition.duration) node.transition = null;
      }
      if (this._sequence?.nodeId === node.id && this._sequenceState.status === 'active') {
        const state = this._sequenceState, sequence = this._sequence;
        this._sequenceElapsed = node.time;
        if (state.eventCount === 0 && previousTime < sequence.startTime
          && node.time + RIG_SCENE_TRANSITION_EPSILON >= sequence.startTime) {
          state.eventCount = 1;
          this._sequenceEvent = { sequenceId: sequence.id, activationId: state.activationId,
            definition: this._sequenceDefinition, position: { x: node.position[0] + sequence.offset[0], y: node.position[1] + sequence.offset[1] } };
        }
        if (node.time + RIG_SCENE_TRANSITION_EPSILON >= this._clip(node).duration) state.status = 'completed';
      }
      const clip = this._clip(node);
      if (node.returnTo && clip?.loop === false && node.time + RIG_SCENE_TRANSITION_EPSILON >= clip.duration) {
        this._changeClip(node, node.returnTo.clipId, node.returnTo.transitionSeconds);
      }
    }
    return true;
  }

  /** The same evaluator supplies rendering and public snapshots, including paused edits. */
  evaluate() {
    if (this.disposed) return this;
    const { yaw, pitch } = this.view, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    for (const node of this._nodes.values()) {
      const resource = this._resources.get(node.resourceId), transition = node.transition;
      node.evaluation = evaluateRig(resource, { materialId: node.materialId, clipId: node.clipId, time: node.time,
        blend: transition ? { fromClipId: transition.fromClipId, fromTime: transition.fromTime,
          amount: Math.min(1, transition.elapsed / transition.duration) } : null });
      const projection = this._getProjection();
      if(projection && ['project','toCamera','projectCamera','clipPolygon'].some(key=>typeof projection[key]!=='function'))throw new TypeError('Shared projection callbacks are required.');
      node.projection = projection;
      if(projection) {
        const foot=projection.project(...node.position);node.anchor={x:foot.x,y:foot.y};node.depth=foot.depth;
        node.anchorVisible=foot.visible;node.depthSource=foot.visible?'anchor':'hidden';
        node.worldVertices=node.evaluation.vertices.map(([x,y,z])=>{
          const rx=cy*x+sy*z,rz=-sy*x+cy*z,up=cp*y-sp*rz,front=sp*y+cp*rz;
          return [node.position[0]+rx*node.scale,node.position[1]+front*node.scale,node.position[2]+up*node.scale];
        });
        node.cameraVertices=node.worldVertices.map((vertex,index)=>{
          const point=projection.toCamera(...vertex),uv=node.evaluation.uvs?.[index];return uv?{...point,u:uv[0],v:uv[1]}:point;
        });
        node.screenVertices=node.cameraVertices.map(vertex=>{const point=projection.projectCamera(vertex);return {...point,z:point.depth};});
        if(!foot.visible) {
          // A near-hidden foot must not sort still-visible clipped geometry at the invisible sentinel depth0.
          const faces=this._projectedFaces(node,this._getViewport());
          for(const face of faces)for(const point of face.points)node.depth=Math.max(node.depth,point.depth);
          if(faces.length)node.depthSource='clipped-visible-geometry';
        }
        continue;
      }
      node.depth=node.position[1];node.worldVertices=null;node.cameraVertices=null;
      const foot = this._worldToScreen(node.position[0], node.position[1]);
      node.anchor = { x: foot.x, y: foot.y };
      node.screenVertices = node.evaluation.vertices.map(([x, y, z]) => {
        const rx = cy * x + sy * z, rz = -sy * x + cy * z;
        return { x: node.anchor.x + rx * node.scale, y: node.anchor.y - node.position[2] - (cp * y - sp * rz) * node.scale,
          z: (sp * y + cp * rz) * node.scale };
      });
    }
    return this;
  }

  getDrawEntries() {
    if (this.disposed) return [];
    return [...this._nodes.values()].filter(node => node.visible).map(node => ({ id: node.id, depth: node.depth }));
  }

  /** Return actual Canvas fill/stroke operation count, never a GPU draw-call measurement. */
  drawNode(context, id, viewport) {
    const node = this._nodes.get(id);
    if (this.disposed || !node?.visible || !node.evaluation) return 0;
    node.textureDraws = 0; node.authoringDraws = 0;
    if(node.projection)return this._drawProjectedNode(context,node,viewport);
    const projected = node.screenVertices;
    if (viewport && (projected.every(point => point.x < 0) || projected.every(point => point.x > viewport.width)
      || projected.every(point => point.y < 0) || projected.every(point => point.y > viewport.height))) return 0;
    const vertices = node.evaluation.vertices;
    const faces = sortRigFaces(node.evaluation.triangles, projected, node.evaluation.drawOrder);
    if (node.evaluation.texture) {
      const texture = node.evaluation.texture, image = this._getImage(texture.src);
      for (const { triangle, index } of faces) {
        const color = node.evaluation.faceColors?.[index];
        if (color) node.authoringDraws += drawRigAuthoringTriangle(context, { color, triangle, projected });
        else node.textureDraws += drawRigTextureTriangle(context, image,
          { texture, uvs: node.evaluation.uvs, triangle, projected });
      }
      return node.textureDraws + node.authoringDraws;
    }
    const rgb = node.evaluation.color.slice(1).match(/../g).map(value => parseInt(value, 16));
    let draws = 0;
    for (const { triangle, index } of faces) {
      const color = node.evaluation.faceColors?.[index];
      if (color) { const count = drawRigAuthoringTriangle(context, { color, triangle, projected }); node.authoringDraws += count; draws += count; continue; }
      const [a, b, c] = triangle.map(index => vertices[index]), u = b.map((value, axis) => value - a[axis]), v = c.map((value, axis) => value - a[axis]);
      const normal = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const length = Math.hypot(...normal) || 1;
      const shade = .35 + .65 * Math.max(0, (-.4 * normal[0] + .8 * normal[1] + .6 * normal[2]) / length / Math.sqrt(1.16));
      context.fillStyle = `rgb(${rgb.map(value => Math.round(value * shade)).join(',')})`;
      context.strokeStyle = '#17232ba0'; context.lineWidth = .8;
      context.beginPath(); triangle.forEach((index, offset) => { const point = projected[index]; offset ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y); });
      context.closePath(); context.fill(); context.stroke(); draws += 2;
    }
    return draws;
  }

  _projectedFaces(node,viewport) {
    const evaluation=node.evaluation,projection=node.projection;
    return evaluation.triangles.flatMap((triangle,index)=>{
      const clipped=projection.clipPolygon(triangle.map(vertex=>node.cameraVertices[vertex]));
      if(clipped.length<3)return [];
      const points=clipped.map(vertex=>({...vertex,...projection.projectCamera(vertex)}));
      if(points.some(point=>!point.visible))return [];
      if(viewport&&(points.every(p=>p.x<0)||points.every(p=>p.x>viewport.width)||points.every(p=>p.y<0)||points.every(p=>p.y>viewport.height)))return [];
      return [{triangle,index,points,layer:evaluation.drawOrder?.[index]??0,depth:points.reduce((sum,p)=>sum+p.depth,0)/points.length}];
    });
  }

  _drawProjectedNode(context,node,viewport) {
    const evaluation=node.evaluation;
    const faces=this._projectedFaces(node,viewport).sort((a,b)=>a.layer-b.layer||a.depth-b.depth||a.index-b.index);
    const texture=evaluation.texture,image=texture?this._getImage(texture.src):null;
    const rgb=evaluation.color.slice(1).match(/../g).map(value=>parseInt(value,16));
    let draws=0;
    for(const face of faces) {
      const color=evaluation.faceColors?.[face.index];
      let shade;
      if(!texture&&!color) {
        const [a,b,c]=face.triangle.map(index=>evaluation.vertices[index]),u=b.map((value,i)=>value-a[i]),v=c.map((value,i)=>value-a[i]);
        const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...normal)||1;
        shade=.35+.65*Math.max(0,(-.4*normal[0]+.8*normal[1]+.6*normal[2])/length/Math.sqrt(1.16));
      }
      for(let i=1;i<face.points.length-1;i++) {
        const points=[face.points[0],face.points[i],face.points[i+1]];
        if(color){const count=drawRigAuthoringTriangle(context,{color,triangle:[0,1,2],projected:points});node.authoringDraws+=count;draws+=count;}
        else if(texture){const count=drawRigTextureTriangle(context,image,{texture,uvs:points.map(p=>[p.u,p.v]),triangle:[0,1,2],projected:points});node.textureDraws+=count;draws+=count;}
        else {
          context.fillStyle=`rgb(${rgb.map(value=>Math.round(value*shade)).join(',')})`;context.strokeStyle='#17232ba0';context.lineWidth=.8;
          context.beginPath();context.moveTo(points[0].x,points[0].y);context.lineTo(points[1].x,points[1].y);context.lineTo(points[2].x,points[2].y);context.closePath();context.fill();context.stroke();draws+=2;
        }
      }
    }
    return draws;
  }

  setClip(id, clipId, duration = RIG_SCENE_TRANSITION_SECONDS) {
    const node = this._nodes.get(id);
    if (this.disposed || !node || !Number.isFinite(duration) || duration < 0 || duration > RIG_SCENE_LIMITS.transitionDuration
      || clipId !== null && (typeof clipId !== 'string' || !this._clip(node, clipId))) return false;
    if (node.returnTo && node.transition) return false;
    this._disarmSequence(id);
    this._changeClip(node, clipId, duration);
    return true;
  }

  _changeClip(node, clipId, duration) {
    this._heldNodes.delete(node.id);
    node.transition = duration > 0 ? { fromClipId: node.clipId, fromTime: node.time, duration, elapsed: 0 } : null;
    node.clipId = clipId; node.time = 0;
  }

  setMaterial(id, materialId) {
    const node = this._nodes.get(id);
    if (this.disposed || !node || !this._resources.get(node.resourceId).materials.some(material => material.id === materialId)) return false;
    node.materialId = materialId; return true;
  }

  seek(id, time) {
    const node = this._nodes.get(id);
    if (this.disposed || !node || !finiteTime(time)) return false;
    this._disarmSequence(id);
    this._heldNodes.delete(id);
    node.time = normalizedTime(this._clip(node), time); node.transition = null; return true;
  }

  sequenceImageReady(images) {
    if (this.disposed || !this._sequence) return false;
    const atlas = this._sequence.atlas, image = images.get(atlas.src)?.image;
    return Boolean(image && image.naturalWidth === atlas.columns * atlas.frameWidth && image.naturalHeight === atlas.rows * atlas.frameHeight);
  }

  /** A new activation changes only this node. Existing FX are owned by FDGRuntime. */
  replaySequence() {
    if (this.disposed || !this._sequence) return false;
    const node = this._nodes.get(this._sequence.nodeId);
    if (node.returnTo && node.transition) return false;
    this._changeClip(node, this._sequence.clipId, this._sequence.entryTransitionSeconds ?? 0);
    this._sequenceState.activationId += 1;
    Object.assign(this._sequenceState, { status: 'active', eventCount: 0, emittedCount: 0 });
    this._sequenceEvent = null;
    this._sequenceElapsed = 0;
    return true;
  }

  _disarmSequence(id) {
    if (this._sequence?.nodeId !== id) return;
    this._sequenceState.status = 'stopped'; this._sequenceEvent = null;
  }

  stopSequence() {
    if (this.disposed || !this._sequence) return false;
    this._disarmSequence(this._sequence.nodeId); this._heldNodes.add(this._sequence.nodeId);
    return true;
  }

  takeSequenceEvent() {
    const event = this._sequenceEvent; this._sequenceEvent = null; return event;
  }

  recordSequenceEmission(count) { if (!this.disposed) this._sequenceState.emittedCount = count; }

  getSequenceSnapshot() {
    const sequence = this._sequence;
    return { id: sequence?.id ?? null, ...this._sequenceState,
      elapsed: !sequence || this._sequenceState.status === 'ready' ? 0 : this._nodes.get(sequence.nodeId).returnTo ? this._sequenceElapsed : this._nodes.get(sequence.nodeId).time,
      eventTime: sequence?.startTime ?? null, atlasLife: this._sequenceDefinition?.life ?? null };
  }

  setView(yaw, pitch) {
    if (this.disposed || !Number.isFinite(yaw) || Math.abs(yaw) > Math.PI
      || !Number.isFinite(pitch) || Math.abs(pitch) > Math.PI / 3) return false;
    this.view = { yaw, pitch }; return true;
  }

  _snapshotNode(node) {
    return clone({ id: node.id, resourceId: node.resourceId, position: node.position, scale: node.scale, visible: node.visible,
      materialId: node.materialId, clipId: node.clipId, time: node.time, transition: node.transition,
      returnTo: node.returnTo,
      vertices: node.evaluation.vertices, bonePositions: node.evaluation.bonePositions,
      screenVertices: node.screenVertices, anchor: node.anchor, depth: node.depth,
      ...(node.evaluation.uvs ? { uvs: node.evaluation.uvs } : {}),
      ...(node.evaluation.drawOrder ? { drawOrder: node.evaluation.drawOrder } : {}),
      ...(node.evaluation.texture ? { texture: node.evaluation.texture } : {}),
      ...(node.evaluation.faceColors ? { faceColors: node.evaluation.faceColors } : {}),
      textureDraws: node.textureDraws, authoringDraws: node.authoringDraws,
      ...(node.projection?{projection:'shared-world-camera',worldVertices:node.worldVertices,cameraVertices:node.cameraVertices,
        anchorVisible:node.anchorVisible,depthSource:node.depthSource}: {}) });
  }

  getNodeSnapshot(id) {
    if (this.disposed || !this._nodes.has(id)) return null;
    this.evaluate(); return this._snapshotNode(this._nodes.get(id));
  }

  snapshot() {
    this.evaluate();
    return { nodes: [...this._nodes.values()].map(node => this._snapshotNode(node)),
      activeNodes: [...this._nodes.values()].filter(node => node.visible).length,
      resourceCount: this._resources.size, ownedRaf: 0, ownedListeners: 0, disposed: this.disposed };
  }

  capture(camera = {}) {
    if (this.disposed) return undefined;
    const scene = clone(this._scene);
    scene.camera = { ...scene.camera, ...camera, ...this.view };
    for (const saved of scene.nodes) {
      const node = this._nodes.get(saved.id);
      Object.assign(saved, { clipId: node.clipId, materialId: node.materialId, time: node.time, transition: clone(node.transition) });
    }
    return scene;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true; this._nodes.clear(); this._resources.clear(); this._scene = null; this._worldToScreen = null; this._getImage = null;this._getProjection=null;this._getViewport=null;
    this._heldNodes.clear(); this._sequence = null; this._sequenceDefinition = null; this._sequenceEvent = null;
    this._sequenceState = { status: 'unavailable', activationId: 0, eventCount: 0, emittedCount: 0 };
  }
}
