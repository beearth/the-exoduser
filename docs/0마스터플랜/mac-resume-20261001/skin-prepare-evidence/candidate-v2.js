// Experimental two-image preparation, not production. Existing image/mask functions unchanged.
async function __prepareTwoWorldSkins(){
 const start=performance.now(),epoch=_bootLoadEpoch,deadline=start+250;
 const stats=window.__skinPrepareStats={status:'preparing',start,deadline,budgetMs:250,targets:['dagger','repeater'],jobs:[],elapsedMs:0};
 const cleanup=[];
 const cancelled=()=>G.on||!_bootLoadActive||_bootLoadKilled||epoch!==_bootLoadEpoch;
 try{
  for(const base of stats.targets){
   if(cancelled()){stats.status='cancelled';break;}
   if(performance.now()>=deadline){stats.status='timeout';break;}
   const item={wtype:base,el:0},key=_itemSkinSrc(base,'phys'),old=_worldItemSkinCache.get(key);
   const job={base,key,start:performance.now(),loadEvent:false,cachedBefore:!!old,maskedBefore:!!old?._worldDropMasked,calls:[],ready:false};stats.jobs.push(job);
   if(old?._worldDropMasked){job.ready=true;job.reused=true;job.end=performance.now();continue;}
   const call=label=>{const t=performance.now();const result=_worldItemSkin(item);job.calls.push({label,start:t,ms:performance.now()-t,result:result?.tagName||null});return result;};
   // Registering events follows the synchronous first request. Native Image events dispatch later.
   call('request-and-possible-immediate-mask');
   const im=_worldItemSkinCache.get(key);job.src=im.src;
   let settled=!!old&&im.complete;
   const loaded=()=>{job.loadEvent=true;job.loadAt=performance.now();settled=true;};
   const failed=()=>{job.errorEvent=true;job.errorAt=performance.now();settled=true;};
   im.addEventListener('load',loaded);im.addEventListener('error',failed);
   cleanup.push(()=>{im.removeEventListener('load',loaded);im.removeEventListener('error',failed);});
   while(!settled&&!cancelled()&&performance.now()<deadline)await new Promise(r=>setTimeout(r,5));
   if(cancelled()){stats.status='cancelled';break;}
   if(performance.now()>=deadline){stats.status='timeout';break;}
   job.width=im.naturalWidth;job.height=im.naturalHeight;job.currentSrc=im.currentSrc;
   if(!im.complete||!im.naturalWidth||im.naturalWidth!==256||im.naturalHeight!==256){job.unavailable=true;job.end=performance.now();continue;}
   const result=call('post-load-final-mask');job.ready=!!result&&result===im._worldDropMasked;
   job.end=performance.now();
   // Each image wait already yields; no additional empty task between these two targets.
  }
  if(stats.status==='preparing')stats.status=stats.jobs.length===2&&stats.jobs.every(j=>j.ready)?'ready':'partial';
 }catch(e){stats.status='failed';stats.error=String(e);}
 finally{for(const fn of cleanup)fn();stats.elapsedMs=performance.now()-start;stats.listenerCleanup=true;}
 return stats;
}
