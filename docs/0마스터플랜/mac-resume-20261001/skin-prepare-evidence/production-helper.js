// QA-B01: only two measured phys sources, before renderer; all other skins stay lazy.
let _worldItemSkinWarmPromise=null,_worldItemSkinWarmStats=null;
function _prepareWorldItemSkins(){
  if(_worldItemSkinWarmPromise)return _worldItemSkinWarmPromise;
  if(G.on||!_bootLoadActive||_bootLoadKilled)return Promise.resolve(null);
  const epoch=_bootLoadEpoch,start=performance.now(),deadline=start+250;
  const stats={status:'preparing',requested:0,prepared:0,existing:0,unavailable:0,processingMs:0,maxCallMs:0,elapsedMs:0,pixelBytes:0};
  _worldItemSkinWarmStats=stats;
  _worldItemSkinWarmPromise=Promise.resolve().then(async()=>{
    const cleanup=[];
    const cancelled=()=>G.on||!_bootLoadActive||_bootLoadKilled||epoch!==_bootLoadEpoch;
    const call=item=>{const at=performance.now();try{return _worldItemSkin(item);}finally{const ms=performance.now()-at;stats.processingMs+=ms;stats.maxCallMs=Math.max(stats.maxCallMs,ms);}};
    try{
      for(const base of ['dagger','repeater']){
        if(cancelled()){stats.status='cancelled';break;}
        if(performance.now()>=deadline){stats.status='timeout';break;}
        const item={wtype:base,el:0},key=_itemSkinSrc(base,'phys');
        // Existing entries may still have a queued load that invalidates their mask.
        // Leave their lifecycle to the original lazy path; do not claim readiness.
        if(_worldItemSkinCache.has(key)){stats.existing++;continue;}
        stats.requested++;call(item);
        const img=_worldItemSkinCache.get(key),expectedSrc=img.src;
        await new Promise(resolve=>{
          let timer=null,settled=false;
          const finish=()=>{
            if(settled)return;settled=true;
            if(timer!==null)clearTimeout(timer);
            img.removeEventListener('load',finish);img.removeEventListener('error',finish);resolve();
          };
          cleanup.push(finish);
          // Native load dispatches after this synchronous request, even for cached pixels.
          img.addEventListener('load',finish);img.addEventListener('error',finish);
          timer=setTimeout(finish,Math.max(0,deadline-performance.now()));
        });
        if(cancelled()){stats.status='cancelled';break;}
        if(performance.now()>=deadline){stats.status='timeout';break;}
        if(!img.complete||img.naturalWidth!==256||img.naturalHeight!==256||img.src!==expectedSrc){stats.unavailable++;continue;}
        const canvas=call(item);
        if(canvas&&canvas===img._worldDropMasked){stats.prepared++;stats.pixelBytes+=canvas.width*canvas.height*4;}
        else stats.unavailable++;
      }
      if(stats.status==='preparing')stats.status=stats.prepared===2?'ready':stats.existing===2?'existing':'partial';
    }catch(_e){stats.status='failed';} // Optional work must not prevent boot or replace lazy fallback.
    finally{for(const finish of cleanup)finish();stats.elapsedMs=performance.now()-start;}
    return stats;
  }).finally(()=>{_worldItemSkinWarmPromise=null;});
  return _worldItemSkinWarmPromise;
}
