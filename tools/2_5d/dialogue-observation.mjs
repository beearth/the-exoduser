// Root-owned public derivative; the officially completed STORY raw stays immutable.
export const DIALOGUE_OBSERVATION_PROVENANCE = Object.freeze({
  status: 'ROOT-PUBLIC-DERIVATIVE', role: 'STORY', goal: 'CH1-RIFT-CONSUMER-LINK-20261007',
  source: 'tools/team-followup-20261007/hell-rift/STORY/dialogue-observation-consumer-2_5d.candidate.mjs',
  sourceBytes: 8532, sourceSha256: '30a3185cab9066ab73bc1b49770bb7397ae64bcdc0f153636379db5709b89029',
  endId: 'CH1-RIFT-CONSUMER-LINK-20261007-DIALOGUE-OBSERVATION-CONSUMER-CANDIDATE',
  endUuid: 'e603cefb-1cbc-44ee-a6d5-a7b59485b278'
});

// These are the existing createRiftDialogue ledger keys, not new gameplay flags.
export const DIALOGUE_TRIAL_FLAGS = Object.freeze([
  'rift.haran.met', 'rift.berin.giftGiven', 'rift.nessa.questAccepted', 'rift.dorik.met'
]);
const RESIDENTS = Object.freeze(['rift-rest-haran', 'rift-gift-berin', 'rift-request-nessa', 'rift-prepare-dorik']);
const RECORDS = Object.freeze({
  gift: Object.freeze({ npcId: 'rift-gift-berin', ref: 'story.berin.keepsake' }),
  quest: Object.freeze({ npcId: 'rift-request-nessa', ref: 'story.nessa.findLin' })
});
export const DIALOGUE_OBSERVATION_LIMITS = Object.freeze({ flags: 4, records: 2, options: 8, prototypeDepth: 16, idChars: 96 });
const SESSION = 'editor-session-only';
const object = value => value !== null && (typeof value === 'object' || typeof value === 'function');
const guardErrors = new WeakMap();
function fail(code) { const error = new Error(code); guardErrors.set(error, code); throw error; }
function reason(error) { return object(error) ? guardErrors.get(error) ?? 'dialogue-read-threw' : 'dialogue-read-threw'; }
function data(value, key, label = key, required = false) {
  if (!object(value)) fail(label + '-object-required');
  let descriptor;
  try { descriptor = Object.getOwnPropertyDescriptor(value, key); }
  catch { fail(label + '-descriptor-threw'); }
  if (!descriptor) { if (required) fail(label + '-missing'); return undefined; }
  if (!Object.hasOwn(descriptor, 'value')) fail(label + '-accessor');
  return descriptor.value;
}
function synchronous(value, label) {
  if (!object(value)) fail(label + '-object-required');
  let current = value;
  for (let depth = 0; current !== null && depth < DIALOGUE_OBSERVATION_LIMITS.prototypeDepth; depth++) {
    let descriptor;
    try { descriptor = Object.getOwnPropertyDescriptor(current, 'then'); }
    catch { fail(label + '-then-descriptor-threw'); }
    if (descriptor && (!Object.hasOwn(descriptor, 'value') || typeof descriptor.value === 'function')) fail(label + '-thenable');
    try { current = Object.getPrototypeOf(current); }
    catch { fail(label + '-prototype-threw'); }
  }
  if (current !== null) fail(label + '-prototype-depth');
}
function record(value, label) {
  synchronous(value, label);
  if (typeof value !== 'object' || Array.isArray(value)) fail(label + '-record-required');
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) fail(label + '-nonplain');
  return value;
}
function id(value, label) {
  if (typeof value !== 'string' || !value.length || value.length > DIALOGUE_OBSERVATION_LIMITS.idChars || !/^[a-zA-Z0-9_.:-]+$/.test(value)) fail(label + '-invalid');
  return value;
}
function array(value, maximum, label) {
  synchronous(value, label);
  if (!Array.isArray(value)) fail(label + '-array-required');
  const length = data(value, 'length', label + '-length', true);
  if (!Number.isInteger(length) || length < 0 || length > maximum) fail(label + '-length-invalid');
  const result = [];
  for (let index = 0; index < length; index++) result.push(data(value, String(index), label + '-item', true));
  return result;
}
function trialEmpty() {
  const flags = {}, flagStates = {};
  for (const key of DIALOGUE_TRIAL_FLAGS) { flags[key] = null; flagStates[key] = 'UNKNOWN'; }
  return Object.freeze({ scope: SESSION, flags: Object.freeze(flags), flagStates: Object.freeze(flagStates), gift: Object.freeze([]), quest: Object.freeze([]) });
}
function unknown(code) {
  return Object.freeze({ linked: false, stateKnown: false, supported: null, isOpen: null, scope: null, sessionOnly: false,
    view: null, trial: trialEmpty(), providersUnknown: Object.freeze([code]), committed: false, committedPromoted: false,
    grant: null, reward: null, save: null, providerWrites: false });
}

/* A reader may return the live controller or a detached snapshot. Methods are own
 * data functions and retain their receiver. No nearest/open/choose/close is called.
 * All outputs below are detached scalars/arrays; no provider object escapes. */
