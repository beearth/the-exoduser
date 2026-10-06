/* rift-ascent-conditions-2_5d.v2.candidate.mjs — STORY candidate v2 (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-CONSUMER-CORRECTION-20261006-STORY-V2-CANDIDATE
 * Supersedes-by-addition (does NOT overwrite): rift-ascent-conditions-2_5d.candidate.mjs.
 * Goal doc: docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md (STORY row).
 *
 * Hardened finite/UNKNOWN/fail-closed semantics per root source review (1257/1304 corrections):
 *  (1) Accept ONLY a committed, synchronous, plain-object flags map. readState that is
 *      missing / throwing / null / non-object / array / a Promise, or whose `flags` is
 *      null / non-object / array / thenable, stays UNKNOWN — never converted to a trusted
 *      empty state. A genuine committed empty map {flags:{}} is distinguished as known-empty.
 *      Commit is strict: only flagValue === true counts; 1 / 'true' / {} never commit.
 *  (2) Session preview is never accepted as committed: a readState carrying
 *      scope:'editor-session-only' (the trial snapshot shape) or lacking committed:true is
 *      UNKNOWN. chapterComplete is strict === true only; missing / Promise / truthy
 *      string / 1 are UNKNOWN and never promoted to true.
 *  (3) No save/schema/economy changes; ITEM(itemKey)/QUESTNPC(questRegister) providers
 *      stay UNIMPLEMENTED → UNKNOWN. No rendering, no mutation, pure/idempotent.
 *
 * Source anchors (read-only, cited — not imported):
 *  - raw residents/flags/refs/nodes: tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json
 *  - persistence contract: tools/team-followup-20261006/hell-rift/STORY/rift-persistent-actions.candidate.mjs
 *  - rig API: tools/2_5d/character-rigs.mjs createCharacterRig@31 -> {object3d,update,snapshot,dispose}@172,
 *    update throw@132 (mode∈idle|walk|run|attack, direction int 0..7), snapshot()@149 limits:'…전투·저장 미연결';
 *    catalog tools/2_5d/character-rig-catalog.mjs@35 ids warrior/silvertail/dark-druid@36-38, directions@1.
 *  - preview supply paths that must NOT be read as committed: trial snapshot().trialFlags
 *    tools/map-scene-rift-dialogue.mjs:193 (scope 'editor-session-only'); editor note path
 *    tools/map-scene-editor.js:227-228; world-lab preview tools/2_5d-world-lab.mjs:129 (rig/terrain only, no flags).
 *  - chapter-complete gate UNIMPLEMENTED: game.html nextStage()@42482 (no persistent chapter field).
 */

export const RIFT_ASCENT_V2_END_ID = 'CH1-2_5D-CONSUMER-CORRECTION-20261006-STORY-V2-CANDIDATE';
export const RIFT_ASCENT_SCENE_ID = 'hell-rift-ch1-ch2';

export const RIG_MOTION_CONTRACT = Object.freeze({
  characterIds: Object.freeze(['warrior', 'silvertail', 'dark-druid']),
  modes: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: Object.freeze(['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']),
  directionMin: 0, directionMax: 7,
  note: 'Standing resident/preview display defaults to idle/south(0). Directional-artwork skinned-mesh; not full 3D; combat/save unconnected (snapshot.limits).'
});
export function assertRigMotion(mode, direction) {
  if (!RIG_MOTION_CONTRACT.modes.includes(mode)) throw new Error('모션/8방향 계약 오류: mode');
  if (!Number.isInteger(direction) || direction < 0 || direction > 7) throw new Error('모션/8방향 계약 오류: direction');
  return { mode, direction };
}

export const RIFT_ASCENT_SETTING = Object.freeze({
  ko: '위로 오르지 못하면 썩는다 — 지옥의 틈은 다음 상승을 준비하는 자리. 다음은 벌레굴.',
  en: 'Climb or you rot — the Hell Rift is where the next ascent is readied. Next is the Worm Burrow.',
  source: 'content-plan §14/§16 + raw nodes rift-prepare-dorik.ascent / rift-rest-haran.directions',
  constraint: '부패는 세계관 표현일 뿐 실시간 타이머/자동 사망/벌칙 없음'
});
export const NEXT_STAGE = Object.freeze({ ref: 'ch2-worm-burrow', ko: '벌레굴', en: 'Worm Burrow' });

export const RESIDENT_ASCENT_CHAIN = Object.freeze({
  'rift-rest-haran':    Object.freeze({ flag: 'rift.haran.met',           role: 'arrival-guide',   firstNode: 'meet', metNode: 'revisit',    goalNode: 'directions' }),
  'rift-gift-berin':    Object.freeze({ flag: 'rift.berin.giftGiven',     role: 'gift-giver',      firstNode: 'meet', metNode: 'afterGift',   goalNode: 'given',    giftRef: 'story.berin.keepsake' }),
  'rift-request-nessa': Object.freeze({ flag: 'rift.nessa.questAccepted', role: 'rescue-request',  firstNode: 'meet', metNode: 'afterAccept', goalNode: 'accepted', questRef: 'story.nessa.findLin', objective: 'discovery' }),
  'rift-prepare-dorik': Object.freeze({ flag: 'rift.dorik.met',           role: 'departure-guide', firstNode: 'meet', metNode: 'revisit',    goalNode: 'ascent' })
});

