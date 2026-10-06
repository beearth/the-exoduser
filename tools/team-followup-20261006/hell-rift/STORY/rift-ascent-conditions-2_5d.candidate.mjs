/* rift-ascent-conditions-2_5d.candidate.mjs — STORY candidate (not production-adopted)
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-CHARACTER-MAP-SLICE-20261006-STORY-CANDIDATE
 * Goal doc: docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md (STORY row).
 *
 * Ties the EXISTING Hell-Rift residents' meaning (틈 대사 / 부탁·준비 / 정체 망자) to the
 * next ASCENT goal (→ CH2 벌레굴), as idempotent condition DATA + a selection CONSUMER.
 * It reads existing stable ids/flags/refs; it does NOT mutate dialogue raw, invent village
 * buildings, add economy numbers, adopt an itemKey, or write any save. Absent persistent
 * providers are held as UNKNOWN; no atomic-save / main-game-connection completion is claimed.
 *
 * Source anchors (read-only, cited — not imported, to avoid coupling/version drift):
 *  - Residents + stable flags/refs: tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json
 *    (npcIds rift-rest-haran/rift-gift-berin/rift-request-nessa/rift-prepare-dorik;
 *     flags rift.haran.met/rift.berin.giftGiven/rift.nessa.questAccepted/rift.dorik.met;
 *     giftRef story.berin.keepsake; questRef story.nessa.findLin; revisit nodes
 *     afterGift/afterAccept, guidance nodes directions/ascent).
 *  - Persistence contract: tools/team-followup-20261006/hell-rift/STORY/rift-persistent-actions.candidate.mjs
 *    (RESIDENTS, recordId; fail-closed without an atomic port).
 *  - Rig API contact: tools/2_5d/character-rigs.mjs createCharacterRig@31 ->
 *    Object.freeze({object3d, update, snapshot, dispose})@172; update throw contract@132
 *    (mode ∈ idle|walk|run|attack, direction integer 0..7); snapshot()@149 carries
 *    limits:'…전투·저장 미연결'. Catalog tools/2_5d/character-rig-catalog.mjs@35:
 *    ids warrior/silvertail/dark-druid@36-38, directions@1, characterRigFrame@55.
 *  - Chapter-complete gate: game.html nextStage()@42482 jumps CH1->CH2 with NO persistent
 *    chapter-complete field; the root meaning-gate (e.g. window._riftChapterDone) is
 *    UNIMPLEMENTED -> held UNKNOWN here.
 */

export const RIFT_ASCENT_END_ID = 'CH1-2_5D-CHARACTER-MAP-SLICE-20261006-STORY-CANDIDATE';
export const RIFT_ASCENT_SCENE_ID = 'hell-rift-ch1-ch2';

/* Rig contract mirrored from the catalog/rig source (cited above); not new geometry. */
export const RIG_MOTION_CONTRACT = Object.freeze({
  characterIds: Object.freeze(['warrior', 'silvertail', 'dark-druid']),
  modes: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: Object.freeze(['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']),
  directionMin: 0, directionMax: 7,
  note: 'Standing resident/preview display defaults to idle/south(0). Rig is directional-artwork skinned-mesh, not full 3D; combat/save unconnected (snapshot.limits).'
});
/** Mirrors createCharacterRig().update() throw contract so a consumer never passes invalid params. */
export function assertRigMotion(mode, direction) {
  if (!RIG_MOTION_CONTRACT.modes.includes(mode)) throw new Error('모션/8방향 계약 오류: mode');
  if (!Number.isInteger(direction) || direction < 0 || direction > 7) throw new Error('모션/8방향 계약 오류: direction');
  return { mode, direction };
}

/* Ascent setting (worldview flavor, NOT a timer/penalty), summarized with source; the
 * player-facing wording stays in the dialogue raw nodes referenced below (no duplication). */
export const RIFT_ASCENT_SETTING = Object.freeze({
  ko: '위로 오르지 못하면 썩는다 — 지옥의 틈은 다음 상승을 준비하는 자리. 다음은 벌레굴.',
  en: 'Climb or you rot — the Hell Rift is where the next ascent is readied. Next is the Worm Burrow.',
  source: 'content-plan §14/§16 + raw nodes rift-prepare-dorik.ascent / rift-rest-haran.directions',
  constraint: '부패는 세계관 표현일 뿐 실시간 타이머/자동 사망/벌칙 없음'
});
export const NEXT_STAGE = Object.freeze({ ref: 'ch2-worm-burrow', ko: '벌레굴', en: 'Worm Burrow' });

/* Each existing resident's contribution to the ascent goal + the raw node to surface by
 * committed state. node refs point INTO rift-dialogue.json; text is never copied here. */
