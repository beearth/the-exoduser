import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const start=html.indexOf('function _gpCrBagNav(){');
  const source=html.slice(start,html.indexOf('\n}',start)+2);
  function runtime(count,index){
    const events=[];
    const rows=Array.from({length:count},(_,i)=>({style:{},focus(){events.push(['focus',i]);},scrollIntoView(){events.push(['scroll',i]);},click(){events.push(['click',i]);}}));
    const list={querySelectorAll:()=>rows,scrollTop:0};
    const ctx=vm.createContext({$:()=>({style:{display:'flex'},querySelector:()=>list}),_gpCrIdx:index,_gpAxes:Array(8).fill(0),_gpUIPrev:{u:false,d:false,a:false},_gpad:{buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0,0,0]}});
    vm.runInContext(source,ctx);
    return {ctx,rows,events,tick:()=>vm.runInContext('_gpCrBagNav()',ctx)};
  }
  test(file+': shortened list remains selectable with A',()=>{
    const rt=runtime(6,17);rt.ctx._gpad.buttons[0].pressed=true;rt.tick();
    assert.equal(rt.ctx._gpCrIdx,5);assert.deepEqual(rt.events,[['click',5]]);
    assert.equal(rt.rows.filter(row=>row.style.outline).length,1);
  });
  test(file+': empty list accepts navigation without a phantom selection',()=>{
    const rt=runtime(0,17);rt.ctx._gpad.buttons[0].pressed=true;rt.ctx._gpad.buttons[13].pressed=true;rt.tick();
    assert.equal(rt.ctx._gpCrIdx,0);assert.deepEqual(rt.events,[]);
  });
  test(file+': D-pad moves focus and reveals the same row',()=>{
    const rt=runtime(4,1);rt.ctx._gpad.buttons[13].pressed=true;rt.tick();
    assert.equal(rt.ctx._gpCrIdx,2);assert.deepEqual(rt.events,[['focus',2],['scroll',2]]);
    rt.ctx._gpad.buttons[0].pressed=true;rt.tick();assert.deepEqual(rt.events.at(-1),['click',2]);
  });
}
