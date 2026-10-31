import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const text=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=text.slice(text.indexOf('// ═══ 로비 파티클 시스템'),text.indexOf('// ═══ 로비 파티클 시스템')+text.slice(text.indexOf('// ═══ 로비 파티클 시스템')).indexOf('})();')+5);
test('lobby ash and mist seed across the full current viewport including the right wing',()=>{
 const points=[];const canvas={width:300,height:150,style:{display:'flex'},parentElement:{offsetWidth:3840,offsetHeight:1080,parentElement:{style:{display:'flex'}}},getContext:()=>new Proxy({},{get:(_,k)=>k==='createRadialGradient'?(x,y)=>{points.push([x,y]);return {addColorStop(){}};}:()=>{}})};
 const math=Object.create(Math);math.random=()=>.95;
 const context={document:{getElementById:()=>canvas},innerWidth:3840,innerHeight:1080,Math:math,window:{addEventListener(){}},requestAnimationFrame(){},MutationObserver:class{constructor(fn){this.fn=fn;}observe(){this.fn();}disconnect(){}}};
 context.window.innerWidth=3840;context.window.innerHeight=1080;
 vm.runInNewContext(source.replace('requestAnimationFrame(loop);obs.disconnect()','loop(1000);obs.disconnect()'),context);
 assert.ok(points.length>0);assert.ok(points.every(([x])=>x>3000),'the right wing must receive original mist on the first visible frame');
});
