import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('../tools/qa/world-item-skin-observer.js',import.meta.url),'utf8');
function harness(fail=false){
  let t=0;
  class Context {constructor(){this.canvas={width:2,height:1}}drawImage(){}getImageData(){if(fail)throw Error('read');return {data:new Uint8Array(8)}}putImageData(){}}
  const ctx=new Context(),cache=new Map(),item={id:12,wtype:'hammer',el:0};
  const im={src:'http://test/hammer_phys.png',currentSrc:'http://test/hammer_phys.png',complete:true,naturalWidth:2,naturalHeight:1};
  const sandbox={window:{},performance:{now:()=>++t,timeOrigin:0},location:{href:'http://test'},innerWidth:100,innerHeight:100,devicePixelRatio:1,
    CanvasRenderingContext2D:Context,_ELKEY:['phys'],_ITEM_CUTOUT_BASES:new Set(),_itemSkinSrc:(b,e)=>`${b}_${e}.png`,_worldItemSkinCache:cache};
  sandbox._maskWorldDropBlack=c=>{ctx.getImageData();ctx.putImageData();return c;};
  sandbox._worldItemSkin=()=>{cache.set('hammer_phys.png',im);if(!im._worldDropMasked){ctx.drawImage();im._worldDropMasked=sandbox._maskWorldDropBlack(ctx.canvas);}return im._worldDropMasked;};
  const originals={skin:sandbox._worldItemSkin,mask:sandbox._maskWorldDropBlack,get:Context.prototype.getImageData};
  vm.runInNewContext(code,sandbox);
  return{sandbox,item,ctx,cache,im,originals,api:sandbox.window.__worldItemSkinQA};
}
test('observer records first processing source, phase split and cache reuse without extra processing',()=>{
 const h=harness(),s=h.sandbox;const first=s._worldItemSkin(h.item);
 for(let i=0;i<120;i++)assert.equal(s._worldItemSkin(h.item),first);
 assert.equal(h.api.calls,121);assert.equal(h.api.maskedCalls,1);assert.equal(h.api.rows.length,1);
 const r=h.api.rows[0];assert.equal(r.item.id,12);assert.equal(r.key,'hammer_phys.png');assert.equal(r.after.currentSrc,h.im.src);
 assert.equal(r.branch,'masked-raw');assert.equal(r.missReason,'image-cache-miss');assert.equal(r.masks.length,1);
 assert.deepEqual(Array.from(r.phases,p=>p.kind),['drawImage','getImageData','putImageData']);assert.ok(r.masks[0].loopIntervalMs>=0);
 h.api.stop();assert.equal(s._worldItemSkin,h.originals.skin);assert.equal(s._maskWorldDropBlack,h.originals.mask);
 assert.ok(Object.values(h.api.restored).every(Boolean));h.api.stop('twice');assert.equal(h.api.reason,'manual');
});
test('observer preserves exceptions and restores its context after failures',()=>{
 const h=harness(true);assert.throws(()=>h.sandbox._worldItemSkin(h.item),/read/);
 assert.equal(h.api.rows.length,1);assert.equal(h.api.rows[0].masks.length,1);
 assert.throws(()=>h.ctx.getImageData(),/read/);assert.equal(h.api.rows[0].phases.length,2);
 h.api.stop();assert.ok(Object.values(h.api.restored).every(Boolean));
});
test('observer stop does not overwrite a newer owner',()=>{
 const h=harness(),other=()=>null;h.sandbox._worldItemSkin=other;h.api.stop();assert.equal(h.sandbox._worldItemSkin,other);assert.equal(h.api.restored.skin,false);
});

test('stopped wrapper remains inert when another owner later restores it',()=>{
 const h=harness(),wrapped=h.sandbox._worldItemSkin;h.sandbox._worldItemSkin=(...args)=>wrapped(...args);
 h.api.stop();h.sandbox._worldItemSkin=wrapped;assert.ok(h.sandbox._worldItemSkin(h.item));
 assert.equal(h.api.calls,0);assert.equal(h.api.rows.length,0);
});
