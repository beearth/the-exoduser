// ROOT-ADOPTED derivative; original raw ANIMVFX candidate is unchanged.
export const ACTOR_EFFECT_PROVENANCE = Object.freeze({
  status: 'ROOT-ADOPTED', role: 'ANIMVFX', ownerUuid: 'f56a2bc8-0cf7-459e-a393-5f93d78d30e1',
  endId: 'CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ANIMVFX-CANDIDATE',
  source: 'tools/team-followup-20261006/hell-rift/ANIMVFX/actor-effect-lifetime-2_5d.candidate.mjs',
  sourceBytes: 9201, sourceSha256: '1c9677089bf219ed0a5d486dc8873cb5fcbf4e7851a5df304996b3957c4c7400'
});

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

export const ACTOR_EFFECT_DEFAULTS = Object.freeze({
  maxLive: 24,
  dustLifeMs: 520, attackLifeMs: 240,
  stepMinIntervalMs: 110,
  footBand: 4320,            // world-y occlusion boundary (east-horn), mirrors the lab
  dustColor: 0x1a140f, dustOpacity: 0.5, dustSize: 0.14,
  attackColor: 0xc8623a, attackOpacity: 0.8, attackSize: 0.17,
  groundLift: 0.003,         // avoid z-fight with the ground plane, like the lab shadow (.002)
  reducedMotion: false, depthTest: true
});

export function createActorEffectLifetime(deps = {}) {
  if(!deps||typeof deps!=='object')throw new Error('actor effects 의존성 객체가 필요합니다.');
  const { THREE, scene, camera, terrain } = deps;
  const options=deps.options||{};
  if(typeof options!=='object'||Array.isArray(options))throw new Error('actor effects options 객체가 필요합니다.');
  for(const key of ['maxLive','dustLifeMs','attackLifeMs','stepMinIntervalMs']){
    if(options[key]!==undefined&&options[key]!==ACTOR_EFFECT_DEFAULTS[key])throw new Error(`actor effects 고정 수명/상한: ${key}`);
  }
  const opt = Object.freeze({ ...ACTOR_EFFECT_DEFAULTS, ...options });
  for(const key of ['footBand','groundLift','dustSize','attackSize','dustOpacity','attackOpacity','dustColor','attackColor'])if(!finite(opt[key]))throw new Error(`actor effects finite 옵션 필요: ${key}`);
  if(opt.dustSize<=0||opt.attackSize<=0||opt.groundLift<0||opt.dustOpacity<0||opt.dustOpacity>1||opt.attackOpacity<0||opt.attackOpacity>1)throw new Error('actor effects 크기/높이/불투명도 범위 오류');
  for(const key of ['dustColor','attackColor'])if(!Number.isInteger(opt[key])||opt[key]<0||opt[key]>0xffffff)throw new Error('actor effects RGB 색상 범위 오류');
  if(typeof opt.depthTest!=='boolean'||typeof opt.reducedMotion!=='boolean')throw new Error('actor effects depthTest/reducedMotion은 boolean이어야 합니다.');
  const ready = !!THREE && !!scene && !!camera && !!terrain
    && typeof terrain.worldToScene === 'function'
    && typeof THREE.Mesh === 'function' && typeof THREE.RingGeometry === 'function'
    && typeof THREE.MeshBasicMaterial === 'function'
    && !!camera.quaternion && [camera.quaternion.x,camera.quaternion.y,camera.quaternion.z,camera.quaternion.w].every(finite)
    && typeof scene.add === 'function' && typeof scene.remove === 'function';

  const stats = { active: ready, reason: ready ? '' : 'invalid-deps', live: 0, spawned: 0, expired: 0, recycled: 0, pool: 0, bandWrites: 0, suppressed: 0 };
  if (!ready) throw new Error('actor effects THREE/scene/camera/terrain 의존성 오류');

  // Shared, reused geometry — one per kind, disposed once at teardown.
  const dustGeo = new THREE.RingGeometry(0.55, 1, 28, 1);
  const attackGeo = new THREE.RingGeometry(0.62, 1, 24, 1, -0.9, 1.8); // a forward arc wedge
  const HALF_PI = Math.PI / 2;

  const all = [], free = [], live = [];
  let clock = 0, lastFrame = -1, lastMode = '', lastStepClock = -1e9, disposed = false;

  function acquire(kind) {
    let e = free.pop();
    if (!e) {
      const material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest:opt.depthTest, side: THREE.DoubleSide, toneMapped: false });
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
    if(!p||![p.x,p.y,p.z].every(finite))throw new Error('actor effects worldToScene 원점은 finite Vector3이어야 합니다.');
    e.mesh.position.copy(p); e.mesh.position.y += opt.groundLift;
    // dust lies flat on the ground; the attack arc faces the orthographic camera.
    if (e.kind === 'attack') e.mesh.quaternion.copy(camera.quaternion);
    else e.mesh.rotation.set(-HALF_PI,0,0);
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
    place(e, wx, wy);
    e.mesh.visible = true;
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
    if(!finite(worldX)||!finite(worldY))throw new Error('actor effects 발 원점은 finite 수치여야 합니다.');
    const x=worldX,y=worldY;
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
    // Capture the actual owned pool at teardown, after further spawns are closed.
    const entries = all.slice(), detached = new Set(), released = new Set();
    let failures = 0;
    const attempt = action => { try { action(); } catch (_) { failures++; } };
    const release = resource => {
      if (!resource || released.has(resource)) return;
      released.add(resource);
      attempt(() => { if (typeof resource.dispose === 'function') resource.dispose(); });
    };
    try {
      for (const entry of entries) {
        let mesh, material;
        attempt(() => { mesh = entry.mesh; });
        attempt(() => { material = entry.material; });
        if (mesh && !detached.has(mesh)) {
          detached.add(mesh);
          attempt(() => { mesh.visible = false; });
          attempt(() => { if (typeof scene.remove === 'function') scene.remove(mesh); });
        }
        release(material);
      }
      // These geometries are shared by the pool; never dispose per mesh.
      release(dustGeo);
      release(attackGeo);
    } finally {
      live.length = 0; free.length = 0;
      stats.active = false; stats.reason = 'disposed'; stats.live = 0; stats.pool = 0;
    }
    // The existing lab counts thrown cleanup errors. Report only after all attempts.
    if (failures) throw new Error(`actor effects 소유 자원 해제 실패: ${failures}`);
    return all.length;
  }

  function snapshot() {
    return Object.freeze({ endId: ACTOR_EFFECT_PROVENANCE.endId, provenance:ACTOR_EFFECT_PROVENANCE, options:opt, ...stats, meshes: all.length });
  }

  return Object.freeze({ update, onActorChange, onSceneChange, dispose, snapshot });
}

export default Object.freeze({ createActorEffectLifetime, ACTOR_EFFECT_DEFAULTS, ACTOR_EFFECT_PROVENANCE });
