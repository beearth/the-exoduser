'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const scenePath = path.join(root, 'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json');
const residentScenePath = path.join(root, 'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
const rawPath = path.join(__dirname, 'team-followup-20261005/hell-rift/STORY/rift-dialogue.json');
const apiPromise = import(pathToFileURL(path.join(__dirname, 'map-scene-rift-dialogue.mjs')).href);
const residentApiPromise = import(pathToFileURL(path.join(__dirname, 'map-scene-rift-residents.mjs')).href);
const context = vm.createContext({ module: { exports: {} } });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'map-scene-core.js'), 'utf8'), context, { filename: 'map-scene-core.js' });
const K = context.module.exports;
const clone = v => JSON.parse(JSON.stringify(v));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const IDS = ['rift-rest-haran', 'rift-gift-berin', 'rift-request-nessa', 'rift-prepare-dorik'];
// Existing actor reviewer supplied these exact world anchors and approach positions.
const ANCHORS = IDS.map((npcId, i) => ({ npcId, x: [4780, 6020, 6300, 5220][i], y: [6460, 5580, 5020, 2500][i] }));
const APPROACHES = [{ x: 4820, y: 6500 }, { x: 5980, y: 5620 }, { x: 6220, y: 5020 }, { x: 5180, y: 2540 }];
const walk = (p, x, y, radius) => K.canWalk(p, x, y, radius);
function inputs() { return { scene: JSON.parse(fs.readFileSync(scenePath, 'utf8')), raw: JSON.parse(fs.readFileSync(rawPath, 'utf8')), anchors: clone(ANCHORS) }; }
async function fixture() {
  const api = await apiPromise, input = inputs();
  return { api, ...input, c: api.createRiftDialogue(input.scene, input.raw, walk, input.anchors) };
}
async function residentInputs() {
  const [api, residents] = await Promise.all([apiPromise, residentApiPromise]);
  const bytes = fs.readFileSync(residentScenePath);
  assert.equal(hash(bytes), 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');
  const scene = JSON.parse(bytes), raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  assert.ok(residents.residentPaintingProfile(scene));
  const anchors = residents.residentDialogueAnchors(scene);
  return { api, residents, scene, raw, anchors, approaches: anchors.map(a => clone(a.approach)) };
}
function footCell(scene, anchor) {
  return Math.floor(anchor.y / scene.world.tileSize) * scene.world.cols + Math.floor(anchor.x / scene.world.tileSize);
}
const samePoint = (x, y, point) => Math.abs(x - point.x) < 1e-6 && Math.abs(y - point.y) < 1e-6;
const rejectedWalkResults = [
  ['Promise', () => Promise.resolve(true)],
  ['truthy number', () => 1],
  ['thrown callback', () => { throw new Error('walk query unavailable'); }]
];
function node(snapshot, expected) { assert.ok(snapshot?.isOpen); assert.equal(snapshot.view.nodeId, expected); }
function acceptGift(c, player) { node(c.open(IDS[1], player), 'meet'); node(c.choose('o_listen'), 'story'); node(c.choose('o_accept'), 'offer'); return c.choose('o_take'); }
function acceptQuest(c, player) { node(c.open(IDS[2], player), 'meet'); node(c.choose('o_listen'), 'story'); return c.choose('o_accept'); }

test('original STORY and fixed scene create a session-only controller with the four checked anchors', async () => {
  const { api, c, scene } = await fixture(); assert.ok(c); assert.equal(api.supportsRiftDialogueScene(scene), true);
  for (let i = 0; i < 4; i++) {
    const a = ANCHORS[i], p = APPROACHES[i]; assert.equal(K.canWalk(scene, a.x, a.y, 12), true); assert.equal(K.canWalk(scene, p.x, p.y, 12), true);
    const n = c.nearest(p); assert.equal(n.npcId, IDS[i]); assert.equal(n.x, a.x); assert.equal(n.y, a.y); assert.ok(n.distance <= 140);
  }
  const s = c.snapshot(); assert.equal(s.supported, true); assert.equal(s.isOpen, false); assert.equal(s.scope, 'editor-session-only'); assert.deepEqual(s.trialRecords, []);
  assert.equal(Object.values(s.trialFlags).some(Boolean), false);
});

test('invalid or oversized candidates, unsafe actions/references/flags and bad anchors return null', async () => {
  const { api, scene } = await fixture();
  const invalid = [null, {}, { ...inputs().raw, schemaVersion: 2 }, { ...inputs().raw, sceneId: 'ch1' }, { ...inputs().raw, padding: 'x'.repeat(128001) }];
  for (const edit of [
    r => { r.npcs[0].nodes.meet.options[0].action = 'quest.complete'; },
    r => { r.npcs[0].nodes.meet.options[0].next = 'missing'; },
    r => { r.npcs[0].nodes.meet.options.push(clone(r.npcs[0].nodes.meet.options[0])); },
    r => { r.npcs[0].entry[0].when = 'arbitrary(expression)'; },
    r => { r.npcs[0].entry[1] = { when: 'rift.haran.met', node: 'meet' }; },
    r => { r.npcs[1].nodes.offer.options[0].giftRef = 'new.item'; },
    r => { delete r.npcs[1].nodes.offer.options[0].onFailure; },
    r => { r.npcs[1].nodes.bagFull.set = ['rift.berin.giftGiven']; },
    r => { r.npcs[1].nodes.meet.set = ['rift.berin.giftGiven']; },
    r => { r.npcs[1].nodes.given.set = []; },
    r => { r.npcs[2].nodes.story.options[0].questRef = 'new.quest'; },
    r => { r.npcs[2].nodes.acceptFail.set = ['rift.nessa.questAccepted']; },
    r => { r.npcs[3].nodes.meet.options[0].set = ['rift.haran.met']; },
    r => { r.npcs[0].nodes.meet.text.ko = 'x'.repeat(2401); },
    r => { r.npcs[0].nodes.meet.options = new Array(9).fill(r.npcs[0].nodes.meet.options[0]); },
    r => { r.npcs[0].npcId = IDS[1]; }
  ]) { const raw = inputs().raw; edit(raw); invalid.push(raw); }
  const cyclic = inputs().raw; cyclic.self = cyclic; invalid.push(cyclic);
  for (const raw of invalid) assert.equal(api.createRiftDialogue(scene, raw, walk, clone(ANCHORS)), null);
  for (const anchors of [null, [], ANCHORS.slice(1), [...ANCHORS, ANCHORS[0]], ANCHORS.map(a => ({ ...a, x: Number.NaN })), ANCHORS.map(a => ({ ...a, x: 0, y: 0 })), [ANCHORS[0], ANCHORS[0], ANCHORS[2], ANCHORS[3]]]) assert.equal(api.createRiftDialogue(scene, inputs().raw, walk, anchors), null);
  assert.equal(api.createRiftDialogue(scene, inputs().raw, () => { throw new Error('no walk'); }, clone(ANCHORS)), null);
});

test('generic/changed painted scenes cannot activate fixed NPC proxies', async () => {
  const api = await apiPromise;
  for (const edit of [
    p => { delete p.productionStatus; }, p => { p.layers[1].objects[0].x += 40; },
    p => { p.layers[2].objects[0].rotation = 5; }, p => { p.layers[0].visible = false; },
    p => { p.assets.find(a => a.id === 'east-0').crop.x += 1; }, p => { p.layers[2].objects[1].flipX = true; }
  ]) {
    const { scene, raw, anchors } = inputs(); edit(scene);
    assert.equal(api.supportsRiftDialogueScene(scene), false); assert.equal(api.createRiftDialogue(scene, raw, walk, anchors), null);
  }
});

test('distance and radius-12 direct walking approach are mandatory, not only an NPC distance', async () => {
  const { api, scene, raw, anchors } = inputsWithApi(await apiPromise);
  const p = clone(APPROACHES[2]);
  scene.walkable[Math.floor(5020 / 40) * 200 + Math.floor(6260 / 40)] = 0;
  assert.equal(K.canWalk(scene, anchors[2].x, anchors[2].y, 12), true); assert.equal(K.canWalk(scene, p.x, p.y, 12), true);
  const c = api.createRiftDialogue(scene, raw, walk, anchors); assert.ok(c);
  assert.equal(c.nearest(p), null); assert.equal(c.open(IDS[2], p), null);
  for (const bad of [null, { x: 0, y: 0 }, { x: Number.NaN, y: 5580 }, { x: 6020, y: Infinity }]) assert.equal(c.open(IDS[1], bad), null);
  assert.equal(c.nearest(APPROACHES[1], 0), null); assert.equal(c.nearest(APPROACHES[1], Infinity), null);
  assert.equal(c.open('unknown', APPROACHES[1]), null);
});
function inputsWithApi(api) { return { api, ...inputs() }; }

test('range is capped and per-tick nearest reads small metadata without rebuilding STORY', async () => {
  const { scene, raw, anchors } = inputs();
  const module = await apiPromise; let calls = 0;
  const c = module.createRiftDialogue(scene, raw, (p, x, y, radius) => { calls++; assert.equal(radius, 12); return walk(p, x, y, radius); }, anchors);
  const before = JSON.stringify(c.snapshot()), baseline = calls;
  for (let i = 0; i < 120; i++) {
    const nearest = c.nearest(APPROACHES[1], 1000000); assert.equal(nearest.npcId, IDS[1]);
    assert.deepEqual(Object.keys(nearest).sort(), ['distance', 'name', 'npcId', 'x', 'y']);
  }
  assert.ok(calls - baseline <= 120 * 60); assert.equal(JSON.stringify(c.snapshot()), before);
  assert.equal(module.RIFT_DIALOGUE_LIMITS.maxRange, 240);
});

test('guide dialogue close sets only its explicit meeting flag and revisit uses that session state', async () => {
  const { c } = await fixture();
  node(c.open(IDS[0], APPROACHES[0]), 'meet'); node(c.choose('o_dir'), 'directions');
  const closed = c.choose('o_leave'); assert.equal(closed.isOpen, false); assert.equal(closed.closeReason, 'dialogue.close');
  assert.equal(closed.trialFlags['rift.haran.met'], true); assert.equal(closed.trialFlags['rift.dorik.met'], false); assert.deepEqual(closed.trialRecords, []);
  node(c.open(IDS[0], APPROACHES[0]), 'revisit'); c.close();
  node(c.open(IDS[3], APPROACHES[3]), 'meet'); node(c.choose('o_ask'), 'ascent'); c.choose('o_leave');
  node(c.open(IDS[3], APPROACHES[3]), 'revisit'); assert.equal(c.snapshot().trialFlags['rift.dorik.met'], true);
});

test('gift offer/decline do not grant; accept records exactly one trial and repeat clicks do nothing', async () => {
  const { c } = await fixture(); const p = APPROACHES[1];
  c.open(IDS[1], p); c.choose('o_listen'); c.choose('o_accept'); node(c.choose('o_decline'), 'declined');
  assert.deepEqual(c.snapshot().trialRecords, []); assert.equal(c.snapshot().trialFlags['rift.berin.giftGiven'], false); c.close();
  const accepted = acceptGift(c, p); node(accepted, 'given'); assert.equal(accepted.trialRecords.length, 1);
  const record = accepted.trialRecords[0]; assert.equal(record.ref, 'story.berin.keepsake'); assert.equal(record.kind, 'gift'); assert.equal(record.label.ko, '시험용 기록'); assert.equal(record.actualGrant, false); assert.equal(record.scope, 'editor-session-only');
  assert.equal(accepted.trialFlags['rift.berin.giftGiven'], true); assert.equal(c.choose('o_take'), null); assert.equal(c.snapshot().trialRecords.length, 1);
  c.choose('o_close'); node(c.open(IDS[1], p), 'afterGift'); assert.equal(c.choose('o_take'), null); assert.equal(c.snapshot().trialRecords.length, 1);
});

test('quest declines stay optional; accept and clue revisit never add completion or a second record', async () => {
  const { c } = await fixture(); const p = APPROACHES[2];
  c.open(IDS[2], p); c.choose('o_listen'); node(c.choose('o_decline'), 'declined'); assert.deepEqual(c.snapshot().trialRecords, []); c.close();
  const accepted = acceptQuest(c, p); node(accepted, 'accepted'); assert.equal(accepted.trialFlags['rift.nessa.questAccepted'], true);
  assert.equal(accepted.trialRecords.length, 1); assert.equal(accepted.trialRecords[0].ref, 'story.nessa.findLin'); assert.equal(accepted.trialRecords[0].kind, 'quest'); assert.equal(accepted.trialRecords[0].actualGrant, false);
  node(c.choose('o_recall'), 'clue'); node(c.choose('o_back'), 'afterAccept'); c.choose('o_close');
  node(c.open(IDS[2], p), 'afterAccept'); node(c.choose('o_recall'), 'clue'); assert.equal(c.snapshot().trialRecords.length, 1);
  assert.equal(Object.keys(c.snapshot().trialFlags).some(key => /complete|rescue/i.test(key)), false);
});

test('ledger prevents duplicate one-shot trials even if a later raw option repeats an accept action', async () => {
  const api = await apiPromise, { scene, raw, anchors } = inputs();
  raw.npcs[1].nodes.afterGift.options.push(clone(raw.npcs[1].nodes.offer.options[0]));
  raw.npcs[2].nodes.afterAccept.options.push(clone(raw.npcs[2].nodes.story.options[0]));
  const c = api.createRiftDialogue(scene, raw, walk, anchors); assert.ok(c);
  acceptGift(c, APPROACHES[1]); c.close(); c.open(IDS[1], APPROACHES[1]);
  const againGift = c.choose('o_take'); node(againGift, 'afterGift'); assert.equal(againGift.lastAction.outcome, 'already-recorded'); assert.equal(againGift.trialRecords.length, 1); c.close();
  acceptQuest(c, APPROACHES[2]); c.close(); c.open(IDS[2], APPROACHES[2]);
  const againQuest = c.choose('o_accept'); node(againQuest, 'afterAccept'); assert.equal(againQuest.lastAction.outcome, 'already-recorded'); assert.equal(againQuest.trialRecords.length, 2);
});

test('failure/terminal nodes do not commit rewards and the common close ends optionless dialogue', async () => {
  const api = await apiPromise;
  for (const [i, terminal] of [[1, 'bagFull'], [2, 'acceptFail']]) {
    const { scene, raw, anchors } = inputs(); raw.npcs[i].entry = [{ default: terminal }];
    const c = api.createRiftDialogue(scene, raw, walk, anchors); node(c.open(IDS[i], APPROACHES[i]), terminal);
    assert.deepEqual(c.snapshot().trialRecords, []); assert.equal(Object.values(c.snapshot().trialFlags).some(Boolean), false); assert.equal(c.choose('o_close').isOpen, false);
  }
  const { scene, raw, anchors } = inputs(); raw.npcs[0].nodes.meet.options = [];
  const c = api.createRiftDialogue(scene, raw, walk, anchors), opened = c.open(IDS[0], APPROACHES[0]);
  assert.equal(opened.view.terminal, true); assert.deepEqual(opened.view.options, []); assert.equal(c.choose('unknown'), null);
  assert.equal(c.close().isOpen, false); assert.equal(c.snapshot().closeReason, 'manual'); node(c.open(IDS[0], APPROACHES[0]), 'meet');
});

test('live player departure and invalid nav/scene close before an accept can write a trial', async () => {
  const { c, scene } = await fixture(), player = clone(APPROACHES[1]);
  c.open(IDS[1], player); c.choose('o_listen'); c.choose('o_accept'); player.x += 1000;
  assert.equal(c.choose('o_take'), null); assert.equal(c.snapshot().isOpen, false); assert.equal(c.snapshot().closeReason, 'out-of-range'); assert.deepEqual(c.snapshot().trialRecords, []);
  player.x -= 1000; c.open(IDS[1], player); c.choose('o_listen'); c.choose('o_accept');
  scene.walkable[Math.floor(ANCHORS[1].y / 40) * 200 + Math.floor(ANCHORS[1].x / 40)] = 0;
  assert.equal(c.choose('o_take'), null); assert.equal(c.snapshot().supported, false); assert.equal(c.snapshot().closeReason, 'inactive-scene'); assert.deepEqual(c.snapshot().trialRecords, []);
  const second = await fixture(); second.c.open(IDS[0], APPROACHES[0]); second.scene.layers[1].objects[0].width += 1;
  assert.equal(second.c.snapshot().isOpen, false); assert.equal(second.c.snapshot().supported, false);
});

test('node loops stop at 64 entries and an accept at the limit cannot record a reward', async () => {
  const { c } = await fixture(); c.open(IDS[0], APPROACHES[0]);
  let s; for (let i = 0; i < 64; i++) { s = c.choose(i % 2 === 0 ? 'o_where' : 'o_back'); if (!s?.isOpen) break; }
  assert.equal(s.isOpen, false); assert.equal(s.closeReason, 'transition-limit'); assert.equal(s.transitions, 64); assert.deepEqual(s.trialRecords, []);
  const api = await apiPromise, { scene, raw, anchors } = inputs(); raw.npcs[1].entry = [{ default: 'offer' }]; raw.npcs[1].nodes.offer.options[1].next = 'offer';
  const gift = api.createRiftDialogue(scene, raw, walk, anchors); gift.open(IDS[1], APPROACHES[1]);
  for (let i = 1; i < 64; i++) assert.equal(gift.choose('o_decline').isOpen, true);
  const limited = gift.choose('o_take'); assert.equal(limited.isOpen, false); assert.equal(limited.closeReason, 'transition-limit'); assert.deepEqual(limited.trialRecords, []); assert.equal(limited.trialFlags['rift.berin.giftGiven'], false);
});

test('raw/anchors and returned views are isolated from external mutation; new sessions forget trials', async () => {
  const api = await apiPromise, { scene, raw, anchors } = inputs(), c = api.createRiftDialogue(scene, raw, walk, anchors);
  raw.npcs[0].nodes.meet.text.ko = 'external mutation'; anchors[0].x = -999;
  const nearest = c.nearest(APPROACHES[0]); assert.equal(nearest.x, 4780); nearest.name.ko = 'wrong';
  const opened = c.open(IDS[0], APPROACHES[0]); assert.notEqual(opened.view.text.ko, 'external mutation'); opened.view.text.ko = 'wrong'; opened.view.options[0].label.ko = 'wrong'; opened.trialFlags['rift.haran.met'] = true;
  const fresh = c.snapshot(); assert.notEqual(fresh.view.text.ko, 'wrong'); assert.notEqual(fresh.view.options[0].label.ko, 'wrong'); assert.equal(fresh.trialFlags['rift.haran.met'], false); c.close();
  const earned = acceptGift(c, APPROACHES[1]); earned.trialRecords[0].ref = 'wrong'; assert.equal(c.snapshot().trialRecords[0].ref, 'story.berin.keepsake');
  const clean = inputs(), second = api.createRiftDialogue(clean.scene, clean.raw, walk, clean.anchors); assert.deepEqual(second.snapshot().trialRecords, []); assert.equal(Object.values(second.snapshot().trialFlags).some(Boolean), false);
});

test('explicit bounded close reasons survive later scene invalidation and preserve the session ledger', async () => {
  const { api, c, scene } = await fixture(); acceptGift(c, APPROACHES[1]);
  const ledger = clone(c.snapshot().trialRecords), flags = clone(c.snapshot().trialFlags);
  for (const reason of ['scene', 'blur', 'edit', 'escape', 'x'.repeat(96)]) {
    c.open(IDS[0], APPROACHES[0]); const closed = c.close(` ${reason} `);
    assert.equal(closed.isOpen, false); assert.equal(closed.closeReason, reason);
    assert.deepEqual(closed.trialRecords, ledger); assert.deepEqual(closed.trialFlags, flags);
    assert.equal(c.snapshot().closeReason, reason);
  }
  for (const invalid of [undefined, '', '   ', 'x'.repeat(97), 7, {}, null]) {
    c.open(IDS[0], APPROACHES[0]); assert.equal(c.close(invalid).closeReason, 'manual');
  }
  c.open(IDS[0], APPROACHES[0]); c.close('scene'); scene.layers[0].visible = false;
  const inactive = c.snapshot(); assert.equal(inactive.supported, false); assert.equal(inactive.closeReason, 'scene');
  assert.deepEqual(inactive.trialRecords, ledger); assert.deepEqual(inactive.trialFlags, flags);
  assert.equal(api.RIFT_DIALOGUE_LIMITS.maxCloseReasonChars, 96);
});

test('independent residents isolate each blocked foot while the other three remain reachable', async () => {
  for (let blocked = 0; blocked < 4; blocked++) {
    const { api, residents, scene, raw, anchors, approaches } = await residentInputs();
    scene.walkable[footCell(scene, anchors[blocked])] = 0;
    assert.equal(walk(scene, anchors[blocked].x, anchors[blocked].y, 12), false);
    assert.ok(residents.residentPaintingProfile(scene), 'Nav eligibility does not change registered resident identity');
    const before = JSON.stringify({ scene, raw, anchors });
    const c = api.createRiftDialogue(scene, raw, walk, anchors); assert.ok(c);
    assert.equal(c.snapshot().supported, true);
    assert.equal(c.nearest(approaches[blocked]), null); assert.equal(c.open(IDS[blocked], approaches[blocked]), null);
    assert.equal(c.choose('o_accept'), null);
    for (let i = 0; i < 4; i++) if (i !== blocked) {
      assert.equal(c.nearest(approaches[i]).npcId, IDS[i]);
      node(c.open(IDS[i], approaches[i]), 'meet'); c.close('isolation-check');
    }
    assert.deepEqual(c.snapshot().trialRecords, []); assert.equal(Object.values(c.snapshot().trialFlags).some(Boolean), false);
    assert.equal(JSON.stringify({ scene, raw, anchors }), before, 'Controller must not repair nav, source or injected anchors');
  }
});

test('a live independent gift or quest foot becoming blocked closes before recording and leaves other NPCs active', async () => {
  for (const rewardNpc of [1, 2]) {
    const { api, scene, raw, anchors, approaches } = await residentInputs();
    const before = JSON.stringify({ scene, raw, anchors });
    const c = api.createRiftDialogue(scene, raw, walk, anchors); assert.ok(c);
    node(c.open(IDS[rewardNpc], approaches[rewardNpc]), 'meet'); node(c.choose('o_listen'), 'story');
    if (rewardNpc === 1) node(c.choose('o_accept'), 'offer');
    const cell = footCell(scene, anchors[rewardNpc]); scene.walkable[cell] = 0;
    assert.equal(c.choose(rewardNpc === 1 ? 'o_take' : 'o_accept'), null);
    const closed = c.snapshot(); assert.equal(closed.supported, true); assert.equal(closed.isOpen, false);
    assert.equal(closed.closeReason, 'out-of-range'); assert.deepEqual(closed.trialRecords, []);
    assert.equal(Object.values(closed.trialFlags).some(Boolean), false);
    assert.equal(c.open(IDS[rewardNpc], approaches[rewardNpc]), null);
    for (let i = 0; i < 4; i++) if (i !== rewardNpc) {
      assert.equal(c.nearest(approaches[i]).npcId, IDS[i]); node(c.open(IDS[i], approaches[i]), 'meet'); c.close();
    }
    // Restoring the same nav cell permits a fresh attempt, not a phantom prior grant.
    scene.walkable[cell] = 1;
    const accepted = rewardNpc === 1 ? acceptGift(c, approaches[1]) : acceptQuest(c, approaches[2]);
    assert.equal(accepted.trialRecords.length, 1); assert.equal(accepted.trialRecords[0].npcId, IDS[rewardNpc]);
    assert.equal(accepted.trialRecords[0].actualGrant, false);
    assert.equal(c.choose(rewardNpc === 1 ? 'o_take' : 'o_accept'), null); assert.equal(c.snapshot().trialRecords.length, 1);
    assert.equal(JSON.stringify({ scene, raw, anchors }), before);
  }
});

test('independent callbacks require synchronous true at feet and along the approach; all failures close the controller', async () => {
  const { api, scene, raw, anchors, approaches } = await residentInputs();
  let blockAll = false;
  const selectiveWalk = (p, x, y, radius) => {
    if (blockAll) return false;
    const index = anchors.findIndex(a => samePoint(x, y, a));
    if (index >= 0 && index < 3) return rejectedWalkResults[index][1]();
    return walk(p, x, y, radius);
  };
  const c = api.createRiftDialogue(scene, raw, selectiveWalk, anchors); assert.ok(c);
  for (let i = 0; i < 3; i++) {
    assert.equal(c.nearest(approaches[i]), null, rejectedWalkResults[i][0]);
    assert.equal(c.open(IDS[i], approaches[i]), null, rejectedWalkResults[i][0]);
  }
  assert.equal(c.nearest(approaches[3]).npcId, IDS[3]); node(c.open(IDS[3], approaches[3]), 'meet');
  blockAll = true; assert.equal(c.choose('o_leave'), null);
  const inactive = c.snapshot(); assert.equal(inactive.supported, false); assert.equal(inactive.isOpen, false);
  assert.equal(inactive.closeReason, 'inactive-scene'); assert.deepEqual(inactive.trialRecords, []);
  assert.equal(Object.values(inactive.trialFlags).some(Boolean), false);
  assert.equal(c.nearest(approaches[3]), null); assert.equal(c.open(IDS[3], approaches[3]), null);
  assert.equal(api.createRiftDialogue(scene, raw, selectiveWalk, anchors), null);
  for (const [label, rejected] of rejectedWalkResults) {
    assert.equal(api.createRiftDialogue(scene, raw, rejected, anchors), null, 'All ' + label + ' feet must reject construction');
    const fresh = await residentInputs(), a = fresh.anchors[1], player = fresh.approaches[1];
    const steps = Math.ceil(Math.hypot(a.x - player.x, a.y - player.y) / 20);
    const middle = { x: player.x + (a.x - player.x) / steps, y: player.y + (a.y - player.y) / steps };
    let rejectMiddle = true;
    const directWalk = (p, x, y, radius) => rejectMiddle && samePoint(x, y, middle) ? rejected() : walk(p, x, y, radius);
    const direct = api.createRiftDialogue(fresh.scene, fresh.raw, directWalk, fresh.anchors); assert.ok(direct);
    assert.equal(direct.snapshot().supported, true, 'Walkable anchors do not imply a valid straight approach');
    assert.equal(direct.nearest(player), null, label); assert.equal(direct.open(IDS[1], player), null, label);
    assert.equal(direct.nearest(fresh.approaches[0]).npcId, IDS[0]);
    rejectMiddle = false; node(direct.open(IDS[1], player), 'meet'); node(direct.choose('o_listen'), 'story'); node(direct.choose('o_accept'), 'offer');
    rejectMiddle = true; assert.equal(direct.choose('o_take'), null);
    const closed = direct.snapshot(); assert.equal(closed.supported, true); assert.equal(closed.isOpen, false);
    assert.equal(closed.closeReason, 'out-of-range'); assert.deepEqual(closed.trialRecords, []);
    assert.equal(closed.trialFlags['rift.berin.giftGiven'], false);
  }
});

test('independent anchor structure and profile remain fail-closed; baked proxies still close all four on one failed foot', async () => {
  const { api, residents, scene, raw, anchors, approaches } = await residentInputs();
  for (const invalid of [
    anchors.slice(1), [...anchors, anchors[0]], [anchors[0], anchors[0], anchors[2], anchors[3]],
    anchors.map((a, i) => i ? a : { ...a, npcId: 'unknown' }),
    anchors.map((a, i) => i ? a : { ...a, x: Number.NaN }),
    anchors.map((a, i) => i ? a : { ...a, x: 8000 })
  ]) assert.equal(api.createRiftDialogue(scene, raw, walk, invalid), null);
  for (const mutate of [
    p => { p.sourcePins.cleanPlate = '0'.repeat(64); },
    p => { p.sourcePins.residentAtlas = '0'.repeat(64); },
    p => { p.assets.find(a => a.id === 'resident-berin').crop.x += 1; },
    p => { p.assets.find(a => a.id === 'west-0').crop.w += 1; },
    p => { p.layers.find(l => l.id === 'foot').objects.find(o => o.id === 'obj-resident-haran').rotation = 1; },
    p => { p.layers.find(l => l.id === 'foot').visible = false; }
  ]) {
    const changed = clone(scene), c = api.createRiftDialogue(changed, raw, walk, anchors); assert.ok(c);
    node(c.open(IDS[1], approaches[1]), 'meet'); node(c.choose('o_listen'), 'story'); node(c.choose('o_accept'), 'offer');
    mutate(changed); assert.equal(residents.residentPaintingProfile(changed), null);
    assert.equal(api.supportsRiftDialogueScene(changed), false);
    assert.equal(api.createRiftDialogue(changed, raw, walk, anchors), null);
    assert.equal(api.createRiftDialogue(changed, raw, walk, clone(ANCHORS)), null, 'Baked coordinates cannot rescue an invalid independent profile');
    assert.equal(c.choose('o_take'), null); assert.equal(c.snapshot().supported, false);
    assert.equal(c.snapshot().closeReason, 'inactive-scene'); assert.deepEqual(c.snapshot().trialRecords, []);
  }
  for (const [label, rejected] of [['false', () => false], ...rejectedWalkResults]) {
    const baked = inputs(); let rejectFoot = true;
    const bakedWalk = (p, x, y, radius) => rejectFoot && samePoint(x, y, ANCHORS[0]) ? rejected() : walk(p, x, y, radius);
    assert.equal(api.createRiftDialogue(baked.scene, baked.raw, bakedWalk, baked.anchors), null, label);
    rejectFoot = false; const c = api.createRiftDialogue(baked.scene, baked.raw, bakedWalk, baked.anchors); assert.ok(c);
    node(c.open(IDS[1], APPROACHES[1]), 'meet'); node(c.choose('o_listen'), 'story'); node(c.choose('o_accept'), 'offer');
    rejectFoot = true; assert.equal(c.choose('o_take'), null, label);
    const closed = c.snapshot(); assert.equal(closed.supported, false); assert.equal(closed.isOpen, false);
    assert.equal(closed.closeReason, 'inactive-scene'); assert.deepEqual(closed.trialRecords, []);
    assert.equal(closed.trialFlags['rift.berin.giftGiven'], false);
    for (let i = 0; i < 4; i++) { assert.equal(c.nearest(APPROACHES[i]), null); assert.equal(c.open(IDS[i], APPROACHES[i]), null); }
  }
  assert.equal(hash(fs.readFileSync(residentScenePath)), 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');
  assert.equal(hash(fs.readFileSync(rawPath)), 'be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc');
});

test('completed conversations leave immutable raw/file hashes, scene/nav1192 and route untouched', async () => {
  const { scene, raw, anchors, c } = await fixture(), before = JSON.stringify({ scene, raw, anchors }), route = clone(K.route(scene));
  const sceneHash = hash(fs.readFileSync(scenePath)), rawHash = hash(fs.readFileSync(rawPath));
  assert.equal(rawHash, 'be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc');
  assert.equal(sceneHash, 'f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac');
  c.open(IDS[0], APPROACHES[0]); c.choose('o_leave'); acceptGift(c, APPROACHES[1]); c.close(); acceptQuest(c, APPROACHES[2]); c.close(); c.open(IDS[3], APPROACHES[3]); c.choose('o_leave');
  assert.equal(c.snapshot().trialRecords.length, 2); assert.equal(Object.values(c.snapshot().trialFlags).every(Boolean), true);
  assert.equal(JSON.stringify({ scene, raw, anchors }), before); assert.equal(scene.walkable.reduce((sum, v) => sum + v, 0), 1192); assert.equal(hash(Buffer.from(scene.walkable)), 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179');
  assert.equal(route.pass, true); assert.equal(route.visited, 1185); assert.deepEqual(clone(K.route(scene)), route);
  assert.equal(hash(fs.readFileSync(rawPath)), rawHash); assert.equal(hash(fs.readFileSync(scenePath)), sceneHash);
});
