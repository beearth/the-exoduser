import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {parseExpressionAt} from 'acorn';
import {createCanvas} from 'canvas';

const ROOT=new URL('../../../',import.meta.url);
const BASE='http://127.0.0.1:3340/';
const absolute=src=>new URL(src,BASE).href;
const cutout='img/ui/item-cutouts/sword_phys_cutout.png';
const phys='output/imagegen/item-skins/sword_phys.png';
const sword={wtype:'sword',el:2};

function extract(source,name,isFunction=false){
  const anchor=isFunction?`function ${name}(`:`const ${name}=`;
  const start=source.indexOf(anchor);
  assert.notEqual(start,-1,`missing production anchor ${anchor}`);
  assert.equal(source.indexOf(anchor,start+anchor.length),-1,`ambiguous production anchor ${anchor}`);
  const expressionStart=isFunction?start:start+anchor.length;
  const node=parseExpressionAt(source,expressionStart,{ecmaVersion:'latest'});
  if(isFunction)assert.equal(node.type,'FunctionExpression');
  return isFunction?source.slice(start,node.end):`const ${name}=${source.slice(expressionStart,node.end)};`;
}

function harness(file){
  let source=fs.readFileSync(new URL(file,ROOT),'utf8');
  const skinSource=extract(source,'_worldItemSkin',true);
  source=source.replace(skinSource,diagnostic.candidateSource(skinSource));
  const images=[],requests=[];
  let masks=0,canvases=0,draws=0;
  // Browser-like absolute src plus an explicit pending state; no network is used.
  class ControlledImage{
    constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;this.onload=null;this.onerror=null;images.push(this);}
    set src(value){this._src=absolute(value);this.complete=false;this.naturalWidth=0;this.naturalHeight=0;requests.push(this._src);}
    get src(){return this._src;}
    get currentSrc(){return this.complete&&this.naturalWidth?this._src:'';}
    succeed(color=[180,100,60]){
      this.pixels=createCanvas(2,1);
      const ctx=this.pixels.getContext('2d'),data=ctx.createImageData(2,1);
      data.data.set([0,0,0,255,...color,255]);ctx.putImageData(data,0,0);
      this.complete=true;this.naturalWidth=2;this.naturalHeight=1;
      this.onload?.();
    }
    fail(){this.complete=true;this.naturalWidth=0;this.naturalHeight=0;this.onerror?.();}
  }
  const document={baseURI:BASE,createElement(tag){
    assert.equal(tag,'canvas');canvases++;
    const canvas=createCanvas(1,1),ctx=canvas.getContext('2d'),nativeDraw=ctx.drawImage.bind(ctx);
    ctx.drawImage=(img,...args)=>{draws++;nativeDraw(img instanceof ControlledImage?img.pixels:img,...args);};
    return canvas;
  }};
  const context=vm.createContext({Image:ControlledImage,document,URL,location:{href:BASE},countMask(){masks++;}});
  const constants=['_ELKEY','_ITEM_SKIN_MISSING_ELEMENTS','_ITEM_SKIN_MISSING_VARIANTS','_worldItemSkinCache'];
  if(source.includes('const _ITEM_CUTOUT_BASES='))constants.push('_ITEM_CUTOUT_BASES');
  const code=[...constants.map(name=>extract(source,name)),...['_itemSkinSrc','_maskWorldDropBlack','_worldItemSkin'].map(name=>extract(source,name,true))].join('\n');
  vm.runInContext(code+'\nconst realMask=_maskWorldDropBlack; _maskWorldDropBlack=(c)=>{countMask();return realMask(c);};',context,{filename:fileURLToPath(new URL(file,ROOT))});
  return{source,images,requests,skin:it=>context._worldItemSkin(it),counts:()=>({masks,canvases,draws})};
}

function assertMasked(value,color=[180,100,60]){
  assert.equal(typeof value?.getContext,'function','loaded raw fallback must become a masked canvas');
  const px=Array.from(value.getContext('2d').getImageData(0,0,2,1).data);
  assert.deepEqual(px,[0,0,0,0,...color,255],'black background becomes transparent; item color remains intact');
}


