/*
 * interactive-session-acceptance-2_5d.candidate.mjs
 * COMMON GOAL CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006 · ROLE QA · CANDIDATE (not acceptance).
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-QA-INTERACTIVE-SESSION-CANDIDATE
 *
 * READONLY trace acceptance for the interactive rift continuation. It CONSUMES injected ports +
 * captured observables; it drives no browser, mutates nothing, and never promotes a source trace to
 * an editor/screen/native PASS. Root modules that are WIP / API-uncertain (e.g. the in-progress
 * tools/2_5d/rift-resident-billboards.mjs) are NOT imported — if their adapter is absent the result
 * is UNKNOWN/PENDING, never a faked connection PASS.
 *
 * UNIT 1 — ports consumed (all injected; absent ⇒ PENDING, fail-closed):
 *   editorPort : { clone(scene), serialize(scene)->string, load(string)->scene }
 *     (the editor's clone/serialize/load; cf. MapSceneCore.clone/validate, map-scene-core.js:4,84,
 *      and the editor import/round-trip). Readonly trace: serialize∘load∘serialize byte-identical,
 *      and load/serialize must not mutate the input.
 *   sessionAdapter observables : an ordered array of real dialogue-controller snapshot() objects
 *     (createRiftDialogue, map-scene-rift-dialogue.mjs:189-195):
 *       { supported, isOpen, view:{npcId,nodeId,...}|null, scope:'editor-session-only',
 *         trialFlags{}, trialRecords:[{actualGrant:false,...}], lastAction, closeReason, transitions }
 *
 * UNIT 2 — NEW scenarios only (NOT the v3 grounding/nav/3387 checks):
 *   provider-missing → PENDING · distance-exit (out-of-range must close) · actor/dialogue-ID swap
 *   (npcId/sceneId must not change under an open session) · grant/save non-promotion (session-only,
 *   actualGrant:false, no real grant/save without a committed-ledger provider).
 *
 * HONESTY: no THREE/browser/native; source trace ≠ editor/screen/native/listen/save/本編/IK/A-grade.
 * Meaning-review, 3387 integration, canonical docs, Git, save = root-owned.
 *
 * Run (self-check):  node tools/team-followup-20261006/hell-rift/QA/interactive-session-acceptance-2_5d.candidate.mjs
 */

const num = v => typeof v === 'number' && Number.isFinite(v);
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });

export const ISESSION = Object.freeze({
  sessionScope: 'editor-session-only',                 // map-scene-rift-dialogue.mjs:192
  distanceCloseReasons: Object.freeze(['out-of-range', 'out-of-reach', 'inactive-scene', 'transition-limit', 'scene-changed', 'scene-imported', 'scene-edited']),
  realGrantOutcomes: Object.freeze(['granted-committed', 'committed', 'saved', 'granted']),  // must require a committed ledger
  endId: 'CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-QA-INTERACTIVE-SESSION-CANDIDATE',
});

// ── UNIT 1: readonly editor clone/serialize/load trace ──
export function traceEditorRoundtrip(editorPort, scene) {
  if (!editorPort || typeof editorPort.clone !== 'function' || typeof editorPort.serialize !== 'function' || typeof editorPort.load !== 'function')
    return [PEND('editor-trace', 'editorPort{clone,serialize,load} not supplied — PENDING')];
  if (scene === undefined || scene === null) return [PEND('editor-trace', 'no scene supplied — PENDING')];
  try {
    const before = JSON.stringify(editorPort.clone(scene));
    const s1 = editorPort.serialize(scene);
    if (typeof s1 !== 'string') return [F('editor-trace', 'serialize did not return a string')];
    const loaded = editorPort.load(s1);
    const s2 = editorPort.serialize(loaded);
    const after = JSON.stringify(scene);
    const out = [];
    out.push(s1 === s2 ? P('editor-trace', `serialize∘load∘serialize byte-identical (${s1.length} chars)`) : F('editor-trace', `round-trip not byte-identical (${s1.length}→${s2.length})`));
    out.push(after === before ? P('editor-trace', 'input scene unchanged by trace (readonly)') : F('editor-trace', 'load/serialize mutated the input scene — not readonly'));
    out.push(loaded === scene ? F('editor-trace', 'load returned the SAME object reference (must be a fresh scene)') : P('editor-trace', 'load produced a distinct scene object'));
    return out;
  } catch (e) { return [F('editor-trace', `editorPort threw: ${e.message}`)]; }
}

