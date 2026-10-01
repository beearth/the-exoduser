export const originalGuard="const _fixWpnName=(it)=>{if(it&&it.slot==='weapon'&&it.wtype&&WTYPES[it.wtype]&&(it._nameMig||0)<1){";
export const candidateGuard="const _fixWpnName=(it)=>{if(it&&typeof it.uniqueId==='string'&&it.uniqueId.length>0)return;if(it&&it.slot==='weapon'&&it.wtype&&WTYPES[it.wtype]&&(it._nameMig||0)<1){";
export function candidateRestore(source){
  if(source.split(originalGuard).length!==2)throw Error('unexpected or already changed weapon-name migration');
  return source.replace(originalGuard,candidateGuard);
}
