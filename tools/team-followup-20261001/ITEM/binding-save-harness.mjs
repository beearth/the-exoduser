import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';

const root=new URL('../../../',import.meta.url),owned=new URL('./',import.meta.url);
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const clone=value=>JSON.parse(JSON.stringify(value));
export function extract(source,name,constant=false){
  const anchor=constant?`const ${name}=`:source.includes(`async function ${name}(`)?`async function ${name}(`:`function ${name}(`;
  const start=source.indexOf(anchor);assert.ok(start>=0,anchor);
  assert.equal(source.indexOf(anchor,start+anchor.length),-1);
  const exprStart=constant?start+anchor.length:start;
  const end=parseExpressionAt(source,exprStart,{ecmaVersion:'latest'}).end;
  return constant?`const ${name}=${source.slice(exprStart,end)};`:source.slice(start,end);
}
export function createSaveHarness(html){
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
    const source=extract(html,name);return source;
  })].join('\n'),context);
  return {context,errors,local,rng:()=>rngCalls,saved:()=>saved,
    store(items){context.STORAGE={0:clone(items),_synced:true};context._sharedStorageDirty=true;},
    storeItems:()=>clone(context.STORAGE[0])};
}
