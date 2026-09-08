import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function renderer(){
 const start=html.indexOf('function _drawAncestorRedAura(');assert.ok(start>=0,'red body aura exists');
 let n=0;for(let i=html.indexOf('{',start);i<html.length;i++){
  if(html[i]==='{')n++;if(html[i]==='}'&&!--n)return Function(html.slice(start,i+1)+';return _drawAncestorRedAura')();
 }
}
test('red aura follows body with GPU-safe paths, and intensifies on recall',()=>{
 const draw=renderer(),calls=[],ctx={};
 for(const name of ['save','restore','translate','scale','fillRect','beginPath','moveTo','lineTo','stroke'])ctx[name]=(...args)=>calls.push([name,...args]);
 ctx.createRadialGradient=()=>({addColorStop(){}});
 const a={x:20,y:40,hp:100,big:1.5};
 const normal=draw(ctx,a,1),charged=draw(ctx,{...a,_recalling:true,_swordT:1},1);
 assert.ok(charged>normal);assert.ok(calls.some(c=>c[0]==='translate'&&c[1]===20&&c[2]===124));
 assert.ok(calls.some(c=>c[0]==='lineTo'));assert.equal(calls.at(-1)[0],'restore');
 assert.equal(draw(null,{_dead:true},1),0);
});
