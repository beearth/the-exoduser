import { evaluateRig, compileRigEvaluator } from './rig.js?v=motion-continuity-20261012-final';
import { validateRigProject } from './rig-project.js';
import { drawRigTextureTriangle, drawRigAuthoringTriangle, sortRigFaces } from './rig-texture.js';
import { createDruidThornFanClip, createDruidThornFanObserver } from './druid-thorn-pose.js';
import { createRigSourceContract, rigSourceIdentity } from './rig-source-contract.js';

export const DRUID_SLAM_MARKERS = Object.freeze({ windStart: 0, windEnd: 1, strikeEnd: 1.16, recoverEnd: 2.6 });
const clamp = value => Math.max(0, Math.min(1, value));
const mix = (a, b, t) => a + (b - a) * t;
export const DRUID_MOTION_CONTINUITY = Object.freeze({ entryWindFraction: .25, returnSeconds: .12, rasterScaleSteps: 8, facingDeadZone: .1 });
const smoothstep = amount => { const t = clamp(amount); return t * t * (3 - 2 * t); };

/** Read the existing FSM. This clock never advances or writes a native actor. */
export function createDruidSlamPhaseObserver(markers = DRUID_SLAM_MARKERS) {
  const points = ['windStart', 'windEnd', 'strikeEnd', 'recoverEnd'].map(key => markers[key]);
  if (!points.every(Number.isFinite) || points[0] < 0 || points.some((value, i) => i && value <= points[i - 1])) {
    throw new TypeError('Ordered, finite slam phase markers are required.');
  }
  const traces = new WeakMap();
  const cancel = actor => { if (actor && typeof actor === 'object') traces.delete(actor); };
  return {
    cancel,
    begin(actor, windFrames) {
      if (!actor || typeof actor !== 'object' || actor.s !== 'bossSlamWind' || !Number.isFinite(windFrames) || windFrames <= 0) return false;
      traces.set(actor, { windFrames, sawStrike: false }); return true;
    },
    sample(actor) {
      const trace = actor && traces.get(actor);
      if (!trace) return null;
      if (actor.alive === false || actor.stunned > 0 || actor._hitStun > 0 || !Number.isFinite(actor.st2)) { cancel(actor); return null; }
      let phase, progress, time;
      if (actor.s === 'bossSlamWind' && !trace.sawStrike) {
        phase = 'wind'; progress = clamp(1 - actor.st2 / trace.windFrames); time = mix(points[0], points[1], progress);
      } else if (actor.s === 'bossSlam') {
        trace.sawStrike = true; phase = 'strike'; progress = clamp(1 - actor.st2 / 8); time = mix(points[1], points[2], progress);
      } else if (actor.s === 'recover' && trace.sawStrike) {
        // The native impact writes40; its next update clamps the boss to20.
        phase = 'recover'; progress = clamp(1 - Math.min(actor.st2, 20) / 20); time = mix(points[2], points[3], progress);
      } else { cancel(actor); return null; }
      return { phase, progress, time, windFrames: trace.windFrames, facing: Number.isFinite(actor.facing) ? actor.facing : 0 };
    },
  };
}

