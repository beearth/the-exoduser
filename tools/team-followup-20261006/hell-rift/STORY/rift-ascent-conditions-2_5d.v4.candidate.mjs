/* rift-ascent-conditions-2_5d.v4.candidate.mjs — STORY candidate v4 (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-STORY-ASYNC-GUARD-20261006-V4-CANDIDATE
 * Adds a file (does NOT overwrite v1/v2/v3); originals immutable.
 * Goal doc: docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md (STORY row).
 *
 * Fixes two P2 defects root found in v3:
 *  (1) v3@84-90 regression: a plain-object thenable
 *      {then(){}, committed:true, flags:{'rift.berin.giftGiven':true}} passed isPlainObject
 *      and was accepted (afterGift). v4 restores a descriptor-based thenable/accessor
 *      rejection (own `then` as a data-function OR an accessor) INSIDE the guarded
 *      validation, without invoking the getter. Normal own-data plain objects and
 *      null-prototype values are kept; inherited/accessor are never read as commit data.
 *  (2) v3@81/98/130: the ports.readState / ports.chapterComplete lookups and the
 *      ctx.snapshot access + Object.getPrototypeOf ran OUTSIDE the try, so a throwing
 *      getter/Proxy escaped. v4 moves the lookup, function validation, and snapshot
 *      prototype validation INSIDE the try → UNKNOWN; zero exception escape from any call.
 *
 * Kept: authoritative chapterComplete === true stays independent of flags UNKNOWN.
 * preview / unverified / async providers are never promoted. save/ITEM/QUESTNPC providers
 * stay UNIMPLEMENTED → UNKNOWN; no save/schema/economy write. worldFoot anchoring and the
 * dark-druid single-sheet catalog registration / native / full-3D remain out of scope.
 *
 * Source anchors (read-only, cited — not imported): raw tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json;
 *  persistence tools/team-followup-20261006/hell-rift/STORY/rift-persistent-actions.candidate.mjs;
 *  rig tools/2_5d/character-rigs.mjs createCharacterRig@31->{object3d,update,snapshot,dispose}@172;
 *  catalog tools/2_5d/character-rig-catalog.mjs@35 ids@36-38; preview-not-committed
 *  tools/map-scene-rift-dialogue.mjs:193 / tools/map-scene-editor.js:227-228 / tools/2_5d-world-lab.mjs:129;
 *  chapter gate UNIMPLEMENTED game.html nextStage()@42482.
 */

export const RIFT_ASCENT_V4_END_ID = 'CH1-2_5D-STORY-ASYNC-GUARD-20261006-V4-CANDIDATE';
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

/* Plain object only (proto Object.prototype or null). May throw via a Proxy getPrototypeOf
 * trap, so every caller runs inside a try. */
function isPlainObject(v) {
  if (!v || typeof v !== 'object') return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}
/* (1) descriptor-based thenable detection; the `then` getter is never invoked. */
function looksThenable(v) {
  const d = Object.getOwnPropertyDescriptor(v, 'then');
  if (!d) return false;
  if (typeof d.get === 'function') return true; // accessor 'then' — not invoked
  return Object.prototype.hasOwnProperty.call(d, 'value') && typeof d.value === 'function';
}
/* own DATA descriptor value === true (getter not invoked; inherited/accessor rejected). */
function ownDataIsTrue(obj, key) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  return !!d && Object.prototype.hasOwnProperty.call(d, 'value') && d.value === true;
}
function ownDataValue(obj, key) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  return d && Object.prototype.hasOwnProperty.call(d, 'value') ? { has: true, value: d.value } : { has: false, value: undefined };
}

/* (2) EVERYTHING — lookup, function check, call, validation — inside one try → UNKNOWN. */
function readCommitted(ports) {
  try {
    const rs = ports && ports.readState;
    if (typeof rs !== 'function') return { flags: {}, unknown: ['readState-missing'] };
    const s = rs();
    if (!isPlainObject(s)) return { flags: {}, unknown: ['readState-null-or-nonplain'] };
    if (looksThenable(s)) return { flags: {}, unknown: ['readState-async-thenable'] }; // (1) plain thenable rejected, getter not called
    const sc = ownDataValue(s, 'scope');
    if (sc.has && sc.value === 'editor-session-only') return { flags: {}, unknown: ['readState-session-preview'] };
    if (!ownDataIsTrue(s, 'committed')) return { flags: {}, unknown: ['readState-uncommitted'] };
    const fd = ownDataValue(s, 'flags');
    if (!fd.has || !isPlainObject(fd.value)) return { flags: {}, unknown: ['readState-flags-malformed'] };
    return { flags: fd.value, unknown: [] };
  } catch (_) { return { flags: {}, unknown: ['readState-threw'] }; }
}
function committedTrue(flags, key) { try { return ownDataIsTrue(flags, key); } catch (_) { return false; } }

/* (2)+(3) strict true only; lookup/call/classify inside try → UNKNOWN. then/getter/Proxy/1/'true'/{} never promoted. */
function chapterGate(ports) {
  try {
    const cc = ports && ports.chapterComplete;
    if (typeof cc !== 'function') return { value: null, unknown: ['chapterComplete-missing'] };
    const r = cc();
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
    try { // (2) ctx.snapshot access + prototype validation + id read guarded
      const snap = ctx && ctx.snapshot;
      if (isPlainObject(snap)) {
        const idv = ownDataValue(snap, 'id');
        if (idv.has && RIG_MOTION_CONTRACT.characterIds.includes(idv.value)) activeCharacterId = idv.value;
      }
    } catch (_) { activeCharacterId = null; }
    const residentsMet = Object.values(RESIDENT_ASCENT_CHAIN).filter(d => committedTrue(read.flags, d.flag)).length;
    const visible = gate.value === true; // (3) authoritative true independent of flags UNKNOWN
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
      endId: RIFT_ASCENT_V4_END_ID, sceneId: RIFT_ASCENT_SCENE_ID,
      rigContract: RIG_MOTION_CONTRACT, residents: Object.keys(RESIDENT_ASCENT_CHAIN),
      committedReadShape: 'plain object (proto Object.prototype|null), NOT thenable (own `then` data-fn/accessor rejected), own-data committed===true, own-data flags plain object of own-data boolean; scope!=="editor-session-only"',
      unknownProviders: ['readState(committed flags)', 'chapterComplete(root meaning-gate)', 'itemKey(ITEM, UNIMPLEMENTED)', 'questRegister(QUESTNPC, UNIMPLEMENTED)'],
      boundaries: 'all lookups/validation exception-guarded → UNKNOWN (zero escape); plain-thenable/accessor/inherited/Date/Map/class never committed; trialFlags preview never committed; ascent gates strictly on chapterComplete===true; no save/schema/economy.'
    };
  }

  return Object.freeze({ selectResidentLine, evaluateAscent, describeContract });
}
