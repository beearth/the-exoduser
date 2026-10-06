/* npc-dialogue-preview-2_5d.v2.candidate.mjs — STORY candidate (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-RIFT-QUALITY-NOW-20261007-DIALOGUE-GUARDS-CANDIDATE
 * Common goal: CH1-RIFT-QUALITY-NOW-20261007. Goal doc: docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md.
 * Adds a file (does NOT overwrite the 20261006 preview); originals immutable.
 *
 * Read-only NPC dialogue PREVIEW session model for the 2.5D rift lab (preview:true,
 * commits:false). No option/choose/action/grant/quest/save/ascent. Authoritative
 * interaction consumer remains root tools/map-scene-rift-dialogue.mjs.
 *
 * UNIT1 fixes:
 *  - own-key P2: v1 looked up RESIDENTS[id] / APPROACH_SOURCE[id] with unguarded bracket
 *    access, so id = '__proto__' | 'constructor' | 'toString' resolved to inherited values.
 *    v2 uses an own-key guard (hasOwnProperty before access) everywhere.
 *  - createRiftDialogue snapshot/receiver linkage: observeDialogue() calls the controller's
 *    snapshot AS A METHOD (receiver preserved: sn.call(dialogue)), fully guarded; it treats
 *    scope:'editor-session-only' + trialFlags as SESSION-ONLY and never promotes them to
 *    committed. Controller shape: {nearest,open,choose,close,snapshot} @map-scene-rift-dialogue.mjs:241,
 *    snapshot()@189 → {supported,isOpen,view,scope,trialFlags,...}.
 *
 * UNIT2 guards: getter/inherited/thenable/throw rejected for committed reads (v5 contract);
 *  gift re-accept dup = 0 (committed gift → afterGift, grant:null, reGrant:false, idempotent,
 *  no grant ever); quest kept separate (discovery objective, never quest-complete; gift/quest
 *  flags independent). Real grant/save/chapter-gate are UNIMPLEMENTED → UNKNOWN (root/ITEM/
 *  QUESTNPC owned), not hidden, and not a blanket hold reason for these independent guards.
 *
 * Source values (read, not guessed): resident ids+approach tools/map-scene-rift-residents.mjs:14-17;
 *  range/radius tools/map-scene-rift-dialogue.mjs:9; nodes tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json.
 *  Interact key: E='KeyE' is shield (E-불가 parry); generic interact is R (기본 R). E never bound here;
 *  final NPC bind is a root gate (parameterized, default 'KeyR').
 */

export const NPC_DIALOGUE_PREVIEW_V2_END_ID = 'CH1-RIFT-QUALITY-NOW-20261007-DIALOGUE-GUARDS-CANDIDATE';
export const RIFT_SCENE_ID = 'hell-rift-ch1-ch2';

export const INTERACTION_CONTRACT = Object.freeze({
  rangeWorld: 140, approachRadius: 12, defaultInteractKey: 'KeyR',
  note: 'E(KeyE)=shield; interact key parameterized, default KeyR; final NPC-dialogue bind is a root decision.'
});

