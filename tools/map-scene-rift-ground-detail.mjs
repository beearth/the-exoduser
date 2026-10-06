/* Editor-only fine ground material. Source pixels, geometry, nav and saves stay untouched.
 * The caller invalidates after in-place nav edits. No timers, input or render scheduling.
 */
import {residentPaintingProfile} from './map-scene-rift-residents.mjs';
import {supportsRiftAmbience} from './map-scene-rift-ambience.mjs';

export const RIFT_GROUND_DETAIL=Object.freeze({
  src:'assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png',
  width:1024,height:1536,
  sha256:'a38117e63349bc486b038baab9ad266bd98f30c74306629ee0cb93df6eb7da84',
  crop:Object.freeze({x:320,y:1120,w:240,h:240}),worldSpan:160,alpha:.4
});
const GRID=200,TILE=40,WORLD=8000,MAX_OUTPUT_PIXELS=16777216;
const defaultCanvas=()=>document.createElement('canvas');
const finiteRange=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function descriptor(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.src!=='string'||
    !/^assets\/map\/hell_rift\/[A-Za-z0-9_./-]+\.png$/.test(value.src)||value.src.split('/').includes('..')||
    !/^[a-f0-9]{64}$/.test(value.sha256)||!Number.isInteger(value.width)||!Number.isInteger(value.height)||
    !finiteRange(value.width,1,8192)||!finiteRange(value.height,1,8192))return null;
  const c=value.crop;
  if(!c||!['x','y','w','h'].every(k=>Number.isInteger(c[k]))||c.x<0||c.y<0||c.w<1||c.w>1024||c.h!==c.w||
    c.x+c.w>value.width||c.y+c.h>value.height||!finiteRange(value.worldSpan,1,32000)||!finiteRange(value.alpha,0,.45))return null;
  return {src:value.src,width:value.width,height:value.height,sha256:value.sha256,crop:{x:c.x,y:c.y,w:c.w,h:c.h},worldSpan:value.worldSpan,alpha:value.alpha};
}
function supported(scene){
  try{return !!residentPaintingProfile(scene)&&supportsRiftAmbience(scene)&&scene.layers.find(l=>l.id==='abyss')?.visible===true;}
  catch(_){return false;}
}
function usableTarget(ctx){return !!ctx&&['save','restore','setTransform','getTransform','drawImage'].every(k=>typeof ctx[k]==='function');}