function isFn(v) { return typeof v === 'function'; }
function isThenable(v) { return !!v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function'; }
function isPlainMap(v) { return !!v && typeof v === 'object' && !Array.isArray(v) && !isThenable(v); }

/** (1)+(2): return a committed plain flags map, or {flags:{}, unknown:[reason]} held as UNKNOWN. */
function readCommitted(ports) {
  if (!ports || !isFn(ports.readState)) return { flags: {}, unknown: ['readState-missing'] };
  let s;
  try { s = ports.readState(); } catch (_) { return { flags: {}, unknown: ['readState-threw'] }; }
  if (isThenable(s)) return { flags: {}, unknown: ['readState-async'] };
  if (!isPlainMap(s)) return { flags: {}, unknown: ['readState-null-or-nonobject'] };
  if (s.scope === 'editor-session-only') return { flags: {}, unknown: ['readState-session-preview'] }; // trial snapshot shape
  if (s.committed !== true) return { flags: {}, unknown: ['readState-uncommitted'] };
  if (!isPlainMap(s.flags)) return { flags: {}, unknown: ['readState-flags-malformed'] };
  return { flags: s.flags, unknown: [] }; // valid committed map (empty = known-empty, distinct from failed read)
}
/** Commit is strict boolean true only; a bad/truthy flag value is never read as committed. */
function committedTrue(flags, key) { return flags[key] === true; }

/** (2): strict chapter gate. Only === true. missing/Promise/non-boolean => UNKNOWN (never promoted). */
function chapterGate(ports) {
  if (!ports || !isFn(ports.chapterComplete)) return { value: null, unknown: ['chapterComplete-missing'] };
  let r;
  try { r = ports.chapterComplete(); } catch (_) { return { value: null, unknown: ['chapterComplete-threw'] }; }
  if (isThenable(r)) return { value: null, unknown: ['chapterComplete-async'] };
  if (r === true) return { value: true, unknown: [] };
  if (r === false) return { value: false, unknown: [] };
  return { value: null, unknown: ['chapterComplete-nonboolean'] }; // 1 / 'true' / {} never promoted
}

/**
 * ports: { readState?()->{committed:true,flags:{<key>:boolean}}, chapterComplete?()->boolean }
 * Pure/idempotent. No rendering, no mutation, no save. Unknown providers stay UNKNOWN/fail-closed.
 */
export function createRiftAscentConditions(ports = {}) {
  function selectResidentLine(npcId) {
    const def = RESIDENT_ASCENT_CHAIN[npcId];
    if (!def) return null;
    const { flags, unknown } = readCommitted(ports);
    const committed = committedTrue(flags, def.flag);
    return Object.freeze({
      npcId, flag: def.flag,
      committed,                               // strict true, only from a valid committed read
      nodeRef: committed ? def.metNode : def.firstNode,
      goalNodeRef: def.goalNode,
      stateKnown: unknown.length === 0,        // false => read was UNKNOWN, not "no flags set"
      providersUnknown: unknown
    });
  }

  function evaluateAscent(ctx = {}) {
    const read = readCommitted(ports);
    const gate = chapterGate(ports);
    const providersUnknown = [...read.unknown, ...gate.unknown];
    const snap = isPlainMap(ctx.snapshot) ? ctx.snapshot : null;
    const activeCharacterId = snap && RIG_MOTION_CONTRACT.characterIds.includes(snap.id) ? snap.id : null;
    const residentsMet = Object.values(RESIDENT_ASCENT_CHAIN).filter(d => committedTrue(read.flags, d.flag)).length;
    const visible = gate.value === true; // strict; UNKNOWN/false/preview/resident-flags never turn it on
    return Object.freeze({
      sceneId: RIFT_ASCENT_SCENE_ID,
      activeCharacterId, residentsMet,
      flagsStateKnown: read.unknown.length === 0,
      setting: RIFT_ASCENT_SETTING, nextStageGoal: NEXT_STAGE,
      goalLineRef: { npcId: 'rift-prepare-dorik', nodeRef: 'ascent' },
      ascentReady: visible, ascentGoalVisible: visible,
      providersUnknown, atomicSaveComplete: false
    });
  }

  function describeContract() {
    return {
      endId: RIFT_ASCENT_V2_END_ID, sceneId: RIFT_ASCENT_SCENE_ID,
      rigContract: RIG_MOTION_CONTRACT, residents: Object.keys(RESIDENT_ASCENT_CHAIN),
      committedReadShape: '{ committed:true, flags:{ <flagKey>:boolean } } ; scope!=="editor-session-only"',
      unknownProviders: ['readState(committed flags)', 'chapterComplete(root meaning-gate)', 'itemKey(ITEM, UNIMPLEMENTED)', 'questRegister(QUESTNPC, UNIMPLEMENTED)'],
      boundaries: 'trial/editor trialFlags preview is session-only, never committed; ascent goal gates strictly on chapterComplete===true. No save/schema/economy/village/itemKey adopted.'
    };
  }

  return Object.freeze({ selectResidentLine, evaluateAscent, describeContract });
}
