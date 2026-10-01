(async()=>{
 const start=performance.now(),result={start,url:location.href,timeOrigin:performance.timeOrigin,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,options:JSON.parse(JSON.stringify(OPT)),bootActive:_bootLoadActive,useGL:_useGL,on:G.on,prep:window.__skinPrepareStats||null,beam:_worldDropFxWarmStats,items:[]};
 for(const base of ['dagger','repeater']){
  const item={wtype:base,el:0},key=_itemSkinSrc(base,'phys'),cachedBefore=_worldItemSkinCache.get(key),initialCanvas=cachedBefore?._worldDropMasked;
  const row={base,key,cachedBefore:!!cachedBefore,maskedBefore:!!initialCanvas,start:performance.now(),requestStart:performance.now()};
  const requestResult=_worldItemSkin(item);row.requestMs=performance.now()-row.requestStart;
  const im=_worldItemSkinCache.get(key);
  if(!cachedBefore){await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{done();reject(Error('load deadline'));},1500);function done(){clearTimeout(timer);im.removeEventListener('load',loaded);im.removeEventListener('error',failed);}function loaded(){row.loadAt=performance.now();done();resolve();}function failed(){done();reject(Error('image failed'));}im.addEventListener('load',loaded);im.addEventListener('error',failed);});}
  else if(!im.complete||!im.naturalWidth)throw Error('preparation left source pending');
  row.currentSrc=im.currentSrc;row.dimensions=[im.naturalWidth,im.naturalHeight];
  row.getStart=performance.now();const skin=_worldItemSkin(item);row.getMs=performance.now()-row.getStart;
  row.matchesPrepared=!!initialCanvas&&initialCanvas===skin;row.matchesRequest=requestResult===skin;
  row.drawStart=performance.now();X.save();try{X.drawImage(skin,100,100,34,34);if(_useGL&&typeof _flush==='function')_flush();}finally{X.restore();}
  row.drawSubmitMs=performance.now()-row.drawStart;row.readyDisplayMs=row.getMs+row.drawSubmitMs;
  row.reused120=Array.from({length:120},()=>_worldItemSkin(item)===skin).every(Boolean);row.totalWithLoadMs=performance.now()-row.start;
  row.maskStillSame=im._worldDropMasked===skin;result.items.push(row);await new Promise(r=>setTimeout(r,0));
 }
 result.end=performance.now();result.elapsedMs=result.end-start;result.skin=__worldItemSkinQA.stop('fixture-complete');
 result.resources=performance.getEntriesByType('resource').filter(r=>/dagger_phys|repeater_phys/.test(r.name)).map(r=>r.toJSON());
 return result;
})()
