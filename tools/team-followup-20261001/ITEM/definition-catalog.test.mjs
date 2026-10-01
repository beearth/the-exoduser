import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {parse} from 'acorn';
import {UNIQUE_DEFINITIONS,EFFECT_PROPOSALS,lookupDefinition,lookupItemProposal,lookupActiveItemDefinition,validateDefinitions} from './definition-catalog.mjs';

const root=new URL('../../../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const contract=read('docs/7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md');
const catalog=read('docs/7아이템디자인/보라색_고유아이템_카탈로그_20260930.md');
const affixes=read('docs/7아이템디자인/유니크_어픽스_리스트.md');
const review=read('unique-item-project/review.html');
const artPaths=UNIQUE_DEFINITIONS.flatMap(definition=>[definition.art.originalPath,definition.art.candidatePath]).filter(path=>fs.existsSync(new URL(path,root)));
const codes=result=>result.issues.map(issue=>issue.code);

test('actual 22 names/effect IDs/stats match catalog and D document, not runtime implementation',()=>{
  assert.equal(UNIQUE_DEFINITIONS.length,22);assert.equal(EFFECT_PROPOSALS.length,22);
  const entries=[...catalog.matchAll(/^\| (UI-\d{2}) \| ([^|]+) \|[^\n]*?\| (U-D\d{2}) /gm)];
  assert.equal(entries.length,22);
  const effectRows=[...affixes.matchAll(/^\| \*\*(U-D\d{2})\*\*[^\n]*?\| `(_u\w+)`;/gm)];
  assert.equal(effectRows.length,22);
  for(const [,id,name,effectId] of entries){
    const definition=lookupDefinition(id);assert.equal(definition.catalogName,name.trim());assert.equal(definition.effectId,effectId);
    assert.ok(review.includes(`'${name.trim()}'`));
    const effect=EFFECT_PROPOSALS.find(entry=>entry.effectId===effectId);
    assert.equal(effect.proposalStat,effectRows.find(entry=>entry[1]===effectId)[2]);
    assert.equal(effect.documented,true);assert.equal(effect.implemented,false);
  }
});
test('every slot and weapon/bow type matches contract section3 independently',()=>{
  const section=contract.split('## 3.')[1].split('## 4.')[0];let checked=0;
  for(const line of section.split('\n')){
    const match=line.match(/^\| `([^`]+)` \| (UI-[^|]+) \|/);if(!match)continue;
    const [slot,type]=match[1].split('/');
    for(const id of match[2].match(/UI-\d{2}/g)){
      const definition=lookupDefinition(id);
      assert.deepEqual(definition.slots,slot==='ring1'?['ring1','ring2']:[slot]);
      assert.equal(definition.wtype,slot==='weapon'?type:null);
      assert.equal(definition.btype,slot==='bow'?type:null);checked++;
    }
  }
  assert.equal(checked,22);
});
test('all 44 source files exist but 22 rows remain valid proposals, never active',()=>{
  assert.equal(artPaths.length,44);
  const result=validateDefinitions(undefined,{artPaths});assert.equal(result.valid,true);assert.equal(result.canActivate,false);
  for(const definition of UNIQUE_DEFINITIONS){
    assert.equal(definition.enabled,false);assert.equal(definition.nameKey,null);assert.equal(definition.art.runtimePath,null);assert.equal(definition.art.accepted,false);
    for(const code of ['effect_unimplemented','translation_unregistered','missing_runtime_art','art_unaccepted','proposal_not_activatable'])assert.ok(result.blockers.some(blocker=>blocker.uniqueId===definition.uniqueId&&blocker.code===code));
  }
});
test('definition and item lookups preserve frozen data and original instances without RNG',()=>{
  for(const definition of UNIQUE_DEFINITIONS){
    for(const slot of definition.slots){
      const item={uniqueId:definition.uniqueId,slot,wtype:definition.wtype,btype:definition.btype,name:'saved name',roll:0.125,uniqueSpecial:{value:1.375}};
      const before=clone(item);Object.freeze(item.uniqueSpecial);Object.freeze(item);
      assert.equal(lookupItemProposal(item),definition);assert.equal(lookupActiveItemDefinition(item),null);assert.deepEqual(item,before);
    }
  }
  assert.throws(()=>{UNIQUE_DEFINITIONS[0].enabled=true;},TypeError);
  assert.throws(()=>{UNIQUE_DEFINITIONS[1].slots.push('weapon');},TypeError);
});
test('unknown/empty/invalid ID, legacy slot unique and ossuary use null fallback',()=>{
  for(const uniqueId of [undefined,null,'',' ','UNKNOWN','__proto__',8,{},[]])assert.equal(lookupDefinition(uniqueId),null);
  for(const item of [null,{}, {rarity:5,uniqueSpecial:{value:0.5}}, {slot:'ossuary',unique:true,uniqueSpecial:null}, {uniqueId:'UI-06',slot:'headband'}, {uniqueId:'UI-15',slot:'bow',btype:'siege'}, {uniqueId:'UI-08',slot:'weapon',wtype:'sword'}]){
    const before=clone(item);assert.equal(lookupItemProposal(item),null);assert.equal(lookupActiveItemDefinition(item),null);assert.deepEqual(item,before);
  }
});
const negativeCases=[
  ['duplicate uniqueId',definitions=>definitions.push(clone(definitions[0])),'duplicate_unique_id'],
  ['duplicate effectId',definitions=>{definitions[1].effectId=definitions[0].effectId;},'duplicate_effect_id'],
  ['wrong effect reference',definitions=>{definitions[0].effectId='MISSING';},'missing_documented_effect'],
  ['missing definition',definitions=>definitions.pop(),'missing_definition'],
  ['unknown ID',definitions=>{definitions[0].uniqueId='UI-99';},'unknown_unique_id'],
  ['helmet to earring',definitions=>{definitions[5].slots=['headband'];},'slot_type_mismatch'],
  ['missing second ring slot',definitions=>{definitions[1].slots=['ring1'];},'slot_type_mismatch'],
  ['sword to dagger',definitions=>{definitions[2].wtype='dagger';},'slot_type_mismatch'],
  ['bow type missing',definitions=>{definitions[14].btype=null;},'slot_type_mismatch'],
  ['activation attempted',definitions=>{definitions[0].enabled=true;},'activation_forbidden'],
  ['art accepted without gate',definitions=>{definitions[0].art.accepted=true;},'art_proposal_state_changed'],
  ['invented name key',definitions=>{definitions[0].nameKey='invented';},'proposal_state_changed'],
  ['null injected row',definitions=>definitions.push(null),'invalid_definition']
];
for(const [name,mutate,code] of negativeCases)test(name,()=>{
  const definitions=clone(UNIQUE_DEFINITIONS);mutate(definitions);const before=clone(definitions);
  const result=validateDefinitions(definitions,{artPaths});assert.equal(result.valid,false);assert.equal(result.canActivate,false);assert.ok(codes(result).includes(code));assert.deepEqual(definitions,before);
});
test('duplicate/missing/undocumented/stat-mismatched effect registries fail independently',()=>{
  for(const [effects,code] of [[[], 'missing_documented_effect'],[[...EFFECT_PROPOSALS,EFFECT_PROPOSALS[0]],'duplicate_effect_registry_id']])assert.ok(codes(validateDefinitions(undefined,{effects})).includes(code));
  for(const patch of [{documented:false},{proposalStat:'wrong'}]){
    const effects=clone(EFFECT_PROPOSALS);Object.assign(effects[0],patch);
    assert.equal(validateDefinitions(undefined,{effects}).valid,false);
  }
});
test('missing source/runtime art and unaccepted status are explicit activation blockers',()=>{
  const result=validateDefinitions();assert.equal(result.valid,true);
  assert.equal(result.blockers.filter(blocker=>blocker.code==='missing_source_art').length,22);
  assert.equal(result.blockers.filter(blocker=>blocker.code==='missing_runtime_art').length,22);
  assert.equal(result.blockers.filter(blocker=>blocker.code==='art_unaccepted').length,22);
  assert.equal(validateDefinitions(null).valid,false);
  assert.equal(validateDefinitions(undefined,{effects:null}).valid,false);
});
test('module is browser ES module with no imports/Node dependencies or mutation/random operations',()=>{
  const source=read('tools/team-followup-20261001/ITEM/definition-catalog.mjs');
  const ast=parse(source,{ecmaVersion:'latest',sourceType:'module'});
  assert.equal(ast.body.filter(node=>node.type==='ImportDeclaration').length,0);
  assert.doesNotMatch(source,/Math\.random|mkItem\(|localStorage|document\.|window\.|process\.|fetch\(/);
});

test('emit source-backed handoff data, not runtime activation',()=>{
  const result={taskId:'ITEM-PM009-DEFINITION-VALIDATION',count:UNIQUE_DEFINITIONS.length,sourceArtCount:artPaths.length,validation:validateDefinitions(undefined,{artPaths}),definitions:UNIQUE_DEFINITIONS,effects:EFFECT_PROPOSALS,
    sources:['docs/7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md','docs/7아이템디자인/유니크_어픽스_리스트.md','docs/7아이템디자인/보라색_고유아이템_카탈로그_20260930.md','unique-item-project/review.html'].map(path=>({path,sha256:crypto.createHash('sha256').update(read(path)).digest('hex')}))};
  fs.writeFileSync(new URL('./definition-evidence.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
});
