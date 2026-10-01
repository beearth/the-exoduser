import {lookupDefinition} from '../../../unique-item-project/definitions.js';
import {lookupRoll,fromStoredValue} from '../../../unique-item-project/roll-values.js';
import {createD17ReviewCalls} from './d17-source-adapter-callsite.mjs';

export const D17_REVIEW_SAVE_SCHEMA=Object.freeze({field:'uniqueRoll',version:1,uniqueId:'UI-17',effectId:'U-D17',unit:'count',status:'proposal',runtimeReady:false});
function data(record,key) {
  if (!record || typeof record !== 'object') return undefined;
  const descriptor=Object.getOwnPropertyDescriptor(record,key);
  return descriptor?.enumerable && 'value' in descriptor ? descriptor.value : undefined;
}
function plain(record) {
  if (!record || typeof record !== 'object') return false;
  const prototype=Object.getPrototypeOf(record);
  return prototype === null || prototype === Object.prototype;
}
export function inspectD17ReviewRoll(item) {
  const failure=status=>Object.freeze({status,value:null,runtimeReady:false});
  if (!plain(item)) return failure('unknown');
  if (data(item,'uniqueId') !== 'UI-17') return failure('unknown');
  if (data(item,'slot') !== 'helmet') return failure('invalid');
  const binding=data(item,'uniqueRoll');
  if (binding === undefined) return failure('missing');
  const definition=lookupDefinition('UI-17'), roll=lookupRoll('UI-17');
  if (!plain(binding) || Object.hasOwn(item,'toJSON') || Object.hasOwn(binding,'toJSON') || data(binding,'version') !== 1 || data(binding,'effectId') !== definition.effectId || data(binding,'stat') !== roll.stat || data(binding,'unit') !== 'count') return failure('invalid');
  try {const value=fromStoredValue('UI-17',data(binding,'storedValue'));return Object.freeze({status:'proposal-valid',value,runtimeReady:false});}
  catch {return failure('invalid');}
}

export function createD17LifecycleReview({enabled=false,reviewOnly=false,getPlayer,getCharacterKey,getZones,getEquippedHelmet,fireBlackStar,activateSpikeTrap}) {
  let calls=null, player=null, character=null, zones=null;
  function clear() {calls?.clear();calls=null;player=null;character=null;zones=null;}
  function current() {
    const nextPlayer=getPlayer(),nextCharacter=getCharacterKey(),nextZones=getZones();
    if (!calls || player !== nextPlayer || character !== nextCharacter || zones !== nextZones) {
      clear();player=nextPlayer;character=nextCharacter;zones=nextZones;
      calls=createD17ReviewCalls({enabled,reviewOnly,player,getZones,
        readStoredRoll:()=>inspectD17ReviewRoll(getEquippedHelmet()).value,fireBlackStar,activateSpikeTrap});
    }
    return calls;
  }
  function wrapBoundary(original) {
    return function(...args) {
      clear();
      let result;
      try {result=Reflect.apply(original,this,args);} catch(error){clear();throw error;}
      if (result && typeof result.then === 'function') return Promise.resolve(result).finally(clear);
      clear();return result;
    };
  }
  return Object.freeze({status:'proposal',runtimeReady:false,clear,wrapBoundary,
    fireBlackStar(...args){return Reflect.apply(current().fireBlackStar,this,args);},
    activateSpikeTrap(...args){return Reflect.apply(current().activateSpikeTrap,this,args);},
    onInfernoSlamFixedCreated(zone){return current().onInfernoSlamFixedCreated(zone);},
    onHellRayStormCreated(zone){return current().onHellRayStormCreated(zone);},
    onMaliceStormOriginalCreated(zone){return current().onMaliceStormOriginalCreated(zone);}
  });
}

export function createD17LifecycleCalls(options,originals) {
  const runtime=createD17LifecycleReview(options);
  const boundaries={};
  for (const name of ['initStage','_enterBossArena','_fallenResolve','_loadCharAtlas','dbRestore','startGameFromDB']) {
    if (typeof originals[name] === 'function') boundaries[name]=runtime.wrapBoundary(originals[name]);
  }
  return Object.freeze({runtime,boundaries:Object.freeze(boundaries),status:'proposal',runtimeReady:false});
}
