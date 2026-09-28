import sharp from 'sharp';
import path from 'node:path';

// Retouches store already blended RGB and binary alpha, preserving approved pixels exactly.
export async function applyRetouchLayers(pixels,width,height,root,layers){
 for(const layer of layers){
  const {data,info}=await sharp(path.join(root,layer.file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(info.width!==layer.width||info.height!==layer.height||layer.x<0||layer.y<0||layer.x+info.width>width||layer.y+info.height>height)throw new Error('Retouch bounds: '+layer.id);
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
   const from=(y*info.width+x)*4,alpha=data[from+3];
   if(alpha!==0&&alpha!==255)throw new Error('Retouch must contain preblended pixels: '+layer.id);
   if(alpha===255){const to=((layer.y+y)*width+layer.x+x)*4;data.copy(pixels,to,from,from+4);}
  }
 }
 return pixels;
}
