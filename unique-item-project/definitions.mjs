const freeze=value=>{
  if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}
  return value;
};
const rows=[
  ['01','반향의 장막',['cape'],null,null,'_uParryOrbEcho'],
  ['02','독심의 봉환',['ring1','ring2'],null,null,'_uOrbPoisonBurst'],
  ['03','삼획의 맹세',['weapon'],'sword',null,'_uKiPrecharge'],
  ['04','빙편을 거두는 손',['gloves'],null,null,'_uIceShatterRefund'],
  ['05','귀환자의 잔보',['boots'],null,null,'_uGhostFuel'],
  ['06','되감긴 고리',['helmet'],null,null,'_uWarpStepRefund'],
  ['07','셋째 사슬의 고삐',['belt'],null,null,'_uChainCrowdRefund'],
  ['08','혈흔을 따르는 날',['weapon'],'dagger',null,'_uChainBleedEcho'],
  ['09','쌍극의 회로',['bracelet'],null,null,'_uDashCircuit'],
  ['10','꺼지지 않는 심갑',['armor'],null,null,'_uSlamEmberRage'],
  ['11','체간을 깨는 추',['weapon'],'hammer',null,'_uSkyPoiseRefund'],
  ['12','성역의 숨결',['shield'],null,null,'_uHolyParryCd'],
  ['13','번지는 뿌리의 띠',['belt'],null,null,'_uTrapOffshoot'],
  ['14','폭심의 씨앗',['necklace'],null,null,'_uVortexOrbPulse'],
  ['15','독을 기억하는 석궁',['bow'],null,'crossbow','_uBowPoisonRicochet'],
  ['16','철거자의 명령',['gloves'],null,null,'_uTurretSalvo'],
  ['17','무중력의 왕관',['helmet'],null,null,'_uBlackZoneGather'],
  ['18','흡성의 목걸이',['necklace'],null,null,'_uBlackholeManaReturn'],
  ['19','증기 단조의 손',['gloves'],null,null,'_uSteamBreak'],
  ['20','파열을 품은 견갑',['shield'],null,null,'_uShieldBreakBank'],
  ['21','돌아온 자의 흉갑',['armor'],null,null,'_uDemonRekindle'],
  ['22','균열을 보는 눈',['helmet'],null,null,'_uPoiseOrbFracture']
];
export const DEFINITION_SOURCE=freeze({
  mapping:'docs/7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#3',
  names:'docs/7아이템디자인/보라색_고유아이템_카탈로그_20260930.md',
  effects:'docs/7아이템디자인/유니크_어픽스_리스트.md#D'
});
export const EFFECT_PROPOSALS=freeze(rows.map(([number,,,,,stat])=>({effectId:`U-D${number}`,proposalStat:stat,documented:true,implemented:false})));
export const UNIQUE_DEFINITIONS=freeze(rows.map(([number,catalogName,slots,wtype,btype])=>({
  uniqueId:`UI-${number}`,effectId:`U-D${number}`,catalogName,slots,wtype,btype,
  status:'proposal',enabled:false,nameKey:null,translationStatus:'unregistered',
  art:{originalPath:`assets/unique-items/ui-${number}.png`,candidatePath:`assets/unique-items/ui-${number}-seedream-candidate.png`,runtimePath:null,accepted:false},
  effectStatus:'unimplemented'
})));
export function lookupDefinition(uniqueId){
  if(typeof uniqueId!=='string'||!uniqueId.length)return null;
  return UNIQUE_DEFINITIONS.find(definition=>definition.uniqueId===uniqueId)||null;
}
export function lookupItemProposal(item){
  if(!item||typeof item!=='object')return null;
  const definition=lookupDefinition(item.uniqueId);
  if(!definition||!definition.slots.includes(item.slot))return null;
  if(definition.wtype!==null&&item.wtype!==definition.wtype)return null;
  if(definition.btype!==null&&item.btype!==definition.btype)return null;
  return definition;
}
export function lookupActiveItemDefinition(item){
  const definition=lookupItemProposal(item);
  return definition?.enabled===true&&definition.status==='accepted'?definition:null;
}

