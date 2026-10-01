function _preparePhysicalImpactSheet(){
  if(_preparePhysicalImpactSheet.pending)return _preparePhysicalImpactSheet.pending;
  const start=performance.now(),epoch=_bootLoadEpoch;
  const stats={attempts:0,reuses:0,status:'starting',syncMs:0,totalMs:0,pixelBytes:0,errors:[]};
  _preparePhysicalImpactSheet.stats=stats;
  const cancelled=()=>G.on||!_bootLoadActive||_bootLoadKilled||epoch!==_bootLoadEpoch;
  if(cancelled()){stats.status='outside-boot';return Promise.resolve(stats);}
  const deadline=start+250;
  const work=Promise.resolve().then(async()=>{
    try{
      if(cancelled()){stats.status='cancelled';return stats;}
      const image=_tvfx2Imgs['Fire_ImpactFire_Sheet.png'];
      if(!image){stats.status='missing';return stats;}
      const source=image.src,currentSource=image.currentSrc;
      const stale=()=>image!==_tvfx2Imgs['Fire_ImpactFire_Sheet.png']||image.src!==source||image.currentSrc!==currentSource;
      const ready=()=>image.complete&&image.naturalWidth===512&&image.naturalHeight===512;
      stats.attempts=1;
      if(!ready()){
        const state=await new Promise(resolve=>{
          let timer=null,done=false;
          const finish=status=>{
            if(done)return;done=true;
            if(timer!==null){try{clearTimeout(timer);}catch(error){stats.errors.push('clear:'+String(error.message||error));}timer=null;}
            for(const [type,handler] of [['load',onLoad],['error',onError]]){
              try{image.removeEventListener(type,handler);}catch(error){stats.errors.push('cleanup:'+String(error.message||error));}
            }
            resolve(status);
          };
          const inspect=()=>{
            try{
            if(cancelled())return finish('cancelled');
            if(stale())return finish('stale');
            if(performance.now()>=deadline)return finish('timeout');
            if(ready())return finish('ready');
            if(image.complete)return finish('load-failed');
            timer=setTimeout(inspect,Math.min(16,Math.max(0,deadline-performance.now())));
            }catch(error){stats.errors.push('inspect:'+String(error.message||error));finish('error');}
          };
          const onLoad=()=>{if(timer!==null){try{clearTimeout(timer);}catch(error){stats.errors.push('clear:'+String(error.message||error));}timer=null;}inspect();};
          const onError=()=>finish('load-failed');
          try{image.addEventListener('load',onLoad);image.addEventListener('error',onError);inspect();}
          catch(error){stats.errors.push('wait:'+String(error.message||error));finish('error');}
        });
        if(state!=='ready'){stats.status=state;return stats;}
      }
      if(cancelled()){stats.status='cancelled';return stats;}
      if(stale()){stats.status='stale';return stats;}
      if(performance.now()>=deadline){stats.status='timeout';return stats;}
      if(!ready()){stats.status='load-failed';return stats;}
      const cached=_physicalImpactSheet.cache&&_physicalImpactSheet.cache.get(image);
      if(cached){stats.reuses=1;stats.status='reused';stats.pixelBytes=512*512*4;return stats;}
      const syncStart=performance.now();
      let sheet;
      try{sheet=_physicalImpactSheet(image);}finally{stats.syncMs=performance.now()-syncStart;}
      if(sheet){stats.pixelBytes=512*512*4;stats.status=performance.now()>deadline?'prepared-over-budget':'prepared';}
      else stats.status='empty';
    }catch(error){stats.status='error';stats.errors.push(String(error.message||error));}
    finally{stats.totalMs=performance.now()-start;}
    return stats;
  });
  const pending=work.finally(()=>{if(_preparePhysicalImpactSheet.pending===pending)_preparePhysicalImpactSheet.pending=null;});
  _preparePhysicalImpactSheet.pending=pending;
  return pending;
}
