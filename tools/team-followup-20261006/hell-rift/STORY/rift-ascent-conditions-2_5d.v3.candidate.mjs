/* rift-ascent-conditions-2_5d.v3.candidate.mjs — STORY candidate v3 (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-STRICT-CONSUMER-FIX-20261006-STORY-V3-CANDIDATE
 * Adds a file (does NOT overwrite v1/v2); originals immutable.
 * Goal doc: docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md (STORY row).
 *
 * Fixes two real defects root found in v2:
 *  (1) v2 isPlainMap (v2@64/75/79) accepted Date/Map/class instances and inherited-true /
 *      accessor values as commit data. v3 accepts a container ONLY if its prototype is
 *      Object.prototype or null, and reads committed/flag strictly via an OWN DATA
 *      descriptor whose value === true. Inherited true and accessors (getters) are never
 *      read as commit data.
 *  (2) v2 (v2@63/70-75/85-86) touched s.then/s.scope/s.committed/s.flags and flags[key]
 *      OUTSIDE the readState try, so a throwing getter/Proxy trap escaped as a throw. v3
 *      wraps the ENTIRE validation (every property access, via Reflect own-descriptors) in
 *      a try → UNKNOWN, never invokes an accessor to accept commit data, and applies the
 *      same boundary to chapterComplete's return (then/getter/Proxy → UNKNOWN).
 *  (3) No added blocking: an authoritative chapterComplete === true is NOT gated by flags
 *      being UNKNOWN. strict-true verdict, UNKNOWN, and preview-non-acceptance are kept.
 *      save/ITEM/QUESTNPC providers stay UNIMPLEMENTED → UNKNOWN; no save/schema/economy write.
 *
 * Source anchors (read-only, cited — not imported): raw tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json;
 *  persistence tools/team-followup-20261006/hell-rift/STORY/rift-persistent-actions.candidate.mjs;
 *  rig tools/2_5d/character-rigs.mjs createCharacterRig@31->{object3d,update,snapshot,dispose}@172 (update throw@132),
 *  catalog tools/2_5d/character-rig-catalog.mjs@35 ids@36-38; preview-not-committed paths
 *  tools/map-scene-rift-dialogue.mjs:193 (scope 'editor-session-only'), tools/map-scene-editor.js:227-228,
 *  tools/2_5d-world-lab.mjs:129; chapter gate UNIMPLEMENTED game.html nextStage()@42482.
 */

export const RIFT_ASCENT_V3_END_ID = 'CH1-2_5D-STRICT-CONSUMER-FIX-20261006-STORY-V3-CANDIDATE';
export const RIFT_ASCENT_SCENE_ID = 'hell-rift-ch1-ch2';

