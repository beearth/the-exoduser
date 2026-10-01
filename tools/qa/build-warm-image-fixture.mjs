import fs from 'node:fs';
import crypto from 'node:crypto';
const html=fs.readFileSync('game.html','utf8');
function block(start){let i=html.indexOf('{',start),d=0;for(;i<html.length;i++){if(html[i]==='{')d++;else if(html[i]==='}'&&!--d)return html.slice(start,i+1)}throw Error('block')}
const f=n=>block(html.indexOf('function '+n+'('));
const assignments=['_texAdoptBitmap','_getTex'].map(n=>block(html.indexOf(n==='\u005fgetTex'?'_getTex=function(src,_nearestHint)':n+'=function('))+';').join('\n');
const helpers=['_texPreClose','_texPreReset','_texPrePump','_texPrewarmSrc','_texPreDrain'].map(f).join('\n');
const fire=process.argv[2]==='fire';
const target=fire?'tmp/warm-fire-20261001/gpu-fixture.html':'tmp/warm-idle-20261001/gpu-fixture.html';
fs.mkdirSync(fire?'tmp/warm-fire-20261001':'tmp/warm-idle-20261001',{recursive:true});
const js=`
const sourceSHA=${JSON.stringify(crypto.createHash('sha256').update(html).digest('hex'))};
let GL=document.querySelector('canvas').getContext('webgl2',{alpha:true,antialias:false});
GL.pixelStorei(GL.UNPACK_COLORSPACE_CONVERSION_WEBGL,GL.NONE);
let _useGL=true,_texBySrc=new Map(),_texAdoptBitmap,_getTex,_curTex=null;
let _texCache=new WeakMap(),_texGCQueue=[],_glMaxTex=GL.getParameter(GL.MAX_TEXTURE_SIZE);
const _TEXHOT_MIN_PX=250000,_TEXHOT_INFLIGHT=2,_TEXHOT_QMAX=4,_TEXHOT_BUDGET_PX=64e6;
const _texPreQ=[],_texPreWait=[],_texPreSeen=new Set(),_texPreJobs=new Map();let _texPreBusy=0,_texPrePx=0;
function _texHotNote(){}
${assignments}
${helpers}
const paths=${JSON.stringify(fire?['/assets/vfx/fire_burst_radial.webp']:['/assets/vfx/vfx_magic_burst.png','/assets/vfx/boss/vfx_void_black.png','/assets/vfx/vfx_peace_shield.png'])};
const pause=()=>new Promise(r=>requestAnimationFrame(r));
function pixels(t,w,h){const f=GL.createFramebuffer();GL.bindFramebuffer(GL.FRAMEBUFFER,f);GL.framebufferTexture2D(GL.FRAMEBUFFER,GL.COLOR_ATTACHMENT0,GL.TEXTURE_2D,t,0);if(GL.checkFramebufferStatus(GL.FRAMEBUFFER)!==GL.FRAMEBUFFER_COMPLETE)throw Error('incomplete');const out=new Uint8Array(w*h*4);GL.readPixels(0,0,w,h,GL.RGBA,GL.UNSIGNED_BYTE,out);GL.bindFramebuffer(GL.FRAMEBUFFER,null);GL.deleteFramebuffer(f);return out}
async function run(){
 document.querySelector('button').disabled=true;
 const ext=GL.getExtension('WEBGL_debug_renderer_info');
 const result=window.fixtureResult={sourceSHA,started:Date.now(),renderer:ext?GL.getParameter(ext.UNMASKED_RENDERER_WEBGL):GL.getParameter(GL.RENDERER),rows:[],errors:[],jsHeapBefore:performance.memory?.usedJSHeapSize};
 try{for(const path of paths){
  _texBySrc=new Map();_texCache=new WeakMap();
  const img=new Image(),loadStart=performance.now();img.src=path;await new Promise((r,j)=>{img.onload=r;img.onerror=j});
  const row={path,w:img.naturalWidth,h:img.naturalHeight,loadMs:performance.now()-loadStart};
  let t=performance.now();const direct=_getTex(img);row.directUploadMs=performance.now()-t;const a=pixels(direct,row.w,row.h);GL.deleteTexture(direct);
  _texBySrc=new Map();_texCache=new WeakMap();
  t=performance.now();const job=_texPrewarmSrc(img.src,row.w*row.h);while(job.status==='pending'&&performance.now()-t<15000)await pause();row.decodeWallMs=performance.now()-t;
  t=performance.now();_texPreDrain();row.bitmapUploadMs=performance.now()-t;if(job.status!=='ready')throw Error(job.status);
  const prepared=_texBySrc.get(img.src).tex,b=pixels(prepared,row.w,row.h);let diff=0,max=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i]){diff++;max=Math.max(max,Math.abs(a[i]-b[i]))}
  row.comparedBytes=a.length;row.differentBytes=diff;row.maxDelta=max;
  t=performance.now();const adopted=_getTex(img);row.firstUseMs=performance.now()-t;row.sameTexture=adopted===prepared;
  GL.bindTexture(GL.TEXTURE_2D,prepared);row.filters=[GL.getTexParameter(GL.TEXTURE_2D,GL.TEXTURE_MIN_FILTER),GL.getTexParameter(GL.TEXTURE_2D,GL.TEXTURE_MAG_FILTER),GL.getTexParameter(GL.TEXTURE_2D,GL.TEXTURE_WRAP_S),GL.getTexParameter(GL.TEXTURE_2D,GL.TEXTURE_WRAP_T)];row.glError=GL.getError();GL.deleteTexture(prepared);result.rows.push(row);
 }
 result.pass=result.rows.length===paths.length&&result.rows.every(r=>r.differentBytes===0&&r.sameTexture&&r.glError===0);result.admittedPixels=_texPrePx;result.bitmapQueue=_texPreQ.length;result.busy=_texPreBusy;
 }catch(e){result.errors.push(String(e));result.pass=false}
 result.jsHeapAfter=performance.memory?.usedJSHeapSize;result.ended=Date.now();document.querySelector('pre').textContent=JSON.stringify(result,null,2);
}
document.querySelector('button').onclick=run;
`;
fs.writeFileSync(target,'<!doctype html><meta charset="utf-8"><title>Warm image GPU verification</title><style>body{background:#18202c;color:#eef;font:16px monospace;padding:30px}button{padding:16px}canvas{display:none}</style><h1>실제 GPU · 전체 RGBA 비교</h1><button>검사 실행</button><canvas width="1" height="1"></canvas><pre>대기</pre><script>'+js+'</script>');
console.log(target);