// ── UNIT 2: readonly session trace (new scenarios) ──
// opts: { rangeTrace:[{inRange:bool}], sceneIdTrace:[string], committedLedger:{flags:{}} }
export function traceSession(snapshots, opts = {}) {
  if (!Array.isArray(snapshots) || snapshots.length < 1)
    return [PEND('session', 'no session snapshots supplied — PENDING')];
  const out = [];
  for (const [i, s] of snapshots.entries()) {
    if (!s || typeof s !== 'object' || !('isOpen' in s) || !('scope' in s))
      return [F('session', `snapshot #${i}: {isOpen,scope} missing (provider incomplete — not faked)`)];
  }

  // (d) grant/save NON-promotion: session-only, actualGrant:false, no real-grant outcome without ledger
  const ledger = opts.committedLedger && opts.committedLedger.flags ? opts.committedLedger.flags : null;
  let grantFail = [];
  for (const [i, s] of snapshots.entries()) {
    if (s.scope !== ISESSION.sessionScope) grantFail.push(`#${i} scope='${s.scope}'≠'${ISESSION.sessionScope}'`);
    for (const r of s.trialRecords || []) if (r.actualGrant === true && !ledger) grantFail.push(`#${i} record ${r.ref} actualGrant:true with no committed-ledger provider`);
    if (s.lastAction && ISESSION.realGrantOutcomes.includes(s.lastAction.outcome) && !ledger)
      grantFail.push(`#${i} lastAction.outcome='${s.lastAction.outcome}' claims a real grant without a committed ledger`);
    // a trialFlag true must be backed by a session trial record (map-scene-rift-dialogue.mjs:170-171), not a bare promotion
    for (const [flag, on] of Object.entries(s.trialFlags || {})) {
      if (!on) continue;
      const giftish = /giftGiven|questAccepted/.test(flag);
      if (giftish && !(s.trialRecords || []).length) grantFail.push(`#${i} flag '${flag}' promoted with no trial record`);
    }
  }
  out.push(grantFail.length ? F('grant-nonpromotion', grantFail.slice(0, 6).join(' | ')) : P('grant-nonpromotion', 'all snapshots session-only, actualGrant:false, no real-grant outcome without a ledger'));

  // (b) distance-exit: out-of-range must close; and any distance closeReason must coincide with isOpen:false
  const rt = Array.isArray(opts.rangeTrace) && opts.rangeTrace.length === snapshots.length ? opts.rangeTrace : null;
  if (!rt) out.push(PEND('distance-exit', 'rangeTrace[{inRange}] not supplied (per-snapshot proximity observable) — PENDING'));
  else {
    const bad = [];
    for (const [i, s] of snapshots.entries()) if (rt[i] && rt[i].inRange === false && s.isOpen === true) bad.push(`#${i} out-of-range but still isOpen`);
    for (const [i, s] of snapshots.entries()) if (s.closeReason && ISESSION.distanceCloseReasons.includes(s.closeReason) && s.isOpen === true) bad.push(`#${i} closeReason='${s.closeReason}' but isOpen:true`);
    out.push(bad.length ? F('distance-exit', bad.slice(0, 6).join(' | ')) : P('distance-exit', 'out-of-range always closes; distance closeReasons coincide with isOpen:false'));
  }

  // (c) actor/dialogue-ID swap: npcId/sceneId must not change under an open session without a close
  const sid = Array.isArray(opts.sceneIdTrace) && opts.sceneIdTrace.length === snapshots.length ? opts.sceneIdTrace : null;
  const swap = [];
  for (let i = 1; i < snapshots.length; i++) {
    const a = snapshots[i - 1], b = snapshots[i];
    const npcA = a.view && a.view.npcId, npcB = b.view && b.view.npcId;
    if (a.isOpen && b.isOpen && npcA && npcB && npcA !== npcB && !b.closeReason)
      swap.push(`#${i - 1}→#${i} npcId ${npcA}→${npcB} while open, no close`);
    if (sid && a.isOpen && b.isOpen && sid[i - 1] !== sid[i] && !b.closeReason)
      swap.push(`#${i - 1}→#${i} sceneId changed while open, no close`);
  }
  if (!sid) out.push(PEND('id-swap', 'sceneIdTrace not supplied; npcId continuity checked from view only — scene-identity swap PENDING'));
  out.push(swap.length ? F('id-swap', swap.slice(0, 6).join(' | ')) : P('id-swap', 'no actor/scene identity change under an open session'));

  return out;
}

