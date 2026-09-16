import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createCanvas} from 'canvas';
import {parseExpressionAt} from 'acorn';

for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const fn=name=>{const i=src.indexOf('function '+name+'(');assert.ok(i>=0,name);return src.slice(i,parseExpressionAt(src,i,{ecmaVersion:'latest'}).end);};
 test(file+': physical mouth preserves original sprite RGB without recoloring',()=>{
  const original=createCanvas(6144,1152),ctx=original.getContext('2d');
  ctx.fillStyle='#301008';ctx.fillRect(0,0,6144,384);
  const output=createCanvas(200,100),X=output.getContext('2d');
  const c=vm.createContext({X,Math,_physMouthReady:true,_physMouthImg:original,_gameFrame:0,_PHYS_MOUTH_N:[8,6,6],_PHYS_MOUTH_FW:768,_PHYS_MOUTH_FH:384});
  vm.runInContext(fn('_drawPhysMouth'),c);
  c._drawPhysMouth(100,50,80,0,1,0);
  assert.deepEqual([...X.getImageData(100,50,1,1).data],[48,16,8,255]);
  assert.equal(X.getImageData(0,0,1,1).data[3],0,'outside the sprite stays transparent');
  assert.equal(src.includes('_preparePhysicalMouthSheet'),false,'no unrequested recoloring at load time');
 });
}
