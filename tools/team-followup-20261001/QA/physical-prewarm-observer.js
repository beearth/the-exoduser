// Attach after light-normal-observer.js for one separate diagnostic run.
// Preserve the function's WeakMap property: its original body reads that global name.
(()=>{
  const api=window.__lightNormalQA,originalSheet=_physicalImpactSheet,originalTint=_tintHolyDome,originalStop=api.stop;
  const expected=_tvfx2Imgs['Fire_ImpactFire_Sheet.png'],expectedSheet=originalSheet.cache?.get(expected);
  const evidence=api.physicalImpact={bootStats:JSON.parse(JSON.stringify(_preparePhysicalImpactSheet.stats)),
    image:{src:expected?.src,currentSrc:expected?.currentSrc,width:expected?.naturalWidth,height:expected?.naturalHeight},
    cacheReady:!!expectedSheet,cacheSize:expectedSheet?[expectedSheet.width,expectedSheet.height]:null,
    calls:0,tintCalls:0,maxCallMs:0,samePreparedSheet:true,firstCall:null,restored:null};
  const sheet=function(image){
    const at=performance.now();let result;
    try{return result=originalSheet.apply(this,arguments);}
    finally{evidence.calls++;evidence.maxCallMs=Math.max(evidence.maxCallMs,performance.now()-at);
      evidence.samePreparedSheet=evidence.samePreparedSheet&&image===expected&&result===expectedSheet;
      if(evidence.firstCall===null)evidence.firstCall={at,src:image?.src,currentSrc:image?.currentSrc,width:image?.naturalWidth,height:image?.naturalHeight,kills:G.kills};}
  };
  sheet.cache=originalSheet.cache;
  const tint=function(image,r,g,b){if(image===expected&&r===255&&g===255&&b===255)evidence.tintCalls++;return originalTint.apply(this,arguments);};
  _physicalImpactSheet=sheet;_tintHolyDome=tint;
  api.environment.instrumentation+='; two pass-through physical sheet/tint wrappers, overhead unmeasured';
  api.stop=function(reason){
    const result=originalStop.call(this,reason);
    if(_physicalImpactSheet===sheet){originalSheet.cache=sheet.cache;_physicalImpactSheet=originalSheet;}
    if(_tintHolyDome===tint)_tintHolyDome=originalTint;
    evidence.restored={sheet:_physicalImpactSheet===originalSheet,tint:_tintHolyDome===originalTint};return result;
  };
  return evidence;
})();
