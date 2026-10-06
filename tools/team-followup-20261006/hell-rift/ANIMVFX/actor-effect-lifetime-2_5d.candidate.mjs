/*
 * actor-effect-lifetime-2_5d.candidate.mjs — ANIMVFX CANDIDATE
 *
 * Goal     : CH1-2_5D-CHARACTER-MAP-SLICE-20261006 (docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md)
 * Owner    : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID    : CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ANIMVFX-CANDIDATE
 *
 * WHAT
 *   Binds effects to the ACTOR FOOT WORLD ANCHOR and the current 2.5D render lifetime of the
 *   read-only root lab (tools/2_5d-world-lab.mjs, tools/2_5d/character-rigs.mjs). It does NOT
 *   re-implement the rig: it consumes the rig's own contract —
 *     createCharacterRig(id,{THREE,height}) -> { object3d, update, snapshot, dispose }  (character-rigs.mjs:31,166)
 *     snapshot() -> { mode, direction, frame, elapsed, disposed, ... }                   (character-rigs.mjs:149-159)
 *   and the lab's own anchor/billboard/occlusion contract:
 *     object3d.position.copy(terrain.worldToScene(x,y)); quaternion.copy(camera.quaternion); (2_5d-world-lab.mjs:64)
 *     renderOrder = y<=4320 ? 20 : 40  (east-horn front/behind boundary)                   (2_5d-world-lab.mjs:66)
 *
 * EFFECT SOURCE = existing engine primitives only (THREE.RingGeometry/Mesh/MeshBasicMaterial,
 *   injected THREE). No new vfx file, no image/texture, no video decoder, no install, no network.
 *   Dust (flat ground ring, grounded like the lab shadow at 2_5d-world-lab.mjs:67) on footfall;
 *   a camera-billboarded arc on an attack enter-edge.
 *
 * LIFETIME / CLEANUP (the owned responsibility)
 *   - generation is EDGE-triggered by real rig state (footfall = frame change while walk/run;
 *     attack = idle/other -> attack transition), never per frame, and rate/pool capped.
 *   - duplicate occlusion writes are suppressed: renderOrder is set only when the band changes.
 *   - onActorChange() recycles the previous actor's live effects and resets edge state (no carry-over).
 *   - onSceneChange() recycles all live effects; dispose() removes every mesh and frees GPU geometry/material.
 *   - reducedMotion suppresses new spawns while still advancing/cleaning existing ones.
 *
 * NOT: a rig/character re-implementation, a full-3D model, a new asset, or native/visual/audio
 *   acceptance. Does not change movement, damage, save, camera, or the actor transform. Protection
 *   2_3 / Q-only magic / E-non-parry / no-attack-ticket are untouched (decorative only).
 */

'use strict';

const finite = Number.isFinite;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

const DEFAULTS = Object.freeze({
  maxLive: 24,
  dustLifeMs: 520, attackLifeMs: 240,
  stepMinIntervalMs: 110,
  footBand: 4320,            // world-y occlusion boundary (east-horn), mirrors the lab
  dustColor: 0x1a140f, dustOpacity: 0.5, dustSize: 0.14,
  attackColor: 0xc8623a, attackOpacity: 0.8, attackSize: 0.17,
  groundLift: 0.003,         // avoid z-fight with the ground plane, like the lab shadow (.002)
  reducedMotion: false
});

