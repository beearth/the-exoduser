import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
function view(overrides={}) {
  const helper=source.match(/function _ch1StartOuterCoversView\(\)\{[\s\S]*?\n\}/);
  assert.ok(helper,'opaque production coverage must gate hidden underlays');
  const chunks={},cache={};
  for(let y=0;y<8;y++)for(let x=0;x<8;x++) {
    chunks[x+','+y]='chunk';
    cache[x+','+y]={status:'ready',img:{complete:true,naturalWidth:1026,naturalHeight:1026}};
  }
  const env={G:{mw:200,mh:200,cam:{x:4000,y:4000},_camZoom:1,shake:0},T:40,VW:1280,VH:720,
    _EDITOR_MODE:false,_CH1_START_PHASE:'smoothing',_CH1_START_ROOT:'assets/map/ch1/production_finish',
    _CH1_LEGACY_UNDERLAY:false,_CH1_START_OUTER:{chunkSize:1024,bleed:1,chunks},
    _ch1StartOuterCache:cache,_ch1StartOuterEnabled:()=>true,...overrides};
  vm.runInNewContext(helper[0]+';result=_ch1StartOuterCoversView();',env);
  return env;
}
test('ready opaque production chunks replace the hidden terrain inside the map',()=>{
  assert.equal(view().result,true);
});
test('missing, decoding, failed and invalid chunks retain the old terrain',()=>{
  for(const status of ['loading','decoded','error','missing','bad-size']) {
    const ready=view(), cache=ready._ch1StartOuterCache;
    if(status==='missing')delete cache['3,3'];
    else if(status==='bad-size')cache['3,3'].img.naturalWidth=0;
    else cache['3,3'].status=status;
    assert.equal(view({_ch1StartOuterCache:cache}).result,false,status);
  }
});
test('boot fallback, other stages and the comparison switch keep legacy rendering',()=>{
  assert.equal(view({_ch1StartOuterEnabled:()=>false}).result,false);
  assert.equal(view({_CH1_LEGACY_UNDERLAY:true}).result,false);
});
test('alternate art roots and outer phase do not assume opaque coverage',()=>{
  assert.equal(view({_CH1_START_PHASE:'outer'}).result,false);
  assert.equal(view({_CH1_START_ROOT:'assets/map/ch1/rootworld_candidate'}).result,false);
});
test('map edges and camera shake retain the visible outside-map background',()=>{
  for(const cam of [{x:630,y:4000},{x:7370,y:4000},{x:4000,y:350},{x:4000,y:7650}])
    assert.equal(view({G:{mw:200,mh:200,cam,_camZoom:1,shake:0}}).result,false);
  assert.equal(view({G:{mw:200,mh:200,cam:{x:650,y:4000},_camZoom:1,shake:10}}).result,false);
});
test('zoomed views check distant chunks as the camera moves',()=>{
  const ready=view(),cache=ready._ch1StartOuterCache;
  delete cache['1,3'];
  assert.equal(view({_ch1StartOuterCache:cache}).result,true,'the missing chunk is initially offscreen');
  assert.equal(view({_ch1StartOuterCache:cache,G:{mw:200,mh:200,cam:{x:1800,y:4000},_camZoom:1,shake:0}}).result,false);
  assert.equal(view({_ch1StartOuterCache:cache,G:{mw:200,mh:200,cam:{x:4000,y:4000},_camZoom:.3,shake:0}}).result,false);
  assert.equal(view({_ch1StartOuterCache:cache,_EDITOR_MODE:true,G:{mw:200,mh:200,cam:{x:4000,y:4000},_edZoom:.3,shake:0}}).result,false);
});
