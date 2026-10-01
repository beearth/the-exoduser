import {createD17LifecycleReview as createPriorLifecycleReview} from './d17-lifecycle-roll-candidate.mjs';
export {inspectD17ReviewRoll,D17_REVIEW_SAVE_SCHEMA} from './d17-lifecycle-roll-candidate.mjs';

export function createD17LifecycleReview(options) {
  const prior=createPriorLifecycleReview(options);
  const pending=new Set();
  function clear() {prior.clear();}
  function wrapBoundary(original) {
    return function(...args) {
      const token={};
      pending.add(token);
      clear();
      let result,then;
      try {
        result=Reflect.apply(original,this,args);
        if (result !== null && (typeof result === 'object' || typeof result === 'function')) then=result.then;
      } catch(error) {pending.delete(token);throw error;}
      if (typeof then !== 'function') {pending.delete(token);return result;}
      return new Promise((resolve,reject)=>{
        queueMicrotask(()=>{
          try {Reflect.apply(then,result,[resolve,reject]);} catch(error) {reject(error);}
        });
      }).then(value=>{pending.delete(token);return value;},error=>{pending.delete(token);throw error;});
    };
  }
  function invoke(name,original,receiver,args) {
    if (pending.size) return Reflect.apply(original,receiver,args);
    return Reflect.apply(prior[name],receiver,args);
  }
  function register(name,zone) {return pending.size ? false : prior[name](zone);}
  return Object.freeze({status:'proposal',runtimeReady:false,clear,wrapBoundary,
    getPendingCount:()=>pending.size,
    fireBlackStar(...args){return invoke('fireBlackStar',options.fireBlackStar,this,args);},
    activateSpikeTrap(...args){return invoke('activateSpikeTrap',options.activateSpikeTrap,this,args);},
    onInfernoSlamFixedCreated(zone){return register('onInfernoSlamFixedCreated',zone);},
    onHellRayStormCreated(zone){return register('onHellRayStormCreated',zone);},
    onMaliceStormOriginalCreated(zone){return register('onMaliceStormOriginalCreated',zone);}
  });
}

export function createD17LifecycleCalls(options,originals) {
  const runtime=createD17LifecycleReview(options),boundaries={};
  for (const name of ['initStage','_enterBossArena','_fallenResolve','_loadCharAtlas','dbRestore','startGameFromDB']) {
    if (typeof originals[name] === 'function') boundaries[name]=runtime.wrapBoundary(originals[name]);
  }
  return Object.freeze({runtime,boundaries:Object.freeze(boundaries),status:'proposal',runtimeReady:false});
}
