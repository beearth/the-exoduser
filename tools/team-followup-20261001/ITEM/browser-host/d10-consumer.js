import {lookupItemProposal} from "../../../../unique-item-project/definitions.js";
import {lookupRoll,fromStoredValue} from "../../../../unique-item-project/roll-values.js";

export function createD10Consumer({enabled=false,readStoredRoll}={}){
  const active=new WeakMap(),tokens=new WeakMap();
  return Object.freeze({
    begin(player,equipped,srcId){
      if(enabled!==true||!player||active.has(player)||!['giantSlam','giantSlam2'].includes(srcId||'giantSlam'))return null;
      const item=equipped?.armor,definition=lookupItemProposal(item);
      if(definition?.uniqueId!=='UI-10'||typeof readStoredRoll!=='function')return null;
      let stored;
      try{stored=readStoredRoll(item,definition,lookupRoll('UI-10'));fromStoredValue('UI-10',stored);}catch{return null;}
      const token=Object.freeze({});
      tokens.set(token,{player,equipped,item,stored,consumed:null,closed:false});active.set(player,token);
      return token;
    },
    consume(token,consumed){
      const state=token&&tokens.get(token);
      if(!state||state.closed||state.consumed!==null||!Number.isFinite(consumed)||consumed<100)return false;
      state.consumed=consumed;return true;
    },
    finish(token,success){
      const state=token&&tokens.get(token);
      if(!state||state.closed)return 0;
      state.closed=true;active.delete(state.player);
      if(success!==true||state.consumed===null||state.player.rage!==0||state.equipped.armor!==state.item)return 0;
      const refund=Math.min(30,state.consumed*state.stored);
      state.player.rage=refund;
      return refund;
    }
  });
}

export function candidateSlamSource(source){
  const anchor='function activateGiantSlam(srcId){';
  const consume='    P.rage=0;';
  if(!source.startsWith(anchor)||!source.endsWith('}')||source.split(consume).length!==2||source.includes('_d10Candidate'))throw Error('unexpected or already patched slam function');
  const body=source.slice(anchor.length,-1).replace(consume,consume+'\n    _d10Candidate.consume(_d10Cast,_rageP);');
  return anchor+'\n  const _d10Cast=_d10Candidate.begin(P,INV.equipped,srcId);\n  let _d10Succeeded=false;\n  try{'+body+'  _d10Succeeded=true;\n  }finally{_d10Candidate.finish(_d10Cast,_d10Succeeded);}\n}';
}
