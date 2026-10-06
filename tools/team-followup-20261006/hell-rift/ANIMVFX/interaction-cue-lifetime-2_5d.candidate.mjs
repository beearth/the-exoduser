/*
 * interaction-cue-lifetime-2_5d.candidate.mjs — ANIMVFX CANDIDATE
 *
 * Goal   : CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006
 * Owner  : ANIMVFX (UUID f56a2bc8-0cf7-459e-a393-5f93d78d30e1)
 * EndID  : CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-ANIMVFX-INTERACTION-CUE-CANDIDATE
 *
 * UNIT1 — a VISUAL approach/dialogue cue lifetime adapter that consumes the REAL root NPC
 *   approach/session provider READ-ONLY (the existing pure session consumer created by
 *   createRiftDialogue, wired in tools/2_5d-world-lab.mjs:9,84,98):
 *     provider.nearest(player) -> { npcId, name, x, y, distance } | null   (map-scene-rift-dialogue.mjs:198-207)
 *     provider.snapshot()      -> { isOpen, view:{ npcId, ... }, ... }      (map-scene-rift-dialogue.mjs:189-207)
 *   It anchors cues to the NPC foot via terrain.worldToScene(x,y) (world-lab:143/179) and the
 *   2.5D render lifetime. It NEVER calls open/choose/close and never mutates the session: it is
 *   decorative. STORY session selection/conditions and the root HUD/dialogue panel are separate.
 *
 * UNIT2 — self-cleanup only: on enter/exit range, actor/NPC change, runtime reducedMotion, and
 *   dispose it retires/removes ONLY its own two pooled cue meshes. It creates no timers (the
 *   caller's single renderer RAF drives update), touches no other session/mesh, and frees its own
 *   geometry/material on dispose.
 *
 * OCCLUSION / renderOrder: this module does NOT compute a positional render order (that is map
 *   work gated on the full map guide). The caller injects options.orderFor(worldY) — root's
 *   exported riftResidentFootOrder = 30 + (footY-4320)/8000*10 (rift-resident-billboards.mjs:39).
 *   Absent an injected orderFor, cues use a fixed order and occlusion is reported UNKNOWN (never a
 *   fake-correct sort). Provider missing / malformed / throwing => fail-closed, no cue, reason set.
 *
 * NOT: a rig/billboard/HUD re-implementation, a STORY bank/grant, a new asset, a video decoder,
 *   or native/screen acceptance. Protection 2_3 / Q-only magic blackBean (E non-parry) /
 *   no-attack-ticket are untouched (no input, no gameplay, no ticket).
 */

'use strict';

const finite = Number.isFinite;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

const DEFAULTS = Object.freeze({
  approachColor: 0xcdbb86, approachOpacity: 0.55, approachSize: 0.16,  // bone-gold ground ring
  openColor: 0xc8623a, openOpacity: 0.8, openSize: 0.12,               // ember chevron above foot
  openLift: 0.42,            // scene-units the open marker floats above the foot
  groundLift: 0.003,         // avoid z-fight with the ground (cf. world-lab shadow .002)
  pulseHz: 1.6, pulseDepth: 0.22,
  fixedOrder: 31,            // safe fallback when no orderFor is injected (occlusion UNKNOWN then)
  reducedMotion: false
});

