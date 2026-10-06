/* npc-dialogue-preview-2_5d.candidate.mjs — STORY candidate (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-STORY-NPC-DIALOGUE-PREVIEW-CANDIDATE
 * Common goal: CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006. Goal doc: docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md (STORY row).
 *
 * A READ-ONLY NPC dialogue PREVIEW session model for the 2.5D rift lab. It never chooses
 * options, grants items, completes quests, writes save, or advances the main-game ascent —
 * every open is preview-only (preview:true, commits:false). The authoritative interaction
 * consumer with option/action/grant stays root tools/map-scene-rift-dialogue.mjs; this unit
 * only (1) selects which EXISTING dialogue node to SHOW, and (2) models approach / interact-
 * request / out-of-range-close / resident-id-change for the lab.
 *
 * Source values (read, not guessed):
 *  - resident ids + approach anchors: tools/map-scene-rift-residents.mjs:14-17 (BODIES)
 *    haran rift-rest-haran (4660,6700); berin rift-gift-berin (5980,5620);
 *    nessa rift-request-nessa (6220,5020); dorik rift-prepare-dorik (5180,2540).
 *  - range/radius: tools/map-scene-rift-dialogue.mjs:9 RIFT_DIALOGUE_LIMITS range=140, radius=12.
 *  - dialogue nodes: tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json (meet / revisit / afterGift / afterAccept).
 *  - hardened read contract reused from rift-ascent-conditions-2_5d.v5.candidate.mjs.
 *
 * INTERACT-KEY CONFLICT (reported to root, NOT resolved here): the task names "E요청", but
 * source binds E to the shield (BINDS.shield='KeyE', CHANGELOG_SYNC:2537/4228) and E is
 * reserved non-parry (Q-only magic/blackBean). The documented generic interaction key is R
 * (기본 R, CHANGELOG_SYNC:49266). There is no NPC-dialogue-specific key in source. So the
 * interact key is parameterized (default 'KeyR'); E is never bound here. Root must confirm
 * the final NPC-dialogue bind; binding E would collide with the shield — root gate.
 */

export const NPC_DIALOGUE_PREVIEW_END_ID = 'CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-STORY-NPC-DIALOGUE-PREVIEW-CANDIDATE';
export const RIFT_SCENE_ID = 'hell-rift-ch1-ch2';

export const INTERACTION_CONTRACT = Object.freeze({
  rangeWorld: 140,       // map-scene-rift-dialogue.mjs:9 RIFT_DIALOGUE_LIMITS.range
  approachRadius: 12,    // RIFT_DIALOGUE_LIMITS.radius
  defaultInteractKey: 'KeyR', // 기존 상호작용 키(기본 R); E='KeyE' is shield -> not bound here
  note: 'E(KeyE)=shield; interact key parameterized, default KeyR; final NPC-dialogue bind is a root decision.'
});

/* resident id -> {flag, firstNode, metNode} from raw; approach anchors from residents module. */
const RESIDENTS = Object.freeze({
  'rift-rest-haran':    Object.freeze({ flag: 'rift.haran.met',           firstNode: 'meet', metNode: 'revisit' }),
  'rift-gift-berin':    Object.freeze({ flag: 'rift.berin.giftGiven',     firstNode: 'meet', metNode: 'afterGift' }),
  'rift-request-nessa': Object.freeze({ flag: 'rift.nessa.questAccepted', firstNode: 'meet', metNode: 'afterAccept' }),
  'rift-prepare-dorik': Object.freeze({ flag: 'rift.dorik.met',           firstNode: 'meet', metNode: 'revisit' })
});
const APPROACH_SOURCE = Object.freeze({
  'rift-rest-haran':    Object.freeze({ x: 4660, y: 6700 }),
  'rift-gift-berin':    Object.freeze({ x: 5980, y: 5620 }),
  'rift-request-nessa': Object.freeze({ x: 6220, y: 5020 }),
  'rift-prepare-dorik': Object.freeze({ x: 5180, y: 2540 })
});

function isPlainObject(v) { if (!v || typeof v !== 'object') return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; }
function looksThenable(v) { const d = Object.getOwnPropertyDescriptor(v, 'then'); if (!d) return false; if (typeof d.get === 'function') return true; return Object.prototype.hasOwnProperty.call(d, 'value') && typeof d.value === 'function'; }
function ownDataIsTrue(o, k) { const d = Object.getOwnPropertyDescriptor(o, k); return !!d && Object.prototype.hasOwnProperty.call(d, 'value') && d.value === true; }
function ownDataValue(o, k) { const d = Object.getOwnPropertyDescriptor(o, k); return d && Object.prototype.hasOwnProperty.call(d, 'value') ? { has: true, value: d.value } : { has: false, value: undefined }; }

/* Hardened committed read (v5 contract): receiver preserved, fully guarded, thenable/accessor rejected. */
function readCommitted(ports) {
  try {
    const rs = ports && ports.readState;
    if (typeof rs !== 'function') return { flags: {}, unknown: ['readState-missing'] };
    const s = rs.call(ports);
    if (!isPlainObject(s)) return { flags: {}, unknown: ['readState-null-or-nonplain'] };
    if (looksThenable(s)) return { flags: {}, unknown: ['readState-async-thenable'] };
    const sc = ownDataValue(s, 'scope');
    if (sc.has && sc.value === 'editor-session-only') return { flags: {}, unknown: ['readState-session-preview'] };
    if (!ownDataIsTrue(s, 'committed')) return { flags: {}, unknown: ['readState-uncommitted'] };
    const fd = ownDataValue(s, 'flags');
    if (!fd.has || !isPlainObject(fd.value)) return { flags: {}, unknown: ['readState-flags-malformed'] };
    return { flags: fd.value, unknown: [] };
  } catch (_) { return { flags: {}, unknown: ['readState-threw'] }; }
}
function committedTrue(flags, key) { try { return ownDataIsTrue(flags, key); } catch (_) { return false; } }
function finite(n) { return typeof n === 'number' && Number.isFinite(n); }

