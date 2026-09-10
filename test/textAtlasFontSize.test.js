import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const start=html.indexOf('function _getAtlasTxt(font,text,color){');
const source=html.slice(start,html.indexOf('\n_txtEvict=',start));
function atlas(){
  const draws=[];let clears=0;
  const state={_txtUV:new Map(),_txtTick:0,_txtAtlasV:0,_txtAtlasX:0,_txtAtlasY:0,_txtAtlasRH:0,_txtUVSize:0,_txtAtlas:{},
    _txtAtlasCtx:{measureText:()=>({width:100}),clearRect(){clears++;},fillText(...args){draws.push(args);}}};
  vm.createContext(state);vm.runInContext(source,state);
  return {state,draws,clears:()=>clears,get:state._getAtlasTxt};
}
for(const [font,size] of [['900 22px "Noto Sans KR"',22],['700 18px sans-serif',18],['bold 32px monospace',32],['italic 600 20.5px/1.4 sans-serif',20.5],['16px sans-serif',16]]){
  test(`atlas allocates actual pixel size for ${font}`,()=>{
    const a=atlas(),uv=a.get(font,'Damage','#ffffff');
    assert.equal(uv.h,Math.ceil(size*1.6)+8);
    assert.ok(uv.v0>=0&&uv.v1<=1,'glyph must stay inside the atlas');
    assert.equal(a.clears(),0);
  });
}
test('combat text and HUD reuse their atlas across 120 frames',()=>{
  const a=atlas(),labels=[['900 22px sans-serif','-415'],['900 22px sans-serif','Q!'],['bold 12px monospace','Lv.501']];
  for(let frame=0;frame<120;frame++){
    a.state._txtTick=frame;
    for(const [font,text]of labels)for(const color of ['#000000','#ffffff'])a.get(font,text,color);
  }
  assert.equal(a.clears(),0,'numeric font-weight must not reset the whole atlas');
  assert.equal(a.draws.length,6,'only the six distinct labels need rasterization/upload versions');
  assert.equal(a.state._txtAtlasV,6);
});
