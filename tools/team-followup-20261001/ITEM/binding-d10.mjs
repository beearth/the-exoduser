import {lookupItemProposal} from '../../../unique-item-project/definitions.js';
import {lookupRoll,rollValue,fromStoredValue} from '../../../unique-item-project/roll-values.js';
import {createD10Consumer} from './d10-consumer.mjs';

export const D10_BINDING_SCHEMA=Object.freeze({field:'uniqueRoll',version:1,uniqueId:'UI-10',effectId:'U-D10',unit:'fraction',status:'proposal',runtimeReady:false});
const owns=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const invalidData=Symbol('invalid data');
function plainRecord(value){
  if(value===null||typeof value!=='object'||Array.isArray(value))return false;
  const prototype=Object.getPrototypeOf(value);
  if(prototype===null||prototype===Object.prototype)return true;
  // JSON parsed in another realm still has that realm's native Object prototype.
  const constructor=Object.getOwnPropertyDescriptor(prototype,'constructor')?.value;
  return Object.getPrototypeOf(prototype)===null&&typeof constructor==='function'
    &&Object.getOwnPropertyDescriptor(constructor,'prototype')?.value===prototype
    &&Function.prototype.toString.call(constructor)===Function.prototype.toString.call(Object);
}
function ownData(value,key){
  const descriptor=Object.getOwnPropertyDescriptor(value,key);
  return descriptor&&descriptor.enumerable&&owns(descriptor,'value')?descriptor.value:invalidData;
}

// Creation accepts plain JSON data only; never execute getters or toJSON hooks.
export function copyPlainItem(value,seen=new Set()){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number'&&Number.isFinite(value))return value;
  if(typeof value!=='object'||seen.has(value))throw new TypeError('plain JSON data required');
  const array=Array.isArray(value);
  if(!array&&!plainRecord(value))throw new TypeError('plain JSON record required');
  seen.add(value);
  try{
    const descriptors=Object.getOwnPropertyDescriptors(value),entries=[];
    for(const key of Reflect.ownKeys(descriptors)){
      if(array&&key==='length')continue;
      const descriptor=descriptors[key];
      if(typeof key!=='string'||key==='toJSON'||!descriptor.enumerable||!owns(descriptor,'value'))throw new TypeError('serialized data properties required');
      if(array&&(!/^(0|[1-9]\d*)$/.test(key)||Number(key)>=value.length))throw new TypeError('plain JSON array required');
      entries.push([key,copyPlainItem(descriptor.value,seen)]);
    }
    if(!array)return Object.fromEntries(entries);
    if(entries.length!==value.length)throw new TypeError('dense JSON array required');
    return entries.map(([,entry])=>entry);
  }finally{seen.delete(value);}
}

export function createD10ProposalInstance({newItem,rng}={}){
  newItem=copyPlainItem(newItem);
  if(!plainRecord(newItem)||newItem.slot!=='armor')throw new TypeError('새 armor 제안 인스턴스만 허용');
  if(owns(newItem,'uniqueId')||owns(newItem,'uniqueRoll')||owns(newItem,'_uSlamEmberRage')||newItem.unique===true||newItem.uniqueSpecial!=null)throw new TypeError('기존 unique/레거시 인스턴스 변환 금지');
  if(typeof rng!=='function')throw new TypeError('새 제안 생성 RNG 명시 필요');
  const snapshot=newItem;
  if(snapshot.slot!=='armor')throw new TypeError('직렬화 가능한 새 armor 필요');
  const roll=rollValue('UI-10',rng);
  return {...snapshot,uniqueId:'UI-10',uniqueRoll:{version:1,effectId:roll.effectId,stat:roll.stat,unit:'fraction',storedValue:roll.stored}};
}

export function inspectD10Binding(item){
  try{
  if(!plainRecord(item)||owns(item,'toJSON'))return Object.freeze({status:'invalid',reason:'invalid_item',storedValue:null,raw:null});
  if(!owns(item,'uniqueId'))return Object.freeze({status:'legacy',reason:'no_unique_id',storedValue:null,raw:null});
  const definition=lookupItemProposal({uniqueId:ownData(item,'uniqueId'),slot:ownData(item,'slot')});
  if(definition?.uniqueId!=='UI-10')return Object.freeze({status:'invalid',reason:'unknown_or_wrong_definition',storedValue:null,raw:null});
  if(!owns(item,'uniqueRoll'))return Object.freeze({status:'missing',reason:'missing_binding',storedValue:null,raw:null});
  const binding=ownData(item,'uniqueRoll'),roll=lookupRoll('UI-10');
  if(!plainRecord(binding)||owns(binding,'toJSON')||ownData(binding,'version')!==1||ownData(binding,'effectId')!==definition.effectId||ownData(binding,'stat')!==roll.stat||ownData(binding,'unit')!=='fraction')return Object.freeze({status:'invalid',reason:'schema_mismatch',storedValue:null,raw:null});
  const storedValue=ownData(binding,'storedValue');
  let raw;
  try{raw=fromStoredValue('UI-10',storedValue);}catch{return Object.freeze({status:'invalid',reason:'invalid_stored_value',storedValue:null,raw:null});}
  return Object.freeze({status:'valid',reason:null,storedValue,raw,uniqueId:definition.uniqueId,effectId:definition.effectId,version:1,runtimeReady:false});
  }catch{return Object.freeze({status:'invalid',reason:'invalid_data_properties',storedValue:null,raw:null});}
}

export function readStoredRoll(item,definition,roll){
  if(definition?.uniqueId!=='UI-10'||definition.effectId!=='U-D10'||roll?.uniqueId!=='UI-10'||roll.effectId!=='U-D10'||roll.stat!==lookupRoll('UI-10').stat)return null;
  const binding=inspectD10Binding(item);
  return binding.status==='valid'?binding.storedValue:null;
}

export function createBoundD10Consumer({enabled=false}={}){
  return createD10Consumer({enabled,readStoredRoll});
}
