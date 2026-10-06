import { createVisualPoseConsumer } from './visual-pose-consumer.mjs';
import { readDialogueSnapshot } from './dialogue-observation.mjs';

export const DIALOGUE_POSE_PROVENANCE = Object.freeze({
  status: 'ROOT-PUBLIC-DERIVATIVE', role: 'SKILL', goal: 'CH1-RIFT-CONSUMER-LINK-20261007',
  source: 'tools/team-followup-20261007/hell-rift/SKILL/dialogue-pose-consumer-2_5d.candidate.mjs',
  sourceBytes: 14971, sourceSha256: '28cfb0dd57fdd1aec5aee639b7a62474ea1bd5005d978745dfed7cdbd2a90ad2',
  endId: 'CH1-RIFT-CONSUMER-LINK-20261007-DIALOGUE-POSE-CONSUMER-CANDIDATE',
  endUuid: 'a94e50d2-e9b5-49a3-8eed-cde440074224',
  poseConsumer: 'tools/2_5d/visual-pose-consumer.mjs',
  poseConsumerSha256: 'd16723f497ecd2034e337fdcba9f9c25bf737edb5f9cae19e026fbb370b33305'
});
const object = value => value !== null && (typeof value === 'object' || typeof value === 'function');
function data(value, key) {
  if (!object(value) || Array.isArray(value)) throw new Error('data-object-required');
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor) return undefined;
  if (!Object.hasOwn(descriptor, 'value')) throw new Error('accessor-rejected');
  return descriptor.value;
}
function intentOf(value) {
  const result = {};
  for (const key of ['dx', 'dy']) { const supplied = data(value, key); result[key] = supplied === undefined ? 0 : supplied; if (!Number.isFinite(result[key])) throw new Error('finite-delta-required'); }
  for (const key of ['run', 'attack']) { const supplied = data(value, key); result[key] = supplied === undefined ? false : supplied; if (typeof result[key] !== 'boolean') throw new Error('boolean-intent-required'); }
  const facing = data(value, 'facing');
  if (facing !== undefined) { if (!Number.isInteger(facing) || facing < 0 || facing > 7) throw new Error('finite-direction-required'); result.facing = facing; }
  const skill = data(value, 'skill');
  if (skill !== undefined && skill !== null) {
    const poseMode = data(skill, 'poseMode'), id = data(skill, 'id');
    result.skill = { poseMode, id: typeof id === 'string' ? id : undefined };
  }
  return result;
}

/* One arbiter per actor, called by the existing world-lab RAF. No input binding,
 * movement, rig, dialogue action, reward, save, timer or render loop is owned here.
 * An unreadable provider is UNKNOWN and neutral until a valid snapshot arrives.
 * A valid closed snapshot releases old attack state and accepts fresh input. */
export function createDialoguePoseArbiter(id, options = {}) {
  let provider, retrigger = false, setupIssue = null;
  try {
    provider = data(options, 'dialogueProvider'); if (provider === undefined) provider = data(options, 'dialogue');
    const supplied = data(options, 'retrigger');
    if (supplied !== undefined && typeof supplied !== 'boolean') throw new Error('retrigger-boolean-required');
    retrigger = supplied === true;
  } catch { setupIssue = 'pose-options-unknown'; }
  const pose = createVisualPoseConsumer(id, { retrigger });
  let suspended = false, lastKey = null, lastReason = null, lastDialogue = null, lastUnknown = Object.freeze([]);
  function resolve(dt, intent = {}, snapshotOverride) {
    const observed = readDialogueSnapshot(snapshotOverride === undefined ? provider : snapshotOverride, options);
    const issues = [...observed.providersUnknown];
    if (setupIssue) issues.push(setupIssue);
    let safeIntent;
    try { safeIntent = intentOf(intent); }
    catch { issues.push('pose-intent-unknown'); safeIntent = { dx: 0, dy: 0, run: false, attack: false }; }
    const key = observed.view ? observed.view.npcId + '|' + observed.view.nodeId : null;
    const blocked = observed.isOpen === true || !observed.stateKnown || !!setupIssue;
    if (blocked) {
      if (!suspended || lastKey !== key) pose.release();
      suspended = true; lastKey = key;
    } else if (suspended) { pose.release(); suspended = false; lastKey = null; }
    const invalidIntent = issues.includes('pose-intent-unknown');
    if (invalidIntent) pose.release();
    let params = safeIntent;
    if (blocked || invalidIntent) {
      params = { dx: 0, dy: 0, run: false, attack: false };
      if (safeIntent.facing !== undefined) params.facing = safeIntent.facing;
    }
    let resolved;
    try { resolved = pose.resolve(dt, params); }
    catch {
      pose.release(); issues.push('public-pose-rejected');
      resolved = pose.resolve(0, { dx: 0, dy: 0, run: false, attack: false });
    }
    lastReason = blocked ? observed.stateKnown ? 'dialogue-open' : 'dialogue-unknown' : invalidIntent ? 'intent-unknown' : null;
    lastDialogue = Object.freeze({ open: observed.isOpen, known: observed.stateKnown, supported: observed.supported,
      npcId: observed.view?.npcId ?? null, nodeId: observed.view?.nodeId ?? null, key, sessionOnly: observed.sessionOnly });
    lastUnknown = Object.freeze([...new Set(issues)]);
    return Object.freeze({ params: Object.freeze({ ...resolved.params }), supported: resolved.supported,
      arbitration: blocked ? observed.stateKnown ? 'suspended' : 'provider-unknown' : invalidIntent ? 'intent-unknown' : 'active',
      attackRemaining: resolved.attackRemaining, dialogue: lastDialogue, providersUnknown: lastUnknown, actorId: id });
  }
  function snapshot() {
    const current = pose.snapshot();
    return Object.freeze({ ...current, suspended, lastDialogueKey: lastKey, lastReason,
      dialogue: lastDialogue, providersUnknown: lastUnknown, provenance: DIALOGUE_POSE_PROVENANCE,
      ownRaf: false, ownTimers: false, providerWrites: false });
  }
  function release(reason = 'release') {
    pose.release(); suspended = false; lastKey = null;
    lastReason = typeof reason === 'string' ? reason.slice(0, 96) : 'release';
    return snapshot();
  }
  return Object.freeze({ id, resolve, snapshot, release,
    onActorChange: () => release('actor-change'), onBlur: () => release('blur'), reset: () => release('reset') });
}