const diagnosticContext=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(new URL('tools/team-followup-20261001/ITEM/ring-png-candidate.js',ROOT),'utf8'),diagnosticContext);
const diagnostic=diagnosticContext.window.__ringPngDiagnostic;
const ring={slot:'ring1',el:0}, png=diagnostic.pngPath, rawRing='output/imagegen/item-skins/ring_phys.png';
test('diagnostic PNG success preserves image and all repeat calls without mask',()=>{const h=harness('game.html');assert.equal(h.skin(ring),null);assert.equal(h.requests[0],absolute(png));h.images[0].succeed();for(let i=0;i<120;i++)assert.equal(h.skin(ring),h.images[0]);assert.deepEqual(h.counts(),{masks:0,canvases:0,draws:0});h.images[0].onload();assert.equal(h.skin(ring),h.images[0]);assert.equal(h.counts().masks,0);});
test('diagnostic missing PNG waits for raw fallback then masks and caches',()=>{const h=harness('game.html');h.skin(ring);h.images[0].fail();assert.equal(h.requests[1],absolute(rawRing));for(let i=0;i<3;i++)assert.equal(h.skin(ring),null);h.images[0].succeed();const skin=h.skin(ring);assertMasked(skin);assert.equal(h.skin(ring),skin);assert.equal(h.counts().masks,1);});
test('diagnostic both failures stay null with only two requests',()=>{const h=harness('game.html');h.skin(ring);h.images[0].fail();h.images[0].fail();for(let i=0;i<5;i++)assert.equal(h.skin(ring),null);assert.equal(h.requests.length,2);assert.equal(h.counts().masks,0);});
test('diagnostic PNG to phys to PNG follows pending and loaded source',()=>{const h=harness('game.html');h.skin(ring);const im=h.images[0];im.succeed();assert.equal(h.skin(ring),im);im.src=rawRing;assert.equal(h.skin(ring),null);im.succeed();assertMasked(h.skin(ring));im.src=png;assert.equal(h.skin(ring),null);im.succeed();assert.equal(h.skin(ring),im);assert.equal(h.counts().masks,1);});
test('diagnostic fallback late load keeps original invalidation behavior',()=>{const h=harness('game.html');h.skin(ring);const im=h.images[0];im.fail();im.succeed();const first=h.skin(ring);im.onload();assert.notEqual(h.skin(ring),first);assert.equal(h.counts().masks,2);});
test('diagnostic only physical ring changes; elemental ring and existing cutout remain unchanged',()=>{for(const [item,path] of [[{slot:'ring2',el:3},'output/imagegen/item-skins/ring_dark.png'],[{slot:'ring1',el:2},'output/imagegen/item-skins/ring_ice.png'],[sword,cutout]]){const h=harness('game.html');h.skin(item);assert.equal(h.requests[0],absolute(path));}});
test('diagnostic transformation fails closed when production signature changes',()=>{assert.throws(()=>diagnostic.candidateSource('function other(){}'),/unexpected/);});

test('candidate null does not allocate or request',()=>{const h=harness('game.html');assert.equal(h.skin(null),null);assert.equal(h.images.length,0);assert.equal(h.requests.length,0);});
test('candidate ring slots share PNG cache and keep phys fallback entry',()=>{const h=harness('game.html');h.skin(ring);h.skin({slot:'ring2',el:0});assert.equal(h.images.length,1);h.images[0].succeed();assert.equal(h.skin(ring),h.skin({slot:'ring2',el:0}));});
test('candidate fallback repeated failure never requeues either URL',()=>{const h=harness('game.html');h.skin(ring);const image=h.images[0];image.fail();assert.equal(image.onerror,null);image.fail();for(let count=0;count<120;count++)assert.equal(h.skin(ring),null);assert.equal(h.requests.length,2);assert.equal(h.counts().masks,0);});
test('candidate raw replacement rebuilds cached mask with new pixels',()=>{const h=harness('game.html');h.skin(ring);const image=h.images[0];image.fail();image.succeed();const first=h.skin(ring);image.src=rawRing;assert.equal(h.skin(ring),null);image.succeed([90,150,210]);const second=h.skin(ring);assert.notEqual(second,first);assertMasked(second,[90,150,210]);assert.equal(h.skin(ring),second);assert.equal(h.counts().masks,2);});