export function validateDefinitions(definitions=UNIQUE_DEFINITIONS,{effects=EFFECT_PROPOSALS,artPaths=[],translationKeys=[]}={}){
  const issues=[],blockers=[];
  const issue=(code,uniqueId=null)=>issues.push({code,uniqueId});
  const block=(code,uniqueId)=>blockers.push({code,uniqueId});
  if(!Array.isArray(definitions))return {valid:false,canActivate:false,issues:[{code:'invalid_definitions',uniqueId:null}],blockers:[]};
  if(!Array.isArray(effects)||!Array.isArray(artPaths)||!Array.isArray(translationKeys))return {valid:false,canActivate:false,issues:[{code:'invalid_validation_context',uniqueId:null}],blockers:[]};
  const effectMap=new Map(),ids=new Set(),effectIds=new Set();
  for(const effect of effects){
    if(!effect||typeof effect.effectId!=='string'){issue('invalid_effect');continue;}
    if(effectMap.has(effect.effectId))issue('duplicate_effect_registry_id',effect.effectId);
    effectMap.set(effect.effectId,effect);
  }
  const availableArt=new Set(artPaths),registeredKeys=new Set(translationKeys);
  for(const definition of definitions){
    if(!definition||typeof definition!=='object'){issue('invalid_definition');continue;}
    const id=definition.uniqueId,expected=lookupDefinition(id);
    if(ids.has(id))issue('duplicate_unique_id',id);ids.add(id);
    if(effectIds.has(definition.effectId))issue('duplicate_effect_id',id);effectIds.add(definition.effectId);
    if(!expected){issue('unknown_unique_id',typeof id==='string'?id:null);continue;}
    if(definition.effectId!==expected.effectId)issue('effect_mapping_mismatch',id);
    const effect=effectMap.get(definition.effectId);
    if(!effect||effect.documented!==true)issue('missing_documented_effect',id);
    if(effect&&effect.proposalStat!==EFFECT_PROPOSALS.find(entry=>entry.effectId===expected.effectId)?.proposalStat)issue('effect_stat_mismatch',id);
    if(!Array.isArray(definition.slots)||definition.slots.length!==expected.slots.length||new Set(definition.slots).size!==definition.slots.length||!expected.slots.every(slot=>definition.slots.includes(slot))||definition.wtype!==expected.wtype||definition.btype!==expected.btype)issue('slot_type_mismatch',id);
    if(definition.catalogName!==expected.catalogName)issue('catalog_name_mismatch',id);
    if(definition.status!=='proposal'||definition.enabled!==false||definition.effectStatus!=='unimplemented'||definition.translationStatus!=='unregistered'||definition.nameKey!==null)issue('proposal_state_changed',id);
    if(!effect||effect.implemented!==true||definition.effectStatus!=='implemented')block('effect_unimplemented',id);
    if(definition.nameKey===null||!registeredKeys.has(definition.nameKey))block('translation_unregistered',id);
    const art=definition.art;
    if(!art||art.originalPath!==expected.art.originalPath||art.candidatePath!==expected.art.candidatePath||art.runtimePath!==null||art.accepted!==false)issue('art_proposal_state_changed',id);
    if(!art||!availableArt.has(art.originalPath)||!availableArt.has(art.candidatePath))block('missing_source_art',id);
    if(!art?.runtimePath||!availableArt.has(art.runtimePath))block('missing_runtime_art',id);
    if(art?.accepted!==true)block('art_unaccepted',id);
    block('proposal_not_activatable',id);
    if(definition.enabled!==false)issue('activation_forbidden',id);
  }
  for(const expected of UNIQUE_DEFINITIONS)if(!ids.has(expected.uniqueId))issue('missing_definition',expected.uniqueId);
  return {valid:issues.length===0,canActivate:false,issues,blockers};
}
