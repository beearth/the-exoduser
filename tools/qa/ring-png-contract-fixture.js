// Run only after timing has ended in the isolated local diagnostic page.
(async()=>{
  const api=__ringPngDiagnostic,item={slot:'ring1',el:0},raw=_itemSkinSrc('ring','phys');
  const oldMask=_maskWorldDropBlack,oldSrc=_itemSkinSrc;let masks=0;
  _maskWorldDropBlack=c=>{masks++;return oldMask(c);};
  const wait=im=>new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>finish(Error('fixture load deadline')),1800);
    function check(){if(im.complete&&(im.naturalWidth||im.onerror===null))finish();}
    function finish(error){clearTimeout(timer);im.removeEventListener('load',check);im.removeEventListener('error',check);error?reject(error):resolve();}
    im.addEventListener('load',check);im.addEventListener('error',check);
  });
  const make=path=>(0,eval)('('+api.candidateSource(_worldItemSkin.toString(),path)+')');
  const result={fixture:true,rows:[]};
  try{
    const fn=api.candidate,im=_worldItemSkinCache.get(api.pngPath);
    result.rows.push({kind:'png-ready',image:fn(item)===im,masks});
    let done=wait(im);im.src=raw;const pendingRaw=fn(item);await done;
    const canvas=fn(item);result.rows.push({kind:'png-to-raw',pendingNull:pendingRaw===null,canvas:canvas===im._worldDropMasked,reused:fn(item)===canvas,masks});
    done=wait(im);im.src=api.pngPath;const pendingPng=fn(item);await done;
    result.rows.push({kind:'raw-to-png',pendingNull:pendingPng===null,image:fn(item)===im,masks});
    const missing='tmp/ring-png-20261001/missing-primary.png',fallback=make(missing);
    result.rows.push({kind:'404-start',null:fallback(item)===null});const fi=_worldItemSkinCache.get(missing);await wait(fi);
    const fc=fallback(item);result.rows.push({kind:'404-fallback',actualSrc:fi.currentSrc,canvas:fc===fi._worldDropMasked,reused:fallback(item)===fc,masks});
    const missingBoth='tmp/ring-png-20261001/missing-both.png',both=make(missingBoth);
    _itemSkinSrc=(base,el)=>base==='ring'&&el==='phys'?'tmp/ring-png-20261001/missing-raw.png':oldSrc(base,el);
    const initial=both(item);const bi=_worldItemSkinCache.get(missingBoth);await wait(bi);
    result.rows.push({kind:'both-404',initialNull:initial===null,finalNull:both(item)===null,complete:bi.complete,width:bi.naturalWidth,retryHandler:bi.onerror,masks});
  }finally{_maskWorldDropBlack=oldMask;_itemSkinSrc=oldSrc;result.restored={mask:_maskWorldDropBlack===oldMask,src:_itemSkinSrc===oldSrc};}
  return result;
})()