export const RIG_MOTION_CONTRACT = Object.freeze({
  characterIds: Object.freeze(['warrior', 'silvertail', 'dark-druid']),
  modes: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: Object.freeze(['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']),
  directionMin: 0, directionMax: 7,
  note: 'idle/south(0) default for a standing resident/preview. Directional-artwork skinned-mesh; not full 3D; combat/save unconnected (snapshot.limits).'
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

/* (1) Only a true plain object (prototype Object.prototype or null). Rejects null, primitives,
 * arrays, Date/Map/Set/Promise, and any class instance. Never throws. */
function isPlainObject(v) {
  if (!v || typeof v !== 'object') return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}
/* (1)+(2) OWN DATA descriptor value === true. getOwnPropertyDescriptor does not invoke getters;
 * accessors have no 'value' (rejected); inherited props yield undefined (rejected). Proxy traps may
 * throw, so callers wrap in try. */
function ownDataIsTrue(obj, key) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  return !!d && Object.prototype.hasOwnProperty.call(d, 'value') && d.value === true;
}
function ownDataValue(obj, key) {
  const d = Object.getOwnPropertyDescriptor(obj, key);
  return d && Object.prototype.hasOwnProperty.call(d, 'value') ? { has: true, value: d.value } : { has: false, value: undefined };
}

/* (2) Entire validation inside try → UNKNOWN. No accessor is invoked to accept commit data. */
function readCommitted(ports) {
  if (!ports || typeof ports.readState !== 'function') return { flags: {}, unknown: ['readState-missing'] };
  try {
    const s = ports.readState();
    if (!isPlainObject(s)) return { flags: {}, unknown: ['readState-null-or-nonplain'] }; // null/Date/Map/class/array/Promise/primitive
    const sc = ownDataValue(s, 'scope');
    if (sc.has && sc.value === 'editor-session-only') return { flags: {}, unknown: ['readState-session-preview'] };
    if (!ownDataIsTrue(s, 'committed')) return { flags: {}, unknown: ['readState-uncommitted'] }; // own data true only
    const fd = ownDataValue(s, 'flags');
    if (!fd.has || !isPlainObject(fd.value)) return { flags: {}, unknown: ['readState-flags-malformed'] }; // own-data plain object only
    return { flags: fd.value, unknown: [] }; // valid committed map (empty = known-empty)
  } catch (_) { return { flags: {}, unknown: ['readState-threw'] }; } // getter/Proxy throw → UNKNOWN, never escapes
}
/* Strict commit: own data value === true only. Inherited/accessor/Proxy-throw → not committed. */
function committedTrue(flags, key) { try { return ownDataIsTrue(flags, key); } catch (_) { return false; } }

/* (2)+(3) strict true only; then/getter/Proxy/1/'true'/{} → UNKNOWN (never promoted), throw → UNKNOWN. */
function chapterGate(ports) {
  if (!ports || typeof ports.chapterComplete !== 'function') return { value: null, unknown: ['chapterComplete-missing'] };
  try {
    const r = ports.chapterComplete(); // r===true / r===false do not invoke accessors
    if (r === true) return { value: true, unknown: [] };
    if (r === false) return { value: false, unknown: [] };
    return { value: null, unknown: ['chapterComplete-nonboolean'] };
  } catch (_) { return { value: null, unknown: ['chapterComplete-threw'] }; }
}

/**
 * ports: { readState?()->{committed:true, flags:{<key>:boolean}}, chapterComplete?()->boolean }
 * Pure/idempotent, exception-safe, no rendering/mutation/save. UNKNOWN providers stay fail-closed.
 */
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
    const snap = isPlainObject(ctx.snapshot) ? ctx.snapshot : null;
    let activeCharacterId = null;
    if (snap) { try { const idv = ownDataValue(snap, 'id'); if (idv.has && RIG_MOTION_CONTRACT.characterIds.includes(idv.value)) activeCharacterId = idv.value; } catch (_) { activeCharacterId = null; } }
    const residentsMet = Object.values(RESIDENT_ASCENT_CHAIN).filter(d => committedTrue(read.flags, d.flag)).length;
    const visible = gate.value === true; // (3) authoritative true NOT blocked by flags UNKNOWN
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
      endId: RIFT_ASCENT_V3_END_ID, sceneId: RIFT_ASCENT_SCENE_ID,
      rigContract: RIG_MOTION_CONTRACT, residents: Object.keys(RESIDENT_ASCENT_CHAIN),
      committedReadShape: 'plain object (proto Object.prototype|null), own-data committed===true, own-data flags plain object of own-data boolean; scope!=="editor-session-only"',
      unknownProviders: ['readState(committed flags)', 'chapterComplete(root meaning-gate)', 'itemKey(ITEM, UNIMPLEMENTED)', 'questRegister(QUESTNPC, UNIMPLEMENTED)'],
      boundaries: 'accessors/inherited/Date/Map/class never read as commit; all validation exception-guarded → UNKNOWN; trialFlags preview never committed; ascent gates strictly on chapterComplete===true; no save/schema/economy.'
    };
  }

  return Object.freeze({ selectResidentLine, evaluateAscent, describeContract });
}
