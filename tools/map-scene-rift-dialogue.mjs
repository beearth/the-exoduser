/* Pure, session-only STORY consumer for the isolated painted-rift editor.
 * raw.poi is reference lore, never an executable placement. All four world anchors must
 * be supplied by the integrator. Independent residents isolate blocked feet; original
 * painted proxies still require all four feet. No fetch/DOM/input/timer/storage/item/gate integration.
 * Keep the supplied player object live while open; close before replacing player/scene.
 */
import { supportsRiftAmbience } from './map-scene-rift-ambience.mjs';
import { residentPaintingProfile } from './map-scene-rift-residents.mjs';

export const RIFT_DIALOGUE_LIMITS = Object.freeze({
  range: 140, maxRange: 240, approachStep: 20, radius: 12, maxTransitions: 64,
  maxRawChars: 128000, maxNodesPerNpc: 32, maxOptionsPerNode: 8, maxTextChars: 2400, maxCloseReasonChars: 96
});
const END_ID = 'STORY-CH1A-RIFT-DIALOGUE-CANDIDATE-20261006';
const DEFINITIONS = Object.freeze([
  ['rift-rest-haran', 'arrival-guide', 'rift.haran.met'],
  ['rift-gift-berin', 'gift-giver', 'rift.berin.giftGiven'],
  ['rift-request-nessa', 'rescue-request', 'rift.nessa.questAccepted'],
  ['rift-prepare-dorik', 'departure-guide', 'rift.dorik.met']
]);
const ACTIONS = new Set(['dialogue.close', 'dialogue.next', 'gift.offer', 'gift.accept', 'gift.decline', 'quest.accept', 'quest.decline', 'quest.recall']);
const NOTICE = Object.freeze({ ko: '대화 시험 · 선택은 게임에 저장되지 않습니다', en: 'Dialogue test · Choices are not saved to the game' });
const RECORD_LABEL = Object.freeze({ ko: '시험용 기록', en: 'Trial record' });
const ART_CROPS = Object.freeze([
  ['west-0', 'west', 0, 0, 641, 961], ['west-1', 'west', 0, 959, 641, 961],
  ['east-0', 'east', 1279, 0, 641, 961], ['east-1', 'east', 1279, 959, 641, 961],
  ['centre-0', 'centre', 639, 0, 642, 961], ['centre-1', 'centre', 639, 959, 642, 961]
]);
const clone = value => JSON.parse(JSON.stringify(value));
const own = (value, key) => Object.hasOwn(value, key);
function fail() { throw new Error('invalid dialogue candidate'); }
function text(value, max = 160) { if (typeof value !== 'string' || !value.trim() || value.length > max) fail(); return value; }
function id(value) { text(value, 96); if (!/^[a-zA-Z0-9_.:-]+$/.test(value)) fail(); return value; }
function localized(value, max = RIFT_DIALOGUE_LIMITS.maxTextChars) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  return { ko: text(value.ko, max), en: text(value.en, max) };
}
function flags(value, allowed) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 1 || value.some(v => v !== allowed)) fail();
  return [...value];
}
function validateRaw(input) {
  const serialized = JSON.stringify(input);
  if (!serialized || serialized.length > RIFT_DIALOGUE_LIMITS.maxRawChars) fail();
  const raw = JSON.parse(serialized);
  if (raw.schemaVersion !== 1 || raw.sceneId !== 'hell-rift-ch1-ch2' || raw.role !== 'STORY' || raw.endId !== END_ID || raw.candidate !== true) fail();
  if (raw.geometry?.grid !== 200 || raw.geometry.tile !== 40 || !Array.isArray(raw.npcs) || raw.npcs.length !== 4) fail();
  if (!raw.actions?.vocabulary || ![...ACTIONS].every(a => own(raw.actions.vocabulary, a))) fail();
  if (!raw.stateKeys?.keys || !DEFINITIONS.every(d => own(raw.stateKeys.keys, d[2]))) fail();
  const result = new Map();
  for (const [npcId, role, flag] of DEFINITIONS) {
    const matches = raw.npcs.filter(n => n?.npcId === npcId);
    if (matches.length !== 1 || matches[0].role !== role) fail();
    const npc = matches[0], nodes = new Map();
    if (!npc.nodes || typeof npc.nodes !== 'object' || Array.isArray(npc.nodes)) fail();
    const entries = Object.entries(npc.nodes);
    if (!entries.length || entries.length > RIFT_DIALOGUE_LIMITS.maxNodesPerNpc) fail();
    const giftRef = role === 'gift-giver' ? id(npc.gift?.giftRef) : null;
    const questRef = role === 'rescue-request' ? id(npc.quest?.questRef) : null;
    if (giftRef && (giftRef !== 'story.berin.keepsake' || npc.gift.grantOnce !== true)) fail();
    if (questRef && (questRef !== 'story.nessa.findLin' || npc.quest.kind !== 'optional-objective')) fail();
    for (const [nodeId, node] of entries) {
      id(nodeId);
      if (!node || typeof node !== 'object' || Array.isArray(node)) fail();
      const options = node.options === undefined ? [] : node.options;
      if (!Array.isArray(options) || options.length > RIFT_DIALOGUE_LIMITS.maxOptionsPerNode) fail();
      const ids = new Set(), normalized = [];
      for (const option of options) {
        if (!option || typeof option !== 'object' || Array.isArray(option)) fail();
        id(option.id); if (ids.has(option.id) || !ACTIONS.has(option.action)) fail(); ids.add(option.id);
        const action = option.action, next = action === 'dialogue.close' ? null : id(action.endsWith('.accept') ? option.onSuccess : option.next);
        const failure = action.endsWith('.accept') ? id(option.onFailure) : null;
        if (action.startsWith('gift.') && !giftRef || action.startsWith('quest.') && !questRef) fail();
        if (action === 'gift.accept' && option.giftRef !== giftRef || action === 'quest.accept' && option.questRef !== questRef) fail();
        const set = flags(option.set, flag);
        // Only explicit close options may set meeting flags. Reward flags belong to
        // successful preview nodes and are additionally guarded by the preview ledger.
        if (set.length && (action !== 'dialogue.close' || giftRef || questRef)) fail();
        normalized.push({ id: option.id, label: localized(option.label, 320), action, next, failure, set });
      }
      nodes.set(nodeId, { speaker: text(node.speaker), text: localized(node.text), set: flags(node.set, flag), options: normalized });
    }
    const successTargets = new Set();
    for (const node of nodes.values()) for (const option of node.options) {
      if (option.next && !nodes.has(option.next) || option.failure && !nodes.has(option.failure)) fail();
      if (option.failure && nodes.get(option.failure).set.includes(flag)) fail();
      if (option.action.endsWith('.accept') && !nodes.get(option.next).set.includes(flag)) fail();
      if (option.action.endsWith('.accept')) successTargets.add(option.next);
    }
    if (giftRef || questRef) for (const [nodeId, node] of nodes) if (node.set.length && !successTargets.has(nodeId)) fail();
    if (!Array.isArray(npc.entry) || !npc.entry.length || npc.entry.length > 8) fail();
    const entry = npc.entry.map((e, i) => {
      if (!e || typeof e !== 'object' || Array.isArray(e)) fail();
      if (own(e, 'default')) {
        if (i !== npc.entry.length - 1 || own(e, 'when') || own(e, 'node') || !nodes.has(id(e.default))) fail();
        return { node: e.default, when: null };
      }
      if (i === npc.entry.length - 1 || e.when !== flag || !nodes.has(id(e.node))) fail();
      return { node: e.node, when: e.when };
    });
    result.set(npcId, { npcId, role, flag, name: localized(npc.name, 160), giftRef, questRef, entry, nodes });
  }
  return result;
}

