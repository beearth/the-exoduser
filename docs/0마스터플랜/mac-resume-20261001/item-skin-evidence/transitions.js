(async()=>{
 const settle=im=>new Promise((resolve,reject)=>{const start=performance.now();function check(){if(im.complete&&(im.naturalWidth||im.onerror===null)){setTimeout(resolve,10);return;}if(performance.now()-start>5000){reject(Error('image timeout'));return;}setTimeout(check,5);}check();});
 const rows=[];
 const belt={slot:'belt',el:0},key='img/ui/item-cutouts/belt_phys_cutout.png',im=_worldItemSkinCache.get(key);
 rows.push({case:'loaded-cutout',pass:_worldItemSkin(belt)===im,src:im.currentSrc});
 im.src=_itemSkinSrc('belt','phys');rows.push({case:'cutout-to-phys-pending',pass:_worldItemSkin(belt)===null});await settle(im);
 const canvas=_worldItemSkin(belt);rows.push({case:'cutout-to-phys-loaded',pass:canvas instanceof HTMLCanvasElement,src:im.currentSrc,mask:!!im._worldDropMasked});
 const reuse=Array.from({length:120},()=>_worldItemSkin(belt)===canvas).every(Boolean);rows.push({case:'phys-120-reuse',pass:reuse});
 im.src=key;const immediate=_worldItemSkin(belt);rows.push({case:'phys-to-cutout-immediate',complete:im.complete,width:im.naturalWidth,pass:im.complete&&im.naturalWidth?immediate===im:immediate===null});await settle(im);
 rows.push({case:'phys-to-cutout-loaded',pass:_worldItemSkin(belt)===im&&im._worldDropMasked===null,src:im.currentSrc});
 for(const [base,success] of [['gloves',true],['sword',false]]){
  const item={slot:base,el:2};const pending=_worldItemSkin(item)===null;const image=_worldItemSkinCache.get(`img/ui/item-cutouts/${base}_phys_cutout.png`);await settle(image);
  const result=_worldItemSkin(item);rows.push({case:success?'actual-cutout-failure-phys-success':'actual-both-failure',pass:pending&&(success?result instanceof HTMLCanvasElement:result===null),src:image.src,currentSrc:image.currentSrc,width:image.naturalWidth,oneShotError:image.onerror===null});
  rows.push({case:base+'-120-reuse-or-null',pass:Array.from({length:120},()=>_worldItemSkin(item)===result).every(Boolean)});
 }
 return {rows,allPass:rows.every(r=>r.pass),cacheEntries:_worldItemSkinCache.size};
})()
