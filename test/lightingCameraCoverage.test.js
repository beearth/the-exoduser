import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';
import {createCanvas, Canvas} from 'canvas';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const lighting=html.slice(html.indexOf('let _bloomCvs='),html.indexOf('// ═══ 동적 품질/텍스트 캐시 전역'));
const lightPass=html.slice(html.indexOf('{const _l0=performance.now();'),html.indexOf('// ═══ 블룸 패스 (3프레임마다'));
const torchPass=html.slice(html.indexOf('if(OPT.torch&&OPT.postfx'),html.indexOf('// ═══ ATMOS 3-3 VIGNETTE'));
function extract(marker){const start=html.indexOf('function',html.indexOf(marker));return html.slice(start,parseExpressionAt(html,start,{ecmaVersion:'latest'}).end);}
const pixels=c=>Buffer.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data);

function runtime(){
  const C=createCanvas(640,360);
  const s={C,X:C.getContext('2d'),document:{createElement:()=>createCanvas(1,1)},
    IS_MOBILE:false,OPT:{lighting:true,torch:true,postfx:true,quality:'high'},
    G:{on:true,stage:0,cam:{x:0,y:0}},P:{x:0,y:0},SI_TO_HELL:[0],worldItems:[],
    _gameFrame:0,_useGPU:false,_useGL:false,_DEBUG_PERF:false,performance,
    _TORCH:{darkAlpha:.18},_torchR:80,_torchCache:null,_torchW:0,_torchH:0,
    _torchCamX:0,_torchCamY:0,_torchStamp:null,_torchStampR:0,_torchSmall:{}};
  const ctx=vm.createContext(s);
  vm.runInContext(lighting,ctx);
  vm.runInContext('_collectLights=function(){_lightCnt=0;};'+extract('function _mkTorchStamp(')+';'+extract('function _getTorchSmall('),ctx);
  return {s,ctx,run:code=>vm.runInContext(code,ctx),frame(layer,n,x=0,y=0){
    s._gameFrame=n;s.G.cam.x=x;s.G.cam.y=y;s.P.x=x;s.P.y=y;
    s.X.clearRect(0,0,C.width,C.height);
    vm.runInContext(layer==='light'?lightPass:torchPass,ctx);
    return pixels(C);
  }};
}

for(const layer of ['light','torch']){
  for(const [dx,dy] of [[180,70],[-180,-70],[.5,-.5]]){
    test(`${layer}: camera delta ${dx},${dy} must not expose a rectangular mask edge`,()=>{
      const r=runtime();const first=r.frame(layer,layer==='light'?0:2);
      const moved=r.frame(layer,layer==='light'?1:3,dx,dy);
      // The player follows the camera; a uniform ambient mask / player torch
      // must cover the same screen pixels, even between scheduled refreshes.
      assert.ok(moved.equals(first),'camera movement exposes or shifts the viewport mask');
    });
  }
  test(`${layer}: unchanged camera retains the three-frame refresh cadence`,()=>{
    const r=runtime(),start=layer==='light'?0:2;
    r.frame(layer,start);const src=layer==='light'?r.s._lightCvs:r.s._torchCache;
    const v=src._glVer;
    r.frame(layer,start+1);r.frame(layer,start+2);
    assert.equal(src._glVer,v,'stationary intermediate frames must reuse the cache');
    r.frame(layer,start+3);assert.equal(src._glVer,v+1,'scheduled refresh must publish new pixels');
  });
}

test('zero-opacity torch skips canvas allocation and compositing',()=>{
  const r=runtime();r.s._TORCH.darkAlpha=0;
  const output=r.frame('torch',2);
  assert.equal(r.s._torchCache,null,'invisible mask must not allocate or repaint a full-screen canvas');
  assert.ok(output.every(v=>v===0));
});

for(const backend of ['WebGL2','WebGPU']){
  test(`${backend}: redrawn torch pixels reach the GPU texture`,()=>{
    const r=runtime(),s=r.s;let bound,copies=0;
    const copy=(src,t)=>{t.pixels=pixels(src);copies++;};
    Object.assign(s,{HTMLCanvasElement:Canvas,ImageBitmap:class {},_glMaxTex:16384,
      _useGPU:backend==='WebGPU',_useGL:backend==='WebGL2',_tc:new WeakMap(),_texCache:new WeakMap(),
      _texUploaded:new WeakMap(),_texGCQueue:[],_curTex:{},whiteBG:{},
      GPUTextureUsage:{TEXTURE_BINDING:1,COPY_DST:2,RENDER_ATTACHMENT:4},mkBG:t=>t,_flush(){},
      GPU:{createTexture:()=>({}),queue:{copyExternalImageToTexture({source},{texture}){copy(source,texture);}}},
      GL:{createTexture:()=>({}),bindTexture(_target,t){bound=t;},texParameteri(){},texImage2D(...a){copy(a.at(-1),bound);}}});
    s._setTex=t=>{s._curTex=t;};
    r.run('_getTex='+extract(backend==='WebGPU'?'_getTex=function(src){':'_getTex=function(src,_nearestHint){')+';_uploadCanvasTex='+extract('function _uploadCanvasTex(src){'));
    r.frame('torch',2);s._uploadCanvasTex(s._torchCache);const texture=s._curTex,first=Buffer.from(texture.pixels);
    s._torchR=120;r.frame('torch',5);s._uploadCanvasTex(s._torchCache);
    assert.ok(!pixels(s._torchCache).equals(first),'CPU torch radius must change');
    assert.equal(s._curTex,texture,'same-size allocation must be reused');
    assert.ok(texture.pixels.equals(pixels(s._torchCache)),'GPU must receive the new torch mask');
    const stable=copies;s._uploadCanvasTex(s._torchCache);assert.equal(copies,stable);
  });
}
