import {createD10ProposalInstance,inspectD10Binding,copyPlainItem} from './binding-d10.mjs';

export function readD10Binding(item){
  const result=inspectD10Binding(item);
  if(result.status!=='valid')return Object.freeze({kind:result.status,stored:null,reason:result.reason});
  return Object.freeze({kind:'proposal',uniqueId:result.uniqueId,effectId:result.effectId,stored:result.storedValue,version:result.version,runtimeReady:false});
}

export function createNewIdentifiedD10Instance(base,rng){
  base=copyPlainItem(base);
  if(!base||base.uniqueId!=='UI-10')throw new TypeError('새 생성용 UI-10 명시 identity 필요');
  const {uniqueId,...newItem}=base;
  return createD10ProposalInstance({newItem,rng});
}

export function restoreD10Instance(item){
  return item;
}

export function createD10ValidationPorts(){
  return Object.freeze({
    create:createNewIdentifiedD10Instance,
    read:item=>{const result=inspectD10Binding(item);return result.status==='valid'?result.storedValue:null;},
    restore:restoreD10Instance
  });
}
