/* rift-persistent-actions.candidate.mjs — STORY candidate (not production-adopted)
 * Base: STORY-CH1A-RIFT-PERSISTENT-ACTIONS-CANDIDATE-20261006
 * Revision: ROOTRESIDENT-ROLE-FOLLOWUP-20261006 (fail-closed atomic contract)
 *
 * Bridges the four session-only rift residents (root tools/map-scene-rift-dialogue.mjs,
 * end STORY-CH1A-RIFT-DIALOGUE-CANDIDATE-20261006; 22 nodes / 37 options; trial
 * actualGrant:false) to REAL reward / quest / hub-visit persistence through INJECTED
 * ports. This module owns no storage, no DOM, no input, no timer, no game/app access,
 * resolves no item ids, imports nothing from ITEM/save, and writes no save itself.
 *
 * FAIL-CLOSED CONTRACT (this revision):
 *  - There is NO non-atomic grant path. A real effect (gift grant, quest register,
 *    flag) is only ever performed by a single injected `atomicApply` transaction that
 *    bundles the effect AND its flag and commits them together, owned by root.
 *  - If `atomicApply` is absent, EVERY real effect returns BLOCKED / not-accepted
 *    BEFORE anything is invoked. No grant is attempted without atomicity. (①)
 *  - `atomicApply` is treated as SYNC-confirmed only: a Promise/thenable return is
 *    NEVER read as success — it yields BLOCKED (async-not-confirmable). A grant that
 *    did not commit atomically is reported as a distinct partial/violation cause, and
 *    bag-full is never mixed with success. (②)
 *  - Partial / phantom / missing-port / async are each surfaced as requiresRootDecision;
 *    they are not auto-resolved and not hidden. (③)
 *
 * A persistent flag is observable as committed ONLY when the atomic transaction reports
 * applied:true (and, for gift, granted:true). One-time receipt: a committed ledger
 * record is never re-applied. Discovery != rescue: the quest path only registers the
 * optional "find Lin" objective; it has no rescue/complete outcome. Raw node/option/
 * action/flag values and existing NPC names are read, never mutated.
 */

export const RIFT_PERSISTENT_END_ID = 'STORY-CH1A-RIFT-PERSISTENT-ACTIONS-CANDIDATE-20261006';
export const RIFT_PERSISTENT_REVISION = 'ROOTRESIDENT-ROLE-FOLLOWUP-20261006';
export const RIFT_PERSISTENT_SCENE_ID = 'hell-rift-ch1-ch2';
export const RIFT_PERSISTENT_RECORD_V = 1;

/* Stable contract mirroring root DEFINITIONS (map-scene-rift-dialogue.mjs:13-18) and the
 * owned raw (rift-dialogue.json). Single source of truth stays the raw; these are the
 * frozen stable ids this adapter keys on. */
const RESIDENTS = Object.freeze({
  'rift-rest-haran':    { role: 'arrival-guide',   flag: 'rift.haran.met',           kind: 'meeting' },
  'rift-gift-berin':    { role: 'gift-giver',      flag: 'rift.berin.giftGiven',     kind: 'gift',  ref: 'story.berin.keepsake' },
  'rift-request-nessa': { role: 'rescue-request',  flag: 'rift.nessa.questAccepted', kind: 'quest', ref: 'story.nessa.findLin' },
  'rift-prepare-dorik': { role: 'departure-guide', flag: 'rift.dorik.met',           kind: 'meeting' }
});
const MEETING_FLAGS = Object.freeze(['rift.haran.met', 'rift.dorik.met']);
const VISIT_REF = 'hub.hell-rift-ch1-ch2.visit';

/* Where the injected ports are wired by the REAL consumer (data only; this module wires nothing). */
export const RIFT_PORT_WIRING = Object.freeze({
  readState: 'root production save read -> { flags:{<flagKey>:bool}, ledger:{<recordId>:{committed,granted,...}} }. Committed state only; trial/session flags excluded.',
  atomicApply: 'SINGLE atomic transaction owned by root bundling the effect + its flag in one durable commit. gift -> ITEM rift-gift-adapter.mjs wrapping game.html pickupItem(item)@15702 (false on bag-full, pops item) PLUS the flag write; quest -> QUESTNPC rift-npc.mjs register (discovery only) PLUS the flag; meeting/visit -> flag/record write. MUST return SYNC: a boolean, or { applied:bool, granted?:bool, registered?:bool, reason?:string }. A Promise is rejected (fail-closed). ITEM/QUESTNPC not yet present -> atomicApply unprovided -> all real effects BLOCKED before any grant.'
});

