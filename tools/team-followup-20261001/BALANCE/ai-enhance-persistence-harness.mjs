import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

export const sha=value=>createHash('sha256').update(value).digest('hex');
export function extract(file){
  const source=fs.readFileSync(new URL('../../../'+file,import.meta.url),'utf8');
  const fn=name=>{const match=source.match(new RegExp('^(?:async )?function '+name+'\\([^\\n]*\\)[\\s\\S]*?^}', 'm'));assert(match,name);return match[0];};
  const saves=[fn('dbSave'),...[...source.matchAll(/^  dbSave=async function\(\)\{[\s\S]*?^  };/gm)].map(match=>match[0])];
  assert.equal(saves.length,5);
  const begin=source.indexOf('function enhRate(n)'),end=source.indexOf('function enhMul(n)',begin);
  const regions={formulas:source.slice(begin,end),rarity:source.match(/^function _itemEconomyRarity.*$/m)[0],ai:fn('aiEnhance'),click:fn('_doAiEnhance'),sanitize:fn('_sanitizeCoreState'),restore:fn('dbRestore'),xp:fn('_restoreExpProgress'),now:fn('dbSaveNow'),auto:fn('doAutoSave'),startAuto:fn('startAutoSave'),close:source.match(/^function closePanel.*$/m)[0],closeAll:source.match(/^function closeAllPanels.*$/m)[0],saves};
  return {file,regions,hashes:Object.fromEntries(Object.entries(regions).map(([key,value])=>[key,sha(JSON.stringify(value))]))};
}

export function fixture(input,{route=0,candidate=false,success=true,mats=15000,on=true,transport='ok'}={}){
  let time=100000,nextTimer=0,rng=0,writes=0,shared=mats,snapshot=null,unload=null;
  const timers=new Map(),storage=new Map(),events=[];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const commit=data=>{snapshot=clone(data);writes++;events.push({type:'snapshot',time,enh:snapshot.inv.equipped.weapon.enh,mats:snapshot.game.mats});};
  const node={style:{},classList:{remove(){}}};
  const math=Object.create(Math);math.random=()=>{rng++;return success?0:.999999;};
  class ClockDate extends Date{constructor(...args){super(...(args.length?args:[time]));}static now(){return time;}}
  const context=vm.createContext({Math:math,Date:ClockDate,console:{error(...args){events.push({type:'error',args});},warn(...args){events.push({type:'error',args});}},
    P:{lv:1,exp:0,maxExp:15,sp:0,ap:0,x:0,y:0,skills:{},_fused:{}},G:{mats,on,stage:0,forgeOpen:true,_aiEnhSlot:'weapon',_aiTarget:1},
    INV:{bag:[],equipped:{weapon:{id:'fixture',slot:'weapon',name:'fixture',rarity:2,enh:0,affixes:[],socketCount:0,crystals:[]}}},
    window:{addEventListener(type,handler){assert.equal(type,'beforeunload');unload=handler;}},_dbReady:true,_saving:false,_pendingForce:false,_saveDebounce:null,_lastSaveTime:time,_autoSaveTimer:null,_charId:'fixture',_charIdx:0,
    _serverOk:transport==='fallback'?false:null,_SLOT:'fixture',_LS_KEY:'web',_D5K:'demo500',_DEMO_LS_KEY:'demo',IS_ELECTRON:true,
    _matsSyncTimer:0,_matsSyncLast:0,_matsSyncDirty:false,_matsPrev:mats,
    STATS:{},PASSIVES:{},STORAGE:{},STORAGE_MAX:300,QSLOTS:[],POT:{},_grit:0,BAG_MAX:300,CRYSTAL_BAG:[],CRYSTAL_DUST:0,UPGRADES:{},POT_LV:{},SKILL_SLOTS:[],ULT_SLOT:null,
    CHAR_LIST:[{}],SLOT_NAMES:['weapon'],SKILL_LIST:[],_FUSE_PAIRS:{},_FUSE_GEM_GROUPS:{},_CR_LEGACY_IDS:{},WTYPES:{},BOWTYPES:{},
    _ensureBaseWingStrike(){},_loadCharAtlas(){},_applyMaskAtlas(){},_passiveQueueItems:()=>[],_getStore(){},_isFused:()=>false,_getAllAbsorbed:()=>[],_syncActiveSkAfterReset(){},_repairAreaSkillSlot(){},_findAutoSkillSlot:()=>-1,
    _saveSharedMats(value){shared=value;events.push({type:'shared',time,mats:value});},_loadSharedMats:()=>shared,_flushSharedStorage(){},
    _L:value=>value,_T:value=>value,addTxt(){events.push({type:'text'});},poolPart(){events.push({type:'particle'});},shake(){},enhColor:()=>'',applyStats(){events.push({type:'stats'});},renderForge(){events.push({type:'render'});},
    SFX:{forge(){events.push({type:'forge'});},hurt(){events.push({type:'hurt'});}},$:id=>id==='aiEnhResult'?node:node,BGM:{play(){},stageKey:()=>''},document:{querySelectorAll:()=>[]},
    setTimeout(callback,delay){const id=++nextTimer;timers.set(id,{callback,at:time+delay});return id;},clearTimeout:id=>timers.delete(id),
    setInterval(callback,delay){const id=++nextTimer;timers.set(id,{callback,at:time+delay,interval:delay});return id;},clearInterval:id=>timers.delete(id),
    localStorage:{setItem(key,value){storage.set(key,value);commit(JSON.parse(value));}},
    sb:{from(){return {update(value){return {eq(){return {async select(){commit(value.data);return {data:[{id:'fixture'}],error:null};}};}};}};}},
    async fetch(url,options){assert.equal(url,'/api/save');if(transport==='fail')return {ok:false};commit(JSON.parse(options.body).data);return {ok:true,json:async()=>({ok:true})};}
  });
  const click=candidate?input.regions.click.replace('  const res=aiEnhance(_aiItem,target,budget);','  const res=aiEnhance(_aiItem,target,budget);\n  if(res.used>0)dbSaveNow();'):input.regions.click;
  if(candidate)assert.notEqual(click,input.regions.click);
  const code=[input.regions.formulas,input.regions.rarity,input.regions.ai,click,input.regions.sanitize,input.regions.restore,input.regions.xp,input.regions.now,input.regions.auto,input.regions.startAuto,input.regions.close,input.regions.closeAll,input.regions.saves[route],input.unload||''].join('\n');
  vm.runInContext(code,context);
  const flush=async()=>{for(let turn=0;turn<12;turn++)await Promise.resolve();};
  return {context,timers,events,async initial(){await context.dbSave();assert.equal(writes,1);context.startAutoSave();},
    async advance(duration){const target=time+duration;while(true){const due=[...timers.entries()].filter(([,entry])=>entry.at<=target).sort((first,second)=>first[1].at-second[1].at)[0];if(!due)break;time=due[1].at;timers.delete(due[0]);if(due[1].interval)timers.set(due[0],{...due[1],at:time+due[1].interval});due[1].callback();await flush();}time=target;await flush();},
    async unload(){assert(unload);unload();await flush();},
    syncFrame(){assert(input.sync);vm.runInContext(input.sync,context);},
    restore(){assert(snapshot);assert.equal(context.dbRestore(clone(snapshot)),true);return {enh:context.INV.equipped.weapon.enh,mats:context.G.mats};},
    state:()=>({time,rng,writes,shared,snapshot:clone(snapshot),enh:context.INV.equipped.weapon.enh,mats:context.G.mats})};
}
