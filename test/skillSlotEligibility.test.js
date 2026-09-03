import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const bodyStart = gameHtml.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') depth++;
    else if (gameHtml[i] === '}' && --depth === 0) return gameHtml.slice(start, i + 1);
  }
  assert.fail(`${name} must have a complete body`);
}

function slotRules(skills, slots = [null, null, null, null, null, null]) {
  const _skById = (id) => skills[id] || null;
  const SKILL_SLOTS = slots;
  const source = [
    extractFunction('_isAreaSkillId'),
    extractFunction('_isRageBurstSkillId'),
    extractFunction('_canAssignSkillSlot'),
    extractFunction('_findAutoSkillSlot'),
    extractFunction('_repairAreaSkillSlot'),
  ].join('\n');
  const rules = Function('_skById', 'SKILL_SLOTS', `${source};return { _isAreaSkillId, _isRageBurstSkillId, _canAssignSkillSlot, _findAutoSkillSlot, _repairAreaSkillSlot }`)(_skById, SKILL_SLOTS);
  return { ...rules, slots };
}

test('F is reserved for learned area skills while ancestor summon remains a normal selectable skill', () => {
  const skills = {
    ancestorSummon: { id: 'ancestorSummon', cat: 'def', act: true },
    holyDome: { id: 'holyDome', cat: 'tech', act: true },
    giantSlam: { id: 'giantSlam', cat: 'phys', act: true },
    giantSlam2: { id: 'giantSlam2', cat: 'phys', act: true },
    spikeTrap: { id: 'spikeTrap', cat: 'tech', act: true },
    passiveTech: { id: 'passiveTech', cat: 'tech', act: false },
  };
  const rules = slotRules(skills);

  assert.equal(rules._canAssignSkillSlot('ancestorSummon', 0), true);
  assert.equal(rules._canAssignSkillSlot('ancestorSummon', 4), false);
  assert.equal(rules._canAssignSkillSlot('ancestorSummon', 5), false);
  assert.equal(rules._canAssignSkillSlot('giantSlam', 0), false);
  assert.equal(rules._canAssignSkillSlot('giantSlam', 4), true);
  assert.equal(rules._canAssignSkillSlot('giantSlam', 5), false);
  assert.equal(rules._canAssignSkillSlot('giantSlam2', 0), false);
  assert.equal(rules._canAssignSkillSlot('giantSlam2', 4), true, 'Hell Slam II and Pillar Slam use the giantSlam2 Space host');
  assert.equal(rules._canAssignSkillSlot('holyDome', 0), false);
  assert.equal(rules._canAssignSkillSlot('holyDome', 4), false);
  assert.equal(rules._canAssignSkillSlot('holyDome', 5), true);
  assert.equal(rules._canAssignSkillSlot('spikeTrap', 0), false);
  assert.equal(rules._canAssignSkillSlot('spikeTrap', 4), false);
  assert.equal(rules._canAssignSkillSlot('spikeTrap', 5), true, 'Spike Trap is selected through the F area slot');
  assert.equal(rules._isAreaSkillId('passiveTech'), false, 'passive tech skills are not area-slot candidates');
});

test('automatic assignment reserves F for areas and sends ancestor summon to a normal slot', () => {
  const skills = {
    ancestorSummon: { id: 'ancestorSummon', cat: 'def', act: true },
    giantSlam: { id: 'giantSlam', cat: 'phys', act: true },
    giantSlam2: { id: 'giantSlam2', cat: 'phys', act: true },
    holyDome: { id: 'holyDome', cat: 'tech', act: true },
    weakPhys: { id: 'weakPhys', cat: 'tech', act: true },
  };
  const normal = slotRules(skills);
  assert.equal(normal._findAutoSkillSlot('ancestorSummon'), 0);
  assert.equal(normal._findAutoSkillSlot('giantSlam'), 4);
  assert.equal(normal._findAutoSkillSlot('weakPhys'), 5);

  const occupied = slotRules(skills, ['a', 'b', null, null, null, null]);
  assert.equal(occupied._findAutoSkillSlot('ancestorSummon'), 2);

  const areaOccupied = slotRules(skills, [null, null, null, null, null, 'weakPhys']);
  assert.equal(areaOccupied._findAutoSkillSlot('holyDome'), -1, 'a second area cannot spill into a normal slot');

  const rageOccupied = slotRules(skills, [null, null, null, null, 'giantSlam', null]);
  assert.equal(rageOccupied._findAutoSkillSlot('giantSlam2'), -1, 'a second Rage Burst cannot spill into a normal slot');
});

