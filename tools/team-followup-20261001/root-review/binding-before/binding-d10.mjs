import {lookupItemProposal} from '../../../unique-item-project/definitions.js';
import {lookupRoll,rollValue,fromStoredValue} from '../../../unique-item-project/roll-values.js';
import {createD10Consumer} from './d10-consumer.mjs';

export const D10_BINDING_SCHEMA=Object.freeze({field:'uniqueRoll',version:1,uniqueId:'UI-10',effectId:'U-D10',unit:'fraction',status:'proposal',runtimeReady:false});
const owns=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);

export function createD10ProposalInstance({newItem,rng}={}){
  if(!newItem||typeof newItem!=='object'||Array.isArray(newItem)||newItem.slot!=='armor')throw new TypeError('새 armor 제안 인스턴스만 허용');
  if(owns(newItem,'uniqueId')||owns(newItem,'uniqueRoll')||owns(newItem,'_uSlamEmberRage')||newItem.unique===true||newItem.uniqueSpecial!=null)throw new TypeError('기존 unique/레거시 인스턴스 변환 금지');
  if(typeof rng!=='function')throw new TypeError('새 제안 생성 RNG 명시 필요');
  const snapshot=JSON.parse(JSON.stringify(newItem));
  if(snapshot.slot!=='armor')throw new TypeError('직렬화 가능한 새 armor 필요');
  const roll=rollValue('UI-10',rng);
  return {...snapshot,uniqueId:'UI-10',uniqueRoll:{version:1,effectId:roll.effectId,stat:roll.stat,unit:'fraction',storedValue:roll.stored}};
}

export function inspectD10Binding(item){
  if(!item||typeof item!=='object')return Object.freeze({status:'invalid',reason:'invalid_item',storedValue:null,raw:null});
  if(!owns(item,'uniqueId'))return Object.freeze({status:'legacy',reason:'no_unique_id',storedValue:null,raw:null});
  const definition=lookupItemProposal(item);
  if(definition?.uniqueId!=='UI-10')return Object.freeze({status:'invalid',reason:'unknown_or_wrong_definition',storedValue:null,raw:null});
  if(!owns(item,'uniqueRoll'))return Object.freeze({status:'missing',reason:'missing_binding',storedValue:null,raw:null});
  const binding=item.uniqueRoll,roll=lookupRoll('UI-10');
  if(!binding||typeof binding!=='object'||Array.isArray(binding)||binding.version!==1||binding.effectId!==definition.effectId||binding.stat!==roll.stat||binding.unit!=='fraction')return Object.freeze({status:'invalid',reason:'schema_mismatch',storedValue:null,raw:null});
  let raw;
  try{raw=fromStoredValue('UI-10',binding.storedValue);}catch{return Object.freeze({status:'invalid',reason:'invalid_stored_value',storedValue:null,raw:null});}
  return Object.freeze({status:'valid',reason:null,storedValue:binding.storedValue,raw,uniqueId:definition.uniqueId,effectId:definition.effectId,version:1,runtimeReady:false});
}

export function readStoredRoll(item,definition,roll){
  if(definition?.uniqueId!=='UI-10'||definition.effectId!=='U-D10'||roll?.uniqueId!=='UI-10'||roll.effectId!=='U-D10'||roll.stat!==lookupRoll('UI-10').stat)return null;
  const binding=inspectD10Binding(item);
  return binding.status==='valid'?binding.storedValue:null;
}

export function createBoundD10Consumer({enabled=false}={}){
  return createD10Consumer({enabled,readStoredRoll});
}