export const RESIDENT_ASCENT_CHAIN = Object.freeze({
  'rift-rest-haran':    Object.freeze({ flag: 'rift.haran.met',           role: 'arrival-guide',   contribution: 'names the rift and points the northern ascent → 벌레굴', firstNode: 'meet',  metNode: 'revisit',   goalNode: 'directions' }),
  'rift-gift-berin':    Object.freeze({ flag: 'rift.berin.giftGiven',     role: 'gift-giver',      contribution: 'entrusts his last keepsake so the player "climbs in his place"', firstNode: 'meet', metNode: 'afterGift',  goalNode: 'given',      giftRef: 'story.berin.keepsake' }),
  'rift-request-nessa': Object.freeze({ flag: 'rift.nessa.questAccepted', role: 'rescue-request',  contribution: 'gives a personal reason to reach the next region (find Lin — discovery, not rescue)', firstNode: 'meet', metNode: 'afterAccept', goalNode: 'accepted', questRef: 'story.nessa.findLin', objective: 'discovery' }),
  'rift-prepare-dorik': Object.freeze({ flag: 'rift.dorik.met',           role: 'departure-guide', contribution: 'watches the ascent stair and frames the next hell (벌레굴)', firstNode: 'meet', metNode: 'revisit',   goalNode: 'ascent' })
});

function isFn(v) { return typeof v === 'function'; }
function flagsOf(ports) {
  if (!ports || !isFn(ports.readState)) return { flags: {}, unknown: ['readState'] };
  try {
    const s = ports.readState();
    if (s && typeof s.then === 'function') return { flags: {}, unknown: ['readState-async'] };
    return { flags: s && typeof s.flags === 'object' && s.flags ? s.flags : {}, unknown: [] };
  } catch (_) { return { flags: {}, unknown: ['readState-threw'] }; }
}

/**
 * ports: { readState?()->{flags}, chapterComplete?()->bool }  (both optional; absent => UNKNOWN)
 * Pure/idempotent consumer: same inputs -> same output. No mutation, no save, no rendering.
 */
export function createRiftAscentConditions(ports = {}) {
  const hasChapterGate = isFn(ports.chapterComplete);

  // Idempotent per-resident dialogue SELECTION over the existing raw (returns a node ref,
  // never text). Mirrors committed-flag revisit: met -> metNode, else firstNode; goalNode
  // is offered once the resident's own flag is committed (its ascent-goal beat).
  function selectResidentLine(npcId) {
    const def = RESIDENT_ASCENT_CHAIN[npcId];
    if (!def) return null;
    const { flags, unknown } = flagsOf(ports);
    const met = flags[def.flag] === true;
    return Object.freeze({
      npcId, flag: def.flag, committed: met,
      nodeRef: met ? def.metNode : def.firstNode,
      goalNodeRef: def.goalNode,            // the beat carrying the ascent motive
      contribution: def.contribution,
      providersUnknown: unknown             // e.g. ['readState'] when no committed-flag source wired
    });
  }

  // Idempotent ascent readiness. ascentReady requires a real chapter-complete provider;
  // absent -> UNKNOWN and ascentReady:false (fail-closed), never a save/complete claim.
  function evaluateAscent(ctx = {}) {
    const { flags, unknown } = flagsOf(ports);
    const providersUnknown = [...unknown];
    let chapterComplete = null;
    if (hasChapterGate) { try { const r = ports.chapterComplete(); chapterComplete = (r && typeof r.then === 'function') ? null : r === true; } catch (_) { chapterComplete = null; } }
    if (chapterComplete === null) providersUnknown.push('chapterComplete');
    // optional active-rig context from a real createCharacterRig().snapshot()
    const snap = ctx.snapshot && typeof ctx.snapshot === 'object' ? ctx.snapshot : null;
    const activeCharacterId = snap && RIG_MOTION_CONTRACT.characterIds.includes(snap.id) ? snap.id : null;
    const metCount = Object.values(RESIDENT_ASCENT_CHAIN).filter(d => flags[d.flag] === true).length;
    return Object.freeze({
      sceneId: RIFT_ASCENT_SCENE_ID,
      activeCharacterId,                                   // which 2.5D rig is shown (warrior/silvertail/dark-druid), else null
      residentsMet: metCount,
      setting: RIFT_ASCENT_SETTING,
      nextStageGoal: NEXT_STAGE,
      goalLineRef: { npcId: 'rift-prepare-dorik', nodeRef: 'ascent' }, // raw-owned player-facing text
      ascentReady: chapterComplete === true,               // only true on a real committed gate
      ascentGoalVisible: chapterComplete === true,         // surface the goal only after real CH1 completion
      providersUnknown,
      atomicSaveComplete: false                            // explicit: never claimed here
    });
  }

  function describeContract() {
    return {
      endId: RIFT_ASCENT_END_ID, sceneId: RIFT_ASCENT_SCENE_ID,
      rigContract: RIG_MOTION_CONTRACT, residents: Object.keys(RESIDENT_ASCENT_CHAIN),
      unknownProviders: ['readState(committed flags)', 'chapterComplete(root meaning-gate)', 'itemKey(ITEM-owned; giftRef symbolic)', 'questRegister(QUESTNPC-owned)'],
      boundaries: 'trial/editor display (rift-dialogue.json via root controller) is session-only preview; main-game ascent goal must gate on the real chapterComplete provider. No save/economy/village/itemKey adopted here.'
    };
  }

  return Object.freeze({ selectResidentLine, evaluateAscent, describeContract });
}