/* Conditions this candidate does NOT verify and that root must decide before adoption. */
export const RIFT_ROOT_DECISIONS = Object.freeze([
  'FAIL-CLOSED: with no atomicApply port, this adapter performs and attempts NOTHING (no grant/register/flag) and returns BLOCKED. Adoption requires root to provide a real atomic transaction.',
  'ATOMICITY OWNED BY PORT: the effect and its flag must commit together inside atomicApply. If the port returns granted:true/applied:false (partial) or applied:true/granted:false (phantom), this adapter sets no flag and returns atomic-contract-violation + requiresRootDecision.',
  'DEDUP TOCTOU: the ledger pre-check here is advisory; the atomic transaction must itself re-check the committed record under its lock to prevent duplicate grants across concurrent saves/crash.',
  'SYNC-ONLY: atomicApply is read synchronously. A thenable return cannot be confirmed durable in this sync adapter and yields BLOCKED(async-not-confirmable); a sync-confirmed port or a separate async adapter is a root decision, out of scope here.',
  'CONSUMERS ABSENT: ITEM rift-gift-adapter.mjs and QUESTNPC rift-npc.mjs do not exist yet; until provided through atomicApply, gift/quest stay unconnected. No rescue state is defined anywhere here.'
]);

function isFn(v) { return typeof v === 'function'; }
function isThenable(v) { return !!v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function'; }
function resident(npcId) { return Object.hasOwn(RESIDENTS, npcId) ? RESIDENTS[npcId] : null; }
export function recordId(kind, ref, npcId) { return `rift:${kind}:${ref}:${npcId}`; }

function safeState(ports) {
  try {
    const s = ports.readState();
    if (isThenable(s)) return { flags: {}, ledger: {} }; // never await committed state in sync path
    const flags = s && typeof s.flags === 'object' && s.flags ? s.flags : {};
    const ledger = s && typeof s.ledger === 'object' && s.ledger ? s.ledger : {};
    return { flags, ledger };
  } catch (_) { return { flags: {}, ledger: {} }; }
}
function committedRecord(ledger, id) {
  const r = ledger[id];
  return r && r.committed === true ? r : null;
}
function makeRecord(kind, ref, npcId, flag) {
  return { v: RIFT_PERSISTENT_RECORD_V, recordId: recordId(kind, ref, npcId), sceneId: RIFT_PERSISTENT_SCENE_ID, kind, ref, npcId, flag };
}

/**
 * ports: { readState()->{flags,ledger}, atomicApply?(record&{op})-> bool | {applied,granted?,registered?,reason?} }
 * Returns a frozen controller or null when readState is missing.
 */
export function createRiftPersistentActions(ports) {
  if (!ports || !isFn(ports.readState)) return null;
  const hasAtomic = isFn(ports.atomicApply);

  // Returns { status, res? } where status in: result | blocked | error | failed.
  // Never invokes anything (fail-closed) when the atomic port is absent.
  function runAtomic(op, record) {
    if (!hasAtomic) return { status: 'blocked', reason: 'no-atomic-port' };
    let res;
    try { res = ports.atomicApply({ ...record, op }); }
    catch (_) { return { status: 'error', reason: 'atomic-threw' }; }
    if (isThenable(res)) return { status: 'blocked', reason: 'async-not-confirmable' };
    if (typeof res === 'boolean') res = { applied: res };
    if (!res || typeof res !== 'object' || Array.isArray(res)) return { status: 'failed', reason: 'bad-result' };
    return { status: 'result', res };
  }
  function blockedOutcome(a, extra) {
    const requiresRootDecision = a.status === 'blocked' || a.status === 'error';
    return { outcome: a.status === 'blocked' ? 'blocked' : a.status === 'error' ? 'atomic-error' : 'atomic-failed',
      reason: a.reason, accepted: false, granted: false, committed: false, flagsCommitted: false, requiresRootDecision, ...extra };
  }

  function applyGiftAccept(npcId = 'rift-gift-berin') {
    const def = resident(npcId);
    if (!def || def.kind !== 'gift') return { outcome: 'not-applicable', flagsCommitted: false };
    const id = recordId('gift', def.ref, npcId);
    const { ledger } = safeState(ports);
    if (committedRecord(ledger, id)) return { outcome: 'already-granted', ref: def.ref, flag: def.flag, granted: false, committed: true, flagsCommitted: true, record: ledger[id] };

    const record = makeRecord('gift', def.ref, npcId, def.flag);
    const a = runAtomic('gift', record);
    if (a.status !== 'result') return blockedOutcome(a, { ref: def.ref, flag: def.flag }); // fail-closed, no grant attempted beyond the single atomic call
    const { applied, granted, reason } = a.res;
    if (granted !== true && applied !== true) {
      // Not granted (bag-full or rejected). Distinct from success; recoverable; no flag.
      return { outcome: reason === 'bag-full' ? 'bag-full' : 'not-granted', reason: reason || 'rejected', ref: def.ref, flag: def.flag, granted: false, committed: false, flagsCommitted: false, recoverable: true };
    }
    if (granted === true && applied === true) {
      return { outcome: 'granted', ref: def.ref, flag: def.flag, granted: true, committed: true, flagsCommitted: true, record: { ...record, granted: true, committed: true } };
    }
    // Inconsistent: partial (granted w/o commit) or phantom (commit w/o grant). No flag.
    return { outcome: 'atomic-contract-violation', ref: def.ref, flag: def.flag, granted: granted === true, committed: false, flagsCommitted: false,
      requiresRootDecision: true, hazard: granted === true ? 'partial-grant' : 'phantom-commit',
      note: 'Atomic port violated grant+flag coupling; flag not set, no auto-revoke (no app access). Root must reconcile.' };
  }

  function applyQuestAccept(npcId = 'rift-request-nessa') {
    const def = resident(npcId);
    if (!def || def.kind !== 'quest') return { outcome: 'not-applicable', flagsCommitted: false };
    const id = recordId('quest', def.ref, npcId);
    const { ledger } = safeState(ports);
    if (committedRecord(ledger, id)) return { outcome: 'already-accepted', ref: def.ref, flag: def.flag, committed: true, flagsCommitted: true, objective: 'discovery', record: ledger[id] };

    const record = makeRecord('quest', def.ref, npcId, def.flag);
    const a = runAtomic('quest', record);
    if (a.status !== 'result') return blockedOutcome(a, { ref: def.ref, flag: def.flag, objective: 'discovery' });
    const { applied, registered, reason } = a.res;
    if (registered !== true && applied !== true) {
      return { outcome: 'quest-not-registered', reason: reason || 'rejected', ref: def.ref, flag: def.flag, committed: false, flagsCommitted: false, objective: 'discovery', recoverable: true };
    }
    if (registered === true && applied === true) {
      // objective:'discovery' — accepting is looking-for, never rescue-complete.
      return { outcome: 'accepted', ref: def.ref, flag: def.flag, committed: true, flagsCommitted: true, objective: 'discovery', record: { ...record, committed: true } };
    }
    return { outcome: 'atomic-contract-violation', ref: def.ref, flag: def.flag, committed: false, flagsCommitted: false, objective: 'discovery',
      requiresRootDecision: true, hazard: registered === true ? 'partial-register' : 'phantom-commit',
      note: 'Atomic port violated register+flag coupling; flag not set. Discovery-only objective, never a rescue.' };
  }

  function applyDecline(npcId) {
    const def = resident(npcId);
    if (!def || (def.kind !== 'gift' && def.kind !== 'quest')) return { outcome: 'not-applicable', flagsCommitted: false };
    return { outcome: 'declined', npcId, kind: def.kind, granted: false, committed: false, flagsCommitted: false };
  }

  function applyClose(npcId, flagKeys = []) {
    const def = resident(npcId);
    if (!def) return { outcome: 'not-applicable', flagsCommitted: false };
    const requested = Array.isArray(flagKeys) ? flagKeys : [];
    // Only meeting NPCs may persist a flag on close; reward flags never travel this path.
    const allowed = requested.filter(k => k === def.flag && def.kind === 'meeting' && MEETING_FLAGS.includes(k));
    if (!allowed.length) return { outcome: 'closed', npcId, flagsCommitted: false };
    const { flags } = safeState(ports);
    if (flags[def.flag] === true) return { outcome: 'closed', npcId, flag: def.flag, flagsCommitted: true };
    const a = runAtomic('meeting', makeRecord('meeting', def.flag, npcId, def.flag));
    if (a.status !== 'result') return { outcome: 'closed', npcId, flag: def.flag, flagsCommitted: false, reason: a.reason }; // low-risk: closing stays valid, flag simply unpersisted
    return a.res.applied === true
      ? { outcome: 'closed', npcId, flag: def.flag, flagsCommitted: true }
      : { outcome: 'closed', npcId, flag: def.flag, flagsCommitted: false, reason: a.res.reason || 'not-applied' };
  }

  function recordVisit() {
    const id = recordId('visit', VISIT_REF, RIFT_PERSISTENT_SCENE_ID);
    const { ledger } = safeState(ports);
    if (committedRecord(ledger, id)) return { outcome: 'already-recorded', ref: VISIT_REF, committed: true, record: ledger[id] };
    const a = runAtomic('visit', { v: RIFT_PERSISTENT_RECORD_V, recordId: id, sceneId: RIFT_PERSISTENT_SCENE_ID, kind: 'visit', ref: VISIT_REF });
    if (a.status !== 'result') return { outcome: 'visit-unpersisted', ref: VISIT_REF, committed: false, reason: a.reason, recoverable: true }; // grants nothing (no free reward)
    return a.res.applied === true
      ? { outcome: 'recorded', ref: VISIT_REF, committed: true }
      : { outcome: 'visit-unpersisted', ref: VISIT_REF, committed: false, reason: a.res.reason || 'not-applied', recoverable: true };
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
      endId: RIFT_PERSISTENT_END_ID, revision: RIFT_PERSISTENT_REVISION, sceneId: RIFT_PERSISTENT_SCENE_ID, recordVersion: RIFT_PERSISTENT_RECORD_V,
      residents: JSON.parse(JSON.stringify(RESIDENTS)), visitRef: VISIT_REF,
      portWiring: RIFT_PORT_WIRING, rootDecisions: [...RIFT_ROOT_DECISIONS],
      atomicConnected: hasAtomic, failClosed: !hasAtomic
    };
  }

  return Object.freeze({ applyGiftAccept, applyQuestAccept, applyDecline, applyClose, recordVisit, resolveEntryNode, describeContract });
}
