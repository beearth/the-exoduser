function _physicalImpactSheet(img){
  const cache=_physicalImpactSheet.cache||(_physicalImpactSheet.cache=new WeakMap());
  let sheet=cache.get(img);
  if(!sheet){sheet=_tintHolyDome(img,255,255,255);cache.set(img,sheet)}
  return sheet;
}

function _tintHolyDome(img,r,g,b){const w=img.naturalWidth||img.width,h=img.naturalHeight||img.height,srcC=document.createElement('canvas'),outC=document.createElement('canvas');srcC.width=outC.width=w;srcC.height=outC.height=h;const sx=srcC.getContext('2d'),ox=outC.getContext('2d');sx.drawImage(img,0,0,w,h);const src=sx.getImageData(0,0,w,h).data,out=ox.createImageData(w,h).data;for(let i=0;i<src.length;i+=4){const light=Math.max(src[i],src[i+1],src[i+2]);out[i]=r;out[i+1]=g;out[i+2]=b;out[i+3]=Math.round(light*src[i+3]/255)}ox.putImageData(new ImageData(out,w,h),0,0);return outC}
