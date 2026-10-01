(function(host){
  if(!host || typeof host.addEventListener !== 'function' || Object.hasOwn(host,'_itemReviewCspJournal'))return;
  const records=[],listeners=new Set();
  const startedUtc=new Date().toISOString();
  let phase='startup-before-host-module';
  const snapshot=()=>({schema:'item-review-csp-journal-v1',startedUtc,listenerPhase:'external-classic-after-policy-meta',
    limitation:'리스너 실행 전 주입/사건은 미관찰. sourceFile만으로 주입 주체를 확정하지 않음.',violations:records.slice()});
  const journal=Object.freeze({snapshot,setPhase(value){phase=String(value);},subscribe(listener){listeners.add(listener);listener(snapshot());return ()=>listeners.delete(listener);}});
  Object.defineProperty(host,'_itemReviewCspJournal',{value:journal,configurable:false,writable:false});
  host.addEventListener('securitypolicyviolation',event=>{
    const fields={};
    for(const key of ['documentURI','referrer','blockedURI','violatedDirective','effectiveDirective','originalPolicy','sourceFile','sample','disposition','statusCode','lineNumber','columnNumber','timeStamp','isTrusted'])fields[key]=event[key] ?? null;
    records.push(Object.freeze({sequence:records.length+1,observedUtc:new Date().toISOString(),phase,kind:'securitypolicyviolation',fields:Object.freeze(fields)}));
    for(const listener of listeners)listener(snapshot());
  });
})(typeof window !== 'undefined'?window:null);
