import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function fn(name){const start=source.indexOf(`function ${name}(`);assert.ok(start>=0,`${name} exists`);let p=source.indexOf('{',start),depth=1,end=p+1;while(depth){const c=source[end++];if(c==='{')depth++;if(c==='}')depth--;}return source.slice(start,end);}
test('256 potion rewards remain immediate but HUD rebuild coalesces until next render',()=>{
 const callbacks=[];let renders=0;
 const ctx=vm.createContext({requestAnimationFrame:f=>callbacks.push(f),updateQS:()=>renders++});
 vm.runInContext('let _qsRefreshPending=false;'+fn('_requestQSRefresh'),ctx);
 for(let i=0;i<256;i++)vm.runInContext('_requestQSRefresh()',ctx);
 assert.equal(callbacks.length,1);assert.equal(renders,0);callbacks.shift()();assert.equal(renders,1);
 vm.runInContext('_requestQSRefresh()',ctx);assert.equal(callbacks.length,1);
 const add=fn('addPotion');assert.ok(add.includes('QSLOTS[i].count+=count'));assert.ok(!add.includes('updateQS()'));assert.ok(add.includes('_requestQSRefresh()'));
});
test('orb formation depends on simulation ticks, never draw count',()=>{
 const ctx=vm.createContext({});vm.runInContext(fn('_iceOrbFormationFrame'),ctx);
 for(const fps of [30,60,144,240]){let value;for(let i=0;i<=fps;i++)value=vm.runInContext(`_iceOrbFormationFrame(${i/fps*60})`,ctx);assert.equal(value,0);}
 assert.equal(vm.runInContext('_iceOrbFormationFrame(30)',ctx),4);
 assert.equal(vm.runInContext('_iceOrbFormationFrame(7.5)',ctx),7);
 const draw=source.slice(source.indexOf('// ══ ICE ORB —'),source.indexOf('// ══ 차징 검격',source.indexOf('// ══ ICE ORB —')));
 assert.ok(!draw.includes('P._ioFormT='));assert.ok(!draw.includes('poolPart('));assert.ok(draw.includes('_iceOrbFormationFrame(P._ioT||0)'));
});
test('shatter is a priority skill with simulation time and blended sprite frames',()=>{
 const shatter=fn('activateIceShatter');assert.match(shatter,/isSkill:true/);assert.match(shatter,/bornGameTime:_gameTime/);
 assert.ok(source.includes('(_gameTime-v.bornGameTime)/PHYS_STEP/v.frameTime'));
 assert.ok(source.includes('_drawTimedVfxFrame(v,sh,_vf1'));
});
test('mass kills reuse gore overlays while retaining bodies, head gibs and floor traces',()=>{
 const corpse=fn('_addCorpse');assert.ok(corpse.includes('_corpseGoreOverlays'));
 assert.ok(!corpse.includes('quadraticCurveTo'));assert.ok(!corpse.includes('.ellipse('));
 assert.ok(corpse.includes('_addFloorTrace(e)'));assert.ok(corpse.includes('_addHeadGib(e,a,power)'));
 assert.ok(source.includes('_buildCorpseGoreOverlay(i>=16)'));
});