export function runInteractiveAcceptance({ editorPort = null, scene = null, snapshots = null, rangeTrace = null, sceneIdTrace = null, committedLedger = null } = {}) {
  const sections = {
    'editor-trace': traceEditorRoundtrip(editorPort, scene),
    'session': traceSession(snapshots || [], { rangeTrace, sceneIdTrace, committedLedger }),
  };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return { endId: ISESSION.endId, sections, totals: { fail, pass, pending }, boundary: 'READONLY source trace only — editor/screen/native/listen/save/本編/IK/A-grade + billboards WIP adapter + 3387 integration are root-owned (UNEXECUTED).' };
}

// ── Node self-check: exercises ONLY the new scenarios (no v3 grounding/nav/3387 repeat) ──
const isMain = (() => { try { return import.meta.url === new URL(`file://${process.argv[1]}`).href; } catch { return false; } })();
if (isMain) {
  const show = (label, rows) => { console.log(`\n▸ ${label}`); for (const r of rows) console.log(`  [${r.pass === false ? 'FAIL' : r.pass === true ? 'PASS' : 'PEND'}] ${r.detail}`); };
  console.log('─'.repeat(78) + `\ninteractive-session self-check — ${ISESSION.endId}\n` + '─'.repeat(78));

  // UNIT1: a pure JSON editor port (fixture, NOT the real editor) on a tiny scene — readonly round-trip.
  const port = { clone: x => JSON.parse(JSON.stringify(x)), serialize: x => JSON.stringify(x), load: s => JSON.parse(s) };
  const scene = { format: 'exoduser-map-scene', version: 1, name: '틈', world: { cols: 200, rows: 200, tileSize: 40 } };
  show('UNIT1 editor round-trip (fixture port) — PASS/readonly', traceEditorRoundtrip(port, scene));
  show('UNIT1 port absent → PENDING', traceEditorRoundtrip(null, scene));

  // helper session snapshots
  const snap = o => ({ supported: true, isOpen: false, view: null, scope: 'editor-session-only', trialFlags: {}, trialRecords: [], lastAction: null, closeReason: null, transitions: 0, ...o });
  // (d) grant non-promotion: session-only record actualGrant:false → PASS
  show('UNIT2 grant non-promotion (session-only) → PASS', traceSession([
    snap({ isOpen: true, view: { npcId: 'rift-gift-berin' }, trialRecords: [{ ref: 'story.berin.keepsake', actualGrant: false }], trialFlags: { 'rift.berin.giftGiven': true }, lastAction: { outcome: 'trial-recorded' } }),
  ]));
  // (d) FAIL: a record claims actualGrant:true with no ledger
  show('UNIT2 grant promotion w/o ledger → FAIL', traceSession([
    snap({ trialRecords: [{ ref: 'story.berin.keepsake', actualGrant: true }], lastAction: { outcome: 'granted' } }),
  ]));
  // (b) distance-exit: out-of-range but still open → FAIL (with rangeTrace)
  const ds = [snap({ isOpen: true, view: { npcId: 'rift-rest-haran' } }), snap({ isOpen: true, view: { npcId: 'rift-rest-haran' } })];
  show('UNIT2 distance-exit stuck-open → FAIL', traceSession(ds, { rangeTrace: [{ inRange: true }, { inRange: false }] }));
  show('UNIT2 distance-exit proper close → PASS', traceSession(
    [snap({ isOpen: true, view: { npcId: 'rift-rest-haran' } }), snap({ isOpen: false, closeReason: 'out-of-range' })],
    { rangeTrace: [{ inRange: true }, { inRange: false }] }));
  show('UNIT2 distance-exit no rangeTrace → PENDING', traceSession(ds));
  // (c) id-swap: npcId changed while open, no close → FAIL
  show('UNIT2 actor/dialogue-ID swap → FAIL', traceSession([
    snap({ isOpen: true, view: { npcId: 'rift-rest-haran' } }),
    snap({ isOpen: true, view: { npcId: 'rift-gift-berin' } }),
  ]));

  console.log('\n' + '─'.repeat(78) + `\nBoundary: ${runInteractiveAcceptance({}).boundary}\n` + '─'.repeat(78));
}
