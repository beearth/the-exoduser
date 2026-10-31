// A sprite changes UVs, never the shared atlas pixels. Texture.clone() in r160
// marks Source dirty; that re-uploads the entire atlas for every moving actor.
export function textureView(base){
 const view=new base.constructor();
 view.source=base.source;
 for(const key of ['mapping','channel','wrapS','wrapT','wrapR','magFilter','minFilter','anisotropy','format','internalFormat','type','generateMipmaps','premultiplyAlpha','flipY','unpackAlignment','colorSpace'])
  if(key in base)view[key]=base[key];
 view.version=1;
 return view;
}
