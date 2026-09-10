import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync('game.html','utf8');
function render(search,cam=0){
  const paths=[],particles=[];let path;
  const ctx={beginPath(){path=[]},moveTo(...p){path.push(p)},lineTo(...p){path.push(p)},closePath(){},fill(){paths.push(path)},fillRect(...p){particles.push(p)}};
  const env={URLSearchParams,location:{search},window:{},C:{width:1280,height:720},G:{frame:0,stage:0,cam:{x:cam}},SI_TO_HELL:[0],
    ATMO_P:new Float32Array(192*8).fill(1),ATMO_L_ALPHA:[.16,.26,.37],ATMO_L_PARA:[.22,.48,.86],
    ATMO_CH:[{pc:'#c9a227',pd:.85,rc:'#ffd98a',ra:.30}],GOD_RAY:Array.from({length:5},(_,i)=>({x0:128+i*256,w:100,tilt:0,a:1,pulse:0})),ctx};
  vm.createContext(env);
  vm.runInContext(src.match(/var _ATMDBG=\{[^\n]+/)[0]+'\n'+src.slice(src.indexOf('function _atmoDraw(ctx){'),src.indexOf('// ═══ [PHASE3] 전경 실루엣 프리렌더'))+'\n_atmoDraw(ctx)',env);
  return {paths,particles,alpha:ctx.globalAlpha,blend:ctx.globalCompositeOperation};
}
test('ray=0 removes only the five screen-fixed ray paths',()=>{
  const on=render('?webgpu=0&ray=1'),off=render('?webgpu=0&ray=0');
  assert.equal(on.paths.length,5);assert.equal(off.paths.length,0);
  assert.deepEqual(off.particles,on.particles);assert.equal(off.particles.length,192);
  assert.equal(off.alpha,1);assert.equal(off.blend,'source-over');
});
test('default ray geometry is unchanged by camera movement',()=>{
  assert.deepEqual(render('').paths,render('?ray=1',500).paths);
  assert.equal(render('?ray=false').paths.length,5);
});
