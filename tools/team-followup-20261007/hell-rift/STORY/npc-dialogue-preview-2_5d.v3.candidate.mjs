/* npc-dialogue-preview-2_5d.v3.candidate.mjs — STORY candidate (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-RIFT-QUALITY-NEXT-20261007-DIALOGUE-GUARDS-V3-CANDIDATE
 * Goal: CH1-RIFT-QUALITY-NEXT-20261007. Adds a file (does NOT overwrite v2/20261006); originals immutable.
 *
 * Read-only NPC dialogue PREVIEW session model (preview:true, commits:false). No option/
 * choose/action/grant/quest/save/ascent. Authoritative interaction consumer stays root
 * tools/map-scene-rift-dialogue.mjs {nearest,open,choose,close,snapshot}@241 (not replaced).
 *
 * v3 fixes (root review14 probe):
 *  (1) PROVIDER GETTER EXECUTION: v2 read ports.readState / dialogue.snapshot directly, so an
 *      accessor provider's getter RAN just to fetch the function. v3 acquires provider
 *      functions via an OWN DATA descriptor only (accessor → not executed → UNKNOWN), then
 *      invokes with receiver preserved (fn.call(owner)). Prototype-chain/method providers that
 *      are not own data properties are treated as UNKNOWN — root gate: expose providers as own
 *      data functions.
 *  (2) THENABLE FLAGS: v2 rejected a thenable STATE but a plain-object `flags` carrying an own
 *      `then` ({then(){}, 'rift.berin.giftGiven':true}) passed and was read as committed. v3
 *      rejects a thenable flags map → UNKNOWN. State/flags that are not validated plain objects
 *      stay UNKNOWN; getter/inherited/accessor/throw never read as commit data; no stateKnown/meet
 *      false-positive.
 *
 * Kept: own-key guard (no __proto__/constructor leak); session(editor-session-only) vs committed
 * separation; gift re-accept dup 0 (grant:null,reGrant:false); quest separate (discovery, per-flag);
 * grant/save/chapter-gate UNIMPLEMENTED → UNKNOWN (root/ITEM/QUESTNPC), not hidden.
 *
 * Source (read, not guessed): resident ids+approach tools/map-scene-rift-residents.mjs:14-17;
 *  range/radius tools/map-scene-rift-dialogue.mjs:9; controller+snapshot @241/@189; nodes
 *  tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json. Interact key: E='KeyE' shield
 *  (E-패링0); generic R; E never bound here; final NPC bind = root gate (default 'KeyR').
 */

export const NPC_DIALOGUE_PREVIEW_V3_END_ID = 'CH1-RIFT-QUALITY-NEXT-20261007-DIALOGUE-GUARDS-V3-CANDIDATE';
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
const ownGet = (o, k) => (o && hasOwn(o, k) ? o[k] : undefined);
/* (1) own DATA function only; accessor → null (getter NOT executed). Never throws. */
function ownFn(obj, key) { try { if (!obj) return null; const d = Object.getOwnPropertyDescriptor(obj, key); return d && hasOwn(d, 'value') && typeof d.value === 'function' ? d.value : null; } catch (_) { return null; } }
function isPlainObject(v) { if (!v || typeof v !== 'object') return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; }
function looksThenable(v) { const d = Object.getOwnPropertyDescriptor(v, 'then'); if (!d) return false; if (typeof d.get === 'function') return true; return hasOwn(d, 'value') && typeof d.value === 'function'; }
function ownDataIsTrue(o, k) { const d = Object.getOwnPropertyDescriptor(o, k); return !!d && hasOwn(d, 'value') && d.value === true; }
function ownDataValue(o, k) { const d = Object.getOwnPropertyDescriptor(o, k); return d && hasOwn(d, 'value') ? { has: true, value: d.value } : { has: false, value: undefined }; }
function finite(n) { return typeof n === 'number' && Number.isFinite(n); }

/* committed read: provider via own data fn (no getter run), receiver preserved, fully guarded,
 * state & flags must be validated plain objects, thenable state AND thenable flags rejected. */
