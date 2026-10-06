/* rift-persistent-actions.candidate.mjs — STORY candidate (not production-adopted)
 *
 * Bridges the four session-only rift residents (root tools/map-scene-rift-dialogue.mjs,
 * end STORY-CH1A-RIFT-DIALOGUE-CANDIDATE-20261006) to REAL reward / quest / hub-visit
 * persistence through INJECTED ports. This module owns no storage, no DOM, no input,
 * no timer, no game/app access and never resolves item ids or writes a save itself.
 *
 * Hard invariants:
 *  - A persistent flag is committed ONLY when the real grant returned true AND the
 *    commit port reported a durable success. Bag-full, decline, missing/failing
 *    consumer, and commit failure never set a flag.
 *  - One-time receipt: a committed gift/quest/visit record is never re-granted.
 *  - Discovery != rescue: the quest path only registers the optional "find Lin"
 *    objective and sets rift.nessa.questAccepted; it has no rescue/complete outcome.
 *  - Raw node/option/action/flag values and existing NPC names are read, never mutated.
 *  - Partial grant / commit-failure / dedup TOCTOU hazards are surfaced as
 *    requiresRootDecision; they are NOT auto-resolved and NOT hidden.
 *
 * Non-existent consumers stay unconnected: if a required port is absent the factory
 * returns null, and quest registration with no questRegister port yields
 * 'quest-consumer-unconnected' (never a faked success).
 */

export const RIFT_PERSISTENT_END_ID = 'STORY-CH1A-RIFT-PERSISTENT-ACTIONS-CANDIDATE-20261006';
export const RIFT_PERSISTENT_SCENE_ID = 'hell-rift-ch1-ch2';
export const RIFT_PERSISTENT_RECORD_V = 1;

/* Stable contract mirroring root DEFINITIONS (map-scene-rift-dialogue.mjs:13-18) and the
 * owned raw (rift-dialogue.json). Single source of truth stays the raw; these are the
 * frozen stable ids this adapter keys on. */
const RESIDENTS = Object.freeze({
  'rift-rest-haran':    { role: 'arrival-guide',   flag: 'rift.haran.met',          kind: 'meeting' },
  'rift-gift-berin':    { role: 'gift-giver',      flag: 'rift.berin.giftGiven',    kind: 'gift',  ref: 'story.berin.keepsake' },
  'rift-request-nessa': { role: 'rescue-request',  flag: 'rift.nessa.questAccepted', kind: 'quest', ref: 'story.nessa.findLin' },
  'rift-prepare-dorik': { role: 'departure-guide', flag: 'rift.dorik.met',          kind: 'meeting' }
});
const MEETING_FLAGS = Object.freeze(['rift.haran.met', 'rift.dorik.met']);
const VISIT_REF = 'hub.hell-rift-ch1-ch2.visit';

/* Where each injected port is wired by the REAL consumer (data only; this module wires nothing). */
export const RIFT_PORT_WIRING = Object.freeze({
  grantItem: 'ITEM rift-gift-adapter.mjs (NOT YET PRESENT -> unconnected). Must wrap game.html pickupItem(item) @game.html:15702: returns true on grant, false on bag-full (pops the item, notifies 가방에 공간이 없습니다!). This adapter passes giftRef only; item-id/stat resolution is owned by ITEM, never here.',
  questRegister: 'QUESTNPC rift-npc.mjs (NOT YET PRESENT -> unconnected). Registers the optional-objective questRef. Must never mark rescue complete; discovery != rescue.',
  commit: 'root production save (e.g. dbSaveForce / active save-slot write) wired in game.html runtime, NOT in this module. Receives a stable record + flag delta and must persist them atomically; returns true only on durable commit.',
  readState: 'root production save read -> { flags:{<flagKey>:bool}, ledger:{<recordId>:{committed,granted,...}} }. Reflects committed state only; trial/session flags are excluded.'
});

/* Conditions this candidate does NOT verify and that root must decide before adoption. */
export const RIFT_ROOT_DECISIONS = Object.freeze([
  'ATOMICITY: readState->grantItem->commit is not atomic here. Without a save transaction owned by root, a concurrent save or crash between grant and commit can duplicate or lose the gift. This adapter checks the committed ledger before granting but cannot close the TOCTOU window itself.',
  'PARTIAL-GRANT: if grantItem returns true but commit fails, the item exists in the bag while the flag is NOT persisted -> on reload Berin re-offers (duplicate) unless root reconciles. This adapter returns outcome="commit-failed-after-grant" + requiresRootDecision and refuses to set the flag or to auto-revoke (no app access).',
  'GRANT-DURABILITY: whether pickupItem alone is durable, or whether the item write and the flag must be committed in one save transaction, is a root/ITEM decision. This adapter assumes they are separate and surfaces the gap.',
  'QUEST-CONSUMER: no QUESTNPC consumer exists; quest.accept stays unconnected until rift-npc.mjs is provided. No rescue state is defined anywhere here.'
]);

