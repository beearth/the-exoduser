/* Static editor material grade for the four registered resident atlas crops only.
 * No source pixels, world geometry, scene fields, navigation or storage are changed.
 */
import { residentPaintingProfile, RESIDENT_PREVIEW } from './map-scene-rift-residents.mjs';

export const RESIDENT_LIGHTING = Object.freeze({
  sourceSize: 1254, maxCache: 4, composite: 'source-atop',
  stops: Object.freeze([
    Object.freeze({ offset: 0, color: 'rgba(116,126,130,0.14)' }),
    Object.freeze({ offset: .55, color: 'rgba(116,126,130,0)' }),
    Object.freeze({ offset: 1, color: 'rgba(206,120,92,0.16)' })
  ])
});
const CROPS = Object.freeze([
  Object.freeze(['haran', 169, 27, 350, 578]),
  Object.freeze(['berin', 748, 257, 363, 352]),
  Object.freeze(['nessa', 197, 660, 262, 547]),
  Object.freeze(['dorik', 813, 742, 240, 465])
]);
const defaultCanvas = () => document.createElement('canvas');
const finiteRange = (v, lo, hi) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;

function registered(object, asset, crop) {
  const [key,x,y,w,h] = crop;
  return object?.id === 'obj-resident-'+key && object.assetId === 'resident-'+key &&
    asset?.id === object.assetId && asset.src === RESIDENT_PREVIEW.atlas &&
    asset.width === RESIDENT_LIGHTING.sourceSize && asset.height === RESIDENT_LIGHTING.sourceSize &&
    asset.crop?.x === x && asset.crop.y === y && asset.crop.w === w && asset.crop.h === h &&
    object.mask === undefined && object.maskFeather === undefined && object.sourceParallax === undefined &&
    object.rotation === 0 && object.flipX === false && object.opacity === 1 &&
    object.pivotX === .5 && object.pivotY === 1 &&
    finiteRange(object.x,0,7999.999999999999) && finiteRange(object.y,0,7999.999999999999) &&
    finiteRange(object.width,1,32000) && finiteRange(object.height,1,32000) &&
    Math.abs(object.width/object.height-w/h) <= 1e-6;
}

function loadedSource(image, src, absoluteSrc) {
  const value = image?.currentSrc || image?.src;
  if (typeof value !== 'string' || !value) return null;
  if (value === src) return value;
  // The absolute source is resolved in prepare, not allocated again on each cache hit.
  if (value === absoluteSrc) return value;
  return null;
}

/** prepare is called once per render; picture performs only the current target's narrow checks.
 * Successful and failed crop builds occupy at most four cache slots. Failures return null.
 * Stats count build attempts / successful reuse / failed builds until public clear() resets them.
 */
