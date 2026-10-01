import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {candidateRestore,originalGuard,candidateGuard} from './unique-save-candidate.mjs';

const root=new URL('../../../',import.meta.url),owned=new URL('./',import.meta.url);
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const clone=value=>JSON.parse(JSON.stringify(value));
function extract(source,name,constant=false){
  const anchor=constant?`const ${name}=`:source.includes(`async function ${name}(`)?`async function ${name}(`:`function ${name}(`;
  const start=source.indexOf(anchor);assert.ok(start>=0,anchor);
  assert.equal(source.indexOf(anchor,start+anchor.length),-1);
  const exprStart=constant?start+anchor.length:start;
  const end=parseExpressionAt(source,exprStart,{ecmaVersion:'latest'}).end;
  return constant?`const ${name}=${source.slice(exprStart,end)};`:source.slice(start,end);
}
const rows=[],sources=[];
function harness(html,candidate){
  const local=new Map(),errors=[];let saved=null,rngCalls=0;
  const math=Object.create(Math);math.random=()=>{rngCalls++;throw Error('unexpected RNG');};
  const noop=()=>{};
  const context=vm.createContext({Math:math,console:{error:(...args)=>errors.push(args),warn:noop},window:{},
    localStorage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,String(value))},
    sb:{from:table=>{
      assert.equal(table,'characters');
      return {update:payload=>{
        saved=clone(payload.data);
        return {eq:(key,id)=>{
          assert.equal(key,'id');assert.equal(id,'fixture');
          return {select:async column=>{assert.equal(column,'id');return {data:[{id}],error:null};}};
        }};
      }};
    }},
    P:{skills:{},hp:350,mhp:350,mp:80,mmp:80,st:100,mst:100},G:{mats:0},INV:{bag:[],equipped:{}},STORAGE:{},
    _charId:'fixture',_dbReady:true,_saving:false,_pendingForce:false,_lastSaveTime:0,_charIdx:0,CHAR_LIST:[{}],IS_ELECTRON:false,
    STATS:{},PASSIVES:{},_grit:0,QSLOTS:[],BAG_MAX:300,CRYSTAL_BAG:[],CRYSTAL_DUST:0,UPGRADES:{},POT_LV:{},POT:{},
    SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,SKILL_LIST:[],_FUSE_PAIRS:{},_CR_LEGACY_IDS:{},_sharedStorageDirty:false,
    _sanitizeCoreState:noop,_saveSharedMats:noop,_loadSharedMats:()=>0,_passiveQueueItems:()=>[],_loadCharAtlas:noop,
    _applyMaskAtlas:noop,_L:ko=>ko,_ensureBaseWingStrike:noop,_skProfCap:()=>100,_isFused:()=>false,
    _syncActiveSkAfterReset:noop,_getAllAbsorbed:()=>[],_repairAreaSkillSlot:noop,_findAutoSkillSlot:()=>-1
  });
  const constants=['WTYPES','_WP_MOD','SLOT_NAMES','SLOT_EMOJI','RARITY_MUL','BOWTYPES','STORAGE_MAX','_SHARED_STORAGE_KEY'];
  const names=['_weaponName','_restoreExpProgress','_sanitizeCoreState','_loadSharedStorage','_saveSharedStorage','_getStore','_persistSharedStorage','_flushSharedStorage','dbSave','dbRestore'];
  vm.runInContext([...constants.map(name=>extract(html,name,true)),...names.map(name=>{
    const source=extract(html,name);return candidate&&name==='dbRestore'?candidateRestore(source):source;
  })].join('\n'),context);
  return {context,errors,local,rng:()=>rngCalls,saved:()=>saved,
    store(items){context.STORAGE={0:clone(items),_synced:true};context._sharedStorageDirty=true;},
    storeItems:()=>clone(context.STORAGE[0])};
}
const base={id:804,uniqueId:'UI-08',slot:'weapon',wtype:'dagger',name:'고유 단검 이름',rarity:5,tier:0,el:0,
  _spdMig:3,spd:1.125,atk:12.375,affixes:[{id:'saved-roll',tier:2,value:0.125}],uniqueSpecial:{value:1.375},socketCount:1,crystals:[null]};
