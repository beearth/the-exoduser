// Local development diagnostic only. Never loaded by the production game.
(() => {
  const pngPath='tmp/ring-png-20261001/ring_phys_masked.png';
  function candidateSource(source,path=pngPath){
    const needle="const cutoutSrc=_ITEM_CUTOUT_BASES.has(base)?'img/ui/item-cutouts/'+base+'_phys_cutout.png':'';";
    if(source.split(needle).length!==2)throw Error('unexpected skin function');
    return source.replace(needle,`const cutoutSrc=base==='ring'&&el==='phys'?${JSON.stringify(path)}:(_ITEM_CUTOUT_BASES.has(base)?'img/ui/item-cutouts/'+base+'_phys_cutout.png':'');`);
  }
  const load=img=>new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>finish(Error('image load deadline')),2000);
    const done=()=>finish(),fail=()=>finish(Error('image load failure'));
    function finish(error){clearTimeout(timer);img.removeEventListener('load',done);img.removeEventListener('error',fail);error?reject(error):resolve();}
    img.addEventListener('load',done);img.addEventListener('error',fail);
  });
  const api=window.__ringPngDiagnostic={candidateSource,pngPath,
    install(){this.candidate=(0,eval)('('+candidateSource(_worldItemSkin.toString())+')');return true;},
    async generate(){
      const started=performance.now(),img=new Image(),loaded=load(img);img.src=_itemSkinSrc('ring','phys');await loaded;
      const loadEnd=performance.now();await img.decode();const decodeEnd=performance.now();
      const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      canvas.getContext('2d').drawImage(img,0,0);const drawEnd=performance.now();_maskWorldDropBlack(canvas);const maskEnd=performance.now();
      const dataUrl=canvas.toDataURL('image/png'),end=performance.now();
      this.reference=canvas;
      return {source:img.currentSrc,width:canvas.width,height:canvas.height,dataUrl,
        totalMs:end-started,loadMs:loadEnd-started,decodeSettleMs:decodeEnd-loadEnd,drawMs:drawEnd-decodeEnd,maskMs:maskEnd-drawEnd,encodeMs:end-maskEnd};
    },
    async measure(order=['raw','png']){
      if(!this.candidate)this.install();const rows=[];
      for(const kind of order){
        const item={slot:'ring1',el:0},key=kind==='raw'?_itemSkinSrc('ring','phys'):pngPath,fn=kind==='raw'?_worldItemSkin:this.candidate;
        if(_worldItemSkinCache.has(key))throw Error('measurement requires an empty item entry');
        const r={kind,key,started:performance.now(),resourcesBefore:performance.getEntriesByName(new URL(key,location.href).href).length};
        const first=fn(item);r.requestEnd=performance.now();const img=_worldItemSkinCache.get(key);await load(img);r.loadEnd=performance.now();
        await img.decode();r.decodeEnd=performance.now();const skin=fn(item);r.getEnd=performance.now();
        if(!skin)throw Error('skin unavailable after load/decode');
        X.save();try{X.drawImage(skin,100,100,34,34);if(_useGL)_flush();}finally{X.restore();}r.submitEnd=performance.now();
        r.repeatedSame=Array.from({length:120},()=>fn(item)===skin).every(Boolean);r.repeatEnd=performance.now();
        r.src=img.src;r.currentSrc=img.currentSrc;r.dimensions=[img.naturalWidth,img.naturalHeight];r.firstImmediate=!!first;
        r.resultType=skin.tagName;r.requestMs=r.requestEnd-r.started;r.loadWaitMs=r.loadEnd-r.requestEnd;r.decodeSettleMs=r.decodeEnd-r.loadEnd;
        r.getMs=r.getEnd-r.decodeEnd;r.submitMs=r.submitEnd-r.getEnd;r.repeat120Ms=r.repeatEnd-r.submitEnd;r.firstDisplayMs=r.submitEnd-r.started;r.totalMs=r.repeatEnd-r.started;
        r.resources=performance.getEntriesByName(img.currentSrc).map(x=>x.toJSON());rows.push(r);
      }
      return {url:location.href,timeOrigin:performance.timeOrigin,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,on:G.on,bootActive:_bootLoadActive,options:JSON.parse(JSON.stringify(OPT)),beam:_worldDropFxWarmStats,skinPrep:_worldItemSkinWarmStats,rows};
    },
    async pixels(){
      if(!this.reference)throw Error('generate a reference first');
      const img=new Image(),loaded=load(img);img.src=pngPath;await loaded;await img.decode();
      const compare=size=>{
        const canvases=[this.reference,img].map(source=>{const c=document.createElement('canvas');c.width=c.height=size;c.getContext('2d').drawImage(source,0,0,size,size);return c;});
        const [a,b]=canvases.map(c=>c.getContext('2d').getImageData(0,0,size,size).data);let diff=0,alphaDiff=0,maxDelta=0;
        for(let i=0;i<a.length;i++)if(a[i]!==b[i]){diff++;if(i%4===3)alphaDiff++;maxDelta=Math.max(maxDelta,Math.abs(a[i]-b[i]));}
        return {size,bytes:a.length,diff,alphaDiff,maxDelta};
      };
      return [compare(256),compare(34)];
    }
  };
  return {installed:true,pngPath};
})();
