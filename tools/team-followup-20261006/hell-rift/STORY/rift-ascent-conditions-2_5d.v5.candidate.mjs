/* rift-ascent-conditions-2_5d.v5.candidate.mjs — STORY candidate v5 (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE
 * Adds a file (does NOT overwrite v1/v2/v3/v4); originals immutable.
 * Goal doc: docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md (STORY row).
 *
 * Fixes one minimal regression root found in v4:
 *  - v4@89-91 `const rs = ports.readState; ... rs()` and v4@107-109
 *    `const cc = ports.chapterComplete; ... cc()` called the provider detached, losing
 *    `this`. A method provider that reads `this` (e.g. { done:true, chapterComplete(){ return this.done } }
 *    or a readState that returns `this.flags`) then saw `this === undefined` and threw / returned
 *    wrong data. v5 restores the receiver contract with rs.call(ports) / cc.call(ports),
 *    still INSIDE the guarded try, so a throwing method/getter stays UNKNOWN with no escape.
 *
 * Kept from v4 unchanged: full lookup/getter/function-validation/call exception → UNKNOWN
 * boundary (zero escape); descriptor-based thenable/accessor rejection (getter not invoked);
 * own-data committed===true / own-data plain flags; preview/thenable never committed;
 * authoritative chapterComplete===true independent of flags UNKNOWN; strict-true only, no
 * promotion of preview/async/non-boolean. save/ITEM/QUESTNPC providers UNIMPLEMENTED → UNKNOWN;
 * no save/schema/economy write. worldFoot = actor origin anchor (not deformed-foot/IK);
 * dark-druid single-sheet catalog unregistered / native / full-3D out of scope.
 *
 * Source anchors (read-only, cited — not imported): v4 tools/team-followup-20261006/hell-rift/STORY/rift-ascent-conditions-2_5d.v4.candidate.mjs@89-91,107-109;
 *  raw tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json; persistence …/rift-persistent-actions.candidate.mjs;
 *  rig tools/2_5d/character-rigs.mjs createCharacterRig@31->{object3d,update,snapshot,dispose}@172; catalog tools/2_5d/character-rig-catalog.mjs@35 ids@36-38;
 *  preview-not-committed tools/map-scene-rift-dialogue.mjs:193 / tools/map-scene-editor.js:227-228 / tools/2_5d-world-lab.mjs:129;
 *  chapter gate UNIMPLEMENTED game.html nextStage()@42482.
 */

export const RIFT_ASCENT_V5_END_ID = 'CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE';
export const RIFT_ASCENT_SCENE_ID = 'hell-rift-ch1-ch2';

export const RIG_MOTION_CONTRACT = Object.freeze({
  characterIds: Object.freeze(['warrior', 'silvertail', 'dark-druid']),
  modes: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: Object.freeze(['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']),
  directionMin: 0, directionMax: 7,
  note: 'idle/south(0) default for a standing resident/preview. Directional-artwork skinned-mesh; not full 3D; combat/save unconnected (snapshot.limits). worldFoot = actor origin anchor, not deformed-foot pixel/IK contact.'
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

function isPlainObject(v) {
  if (!v || typeof v !== 'object') return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}
function looksThenable(v) {
  const d = Object.getOwnPropertyDescriptor(v, 'then');
  if (!d) return false;
  if (typeof d.get === 'function') return true; // accessor 'then' — not invoked
  return Object.prototype.hasOwnProperty.call(d, 'value') && typeof d.value === 'function';
}
function ownDataIsTrue(obj, key) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  return !!d && Object.prototype.hasOwnProperty.call(d, 'value') && d.value === true;
}
function ownDataValue(obj, key) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  return d && Object.prototype.hasOwnProperty.call(d, 'value') ? { has: true, value: d.value } : { has: false, value: undefined };
}

function readCommitted(ports) {
  try {
    const rs = ports && ports.readState;
    if (typeof rs !== 'function') return { flags: {}, unknown: ['readState-missing'] };
    const s = rs.call(ports); // v5: restore receiver (this === ports) for method providers
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

function chapterGate(ports) {
  try {
    const cc = ports && ports.chapterComplete;
    if (typeof cc !== 'function') return { value: null, unknown: ['chapterComplete-missing'] };
    const r = cc.call(ports); // v5: restore receiver (this === ports) for method providers
    if (r === true) return { value: true, unknown: [] };
    if (r === false) return { value: false, unknown: [] };
    return { value: null, unknown: ['chapterComplete-nonboolean'] };
  } catch (_) { return { value: null, unknown: ['chapterComplete-threw'] }; }
}

export function createRiftAscentConditions(ports = {}) {
  function selectResidentLine(npcId) {
    const def = RESIDENT_ASCENT_CHAIN[npcId];
    if (!def) return null;
    const { flags, unknown } = readCommitted(ports);
    const committed = committedTrue(flags, def.flag);
    return Object.freeze({
      npcId, flag: def.flag, committed,
      nodeRef: committed ? def.metNode : def.firstNode,
      goalNodeRef: def.goalNode,
      stateKnown: unknown.length === 0,
      providersUnknown: unknown
    });
  }

  function evaluateAscent(ctx = {}) {
    const read = readCommitted(ports);
    const gate = chapterGate(ports);
    const providersUnknown = [...read.unknown, ...gate.unknown];
    let activeCharacterId = null;
    try {
      const snap = ctx && ctx.snapshot;
      if (isPlainObject(snap)) {
        const idv = ownDataValue(snap, 'id');
        if (idv.has && RIG_MOTION_CONTRACT.characterIds.includes(idv.value)) activeCharacterId = idv.value;
      }
    } catch (_) { activeCharacterId = null; }
    const residentsMet = Object.values(RESIDENT_ASCENT_CHAIN).filter(d => committedTrue(read.flags, d.flag)).length;
    const visible = gate.value === true; // authoritative true independent of flags UNKNOWN
    return Object.freeze({
      sceneId: RIFT_ASCENT_SCENE_ID, activeCharacterId, residentsMet,
      flagsStateKnown: read.unknown.length === 0,
      setting: RIFT_ASCENT_SETTING, nextStageGoal: NEXT_STAGE,
      goalLineRef: { npcId: 'rift-prepare-dorik', nodeRef: 'ascent' },
      ascentReady: visible, ascentGoalVisible: visible,
      providersUnknown, atomicSaveComplete: false
    });
  }

  function describeContract() {
    return {
      endId: RIFT_ASCENT_V5_END_ID, sceneId: RIFT_ASCENT_SCENE_ID,
      rigContract: RIG_MOTION_CONTRACT, residents: Object.keys(RESIDENT_ASCENT_CHAIN),
      committedReadShape: 'method or plain function; called with this===ports; returns plain object (proto Object.prototype|null), NOT thenable, own-data committed===true, own-data flags plain object of own-data boolean; scope!=="editor-session-only"',
      unknownProviders: ['readState(committed flags)', 'chapterComplete(root meaning-gate)', 'itemKey(ITEM, UNIMPLEMENTED)', 'questRegister(QUESTNPC, UNIMPLEMENTED)'],
      boundaries: 'provider receiver preserved (rs.call/cc.call) inside the guarded try; all lookups/validation exception-guarded → UNKNOWN (zero escape); plain-thenable/accessor/inherited/Date/Map/class never committed; trialFlags preview never committed; ascent gates strictly on chapterComplete===true; no save/schema/economy.'
    };
  }

  return Object.freeze({ selectResidentLine, evaluateAscent, describeContract });
}
