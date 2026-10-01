// Run only on the generated GPU fixture, never on a live game.
(async()=>{
  if(!document.title.includes('Warm image GPU verification'))throw Error('fixture only');
  let _texAdoptBitmapSaved;
  const ext=GL.getExtension('WEBGL_lose_context');if(!ext)throw Error('WEBGL_lose_context unavailable');
  const src='/assets/vfx/vfx_peace_shield.png?context-probe=1';
  const waitDecoded=async j=>{const t=performance.now();while(j.status==='pending'&&performance.now()-t<5000)await new Promise(r=>setTimeout(r,10));if(j.status!=='decoded')throw Error('decode '+j.status)};
  const oldMap=_texBySrc,j=_texPrewarmSrc(src,4608000);await waitDecoded(j);const bmp=j.bmp;
  const canvas=document.querySelector('canvas');
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('loss timeout')),5000);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();_useGL=false;_texBySrc=null;_texAdoptBitmapSaved=_texAdoptBitmap;_texAdoptBitmap=null;_texPreReset();clearTimeout(timeout);resolve()},{once:true});ext.loseContext()});
  const lost={job:j.status,closedWidth:bmp.width,queue:_texPreQ.length,busy:_texPreBusy};
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('restore timeout')),5000);canvas.addEventListener('webglcontextrestored',()=>{_texPreReset();_texBySrc=new Map();_texPreSeen.clear();_texPrePx=0;_useGL=true;_texAdoptBitmap=_texAdoptBitmapSaved;GL.pixelStorei(GL.UNPACK_COLORSPACE_CONVERSION_WEBGL,GL.NONE);clearTimeout(timeout);resolve()},{once:true});setTimeout(()=>ext.restoreContext(),100)});
  const restored=_texPrewarmSrc(src,4608000);await waitDecoded(restored);_texPreDrain();
  return {sourceSHA,lost,newContext:_texBySrc!==oldMap,newJob:restored!==j,restoredStatus:restored.status,queue:_texPreQ.length,busy:_texPreBusy,glError:GL.getError()};
})()
