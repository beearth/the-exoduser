import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function renderer(){
 const start=html.indexOf('function _drawAncestorSwordWave(');
 assert.ok(start>=0,'dedicated tapered sword-wave renderer exists');
 let depth=0;for(let i=html.indexOf('{',start);i<html.length;i++){
  if(html[i]==='{')depth++;
  if(html[i]==='}'&&!--depth)return Function(html.slice(start,i+1)+';return _drawAncestorSwordWave')();
 }
}
test('sword wave stays off during windup, recovery, emergence and recall',()=>{
 const draw=renderer();
 for(const a of [{_atkT:1},{_atkT:.7},{_atkT:0},{_atkT:.35,_recalling:true},{_atkT:.35,_emergeT:10}]){
  assert.equal(draw(null,a,1),false);
 }
});
test('strike draws tapered filled curves and a fine edge, not the old round arc',()=>{
 const draw=renderer(),calls=[];
 const ctx=new Proxy({}, {get:(_,key)=>key==='createLinearGradient'?()=>({addColorStop(){}}):(...args)=>calls.push([key,...args])});
 assert.equal(draw(ctx,{x:10,y:20,big:1,_atkT:.28,_atkDir:.5},1),true);
 assert.ok(calls.some(c=>c[0]==='lineTo'));
 assert.ok(calls.some(c=>c[0]==='fill'));
 assert.ok(!calls.some(c=>c[0]==='arc'));
 assert.ok(calls.some(c=>c[0]==='rotate'&&c[1]===.5));
 assert.equal(calls[0][0],'save');assert.equal(calls.at(-1)[0],'restore');
});
test('GPU context without bezierCurveTo can render the strike without crashing',()=>{
 const draw=renderer(),ctx={};
 for(const name of ['save','restore','translate','rotate','scale','beginPath','moveTo','lineTo','closePath','fill','stroke'])ctx[name]=()=>{};
 ctx.createLinearGradient=()=>({addColorStop(){}});
 assert.doesNotThrow(()=>draw(ctx,{x:0,y:0,big:1,_atkT:.28},1));
});
