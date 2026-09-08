import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const expression=source.match(/const _nCy=([^;]+);/)[1];
const baseline=(height,lines,title=false)=>vm.runInNewContext(expression,{ch:height,_nLines:Array(lines).fill('line'),_nLh:height*.031*1.5,ln:{title}});
test('character story narration anchors its last line at 88 percent height',()=>{
 for(const height of [450,720,1080])for(const lines of [1,2,3]){
  const last=baseline(height,lines)+(lines-1)*height*.031*1.5;
  assert.ok(Math.abs(last-height*.88)<1e-8,`${height}px / ${lines} lines: ${last}`);
 }
});
test('title fallback remains vertically centered',()=>{
 assert.equal(baseline(720,1,true),360);
 assert.equal(baseline(720,3,true)+720*.031*1.5,360);
});
