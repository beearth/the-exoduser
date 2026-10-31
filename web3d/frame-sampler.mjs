// Three r160 uses immutable texture storage: a resized source needs a new GPU
// allocation, even when the HTMLCanvasElement identity remains unchanged.
export function createFrameSampler(createTexture){
 let texture,width=0,height=0;
 return {update(frame){
  if(!texture||width!==frame.width||height!==frame.height){texture?.dispose();texture=createTexture(frame);width=frame.width;height=frame.height;}
  texture.needsUpdate=true;return texture;
 }};
}