function readCommitted(ports) {
  try {
    const rs = ownFn(ports, 'readState');
    if (!rs) return { flags: {}, unknown: ['readState-missing-or-accessor'] };
    const s = rs.call(ports);
    if (!isPlainObject(s)) return { flags: {}, unknown: ['readState-null-or-nonplain'] };
    if (looksThenable(s)) return { flags: {}, unknown: ['readState-async-thenable'] };
    const sc = ownDataValue(s, 'scope');
    if (sc.has && sc.value === 'editor-session-only') return { flags: {}, unknown: ['readState-session-preview'] };
    if (!ownDataIsTrue(s, 'committed')) return { flags: {}, unknown: ['readState-uncommitted'] };
    const fd = ownDataValue(s, 'flags');
    if (!fd.has || !isPlainObject(fd.value)) return { flags: {}, unknown: ['readState-flags-malformed'] };
    if (looksThenable(fd.value)) return { flags: {}, unknown: ['readState-flags-thenable'] }; // (2)
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
    try { const a = ownFn(ports, 'anchors'); if (a) { const m = a.call(ports); if (isPlainObject(m)) { const e = ownDataValue(m, id); if (e.has && isPlainObject(e.value) && finite(e.value.x) && finite(e.value.y)) return { x: e.value.x, y: e.value.y }; } } } catch (_) {}
    const src = ownGet(APPROACH_SOURCE, id);
    return src ? { x: src.x, y: src.y } : null;
  }
  function selectNode(id) {
    const def = ownGet(RESIDENTS, id);
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
    return Object.freeze({ opened: true, preview: true, commits: false, grant: null, reGrant: false, npcId: residentId, nodeRef, committed: sel.committed, kind: sel.kind, objective: sel.objective, stateKnown: sel.stateKnown, providersUnknown: sel.providersUnknown, snapshot: snapshot() });
  }
  function close(reason) { closeReason = typeof reason === 'string' && reason ? reason : 'manual'; phase = 'idle'; nodeRef = null; return snapshot(); }

  /* observe createRiftDialogue read-only; snapshot fn via own data descriptor (no getter run),
   * receiver preserved; session(editor-session-only)/trialFlags never promoted to committed. */
  function observeDialogue() {
    try {
      const d = ownGet(ports, 'dialogue'); if (!d) return { linked: false, reason: 'no-dialogue', committedPromoted: false };
      const sn = ownFn(d, 'snapshot'); if (!sn) return { linked: false, reason: 'no-snapshot-or-accessor', committedPromoted: false };
      const s = sn.call(d);
      if (!isPlainObject(s)) return { linked: false, reason: 'snapshot-nonplain', committedPromoted: false };
      const scope = ownDataValue(s, 'scope').value, sessionOnly = scope === 'editor-session-only';
      const viewV = ownDataValue(s, 'view'); const viewNpcId = viewV.has && isPlainObject(viewV.value) ? ownDataValue(viewV.value, 'npcId').value : null;
      return Object.freeze({ linked: true, sessionOnly, scope: scope ?? null, isOpen: ownDataValue(s, 'isOpen').value === true, supported: ownDataValue(s, 'supported').value === true, viewNpcId: typeof viewNpcId === 'string' ? viewNpcId : null, committedPromoted: false, note: sessionOnly ? 'dialogue snapshot editor-session-only; not committed/grant/quest' : 'scope unknown' });
    } catch (_) { return { linked: false, reason: 'snapshot-threw', committedPromoted: false }; }
  }

  function snapshot() { return Object.freeze({ sceneId: RIFT_SCENE_ID, residentId, phase, nodeRef, closeReason, preview: true, commits: false, interactKey, rangeWorld: range }); }
  function describeContract() {
    return {
      endId: NPC_DIALOGUE_PREVIEW_V3_END_ID, sceneId: RIFT_SCENE_ID, residents: Object.keys(RESIDENTS), approachSource: APPROACH_SOURCE, interaction: INTERACTION_CONTRACT,
      authoritativeConsumer: 'root tools/map-scene-rift-dialogue.mjs {nearest,open,choose,close,snapshot}@241 (option/grant); this is preview-only',
      providerContract: 'readState/anchors/dialogue.snapshot acquired via OWN DATA descriptor (accessor NOT executed → UNKNOWN); invoked with receiver preserved',
      unknownProviders: ['readState(own data fn; committed flags)', 'anchors(own data fn; default source)', 'interactKey NPC bind (root; E=shield)', 'grant/save/chapter-gate (root/ITEM/QUESTNPC, UNIMPLEMENTED)'],
      boundaries: 'own-key guard; provider accessor never executed; thenable state AND thenable flags rejected; preview never grants/re-grants/quest-completes/commits; gift dup 0; quest separate; dialogue snapshot session-only, never promoted.'
    };
  }
  return Object.freeze({ setResident, updateProximity, requestInteract, close, selectNode, observeDialogue, snapshot, describeContract });
}