export function createActorEffectLifetime(deps = {}) {
  const { THREE, scene, camera, terrain } = deps;
  const opt = Object.freeze({ ...DEFAULTS, ...(deps.options || {}) });
  const ready = !!THREE && !!scene && !!camera && !!terrain
    && typeof terrain.worldToScene === 'function'
    && typeof THREE.Mesh === 'function' && typeof THREE.RingGeometry === 'function'
    && typeof THREE.MeshBasicMaterial === 'function'
    && typeof scene.add === 'function' && typeof scene.remove === 'function';

  const stats = { active: ready, reason: ready ? '' : 'invalid-deps', live: 0, spawned: 0, expired: 0, recycled: 0, pool: 0, bandWrites: 0, suppressed: 0 };
  if (!ready) {
    const noop = () => stats.live;
    return Object.freeze({ update: () => ({ ...stats }), onActorChange: noop, onSceneChange: noop, dispose: noop, snapshot: () => ({ ...stats }) });
  }

  // Shared, reused geometry — one per kind, disposed once at teardown.
  const dustGeo = new THREE.RingGeometry(0.55, 1, 28, 1);
  const attackGeo = new THREE.RingGeometry(0.62, 1, 24, 1, -0.9, 1.8); // a forward arc wedge
  const HALF_PI = Math.PI / 2;

  const all = [], free = [], live = [];
  let clock = 0, lastFrame = -1, lastMode = '', lastStepClock = -1e9, disposed = false;

  function acquire(kind) {
    let e = free.pop();
    if (!e) {
      const material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
      const mesh = new THREE.Mesh(kind === 'attack' ? attackGeo : dustGeo, material);
      mesh.frustumCulled = false; mesh.visible = false;
      scene.add(mesh);
      e = { mesh, material, kind, born: 0, life: 1, follow: false, wx: 0, wy: 0, band: null };
      all.push(e);
    } else {
      e.mesh.geometry = kind === 'attack' ? attackGeo : dustGeo;
    }
    e.kind = kind;
    return e;
  }

  function place(e, wx, wy) {
    const p = terrain.worldToScene(wx, wy);
    if (p && typeof e.mesh.position.copy === 'function') { e.mesh.position.copy(p); e.mesh.position.y += opt.groundLift; }
    // dust lies flat on the ground; the attack arc faces the orthographic camera.
    if (e.kind === 'attack') e.mesh.quaternion.copy(camera.quaternion);
    else e.mesh.rotation.x = -HALF_PI;
    const effWorldY = e.follow ? wy : e.wy;
    const band = (effWorldY <= opt.footBand ? 19 : 39); // one below the actor's 20/40 so it reads behind the body
    if (e.band !== band) { e.mesh.renderOrder = band; e.band = band; stats.bandWrites++; }
  }

  function spawn(kind, wx, wy, follow) {
    if (opt.reducedMotion) { stats.suppressed++; return null; }
    if (live.length >= opt.maxLive) recycle(live[0], 'cap');
    const e = acquire(kind);
    e.born = clock; e.life = kind === 'attack' ? opt.attackLifeMs : opt.dustLifeMs;
    e.follow = !!follow; e.wx = wx; e.wy = wy; e.band = null;
    e.material.color.setHex(kind === 'attack' ? opt.attackColor : opt.dustColor);
    e.material.opacity = kind === 'attack' ? opt.attackOpacity : opt.dustOpacity;
    e.mesh.visible = true;
    place(e, wx, wy);
    live.push(e); stats.spawned++;
    return e;
  }

  function recycle(e, why) {
    const i = live.indexOf(e); if (i < 0) return;
    live.splice(i, 1);
    e.mesh.visible = false; e.band = null;
    free.push(e);
    if (why === 'expire') stats.expired++; else stats.recycled++;
  }

  /** Per frame. dt seconds (lab uses seconds); worldX/Y the live foot; snap = rig.snapshot(). */
  function update(dt, worldX, worldY, snap) {
    if (disposed) return { ...stats };
    clock += (finite(dt) ? clamp(dt, 0, 0.1) : 0) * 1000;
    const x = finite(worldX) ? worldX : 0, y = finite(worldY) ? worldY : 0;
    const mode = snap && typeof snap.mode === 'string' ? snap.mode : '';
    const frame = snap && finite(snap.frame) ? snap.frame : -1;

    // Edge-triggered generation only (no per-frame spawn, no duplicates).
    if (!(snap && snap.disposed)) {
      if ((mode === 'walk' || mode === 'run') && frame !== lastFrame && clock - lastStepClock >= opt.stepMinIntervalMs) {
        spawn('dust', x, y, false); lastStepClock = clock;              // footfall dust stays where the foot was
      }
      if (mode === 'attack' && lastMode !== 'attack') spawn('attack', x, y, true); // one arc per attack enter, follows the foot
    }
    lastFrame = frame; lastMode = mode;

    // Advance / expire / re-anchor live effects.
    for (let i = live.length - 1; i >= 0; i--) {
      const e = live[i], age = clock - e.born, t = age / e.life;
      if (t >= 1) { recycle(e, 'expire'); continue; }
      const fade = 1 - t;
      e.material.opacity = (e.kind === 'attack' ? opt.attackOpacity : opt.dustOpacity) * fade;
      const grow = e.kind === 'attack' ? (0.6 + t * 0.8) : (0.5 + t * 1.1);
      const s = (e.kind === 'attack' ? opt.attackSize : opt.dustSize) * grow;
      e.mesh.scale.set(s, s, s);
      place(e, e.follow ? x : e.wx, e.follow ? y : e.wy);
    }
    stats.live = live.length; stats.pool = free.length;
    return { ...stats };
  }

  function onActorChange(reason) {
    for (let i = live.length - 1; i >= 0; i--) recycle(live[i], 'actor-change');
    lastFrame = -1; lastMode = ''; lastStepClock = -1e9; stats.reason = reason || 'actor-change';
    stats.live = live.length; stats.pool = free.length;
    return live.length;
  }
  function onSceneChange(reason) { onActorChange(reason || 'scene-change'); return live.length; }

  function dispose() {
    if (disposed) return 0;
    disposed = true;
    for (const e of all) { e.mesh.visible = false; if (typeof scene.remove === 'function') scene.remove(e.mesh); if (typeof e.material.dispose === 'function') e.material.dispose(); }
    if (typeof dustGeo.dispose === 'function') dustGeo.dispose();
    if (typeof attackGeo.dispose === 'function') attackGeo.dispose();
    live.length = 0; free.length = 0;
    stats.active = false; stats.reason = 'disposed'; stats.live = 0; stats.pool = 0;
    return all.length;
  }

  function snapshot() {
    return Object.freeze({ endId: 'CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ANIMVFX-CANDIDATE', ...stats, meshes: all.length });
  }

  return Object.freeze({ update, onActorChange, onSceneChange, dispose, snapshot });
}

export default Object.freeze({ createActorEffectLifetime });