function isFn(v) { return typeof v === 'function'; }
function resident(npcId) { return Object.hasOwn(RESIDENTS, npcId) ? RESIDENTS[npcId] : null; }
export function recordId(kind, ref, npcId) { return `rift:${kind}:${ref}:${npcId}`; }

function safeState(ports) {
  try {
    const s = ports.readState();
    const flags = s && typeof s.flags === 'object' && s.flags ? s.flags : {};
    const ledger = s && typeof s.ledger === 'object' && s.ledger ? s.ledger : {};
    return { flags, ledger };
  } catch (_) { return { flags: {}, ledger: {} }; }
}
function committedRecord(ledger, id) {
  const r = ledger[id];
  return r && r.committed === true ? r : null;
}
function makeRecord(kind, ref, npcId, flag, granted) {
  return { v: RIFT_PERSISTENT_RECORD_V, recordId: recordId(kind, ref, npcId), sceneId: RIFT_PERSISTENT_SCENE_ID, kind, ref, npcId, flag, granted, committed: false };
}

/**
 * ports: { grantItem(ref)->bool, commit(record,{setFlag})->bool, readState()->{flags,ledger}, questRegister?(ref)->bool }
 * Returns a frozen controller or null when a required port is missing / not a function.
 */
export function createRiftPersistentActions(ports) {
  if (!ports || !isFn(ports.grantItem) || !isFn(ports.commit) || !isFn(ports.readState)) return null;
  const hasQuestRegister = isFn(ports.questRegister);

  function commitRecord(record, flag) {
    // Flag is only ever committed through here, bundled with its record, by the root port.
    let committed = false;
    try { committed = ports.commit({ ...record, committed: undefined }, { setFlag: flag }) === true; }
    catch (_) { committed = false; }
    return committed;
  }

  function applyGiftAccept(npcId = 'rift-gift-berin') {
    const def = resident(npcId);
    if (!def || def.kind !== 'gift') return { outcome: 'not-applicable', flagsCommitted: false };
    const id = recordId('gift', def.ref, npcId);
    const { ledger } = safeState(ports);
    if (committedRecord(ledger, id)) return { outcome: 'already-granted', ref: def.ref, flag: def.flag, granted: false, committed: true, flagsCommitted: true, record: ledger[id] };

    let granted = false;
    try { granted = ports.grantItem(def.ref) === true; } catch (_) { granted = false; }
    if (!granted) {
      // Bag full (pickupItem false -> item popped) or resolver rejected. Recoverable, no flag.
      return { outcome: 'bag-full', ref: def.ref, flag: def.flag, granted: false, committed: false, flagsCommitted: false, recoverable: true };
    }
    const record = makeRecord('gift', def.ref, npcId, def.flag, true);
    const committed = commitRecord(record, def.flag);
    if (!committed) {
      return {
        outcome: 'commit-failed-after-grant', ref: def.ref, flag: def.flag, granted: true, committed: false,
        flagsCommitted: false, requiresRootDecision: true, hazard: 'partial-grant',
        note: 'Item granted but flag not persisted; do not set flag, do not auto-revoke. Root must reconcile (atomic item+flag, or revoke before retry).'
      };
    }
    return { outcome: 'granted', ref: def.ref, flag: def.flag, granted: true, committed: true, flagsCommitted: true, record: { ...record, committed: true } };
  }

  function applyQuestAccept(npcId = 'rift-request-nessa') {
    const def = resident(npcId);
    if (!def || def.kind !== 'quest') return { outcome: 'not-applicable', flagsCommitted: false };
    const id = recordId('quest', def.ref, npcId);
    const { ledger } = safeState(ports);
    if (committedRecord(ledger, id)) return { outcome: 'already-accepted', ref: def.ref, flag: def.flag, committed: true, flagsCommitted: true, objective: 'discovery', record: ledger[id] };

    if (!hasQuestRegister) {
      // No QUESTNPC consumer -> stay unconnected, never fake success, never set flag.
      return { outcome: 'quest-consumer-unconnected', ref: def.ref, flag: def.flag, committed: false, flagsCommitted: false, requiresRootDecision: true };
    }
    let registered = false;
    try { registered = ports.questRegister(def.ref) === true; } catch (_) { registered = false; }
    if (!registered) return { outcome: 'quest-register-failed', ref: def.ref, flag: def.flag, committed: false, flagsCommitted: false, recoverable: true };

    const record = makeRecord('quest', def.ref, npcId, def.flag, true);
    const committed = commitRecord(record, def.flag);
    if (!committed) {
      return {
        outcome: 'commit-failed-after-register', ref: def.ref, flag: def.flag, committed: false, flagsCommitted: false,
        requiresRootDecision: true, hazard: 'partial-quest',
        note: 'Objective registered but flag not persisted; root must reconcile. Discovery-only objective, never a rescue.'
      };
    }
    // objective:'discovery' is explicit — accepting the request is looking-for, not rescue-complete.
    return { outcome: 'accepted', ref: def.ref, flag: def.flag, committed: true, flagsCommitted: true, objective: 'discovery', record: { ...record, committed: true } };
  }

  function applyDecline(npcId) {
    const def = resident(npcId);
    if (!def || (def.kind !== 'gift' && def.kind !== 'quest')) return { outcome: 'not-applicable', flagsCommitted: false };
    // Pure no-op on persistent state; keeps the resident revisitable.
    return { outcome: 'declined', npcId, kind: def.kind, granted: false, committed: false, flagsCommitted: false };
  }

  function applyClose(npcId, flagKeys = []) {
    const def = resident(npcId);
    if (!def) return { outcome: 'not-applicable', flagsCommitted: false };
    // Only meeting NPCs may persist a flag on close; reward flags never travel this path.
    const requested = Array.isArray(flagKeys) ? flagKeys : [];
    const allowed = requested.filter(k => k === def.flag && def.kind === 'meeting' && MEETING_FLAGS.includes(k));
    if (!allowed.length) return { outcome: 'closed', npcId, flagsCommitted: false };
    const { flags } = safeState(ports);
    if (flags[def.flag] === true) return { outcome: 'closed', npcId, flag: def.flag, flagsCommitted: true };
    const record = makeRecord('meeting', def.flag, npcId, def.flag, true);
    const committed = commitRecord(record, def.flag);
    return committed
      ? { outcome: 'closed', npcId, flag: def.flag, flagsCommitted: true, record: { ...record, committed: true } }
      : { outcome: 'close-commit-failed', npcId, flag: def.flag, flagsCommitted: false, recoverable: true };
  }

  function recordVisit() {
    const id = recordId('visit', VISIT_REF, RIFT_PERSISTENT_SCENE_ID);
    const { ledger } = safeState(ports);
    if (committedRecord(ledger, id)) return { outcome: 'already-recorded', ref: VISIT_REF, committed: true, record: ledger[id] };
    const record = { v: RIFT_PERSISTENT_RECORD_V, recordId: id, sceneId: RIFT_PERSISTENT_SCENE_ID, kind: 'visit', ref: VISIT_REF, committed: false };
    let committed = false;
    try { committed = ports.commit({ ...record, committed: undefined }, { setFlag: null }) === true; } catch (_) { committed = false; }
    // Idempotent hub visit; grants nothing (no free reward).
    return committed
      ? { outcome: 'recorded', ref: VISIT_REF, committed: true, record: { ...record, committed: true } }
      : { outcome: 'visit-commit-failed', ref: VISIT_REF, committed: false, recoverable: true };
  }

  /** Pure revisit resolver: mirrors root entryNode() using COMMITTED flags only.
   *  raw = the validated dialogue candidate (rift-dialogue.json); read, never mutated. */
  function resolveEntryNode(npcId, raw) {
    const def = resident(npcId);
    if (!def || !raw || !Array.isArray(raw.npcs)) return null;
    const npc = raw.npcs.find(n => n && n.npcId === npcId);
    if (!npc || !Array.isArray(npc.entry) || !npc.entry.length) return null;
    const { flags } = safeState(ports);
    for (const e of npc.entry) {
      if (e && Object.hasOwn(e, 'default')) return e.default;
      if (e && e.when === def.flag && flags[def.flag] === true && e.node) return e.node;
    }
    const last = npc.entry[npc.entry.length - 1];
    return last && last.default ? last.default : null;
  }

  function describeContract() {
    return {
      endId: RIFT_PERSISTENT_END_ID, sceneId: RIFT_PERSISTENT_SCENE_ID, recordVersion: RIFT_PERSISTENT_RECORD_V,
      residents: JSON.parse(JSON.stringify(RESIDENTS)), visitRef: VISIT_REF,
      portWiring: RIFT_PORT_WIRING, rootDecisions: [...RIFT_ROOT_DECISIONS], questConnected: hasQuestRegister
    };
  }

  return Object.freeze({ applyGiftAccept, applyQuestAccept, applyDecline, applyClose, recordVisit, resolveEntryNode, describeContract });
}