/** Fixed interaction proxies are meaningful only on the original six painted crops. */
export function supportsRiftDialogueScene(scene) {
  if (!supportsRiftAmbience(scene)) return false;
  const ratio=(residentPaintingProfile(scene)?.size||1920)/1920;
  return ART_CROPS.every(([assetId, layerId, x, y, w, h]) => {
    const l = scene.layers.find(v => v.id === layerId), a = scene.assets.find(v => v.id === assetId), o = l.objects.find(v => v.id === `obj-${assetId}`);
    if (!l.visible || !a.crop || !o || o.rotation !== 0 || o.pivotX !== 0 || o.pivotY !== 0 || o.flipX || o.opacity !== 1 || o.mask !== undefined) return false;
    return [a.crop.x-x*ratio,a.crop.y-y*ratio,a.crop.w-w*ratio,a.crop.h-h*ratio].every(d=>Math.abs(d)<=1e-6) &&
      [o.x - x * 25 / 6, o.y - y * 25 / 6, o.width - w * 25 / 6, o.height - h * 25 / 6].every(d => Math.abs(d) <= 1e-6);
  });
}

/** Returns a controller or null; anchors = [{npcId,x,y}] in world pixels, exactly four. */
export function createRiftDialogue(scene, raw, canWalk, anchors) {
  if (!supportsRiftDialogueScene(scene) || typeof canWalk !== 'function') return null;
  const independent = !!residentPaintingProfile(scene);
  let npcs, positions;
  try {
    npcs = validateRaw(raw);
    if (!Array.isArray(anchors) || anchors.length !== 4) fail();
    positions = new Map();
    for (const a of anchors) {
      if (!a || !npcs.has(a.npcId) || positions.has(a.npcId) || !Number.isFinite(a.x) || !Number.isFinite(a.y) || a.x < 0 || a.x >= 8000 || a.y < 0 || a.y >= 8000) fail();
      if (!independent && canWalk(scene,a.x,a.y,RIFT_DIALOGUE_LIMITS.radius)!==true) fail();
      positions.set(a.npcId, { x: a.x, y: a.y });
    }
  } catch (_) { return null; }
  function onGround(p) {
    try { return canWalk(scene,p.x,p.y,RIFT_DIALOGUE_LIMITS.radius)===true; }
    catch (_) { return false; }
  }
  if(independent && ![...positions.values()].some(onGround)) return null;
  const trialFlags = new Set(), records = new Map();
  let conversation = null, closeReason = null, lastAction = null, lastTransitions = 0;
  function supported() {
    if (!supportsRiftDialogueScene(scene)) return false;
    return independent ? [...positions.values()].some(onGround) : [...positions.values()].every(onGround);
  }
  function normalizeRange(range) {
    return Number.isFinite(range) && range > 0 ? Math.min(range, RIFT_DIALOGUE_LIMITS.maxRange) : null;
  }
  function reachable(npcId, player, range) {
    if (!player || !Number.isFinite(player.x) || !Number.isFinite(player.y)) return null;
    const a = positions.get(npcId); if (!a) return null;
    const distance = Math.hypot(player.x - a.x, player.y - a.y);
    if (distance > range) return null;
    try {
      const steps = Math.max(1, Math.ceil(distance / RIFT_DIALOGUE_LIMITS.approachStep));
      for (let i = 0; i <= steps; i++) if (canWalk(scene, player.x + (a.x - player.x) * i / steps, player.y + (a.y - player.y) * i / steps, RIFT_DIALOGUE_LIMITS.radius)!==true) return null;
    } catch (_) { return null; }
    return distance;
  }
  function finish(reason) {
    if (conversation) lastTransitions = conversation.transitions;
    conversation = null; closeReason = reason;
  }
  function refresh() {
    const available = supported();
    if (!available && conversation) finish('inactive-scene');
    else if (conversation && reachable(conversation.npcId, conversation.player, conversation.range) === null) finish('out-of-range');
    return available;
  }
  function previewRef(npc) { return npc.giftRef ? `gift:${npc.giftRef}` : npc.questRef ? `quest:${npc.questRef}` : null; }
  function setFlags(npc, values) {
    for (const key of values) if (!previewRef(npc) || records.has(previewRef(npc))) trialFlags.add(key);
  }
  function entryNode(npc) { return npc.entry.find(e => !e.when || trialFlags.has(e.when)).node; }
  function enter(nodeId) {
    if (++conversation.transitions > RIFT_DIALOGUE_LIMITS.maxTransitions) { finish('transition-limit'); return; }
    const npc = npcs.get(conversation.npcId); conversation.nodeId = nodeId;
    setFlags(npc, npc.nodes.get(nodeId).set);
  }
  function view() {
    if (!conversation) return null;
    const npc = npcs.get(conversation.npcId), node = npc.nodes.get(conversation.nodeId);
    return {
      npcId: npc.npcId, nodeId: conversation.nodeId, name: { ...npc.name }, speaker: node.speaker,
      text: { ...node.text }, terminal: node.options.length === 0,
      options: node.options.map(o => ({ id: o.id, label: { ...o.label }, action: o.action })),
      notice: { ...NOTICE }
    };
  }
  function snapshot() {
    const available = refresh();
    return {
      supported: available, isOpen: !!conversation, view: view(), scope: 'editor-session-only',
      trialFlags: Object.fromEntries(DEFINITIONS.map(d => [d[2], trialFlags.has(d[2])])),
      trialRecords: [...records.values()].map(clone), lastAction: lastAction && clone(lastAction),
      closeReason, transitions: conversation?.transitions ?? lastTransitions
    };
  }
  function nearest(player, range = RIFT_DIALOGUE_LIMITS.range) {
    if (!refresh()) return null;
    const limit = normalizeRange(range); if (limit === null) return null;
    let result = null;
    for (const [npcId, a] of positions) {
      const distance = reachable(npcId, player, limit);
      if (distance === null || result && distance >= result.distance) continue;
      const npc = npcs.get(npcId); result = { npcId, name: { ...npc.name }, x: a.x, y: a.y, distance };
    }
    return result;
  }
  function open(npcId, player, range = RIFT_DIALOGUE_LIMITS.range) {
    const limit = normalizeRange(range);
    if (!refresh() || limit === null || !npcs.has(npcId) || reachable(npcId, player, limit) === null) return null;
    conversation = { npcId, player, range: limit, nodeId: null, transitions: 0 };
    closeReason = null; lastAction = null; lastTransitions = 0;
    enter(entryNode(npcs.get(npcId))); return snapshot();
  }
  function choose(optionId) {
    if (!refresh() || !conversation) return null;
    const npc = npcs.get(conversation.npcId), node = npc.nodes.get(conversation.nodeId), option = node.options.find(o => o.id === optionId);
    if (!option) return null;
    if (option.action !== 'dialogue.close' && conversation.transitions >= RIFT_DIALOGUE_LIMITS.maxTransitions) { finish('transition-limit'); return snapshot(); }
    lastAction = { npcId: npc.npcId, optionId: option.id, action: option.action, outcome: 'display-only', scope: 'editor-session-only' };
    if (option.action === 'dialogue.close') {
      setFlags(npc, option.set); lastAction.outcome = 'closed'; finish('dialogue.close'); return snapshot();
    }
    let next = option.next;
    if (option.action === 'gift.accept' || option.action === 'quest.accept') {
      const kind = option.action === 'gift.accept' ? 'gift' : 'quest', ref = kind === 'gift' ? npc.giftRef : npc.questRef, key = `${kind}:${ref}`;
      if (!records.has(key)) {
        records.set(key, { kind, ref, npcId: npc.npcId, name: { ...npc.name }, label: { ...RECORD_LABEL }, scope: 'editor-session-only', actualGrant: false });
        lastAction.outcome = 'trial-recorded';
      } else { lastAction.outcome = 'already-recorded'; next = entryNode(npc); }
      lastAction.ref = ref;
    } else if (option.action.endsWith('.decline')) lastAction.outcome = 'declined';
    enter(next); return snapshot();
  }
  function close(reason = 'manual') {
    const normalized = typeof reason === 'string' ? reason.trim() : '';
    finish(normalized && normalized.length <= RIFT_DIALOGUE_LIMITS.maxCloseReasonChars ? normalized : 'manual');
    return snapshot();
  }
  return Object.freeze({ nearest, open, choose, close, snapshot });
}