const RESIDENTS = Object.freeze({
  'rift-rest-haran':    Object.freeze({ flag: 'rift.haran.met',           firstNode: 'meet', metNode: 'revisit' }),
  'rift-gift-berin':    Object.freeze({ flag: 'rift.berin.giftGiven',     firstNode: 'meet', metNode: 'afterGift',   kind: 'gift' }),
  'rift-request-nessa': Object.freeze({ flag: 'rift.nessa.questAccepted', firstNode: 'meet', metNode: 'afterAccept', kind: 'quest', objective: 'discovery' }),
  'rift-prepare-dorik': Object.freeze({ flag: 'rift.dorik.met',           firstNode: 'meet', metNode: 'revisit' })
});
const APPROACH_SOURCE = Object.freeze({
  'rift-rest-haran':    Object.freeze({ x: 4660, y: 6700 }),
  'rift-gift-berin':    Object.freeze({ x: 5980, y: 5620 }),
  'rift-request-nessa': Object.freeze({ x: 6220, y: 5020 }),
  'rift-prepare-dorik': Object.freeze({ x: 5180, y: 2540 })
});

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const ownGet = (o, k) => (o && hasOwn(o, k) ? o[k] : undefined); // UNIT1 own-key guard
function isPlainObject(v) { if (!v || typeof v !== 'object') return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; }
function looksThenable(v) { const d = Object.getOwnPropertyDescriptor(v, 'then'); if (!d) return false; if (typeof d.get === 'function') return true; return hasOwn(d, 'value') && typeof d.value === 'function'; }
function ownDataIsTrue(o, k) { const d = Object.getOwnPropertyDescriptor(o, k); return !!d && hasOwn(d, 'value') && d.value === true; }
function ownDataValue(o, k) { const d = Object.getOwnPropertyDescriptor(o, k); return d && hasOwn(d, 'value') ? { has: true, value: d.value } : { has: false, value: undefined }; }
function finite(n) { return typeof n === 'number' && Number.isFinite(n); }

/* v5-hardened committed read: receiver preserved, fully guarded, thenable/accessor/inherited rejected. */
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

