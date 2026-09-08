import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function renderer(img){
 const start=html.indexOf('function _drawAncestorSummonCircle(');assert.ok(start>=0,'summon circle renderer exists');
 let n=0;for(let i=html.indexOf('{',start);i<html.length;i++){
  if(html[i]==='{')n++;if(html[i]==='}'&&!--n)return Function('_ancSummonCircleImg',html.slice(start,i+1)+';return _drawAncestorSummonCircle')(img);
 }
}
test('circle only draws during emergence, behind the body, with black-neutral additive blending',()=>{
 const img={complete:true,naturalWidth:1600},draw=renderer(img),calls=[];
 const ctx={save(){},restore(){},drawImage(...args){calls.push(args)}};
 assert.equal(draw(ctx,{x:10,y:20,big:1,_emergeT:0}),false);
 assert.equal(draw(ctx,{x:10,y:20,big:1,_emergeT:48,_emergeMaxT:96}),true);
 assert.equal(ctx.globalCompositeOperation,'lighter');
 assert.equal(calls.length,1);assert.ok(calls[0][3]>calls[0][4]);
 assert.ok(html.indexOf('_drawAncestorSummonCircle(X,a);')<html.indexOf('const _planting=a._swordT>0;'));
 assert.ok(existsSync(new URL('../img/vfx_ancestor/ancestor_summon_circle.png',import.meta.url)));
});