/** Opt-in consumer only. The original attack function remains the sole authority. */
export function installDruidSlamNativeBridge({ scope, rig, image, getStage, isFinale = () => false, drawTell = () => {}, canvasFactory, clipId = 'dark-druid-native-slam-r3', thornVolley = false, idleClipId = null, getAnimationTime = () => 0, smoothMotion = false, expectedSource }) {
  const validation = validateRigProject(rig);
  if (!validation.ok) throw new TypeError(validation.errors.join('; '));
  const sourceIdentity = expectedSource === undefined ? rigSourceIdentity(rig) : createRigSourceContract(expectedSource).validate(rig);
  const clip = rig.clips.find(item => item.id === clipId);
  const idleClip = idleClipId && rig.clips.find(item => item.id === idleClipId);
  const material = rig.materials[0];
  if (!clip || (idleClipId && (!idleClip || !(idleClip.duration > 0) || !(idleClip.fps > 0))) || !material?.texture || image?.naturalWidth !== material.texture.width || image?.naturalHeight !== material.texture.height) {
    throw new TypeError('Selected slam/idle clips and decoded selected source texture dimensions are required.');
  }
  if (typeof scope?._bossStartPattern !== 'function' || typeof scope?._drawDruidBoss !== 'function' || typeof getStage !== 'function') {
    throw new TypeError('Existing native start/draw functions and stage reader are required.');
  }
  const observer = createDruidSlamPhaseObserver(rig.provenance.bossSlam.phaseMarkers);
  const fanClip = thornVolley === true ? createDruidThornFanClip(rig) : null;
  const fanRig = fanClip ? { ...rig, clips: [...rig.clips, fanClip] } : null;
  const fanObserver = fanClip ? createDruidThornFanObserver() : null;
  const motionEnabled = smoothMotion === true && !!idleClip;
  const motionRig = fanRig || rig;
  const compiled = motionEnabled ? compileRigEvaluator(motionRig) : null;
  const motionStates = new WeakMap();
  const originalStart = scope._bossStartPattern, originalDraw = scope._drawDruidBoss;
  const cache = new WeakMap(); let installed = true, raster = null, lastRaster = null;
  const makeCanvas = canvasFactory || (() => scope.document.createElement('canvas'));
  const normal = actor => actor?.ib && [0, 3].includes(getStage()) && !isFinale(actor);
  const fanEligible = actor => normal(actor) && (actor._bossPhase ?? 0) >= 0 && (actor._bossPhase ?? 0) <= 1;
  const idleSample = actor => {
    if (!idleClip || !normal(actor) || actor.alive === false || actor.hp <= 0 || actor.s !== 'idle' || actor.stunned > 0 || actor._hitStun > 0) return null;
    const seconds = getAnimationTime();
    if (!Number.isFinite(seconds) || seconds < 0) return null;
    return { phase: 'idle', time: (motionEnabled ? seconds : Math.floor(seconds * idleClip.fps) / idleClip.fps) % idleClip.duration,
      facing: Number.isFinite(actor.facing) ? actor.facing : 0, clipId: idleClip.id };
  };
  function start(actor, move, ...args) {
    observer.cancel(actor); fanObserver?.cancel(actor); cache.delete(actor);
    const result = originalStart.call(this, actor, move, ...args);
    if (normal(actor) && move?.id === 'slam' && actor.s === 'bossSlamWind') observer.begin(actor, actor.st2);
    if (fanObserver && fanEligible(actor) && move?.id === 'fan' && actor.s === 'bossFanWind') fanObserver.begin(actor, actor.st2);
    const motion = motionStates.get(actor);
    if (motion && normal(actor) && ['slam', 'fan'].includes(move?.id)) motion.restart = true;
    return result;
  }
  function draw(context, actor, alpha, tdY, spec) {
    if (!normal(actor)) observer.cancel(actor);
    if (fanObserver && !fanEligible(actor)) fanObserver.cancel(actor);
    const fanSample = fanObserver?.sample(actor);
    const attackSample = fanSample || observer.sample(actor);
    const sample = attackSample || idleSample(actor);
    const selectedClip = fanSample ? fanClip : attackSample ? clip : idleClip;
    const selectedRig = fanSample ? fanRig : rig;
    if (!sample || !installed) {
      cache.delete(actor);
      motionStates.delete(actor);
      if (lastRaster?.actor === actor) { lastRaster = null; if (raster) { raster.width = 0; raster.height = 0; } }
      return originalDraw.call(this, context, actor, alpha, tdY, spec);
    }
    let motion = motionEnabled ? motionStates.get(actor) : null;
    const seconds = motionEnabled ? getAnimationTime() : null;
    const clockValid = Number.isFinite(seconds) && seconds >= 0;
    if (motionEnabled && (!clockValid || (motion && seconds < motion.seconds))) {
      motionStates.delete(actor); motion = null;
    }
    if (motionEnabled && clockValid && !motion) {
      motion = { clipId: selectedClip.id, seconds, lastPose: null, transition: null, restart: false };
      motionStates.set(actor, motion);
    }
    if (motion && (motion.clipId !== selectedClip.id || motion.restart)) {
      motion.transition = motion.lastPose ? { source: motion.lastPose, kind: sample.phase === 'idle' ? 'return' : 'entry', startedAt: seconds } : null;
      motion.clipId = selectedClip.id; motion.restart = false;
    }
    let blend = null;
    if (motion?.transition) {
      const transition = motion.transition;
      const amount = transition.kind === 'entry'
        ? sample.phase === 'wind' ? smoothstep(sample.progress / DRUID_MOTION_CONTINUITY.entryWindFraction) : 1
        : smoothstep((seconds - transition.startedAt) / DRUID_MOTION_CONTINUITY.returnSeconds);
      if (amount < 1) blend = { fromPose: transition.source, amount };
      else motion.transition = null;
    }
    let posed = cache.get(actor);
    if (!posed || posed.clipId !== selectedClip.id || posed.time !== sample.time || posed.blendSource !== blend?.fromPose || posed.blendAmount !== blend?.amount) {
      const options = { clipId: selectedClip.id, time: sample.time, materialId: material.id, ...(blend ? { blend } : {}) };
      posed = { clipId: selectedClip.id, time: sample.time, blendSource: blend?.fromPose, blendAmount: blend?.amount,
        value: compiled ? compiled.evaluate(options) : evaluateRig(selectedRig, options) };
      cache.set(actor, posed);
    }
    const value = posed.value;
    if (motion) { motion.lastPose = value.localPose; motion.seconds = seconds; }
    const [width, height] = rig.provenance.sourceSize, [ox, oy] = rig.provenance.originPx;
    const units = rig.provenance.sourcePxPerModelUnit;
    const dw = actor.r * spec.dw, dh = actor.r * spec.dh, undoScale = 1 / (scope._btScaleMul || 1);
    // Facing selects a mirrored front projection; this is not an eight-view reconstruction.
    const facingCos = Math.cos(sample.facing), nativeFacing = facingCos < 0 ? -1 : 1;
    const facing = motion && Math.abs(facingCos) <= DRUID_MOTION_CONTINUITY.facingDeadZone ? motion.facing ?? nativeFacing : nativeFacing;
    if (motion) motion.facing = facing;
    const projected = value.vertices.map(([x, y, z]) => ({
      x: facing * (x * units * dw / width + (ox / width - .5) * dw),
      y: -y * units * dh / height + (oy / height - .86) * dh, z,
    }));
    const transform = context.getTransform?.();
    const displayScale = transform ? Math.max(Math.hypot(transform.a, transform.b), Math.hypot(transform.c, transform.d)) : 1;
    const desiredScale = Math.max(.25, Math.min(2, undoScale * displayScale));
    const rasterScale = motionEnabled ? Math.ceil(desiredScale * DRUID_MOTION_CONTINUITY.rasterScaleSteps) / DRUID_MOTION_CONTINUITY.rasterScaleSteps : desiredScale;
    if (!lastRaster || lastRaster.actor !== actor || lastRaster.clipId !== selectedClip.id || lastRaster.time !== sample.time || lastRaster.facing !== facing
      || lastRaster.value !== value || lastRaster.dw !== dw || lastRaster.dh !== dh || lastRaster.scale !== rasterScale) {
      const left = Math.floor(Math.min(...projected.map(point => point.x))) - 1;
      const top = Math.floor(Math.min(...projected.map(point => point.y))) - 1;
      const width = Math.ceil((Math.max(...projected.map(point => point.x)) - left + 1) * rasterScale);
      const height = Math.ceil((Math.max(...projected.map(point => point.y)) - top + 1) * rasterScale);
      if (!raster) raster = makeCanvas();
      raster.width = width; raster.height = height;
      const rasterContext = raster.getContext('2d');
      if (!rasterContext) return originalDraw.call(this, context, actor, alpha, tdY, spec);
      rasterContext.setTransform(rasterScale, 0, 0, rasterScale, -left * rasterScale, -top * rasterScale);
      for (const { triangle, index } of sortRigFaces(value.triangles, projected, value.drawOrder)) {
        const color = value.faceColors?.[index];
        if (color) drawRigAuthoringTriangle(rasterContext, { color, triangle, projected });
        else drawRigTextureTriangle(rasterContext, image, { texture: value.texture, uvs: value.uvs, triangle, projected });
      }
      // The native GPU cache uses this owner-canvas revision for fresh pixels.
      if (fanObserver || idleClip || clipId === 'dark-druid-native-slam-contact-r5') raster._glVer = (raster._glVer || 0) + 1;
      lastRaster = { actor, clipId: selectedClip.id, time: sample.time, facing, dw, dh, value, scale: rasterScale, left, top, width: width / rasterScale, height: height / rasterScale };
    }
    if (motionEnabled) lastRaster.motion = { phase: sample.phase, nativeSeconds: seconds, transition: motion?.transition?.kind || null,
      blendAmount: blend?.amount ?? 1, rasterScale, authoredFps: selectedClip.fps };
    drawTell(context, actor);
    context.save();
    try {
      context.translate(actor.x, actor.y + (tdY || 0) - 6); context.scale(undoScale, undoScale);
      if (scope._BOSS_GLOW) {
        context.globalAlpha = alpha * .30; context.fillStyle = spec.glow;
        context.beginPath(); context.ellipse(0, -dh * .40, dw * .24, dh * .22, 0, 0, Math.PI * 2); context.fill();
      }
      // Skin once into one owner canvas, then retain the three native image passes.
      for (const [composite, opacity] of [['source-over', alpha], ['lighter', alpha * .42], ['lighter', alpha * .42]]) {
        context.globalCompositeOperation = composite; context.globalAlpha = opacity;
        context.drawImage(raster, lastRaster.left, lastRaster.top, lastRaster.width, lastRaster.height);
      }
      actor._nameTopOff = (tdY || 0) - 6 - dh * .86 * undoScale - 10;
    } finally { context.restore(); }
    return true;
  }
  scope._bossStartPattern = start; scope._drawDruidBoss = draw;
  return {
    observer,
    ...(fanObserver ? { fanObserver, fanClip } : {}),
    getSnapshot: actor => fanObserver?.sample(actor) || observer.sample(actor) || idleSample(actor),
    getRenderSnapshot: actor => lastRaster?.actor === actor ? {
      rigId: rig.id, clipId: lastRaster.clipId, time: lastRaster.time, facing: lastRaster.facing,
      sourceIdentity: { ...sourceIdentity },
      rasterRevision: raster?._glVer || 0,
      bounds: { left: lastRaster.left, top: lastRaster.top, width: lastRaster.width, height: lastRaster.height },
      ...(motionEnabled ? { motion: { ...lastRaster.motion } } : {}),
    } : null,
    ...(motionEnabled ? { getDisplayedPose: actor => installed && motionStates.get(actor)?.lastPose?.map(bone => ({ id: bone.id,
      translation: [...bone.translation], rotationQuaternion: [...bone.rotationQuaternion] })) || null } : {}),
    uninstall() {
      installed = false;
      if (scope._bossStartPattern === start) scope._bossStartPattern = originalStart;
      if (scope._drawDruidBoss === draw) scope._drawDruidBoss = originalDraw;
      if (raster) { raster.width = 0; raster.height = 0; raster = null; }
      lastRaster = null;
    },
  };
}

export async function loadDruidSlamNativeBridge(options) {
  const sourceContract = options.expectedSource === undefined ? null : createRigSourceContract(options.expectedSource);
  const response = await fetch(new URL(options.rigUrl || '../../tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.rig.json?v=boss-slam-r3-final', import.meta.url));
  if (!response.ok) throw new Error(`Druid slam rig HTTP ${response.status}`);
  const rig = await response.json(), texture = rig.materials[0]?.texture;
  if (sourceContract) sourceContract.validate(rig);
  if (!texture) throw new TypeError('Selected Druid source texture declaration is required.');
  const image = await new Promise((resolve, reject) => {
    const source = new Image(); source.onload = () => resolve(source); source.onerror = () => reject(new Error('Selected Druid source texture could not load.'));
    const selectedPath = sourceContract && texture.src.startsWith('/') ? texture.src : '/' + texture.src;
    source.src = new URL(selectedPath, location.origin).href;
  });
  return installDruidSlamNativeBridge({ ...options, expectedSource: sourceContract?.expected, rig, image });
}
