/* dialogue-observation-consumer-2_5d.candidate.mjs — STORY candidate (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-RIFT-CONSUMER-LINK-20261007-DIALOGUE-OBSERVATION-CONSUMER-CANDIDATE
 * Goal: CH1-RIFT-CONSUMER-LINK-20261007. New owned file; prior raw immutable.
 *
 * A READ-ONLY diagnostic consumer of the world-lab dialogue provider (root
 * tools/map-scene-rift-dialogue.mjs → createRiftDialogue returns
 * {nearest,open,choose,close,snapshot}@241). It OBSERVES the controller's snapshot and
 * (optionally) its nearest() proximity query; it never calls open/choose/close and never
 * replaces the actual dialogue. It does not promote session/trial state to committed, and
 * never treats trialRecords as a real grant/reward/save (controller marks actualGrant:false
 * @229 and scope:'editor-session-only' @192).
 *
 * Real wiring observed (world-lab): createRiftDialogue(...)@tools/2_5d-world-lab.mjs:229;
 * dialogue.snapshot()@94, dialogue.nearest()@95/109, dialogue.open@109, choose@106, close@91;
 * snapshot fields {supported,isOpen,view,scope,trialFlags,trialRecords,lastAction,closeReason,
 * transitions}@map-scene-rift-dialogue.mjs:192-195. Player interaction key is R ("R로 대화"@96);
 * E='KeyE' is shield (E-패링0) — not an interaction key.
 *
 * Guards: provider snapshot/nearest fns acquired via OWN DATA descriptor (accessor NOT
 * executed); each observed field read via own-data descriptor (target flag accessor is never
 * called → stateKnown:false/UNKNOWN); thenable field/result (incl. inherited-proto, by plain-
 * object + own-then checks) rejected without execution; any descriptor/proxy throw → fail-closed.
 */

export const DIALOGUE_OBSERVATION_END_ID = 'CH1-RIFT-CONSUMER-LINK-20261007-DIALOGUE-OBSERVATION-CONSUMER-CANDIDATE';
export const RIFT_SCENE_ID = 'hell-rift-ch1-ch2';
const GIFT_NPC = 'rift-gift-berin', QUEST_NPC = 'rift-request-nessa';

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function ownData(obj, key) { try { if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return { has: false }; const d = Object.getOwnPropertyDescriptor(obj, key); return d && hasOwn(d, 'value') ? { has: true, value: d.value } : { has: false }; } catch (_) { return { has: false }; } }
function ownFn(obj, key) { const d = ownData(obj, key); return d.has && typeof d.value === 'function' ? d.value : null; }
function isPlainObject(v) { if (!v || typeof v !== 'object') return false; const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null; }
function looksThenable(v) { try { const d = Object.getOwnPropertyDescriptor(v, 'then'); if (!d) return false; if (typeof d.get === 'function') return true; return hasOwn(d, 'value') && typeof d.value === 'function'; } catch (_) { return true; } }
function ownBoolTrue(obj, key) { const d = ownData(obj, key); return d.has && d.value === true; } // accessor → not true, getter not run
function ownStr(obj, key) { const d = ownData(obj, key); return d.has && typeof d.value === 'string' ? d.value : null; }