export function createInteractionCueLifetime(deps = {}) {
  const { THREE, scene, camera, terrain } = deps;
  const opt = { ...DEFAULTS, ...(deps.options || {}) };
  const orderFor = typeof opt.orderFor === 'function' ? opt.orderFor : null;
  const anchorFor = typeof opt.anchorFor === 'function' ? opt.anchorFor : null;
  const ready = !!THREE && !!scene && !!camera && !!terrain
    && typeof terrain.worldToScene === 'function'
    && typeof THREE.Mesh === 'function' && typeof THREE.RingGeometry === 'function'
    && typeof THREE.MeshBasicMaterial === 'function'
    && typeof scene.add === 'function' && typeof scene.remove === 'function';

  const stats = {
    active: ready, reason: ready ? '' : 'invalid-deps',
    approachNpc: null, approachVisible: false, openNpc: null, openVisible: false, openAnchorUnknown: false,
    reduced: !!opt.reducedMotion, spawned: 0, retired: 0, meshes: 0,
    occlusion: orderFor ? 'injected-orderFor' : 'UNKNOWN-root-must-inject-orderFor'
  };
  if (!ready) {
    const noop = () => stats.reason;
    return Object.freeze({ update: () => ({ ...stats }), setReducedMotion: noop, onActorChange: noop, onSceneChange: noop, dispose: noop, snapshot: () => ({ ...stats }) });
  }

  const ringGeo = new THREE.RingGeometry(0.5, 1, 32, 1);
  const chevGeo = new THREE.RingGeometry(0.0, 1, 3, 1);  // a 3-gon marker (no new asset)
  const HALF_PI = Math.PI / 2;
  const lastSeen = new Map();   // npcId -> {x,y}, captured read-only from nearest()
  let clock = 0, disposed = false, reduced = !!opt.reducedMotion;

  function makeCue(kind) {
    const material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const mesh = new THREE.Mesh(kind === 'open' ? chevGeo : ringGeo, material);
    mesh.frustumCulled = false; mesh.visible = false;
    scene.add(mesh); stats.meshes++;
    return { mesh, material, kind, npcId: null };
  }
  const approach = makeCue('approach'), open = makeCue('open');

  function order(worldY) { return orderFor ? orderFor(worldY) + 0.5 : opt.fixedOrder; }
  function pulse() { return reduced ? 1 : 1 + opt.pulseDepth * Math.sin(clock / 1000 * opt.pulseHz * Math.PI * 2); }

  function show(cue, npcId, wx, wy) {
    if (cue.npcId !== npcId) { cue.npcId = npcId; stats.spawned++; }
    const p = terrain.worldToScene(wx, wy);
    if (!p || typeof cue.mesh.position.copy !== 'function') return false;
    cue.mesh.position.copy(p);
    const k = cue.kind === 'open' ? opt.openSize : opt.approachSize, s = k * (cue.kind === 'approach' ? pulse() : 1);
    cue.mesh.scale.set(s, s, s);
    if (cue.kind === 'open') { cue.mesh.position.y += opt.openLift; cue.mesh.quaternion.copy(camera.quaternion); }
    else { cue.mesh.position.y += opt.groundLift; cue.mesh.rotation.x = -HALF_PI; }
    cue.material.color.setHex(cue.kind === 'open' ? opt.openColor : opt.approachColor);
    cue.material.opacity = (cue.kind === 'open' ? opt.openOpacity : opt.approachOpacity) * (reduced ? 1 : (0.75 + 0.25 * (pulse())));
    cue.mesh.renderOrder = order(wy);
    cue.mesh.visible = true;
    return true;
  }
  function hide(cue) { if (cue.npcId !== null) { cue.npcId = null; stats.retired++; } cue.mesh.visible = false; }

  /** Per frame. player={x,y}; provider = the read-only dialogue session consumer. */
  function update(dt, player, provider) {
    if (disposed) return { ...stats };
    clock += (finite(dt) ? clamp(dt, 0, 0.1) : 0) * 1000;
    let near = null, snap = null;
    try {
      if (provider && typeof provider.nearest === 'function') near = provider.nearest(player);
      if (provider && typeof provider.snapshot === 'function') snap = provider.snapshot();
    } catch (_) { near = null; snap = null; }
    const validNear = near && finite(near.x) && finite(near.y) && typeof near.npcId === 'string';
    if (validNear) lastSeen.set(near.npcId, { x: near.x, y: near.y });
    const isOpen = !!(snap && snap.isOpen), openNpc = isOpen && snap.view && typeof snap.view.npcId === 'string' ? snap.view.npcId : null;

    // Approach cue: only while NOT in conversation and a reachable NPC is in range.
    if (!isOpen && validNear) show(approach, near.npcId, near.x, near.y); else hide(approach);

    // Open cue: anchor from an injected anchorFor, else the last-seen nearest position; else UNKNOWN.
    stats.openAnchorUnknown = false;
    if (isOpen && openNpc) {
      const a = (anchorFor && anchorFor(openNpc)) || lastSeen.get(openNpc) || (validNear && near.npcId === openNpc ? near : null);
      if (a && finite(a.x) && finite(a.y)) show(open, openNpc, a.x, a.y);
      else { hide(open); stats.openAnchorUnknown = true; }   // fail-closed, never a fabricated position
    } else hide(open);

    stats.approachNpc = approach.npcId; stats.approachVisible = approach.mesh.visible;
    stats.openNpc = open.npcId; stats.openVisible = open.mesh.visible; stats.reduced = reduced;
    stats.reason = (provider ? '' : 'provider-unknown');
    return { ...stats };
  }

  function setReducedMotion(on) { reduced = !!on; return reduced; }           // runtime toggle, no mesh churn
  function retire(reason) {
    hide(approach); hide(open);
    stats.approachVisible = false; stats.openVisible = false; stats.approachNpc = null; stats.openNpc = null; stats.openAnchorUnknown = false;
    stats.reason = reason || 'retired'; return stats.retired;
  }
  function onActorChange(reason) { return retire(reason || 'actor-change'); }  // player teleports -> drop stale cues
  function onSceneChange(reason) { lastSeen.clear(); return retire(reason || 'scene-change'); }

  function dispose() {
    if (disposed) return 0;
    disposed = true;
    for (const cue of [approach, open]) { cue.mesh.visible = false; scene.remove(cue.mesh); if (typeof cue.material.dispose === 'function') cue.material.dispose(); }
    if (typeof ringGeo.dispose === 'function') ringGeo.dispose();
    if (typeof chevGeo.dispose === 'function') chevGeo.dispose();
    lastSeen.clear();
    stats.active = false; stats.reason = 'disposed'; stats.approachVisible = false; stats.openVisible = false;
    return stats.meshes;
  }

  function snapshot() {
    return Object.freeze({ endId: 'CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-ANIMVFX-INTERACTION-CUE-CANDIDATE', ...stats });
  }

  return Object.freeze({ update, setReducedMotion, onActorChange, onSceneChange, dispose, snapshot });
}

export default Object.freeze({ createInteractionCueLifetime });