/** prepare loads once asynchronously; draw is synchronous and returns 1 only after compositing. */
export function createRiftGroundDetail({loadImage,onReady,makeCanvas=defaultCanvas,texture=RIFT_GROUND_DETAIL}={}){
  let spec;try{spec=descriptor(texture);}catch(_){spec=null;}
  let image=null,patternCanvas=null,loading=null,navRef=null,navScene=null,hardMask=null,softMask=null,output=null,outputPattern=null;
  let generation=0,enabled=false,admitted=false,reason='not-prepared',navCells=0,maskBuilds=0,draws=0,loadRequests=0,failures=0;
  function clearMask(){navRef=null;navScene=null;hardMask=null;softMask=null;navCells=0;}
  function invalidate(){generation++;enabled=false;admitted=false;reason='invalidated';clearMask();}
  function canvas(width,height){
    const c=makeCanvas();if(!c||typeof c.getContext!=='function')throw new Error('재질 canvas를 만들 수 없습니다');
    c.width=width;c.height=height;return c;
  }
  function context(c){const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('재질 context를 만들 수 없습니다');return ctx;}
  function sourceMatches(im){
    if(!im||im.naturalWidth!==spec.width||im.naturalHeight!==spec.height||im.complete===false)return false;
    const src=im.currentSrc||im.src;if(src===spec.src)return true;
    try{return typeof document!=='undefined'&&!!document.baseURI&&src===new URL(spec.src,document.baseURI).href;}catch(_){return false;}
  }
  function buildPattern(im){
    const c=spec.crop,surface=canvas(c.w*2,c.h*2),ctx=context(surface);
    ctx.save();try{
      ctx.imageSmoothingEnabled=false;
      for(const [x,y,flipX,flipY] of [[0,0,1,1],[c.w*2,0,-1,1],[0,c.h*2,1,-1],[c.w*2,c.h*2,-1,-1]]){
        ctx.save();try{ctx.translate(x,y);ctx.scale(flipX,flipY);ctx.drawImage(im,c.x,c.y,c.w,c.h,0,0,c.w,c.h);}finally{ctx.restore();}
      }
    }finally{ctx.restore();}
    return surface;
  }
  function rebuildMask(scene){
    clearMask();
    const nav=scene.walkable;if(!Array.isArray(nav)||nav.length!==GRID*GRID)throw new Error('보행 마스크가 없습니다');
    const hard=canvas(GRID,GRID),soft=canvas(GRID,GRID),hctx=context(hard),sctx=context(soft),h=hctx.createImageData(GRID,GRID),s=sctx.createImageData(GRID,GRID);
    let cells=0;
    for(let i=0;i<nav.length;i++){
      if(nav[i]!==0&&nav[i]!==1)throw new Error('보행 마스크 값이 잘못됐습니다');
      if(!nav[i])continue;cells++;const x=i%GRID,y=Math.floor(i/GRID),k=i*4;
      h.data[k]=h.data[k+1]=h.data[k+2]=255;h.data[k+3]=255;
      s.data[k]=s.data[k+1]=s.data[k+2]=255;
      // Fade inward one cell; the separate nearest-sampled hard mask forbids outward spill.
      s.data[k+3]=x===0||y===0||x===GRID-1||y===GRID-1||!nav[i-1]||!nav[i+1]||!nav[i-GRID]||!nav[i+GRID]?128:255;
    }
    hctx.putImageData(h,0,0);sctx.putImageData(s,0,0);
    navRef=nav;navScene=scene;hardMask=hard;softMask=soft;navCells=cells;maskBuilds++;
  }
  async function prepare(scene){
    const token=++generation;enabled=false;admitted=false;
    try{
      if(!spec||typeof loadImage!=='function'||typeof makeCanvas!=='function'){reason='invalid-texture-or-loader';clearMask();return false;}
      if(!supported(scene)){reason='unsupported-scene';clearMask();return false;}
      if(navRef!==scene.walkable||navScene!==scene||!hardMask)rebuildMask(scene);
      if(!image||!patternCanvas){
        if(!loading){loadRequests++;loading=Promise.resolve().then(()=>loadImage(spec.src));}
        let im;try{im=await loading;}finally{loading=null;}
        if(token!==generation)return false;
        if(!sourceMatches(im))throw new Error('재질 원본 경로 또는 크기가 다릅니다');
        image=im;patternCanvas=buildPattern(im);
      }
      if(token!==generation||!supported(scene)){reason='unsupported-scene';clearMask();return false;}
      admitted=true;reason='ready';
      if(typeof onReady==='function'){try{onReady();}catch(_){/* A caller notification cannot invalidate the material. */}}
      return true;
    }catch(_){if(token===generation){failures++;admitted=false;reason='prepare-failed';clearMask();}return false;}
  }
  function draw(ctx,scene,{enabled:on}={}){
    enabled=false;
    try{
      if(on!==true){reason='disabled';return 0;}
      if(!spec||!image||!patternCanvas){reason=loading?'loading':'not-prepared';return 0;}
      if(!supported(scene)){admitted=false;reason='unsupported-scene';clearMask();return 0;}
      if(!usableTarget(ctx)){reason='invalid-context';return 0;}
      const width=ctx.canvas?.width,height=ctx.canvas?.height,m=ctx.getTransform();
      if(!Number.isInteger(width)||!Number.isInteger(height)||!finiteRange(width,1,8192)||!finiteRange(height,1,8192)||width*height>MAX_OUTPUT_PIXELS||
        !m||m.is2D===false||!['a','b','c','d','e','f'].every(k=>Number.isFinite(m[k]))||!Number.isFinite(m.a*m.d-m.b*m.c)||m.a*m.d-m.b*m.c===0){reason='invalid-output';return 0;}
      if(navRef!==scene.walkable||navScene!==scene||!hardMask)rebuildMask(scene);
      if(!navCells){reason='empty-nav';return 0;}
      if(!output||output.width!==width||output.height!==height){output=canvas(width,height);outputPattern=null;}
      const out=context(output);
      if(!outputPattern){
        const pattern=out.createPattern(patternCanvas,'repeat');
        if(!pattern||typeof pattern.setTransform!=='function'){reason='pattern-unavailable';return 0;}
        const scale=spec.worldSpan/spec.crop.w;pattern.setTransform({a:scale,b:0,c:0,d:scale,e:0,f:0});outputPattern=pattern;
      }
      out.save();try{
        out.setTransform(1,0,0,1,0,0);out.clearRect(0,0,width,height);out.setTransform(m.a,m.b,m.c,m.d,m.e,m.f);
        out.globalCompositeOperation='source-over';out.globalAlpha=spec.alpha;out.fillStyle=outputPattern;out.fillRect(0,0,WORLD,WORLD);
        out.globalAlpha=1;out.globalCompositeOperation='destination-in';out.imageSmoothingEnabled=true;out.imageSmoothingQuality='high';
        out.drawImage(softMask,0,0,GRID,GRID,0,0,WORLD,WORLD);
        out.imageSmoothingEnabled=false;out.drawImage(hardMask,0,0,GRID,GRID,0,0,WORLD,WORLD);
      }finally{out.restore();}
      ctx.save();try{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='soft-light';ctx.drawImage(output,0,0);}finally{ctx.restore();}
      admitted=true;enabled=true;reason='ground-material-only';draws++;return 1;
    }catch(_){failures++;reason='draw-failed';return 0;}
  }
  function snapshot(){return {enabled,supported:admitted,ready:!!image&&!!patternCanvas,loading:!!loading,reason,navCells,maskBuilds,draws,loadRequests,failures,
    maskSize:hardMask?{width:GRID,height:GRID}:null,patternSize:patternCanvas?{width:patternCanvas.width,height:patternCanvas.height}:null,
    worldPeriod:spec?spec.worldSpan*2:null,alpha:spec?.alpha??null,composite:'soft-light',texture:spec?{...spec,crop:{...spec.crop}}:null,
    sourcePinVerification:'external-byte-pin/runtime-url-and-dimensions',scope:'ground-material-only;no-native-or-audio-acceptance'};}
  return Object.freeze({prepare,draw,invalidate,snapshot});
}
