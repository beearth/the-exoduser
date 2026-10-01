// Real HTML functions + native canvas pixels; only asynchronous image loading is controlled.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {parseExpressionAt} from 'acorn';
import {createCanvas} from 'canvas';

const ROOT=new URL('../',import.meta.url);
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
  const source=fs.readFileSync(new URL(file,ROOT),'utf8');
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

test('main: successful cutout keeps original alpha and never masks or allocates a canvas',()=>{
  const h=harness('game.html');
  assert.equal(h.skin(sword),null);
  assert.deepEqual(h.requests,[absolute(cutout)]);
  h.images[0].succeed();
  assert.equal(h.skin(sword),h.images[0]);
  assert.equal(h.skin(sword),h.images[0]);
  assert.equal(h.images[0].pixels.getContext('2d').getImageData(0,0,1,1).data[3],255,'cutout black detail is preserved');
  assert.deepEqual(h.counts(),{masks:0,canvases:0,draws:0});
});

for(const file of ['game.html','game-easy-test.html']){
  test(`${file}: initial/fallback loading returns null; successful phys fallback masks once and reuses`,()=>{
    const h=harness(file);
    assert.equal(h.skin(sword),null);
    assert.equal(h.skin(sword),null);
    assert.equal(h.images.length,1);
    h.images[0].fail();
    assert.equal(h.requests.at(-1),absolute(phys));
    assert.equal(h.skin(sword),null,'fallback is still loading');
    assert.deepEqual(h.counts(),{masks:0,canvases:0,draws:0});
    h.images[0].succeed();
    const result=h.skin(sword);assertMasked(result);
    for(let i=0;i<4;i++)assert.equal(h.skin(sword),result);
    assert.deepEqual(h.counts(),{masks:1,canvases:1,draws:1});
    assert.equal(h.images.length,1,'fallback uses the existing Image');
  });

  test(`${file}: both primary and phys failure stay null without retry loops`,()=>{
    const h=harness(file);assert.equal(h.skin(sword),null);
    h.images[0].fail();assert.equal(h.skin(sword),null);
    h.images[0].fail();
    for(let i=0;i<4;i++)assert.equal(h.skin(sword),null);
    assert.equal(h.images.length,1);assert.equal(h.requests.length,2);
    assert.deepEqual(h.counts(),{masks:0,canvases:0,draws:0});
  });

  test(`${file}: same Image source transition is null while pending and onload invalidates old mask`,()=>{
    const h=harness(file),item={slot:'ring1',el:2};
    assert.equal(h.skin(item),null);h.images[0].succeed();
    const first=h.skin(item);assertMasked(first);
    const image=h.images[0];
    image.src='output/imagegen/item-skins/ring_phys.png';
    assert.equal(h.skin(item),null,'old cached pixels cannot escape during replacement loading');
    image.succeed([90,150,210]);
    const next=h.skin(item);assertMasked(next,[90,150,210]);
    assert.notEqual(next,first,'onload rebuilds from the current source');
    assert.equal(h.skin(item),next);
    assert.deepEqual(h.counts(),{masks:2,canvases:2,draws:2});
    assert.equal(h.images.length,1);
  });
}

test('main: same Image cutout → phys → cutout follows current loaded source, not item classification',()=>{
  const h=harness('game.html');h.skin(sword);
  const image=h.images[0];image.succeed();assert.equal(h.skin(sword),image);
  image.src=phys;assert.equal(h.skin(sword),null);image.succeed();
  const masked=h.skin(sword);assertMasked(masked);assert.equal(h.skin(sword),masked);
  image.src=cutout;assert.equal(h.skin(sword),null);image.succeed();
  assert.equal(h.skin(sword),image,'returning to loaded cutout must bypass an obsolete mask');
  assert.deepEqual(h.counts(),{masks:1,canvases:1,draws:1});
});

test('easy: successful element art still uses raw source and black masking, without cutout policy',()=>{
  const h=harness('game-easy-test.html');
  assert.equal(h.skin(null),null);assert.equal(h.images.length,0);
  assert.equal(h.skin(sword),null);
  assert.deepEqual(h.requests,[absolute('output/imagegen/item-skins/sword_ice.png')]);
  h.images[0].succeed();assertMasked(h.skin(sword));
  assert.deepEqual(h.counts(),{masks:1,canvases:1,draws:1});
  assert.doesNotMatch(extract(h.source,'_worldItemSkin',true),/_ITEM_CUTOUT_BASES|item-cutouts/);
});