/**
 * ports: { readState?()->{committed:true,flags:{...}}, anchors?()->{<npcId>:{x,y}}, interactKey?:string,
 *          rangeWorld?:number, approachRadius?:number }. All optional; absent → source defaults / UNKNOWN.
 * Pure session model, no rendering/mutation/grant/quest/save. Preview only.
 */
export function createNpcDialoguePreview(ports = {}) {
  let interactKey = INTERACTION_CONTRACT.defaultInteractKey;
  let range = INTERACTION_CONTRACT.rangeWorld;
  try { if (typeof ports.interactKey === 'string' && ports.interactKey) interactKey = ports.interactKey; } catch (_) {}
  try { if (finite(ports.rangeWorld) && ports.rangeWorld > 0) range = ports.rangeWorld; } catch (_) {}

  let residentId = null, phase = 'idle', nodeRef = null, closeReason = null;

  function anchorOf(id) {
    try { const a = ports && ports.anchors; if (typeof a === 'function') { const m = a.call(ports); if (isPlainObject(m)) { const e = ownDataValue(m, id); if (e.has && isPlainObject(e.value) && finite(e.value.x) && finite(e.value.y)) return { x: e.value.x, y: e.value.y }; } } } catch (_) {}
    return APPROACH_SOURCE[id] || null; // source-documented default (not guessed)
  }
  /** (1) read-only node selection: committed flag -> metNode, else firstNode. Never mutates/grants. */
  function selectNode(id) {
    const def = RESIDENTS[id]; if (!def) return { npcId: id, nodeRef: null, stateKnown: false, providersUnknown: ['unknown-resident'] };
    const { flags, unknown } = readCommitted(ports);
    const committed = committedTrue(flags, def.flag);
    return { npcId: id, nodeRef: committed ? def.metNode : def.firstNode, committed, stateKnown: unknown.length === 0, providersUnknown: unknown };
  }
  function reachable(player) {
    if (!residentId || !isPlainObject(player) || !finite(player.x) || !finite(player.y)) return { ok: false, reason: 'no-player-or-resident' };
    const a = anchorOf(residentId); if (!a) return { ok: false, reason: 'anchor-unknown' };
    const d = Math.hypot(player.x - a.x, player.y - a.y);
    return { ok: d <= range, distance: d, reason: d <= range ? null : 'out-of-range' };
  }

  function setResident(id) {
    if (!Object.prototype.hasOwnProperty.call(RESIDENTS, id)) return { ok: false, reason: 'unknown-resident', snapshot: snapshot() };
    if (id !== residentId) { if (phase === 'open') closeReason = 'resident-changed'; residentId = id; phase = 'idle'; nodeRef = null; } // id change closes/reset
    return { ok: true, snapshot: snapshot() };
  }
  function updateProximity(player) {
    const r = reachable(player);
    if (!r.ok) { if (phase === 'open') { phase = 'approachable'; closeReason = r.reason || 'out-of-range'; nodeRef = null; phase = 'idle'; } else phase = residentId ? 'idle' : 'idle'; }
    else if (phase === 'idle') phase = 'approachable';
    return snapshot();
  }
  /** (2) interact request: opens preview node only when key matches and within range. */
  function requestInteract(key, player) {
    if (key !== interactKey) return { opened: false, reason: 'wrong-key', preview: true, snapshot: snapshot() };
    const r = reachable(player);
    if (!r.ok) { if (phase === 'open') { phase = 'idle'; nodeRef = null; closeReason = r.reason; } return { opened: false, reason: r.reason || 'out-of-range', preview: true, snapshot: snapshot() }; }
    const sel = selectNode(residentId);
    phase = 'open'; nodeRef = sel.nodeRef; closeReason = null;
    return { opened: true, preview: true, commits: false, grant: null, npcId: residentId, nodeRef, stateKnown: sel.stateKnown, providersUnknown: sel.providersUnknown, snapshot: snapshot() };
  }
  function close(reason) {
    closeReason = typeof reason === 'string' && reason ? reason : 'manual';
    phase = residentId ? 'idle' : 'idle'; nodeRef = null;
    return snapshot();
  }
  function snapshot() {
    return Object.freeze({ sceneId: RIFT_SCENE_ID, residentId, phase, nodeRef, closeReason, preview: true, commits: false, interactKey, rangeWorld: range });
  }
  function describeContract() {
    return {
      endId: NPC_DIALOGUE_PREVIEW_END_ID, sceneId: RIFT_SCENE_ID,
      residents: Object.keys(RESIDENTS), approachSource: APPROACH_SOURCE, interaction: INTERACTION_CONTRACT,
      authoritativeConsumer: 'root tools/map-scene-rift-dialogue.mjs (option/choose/action/grant); this is preview-only',
      unknownProviders: ['readState(committed flags)', 'anchors(scene-derived, default source values)', 'interactKey NPC bind (root; E=shield conflict)', 'QUESTNPC/ITEM grant/quest (UNIMPLEMENTED)'],
      boundaries: 'preview never grants/quest-completes/commits/advances ascent; committed flags read-only via v5-hardened contract; no QUESTNPC/save/public edits.'
    };
  }

  return Object.freeze({ setResident, updateProximity, requestInteract, close, selectNode, snapshot, describeContract });
}
