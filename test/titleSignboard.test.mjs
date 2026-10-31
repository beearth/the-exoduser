import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const file=new URL('../title-signboard.js',import.meta.url),scope={};
if(fs.existsSync(file))vm.runInNewContext(fs.readFileSync(file,'utf8'),scope);
const api=scope.TitleSignboard||{};
test('approved A preserves moon, both feet and character at 16:9, 21:9 and 32:9 with uniform scale',()=>{
 assert.equal(typeof api.rect,'function');
 for(const [w,h] of [[1920,1080],[2560,1080],[3840,1080],[3840,2160]]){
  const r=api.rect(w,h);assert.equal(r.width/7680,r.height/2160);
  for(const [x,y] of [[3200,420],[4500,450],[4800,1870]]){const px=r.x+x*r.scale,py=r.y+y*r.scale;assert.ok(px>=0&&px<=w&&py>=0&&py<=h);}
  assert.ok(r.x<=0&&r.x+r.width>=w);
 }
});
test('reduced motion and hidden documents freeze scene time without a catch-up jump',()=>{
 assert.equal(typeof api.advance,'function');
 assert.equal(api.advance(8,1,true),8);assert.equal(api.advance(8,1,false),8.1);
 assert.equal(api.advance(8,0,false),8);
});
test('A uses its own still and layers; obsolete video overlay and crossfade are removed from runtime',()=>{
 const h=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(h,/title-signboard\.js/);assert.match(h,/TitleSignboard\.create/);
 assert.doesNotMatch(h,/splashTitleVideo|_titleVideoFade|_titleWideBackdrop|title_motion_20261028/);
 const build=fs.readFileSync(new URL('../build-nwjs.mjs',import.meta.url),'utf8');assert.match(build,/'title-signboard.js'/);
});