async function roundtrip(html,candidate,item,path){
  const h=harness(html,candidate);
  if(path==='bag')h.context.INV.bag=[clone(item)];
  else if(path==='equipped')h.context.INV.equipped={[item.slot]:clone(item)};
  else h.store([item]);
  await h.context.dbSave();assert.deepEqual(h.errors,[]);assert.ok(h.saved());
  assert.deepEqual(h.saved().storage,{});
  const data=clone(h.saved());assert.equal(h.context.dbRestore(data),true);
  const pick=()=>clone(path==='bag'?h.context.INV.bag[0]:path==='equipped'?h.context.INV.equipped[item.slot]:h.context.STORAGE[0][0]);
  const first=pick();assert.equal(h.context.dbRestore(clone(h.saved())),true);const repeated=pick();
  assert.deepEqual(repeated,first);assert.equal(h.rng(),0);
  return {first,h};
}
for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(new URL(file,root),'utf8');
  const restore=extract(html,'dbRestore'),save=extract(html,'dbSave');
  const expectedRestore=file==='game.html'?'26c8789edaa85f46dfd14f1fbd040f3e55fd388942327a4abf50ccd79129c5d4':'4e9f40574f363bc1cb00a61ca9e10d4d20bb256020e27fef644b35665649749a';
  assert.equal(hash(restore),expectedRestore,'restore source drift; reacquire task');
  const names=extract(html,'_weaponName');
  assert.ok(restore.includes(originalGuard),'already fixed: do not duplicate patch');
  sources.push({file,htmlSha256:hash(html),dbSaveSha256:hash(save),dbRestoreSha256:hash(restore),candidateRestoreSha256:hash(candidateRestore(restore)),weaponNameSha256:hash(names),functions:['dbSave','dbRestore','_weaponName','_loadSharedStorage','_saveSharedStorage','_getStore','_flushSharedStorage'].map(name=>({name,line:html.slice(0,html.indexOf(extract(html,name))).split('\n').length}))});
  const lines=html.split('\n'),index=lines.findIndex(line=>line.includes(originalGuard));
  const before=lines.slice(index-2,index+3);
  const patch=`--- a/${file}\n+++ b/${file}\n@@ -${index-1},5 +${index-1},5 @@\n`+before.map(line=>line.includes(originalGuard)?'-'+line+'\n+'+line.replace(originalGuard,candidateGuard):' '+line).join('\n')+'\n';
  fs.writeFileSync(new URL(`unique-save-${file.replace('.html','')}.patch`,owned),patch);
  for(const path of ['bag','equipped','storage']){
    const original=await roundtrip(html,false,base,path),candidate=await roundtrip(html,true,base,path);
    if(path!=='storage'){assert.notEqual(original.first.name,base.name);assert.equal(original.first._nameMig,1);}
    else assert.deepEqual(original.first,base);
    assert.deepEqual(candidate.first,base);
    rows.push({file,path,case:'original_failure_to_candidate_preservation',originalName:original.first.name,originalNameMig:original.first._nameMig??null,candidateName:candidate.first.name,rngCalls:0});
  }
  const cases=[['unknown',{uniqueId:'UNKNOWN-EXTERNAL'}],['whitespace',{uniqueId:' '}],['absent',{}],['empty',{uniqueId:''}],['null',{uniqueId:null}],['number',{uniqueId:8}],['object',{uniqueId:{id:'UI-08'}}],['array',{uniqueId:['UI-08']}],['legacy-slot-unique',{uniqueSpecial:{id:'legacy',value:1.375}}],['ossuary',{slot:'ossuary',unique:true,uniqueSpecial:null,name:'고유 유골함'}],['already-name-migrated',{_nameMig:1}],['speed-unmigrated',{_spdMig:0}]];
  for(const [kind,overrides] of cases){
    const item={...clone(base),...overrides};if(['absent','legacy-slot-unique','ossuary'].includes(kind))delete item.uniqueId;
    for(const path of ['bag','equipped','storage']){
      const original=await roundtrip(html,false,item,path),candidate=await roundtrip(html,true,item,path);
      const preserve=typeof item.uniqueId==='string'&&item.uniqueId.length>0;
      if(preserve&&path!=='storage'&&(item._nameMig||0)<1){
        const expected=clone(original.first);expected.name=item.name;delete expected._nameMig;
        assert.deepEqual(candidate.first,expected);
      }else assert.deepEqual(candidate.first,original.first);
      assert.deepEqual(candidate.first.affixes,item.affixes);assert.equal(candidate.first.atk,item.atk);
      assert.equal(candidate.first.uniqueId===undefined?undefined:JSON.stringify(candidate.first.uniqueId),item.uniqueId===undefined?undefined:JSON.stringify(item.uniqueId));
      rows.push({file,path,case:kind,name:candidate.first.name,rngCalls:0});
    }
  }
  const legacy=harness(html,true);
  assert.equal(legacy.context.dbRestore({player:{},storage:{0:[clone(base)]}}),true);
  assert.deepEqual(legacy.storeItems(),[base]);assert.equal(legacy.rng(),0);
  rows.push({file,path:'legacy-storage[0]→localStorage→STORAGE[0]',case:'one_time_transfer',rngCalls:0});
  const existing=harness(html,true);existing.context._saveSharedStorage([base]);
  existing.context.dbRestore({player:{},storage:{0:[{...base,name:'legacy ignored'}]}});
  assert.deepEqual(existing.storeItems(),[base]);
  assert.equal(existing.rng(),0);
  rows.push({file,path:'storage',case:'existing_shared_storage_authoritative',rngCalls:existing.rng()});
  for(const candidate of [false,true]){
    const missingSocket=harness(html,candidate),item=clone(base);delete item.socketCount;
    assert.throws(()=>missingSocket.context.dbRestore({player:{},inv:{bag:[item],equipped:{}}}),/unexpected RNG/);
    assert.equal(missingSocket.rng(),1);
  }
  rows.push({file,path:'bag',case:'missing_socket_original_and_candidate_existing_rng_limit',rngCalls:1});
}
assert.throws(()=>candidateRestore('function dbRestore(){}'),/unexpected/);
assert.throws(()=>candidateRestore(candidateRestore(originalGuard)),/unexpected/);
const result={taskId:'ITEM-UNIQUE-SAVE-NAME-CANDIDATE',sources,rows,passed:rows.length,productionModified:false,scope:'extracted full dbSave/dbRestore plus actual naming/storage/sanitize functions; fake DB JSON and in-memory localStorage; no user save'};
fs.writeFileSync(new URL('unique-save-evidence.json',owned),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
