// GPU X deliberately ignores filters, blend modes and canvas shadows. A native
// prop rasterised on Canvas2D must not gain those operations just by moving pass.
export function nativePropContext(ctx,gpuProxy){
 if(!gpuProxy)return ctx;
 return new Proxy(ctx,{
  get(target,key){const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;},
  set(target,key,value){if(['filter','globalCompositeOperation','shadowBlur','shadowColor'].includes(key))return true;Reflect.set(target,key,value,target);return true;}
 });
}