export function readDialogueSnapshot(providerOrSnapshot, receiver) {
  try {
    let source = providerOrSnapshot;
    if (typeof source === 'function') { synchronous(source, 'dialogue-provider'); source = Reflect.apply(source, receiver, []); }
    synchronous(source, 'dialogue-provider');
    const snapshotMethod = data(source, 'snapshot', 'snapshot');
    if (snapshotMethod !== undefined) {
      if (typeof snapshotMethod !== 'function') fail('snapshot-not-callable');
      source = Reflect.apply(snapshotMethod, source, []);
    }
    const snapshot = record(source, 'snapshot');
    const supported = data(snapshot, 'supported', 'supported', true), isOpen = data(snapshot, 'isOpen', 'isOpen', true);
    if (typeof supported !== 'boolean') fail('supported-malformed');
    if (typeof isOpen !== 'boolean') fail('isOpen-malformed');
    const scope = data(snapshot, 'scope', 'scope', true);
    if (scope !== SESSION) fail('scope-not-editor-session');
    const issues = [];
    const attempt = (fn, fallback) => { try { return fn(); } catch (error) { issues.push(reason(error)); return fallback; } };
    const viewValue = attempt(() => data(snapshot, 'view', 'view', true), undefined);
    let view = null;
    if (isOpen) view = attempt(() => {
      const value = record(viewValue, 'view');
      const npcId = id(data(value, 'npcId', 'view-npcId', true), 'view-npcId');
      if (!RESIDENTS.includes(npcId)) fail('view-npcId-unsupported');
      const nodeId = id(data(value, 'nodeId', 'view-nodeId', true), 'view-nodeId');
      const options = array(data(value, 'options', 'view-options', true), DIALOGUE_OBSERVATION_LIMITS.options, 'view-options');
      const optionIds = options.map(option => id(data(record(option, 'view-option'), 'id', 'view-option-id', true), 'view-option-id'));
      return Object.freeze({ npcId, nodeId, optionIds: Object.freeze(optionIds) });
    }, null);
    else if (viewValue !== null) issues.push('closed-view-not-null');
    const flags = {}, flagStates = {};
    const flagMap = attempt(() => record(data(snapshot, 'trialFlags', 'trialFlags', true), 'trialFlags'), null);
    for (const key of DIALOGUE_TRIAL_FLAGS) {
      const value = attempt(() => {
        if (!flagMap) fail('trial-flag-map-unknown');
        const supplied = data(flagMap, key, 'trial-flag:' + key, true);
        if (typeof supplied !== 'boolean') fail('trial-flag:' + key + '-malformed');
        return supplied;
      }, null);
      flags[key] = value; flagStates[key] = value === null ? 'UNKNOWN' : 'KNOWN';
    }
    const gift = [], quest = [], seen = new Set();
    const entries = attempt(() => array(data(snapshot, 'trialRecords', 'trialRecords', true), DIALOGUE_OBSERVATION_LIMITS.records, 'trialRecords'), []);
    for (const entry of entries) attempt(() => {
      const value = record(entry, 'trial-record');
      const kind = data(value, 'kind', 'trial-record-kind', true);
      const expected = kind === 'gift' ? RECORDS.gift : kind === 'quest' ? RECORDS.quest : null;
      if (!expected) fail('trial-record-kind-unsupported');
      const npcId = data(value, 'npcId', 'trial-record-npcId', true), ref = data(value, 'ref', 'trial-record-ref', true);
      if (npcId !== expected.npcId || ref !== expected.ref || seen.has(kind)) fail('trial-record-identity-invalid');
      if (data(value, 'actualGrant', 'trial-record-actualGrant', true) !== false) fail('trial-record-actualGrant-conflict');
      if (data(value, 'scope', 'trial-record-scope', true) !== SESSION) fail('trial-record-scope-conflict');
      seen.add(kind);
      const copied = Object.freeze({ kind, npcId, ref, actualGrant: false, scope: SESSION });
      (kind === 'gift' ? gift : quest).push(copied);
    }, undefined);
    return Object.freeze({ linked: true, stateKnown: issues.length === 0, supported, isOpen, scope, sessionOnly: true, view,
      trial: Object.freeze({ scope: SESSION, flags: Object.freeze(flags), flagStates: Object.freeze(flagStates), gift: Object.freeze(gift), quest: Object.freeze(quest) }),
      providersUnknown: Object.freeze([...new Set(issues)]), committed: false, committedPromoted: false,
      grant: null, reward: null, save: null, providerWrites: false });
  } catch (error) { return unknown(reason(error)); }
}

export function createDialogueObservationConsumer(options = {}) {
  let provider, setupIssue = null;
  try { provider = data(options, 'dialogueProvider', 'dialogueProvider'); if (provider === undefined) provider = data(options, 'dialogue', 'dialogue'); }
  catch (error) { setupIssue = reason(error); }
  let last = unknown('unobserved');
  function observe(snapshotOverride) {
    last = setupIssue ? unknown(setupIssue) : readDialogueSnapshot(snapshotOverride === undefined ? provider : snapshotOverride, options);
    return last;
  }
  return Object.freeze({ observe, snapshot: () => last,
    describeContract: () => Object.freeze({ provenance: DIALOGUE_OBSERVATION_PROVENANCE, limits: DIALOGUE_OBSERVATION_LIMITS,
      provider: 'own-data snapshot method or explicit reader returning controller/snapshot',
      scope: SESSION, providerWrites: false, committed: false, actualGrant: false, ownRaf: false, ownTimers: false }) });
}
