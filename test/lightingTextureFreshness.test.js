import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';
import {createCanvas, Canvas} from 'canvas';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const lighting=html.slice(html.indexOf('let _bloomCvs='),html.indexOf('// ═══ 동적 품질/텍스트 캐시 전역'));
function extract(marker){
  const start=html.indexOf(marker);assert.ok(start>=0,marker);
  const from=html.indexOf('function',start);
  const ast=parseExpressionAt(html,from,{ecmaVersion:'latest'});
  return html.slice(from,ast.end);
}
const gpuCache=extract('_getTex=function(src){');
const glCache=extract('_getTex=function(src,_nearestHint){');
const upload=extract('function _uploadCanvasTex(src){');
const pixels=c=>Buffer.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data);

// Run the production 2D lighting/bloom and GPU cache code. Only the device
// upload is replaced, with a byte-for-byte canvas snapshot as texture storage.
function runtime(backend){
  let allocated=0,copies=0,bound;
  const copy=(src,t)=>{t.pixels=pixels(src);copies++;};
  const s={
    C:createCanvas(640,360),document:{createElement:()=>createCanvas(1,1)},
    IS_MOBILE:false,OPT:{lighting:true,bloom:true,quality:'high'},
    G:{on:true,stage:0,cam:{x:0,y:0}},SI_TO_HELL:[0],
    HTMLCanvasElement:Canvas,ImageBitmap:class {},_glMaxTex:16384,
    _useGPU:backend==='WebGPU',_useGL:backend==='WebGL2',
    _tc:new WeakMap(),_texCache:new WeakMap(),_texUploaded:new WeakMap(),_texGCQueue:[],
    _curTex:{},whiteBG:{},GPUTextureUsage:{TEXTURE_BINDING:1,COPY_DST:2,RENDER_ATTACHMENT:4},
    mkBG:t=>t,_flush(){},
    GPU:{createTexture(){allocated++;return {};},queue:{copyExternalImageToTexture({source},{texture}){copy(source,texture);}}},
    GL:{createTexture(){allocated++;return {};},bindTexture(_target,t){bound=t;},texParameteri(){},texImage2D(...a){copy(a.at(-1),bound);}}
  };
  s._setTex=t=>{s._curTex=t;};
  s.X={save(){},restore(){},setTransform(){},drawImage(src){s._uploadCanvasTex(src);}};
  const ctx=vm.createContext(s);
  vm.runInContext(lighting,ctx);
  vm.runInContext('_getTex='+ (backend==='WebGPU'?gpuCache:glCache)+';_uploadCanvasTex='+upload+';',ctx);
  return {s,run:code=>vm.runInContext(code,ctx),stats:()=>({allocated,copies}),texture(src){s._uploadCanvasTex(src);return s._curTex;}};
}

for(const backend of ['WebGL2','WebGPU']){
  for(const layer of ['_lightCvs','_litColCvs']){
    test(`${backend}: ${layer} follows light movement and clears expired light without reallocating`,()=>{
      const r=runtime(backend);
      r.run('_pushLight(-100,0,100,.8,255,140,50,7);_renderLighting();');
      const src=r.s[layer],tex=r.texture(src),first=Buffer.from(tex.pixels);
      assert.ok(tex.pixels.equals(pixels(src)));
      r.run('_lightCnt=0;_pushLight(100,0,100,.8,255,140,50,7);_renderLighting();');
      assert.ok(!pixels(src).equals(first),'CPU light image must move');
      assert.equal(r.texture(src),tex,'reuse same-size GPU allocation');
      assert.ok(tex.pixels.equals(pixels(src)),'GPU must receive the moved light');
      r.run('_lightCnt=0;_renderLighting();');
      assert.equal(r.texture(src),tex);
      assert.ok(tex.pixels.equals(pixels(src)),'GPU must receive removal of expired light');
      if(layer==='_litColCvs')assert.ok(tex.pixels.every(v=>v===0),'no colored residue');
      const stable=r.stats();for(let i=0;i<6;i++)r.texture(src);
      assert.deepEqual(r.stats(),stable,'unchanged frames must not reupload');
      assert.equal(stable.allocated,1,'no per-refresh allocation');
    });
  }
  test(`${backend}: bloom replaces the previous bright frame and removes its glow`,()=>{
    const r=runtime(backend),cx=r.s.C.getContext('2d');
    cx.fillStyle='#ffbb22';cx.fillRect(40,40,120,100);r.run('_renderBloom();');
    const src=r.run('_bloomCvs'),tex=r.texture(src),first=Buffer.from(tex.pixels);
    cx.clearRect(0,0,640,360);r.run('_renderBloom();');
    assert.ok(!pixels(src).equals(first),'CPU bloom must discard the old bright object');
    assert.equal(r.texture(src),tex);
    assert.ok(tex.pixels.equals(pixels(src)),'GPU bloom must discard the old bright object');
    assert.equal(r.stats().allocated,1);
  });
}