/* ports: { dialogue: <createRiftDialogue controller> }. Pure, read-only, no mutation/grant/save. */
export function createDialogueObservationConsumer(ports = {}) {
  function controller() { const dv = ownData(ports, 'dialogue'); return dv.has && dv.value ? dv.value : null; } // own data; no getter run

  /* Read-only observation of the controller snapshot; session/trial never promoted. */
  function observe() {
    try {
      const d = controller(); if (!d) return { linked: false, reason: 'no-dialogue', committedPromoted: false };
      const sn = ownFn(d, 'snapshot'); if (!sn) return { linked: false, reason: 'no-snapshot-or-accessor', committedPromoted: false };
      const s = sn.call(d); // receiver preserved
      if (!isPlainObject(s)) return { linked: false, reason: 'snapshot-nonplain', committedPromoted: false };
      if (looksThenable(s)) return { linked: false, reason: 'snapshot-thenable', committedPromoted: false };

      const scope = ownStr(s, 'scope'); const sessionOnly = scope === 'editor-session-only';
      // view (read-only): npcId + option ids, no option actions executed
      let viewNpcId = null, optionIds = [];
      const vv = ownData(s, 'view');
      if (vv.has && isPlainObject(vv.value) && !looksThenable(vv.value)) {
        viewNpcId = ownStr(vv.value, 'npcId');
        const ov = ownData(vv.value, 'options');
        if (ov.has && Array.isArray(ov.value)) optionIds = ov.value.map(o => (isPlainObject(o) ? ownStr(o, 'id') : null)).filter(x => typeof x === 'string');
      }
      // trialRecords (session, actualGrant:false) split gift/quest — labelled trial, never a real grant
      const trial = { gift: [], quest: [], other: [] };
      const trV = ownData(s, 'trialRecords');
      if (trV.has && Array.isArray(trV.value)) {
        for (const rec of trV.value) {
          if (!isPlainObject(rec) || looksThenable(rec)) continue;
          const kind = ownStr(rec, 'kind'), npcId = ownStr(rec, 'npcId'), ref = ownStr(rec, 'ref');
          const entry = { kind, npcId, ref, actualGrant: ownBoolTrue(rec, 'actualGrant'), scope: 'editor-session-only' };
          (kind === 'gift' ? trial.gift : kind === 'quest' ? trial.quest : trial.other).push(entry);
        }
      }
      // trialFlags: report presence only, explicitly session (NOT committed). flag read via own-data true.
      const tfV = ownData(s, 'trialFlags'); const trialFlags = {};
      if (tfV.has && isPlainObject(tfV.value) && !looksThenable(tfV.value)) {
        for (const key of Object.keys(tfV.value)) trialFlags[key] = ownBoolTrue(tfV.value, key); // accessor flag → false, not executed
      }
      return Object.freeze({
        linked: true, supported: ownBoolTrue(s, 'supported'), isOpen: ownBoolTrue(s, 'isOpen'),
        scope: scope ?? null, sessionOnly,
        view: Object.freeze({ npcId: viewNpcId, optionIds: Object.freeze(optionIds) }),
        trial: Object.freeze({ flags: Object.freeze(trialFlags), gift: Object.freeze(trial.gift), quest: Object.freeze(trial.quest), other: Object.freeze(trial.other) }),
        lastActionOutcome: (() => { const la = ownData(s, 'lastAction'); return la.has && isPlainObject(la.value) ? ownStr(la.value, 'outcome') : null; })(),
        closeReason: ownStr(s, 'closeReason'),
        committed: false, committedPromoted: false, grant: null, reward: null, save: null, // never promoted
        note: sessionOnly ? 'editor-session-only trial; not committed/grant/reward/save' : 'scope unknown'
      });
    } catch (_) { return { linked: false, reason: 'observe-threw', committedPromoted: false }; }
  }

  /* Optional proximity probe: delegates to the controller's own nearest() (read query; the
   * controller may refresh per its design). Does NOT open/choose/close. */
  function probeNearest(player) {
    try {
      const d = controller(); if (!d) return { ok: false, reason: 'no-dialogue' };
      const nf = ownFn(d, 'nearest'); if (!nf) return { ok: false, reason: 'no-nearest-or-accessor' };
      if (!isPlainObject(player)) return { ok: false, reason: 'bad-player' };
      const n = nf.call(d, player); // receiver preserved; delegates to actual consumer (not reimplemented)
      if (!isPlainObject(n) || looksThenable(n)) return { ok: true, nearest: null };
      return { ok: true, nearest: Object.freeze({ npcId: ownStr(n, 'npcId') }) };
    } catch (_) { return { ok: false, reason: 'nearest-threw' }; }
  }

  function describeContract() {
    return {
      endId: DIALOGUE_OBSERVATION_END_ID, sceneId: RIFT_SCENE_ID,
      observes: 'root createRiftDialogue {nearest,open,choose,close,snapshot}@241 — snapshot read-only + optional nearest probe',
      doesNot: 'call open/choose/close; replace actual dialogue; promote session/trialFlags/trialRecords to committed/grant/reward/save',
      separation: `gift(${GIFT_NPC}) vs quest(${QUEST_NPC}) trialRecords split; all labelled editor-session-only, actualGrant reported as-is but never a real grant`,
      guards: 'provider fns via own-data descriptor (accessor not executed); fields via own-data descriptor; target flag accessor not called → not committed; thenable field/result rejected unexecuted; descriptor/proxy throw → fail-closed',
      unknownProviders: ['dialogue controller (world-lab createRiftDialogue)', 'committed save/grant/quest completion (root/ITEM/QUESTNPC, UNIMPLEMENTED — out of scope here)']
    };
  }

  return Object.freeze({ observe, probeNearest, describeContract });
}