export function createNpcDialoguePreview(ports = {}) {
  let interactKey = INTERACTION_CONTRACT.defaultInteractKey, range = INTERACTION_CONTRACT.rangeWorld;
  try { if (typeof ports.interactKey === 'string' && ports.interactKey) interactKey = ports.interactKey; } catch (_) {}
  try { if (finite(ports.rangeWorld) && ports.rangeWorld > 0) range = ports.rangeWorld; } catch (_) {}

  let residentId = null, phase = 'idle', nodeRef = null, closeReason = null;

  function anchorOf(id) {
    try { const a = ports && ports.anchors; if (typeof a === 'function') { const m = a.call(ports); if (isPlainObject(m)) { const e = ownDataValue(m, id); if (e.has && isPlainObject(e.value) && finite(e.value.x) && finite(e.value.y)) return { x: e.value.x, y: e.value.y }; } } } catch (_) {}
    const src = ownGet(APPROACH_SOURCE, id); // UNIT1: own-key guarded (no __proto__/constructor leak)
    return src ? { x: src.x, y: src.y } : null;
  }
  function selectNode(id) {
    const def = ownGet(RESIDENTS, id); // UNIT1: own-key guarded
    if (!def) return { npcId: id, nodeRef: null, committed: false, stateKnown: false, providersUnknown: ['unknown-resident'] };
    const { flags, unknown } = readCommitted(ports);
    const committed = committedTrue(flags, def.flag);
    return { npcId: id, nodeRef: committed ? def.metNode : def.firstNode, committed, kind: def.kind || null, objective: def.objective || null, stateKnown: unknown.length === 0, providersUnknown: unknown };
  }
  function reachable(player) {
    if (!residentId || !isPlainObject(player) || !finite(player.x) || !finite(player.y)) return { ok: false, reason: 'no-player-or-resident' };
    const a = anchorOf(residentId); if (!a) return { ok: false, reason: 'anchor-unknown' };
    const d = Math.hypot(player.x - a.x, player.y - a.y);
    return { ok: d <= range, distance: d, reason: d <= range ? null : 'out-of-range' };
  }

  function setResident(id) {
    if (!hasOwn(RESIDENTS, id)) return { ok: false, reason: 'unknown-resident', snapshot: snapshot() };
    if (id !== residentId) { if (phase === 'open') closeReason = 'resident-changed'; residentId = id; phase = 'idle'; nodeRef = null; }
    return { ok: true, snapshot: snapshot() };
  }
  function updateProximity(player) {
    const r = reachable(player);
    if (!r.ok) { if (phase === 'open') { nodeRef = null; closeReason = r.reason || 'out-of-range'; } phase = 'idle'; }
    else if (phase === 'idle') phase = 'approachable';
    return snapshot();
  }
  function requestInteract(key, player) {
    if (key !== interactKey) return { opened: false, reason: 'wrong-key', preview: true, snapshot: snapshot() };
    const r = reachable(player);
    if (!r.ok) { if (phase === 'open') { phase = 'idle'; nodeRef = null; closeReason = r.reason; } return { opened: false, reason: r.reason || 'out-of-range', preview: true, snapshot: snapshot() }; }
    const sel = selectNode(residentId);
    phase = 'open'; nodeRef = sel.nodeRef; closeReason = null;
    // UNIT2: preview NEVER grants; a committed gift just shows afterGift again (reGrant:false, dup 0).
    return Object.freeze({
      opened: true, preview: true, commits: false, grant: null, reGrant: false,
      npcId: residentId, nodeRef, committed: sel.committed, kind: sel.kind, objective: sel.objective,
      stateKnown: sel.stateKnown, providersUnknown: sel.providersUnknown, snapshot: snapshot()
    });
  }
  function close(reason) { closeReason = typeof reason === 'string' && reason ? reason : 'manual'; phase = 'idle'; nodeRef = null; return snapshot(); }

  /* UNIT1: observe a createRiftDialogue controller read-only; receiver preserved; session never promoted. */
  function observeDialogue() {
    try {
      const d = ports && ports.dialogue; if (!d) return { linked: false, reason: 'no-dialogue', committedPromoted: false };
      const sn = d.snapshot; if (typeof sn !== 'function') return { linked: false, reason: 'no-snapshot', committedPromoted: false };
      const s = sn.call(d); // receiver preserved
      if (!isPlainObject(s)) return { linked: false, reason: 'snapshot-nonplain', committedPromoted: false };
      const scope = ownDataValue(s, 'scope').value;
      const sessionOnly = scope === 'editor-session-only'; // snapshot()@192
      const viewV = ownDataValue(s, 'view'); const viewNpcId = viewV.has && isPlainObject(viewV.value) ? ownDataValue(viewV.value, 'npcId').value : null;
      return Object.freeze({
        linked: true, sessionOnly, scope: scope ?? null,
        isOpen: ownDataValue(s, 'isOpen').value === true,
        supported: ownDataValue(s, 'supported').value === true,
        viewNpcId: typeof viewNpcId === 'string' ? viewNpcId : null,
        committedPromoted: false, // trialFlags are SESSION-ONLY; never read as committed here
        note: sessionOnly ? 'dialogue snapshot is editor-session-only; not committed/grant/quest' : 'scope unknown'
      });
    } catch (_) { return { linked: false, reason: 'snapshot-threw', committedPromoted: false }; }
  }

  function snapshot() { return Object.freeze({ sceneId: RIFT_SCENE_ID, residentId, phase, nodeRef, closeReason, preview: true, commits: false, interactKey, rangeWorld: range }); }
  function describeContract() {
    return {
      endId: NPC_DIALOGUE_PREVIEW_V2_END_ID, sceneId: RIFT_SCENE_ID, residents: Object.keys(RESIDENTS),
      approachSource: APPROACH_SOURCE, interaction: INTERACTION_CONTRACT,
      authoritativeConsumer: 'root tools/map-scene-rift-dialogue.mjs {nearest,open,choose,close,snapshot}@241 (option/grant); this is preview-only',
      unknownProviders: ['readState(committed flags)', 'anchors(scene-derived; default source)', 'interactKey NPC bind (root; E=shield conflict)', 'grant/save/chapter-gate (root/ITEM/QUESTNPC, UNIMPLEMENTED)'],
      boundaries: 'own-key guarded lookups; preview never grants/re-grants/quest-completes/commits; gift dup 0; quest separate (discovery); dialogue snapshot session-only, receiver preserved, never promoted; no QUESTNPC/save/public edits.'
    };
  }

  return Object.freeze({ setResident, updateProximity, requestInteract, close, selectNode, observeDialogue, snapshot, describeContract });
}