test('legacy non-area F assignment is migrated to the first free normal slot', () => {
  const skills = {
    a: { id: 'a', cat: 'def', act: true },
    ancestorSummon: { id: 'ancestorSummon', cat: 'def', act: true },
  };
  const rules = slotRules(skills, ['a', null, null, null, null, 'ancestorSummon']);
  rules._repairAreaSkillSlot();
  assert.deepEqual(rules.slots, ['a', 'ancestorSummon', null, null, null, null]);
});

test('legacy area assignments outside F collapse to one equipped area', () => {
  const skills = {
    holyDome: { id: 'holyDome', cat: 'tech', act: true },
    weakPhys: { id: 'weakPhys', cat: 'tech', act: true },
  };
  const rules = slotRules(skills, ['holyDome', 'weakPhys', null, null, null, null]);
  rules._repairAreaSkillSlot();
  assert.deepEqual(rules.slots, [null, null, null, null, null, 'holyDome']);
});

test('legacy general Space assignment and Rage Burst in normal slots are repaired', () => {
  const skills = {
    ancestorSummon: { id: 'ancestorSummon', cat: 'def', act: true },
    giantSlam2: { id: 'giantSlam2', cat: 'phys', act: true },
  };
  const rules = slotRules(skills, ['giantSlam2', null, null, null, 'ancestorSummon', null]);
  rules._repairAreaSkillSlot();
  assert.deepEqual(rules.slots, ['ancestorSummon', null, null, null, 'giantSlam2', null]);
});

test('L assignment popup exposes general slots and every assignment path checks eligibility', () => {
  assert.match(gameHtml, /\{key:'slot1',label:'1',slotIdx:0,isSlot:true/);
  assert.match(gameHtml, /\{key:'slotF',label:'F',slotIdx:5,isSlot:true/);
  assert.match(gameHtml, /const _actSkills=SKILL_LIST\.filter\(sk=>_canAssignSkillSlot\(sk\.id,slotIdx\)/);
  assert.match(gameHtml, /if\(!_canAssignSkillSlot\(d\.skId,i\)\)continue/);
  assert.match(gameHtml, /if\(!_canAssignSkillSlot\(sk\.id,_sIdx\)\)return/);
  assert.match(gameHtml, /const si=_findAutoSkillSlot\(skId\)/, 'gamepad Y assignment follows the same slot contract');
  assert.match(gameHtml, /Space · 분노 폭발 전용/, 'Space popup identifies its Rage Burst-only contract');
});

test('ancestor summon uses its existing PNG icon in the skill panel', () => {
  const iconSet = gameHtml.match(/const _SKILL_ICON_SET=new Set\(\[([^\]]+)]\)/);
  assert.ok(iconSet, 'skill icon set must exist');
  assert.match(iconSet[1], /'ancestorSummon'/);
});

test('Spike Trap is an F-selectable area skill instead of a legacy fixed Space skill', () => {
  const def = gameHtml.match(/\{id:'spikeTrap'[^\n]+/);
  assert.ok(def, 'spikeTrap skill definition must exist');
  assert.doesNotMatch(def[0], /fixed:true/);
  assert.match(def[0], /\[선택: F\]/);
  assert.doesNotMatch(gameHtml, /SKILL_SLOTS\[0\]='spikeTrap'/, 'new-game and test presets must not bypass the F-only contract');
  assert.doesNotMatch(gameHtml, /스페이스[^'\n]*가시덫|가시덫[^'\n]*스페이스/, 'Spike Trap guidance must point to F, not Space');
});
