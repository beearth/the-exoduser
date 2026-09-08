import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function draw(ens){
 const calls=[];const ctx=vm.createContext({ens,G:{},EL:{P:0},ELC:[],_gameFrame:0,_BEAN_RAINBOW:['rainbow'],_drawShootCharge:(...a)=>calls.push(a)});
 const a=html.indexOf('function _drawEnemyShotWarnings('),b=html.indexOf('function radialProjs(',a);
 vm.runInContext(html.slice(a,b),ctx);ctx._drawEnemyShotWarnings();return calls;
}
test('dedicated ghoul and slime bodies cannot skip idle or special attack rings',()=>{
 for(const body of ['_isGhoul','_isSlime','_ch1StartMedium']){
  const base={alive:true,x:100,y:100,r:20,[body]:true};
  assert.equal(draw([{...base,_projChargeT:30,_projChargeCol:'blue',_projChargeBean:'water'}]).length,1);
  assert.equal(draw([{...base,s:'eShootWind',st2:30,col:'purple'}]).length,1);
 }
});
test('stealth and distance do not fade required warnings',()=>{
 const result=draw([{alive:true,x:1000,y:1000,r:20,_cloaked:true,_spawnT:20,_projChargeT:30,_projChargeCol:'red',_projChargeBean:'red'}]);
 assert.equal(result.length,1);assert.equal(result[0][5],1);
});
test('dead enemies do not retain ordinary charge rings',()=>{
 assert.equal(draw([{alive:false,_projChargeT:30,_projChargeCol:'red'}]).length,0);
});
test('warning pass is independent and called once after all enemy bodies',()=>{
 const render=html.slice(html.indexOf('let _eRCnt=0;const _E_RMAX='),html.indexOf('// ═══ 적 투사체 3패스 렌더'));
 assert.equal((render.match(/_drawEnemyShotWarnings\(\)/g)||[]).length,1);
 assert.equal(render.includes('if(e._projChargeT>0&&e._projChargeCol)'),false);
 assert.equal(render.includes("if(e.s==='eShootWind'){const prog="),false);
});