export function createResidentLighting(makeCanvas = defaultCanvas) {
  const cache = new Map();
  let scene = null, foot = null, targets = new Map(), admitted = false, absoluteSrc = null;
  let builds = 0, hits = 0, failed = 0;
  function release(id) {
    const entry=cache.get(id);cache.delete(id);
    if(entry?.canvas) { try { entry.canvas.width=0;entry.canvas.height=0; } catch (_) { /* Dropping the owned reference is still safe. */ } }
  }
  function releaseAll() { for(const id of cache.keys()) release(id); }
  function reset() { scene=null;foot=null;targets=new Map();admitted=false;absoluteSrc=null;releaseAll(); }
  function clear() { reset();builds=0;hits=0;failed=0; }
  function prepare(nextScene) {
    try {
      if (typeof makeCanvas !== 'function' || !Array.isArray(nextScene?.assets) || nextScene.assets.length > 128 ||
          !Array.isArray(nextScene.layers) || nextScene.layers.length > 24 || !residentPaintingProfile(nextScene)) { reset();return false; }
      const nextFoot = nextScene.layers.find(l=>l.id==='foot'), nextTargets = new Map();
      if (nextScene.layers.filter(l=>l.id==='foot').length !== 1) { reset();return false; }
      const counts = new Map();let total = 0;
      for (const layer of nextScene.layers) {
        if (!Array.isArray(layer.objects) || (total+=layer.objects.length)>2000) { reset();return false; }
        for (const o of layer.objects) if (typeof o?.id==='string' && CROPS.some(([key])=>o.id==='obj-resident-'+key)) counts.set(o.id,(counts.get(o.id)||0)+1);
      }
      for (const crop of CROPS) {
        const key=crop[0], a=nextScene.assets.find(a=>a.id==='resident-'+key), o=nextFoot.objects.find(o=>o.id==='obj-resident-'+key);
        if (counts.get('obj-resident-'+key)!==1 || nextScene.assets.filter(a=>a.id==='resident-'+key).length!==1 || !registered(o,a,crop)) { reset();return false; }
        nextTargets.set(o.id,{object:o,asset:a,crop});
      }
      if (scene!==nextScene) releaseAll();
      else for (const [id,entry] of cache) {
        const t=nextTargets.get(id);
        if (!t || entry.object!==t.object || entry.asset!==t.asset) release(id);
      }
      absoluteSrc=typeof document!=='undefined' && document.baseURI ? new URL(RESIDENT_PREVIEW.atlas,document.baseURI).href : null;
      scene=nextScene;foot=nextFoot;targets=nextTargets;admitted=true;return true;
    } catch (_) { reset();return false; }
  }
  function picture(object, asset, image) {
    const t=targets.get(object?.id);
    if (!admitted || !t || t.object!==object || t.asset!==asset || !foot?.visible || foot.sort!=='foot' || foot.parallax!==1 || !registered(object,asset,t.crop)) {
      if (t) release(object.id);return null;
    }
    const source=loadedSource(image,asset.src,absoluteSrc);
    if (!source || image?.naturalWidth!==RESIDENT_LIGHTING.sourceSize || image?.naturalHeight!==RESIDENT_LIGHTING.sourceSize || image.complete===false) { release(object.id);return null; }
    const old=cache.get(object.id);
    if (old && old.image===image && old.source===source && old.src===asset.src &&
        old.crop.x===asset.crop.x && old.crop.y===asset.crop.y && old.crop.w===asset.crop.w && old.crop.h===asset.crop.h) {
      cache.delete(object.id);cache.set(object.id,old);
      if (old.canvas) hits++;
      return old.canvas;
    }
    // Release an old GPU crop before replacing it, keeping allocation bounded at four.
    release(object.id);
    let canvas=null,candidate=null;builds++;
    try {
      candidate=makeCanvas();
      if (!candidate || typeof candidate.getContext!=='function' || [...cache.values()].some(v=>v.canvas===candidate)) throw new Error('독립 crop canvas가 필요합니다');
      candidate.width=asset.crop.w;candidate.height=asset.crop.h;
      const ctx=candidate.getContext('2d',{willReadFrequently:true});
      if (!ctx || !['save','restore','drawImage','createLinearGradient','fillRect'].every(k=>typeof ctx[k]==='function')) throw new Error('주민 환경광 canvas context 오류');
      ctx.save();
      try {
        ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
        ctx.drawImage(image,asset.crop.x,asset.crop.y,asset.crop.w,asset.crop.h,0,0,candidate.width,candidate.height);
        const gradient=ctx.createLinearGradient(0,0,0,candidate.height);
        for (const stop of RESIDENT_LIGHTING.stops) gradient.addColorStop(stop.offset,stop.color);
        ctx.globalCompositeOperation=RESIDENT_LIGHTING.composite;ctx.fillStyle=gradient;
        ctx.fillRect(0,0,candidate.width,candidate.height);
      } finally { ctx.restore(); }
      canvas=candidate;
    } catch (_) { failed++;if(candidate && ![...cache.values()].some(v=>v.canvas===candidate)){try{candidate.width=0;candidate.height=0;}catch(_){}} }
    cache.set(object.id,{object,asset,image,source,src:asset.src,crop:{...asset.crop},canvas});
    while(cache.size>RESIDENT_LIGHTING.maxCache) release(cache.keys().next().value);
    return canvas;
  }
  function snapshot() {
    return {enabled:admitted,profileAdmitted:admitted,eligible:targets.size,cacheSize:cache.size,builds,hits,failed,
      entries:[...cache.entries()].map(([objectId,e])=>({objectId,assetId:e.asset.id,src:e.src,crop:{...e.crop},ready:!!e.canvas}))};
  }
  return Object.freeze({prepare,picture,snapshot,clear});
}
