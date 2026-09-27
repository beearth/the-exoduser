import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createCanvas} from 'canvas';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('hill skirt fades its exterior without changing opaque interior or ramp collision',()=>{
 for(const file of ['game.html','game-easy-test.html']){
 const s=read(file),m=s.match(/function _featherCh1HillSkirt\(out\)\{[\s\S]*?(?=function _buildCh1HillSmoothingTex)/);assert.ok(m,'smoothing hill needs a cached exterior feather');const ctx={};vm.runInNewContext(m[0]+';globalThis.feather=_featherCh1HillSkirt',ctx);
 const a=createCanvas(160,160),c=a.getContext('2d');c.fillStyle='rgb(90,60,40)';c.fillRect(10,10,140,140);ctx.feather(a);const alpha=x=>c.getImageData(x,80,1,1).data[3];assert.equal(alpha(0),0);assert.ok(alpha(11)<5);assert.ok(alpha(28)>alpha(11));assert.ok(alpha(28)<alpha(45));assert.equal(alpha(80),255);assert.deepEqual(Array.from(c.getImageData(80,80,1,1).data),[90,60,40,255]);assert.equal(c.getImageData(10,10,1,1).data[3],0);
 const build=s.slice(s.indexOf('function _buildCh1HillSmoothingTex'),s.indexOf('function _drawCh1Hill'));assert.ok(build.includes('_featherCh1HillSkirt(out)'));assert.ok(build.includes('_featherCh1HillSkirt(surface)'));assert.ok(build.includes('rampPath(sc)'));assert.ok(!m[0].includes('G.map'));assert.ok(!m[0].includes('MAP_OBJS'));
 }
});
