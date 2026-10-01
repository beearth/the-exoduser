// Temporary local QA: observes existing calls; never requests images or masks itself.
(() => {
  window.__worldItemSkinQA?.stop('reinstall');
  const originalSkin=_worldItemSkin, originalMask=_maskWorldDropBlack;
  const proto=CanvasRenderingContext2D.prototype;
  const originals=Object.fromEntries(['drawImage','getImageData','putImageData'].map(k=>[k,proto[k]]));
  const ids=new WeakMap(), signatures=new Map();
  let sequence=0, active=null, mask=null;
  const id=o=>{if(!o)return null;if(!ids.has(o))ids.set(o,++sequence);return ids.get(o);};
  const snapshot=im=>im?{object:id(im),src:im.src,currentSrc:im.currentSrc,complete:im.complete,
    width:im.naturalWidth,height:im.naturalHeight,maskObject:id(im._worldDropMasked)}:null;
  const api=window.__worldItemSkinQA={startedAt:performance.now(),rows:[],calls:0,maskedCalls:0,dropped:0,
    environment:{url:location.href,timeOrigin:performance.timeOrigin,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio},
    stopped:false,reason:null,restored:null,stop(reason='manual'){
      if(this.stopped)return this;this.stopped=true;this.reason=reason;
      if(_worldItemSkin===wrappedSkin)_worldItemSkin=originalSkin;
      if(_maskWorldDropBlack===wrappedMask)_maskWorldDropBlack=originalMask;
      for(const k of Object.keys(originals))if(proto[k]===wrappers[k])proto[k]=originals[k];
      this.restored={skin:_worldItemSkin===originalSkin,mask:_maskWorldDropBlack===originalMask,
        ...Object.fromEntries(Object.keys(originals).map(k=>[k,proto[k]===originals[k]]))};return this;
    }};
  const wrappers={};
  for(const k of Object.keys(originals)){
    wrappers[k]=function(...args){
      if(!active)return originals[k].apply(this,args);
      const t=performance.now();try{return originals[k].apply(this,args);}
      finally{const end=performance.now();const row={kind:k,start:t,end,ms:end-t,canvas:id(this.canvas)};
        active.phases.push(row);
        if(mask&&k==='getImageData')mask.readEnd=end;
        if(mask&&k==='putImageData')mask.loopIntervalMs=t-(mask.readEnd??t);
      }
    };proto[k]=wrappers[k];
  }
  function wrappedMask(canvas){
    if(!active)return originalMask.apply(this,arguments);
    const previous=mask, record={start:performance.now(),canvas:id(canvas),width:canvas.width,height:canvas.height};
    mask=record;active.masks.push(record);api.maskedCalls++;
    try{return originalMask.apply(this,arguments);}
    finally{record.end=performance.now();record.ms=record.end-record.start;mask=previous;}
  }
  function wrappedSkin(it){
    if(!it)return originalSkin.apply(this,arguments);
    let base=it.wtype||it.btype||it.slot||'';
    if(it.slot==='bonePart')base='bone_'+(it.part||'skull');
    base=({ring1:'ring',ring2:'ring',headband:'earring',headband2:'earring'})[base]||base;
    const element=_ELKEY[it.el||0]||'phys',src=_itemSkinSrc(base,element);
    const cutout=_ITEM_CUTOUT_BASES.has(base)?'img/ui/item-cutouts/'+base+'_phys_cutout.png':'';
    const key=cutout||src, previous=active;
    const row={start:performance.now(),item:{id:it.id,name:it.name,slot:it.slot,wtype:it.wtype,btype:it.btype,el:it.el,rarity:it.rarity},
      base,element,key,before:snapshot(_worldItemSkinCache.get(key)),phases:[],masks:[]};
    let value;active=row;api.calls++;
    try{return value=originalSkin.apply(this,arguments);}
    finally{
      row.end=performance.now();row.ms=row.end-row.start;row.after=snapshot(_worldItemSkinCache.get(key));row.result=id(value);
      const im=_worldItemSkinCache.get(key);
      row.branch=!value?'pending-or-failed':value===im?'loaded-cutout':'masked-raw';
      row.missReason=!row.before?'image-cache-miss':row.masks.length?(!row.before.maskObject?'first-mask-or-load-invalidated':'replacement-mask'):'none';
      const signature=JSON.stringify([row.after,row.branch]);
      if(signatures.get(key)!==signature||row.masks.length||row.ms>=5){
        if(api.rows.length<300)api.rows.push(row);else api.dropped++;
        signatures.set(key,signature);
      }
      active=previous;
    }
  }
  _worldItemSkin=wrappedSkin;_maskWorldDropBlack=wrappedMask;
  return {installed:true,environment:api.environment};
})();
